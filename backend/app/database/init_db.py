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

    Base.metadata.create_all(bind=engine)