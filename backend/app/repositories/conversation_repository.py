from typing import Optional

from sqlalchemy.orm import Session

from app.models import Conversation


class ConversationRepository:
    """
    Repository responsible for conversation database operations.
    """

    def __init__(self, db: Session):
        self.db = db

    def create(self) -> Conversation:
        """
        Create a new conversation.
        """
        conversation = Conversation()

        self.db.add(conversation)
        self.db.commit()
        self.db.refresh(conversation)

        return conversation

    def get_by_id(
        self,
        conversation_id: int,
    ) -> Optional[Conversation]:
        """
        Find a conversation by ID.
        """
        return (
            self.db.query(Conversation)
            .filter(Conversation.id == conversation_id)
            .first()
        )

    def get_all(self) -> list[Conversation]:
        """
        Return all conversations.
        """
        return (
            self.db.query(Conversation)
            .order_by(Conversation.created_at.desc())
            .all()
        )

    def delete(
        self,
        conversation: Conversation,
    ) -> None:
        """
        Delete a conversation.
        """
        self.db.delete(conversation)
        self.db.commit()