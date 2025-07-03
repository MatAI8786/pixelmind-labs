from fastapi.testclient import TestClient
from app.main import app


def test_execute_stub():
    payload = {"nodes": [{"id": "1", "type": "llm"}], "edges": []}
    with TestClient(app) as client:
        resp = client.post('/api/workflows/execute', json=payload)
        assert resp.status_code == 200
        assert resp.json() == {"status": "ok", "log": ["ran llm"]}
