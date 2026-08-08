from langchain_chroma import Chroma
from langchain_core.documents import Document

from app.ai.embeddings import EmbeddingService
from app.config import settings


class VectorStoreService:
    """
    Handles ChromaDB operations.
    """

    COLLECTION_NAME = "knowledge_base"

    _instance = None

    def __new__(cls, *args, **kwargs):
        # Process-global singleton: ensure Chroma client and embedding service
        # initialize only once to avoid reloading models on every request.
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        if getattr(self, "_initialized", False):
            return

        self.embedding_service = EmbeddingService()

        self.vector_store = Chroma(
            collection_name=self.COLLECTION_NAME,
            embedding_function=self.embedding_service.embeddings,
            persist_directory=settings.CHROMA_DB_PATH,
        )

        self._initialized = True

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
        similarity_threshold: float | None = None,
    ) -> list[Document]:
        """
        Search similar chunks.
        """
        print(f"RAG_AUDIT: [4] Chroma persist_directory: {settings.CHROMA_DB_PATH}", flush=True)
        print(f"RAG_AUDIT: [5] Chroma collection name: {self.COLLECTION_NAME}", flush=True)
        count = self.vector_store._collection.count()
        print(f"RAG_AUDIT: [6] collection.count(): {count}", flush=True)
        print(f"RAG_AUDIT: [7] embedding model used: {self.embedding_service.MODEL_NAME}", flush=True)
        
        import time
        from app.config import record_stage

        t_embed_start = time.perf_counter()
        query_embedding = self.embedding_service.embed_query(query)
        record_stage("embedding_generation", (time.perf_counter() - t_embed_start) * 1000.0)
        
        print(f"RAG_AUDIT: [8] query embedding dimension: {len(query_embedding)}", flush=True)

        t_retrieval_start = time.perf_counter()
        results_with_scores = self.vector_store.similarity_search_with_score(
            query=query,
            k=k,
        )
        record_stage("chroma_retrieval", (time.perf_counter() - t_retrieval_start) * 1000.0)
        print(f"RAG_AUDIT: [9] number of retrieved documents: {len(results_with_scores)}", flush=True)
        
        scores = [score for _, score in results_with_scores]
        print(f"RAG_AUDIT: [10] similarity scores: {scores}", flush=True)

        for doc, score in results_with_scores:
            # Convert distance score to similarity
            if score < 0:
                sim = 1.0
            elif score <= 2.0:
                sim = 1.0 - (score / 2.0)
            else:
                sim = 1.0 / (1.0 + score)
            
            doc.metadata["vector_score"] = float(sim)
            doc.metadata["distance_score"] = float(score)

        if similarity_threshold is not None:
            filtered = []
            for doc, _ in results_with_scores:
                if doc.metadata.get("vector_score", 0.0) >= similarity_threshold:
                    filtered.append(doc)
            return filtered

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