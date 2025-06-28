from typing import Any, Dict
from agents.base_agent import BaseAgent

class ClientCommsAgent(BaseAgent):
    """Handles simple onboarding communication messages."""

    def __init__(self):
        super().__init__(name="ClientCommsAgent")

    def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        client_name = task.get("client_name", "Client")
        message = f"Hello {client_name}, your project is underway!"
        response = {"agent": self.name, "message": message}
        self.log({"task": task, "response": response})
        return response
