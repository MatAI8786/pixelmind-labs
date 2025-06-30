from datetime import datetime
from pathlib import Path

HISTORY_DIR = Path("history")


def safe_timestamp() -> str:
    """Return timestamp string safe for filenames."""
    return datetime.now().strftime("%Y-%m-%d_%H-%M-%S-%f")


def ensure_history_dir(agent_name: str) -> Path:
    """Ensure history directory exists for the given agent and return its path."""
    path = HISTORY_DIR / agent_name
    path.mkdir(parents=True, exist_ok=True)
    return path
