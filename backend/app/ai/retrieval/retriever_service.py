from langchain_core.documents import Document
from sqlalchemy.orm import Session
from app.ai.vectorstore import VectorStoreService
from app.config import report_status


class RetrieverService:
    """
    Retrieves relevant documents and prepares
    context for the LLM.
    """

    _reranker = None

    # Class-level cache variables for thread-safe bounded Cross-Encoder caching
    _rerank_cache = {}
    import threading
    _cache_lock = threading.Lock()
    _MAX_CACHE_SIZE = 8192

    def __init__(self, db: Session | None = None):
        self.db = db
        self.vector_store = VectorStoreService()

    @property
    def reranker(self):
        if RetrieverService._reranker is None:
            from sentence_transformers import CrossEncoder
            RetrieverService._reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")
        return RetrieverService._reranker

    def retrieve(
        self,
        query: str,
        k: int | None = None,
        candidate_k: int | None = None,
    ) -> list[Document]:
        """
        Retrieve top-k relevant documents using Hybrid search + Cross-Encoder reranking.
        """
        from app.config import get_db_settings
        from app.api.settings import DEFAULTS

        db_settings = get_db_settings(self.db)
        rag_settings = db_settings.get("rag", {}) if db_settings else DEFAULTS.get("rag", {})

        cfg_candidate_k = rag_settings.get("top_k", 10)
        cfg_k = rag_settings.get("max_chunks", 5)
        cfg_cross_encoder = rag_settings.get("cross_encoder", True)
        cfg_similarity_threshold = rag_settings.get("similarity_threshold", 0.7)

        if candidate_k is None:
            candidate_k = cfg_candidate_k
        if k is None:
            k = cfg_k

        # 1. Semantic retrieval (Chroma vector search) for candidate_k
        report_status("searching")
        semantic_docs = self.vector_store.similarity_search(
            query=query,
            k=candidate_k,
            similarity_threshold=cfg_similarity_threshold,
        )

        # 2. Keyword retrieval (BM25 keyword search) for candidate_k
        keyword_docs = []
        try:
            # Fetch all documents in the Chroma collection to build the local BM25 corpus
            all_data = self.vector_store.vector_store._collection.get()
            all_docs = []
            
            ids = all_data.get("ids", [])
            documents = all_data.get("documents", [])
            metadatas = all_data.get("metadatas", [])
            
            if ids and documents:
                for i in range(len(ids)):
                    all_docs.append(Document(
                        page_content=documents[i],
                        metadata=metadatas[i] or {}
                    ))
                
                from app.ai.retrieval.bm25 import BM25Retriever
                bm25 = BM25Retriever(all_docs)
                keyword_docs = bm25.search(query, k=candidate_k)
        except Exception as e:
            from app.config import logger
            logger.warning(f"BM25 keyword retrieval failed: {e}")

        # 3. Merge and deduplicate (Hybrid Retrieval top candidate_k)
        report_status("retrieving")
        merged_docs = []
        seen_keys = set()

        # Interleave semantic and keyword results to balance priorities
        max_len = max(len(semantic_docs), len(keyword_docs))
        for idx in range(max_len):
            if idx < len(semantic_docs):
                doc = semantic_docs[idx]
                key = f"{doc.metadata.get('filename', '')}_{doc.metadata.get('chunk_index', '')}_{doc.page_content[:30]}"
                if key not in seen_keys:
                    seen_keys.add(key)
                    merged_docs.append(doc)
            
            if idx < len(keyword_docs):
                doc = keyword_docs[idx]
                key = f"{doc.metadata.get('filename', '')}_{doc.metadata.get('chunk_index', '')}_{doc.page_content[:30]}"
                if key not in seen_keys:
                    seen_keys.add(key)
                    merged_docs.append(doc)

        candidates = merged_docs[:candidate_k]
        if not candidates:
            self.debug_info = {
                "query": query,
                "similarity_threshold": cfg_similarity_threshold,
                "top_k_candidates": candidate_k,
                "top_k_final": k,
                "cross_encoder_enabled": cfg_cross_encoder,
                "all_candidates": []
            }
            return []

        # If Cross-Encoder reranking is disabled, return candidates up to k
        if not cfg_cross_encoder:
            final_docs = candidates[:k]
            self._save_debug_info(query, cfg_similarity_threshold, candidate_k, k, cfg_cross_encoder, semantic_docs, keyword_docs, candidates, final_docs, {})
            return final_docs

        # 4. Cross Encoder Reranking
        try:
            report_status("reranking")
            scores = {}
            misses = []
            
            with RetrieverService._cache_lock:
                for doc in candidates:
                    key = (query, doc.page_content)
                    if key in RetrieverService._rerank_cache:
                        # Move key to end to maintain LRU tracking
                        val = RetrieverService._rerank_cache.pop(key)
                        RetrieverService._rerank_cache[key] = val
                        scores[key] = val
                    else:
                        misses.append(key)
            
            if misses:
                # Execute batched reranker predictions only on the cache misses
                pred_scores = self.reranker.predict(misses)
                
                with RetrieverService._cache_lock:
                    for key, score in zip(misses, pred_scores):
                        score_val = float(score)
                        scores[key] = score_val
                        # Keep cache size bounded
                        if len(RetrieverService._rerank_cache) >= RetrieverService._MAX_CACHE_SIZE:
                            first_key = next(iter(RetrieverService._rerank_cache))
                            RetrieverService._rerank_cache.pop(first_key)
                        RetrieverService._rerank_cache[key] = score_val
            
            # Pair each doc with its rerank score and sort
            scored_docs = [(doc, scores[(query, doc.page_content)]) for doc in candidates]
            scored_docs.sort(key=lambda x: x[1], reverse=True)
            
            # Select top k
            final_docs = [doc for doc, score in scored_docs[:k]]
            self._save_debug_info(query, cfg_similarity_threshold, candidate_k, k, cfg_cross_encoder, semantic_docs, keyword_docs, candidates, final_docs, scores)
            return final_docs
        except Exception as e:
            from app.config import logger
            logger.error(f"Cross Encoder reranking failed: {e}")
            # Fallback to top k of merged docs
            final_docs = candidates[:k]
            self._save_debug_info(query, cfg_similarity_threshold, candidate_k, k, cfg_cross_encoder, semantic_docs, keyword_docs, candidates, final_docs, {})
            return final_docs

    def _save_debug_info(
        self,
        query: str,
        similarity_threshold: float,
        top_k_candidates: int,
        top_k_final: int,
        cross_encoder_enabled: bool,
        semantic_docs: list,
        keyword_docs: list,
        candidates: list,
        final_docs: list,
        scores: dict
    ) -> None:
        # Resolve original filenames from DB
        candidate_filenames = list(set(doc.metadata.get("filename", "") for doc in candidates if doc.metadata.get("filename")))
        original_filenames = {}
        if self.db and candidate_filenames:
            from app.models.document import Document as DBDocument
            try:
                db_docs = self.db.query(DBDocument).filter(DBDocument.filename.in_(candidate_filenames)).all()
                original_filenames = {doc.filename: doc.original_filename for doc in db_docs}
            except Exception:
                pass

        all_candidates_info = []
        for doc in candidates:
            filename_val = doc.metadata.get("filename", "")
            orig_filename = original_filenames.get(filename_val, filename_val)

            # Check if it is in final_docs
            is_final = any(
                fd.metadata.get("filename") == doc.metadata.get("filename") and 
                fd.metadata.get("chunk_index") == doc.metadata.get("chunk_index") and
                fd.page_content == doc.page_content 
                for fd in final_docs
            )
            
            # Determine retrieved_by
            in_semantic = any(
                sd.metadata.get("filename") == doc.metadata.get("filename") and 
                sd.metadata.get("chunk_index") == doc.metadata.get("chunk_index") and
                sd.page_content == doc.page_content 
                for sd in semantic_docs
            )
            in_keyword = any(
                kd.metadata.get("filename") == doc.metadata.get("filename") and 
                kd.metadata.get("chunk_index") == doc.metadata.get("chunk_index") and
                kd.page_content == doc.page_content 
                for kd in keyword_docs
            )
            
            retrieved_by = "both" if (in_semantic and in_keyword) else ("vector" if in_semantic else "keyword")
            
            # Get rerank score
            rerank_score = None
            if cross_encoder_enabled:
                rerank_score = scores.get((query, doc.page_content))
            
            all_candidates_info.append({
                "filename": filename_val,
                "original_filename": orig_filename,
                "chunk_index": doc.metadata.get("chunk_index", 0),
                "content": doc.page_content,
                "vector_score": doc.metadata.get("vector_score"),
                "bm25_score": doc.metadata.get("bm25_score"),
                "rerank_score": rerank_score,
                "retrieved_by": retrieved_by,
                "final_context": is_final
            })
            
        self.debug_info = {
            "query": query,
            "similarity_threshold": similarity_threshold,
            "top_k_candidates": top_k_candidates,
            "top_k_final": top_k_final,
            "cross_encoder_enabled": cross_encoder_enabled,
            "all_candidates": all_candidates_info
        }

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
    