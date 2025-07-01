from fastapi import APIRouter
import openai
import requests
from ..core.settings import get_settings

router = APIRouter()

@router.get('/health')
def health_check():
    """Return status for each configured API provider."""
    settings = get_settings()

    statuses = {
        "workflows": "ok",
        "keys": "ok",
    }

    def check_openai(key: str) -> str:
        try:
            openai.api_key = key
            openai.Model.list()
            return "ok"
        except Exception:
            return "error"

    def check_url(url: str) -> str:
        try:
            r = requests.get(url, timeout=5)
            if r.status_code < 500:
                return "ok"
            return "error"
        except Exception:
            return "error"

    if settings.OPENAI_API_KEY:
        statuses["openai"] = check_openai(settings.OPENAI_API_KEY)
    else:
        statuses["openai"] = "missing_key"

    if settings.ANTHROPIC_API_KEY:
        statuses["anthropic"] = check_url("https://api.anthropic.com")
    else:
        statuses["anthropic"] = "missing_key"

    if settings.MISTRAL_API_KEY:
        statuses["mistral"] = check_url("https://api.mistral.ai")
    else:
        statuses["mistral"] = "missing_key"

    if settings.PAYPAL_API_KEY:
        statuses["paypal"] = check_url("https://api.paypal.com")
    else:
        statuses["paypal"] = "missing_key"

    if settings.BINANCE_API_KEY:
        statuses["binance"] = check_url("https://api.binance.com")
    else:
        statuses["binance"] = "missing_key"

    return statuses
