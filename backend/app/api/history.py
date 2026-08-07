from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.schemas import (
    ConversationHistoryResponse,
    ConversationSummaryResponse,
)
from app.services.history import HistoryService

router = APIRouter(
    prefix="",
    tags=["History"],
)


@router.get(
    "/history",
    response_model=list[ConversationSummaryResponse],
    status_code=status.HTTP_200_OK,
    summary="List all conversations",
)
def get_history(
    db: Session = Depends(get_db),
) -> list[ConversationSummaryResponse]:
    """
    Return all conversations.
    """

    history_service = HistoryService(db)

    return history_service.get_all_conversations()


@router.get(
    "/history/{conversation_id}",
    response_model=ConversationHistoryResponse,
    status_code=status.HTTP_200_OK,
    summary="Get conversation history",
)
def get_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
) -> ConversationHistoryResponse:
    """
    Return one conversation.
    """

    history_service = HistoryService(db)

    conversation = history_service.get_conversation(
        conversation_id
    )

    if conversation is None:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found.",
        )

    return conversation