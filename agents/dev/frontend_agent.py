from typing import Any, Dict
from agents.base_agent import BaseAgent

class FrontendAgent(BaseAgent):
    """Creates basic HTML/CSS templates."""

    def __init__(self):
        super().__init__(name="FrontendAgent")

    def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        page_title = task.get("title", "Untitled")
        html = f"<html><head><title>{page_title}</title></head><body></body></html>"
        response = {"agent": self.name, "html": html}
        self.log({"task": task, "response": response})
        return response
