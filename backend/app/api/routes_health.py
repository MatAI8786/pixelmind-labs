from fastapi import APIRouter
import openai
import requests
from ..core.settings import get_settings

router = APIRouter()

@router.get('/health')
def health_check():
    """Return status for each configured API provider."""
    settings = get_settings()

    statuses: dict[str, dict] = {
        "workflows": {"status": "ok", "msg": ""},
        "keys": {"status": "ok", "msg": ""},
    }

    def check_openai(key: str) -> tuple[str, str]:
        try:
            openai.api_key = key
            openai.Model.list()
            return "ok", "ok"
        except Exception as e:
            return "error", str(e)

    def check_url(url: str) -> tuple[str, str]:
        try:
            r = requests.get(url, timeout=5)
            if r.status_code < 500:
                return "ok", "ok"
            return "error", f"status {r.status_code}"
        except Exception as e:
            return "error", str(e)

    if settings.OPENAI_API_KEY:
        st, msg = check_openai(settings.OPENAI_API_KEY)
        statuses["openai"] = {"status": st, "msg": msg}
    else:
        statuses["openai"] = {"status": "missing", "msg": "missing OPENAI_API_KEY"}

    if settings.ANTHROPIC_API_KEY:
        st, msg = check_url("https://api.anthropic.com")
        statuses["anthropic"] = {"status": st, "msg": msg}
    else:
        statuses["anthropic"] = {"status": "missing", "msg": "missing ANTHROPIC_API_KEY"}

    if settings.MISTRAL_API_KEY:
        st, msg = check_url("https://api.mistral.ai")
        statuses["mistral"] = {"status": st, "msg": msg}
    else:
        statuses["mistral"] = {"status": "missing", "msg": "missing MISTRAL_API_KEY"}

    if settings.PAYPAL_API_KEY:
        st, msg = check_url("https://api.paypal.com")
        statuses["paypal"] = {"status": st, "msg": msg}
    else:
        statuses["paypal"] = {"status": "missing", "msg": "missing PAYPAL_API_KEY"}

    if settings.BINANCE_API_KEY:
        st, msg = check_url("https://api.binance.com")
        statuses["binance"] = {"status": st, "msg": msg}
    else:
        statuses["binance"] = {"status": "missing", "msg": "missing BINANCE_API_KEY"}

    if settings.GEMINI_API_KEY:
        st, msg = check_url("https://generativelanguage.googleapis.com")
        statuses["gemini"] = {"status": st, "msg": msg}
    else:
        statuses["gemini"] = {"status": "missing", "msg": "missing GEMINI_API_KEY"}

    if settings.TIKTOK_API_KEY:
        st, msg = check_url("https://open.tiktokapis.com/v2")
        statuses["tiktok"] = {"status": st, "msg": msg}
    else:
        statuses["tiktok"] = {"status": "missing", "msg": "missing TIKTOK_API_KEY"}

    if settings.GMAIL_API_KEY:
        st, msg = check_url("https://gmail.googleapis.com")
        statuses["gmail"] = {"status": st, "msg": msg}
    else:
        statuses["gmail"] = {"status": "missing", "msg": "missing GMAIL_API_KEY"}

    if settings.BSCAN_API_KEY:
        st, msg = check_url("https://api.bscscan.com/api")
        statuses["bscscan"] = {"status": st, "msg": msg}
    else:
        statuses["bscscan"] = {"status": "missing", "msg": "missing BSCAN_API_KEY"}

    if settings.FACEBOOK_API_KEY:
        st, msg = check_url("https://graph.facebook.com")
        statuses["facebook"] = {"status": st, "msg": msg}
    else:
        statuses["facebook"] = {"status": "missing", "msg": "missing FACEBOOK_API_KEY"}

    return statuses
