from typing import Optional

from sqlalchemy.orm import Session

from app.models import Document


class DocumentRepository:
    """
    Repository responsible for document database operations.
    """

    def __init__(self, db: Session):
        self.db = db

    def create(self, document: Document) -> Document:
        """
        Save a new document.
        """
        self.db.add(document)
        self.db.commit()
        self.db.refresh(document)
        return document

    def get_by_id(self, document_id: int) -> Optional[Document]:
        """
        Find a document by its ID.
        """
        return (
            self.db.query(Document)
            .filter(Document.id == document_id)
            .first()
        )

    def get_by_filename(self, filename: str) -> Optional[Document]:
        """
        Find a document by its stored filename.
        """
        return (
            self.db.query(Document)
            .filter(Document.filename == filename)
            .first()
        )

    def get_by_original_filename(
        self,
        original_filename: str,
    ) -> Optional[Document]:
        """
        Find a document by its original filename.
        """
        return (
            self.db.query(Document)
            .filter(Document.original_filename == original_filename)
            .first()
        )

    def get_all(self) -> list[Document]:
        """
        Return all uploaded documents.
        """
        return (
            self.db.query(Document)
            .order_by(Document.uploaded_at.desc())
            .all()
        )

    def delete(self, document: Document) -> None:
        """
        Delete a document.
        """
        self.db.delete(document)
        self.db.commit()