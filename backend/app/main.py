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

    yield

    logger.info("Application shutdown.")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
    lifespan=lifespan,
)

app.include_router(router)