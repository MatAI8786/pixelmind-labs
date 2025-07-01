from functools import lru_cache
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / '..' / '..' / '.env')

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BASE_DIR / '..' / '..' / '.env',
        case_sensitive=False,
        extra='allow',
    )

    OPENAI_API_KEY: str | None = None
    OPENAI_ORG_ID: str | None = None
    ANTHROPIC_API_KEY: str | None = None
    MISTRAL_API_KEY: str | None = None
    PAYPAL_API_KEY: str | None = None
    PAYPAL_CLIENT_ID: str | None = None
    PAYPAL_CLIENT_SECRET: str | None = None
    BINANCE_API_KEY: str | None = None
    BINANCE_SECRET_KEY: str | None = None
    DATABASE_URL: str | None = None
    SECRET_KEY: str | None = None

@lru_cache
def get_settings() -> Settings:
    return Settings()
