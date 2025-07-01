from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
async def health():
    return {"workflows": "ok", "keys": "ok"}
