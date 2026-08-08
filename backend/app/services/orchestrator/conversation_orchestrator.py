from sqlalchemy.orm import Session

from app.schemas import ChatResponse
from app.services.chat import ChatService
from app.services.conversation import ConversationService


class ConversationOrchestratorService:
    """
    Coordinates conversation persistence and the RAG pipeline.
    """

    def __init__(self, db: Session):
        self.chat_service = ChatService(db)
        self.conversation_service = ConversationService(db)

    def chat(
        self,
        question: str,
        conversation_id: int | None = None,
    ) -> ChatResponse:
        """
        Execute the complete chat workflow.
        """

        import time
        from app.config import record_stage

        t_load_start = time.perf_counter()
        if conversation_id is None:
            conversation = (
                self.conversation_service.create_conversation()
            )
        else:
            conversation = (
                self.conversation_service.get_conversation(
                    conversation_id
                )
            )

            if conversation is None:
                conversation = (
                    self.conversation_service.create_conversation()
                )
        record_stage("load_conversation", (time.perf_counter() - t_load_start) * 1000.0)

        # 1. Fetch previous messages for query rewriting
        t_rewrite_start = time.perf_counter()
        previous_messages = self.conversation_service.get_messages(conversation.id)

        rewritten_question = question
        if previous_messages:
            # Format history (up to last 6 messages)
            history_lines = []
            for msg in previous_messages[-6:]:
                role = "User" if msg.role == "user" else "Assistant"
                history_lines.append(f"{role}: {msg.content}")
            history_str = "\n".join(history_lines)

            from app.ai.llm import GeminiService
            gemini = GeminiService()
            rewritten_question = gemini.rewrite_query(question, history_str)
            if rewritten_question != question:
                print(f"QUERY_REWRITE: Rewrote '{question}' -> '{rewritten_question}'", flush=True)

        record_stage("query_rewriting", (time.perf_counter() - t_rewrite_start) * 1000.0)

        t_save_user_start = time.perf_counter()
        self.conversation_service.save_user_message(
            conversation.id,
            question,
        )
        record_stage("save_user_message", (time.perf_counter() - t_save_user_start) * 1000.0)

        # ==========================================================
        # Execute Chat Pipeline
        # ==========================================================
        response = self.chat_service.chat(rewritten_question)

        t_save_assistant_start = time.perf_counter()
        import json
        rag_debug_json = json.dumps(response.rag_debug) if isinstance(response.rag_debug, dict) else None
        if rag_debug_json is not None:
            self.conversation_service.save_assistant_message(
                conversation.id,
                response.answer,
                rag_debug=rag_debug_json,
            )
        else:
            self.conversation_service.save_assistant_message(
                conversation.id,
                response.answer,
            )
        record_stage("save_assistant_message", (time.perf_counter() - t_save_assistant_start) * 1000.0)

        # ==========================================================
        # DEBUG OUTPUT
        # ==========================================================
        print("\n" + "=" * 80)
        print("FINAL RESPONSE FROM CHAT SERVICE")
        print("=" * 80)

        try:
            print(response.model_dump())
        except AttributeError:
            print(response.dict())

        print("=" * 80)
        print(f"Conversation ID : {conversation.id}")
        print(f"Question        : {question}")
        print(f"Answer Length   : {len(response.answer)}")
        print(f"Retrieved Chunks: {response.retrieved_chunks}")
        print(f"Sources Count   : {len(response.sources)}")

        if response.sources:
            print("\nRetrieved Sources:")
            for i, source in enumerate(response.sources, start=1):
                print(
                    f"{i}. "
                    f"{source.filename} "
                    f"(chunk {source.chunk_index})"
                )
        else:
            print("\nNo sources returned.")

        print("=" * 80 + "\n")

        response.conversation_id = conversation.id

        return response