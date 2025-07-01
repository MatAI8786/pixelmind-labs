from fastapi import APIRouter
import openai
from ..core.settings import get_settings

router = APIRouter()

@router.get('/health')
def health_check():
    """Return status information for key API endpoints and integrations."""
    settings = get_settings()
    openai_status = "missing_key"
    if settings.OPENAI_API_KEY:
        try:
            openai.api_key = settings.OPENAI_API_KEY
            openai.Model.list()
            openai_status = "ok"
        except Exception:
            openai_status = "error"
    return {
        "workflows": "ok",
        "keys": "ok",
        "openai": openai_status,
    }
