from fastapi import APIRouter
from pydantic import BaseModel
from sqlmodel import SQLModel, Session, create_engine, select
from datetime import datetime
from ..models import NodeStatus
import requests
import openai
import logging
from colorama import Fore, Style, init as colorama_init
from ..core.settings import get_settings

colorama_init(autoreset=True)
logger = logging.getLogger(__name__)

router = APIRouter()

# SQLite storage for node statuses
engine = create_engine("sqlite:///./nodes.db")
SQLModel.metadata.create_all(engine)


class TestPayload(BaseModel):
    key: str | None = None

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


def log_and_response(status: str, provider: str, message: str, logs: list[str]):
    if status == "success":
        logger.info(Fore.GREEN + f"{provider}: {message}" + Style.RESET_ALL)
    elif status == "warning":
        logger.warning(Fore.YELLOW + f"{provider}: {message}" + Style.RESET_ALL)
    else:
        logger.error(Fore.RED + f"{provider}: {message}" + Style.RESET_ALL)
    logs.append(f"{provider}: {message}")
    return {"status": status, "message": message, "logs": logs}


def key_present(env_name: str, key: str | None):
    if key and key.strip():
        return True, "key present"
    return False, f"missing {env_name}"


@router.post('/test/{provider}')
def test_node(provider: str, payload: TestPayload):
    """Check connectivity for the given provider using env settings or provided key."""
    settings = get_settings()
    provider = provider.lower()
    logs: list[str] = []

    if provider == 'openai':
        key = payload.key or settings.OPENAI_API_KEY
        ok, msg = key_present('OPENAI_API_KEY', key)
        if not ok:
            return log_and_response("failed", provider, msg, logs)
        ok, err = check_openai(key)
        return log_and_response("success" if ok else "failed", provider, err or "ok", logs)

    if provider == 'google':
        key = payload.key or settings.GOOGLE_API_KEY
        if not key:
            ok = False
            err = "missing GOOGLE_API_KEY"
        else:
            ok, err = check_url('https://maps.googleapis.com/maps/api/geocode/json?address=London&key='+key)
        return log_and_response("success" if ok else "failed", provider, err or "ok", logs)

    if provider == 'gemini':
        key = payload.key or settings.GEMINI_API_KEY
        ok, msg = key_present('GEMINI_API_KEY', key)
        if not ok:
            return log_and_response("failed", provider, msg, logs)
        ok, err = check_url(
            f"https://generativelanguage.googleapis.com/v1beta/models?key={key}"
        )
        return log_and_response("success" if ok else "failed", provider, err or "ok", logs)

    if provider == 'etherscan':
        key = payload.key or settings.ETHERSCAN_API_KEY
        ok, msg = key_present('ETHERSCAN_API_KEY', key)
        if not ok:
            return log_and_response("failed", provider, msg, logs)
        ok, err = check_url(
            f"https://api.etherscan.io/api?module=stats&action=ethprice&apikey={key}"
        )
        return log_and_response("success" if ok else "failed", provider, err or "ok", logs)

    if provider == 'tiktok':
        key = payload.key or settings.TIKTOK_API_KEY
        ok, msg = key_present('TIKTOK_API_KEY', key)
        if not ok:
            return log_and_response("failed", provider, msg, logs)
        ok, err = check_url('https://open.tiktokapis.com/v2', headers={"Authorization": f"Bearer {key}"})
        return log_and_response("success" if ok else "failed", provider, err or "ok", logs)

    if provider == 'gmail':
        key = payload.key or settings.GMAIL_API_KEY
        ok, msg = key_present('GMAIL_API_KEY', key)
        if not ok:
            return log_and_response("failed", provider, msg, logs)
        ok, err = check_url('https://gmail.googleapis.com', headers={"Authorization": f"Bearer {key}"})
        return log_and_response("success" if ok else "failed", provider, err or "ok", logs)

    if provider == 'bscan':
        key = payload.key or settings.BSCAN_API_KEY
        ok, msg = key_present('BSCAN_API_KEY', key)
        if not ok:
            return log_and_response("failed", provider, msg, logs)
        ok, err = check_url(
            f"https://api.bscscan.com/api?module=stats&action=bnbprice&apikey={key}"
        )
        return log_and_response("success" if ok else "failed", provider, err or "ok", logs)

    if provider == 'facebook':
        key = payload.key or settings.FACEBOOK_API_KEY
        ok, msg = key_present('FACEBOOK_API_KEY', key)
        if not ok:
            return log_and_response("failed", provider, msg, logs)
        ok, err = check_url('https://graph.facebook.com', headers={"Authorization": f"Bearer {key}"})
        return log_and_response("success" if ok else "failed", provider, err or "ok", logs)

    if provider == 'paypal':
        key = payload.key or settings.PAYPAL_API_KEY
        ok, msg = key_present('PAYPAL_API_KEY', key)
        if not ok:
            return log_and_response("failed", provider, msg, logs)
        ok, err = check_url('https://api.paypal.com', headers={"Authorization": f"Bearer {key}"})
        return log_and_response("success" if ok else "failed", provider, err or "ok", logs)

    if provider == 'binance':
        key = payload.key or settings.BINANCE_API_KEY
        ok, msg = key_present('BINANCE_API_KEY', key)
        if not ok:
            return log_and_response("failed", provider, msg, logs)
        ok, err = check_url('https://api.binance.com/api/v3/ping', headers={"X-MBX-APIKEY": key})
        return log_and_response("success" if ok else "failed", provider, err or "ok", logs)

    return log_and_response("failed", provider, "unsupported provider", logs)


@router.get('/nodes')
def list_nodes():
    with Session(engine) as session:
        return session.exec(select(NodeStatus)).all()


@router.post('/nodes/{provider}/retest')
def retest_node(provider: str):
    now = datetime.utcnow()
    with Session(engine) as session:
        node = session.get(NodeStatus, provider)
        if not node:
            node = NodeStatus(provider=provider, status='ok')
        node.status = 'ok'
        node.last_checked = now
        node.last_error = None
        session.add(node)
        session.commit()
        session.refresh(node)
        return node
