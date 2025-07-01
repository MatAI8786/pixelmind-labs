from fastapi import APIRouter
from pydantic import BaseModel
import openai
from ..core.settings import get_settings

router = APIRouter()

class LLMConfig(BaseModel):
    provider: str = "openai"
    model: str
    prompt: str
    temperature: float = 1.0
    maxTokens: int = 256

@router.post('/test')
def test_llm(config: LLMConfig):
    settings = get_settings()
    if config.provider.lower() == 'openai' and settings.OPENAI_API_KEY:
        try:
            openai.api_key = settings.OPENAI_API_KEY
            resp = openai.ChatCompletion.create(
                model=config.model,
                messages=[{"role": "user", "content": config.prompt}],
                temperature=config.temperature,
                max_tokens=config.maxTokens,
            )
            text = resp.choices[0].message['content']
            return {"result": text}
        except Exception as e:
            return {"error": str(e)}
    # stub response if provider missing
    return {"result": "no provider configured"}
