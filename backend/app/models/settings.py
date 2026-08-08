from datetime import datetime

from sqlalchemy import Integer, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Settings(Base):
    """Application-wide settings stored as a single JSON blob."""

    __tablename__ = "settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    data: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)

    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
