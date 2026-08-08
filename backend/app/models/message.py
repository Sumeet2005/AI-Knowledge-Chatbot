from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Message(Base):
    """
    Stores individual chat messages.
    """

    __tablename__ = "messages"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    conversation_id: Mapped[int] = mapped_column(
        ForeignKey("conversations.id"),
        nullable=False,
    )

    role: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )

    content: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    rag_debug: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    @property
    def rag_debug_dict(self) -> dict | None:
        import json
        if self.rag_debug:
            try:
                return json.loads(self.rag_debug)
            except Exception:
                return None
        return None

    conversation = relationship(
        "Conversation",
        back_populates="messages",
    )