from fastapi.testclient import TestClient
from sqlmodel import SQLModel, create_engine
from app.main import app
from app.api import routes_nodes


def test_list_and_retest(tmp_path, monkeypatch):
    engine = create_engine(f"sqlite:///{tmp_path}/test.db")
    monkeypatch.setattr(routes_nodes, "engine", engine)
    SQLModel.metadata.create_all(engine)

    with TestClient(app) as client:
        resp = client.get("/api/nodes")
        assert resp.status_code == 200
        assert len(resp.json()) > 0
        resp2 = client.post("/api/nodes/openai/retest")
        assert resp2.status_code == 200
        data = resp2.json()
        assert data["provider"] == "openai"
        resp3 = client.get("/api/nodes")
        assert resp3.status_code == 200
        data_list = resp3.json()
        assert any(i["provider"] == "openai" and i["status"] == "ok" for i in data_list)


def test_nodes_non_empty(tmp_path, monkeypatch):
    engine = create_engine(f"sqlite:///{tmp_path}/test2.db")
    monkeypatch.setattr(routes_nodes, "engine", engine)
    SQLModel.metadata.create_all(engine)

    with TestClient(app) as client:
        resp = client.get("/api/nodes")
        assert resp.status_code == 200
        assert len(resp.json()) > 0

