from functools import lru_cache
from pathlib import Path
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / '..' / '..' / '.env')

class Settings(BaseSettings):
    OPENAI_API_KEY: str | None = None
    ANTHROPIC_API_KEY: str | None = None
    MISTRAL_API_KEY: str | None = None
    PAYPAL_API_KEY: str | None = None
    BINANCE_API_KEY: str | None = None

    class Config:
        env_file = BASE_DIR / '..' / '..' / '.env'
        case_sensitive = False

@lru_cache
def get_settings() -> Settings:
    return Settings()
