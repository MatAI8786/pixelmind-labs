from fastapi import FastAPI
from .api import routes_workflows, routes_keys, health

app = FastAPI(title="PixelMind Labs API")

app.include_router(routes_workflows.router, prefix="/api/workflows", tags=["workflows"])
app.include_router(routes_keys.router, prefix="/api/keys", tags=["keys"])
app.include_router(health.router, tags=["health"])
