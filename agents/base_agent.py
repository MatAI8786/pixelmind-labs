import json
import os
from datetime import datetime
from typing import Any, Dict

class BaseAgent:
    """Base class for all agents with logging and history support."""

    name: str = "BaseAgent"
    history_dir: str = "history"

    def __init__(self, name: str):
        self.name = name
        os.makedirs(os.path.join(self.history_dir, self.name), exist_ok=True)

    def log(self, data: Dict[str, Any]) -> None:
        """Log JSON data to a history file with timestamp."""
        timestamp = datetime.utcnow().isoformat()
        path = os.path.join(self.history_dir, self.name, f"{timestamp}.json")
        with open(path, "w") as f:
            json.dump(data, f, indent=2)

    def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the given task. Should be implemented by subclasses."""
        raise NotImplementedError
