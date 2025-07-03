import json
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, create_engine, Session
from app.main import app
from app.api import routes_workflows
from app.api.models import WorkflowPayload
from app.models import Workflow as DBWorkflow


def test_save_then_list(tmp_path, monkeypatch):
    engine = create_engine(f"sqlite:///{tmp_path}/test.db")
    monkeypatch.setattr(routes_workflows, "engine", engine)
    SQLModel.metadata.create_all(engine)

    wf = WorkflowPayload(nodes=[], edges=[])
    with TestClient(app) as client:
        resp = client.post("/api/workflows/save", json={"name": "test", **wf.model_dump()})
        assert resp.status_code == 200
        wf_id = resp.json()["id"]
        with Session(engine) as session:
            saved = session.get(DBWorkflow, wf_id)
            assert saved is not None

