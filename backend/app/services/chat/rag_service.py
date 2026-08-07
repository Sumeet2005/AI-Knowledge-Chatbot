from __future__ import annotations

from typing import Any

from app.schemas import ChatResponse, SourceResponse


class RAGService:
    """
    Encapsulates the existing retrieval and answer-generation pipeline.
    """

    def __init__(self):
        self._retriever = None
        self._gemini = None

    @property
    def retriever(self) -> Any:
        if self._retriever is None:
            from app.ai.retrieval import RetrieverService

            self._retriever = RetrieverService()
        return self._retriever

    @property
    def gemini(self) -> Any:
        if self._gemini is None:
            from app.ai.llm import GeminiService

            self._gemini = GeminiService()
        return self._gemini

    def answer(self, question: str) -> ChatResponse:
        """
        Execute the existing RAG workflow.
        """

        documents = self.retriever.retrieve(question)
        
        filenames = [doc.metadata.get("filename", "N/A") for doc in documents]
        chunk_indexes = [doc.metadata.get("chunk_index", "N/A") for doc in documents]
        print(f"RAG_AUDIT: [11] filenames retrieved: {filenames}", flush=True)
        print(f"RAG_AUDIT: [12] chunk indexes retrieved: {chunk_indexes}", flush=True)

        context = self.retriever.build_context(documents)
        print(f"RAG_AUDIT: [13] assembled context length: {len(context)}", flush=True)
        print(f"RAG_AUDIT: [14] retrieved_chunks before response serialization: {len(documents)}", flush=True)

        answer = self.gemini.generate_answer(
            question=question,
            context=context,
        )

        return ChatResponse(
            answer=answer,
            sources=[
                SourceResponse(
                    filename=document.metadata["filename"],
                    chunk_index=document.metadata["chunk_index"],
                )
                for document in documents
            ],
            retrieved_chunks=len(documents),
            response_time_ms=0.0,
        )
