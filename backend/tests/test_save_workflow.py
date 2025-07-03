import json
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, create_engine
from app.main import app
from app.api import routes_workflows
from app.api.models import Workflow


def test_save_then_list(tmp_path, monkeypatch):
    engine = create_engine(f"sqlite:///{tmp_path}/test.db")
    monkeypatch.setattr(routes_workflows, "engine", engine)
    SQLModel.metadata.create_all(engine)

    wf = Workflow(nodes=[], edges=[])
    with TestClient(app) as client:
        resp = client.post("/api/workflows", json=wf.model_dump())
        assert resp.status_code == 200
        wf_id = resp.json()["id"]
        resp2 = client.get("/api/workflows")
        assert resp2.status_code == 200
        data = resp2.json()
        ids = [item["id"] for item in data]
        assert wf_id in ids

