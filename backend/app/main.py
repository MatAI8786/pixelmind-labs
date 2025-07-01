from fastapi import FastAPI
from .api import routes_workflows, routes_keys

app = FastAPI(title="PixelMind Labs API")

app.include_router(routes_workflows.router, prefix="/api/workflows", tags=["workflows"])
app.include_router(routes_keys.router, prefix="/api/keys", tags=["keys"])
