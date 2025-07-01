from fastapi import APIRouter
from pydantic import BaseModel
import openai

router = APIRouter()

class KeyTest(BaseModel):
    key: str | None = None

def _validate_openai(key: str) -> str:
    try:
        openai.api_key = key
        openai.Model.list()
        return "success"
    except Exception as e:
        return f"error: {e}"

def _validate_stub(key: str) -> str:
    return "success" if key else "error: missing key"

validators = {
    "google": _validate_stub,
    "gemini": _validate_stub,
    "openai": _validate_openai,
    "etherscan": _validate_stub,
    "tiktok": _validate_stub,
    "gmail": _validate_stub,
    "bscan": _validate_stub,
    "facebook": _validate_stub,
    "paypal": _validate_stub,
    "binance": _validate_stub,
}

@router.post('/test/{provider}')
def test_node(provider: str, item: KeyTest):
    validator = validators.get(provider.lower())
    if not validator:
        return {"status": "error", "error": "unsupported provider"}
    result = validator(item.key or "")
    if result == "success":
        return {"status": "success"}
    return {"status": "error", "error": result.replace('error: ', '')}
