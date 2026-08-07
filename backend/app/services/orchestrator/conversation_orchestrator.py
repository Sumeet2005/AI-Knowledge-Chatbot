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

        self.conversation_service.save_user_message(
            conversation.id,
            question,
        )

        # ==========================================================
        # Execute Chat Pipeline
        # ==========================================================
        response = self.chat_service.chat(question)

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

        # ==========================================================
        # Save assistant response
        # ==========================================================
        self.conversation_service.save_assistant_message(
            conversation.id,
            response.answer,
        )

        response.conversation_id = conversation.id

        return response