from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from pathlib import Path
import json

router = APIRouter()
SECRETS_DIR = Path(__file__).resolve().parent.parent / "secrets"
SECRETS_DIR.mkdir(exist_ok=True)

class KeyItem(BaseModel):
    key: str

@router.post('/{provider}', status_code=201)
def save_key(provider: str, item: KeyItem):
    path = SECRETS_DIR / f"{provider}.json"
    path.write_text(json.dumps({"key": item.key}))
    return {"status": "saved"}

@router.get('/list')
def list_keys():
    result = []
    for p in SECRETS_DIR.glob('*.json'):
        data = json.loads(p.read_text())
        result.append({
            "provider": p.stem,
            "has_key": bool(data.get("key")),
            "health": data.get("health"),
            "last_error": data.get("last_error"),
            "checked_at": data.get("checked_at"),
        })
    return result

@router.delete('/{provider}')
def delete_key(provider: str):
    path = SECRETS_DIR / f"{provider}.json"
    if path.exists():
        path.unlink()
    return {"status": "deleted"}
