from fastapi import APIRouter
import httpx
import time

router = APIRouter()

@router.get('/api/test/bscscan')
def test_bscscan():
    start = time.perf_counter()
    try:
        httpx.get('https://api.bscscan.com/api', timeout=5)
        status = 'ok'
    except Exception:
        status = 'error'
    latency = int((time.perf_counter() - start) * 1000)
    return {'status': status, 'latency_ms': latency}
