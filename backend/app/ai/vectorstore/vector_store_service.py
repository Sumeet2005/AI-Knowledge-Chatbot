from langchain_chroma import Chroma
from langchain_core.documents import Document

from app.ai.embeddings import EmbeddingService
from app.config import settings


class VectorStoreService:
    """
    Handles ChromaDB operations.
    """

    COLLECTION_NAME = "knowledge_base"

    def __init__(self):
        self.embedding_service = EmbeddingService()

        self.vector_store = Chroma(
            collection_name=self.COLLECTION_NAME,
            embedding_function=self.embedding_service.embeddings,
            persist_directory=settings.CHROMA_DB_PATH,
        )

    def add_documents(
        self,
        documents: list[Document],
    ) -> None:
        """
        Store documents inside ChromaDB.
        """

        self.vector_store.add_documents(documents)

    def similarity_search(
        self,
        query: str,
        k: int = 4,
    ) -> list[Document]:
        """
        Search similar chunks.
        """
        print(f"RAG_AUDIT: [4] Chroma persist_directory: {settings.CHROMA_DB_PATH}", flush=True)
        print(f"RAG_AUDIT: [5] Chroma collection name: {self.COLLECTION_NAME}", flush=True)
        count = self.vector_store._collection.count()
        print(f"RAG_AUDIT: [6] collection.count(): {count}", flush=True)
        print(f"RAG_AUDIT: [7] embedding model used: {self.embedding_service.MODEL_NAME}", flush=True)
        
        query_embedding = self.embedding_service.embed_query(query)
        print(f"RAG_AUDIT: [8] query embedding dimension: {len(query_embedding)}", flush=True)

        results_with_scores = self.vector_store.similarity_search_with_score(
            query=query,
            k=k,
        )
        print(f"RAG_AUDIT: [9] number of retrieved documents: {len(results_with_scores)}", flush=True)
        
        scores = [score for _, score in results_with_scores]
        print(f"RAG_AUDIT: [10] similarity scores: {scores}", flush=True)

        return [doc for doc, _ in results_with_scores]

    def delete_document(
        self,
        document_id: int,
    ) -> None:
        """
        Delete all chunks belonging to a document.
        """

        self.vector_store.delete(
            where={
                "document_id": document_id,
            }
        )