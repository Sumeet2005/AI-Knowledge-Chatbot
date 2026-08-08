from .logging_config import logger
from .settings import settings, chat_telemetry
import time
import contextvars
from sqlalchemy.orm import Session

# Process start timestamp (perf_counter for uptime measurement)
PROCESS_START = time.perf_counter()

def get_uptime_seconds():
    return time.perf_counter() - PROCESS_START

def record_stage(stage_name: str, duration: float):
    telemetry = chat_telemetry.get()
    if telemetry is not None:
        telemetry["stages"][stage_name] = duration

def get_db_settings(db: Session | None = None) -> dict:
    if db is not None:
        try:
            if hasattr(db, "info") and isinstance(db.info, dict) and "db_settings" in db.info:
                return db.info["db_settings"]
        except Exception:
            pass
            
    from app.api.settings import DEFAULTS
    close_db = False
    if db is None:
        try:
            from app.database.session import SessionLocal
            db = SessionLocal()
            close_db = True
        except Exception:
            db = None
            
    val = None
    if db is not None:
        from app.repositories.settings_repository import SettingsRepository
        try:
            repo = SettingsRepository(db)
            val = repo.get()
        except Exception:
            pass
            
        if not val:
            val = DEFAULTS
            
        try:
            if hasattr(db, "info") and isinstance(db.info, dict):
                db.info["db_settings"] = val
        except Exception:
            pass
            
        if close_db:
            db.close()
    else:
        val = DEFAULTS
        
    return val

status_callback_var = contextvars.ContextVar("status_callback_var", default=None)

def report_status(stage: str):
    cb = status_callback_var.get()
    if cb:
        try:
            cb(stage)
        except Exception:
            pass

__all__ = ["logger", "settings", "chat_telemetry", "record_stage", "get_db_settings", "status_callback_var", "report_status"]