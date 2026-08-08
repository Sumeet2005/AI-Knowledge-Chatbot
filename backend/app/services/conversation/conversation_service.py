from sqlalchemy.orm import Session

from app.models import Conversation
from app.models import Message
from app.repositories import (
    ConversationRepository,
    MessageRepository,
)


class ConversationService:
    """
    Handles conversation business logic.
    """

    def __init__(self, db: Session):
        self.db = db

        self.conversation_repository = ConversationRepository(db)
        self.message_repository = MessageRepository(db)

    def create_conversation(self) -> Conversation:
        """
        Create a new conversation.
        """

        return self.conversation_repository.create()

    def get_conversation(
        self,
        conversation_id: int,
    ) -> Conversation | None:
        """
        Return a conversation by ID.
        """

        return self.conversation_repository.get_by_id(
            conversation_id
        )

    def save_user_message(
        self,
        conversation_id: int,
        content: str,
    ) -> Message:
        """
        Save a user message.
        """

        return self.message_repository.create(
            conversation_id=conversation_id,
            role="user",
            content=content,
        )

    def save_assistant_message(
        self,
        conversation_id: int,
        content: str,
        rag_debug: str | None = None,
    ) -> Message:
        """
        Save an assistant message.
        """

        return self.message_repository.create(
            conversation_id=conversation_id,
            role="assistant",
            content=content,
            rag_debug=rag_debug,
        )

    def get_messages(
        self,
        conversation_id: int,
    ) -> list[Message]:
        """
        Return all messages for a conversation.
        """

        return self.message_repository.get_by_conversation(
            conversation_id
        )

    def get_all_conversations(
        self,
    ) -> list[Conversation]:
        """
        Return all conversations.
        """

        return self.conversation_repository.get_all()