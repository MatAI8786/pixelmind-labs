from fastapi import APIRouter
import httpx
import time

router = APIRouter()

@router.get('/api/test/tiktok')
def test_tiktok():
    start = time.perf_counter()
    try:
        httpx.get('https://open.tiktokapis.com/v2', timeout=5)
        status = 'ok'
    except Exception:
        status = 'error'
    latency = int((time.perf_counter() - start) * 1000)
    return {'status': status, 'latency_ms': latency}
