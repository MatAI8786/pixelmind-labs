from typing import Any, Dict
from agents.base_agent import BaseAgent

class CopywriterAgent(BaseAgent):
    """Generates simple marketing copy."""

    def __init__(self):
        super().__init__(name="CopywriterAgent")

    def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        topic = task.get("topic", "your product")
        text = f"Introducing {topic}! The best choice for your needs." \
               "Sign up today!"
        response = {"agent": self.name, "copy": text}
        self.log({"task": task, "response": response})
        return response
