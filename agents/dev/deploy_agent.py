from typing import Any, Dict
from agents.base_agent import BaseAgent

class DeployAgent(BaseAgent):
    """Prepares deployment artifacts."""

    def __init__(self):
        super().__init__(name="DeployAgent")

    def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        artifact = {
            "dockerfile": "FROM nginx:alpine\nCOPY . /usr/share/nginx/html"
        }
        response = {"agent": self.name, "artifact": artifact}
        self.log({"task": task, "response": response})
        return response
