from typing import Any, Dict
import os
from agents.base_agent import BaseAgent

try:
    import openai  # type: ignore
except Exception:  # pragma: no cover - optional dependency
    openai = None

class CopywriterAgent(BaseAgent):
    """Generates simple marketing copy."""

    def __init__(self):
        super().__init__(name="CopywriterAgent")

    def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        topic = task.get("topic", "your product")
        if openai and os.getenv("OPENAI_API_KEY"):
            openai.api_key = os.getenv("OPENAI_API_KEY")
            prompt = f"Write a short marketing copy for {topic}."
            try:
                resp = openai.ChatCompletion.create(
                    model="gpt-3.5-turbo",
                    messages=[{"role": "user", "content": prompt}],
                )
                text = resp.choices[0].message.content.strip()
            except Exception:
                text = f"[LLM error] Introducing {topic}!"
        else:
            text = (
                f"Introducing {topic}! The best choice for your needs. "
                "Sign up today!"
            )
        response = {"agent": self.name, "copy": text}
        self.log({"task": task, "response": response})
        return response
