from datetime import datetime

from pydantic import BaseModel, ConfigDict


class DocumentResponse(BaseModel):
    """
    Response schema for uploaded documents.
    """

    id: int
    filename: str
    original_filename: str
    file_type: str
    file_size: int
    uploaded_at: datetime
    chunk_count: int = 0
    status: str = "PROCESSING"

    model_config = ConfigDict(from_attributes=True)