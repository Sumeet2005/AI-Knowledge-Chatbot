from __future__ import annotations

from typing import Any
from sqlalchemy.orm import Session

from app.schemas import ChatResponse, SourceResponse
from app.config import report_status


class RAGService:
    """
    Encapsulates the existing retrieval and answer-generation pipeline.
    """

    def __init__(self, db: Session | None = None):
        self.db = db
        self._retriever = None
        self._gemini = None

    @property
    def retriever(self) -> Any:
        if self._retriever is None:
            from app.ai.retrieval import RetrieverService

            self._retriever = RetrieverService(self.db)
        return self._retriever

    @property
    def gemini(self) -> Any:
        if self._gemini is None:
            from app.ai.llm import GeminiService

            self._gemini = GeminiService(self.db)
        return self._gemini

    def answer(self, question: str) -> ChatResponse:
        """
        Execute the existing RAG workflow.
        """
        import time
        from app.config import record_stage

        t_retrieval_start = time.perf_counter()
        documents = self.retriever.retrieve(question)
        retrieval_latency = (time.perf_counter() - t_retrieval_start) * 1000.0
        
        filenames = [doc.metadata.get("filename", "N/A") for doc in documents]
        chunk_indexes = [doc.metadata.get("chunk_index", "N/A") for doc in documents]
        print(f"RAG_AUDIT: [11] filenames retrieved: {filenames}", flush=True)
        print(f"RAG_AUDIT: [12] chunk indexes retrieved: {chunk_indexes}", flush=True)

        t_context_start = time.perf_counter()
        context = self.retriever.build_context(documents)
        record_stage("context_assembly", (time.perf_counter() - t_context_start) * 1000.0)
        print(f"RAG_AUDIT: [13] assembled context length: {len(context)}", flush=True)
        print(f"RAG_AUDIT: [14] retrieved_chunks before response serialization: {len(documents)}", flush=True)

        t_gen_start = time.perf_counter()
        report_status("generating")
        answer = self.gemini.generate_answer(
            question=question,
            context=context,
        )
        generation_latency = (time.perf_counter() - t_gen_start) * 1000.0

        # Retrieve tracked debug info from retriever service instance
        debug_info = getattr(self.retriever, "debug_info", {})
        rag_debug = {
            "query": debug_info.get("query", question),
            "similarity_threshold": debug_info.get("similarity_threshold"),
            "top_k_candidates": debug_info.get("top_k_candidates"),
            "top_k_final": debug_info.get("top_k_final"),
            "cross_encoder_enabled": debug_info.get("cross_encoder_enabled"),
            "retrieval_latency_ms": round(retrieval_latency, 2),
            "generation_latency_ms": round(generation_latency, 2),
            "chunks": debug_info.get("all_candidates", [])
        }

        sources = []
        for document in documents:
            filename = document.metadata.get("filename", "")
            chunk_index = document.metadata.get("chunk_index", 0)
            content = document.page_content
            
            # Match in debug_info's candidates list
            candidate = None
            for c in rag_debug.get("chunks", []):
                if c.get("filename") == filename and c.get("chunk_index") == chunk_index:
                    candidate = c
                    break
            
            if candidate:
                sources.append(
                    SourceResponse(
                        filename=filename,
                        original_filename=candidate.get("original_filename"),
                        chunk_index=chunk_index,
                        content=content,
                        vector_score=candidate.get("vector_score"),
                        bm25_score=candidate.get("bm25_score"),
                        rerank_score=candidate.get("rerank_score"),
                        retrieved_by=candidate.get("retrieved_by"),
                    )
                )
            else:
                sources.append(
                    SourceResponse(
                        filename=filename,
                        chunk_index=chunk_index,
                        content=content,
                    )
                )

        return ChatResponse(
            answer=answer,
            sources=sources,
            retrieved_chunks=len(documents),
            response_time_ms=0.0,
            rag_debug=rag_debug,
        )
