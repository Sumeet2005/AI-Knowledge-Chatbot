from app.database.base import Base
from app.database.session import engine

# Import all models
def initialize_database() -> None:
    """
    Creates all database tables.
    """
    from app.models.conversation import Conversation
    from app.models.document import Document
    from app.models.message import Message
    from app.models.settings import Settings

    Base.metadata.create_all(bind=engine)

    # Ensure rag_debug column exists in messages table
    from sqlalchemy import inspect, text
    try:
        with engine.connect() as conn:
            inspector = inspect(engine)
            columns = [c["name"] for c in inspector.get_columns("messages")]
            if "rag_debug" not in columns:
                conn.execute(text("ALTER TABLE messages ADD COLUMN rag_debug TEXT"))
                conn.commit()
            
            doc_columns = [c["name"] for c in inspector.get_columns("documents")]
            if "status" not in doc_columns:
                conn.execute(text("ALTER TABLE documents ADD COLUMN status VARCHAR(20) DEFAULT 'PROCESSING'"))
                conn.commit()
    except Exception as e:
        import logging
        logging.getLogger("uvicorn").warning(f"Database dynamic column migration failed: {e}")