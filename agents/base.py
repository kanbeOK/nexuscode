import asyncio
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    from langchain_openai import ChatOpenAI
    from langgraph.checkpoint.memory import InMemorySaver
    from thenvoi import Agent
    from thenvoi.adapters import LangGraphAdapter
    from thenvoi.config import load_agent_config
    BAND_SDK_AVAILABLE = True
except ImportError:
    BAND_SDK_AVAILABLE = False
    logger.warning("Band SDK not fully installed. Running in demo mode.")


class BaseAgent:
    def __init__(self, agent_name: str, system_prompt: str, model: str = "gpt-4o"):
        self.agent_name = agent_name
        self.system_prompt = system_prompt
        self.model = model
        self.agent = None

    async def initialize(self):
        if not BAND_SDK_AVAILABLE:
            logger.info(f"{self.agent_name} initialized in demo mode")
            return

        agent_id, api_key = load_agent_config(self.agent_name)

        adapter = LangGraphAdapter(
            llm=ChatOpenAI(model=self.model),
            checkpointer=InMemorySaver(),
            custom_section=self.system_prompt,
        )

        self.agent = Agent.create(
            adapter=adapter,
            agent_id=agent_id,
            api_key=api_key,
        )

        logger.info(f"{self.agent_name} agent initialized")

    async def run(self):
        if not self.agent:
            await self.initialize()

        if not BAND_SDK_AVAILABLE:
            logger.info(f"{self.agent_name} running in demo mode (no Band connection)")
            return

        logger.info(f"{self.agent_name} agent is running...")
        await self.agent.run()

    def get_info(self):
        return {
            "name": self.agent_name,
            "model": self.model,
            "role": self.system_prompt.split("\n")[0].strip(),
            "status": "initialized" if self.agent else "not initialized"
        }
