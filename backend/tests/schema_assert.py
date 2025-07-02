import json
from jsonschema import validate
from app.api.models import Workflow

SCHEMA = Workflow.model_json_schema()


def test_fixture_matches_schema():
    with open('test_workflow_minimal.json') as f:
        data = json.load(f)
    validate(instance=data, schema=SCHEMA)
