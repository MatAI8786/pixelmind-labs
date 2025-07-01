from fastapi import APIRouter
import openai
from ..core.settings import get_settings

router = APIRouter()

@router.post('/validate')
def validate(provider: str, key: str):
    if provider.lower() == 'openai':
        try:
            openai.api_key = key
            openai.Model.list()
            return {"status": "valid"}
        except Exception as e:
            return {"status": "error", "detail": str(e)}
    return {"status": "error", "detail": "unknown provider"}
