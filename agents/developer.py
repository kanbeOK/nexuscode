from .base import BaseAgent
from config import AGENTS


class DeveloperAgent(BaseAgent):
    def __init__(self):
        config = AGENTS["developer"]
        super().__init__(
            agent_name="developer",
            system_prompt=config["system_prompt"],
            model=config["model"]
        )
