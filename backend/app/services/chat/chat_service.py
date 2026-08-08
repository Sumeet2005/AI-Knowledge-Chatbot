import time

from sqlalchemy.orm import Session

from app.ai.llm import GeminiService
from app.schemas import ChatResponse
from app.services.chat.metadata_service import MetadataService
from app.services.chat.query_router import QueryRouter
from app.services.chat.rag_service import RAGService


class ChatService:
    """
    Coordinates routing between metadata, RAG, and general chat modes.
    """

    def __init__(self, db: Session | None = None):
        self.db = db
        self.router = QueryRouter()
        self.rag_service = RAGService(db)
        self.gemini = GeminiService(db)
        self.metadata_service = MetadataService(db) if db is not None else None

    def chat(
        self,
        question: str,
    ) -> ChatResponse:
        """
        Execute the full chat workflow based on the detected intent.
        """

        from app.config import record_stage

        start_time = time.perf_counter()
        t0 = time.perf_counter()
        intent = self.router.classify(question)
        record_stage("query_classification", (time.perf_counter() - t0) * 1000.0)
        print(f"RAG_AUDIT: [1] QueryRouter intent classification: {intent}", flush=True)
        print(f"RAG_AUDIT: [2] Query classification result: {intent}", flush=True)
        retriever_called = (intent not in ("metadata", "general"))
        print(f"RAG_AUDIT: [3] Retriever called?: {retriever_called}", flush=True)

        if intent == "metadata":
            if self.metadata_service is None:
                raise ValueError("A database session is required for metadata queries.")

            answer = self.metadata_service.answer(question)
            response_time = round(
                (time.perf_counter() - start_time) * 1000,
                2,
            )
            return ChatResponse(
                answer=answer,
                sources=[],
                retrieved_chunks=0,
                response_time_ms=response_time,
            )

        if intent == "general":
            answer = self.gemini.generate_answer(
                question=question,
                context="",
            )
            response_time = round(
                (time.perf_counter() - start_time) * 1000,
                2,
            )
            return ChatResponse(
                answer=answer,
                sources=[],
                retrieved_chunks=0,
                response_time_ms=response_time,
            )

        response = self.rag_service.answer(question)
        response.response_time_ms = round(
            (time.perf_counter() - start_time) * 1000,
            2,
        )
        return response