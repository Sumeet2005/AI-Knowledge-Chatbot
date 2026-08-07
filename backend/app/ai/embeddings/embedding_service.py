from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.documents import Document


class EmbeddingService:
    """
    Generates embeddings for LangChain Documents.
    """

    MODEL_NAME = "BAAI/bge-small-en-v1.5"

    def __init__(self):
        self.embeddings = HuggingFaceEmbeddings(
            model_name=self.MODEL_NAME,
            model_kwargs={
                "device": "cpu",
            },
            encode_kwargs={
                "normalize_embeddings": True,
            },
        )

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

    def embed_query(
        self,
        query: str,
    ) -> list[float]:
        """
        Generate embedding for user query.
        """

        return self.embeddings.embed_query(query)