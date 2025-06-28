from typing import Any, Dict
import os
from agents.base_agent import BaseAgent

try:
    import openai  # type: ignore
except Exception:  # pragma: no cover - optional dependency
    openai = None

class BrandingAgent(BaseAgent):
    """Creates basic brand guideline snippets."""

    def __init__(self):
        super().__init__(name="BrandingAgent")

    def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        if openai and os.getenv("OPENAI_API_KEY"):
            openai.api_key = os.getenv("OPENAI_API_KEY")
            prompt = "Suggest a simple three-color palette for a modern tech brand. Return as a list of hex codes."
            try:
                resp = openai.ChatCompletion.create(
                    model="gpt-3.5-turbo",
                    messages=[{"role": "user", "content": prompt}],
                )
                palette = [c.strip() for c in resp.choices[0].message.content.split()]  # naive parse
            except Exception:
                palette = ["#000000", "#FFFFFF", "#FF5733"]
        else:
            palette = ["#000000", "#FFFFFF", "#FF5733"]
        response = {"agent": self.name, "palette": palette}
        self.log({"task": task, "response": response})
        return response
