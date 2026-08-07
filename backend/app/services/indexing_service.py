import traceback

from loguru import logger

from app.ai.chunking import ChunkService
from app.ai.document_processing import DocumentProcessor
from app.ai.vectorstore import VectorStoreService
from app.models import Document


class IndexingService:
    """
    Orchestrates the full document indexing pipeline with granular
    per-stage logging and exception capture.

    Stages:
        [4]  Text extraction started
        [5]  Text extraction completed
        [6]  Chunking started
        [7]  Chunking completed
        [8]  Embedding generation started  (inside VectorStoreService)
        [9]  Embedding generation completed
        [10] Vector store insertion started
        [11] Vector store insertion completed
        [12] Indexing completed
    """

    def __init__(self):
        self.chunk_service = ChunkService()
        self.vector_store = VectorStoreService()

    def index(self, document: Document) -> int:
        """
        Index a document end-to-end.

        Returns:
            Number of chunks stored in the vector store.

        Raises:
            RuntimeError: Wraps the original exception with the exact
                          stage name, type, and message included.
        """

        doc_id = document.id
        filename = document.filename
        file_path = document.file_path

        # ------------------------------------------------------------------ #
        # STAGE 4 — Text extraction                                           #
        # ------------------------------------------------------------------ #
        logger.info(
            f"[Stage 4] Text extraction started | "
            f"doc_id={doc_id} filename={filename} path={file_path}"
        )
        try:
            text = DocumentProcessor.extract_text(file_path)
        except Exception as exc:
            tb = traceback.format_exc()
            logger.error(
                f"[Stage 4] FAILED - Text extraction error\n"
                f"  doc_id   : {doc_id}\n"
                f"  filename : {filename}\n"
                f"  exc_type : {type(exc).__name__}\n"
                f"  message  : {exc}\n"
                f"  traceback:\n{tb}"
            )
            raise RuntimeError(
                f"[Stage 4] Text extraction failed for doc_id={doc_id} "
                f"filename={filename} | {type(exc).__name__}: {exc}"
            ) from exc

        logger.info(
            f"[Stage 5] Text extraction completed | "
            f"doc_id={doc_id} chars={len(text)}"
        )

        if not text.strip():
            msg = (
                f"[Stage 5] Text extraction returned empty content | "
                f"doc_id={doc_id} filename={filename}. "
                "File may be image-only, password-protected, or empty."
            )
            logger.error(msg)
            raise RuntimeError(msg)

        # ------------------------------------------------------------------ #
        # STAGE 6 — Chunking                                                  #
        # ------------------------------------------------------------------ #
        logger.info(
            f"[Stage 6] Chunking started | "
            f"doc_id={doc_id} filename={filename} text_chars={len(text)}"
        )
        try:
            chunks = self.chunk_service.split_text(
                text=text,
                document_id=doc_id,
                filename=filename,
            )
        except Exception as exc:
            tb = traceback.format_exc()
            logger.error(
                f"[Stage 6] FAILED - Chunking error\n"
                f"  doc_id   : {doc_id}\n"
                f"  filename : {filename}\n"
                f"  exc_type : {type(exc).__name__}\n"
                f"  message  : {exc}\n"
                f"  traceback:\n{tb}"
            )
            raise RuntimeError(
                f"[Stage 6] Chunking failed for doc_id={doc_id} "
                f"filename={filename} | {type(exc).__name__}: {exc}"
            ) from exc

        logger.info(
            f"[Stage 7] Chunking completed | "
            f"doc_id={doc_id} chunks={len(chunks)}"
        )

        if len(chunks) == 0:
            msg = (
                f"[Stage 7] Chunking produced 0 chunks | "
                f"doc_id={doc_id} filename={filename}."
            )
            logger.error(msg)
            raise RuntimeError(msg)

        # ------------------------------------------------------------------ #
        # STAGE 8/9 — Embedding generation (inside add_documents)             #
        # ------------------------------------------------------------------ #
        logger.info(
            f"[Stage 8] Embedding generation started | "
            f"doc_id={doc_id} chunk_count={len(chunks)}"
        )

        # ------------------------------------------------------------------ #
        # STAGE 10/11 — Vector store insertion                                #
        # ------------------------------------------------------------------ #
        logger.info(
            f"[Stage 10] Vector store insertion started | "
            f"doc_id={doc_id} chunk_count={len(chunks)}"
        )
        try:
            self.vector_store.add_documents(chunks)
        except Exception as exc:
            tb = traceback.format_exc()
            logger.error(
                f"[Stage 10] FAILED - Vector store insertion error\n"
                f"  doc_id      : {doc_id}\n"
                f"  filename    : {filename}\n"
                f"  chunk_count : {len(chunks)}\n"
                f"  exc_type    : {type(exc).__name__}\n"
                f"  message     : {exc}\n"
                f"  traceback:\n{tb}"
            )
            raise RuntimeError(
                f"[Stage 10] Vector store insertion failed for doc_id={doc_id} "
                f"filename={filename} | {type(exc).__name__}: {exc}"
            ) from exc

        logger.info(
            f"[Stage 9]  Embedding generation completed | doc_id={doc_id}"
        )
        logger.info(
            f"[Stage 11] Vector store insertion completed | "
            f"doc_id={doc_id} chunks_stored={len(chunks)}"
        )

        # ------------------------------------------------------------------ #
        # STAGE 12 — Done                                                     #
        # ------------------------------------------------------------------ #
        logger.info(
            f"[Stage 12] Indexing completed | "
            f"doc_id={doc_id} filename={filename} total_chunks={len(chunks)}"
        )

        return len(chunks)

    def delete(self, document_id: int) -> None:
        """
        Remove all vector store chunks belonging to a document.
        """
        logger.info(
            f"[Indexing] Removing vector store chunks for document_id={document_id}"
        )
        try:
            self.vector_store.delete_document(document_id)
            logger.info(
                f"[Indexing] OK - Chunks removed for document_id={document_id}"
            )
        except Exception as exc:
            tb = traceback.format_exc()
            logger.error(
                f"[Indexing] Vector store delete failed for document_id={document_id}\n"
                f"  exc_type : {type(exc).__name__}\n"
                f"  message  : {exc}\n"
                f"  traceback:\n{tb}"
            )
            # Non-fatal — log and continue
