from sqlalchemy.orm import Session

from app.models import Settings


class SettingsRepository:
    def __init__(self, db: Session):
        self.db = db

    def get(self) -> dict:
        s = self.db.query(Settings).order_by(Settings.id.asc()).first()
        if not s:
            return {}
        return s.data or {}

    def upsert(self, data: dict) -> dict:
        s = self.db.query(Settings).order_by(Settings.id.asc()).first()
        if not s:
            s = Settings(data=data)
            self.db.add(s)
        else:
            s.data = data
        self.db.commit()
        self.db.refresh(s)
        return s.data
