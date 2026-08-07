from langchain_core.documents import Document

from app.ai.vectorstore import VectorStoreService


class RetrieverService:
    """
    Retrieves relevant documents and prepares
    context for the LLM.
    """

    def __init__(self):
        self.vector_store = VectorStoreService()

    def retrieve(
        self,
        query: str,
        k: int = 4,
    ) -> list[Document]:
        """
        Retrieve top-k relevant documents.
        """

        return self.vector_store.similarity_search(
            query=query,
            k=k,
        )

    def build_context(
        self,
        documents: list[Document],
    ) -> str:
        """
        Build prompt-ready context.
        """

        context_parts = []

        for document in documents:

            metadata = document.metadata

            context_parts.append(
                (
                    f"Source: {metadata['filename']}\n"
                    f"Chunk: {metadata['chunk_index']}\n\n"
                    f"{document.page_content}"
                )
            )

        return "\n\n" + ("=" * 80) + "\n\n".join(context_parts)
    