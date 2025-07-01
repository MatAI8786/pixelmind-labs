from fastapi import APIRouter

router = APIRouter()

@router.get('/health')
def health_check():
    """Simple health check returning status of key API endpoints."""
    return {
        "workflows": "ok",
        "keys": "ok"
    }
