from typing import Any, Dict
from agents.base_agent import BaseAgent

class SEOAgent(BaseAgent):
    """Provides basic SEO keyword suggestions."""

    def __init__(self):
        super().__init__(name="SEOAgent")

    def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        keywords = ["ai web design", "digital marketing", "automation"]
        response = {"agent": self.name, "keywords": keywords}
        self.log({"task": task, "response": response})
        return response
