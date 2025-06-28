import requests
from bs4 import BeautifulSoup
from typing import Any, Dict
from agents.base_agent import BaseAgent

class ScraperAgent(BaseAgent):
    """Scrapes web pages for competitor design trends."""

    def __init__(self):
        super().__init__(name="ScraperAgent")

    def execute(self, task: Dict[str, Any]) -> Dict[str, Any]:
        url = task.get("url")
        resp = requests.get(url, timeout=10)
        soup = BeautifulSoup(resp.text, "html.parser")
        title = soup.title.string if soup.title else ""
        response = {"agent": self.name, "title": title}
        self.log({"task": task, "response": response})
        return response
