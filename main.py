import asyncio
import logging
from orchestrator import NexusOrchestrator

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


def main():
    logger.info("=" * 60)
    logger.info("NexusCode - Multi-Agent Software Development Pipeline")
    logger.info("=" * 60)
    logger.info("Track 2: Multi-Agent Software Development")
    logger.info("Band of Agents Hackathon 2026")
    logger.info("=" * 60)

    orchestrator = NexusOrchestrator()
    asyncio.run(orchestrator.start())


if __name__ == "__main__":
    main()
