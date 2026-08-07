from pydantic import BaseModel


class SourceResponse(BaseModel):
    """
    Represents a retrieved source document.
    """

    filename: str
    chunk_index: int