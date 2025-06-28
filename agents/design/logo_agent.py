from typing import Any, Dict
from agents.base_agent import BaseAgent
from tools.logo_processor import process_logo

class LogoAgent(BaseAgent):
    """Simplifies client logos using the logo processor tool."""

    def __init__(self):
        super().__init__(name="LogoAgent")

    def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Simplify logo and return path to processed asset."""
        input_path = task.get("logo_path")
        output_path = process_logo(input_path)
        response = {"agent": self.name, "processed_logo": output_path}
        self.log({"task": task, "response": response})
        return response
