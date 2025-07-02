from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from colorama import init as colorama_init
import uvicorn
from .api import (
    routes_workflows,
    routes_keys,
    routes_health,
    routes_llm,
    routes_nodes,
    routes_gemini,
    routes_anthropic,
    routes_tiktok,
    routes_gmail,
    routes_bscscan,
    routes_facebook,
    routes_paypal,
    routes_binance,
)

colorama_init(autoreset=True)
logging.basicConfig(level=logging.INFO, format="%(levelname)s:%(message)s")
uvicorn.config.LOGGING_CONFIG["formatters"]["access"]["colorize"] = True

app = FastAPI(title="PixelMind Labs API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routes_workflows.router, prefix="/api/workflows", tags=["workflows"])
app.include_router(routes_keys.router, prefix="/api/keys", tags=["keys"])
app.include_router(routes_health.router, prefix="/api", tags=["health"])
app.include_router(routes_llm.router, prefix="/api/llm", tags=["llm"])
app.include_router(routes_nodes.router, prefix="/api", tags=["nodes"])
app.include_router(routes_gemini.router)
app.include_router(routes_anthropic.router)
app.include_router(routes_tiktok.router)
app.include_router(routes_gmail.router)
app.include_router(routes_bscscan.router)
app.include_router(routes_facebook.router)
app.include_router(routes_paypal.router)
app.include_router(routes_binance.router)
