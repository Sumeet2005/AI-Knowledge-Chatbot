from typing import Optional
from pydantic import BaseModel


class SourceResponse(BaseModel):
    """
    Represents a retrieved source document.
    """

    filename: str
    chunk_index: int
    original_filename: Optional[str] = None
    content: Optional[str] = None
    vector_score: Optional[float] = None
    bm25_score: Optional[float] = None
    rerank_score: Optional[float] = None
    retrieved_by: Optional[str] = None