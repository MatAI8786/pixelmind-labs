from fastapi import APIRouter, HTTPException
from sqlmodel import SQLModel, Session, create_engine, select
from datetime import datetime
import json
from ..engine.runner import execute_workflow
from .models import WorkflowPayload
from ..models import Workflow as DBWorkflow

router = APIRouter()

# SQLite storage for workflows
engine = create_engine("sqlite:///./workflows.db")
SQLModel.metadata.create_all(engine)

@router.post('/run')
def run_workflow(graph: dict):
    return execute_workflow(graph)


@router.post('/save')
def save_workflow(payload: dict):
    name = payload.get('name', '')
    nodes = payload.get('nodes', [])
    edges = payload.get('edges', [])
    wf = DBWorkflow(name=name, graph=json.dumps({'nodes': nodes, 'edges': edges}))
    with Session(engine) as session:
        session.add(wf)
        session.commit()
        session.refresh(wf)
        return {'id': wf.id, 'name': wf.name}

@router.post('')
def create_workflow(graph: WorkflowPayload):
    """Save a workflow graph and return its id."""
    wf = DBWorkflow(name="", graph=graph.model_dump_json())
    with Session(engine) as session:
        session.add(wf)
        session.commit()
        session.refresh(wf)
        return {"id": wf.id}

@router.get('')
def list_workflows():
    with Session(engine) as session:
        items = session.exec(select(DBWorkflow)).all()
        return [
            {
                "id": w.id,
                "name": w.name,
                "graph_json": w.graph,
                "created_at": w.created_at.isoformat(),
            }
            for w in items
        ]


@router.get('/{workflow_id}')
def get_workflow(workflow_id: int):
    with Session(engine) as session:
        wf = session.get(DBWorkflow, workflow_id)
        if not wf:
            raise HTTPException(status_code=404, detail="Workflow not found")
        return json.loads(wf.graph)
