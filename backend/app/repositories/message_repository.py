from sqlalchemy.orm import Session

from app.models import Message


class MessageRepository:
    """
    Repository responsible for message database operations.
    """

    def __init__(self, db: Session):
        self.db = db

    def create(
        self,
        conversation_id: int,
        role: str,
        content: str,
    ) -> Message:
        """
        Save a chat message.
        """

        message = Message(
            conversation_id=conversation_id,
            role=role,
            content=content,
        )

        self.db.add(message)
        self.db.commit()
        self.db.refresh(message)

        return message

    def get_by_conversation(
        self,
        conversation_id: int,
    ) -> list[Message]:
        """
        Return all messages belonging to a conversation.
        """

        return (
            self.db.query(Message)
            .filter(
                Message.conversation_id == conversation_id
            )
            .order_by(Message.created_at.asc())
            .all()
        )

    def delete(
        self,
        message: Message,
    ) -> None:
        """
        Delete a message.
        """

        self.db.delete(message)
        self.db.commit()