from functools import lru_cache
from pathlib import Path
from pydantic import BaseSettings
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / '..' / '..' / '.env')

class Settings(BaseSettings):
    OPENAI_API_KEY: str | None = None
    OTHER_API_KEY: str | None = None

    class Config:
        env_file = BASE_DIR / '..' / '..' / '.env'
        case_sensitive = False

@lru_cache
def get_settings() -> Settings:
    return Settings()
