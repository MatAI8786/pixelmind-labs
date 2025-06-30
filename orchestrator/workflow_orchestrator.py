import os
import sys
import asyncio
import json
from pathlib import Path
import yaml
from typing import Any, Dict, Callable, List
from jsonschema import validate

# Ensure project root is on sys.path so "agents" package can be imported when
# running this file directly (e.g. ``python orchestrator/workflow_orchestrator.py``).
ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

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


WORKFLOW_SCHEMA = {
    "type": "object",
    "properties": {
        "department": {"type": "string"},
        "nodes": {"type": "array"},
        "settings": {"type": "object"},
    },
    "required": ["department", "nodes"],
}


def load_workflow(path: str) -> Dict[str, Any]:
    """Load and validate a workflow JSON file."""
    with open(path, "r") as f:
        data = json.load(f)
    validate(instance=data, schema=WORKFLOW_SCHEMA)
    return data


def execute_workflow(workflow: Dict[str, Any], user_input: str = "") -> Dict[str, Any]:
    """Execute workflow defined by nodes."""
    nodes: Dict[str, Dict[str, Any]] = {n["id"]: n for n in workflow["nodes"]}
    outputs: Dict[str, Any] = {}

    def run_node(node_id: str) -> None:
        node = nodes[node_id]
        ntype = node["type"]
        cfg = node.get("config", {})

        if ntype == "Trigger":
            pass
        elif ntype == "PersonaSelector":
            persona = cfg.get("selected") or cfg.get("personalities", ["default"])[0]
            outputs[node_id] = persona
        elif ntype == "LLMNode":
            prompt = cfg.get("prompt_template", "").replace("{persona}", outputs.get("select_persona", "")).replace("{{input}}", user_input)
            if cfg.get("provider", "").lower() == "openai":
                import openai

                if "OPENAI_API_KEY" not in os.environ:
                    text = "[openai stub]" + prompt[:20]
                elif hasattr(openai, "chat"):
                    resp = openai.chat.completions.create(
                        model=cfg.get("model", "gpt-3.5-turbo"),
                        messages=[{"role": "user", "content": prompt}],
                    )
                    text = resp.choices[0].message.content
                else:
                    resp = openai.ChatCompletion.create(
                        model=cfg.get("model", "gpt-3.5-turbo"),
                        messages=[{"role": "user", "content": prompt}],
                    )
                    text = resp.choices[0].message.content
            else:
                text = prompt
            outputs[node_id] = text
        elif ntype == "Gate":
            allow = True
            for cond in cfg.get("conditions", []):
                node_out = outputs.get(cond["node"], "")
                if cond.get("contains") not in node_out:
                    allow = False
            if not allow:
                return
        elif ntype == "AggregatorNode":
            text = cfg.get("template", "")
            for k, v in outputs.items():
                text = text.replace(f"{{{{outputs.{k}}}}}", str(v))
            outputs[node_id] = text
        elif ntype == "Output":
            src = node.get("inputs", [])[0]
            final = outputs.get(src, "")
            if workflow.get("settings", {}).get("json_mode"):
                from orchestrator.json_prompt_engine import enforce_json

                final = enforce_json(final)
            print(final)
            if workflow.get("settings", {}).get("save_history"):
                p = Path(workflow["settings"]["save_history"])
                p.parent.mkdir(parents=True, exist_ok=True)
                p.write_text(json.dumps(final, indent=2))
            outputs[node_id] = final

        for nxt in node.get("outputs", []):
            run_node(nxt)

    run_node("start")
    return outputs



if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="PixelMind Workflow Orchestrator")
    sub = parser.add_subparsers(dest="command")
    wf_cmd = sub.add_parser("load_workflow", help="Execute workflow from JSON")
    wf_cmd.add_argument("path", help="Path to workflow JSON")

    args = parser.parse_args()

    if args.command == "load_workflow":
        wf = load_workflow(args.path)
        result = execute_workflow(wf)
        print(json.dumps(result, indent=2))
    else:
        sample_job = {
            "client_name": "Acme Co",
            "logo_path": "dummy_logo.png",
            "topic": "Acme widgets",
            "title": "Acme Homepage",
        }
        output = asyncio.run(orchestrate(sample_job))
        print(json.dumps(output, indent=2))
