from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.source import SourceResponse


class MessageHistoryResponse(BaseModel):
    """
    Message response.
    """

    role: str

    content: str

    created_at: datetime

    rag_debug: Optional[dict] = Field(default=None, validation_alias="rag_debug_dict")

    sources: Optional[list[SourceResponse]] = None

    model_config = {
        "from_attributes": True,
    }


class ConversationHistoryResponse(BaseModel):
    """
    Single conversation response.
    """

    id: int

    created_at: datetime

    messages: list[MessageHistoryResponse]

    model_config = {
        "from_attributes": True,
    }


class ConversationSummaryResponse(BaseModel):
    """
    Conversation list response.
    """

    id: int

    created_at: datetime

    message_count: int