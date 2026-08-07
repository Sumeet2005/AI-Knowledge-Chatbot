from pathlib import Path

from fastapi import HTTPException

from .docx_processor import DOCXProcessor
from .pdf_processor import PDFProcessor
from .txt_processor import TXTProcessor


class DocumentProcessor:
    """
    Selects the correct processor based on file type.
    """

    @staticmethod
    def extract_text(file_path: str) -> str:
        extension = Path(file_path).suffix.lower()

        if extension == ".pdf":
            return PDFProcessor.extract(file_path)

        if extension == ".docx":
            return DOCXProcessor.extract(file_path)

        if extension == ".txt":
            return TXTProcessor.extract(file_path)

        raise HTTPException(
            status_code=400,
            detail="Unsupported document type.",
        )