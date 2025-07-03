from fastapi import APIRouter, HTTPException
from sqlmodel import SQLModel, Field, Session, create_engine, select
from datetime import datetime
import json
from ..engine.runner import execute_workflow
from .models import Workflow

router = APIRouter()

# SQLite storage for workflows
engine = create_engine("sqlite:///./workflows.db")


class WorkflowDB(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str = ""
    graph_json: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


SQLModel.metadata.create_all(engine)

@router.post('/run')
def run_workflow(graph: dict):
    return execute_workflow(graph)

@router.post('')
def create_workflow(graph: Workflow):
    """Save a workflow graph and return its id."""
    wf = WorkflowDB(graph_json=graph.model_dump_json())
    with Session(engine) as session:
        session.add(wf)
        session.commit()
        session.refresh(wf)
        return {"id": wf.id}

@router.get('')
def list_workflows():
    with Session(engine) as session:
        items = session.exec(select(WorkflowDB)).all()
        return [
            {
                "id": w.id,
                "name": w.name,
                "graph_json": w.graph_json,
                "created_at": w.created_at.isoformat(),
            }
            for w in items
        ]


@router.get('/{workflow_id}')
def get_workflow(workflow_id: int):
    with Session(engine) as session:
        wf = session.get(WorkflowDB, workflow_id)
        if not wf:
            raise HTTPException(status_code=404, detail="Workflow not found")
        return json.loads(wf.graph_json)
