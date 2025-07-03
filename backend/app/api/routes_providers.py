from fastapi import APIRouter
from datetime import datetime
from ..core.settings import get_settings

router = APIRouter()

PROVIDERS = [
    "openai",
    "gemini",
    "google",
    "etherscan",
    "tiktok",
    "gmail",
    "bscscan",
    "facebook",
    "paypal",
    "binance",
]

@router.get("/providers")
def list_providers():
    """Return all providers with stubbed health status."""
    now = datetime.utcnow().isoformat()
    return [
        {
            "provider": p,
            "status": "ok",
            "last_checked": now,
            "last_error": None,
        }
        for p in PROVIDERS
    ]

@router.get("/providers/{provider}/test")
def provider_test(provider: str):
    """Return a dummy healthy result for the provider."""
    return {"success": True, "details": f"{provider} healthy"}
