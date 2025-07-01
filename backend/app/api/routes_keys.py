from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime
import openai

router = APIRouter()

# In-memory storage for API keys and their status
api_keys: dict[str, dict] = {}

class KeyItem(BaseModel):
    provider: str
    key: str

class ProviderItem(BaseModel):
    provider: str


def _validate_openai(key: str) -> str:
    try:
        openai.api_key = key
        openai.Model.list()
        return "ok"
    except Exception:
        return "invalid"

@router.post('/add')
def add_key(item: KeyItem):
    api_keys[item.provider] = {
        "key": item.key,
        "status": "unknown",
        "last_checked": None,
    }
    return {"status": "added"}

@router.post('/update')
def update_key(item: KeyItem):
    api_keys[item.provider] = {
        "key": item.key,
        "status": "unknown",
        "last_checked": None,
    }
    return {"status": "updated"}

@router.post('/delete')
def delete_key(item: ProviderItem):
    api_keys.pop(item.provider, None)
    return {"status": "deleted"}

@router.post('/validate')
def validate_key(item: ProviderItem | KeyItem):
    stored = api_keys.get(item.provider)
    key = getattr(item, 'key', None) or (stored and stored.get('key'))
    if not key:
        return {"status": "missing"}
    status = "unknown"
    if item.provider.lower() == 'openai':
        status = _validate_openai(key)
    api_keys[item.provider] = {
        "key": key,
        "status": status,
        "last_checked": datetime.utcnow().isoformat(),
    }
    return {"status": status}

@router.get('/list')
def list_keys():
    return [
        {
            "provider": p,
            "status": v.get("status", "unknown"),
            "last_checked": v.get("last_checked"),
        }
        for p, v in api_keys.items()
    ]
