from __future__ import annotations

from collections import Counter
from datetime import datetime
from typing import Any

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models import Document
from app.repositories import DocumentRepository


class MetadataService:
    """
    Serves metadata and corpus insights directly from the database.
    """

    def __init__(self, db: Session):
        self.db = db
        self.repository = DocumentRepository(db)

    def get_metadata(self) -> dict[str, Any]:
        """
        Build a metadata response payload from the database.
        """

        documents = self.repository.get_all()

        if not documents:
            return {
                "document_count": 0,
                "document_names": [],
                "uploaded_dates": [],
                "corpus_statistics": {
                    "total_chunks": 0,
                    "total_corpus_size": 0,
                    "largest_document": None,
                    "smallest_document": None,
                },
                "index_status": {
                    "indexed_documents": 0,
                    "pending_documents": 0,
                },
            }

        total_size = sum(document.file_size for document in documents)
        largest_document = max(documents, key=lambda item: item.file_size)
        smallest_document = min(documents, key=lambda item: item.file_size)

        uploaded_dates = [
            document.uploaded_at.strftime("%Y-%m-%d %H:%M:%S")
            for document in documents
        ]

        document_names = [document.original_filename for document in documents]

        chunk_count = self._count_chunks(documents)
        index_status = self._get_index_status(documents)

        return {
            "document_count": len(documents),
            "document_names": document_names,
            "uploaded_dates": uploaded_dates,
            "corpus_statistics": {
                "total_chunks": chunk_count,
                "total_corpus_size": total_size,
                "largest_document": {
                    "filename": largest_document.original_filename,
                    "size_bytes": largest_document.file_size,
                },
                "smallest_document": {
                    "filename": smallest_document.original_filename,
                    "size_bytes": smallest_document.file_size,
                },
            },
            "index_status": index_status,
        }

    def answer(self, query: str) -> str:
        """
        Return a natural-language metadata answer for the supplied query.
        """

        metadata = self.get_metadata()
        normalized = (query or "").strip().lower()

        if "how many" in normalized or "count" in normalized:
            return (
                f"There are {metadata['document_count']} uploaded documents in the corpus."
            )

        if "list" in normalized or "uploaded documents" in normalized:
            names = metadata["document_names"]
            if not names:
                return "No documents have been uploaded yet."
            return "Uploaded documents: " + ", ".join(names)

        if "statistics" in normalized or "corpus" in normalized:
            stats = metadata["corpus_statistics"]
            return (
                f"Corpus statistics: {stats['total_chunks']} chunks, "
                f"{stats['total_corpus_size']} bytes total, "
                f"largest document {stats['largest_document']['filename']} "
                f"({stats['largest_document']['size_bytes']} bytes), "
                f"smallest document {stats['smallest_document']['filename']} "
                f"({stats['smallest_document']['size_bytes']} bytes)."
            )

        if "chunk" in normalized:
            return (
                f"The current corpus contains {metadata['corpus_statistics']['total_chunks']} chunks."
            )

        if "size" in normalized:
            return (
                f"The total corpus size is {metadata['corpus_statistics']['total_corpus_size']} bytes."
            )

        if "largest" in normalized:
            doc = metadata["corpus_statistics"]["largest_document"]
            return f"The largest document is {doc['filename']} ({doc['size_bytes']} bytes)."

        if "smallest" in normalized:
            doc = metadata["corpus_statistics"]["smallest_document"]
            return f"The smallest document is {doc['filename']} ({doc['size_bytes']} bytes)."

        if "date" in normalized or "uploaded at" in normalized:
            dates = metadata["uploaded_dates"]
            if not dates:
                return "No upload dates are available yet."
            return "Upload dates: " + ", ".join(dates)

        if "index" in normalized or "indexed" in normalized:
            status = metadata["index_status"]
            return (
                f"Index status: {status['indexed_documents']} indexed, "
                f"{status['pending_documents']} pending."
            )

        return (
            "I can report on document counts, uploaded documents, corpus statistics, "
            "upload dates, and index status."
        )

    def _count_chunks(self, documents: list[Document]) -> int:
        """
        Count vector-store chunks by inspecting the Chroma collection if available.
        """

        try:
            from app.ai.vectorstore import VectorStoreService

            vector_store = VectorStoreService()
            collection = getattr(vector_store.vector_store, "_collection", None)
            if collection is None:
                return 0
            if hasattr(collection, "count"):
                return int(collection.count())
        except Exception:
            return 0

        return 0

    def _get_index_status(self, documents: list[Document]) -> dict[str, int]:
        """
        Infer index status from the database document set and available vector store.
        """

        try:
            from app.ai.vectorstore import VectorStoreService

            vector_store = VectorStoreService()
            collection = getattr(vector_store.vector_store, "_collection", None)
            if collection is None:
                return {"indexed_documents": 0, "pending_documents": len(documents)}

            if hasattr(collection, "get"):
                try:
                    stored = collection.get(include=["metadatas"])
                    metadata_items = stored.get("metadatas") or []
                    if metadata_items:
                        indexed_ids = {
                            int(item.get("document_id"))
                            for item in metadata_items
                            if isinstance(item, dict) and item.get("document_id") is not None
                        }
                        indexed_documents = len(indexed_ids)
                        return {
                            "indexed_documents": indexed_documents,
                            "pending_documents": max(0, len(documents) - indexed_documents),
                        }
                except Exception:
                    pass
        except Exception:
            pass

        return {
            "indexed_documents": 0,
            "pending_documents": len(documents),
        }
