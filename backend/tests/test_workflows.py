import json
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.api import routes_workflows
from app.api.models import Workflow

def test_save_load_roundtrip(tmp_path, monkeypatch):
    monkeypatch.setattr(routes_workflows, 'WORKFLOW_DIR', tmp_path)
    routes_workflows.WORKFLOW_DIR.mkdir(exist_ok=True)
    wf = Workflow(nodes=[], edges=[])
    with TestClient(app) as client:
        resp = client.post('/api/workflows', json=wf.model_dump())
        assert resp.status_code == 200
        wf_id = resp.json()['id']
        resp2 = client.get(f'/api/workflows/{wf_id}')
        assert resp2.status_code == 200
        assert resp2.json() == wf.model_dump()
