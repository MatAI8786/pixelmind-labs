import os
import asyncio
import yaml
from typing import Any, Dict

from agents.design.layout_agent import LayoutAgent
from agents.design.logo_agent import LogoAgent
from agents.dev.frontend_agent import FrontendAgent
from agents.dev.deploy_agent import DeployAgent
from agents.content.copywriter_agent import CopywriterAgent
from agents.content.seo_agent import SEOAgent
from agents.research.scraper_agent import ScraperAgent
from agents.branding.branding_agent import BrandingAgent
from agents.client_comms.client_comms_agent import ClientCommsAgent

AGENTS = {
    "layout": LayoutAgent(),
    "logo": LogoAgent(),
    "frontend": FrontendAgent(),
    "deploy": DeployAgent(),
    "copy": CopywriterAgent(),
    "seo": SEOAgent(),
    "scraper": ScraperAgent(),
    "branding": BrandingAgent(),
    "client_comms": ClientCommsAgent(),
}

CONFIG_PATH = "orchestrator/agent_configs"


async def run_agent(agent_key: str, task: Dict[str, Any]) -> Dict[str, Any]:
    agent = AGENTS[agent_key]
    return agent.execute(task)


def load_config() -> Dict[str, Any]:
    configs = {}
    if not os.path.isdir(CONFIG_PATH):
        return configs
    for fname in os.listdir(CONFIG_PATH):
        if fname.endswith(".yaml"):
            with open(os.path.join(CONFIG_PATH, fname)) as f:
                configs[fname[:-5]] = yaml.safe_load(f)
    return configs


async def orchestrate(job: Dict[str, Any]) -> Dict[str, Any]:
    """Very simple workflow: run agents sequentially."""
    results = {}
    tasks = [
        ("client_comms", {"client_name": job.get("client_name")}),
        ("layout", {}),
        ("logo", {"logo_path": job.get("logo_path")}),
        ("branding", {}),
        ("copy", {"topic": job.get("topic")}),
        ("seo", {}),
        ("frontend", {"title": job.get("title")}),
        ("deploy", {}),
    ]
    for key, params in tasks:
        res = await run_agent(key, params)
        results[key] = res
    return results

def run(job: Dict[str, Any]) -> Dict[str, Any]:
    """Synchronous wrapper for orchestrate."""
    return asyncio.run(orchestrate(job))



if __name__ == "__main__":
    import json
    sample_job = {
        "client_name": "Acme Co",
        "logo_path": "dummy_logo.png",
        "topic": "Acme widgets",
        "title": "Acme Homepage",
    }
    output = asyncio.run(orchestrate(sample_job))
    print(json.dumps(output, indent=2))
