from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api import router
from app.config import logger, settings
from app.database import initialize_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting AI Knowledge Chatbot...")

    initialize_database()

    logger.info("Database initialized successfully.")

    # Eagerly initialize heavy ML models and vector store singletons so they
    # are loaded once at application startup instead of on each request.
    try:
        from app.ai.embeddings.embedding_service import EmbeddingService
        from app.ai.vectorstore.vector_store_service import VectorStoreService
        from app.ai.retrieval.retriever_service import RetrieverService

        # Instantiate singletons (their constructors are idempotent)
        EmbeddingService()
        VectorStoreService()

        # Ensure CrossEncoder reranker is loaded
        try:
            RetrieverService().reranker
        except Exception:
            logger.warning("Failed to eagerly initialize CrossEncoder reranker at startup.")
    except Exception:
        logger.exception("Eager model initialization failed; continuing without preloading.")

    # Auto-index any existing unindexed documents in the SQLite database
    try:
        from app.database.session import SessionLocal
        from app.repositories import DocumentRepository
        from app.services.indexing_service import IndexingService

        db_session = SessionLocal()
        try:
            doc_repo = DocumentRepository(db_session)
            docs = doc_repo.get_all()
            if docs:
                logger.info(f"Checking indexing status for {len(docs)} document(s)...")
                vs = VectorStoreService()
                collection = getattr(vs.vector_store, "_collection", None)
                indexed_ids = set()
                if collection is not None:
                    all_data = collection.get(include=["metadatas"])
                    for meta in all_data.get("metadatas", []):
                        if meta and "document_id" in meta:
                            indexed_ids.add(int(meta["document_id"]))
                
                idx_service = IndexingService(db_session)
                for doc in docs:
                    if doc.id not in indexed_ids:
                        logger.info(f"Auto-indexing unindexed document: {doc.original_filename} (ID: {doc.id})")
                        try:
                            doc.status = "PROCESSING"
                            db_session.commit()
                            
                            idx_service.index(doc)
                            
                            doc.status = "READY"
                            db_session.commit()
                            logger.info(f"Successfully auto-indexed doc ID {doc.id}")
                        except Exception as e:
                            logger.error(f"Failed to auto-index doc {doc.id} ({doc.original_filename}): {e}")
                            try:
                                doc.status = "FAILED"
                                db_session.commit()
                            except Exception:
                                pass
                    else:
                        if doc.status != "READY":
                            doc.status = "READY"
                            db_session.commit()
        finally:
            db_session.close()
    except Exception:
        logger.exception("Failed to run startup document auto-indexing check")

    yield

    logger.info("Application shutdown.")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
    lifespan=lifespan,
)

from fastapi.middleware.cors import CORSMiddleware

# Parse allowed origins list from environment settings
origins = [o.strip() for o in settings.ALLOWED_ORIGINS.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)