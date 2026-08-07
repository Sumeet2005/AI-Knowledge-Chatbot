from datetime import datetime

from pydantic import BaseModel


class MessageHistoryResponse(BaseModel):
    """
    Message response.
    """

    role: str

    content: str

    created_at: datetime

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