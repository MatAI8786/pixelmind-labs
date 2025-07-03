from pydantic import BaseModel, Field
from typing import Any, Dict, List

class WorkflowPayload(BaseModel):
    """Simple workflow schema shared with the frontend."""

    nodes: List[Dict[str, Any]] = Field(default_factory=list)
    edges: List[Dict[str, Any]] = Field(default_factory=list)
