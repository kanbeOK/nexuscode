from .base import BaseAgent
from config import AGENTS


class PlannerAgent(BaseAgent):
    def __init__(self):
        config = AGENTS["planner"]
        super().__init__(
            agent_name="planner",
            system_prompt=config["system_prompt"],
            model=config["model"]
        )
