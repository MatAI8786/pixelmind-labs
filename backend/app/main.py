from fastapi import FastAPI
from .api import (
    routes_workflows,
    routes_keys,
    routes_health,
    routes_llm,
    routes_nodes,
)

app = FastAPI(title="PixelMind Labs API")

app.include_router(routes_workflows.router, prefix="/api/workflows", tags=["workflows"])
app.include_router(routes_keys.router, prefix="/api/keys", tags=["keys"])
app.include_router(routes_health.router, prefix="/api", tags=["health"])
app.include_router(routes_llm.router, prefix="/api/llm", tags=["llm"])
app.include_router(routes_nodes.router, prefix="/api", tags=["nodes"])
