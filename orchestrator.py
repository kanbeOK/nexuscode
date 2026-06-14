import asyncio
import logging
from typing import List
from agents import (
    PlannerAgent,
    ArchitectAgent,
    DeveloperAgent,
    ReviewerAgent,
    QAAgent,
    ScribeAgent
)
from config import AGENTS, WORKFLOW

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class NexusOrchestrator:
    def __init__(self):
        self.agents = {}
        self.workflow = WORKFLOW

    async def initialize_agents(self):
        agent_classes = {
            "planner": PlannerAgent,
            "architect": ArchitectAgent,
            "developer": DeveloperAgent,
            "reviewer": ReviewerAgent,
            "qa": QAAgent,
            "scribe": ScribeAgent
        }

        for agent_name in self.workflow:
            agent_class = agent_classes[agent_name]
            agent = agent_class()
            await agent.initialize()
            self.agents[agent_name] = agent
            logger.info(f"Initialized {agent_name} agent")

    async def run_all_agents(self):
        tasks = []
        for agent_name, agent in self.agents.items():
            tasks.append(agent.run())
            logger.info(f"Starting {agent_name} agent")

        await asyncio.gather(*tasks)

    async def start(self):
        logger.info("Starting NexusCode Multi-Agent System...")
        logger.info(f"Workflow: {' -> '.join(self.workflow)}")

        await self.initialize_agents()
        await self.run_all_agents()


async def main():
    orchestrator = NexusOrchestrator()
    await orchestrator.start()


if __name__ == "__main__":
    asyncio.run(main())
