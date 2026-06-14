from .base import BaseAgent
from config import AGENTS


class ScribeAgent(BaseAgent):
    def __init__(self):
        config = AGENTS["scribe"]
        super().__init__(
            agent_name="scribe",
            system_prompt=config["system_prompt"],
            model=config["model"]
        )
