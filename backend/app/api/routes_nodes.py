from fastapi import APIRouter
import requests
import openai
import logging
from colorama import Fore, Style, init as colorama_init
from ..core.settings import get_settings

colorama_init(autoreset=True)
logger = logging.getLogger(__name__)

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


def log_and_response(status: str, provider: str, message: str):
    if status == "success":
        logger.info(Fore.GREEN + f"{provider}: {message}" + Style.RESET_ALL)
    elif status == "warning":
        logger.warning(Fore.YELLOW + f"{provider}: {message}" + Style.RESET_ALL)
    else:
        logger.error(Fore.RED + f"{provider}: {message}" + Style.RESET_ALL)
    return {"status": status, "message": message}


def key_present(env_name: str, key: str | None):
    if key and key.strip():
        return True, "key present"
    return False, f"missing {env_name}"


@router.get('/test/{provider}')
def test_node(provider: str):
    """Check connectivity for the given provider using env settings."""
    settings = get_settings()
    provider = provider.lower()

    if provider == 'openai':
        key = settings.OPENAI_API_KEY
        ok, msg = key_present('OPENAI_API_KEY', key)
        if not ok:
            return log_and_response("failed", provider, msg)
        ok, err = check_openai(key)
        return log_and_response("success" if ok else "failed", provider, err or "ok")

    if provider == 'google':
        ok, err = check_url('https://www.google.com')
        return log_and_response("success" if ok else "failed", provider, err or "ok")

    if provider == 'gemini':
        ok, msg = key_present('GEMINI_API_KEY', settings.GEMINI_API_KEY)
        return log_and_response("success" if ok else "failed", provider, msg)

    if provider == 'etherscan':
        ok, msg = key_present('ETHERSCAN_API_KEY', settings.ETHERSCAN_API_KEY)
        return log_and_response("success" if ok else "failed", provider, msg)

    if provider == 'tiktok':
        ok, msg = key_present('TIKTOK_API_KEY', settings.TIKTOK_API_KEY)
        return log_and_response("success" if ok else "failed", provider, msg)

    if provider == 'gmail':
        ok, msg = key_present('GMAIL_API_KEY', settings.GMAIL_API_KEY)
        return log_and_response("success" if ok else "failed", provider, msg)

    if provider == 'bscan':
        ok, msg = key_present('BSCAN_API_KEY', settings.BSCAN_API_KEY)
        return log_and_response("success" if ok else "failed", provider, msg)

    if provider == 'facebook':
        ok, msg = key_present('FACEBOOK_API_KEY', settings.FACEBOOK_API_KEY)
        return log_and_response("success" if ok else "failed", provider, msg)

    if provider == 'paypal':
        ok, msg = key_present('PAYPAL_API_KEY', settings.PAYPAL_API_KEY)
        return log_and_response("success" if ok else "failed", provider, msg)

    if provider == 'binance':
        key = settings.BINANCE_API_KEY
        ok, msg = key_present('BINANCE_API_KEY', key)
        if not ok:
            return log_and_response("failed", provider, msg)
        ok, err = check_url('https://api.binance.com/api/v3/ping', headers={"X-MBX-APIKEY": key})
        return log_and_response("success" if ok else "failed", provider, err or "ok")

    return log_and_response("failed", provider, "unsupported provider")
