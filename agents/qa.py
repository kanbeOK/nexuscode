from .base import BaseAgent
from config import AGENTS


class QAAgent(BaseAgent):
    def __init__(self):
        config = AGENTS["qa"]
        super().__init__(
            agent_name="qa",
            system_prompt=config["system_prompt"],
            model=config["model"]
        )
