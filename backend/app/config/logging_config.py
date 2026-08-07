import sys

from loguru import logger

from app.config.settings import settings

# Remove default logger
logger.remove()

# Console logging
logger.add(
    sys.stdout,
    level=settings.LOG_LEVEL,
    format=(
        "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
        "<level>{level}</level> | "
        "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
        "<level>{message}</level>"
    ),
)

# File logging
logger.add(
    "logs/application.log",
    rotation="10 MB",
    retention="30 days",
    level=settings.LOG_LEVEL,
    enqueue=True,
)

__all__ = ["logger"]