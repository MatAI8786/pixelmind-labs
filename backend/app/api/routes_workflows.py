from fastapi import APIRouter, HTTPException
from pathlib import Path
import json
from uuid import uuid4
from ..engine.runner import execute_workflow

router = APIRouter()
WORKFLOW_DIR = Path('workflows')
WORKFLOW_DIR.mkdir(exist_ok=True)

@router.post('/run')
def run_workflow(graph: dict):
    return execute_workflow(graph)

@router.post('')
def create_workflow(graph: dict):
    """Save a workflow graph and return its id."""
    wf_id = str(uuid4())
    path = WORKFLOW_DIR / f"{wf_id}.json"
    path.write_text(json.dumps(graph, indent=2))
    return {"id": wf_id}

@router.get('/{workflow_id}')
def get_workflow(workflow_id: str):
    path = WORKFLOW_DIR / f"{workflow_id}.json"
    if not path.exists():
        raise HTTPException(status_code=404, detail="Workflow not found")
    return json.loads(path.read_text())
