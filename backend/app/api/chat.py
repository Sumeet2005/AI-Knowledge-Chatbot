from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.schemas import ChatRequest, ChatResponse
from app.services.orchestrator import ConversationOrchestratorService

router = APIRouter(
    prefix="",
    tags=["Chat"],
)


@router.post(
    "/chat",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK,
    summary="Ask a question to the AI Knowledge Chatbot",
)
def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
) -> ChatResponse:
    """
    Ask a question to the RAG chatbot.
    """

    try:

        orchestrator = ConversationOrchestratorService(db)

        response = orchestrator.chat(
            question=request.question,
            conversation_id=request.conversation_id,
        )

        return response

    except Exception as exc:
        from app.config import logger
        logger.exception("Chat endpoint execution failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        )