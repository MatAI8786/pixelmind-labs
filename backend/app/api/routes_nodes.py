from fastapi import APIRouter
import requests
import openai
from ..core.settings import get_settings

router = APIRouter()

def check_openai(key: str) -> tuple[bool, str | None]:
    try:
        openai.api_key = key
        openai.Model.list()
        return True, None
    except Exception as e:
        return False, str(e)


def check_url(url: str, headers: dict[str, str] | None = None) -> tuple[bool, str | None]:
    try:
        r = requests.get(url, timeout=5, headers=headers)
        if r.status_code < 500:
            return True, None
        return False, f"status {r.status_code}"
    except Exception as e:
        return False, str(e)


@router.get('/test/{provider}')
def test_node(provider: str):
    """Check connectivity for the given provider using env settings."""
    settings = get_settings()
    provider = provider.lower()

    if provider == 'openai':
        key = settings.OPENAI_API_KEY
        if not key:
            return {"ok": False, "error": "missing OPENAI_API_KEY"}
        ok, err = check_openai(key)
        return {"ok": ok, "error": err}

    if provider == 'google':
        ok, err = check_url('https://www.google.com')
        return {"ok": ok, "error": err}

    if provider == 'binance':
        key = settings.BINANCE_API_KEY
        if not key:
            return {"ok": False, "error": "missing BINANCE_API_KEY"}
        ok, err = check_url('https://api.binance.com/api/v3/ping', headers={"X-MBX-APIKEY": key})
        return {"ok": ok, "error": err}

    return {"ok": False, "error": "unsupported provider"}
