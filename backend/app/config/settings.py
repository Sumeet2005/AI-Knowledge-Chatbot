from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Centralized application configuration.
    Loads values from the .env file.
    """

    APP_NAME: str = "AI Knowledge Chatbot"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    DATABASE_URL: str

    GOOGLE_API_KEY: str
    GEMINI_MODEL: str = "gemini-3.5-flash"

    CHROMA_DB_PATH: str

    UPLOAD_FOLDER: str

    LOG_LEVEL: str = "INFO"

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    """
    Returns a cached Settings object.
    """
    return Settings()


settings = get_settings()