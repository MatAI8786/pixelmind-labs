from fastapi import APIRouter
import httpx
import time

router = APIRouter()

@router.get('/api/test/binance')
def test_binance():
    start = time.perf_counter()
    try:
        httpx.get('https://api.binance.com/api/v3/ping', timeout=5)
        status = 'ok'
    except Exception:
        status = 'error'
    latency = int((time.perf_counter() - start) * 1000)
    return {'status': status, 'latency_ms': latency}
