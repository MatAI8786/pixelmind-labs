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
def save_workflow(graph: dict, name: str):
    path = WORKFLOW_DIR / f"{name}.json"
    path.write_text(json.dumps(graph, indent=2))
    return {"status": "saved", "name": name}

@router.get('/{name}')
def get_workflow(name: str):
    path = WORKFLOW_DIR / f"{name}.json"
    if not path.exists():
        raise HTTPException(status_code=404, detail="Workflow not found")
    return json.loads(path.read_text())
