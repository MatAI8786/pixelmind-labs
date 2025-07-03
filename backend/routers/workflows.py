from fastapi import APIRouter

router = APIRouter()

@router.post('/execute')
def execute_workflow(payload: dict):
    nodes = payload.get('nodes', [])
    log = [f"ran {n.get('type')}" for n in nodes]
    return {"status": "ok", "log": log}
