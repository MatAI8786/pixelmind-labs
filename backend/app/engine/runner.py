from typing import Dict, Any


def execute_workflow(graph: Dict[str, Any]):
    # simple sequential execution placeholder
    nodes = graph.get('nodes', [])
    edges = graph.get('edges', [])
    trace = []
    for node in nodes:
        trace.append({"node": node.get('id'), "result": f"executed {node.get('type')}"})
    return {"trace": trace}
