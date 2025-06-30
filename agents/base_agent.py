import json
from typing import Any, Dict

from tools.file_utils import ensure_history_dir, safe_timestamp, HISTORY_DIR

class BaseAgent:
    """Base class for all agents with logging and history support."""

    name: str = "BaseAgent"
    history_dir: str = str(HISTORY_DIR)

    def __init__(self, name: str):
        self.name = name
        ensure_history_dir(self.name)

    def log(self, data: Dict[str, Any]) -> None:
        """Log JSON data to a history file with timestamp."""
        timestamp = safe_timestamp()
        path = HISTORY_DIR / self.name / f"{timestamp}.json"
        with open(path, "w") as f:
            json.dump(data, f, indent=2)

    def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the given task. Should be implemented by subclasses."""
        raise NotImplementedError
