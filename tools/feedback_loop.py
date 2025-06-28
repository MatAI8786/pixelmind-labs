import json
from pathlib import Path
from typing import Dict, Any

FEEDBACK_DB = Path("data/feedback_db.json")
FEEDBACK_DB.parent.mkdir(exist_ok=True)
if not FEEDBACK_DB.exists():
    FEEDBACK_DB.write_text("{}")


def store_feedback(client_id: str, feedback: Dict[str, Any]) -> None:
    db = json.loads(FEEDBACK_DB.read_text())
    db.setdefault(client_id, []).append(feedback)
    FEEDBACK_DB.write_text(json.dumps(db, indent=2))
