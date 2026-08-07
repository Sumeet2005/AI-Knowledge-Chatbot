from pathlib import Path

from fastapi import HTTPException

from app.models import Document
from app.repositories import DocumentRepository


class DocumentService:
    """
    Handles document management.
    """

    def __init__(self, repository: DocumentRepository):
        self.repository = repository

    def list_documents(self) -> list[Document]:
        """
        Return all uploaded documents.
        """
        return self.repository.get_all()

    def delete_document(self, document_id: int) -> None:
        """
        Delete a document.
        """

        document = self.repository.get_by_id(document_id)

        if document is None:
            raise HTTPException(
                status_code=404,
                detail="Document not found.",
            )

        file_path = Path(document.file_path)

        if file_path.exists():
            file_path.unlink()

        self.repository.delete(document)