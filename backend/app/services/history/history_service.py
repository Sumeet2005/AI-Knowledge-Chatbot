from sqlalchemy.orm import Session

from app.models import Conversation
from app.schemas import (
    ConversationHistoryResponse,
    ConversationSummaryResponse,
    MessageHistoryResponse,
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

        return ConversationHistoryResponse(
            id=conversation.id,
            created_at=conversation.created_at,
            messages=[
                MessageHistoryResponse(
                    role=message.role,
                    content=message.content,
                    created_at=message.created_at,
                )
                for message in messages
            ],
        )