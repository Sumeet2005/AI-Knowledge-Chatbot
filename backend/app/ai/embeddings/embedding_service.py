from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.documents import Document


class EmbeddingService:
    """
    Generates embeddings for LangChain Documents.

    This class is implemented as a process-global singleton so that the
    underlying HuggingFace embedding model is loaded only once at startup
    and reused across requests. Instantiating `EmbeddingService()` multiple
    times will return the same instance.
    """

    MODEL_NAME = "BAAI/bge-small-en-v1.5"
    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        # __init__ may be called multiple times due to singleton pattern;
        # ensure heavy initialization runs only once.
        if getattr(self, "_initialized", False):
            return

        self.embeddings = HuggingFaceEmbeddings(
            model_name=self.MODEL_NAME,
            model_kwargs={
                "device": "cpu",
            },
            encode_kwargs={
                "normalize_embeddings": True,
            },
        )
        self._initialized = True

    def embed_documents(
        self,
        documents: list[Document],
    ) -> list[list[float]]:
        """
        Generate embeddings for documents.
        """

        texts = [
            document.page_content
            for document in documents
        ]

        return self.embeddings.embed_documents(texts)

    from functools import lru_cache

    @lru_cache(maxsize=1024)
    def embed_query(
        self,
        query: str,
    ) -> list[float]:
        """
        Generate embedding for user query.
        """

        return self.embeddings.embed_query(query)

    @property
    def cache_size(self) -> int:
        """
        Return the current size of the query embedding cache.
        """
        return self.embed_query.cache_info().currsize