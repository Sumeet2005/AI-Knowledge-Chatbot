from fastapi import APIRouter

from app.api.routes.upload import router as upload_router
from app.api.chat import router as chat_router
from app.api.history import router as history_router
from app.api.admin import router as admin_router
from app.api.settings import router as settings_router

router = APIRouter()

router.include_router(upload_router)
router.include_router(chat_router)
router.include_router(history_router)
router.include_router(admin_router)
router.include_router(settings_router)


@router.get(
    "/health",
    tags=["Health"],
)
def health_check():
    return {
        "status": "healthy",
        "application": "AI Knowledge Chatbot",
        "version": "1.0.0",
    }