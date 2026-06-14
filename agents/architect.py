from .base import BaseAgent
from config import AGENTS


class ArchitectAgent(BaseAgent):
    def __init__(self):
        config = AGENTS["architect"]
        super().__init__(
            agent_name="architect",
            system_prompt=config["system_prompt"],
            model=config["model"]
        )
