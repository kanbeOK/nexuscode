from .base import BaseAgent
from config import AGENTS


class ReviewerAgent(BaseAgent):
    def __init__(self):
        config = AGENTS["reviewer"]
        super().__init__(
            agent_name="reviewer",
            system_prompt=config["system_prompt"],
            model=config["model"]
        )
