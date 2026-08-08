from pydantic import BaseModel
from typing import Any, Dict, Optional


class SettingsResponse(BaseModel):
    settings: Dict[str, Any]


class SettingsUpdateRequest(BaseModel):
    settings: Dict[str, Any]
