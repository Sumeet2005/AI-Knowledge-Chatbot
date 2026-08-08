from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.repositories import DocumentRepository, ConversationRepository
from app.ai.vectorstore.vector_store_service import VectorStoreService
from app.ai.embeddings.embedding_service import EmbeddingService
from app.ai.retrieval.retriever_service import RetrieverService
from app.ai.llm.router import LLMRouter
from app.monitoring.metrics import metrics_collector
from app.models import Message, Document
from app.config import get_uptime_seconds
from app.config import settings
import os
import platform


def _provider_status(router_llm, name: str):
    """Return a status dict for a provider: online/offline/quota/unavailable."""
    # Simulation hooks
    sim_env = os.environ.get("SIMULATE_" + name.upper() + "_ERROR")
    if sim_env == "429":
        return {"status": "quota"}

    try:
        if name == "Gemini":
            if not getattr(settings, "GOOGLE_API_KEY", None):
                return {"status": "offline"}
            # Try light instantiation
            try:
                prov = router_llm._get_provider(name)
                if prov is None:
                    return {"status": "offline"}
                return {"status": "online"}
            except Exception as e:
                return {"status": "unavailable", "detail": str(e)}

        if name == "Groq":
            if not getattr(settings, "GROQ_API_KEY", None):
                return {"status": "offline"}
            try:
                prov = router_llm._get_provider(name)
                if prov is None:
                    return {"status": "offline"}
                return {"status": "online"}
            except Exception as e:
                return {"status": "unavailable", "detail": str(e)}

        if name == "Ollama":
            ollama_url = getattr(settings, "OLLAMA_API_URL", None)
            if not ollama_url:
                return {"status": "offline"}
            try:
                import httpx

                with httpx.Client(timeout=1.0) as client:
                    resp = client.get(ollama_url)
                    if resp.status_code >= 400:
                        return {"status": "unavailable", "detail": f"http {resp.status_code}"}
                    return {"status": "online"}
            except Exception as e:
                return {"status": "unavailable", "detail": str(e)}

    except Exception as e:
        return {"status": "unavailable", "detail": str(e)}

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/metrics")
def get_admin_metrics(db: Session = Depends(get_db)):
    # Document count and storage size calculation
    doc_repo = DocumentRepository(db)
    documents = doc_repo.get_all()
    document_count = len(documents)
    storage_size_bytes = db.query(func.sum(Document.file_size)).scalar() or 0

    # Conversation and message counts
    conv_repo = ConversationRepository(db)
    conversation_count = len(conv_repo.get_all())

    message_count = db.query(func.count(Message.id)).scalar() or 0
    total_queries = db.query(func.count(Message.id)).filter(Message.role == "user").scalar() or 0

    # Chunk count from Chroma collection
    chunk_count = 0
    try:
        vs = VectorStoreService()
        collection = getattr(vs.vector_store, "_collection", None)
        if collection is not None and hasattr(collection, "count"):
            chunk_count = int(collection.count())
    except Exception:
        chunk_count = 0

    # Embedding and reranker model info
    embedding_model = getattr(EmbeddingService, "MODEL_NAME", "unknown")

    reranker_model = "none"
    try:
        reranker = RetrieverService().reranker
        reranker_model = getattr(reranker, "model_name_or_path", getattr(reranker, "model_name", reranker.__class__.__name__))
    except Exception:
        reranker_model = "unavailable"

    # Active LLM provider (first available in fallback order)
    active_provider = "none"
    try:
        router_llm = LLMRouter()
        for name in ["Gemini", "Groq", "Ollama"]:
            try:
                prov = router_llm._get_provider(name)
                if prov is not None:
                    active_provider = name
                    break
            except Exception:
                continue
    except Exception:
        active_provider = "unknown"

    # Active LLM model lookup
    active_llm_model = "unknown"
    if active_provider == "Gemini":
        active_llm_model = getattr(settings, "GEMINI_MODEL", "gemini-1.5-flash")
    elif active_provider == "Groq":
        active_llm_model = getattr(settings, "GROQ_MODEL", "mixtral-8x7b-32768")
    elif active_provider == "Ollama":
        active_llm_model = "local-ollama"

    averages = metrics_collector.get_averages()
    history = metrics_collector.get_history()
    counts = metrics_collector.get_counts()

    # Calculate average latencies from persisted database messages' rag_debug field
    total_response_time_sum = 0.0
    total_retrieval_time_sum = 0.0
    total_llm_time_sum = 0.0
    latency_count = 0
    
    import json
    import time
    db_msgs = db.query(Message).filter(Message.role == 'assistant', Message.rag_debug.isnot(None)).all()
    
    for m in db_msgs:
        try:
            debug_dict = json.loads(m.rag_debug)
            if debug_dict:
                ret_ms = debug_dict.get("retrieval_latency_ms")
                gen_ms = debug_dict.get("generation_latency_ms")
                if ret_ms is not None and gen_ms is not None:
                    total_retrieval_time_sum += float(ret_ms)
                    total_llm_time_sum += float(gen_ms)
                    total_response_time_sum += float(ret_ms + gen_ms)
                    latency_count += 1
        except Exception:
            continue

    if latency_count > 0:
        avg_response_time_ms = total_response_time_sum / latency_count
        avg_retrieval_time_ms = total_retrieval_time_sum / latency_count
        avg_llm_time_ms = total_llm_time_sum / latency_count
    else:
        avg_response_time_ms = averages["avg_response_ms"]
        avg_retrieval_time_ms = averages["avg_retrieval_ms"]
        avg_llm_time_ms = averages["avg_llm_ms"]

    if not history and db_msgs:
        sorted_msgs = sorted(db_msgs, key=lambda x: x.created_at or x.id)
        for m in sorted_msgs[-200:]:
            try:
                debug_dict = json.loads(m.rag_debug)
                if debug_dict:
                    ret_ms = debug_dict.get("retrieval_latency_ms")
                    gen_ms = debug_dict.get("generation_latency_ms")
                    if ret_ms is not None and gen_ms is not None:
                        ts = int(m.created_at.timestamp()) if m.created_at else int(time.time())
                        history.append({
                            "ts": ts,
                            "response_ms": float(ret_ms + gen_ms),
                            "retrieval_ms": float(ret_ms),
                            "llm_ms": float(gen_ms)
                        })
            except Exception:
                continue

    # Uptime and system resources
    uptime_seconds = 0.0
    try:
        uptime_seconds = get_uptime_seconds()
    except Exception:
        uptime_seconds = 0.0

    system_resources = metrics_collector.get_system_resources()

    # Provider statuses
    provider_status = {}
    try:
        router_llm = LLMRouter()
        for name in ["Gemini", "Groq", "Ollama"]:
            provider_status[name] = _provider_status(router_llm, name)
    except Exception:
        provider_status = {"error": "could not evaluate providers"}

    # Embedding cache - if EmbeddingService exposes a cache, show size
    embedding_cache = 0
    try:
        emb = EmbeddingService()
        embedding_cache = getattr(emb, "cache_size", 0) or 0
    except Exception:
        embedding_cache = 0

    total_requests = counts.get("success", 0) + counts.get("failed", 0)
    success_rate = (counts.get("success", 0) / total_requests * 100.0) if total_requests > 0 else 0.0

    # Query Volume by date (last 7 days chronologically)
    query_volume = []
    try:
        from datetime import datetime, timedelta
        from sqlalchemy import text
        
        # Build list of last 7 dates in YYYY-MM-DD format
        today = datetime.utcnow().date()
        target_dates = [str(today - timedelta(days=i)) for i in range(6, -1, -1)]
        
        # Query database counts grouped by date
        vol_results = db.execute(text(
            "SELECT DATE(created_at) as date_str, COUNT(id) as count "
            "FROM messages "
            "WHERE role = 'user' "
            "GROUP BY date_str"
        )).all()
        
        db_counts = {r.date_str: r.count for r in vol_results}
        
        for d_str in target_dates:
            query_volume.append({
                "date": d_str,
                "count": db_counts.get(d_str, 0)
            })
    except Exception:
        query_volume = []

    # System Health checks
    db_healthy = True
    try:
        from sqlalchemy import text
        db.execute(text("SELECT 1")).scalar()
    except Exception:
        db_healthy = False

    chroma_healthy = False
    try:
        vs = VectorStoreService()
        collection = getattr(vs.vector_store, "_collection", None)
        if collection is not None and hasattr(collection, "count"):
            collection.count()
            chroma_healthy = True
    except Exception:
        chroma_healthy = False

    llm_healthy = False
    try:
        if active_provider in provider_status and provider_status[active_provider].get("status") == "online":
            llm_healthy = True
    except Exception:
        llm_healthy = False

    health = {
        "backend": "healthy",
        "database": "healthy" if db_healthy else "unhealthy",
        "chromadb": "healthy" if chroma_healthy else "unhealthy",
        "llm_api": "healthy" if llm_healthy else "unhealthy",
    }

    return {
        "document_count": document_count,
        "chunk_count": chunk_count,
        "embedding_model": embedding_model,
        "reranker_model": reranker_model,
        "active_llm_provider": active_provider,
        "active_llm_model": active_llm_model,
        "average_response_time_ms": avg_response_time_ms,
        "average_retrieval_time_ms": avg_retrieval_time_ms,
        "average_llm_time_ms": avg_llm_time_ms,
        "conversation_count": conversation_count,
        "message_count": message_count,
        "total_queries": total_queries,
        "storage_size_bytes": storage_size_bytes,
        "history": history,
        "uptime_seconds": uptime_seconds,
        "active_requests": counts.get("active", 0),
        "success_count": counts.get("success", 0),
        "failed_count": counts.get("failed", 0),
        "success_rate_pct": success_rate,
        "provider_status": provider_status,
        "system_resources": system_resources,
        "vector_count": chunk_count,
        "embedding_cache": embedding_cache,
        "query_volume": query_volume,
        "health": health,
    }
