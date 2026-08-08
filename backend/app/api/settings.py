from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.repositories import SettingsRepository
from app.schemas import SettingsResponse, SettingsUpdateRequest

router = APIRouter(prefix="/settings", tags=["Settings"])


DEFAULTS = {
    "ai": {
        "provider": "Gemini",
        "temperature": 0.0,
        "max_tokens": 512,
        "top_p": 1.0,
        "streaming": False,
    },
    "rag": {
        "top_k": 10,
        "bm25_weight": 0.5,
        "vector_weight": 0.5,
        "similarity_threshold": 0.7,
        "cross_encoder": True,
        "max_chunks": 5,
    },
    "documents": {
        "chunk_size": 500,
        "chunk_overlap": 50,
        "auto_reindex": False,
    },
    "ui": {
        "theme": "system",
        "font_size": "medium",
        "compact_mode": False,
    },
    "telemetry": {
        "enable_telemetry": True,
        "debug_mode": False,
    },
}


@router.get("", response_model=SettingsResponse)
def get_settings(db: Session = Depends(get_db)):
    repo = SettingsRepository(db)
    settings = repo.get()
    if not settings:
        settings = DEFAULTS
    return {"settings": settings}


@router.put("", response_model=SettingsResponse)
def put_settings(payload: SettingsUpdateRequest, db: Session = Depends(get_db)):
    repo = SettingsRepository(db)
    try:
        data = payload.settings
        # Basic validation could be added here
        saved = repo.upsert(data)
        return {"settings": saved}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
