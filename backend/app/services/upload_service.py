import shutil
from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile

from app.config import settings
from app.models import Document
from app.repositories import DocumentRepository


class UploadService:
    """
    Handles document upload business logic.
    """

    ALLOWED_EXTENSIONS = {
        ".pdf",
        ".docx",
        ".txt",
    }

    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

    def __init__(self, repository: DocumentRepository):
        self.repository = repository

    def upload_document(self, file: UploadFile) -> Document:
        """
        Validate and upload a document.
        """

        extension = Path(file.filename).suffix.lower()

        if extension not in self.ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail="Unsupported file type.",
            )

        existing = self.repository.get_by_original_filename(file.filename)

        if existing:
            raise HTTPException(
                status_code=409,
                detail="Document already exists.",
            )

        file.file.seek(0, 2)
        file_size = file.file.tell()
        file.file.seek(0)

        if file_size > self.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail="File exceeds maximum size of 10 MB.",
            )

        unique_filename = f"{uuid4().hex}{extension}"

        upload_directory = Path(settings.UPLOAD_FOLDER)
        upload_directory.mkdir(
            parents=True,
            exist_ok=True,
        )

        file_path = upload_directory / unique_filename

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        document = Document(
            filename=unique_filename,
            original_filename=file.filename,
            file_type=extension.replace(".", ""),
            file_size=file_size,
            file_path=str(file_path),
        )

        return self.repository.create(document)