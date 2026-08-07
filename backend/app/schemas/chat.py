from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.source import SourceResponse


class ChatRequest(BaseModel):
    """
    Chat request payload.
    """

    question: str = Field(
        ...,
        min_length=1,
        max_length=5000,
        description="User question",
    )

    conversation_id: Optional[int] = Field(
        default=None,
        description="Existing conversation ID. Leave null to start a new conversation.",
    )


class ChatResponse(BaseModel):
    """
    Chat response payload.
    """

    conversation_id: Optional[int] = Field(
        default=None,
        description="Conversation ID for continuing the chat.",
    )

    answer: str = Field(
        ...,
        description="AI generated answer.",
    )

    sources: list[SourceResponse] = Field(
        default_factory=list,
        description="Source chunks used to generate the answer.",
    )

    retrieved_chunks: int = Field(
        ...,
        description="Number of retrieved chunks.",
    )

    response_time_ms: float = Field(
        ...,
        description="Response time in milliseconds.",
    )