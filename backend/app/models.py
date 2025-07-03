from __future__ import annotations
from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class Workflow(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    graph: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class NodeStatus(SQLModel, table=True):
    provider: str = Field(primary_key=True)
    status: str
    last_checked: Optional[datetime] = None
    last_error: Optional[str] = None
