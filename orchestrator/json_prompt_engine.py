import json
from jsonschema import validate, ValidationError
from typing import Dict, Any

SCHEMA = {
    "type": "object",
    "properties": {
        "agent": {"type": "string"},
    },
    "required": ["agent"],
}


def enforce_json(text: str) -> Dict[str, Any]:
    """Ensure the provided text is valid JSON according to SCHEMA."""
    try:
        data = json.loads(text)
        validate(instance=data, schema=SCHEMA)
        return data
    except (json.JSONDecodeError, ValidationError):
        return {"error": "Invalid JSON"}
