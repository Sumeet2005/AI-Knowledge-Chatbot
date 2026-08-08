from sqlalchemy.orm import Session

from app.models import Conversation
from app.schemas import (
    ConversationHistoryResponse,
    ConversationSummaryResponse,
    MessageHistoryResponse,
    SourceResponse,
)
from app.services.conversation import ConversationService


class HistoryService:
    """
    Handles conversation history retrieval.
    """

    def __init__(self, db: Session):
        self.conversation_service = ConversationService(db)

    def get_all_conversations(
        self,
    ) -> list[ConversationSummaryResponse]:
        """
        Return all conversations.
        """

        conversations = (
            self.conversation_service.get_all_conversations()
        )

        history = []

        for conversation in conversations:

            messages = self.conversation_service.get_messages(
                conversation.id
            )

            history.append(
                ConversationSummaryResponse(
                    id=conversation.id,
                    created_at=conversation.created_at,
                    message_count=len(messages),
                )
            )

        return history

    def get_conversation(
        self,
        conversation_id: int,
    ) -> ConversationHistoryResponse | None:
        """
        Return a single conversation.
        """

        conversation = (
            self.conversation_service.get_conversation(
                conversation_id
            )
        )

        if conversation is None:
            return None

        messages = self.conversation_service.get_messages(
            conversation_id
        )

        messages_response = []
        for message in messages:
            sources = []
            rag_debug = message.rag_debug_dict
            if rag_debug and "chunks" in rag_debug:
                for chunk in rag_debug["chunks"]:
                    if chunk.get("final_context"):
                        sources.append(
                            SourceResponse(
                                filename=chunk.get("filename", ""),
                                original_filename=chunk.get("original_filename"),
                                chunk_index=chunk.get("chunk_index", 0),
                                content=chunk.get("content"),
                                vector_score=chunk.get("vector_score"),
                                bm25_score=chunk.get("bm25_score"),
                                rerank_score=chunk.get("rerank_score"),
                                retrieved_by=chunk.get("retrieved_by"),
                            )
                        )
            messages_response.append(
                MessageHistoryResponse(
                    role=message.role,
                    content=message.content,
                    created_at=message.created_at,
                    rag_debug=rag_debug,
                    sources=sources if sources else None,
                )
            )

        return ConversationHistoryResponse(
            id=conversation.id,
            created_at=conversation.created_at,
            messages=messages_response,
        )