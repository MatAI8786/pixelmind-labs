from fastapi import APIRouter, HTTPException
from pathlib import Path
import json
from ..engine.runner import execute_workflow

router = APIRouter()
WORKFLOW_DIR = Path('workflows')
WORKFLOW_DIR.mkdir(exist_ok=True)

@router.post('/run')
def run_workflow(graph: dict):
    return execute_workflow(graph)

@router.post('/save')
def save_workflow(payload: dict):
    """Save a workflow graph to disk."""
    name = payload.get("name")
    graph = payload.get("graph")
    if not name or not graph:
        raise HTTPException(status_code=400, detail="Missing name or graph")
    path = WORKFLOW_DIR / f"{name}.json"
    path.write_text(json.dumps(graph, indent=2))
    return {"status": "saved", "name": name}


@router.post('/load')
def load_workflow(payload: dict):
    """Load a workflow graph from disk."""
    name = payload.get("name")
    if not name:
        raise HTTPException(status_code=400, detail="Missing name")
    path = WORKFLOW_DIR / f"{name}.json"
    if not path.exists():
        raise HTTPException(status_code=404, detail="Workflow not found")
    return json.loads(path.read_text())

@router.get('/{name}')
def get_workflow(name: str):
    path = WORKFLOW_DIR / f"{name}.json"
    if not path.exists():
        raise HTTPException(status_code=404, detail="Workflow not found")
    return json.loads(path.read_text())
