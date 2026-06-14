"""
NexusCode Backend Server

Run with: python backend/server.py
"""

import asyncio
import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from .api import (
    handle_band_message,
    BAND_CONFIG,
    AGENT_PROMPTS,
    AgentSimulator
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("nexuscode-server")

class NexusCodeServer:
    """Local server for demo and testing."""

    def __init__(self):
        self.agents = {}
        self.conversation_history = []
        self._initialize_agents()

    def _initialize_agents(self):
        """Initialize all 11 agents."""
        for role in ["planner", "architect", "developer", "reviewer",
                     "red_teamer", "verifier", "qa", "devops",
                     "scribe", "adjudicator", "human_gate"]:
            self.agents[role] = AgentSimulator(role)
            logger.info(f"Initialized agent: {role}")

    async def process_message(self, message: str, sender: str = "user") -> list[dict]:
        """Process a user message and get agent responses."""
        responses = []

        # Parse @mentions
        mentions = [word.strip("@") for word in message.split() if word.startswith("@")]

        if mentions:
            # Process mentioned agents
            for mention in mentions:
                role = mention.lower().replace("nexus", "")
                if role in self.agents:
                    response = await handle_band_message(role, message, sender)
                    responses.append(response)
                    self.conversation_history.append(response)
        else:
            # Default to planner
            response = await handle_band_message("planner", message, sender)
            responses.append(response)
            self.conversation_history.append(response)

        return responses

    def get_status(self) -> dict:
        """Get system status."""
        return {
            "agents": len(self.agents),
            "history": len(self.conversation_history),
            "band_config": {k: v.get("handle", "") for k, v in BAND_CONFIG.items()},
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

    def get_history(self) -> list[dict]:
        """Get conversation history."""
        return self.conversation_history

# CLI interface
async def main():
    """Run interactive demo."""
    server = NexusCodeServer()

    print("=" * 60)
    print("  NexusCode Server - Interactive Demo")
    print("=" * 60)
    print(f"\n  Agents: {len(server.agents)}")
    print(f"  Band Handles: {', '.join(f'{k}: {v.get('handle', '')}' for k, v in BAND_CONFIG.items())}")
    print("\n  Commands:")
    print("  - Type a message to start")
    print("  - Use @NexusAgent to mention specific agent")
    print("  - Type 'status' to see system status")
    print("  - Type 'history' to see conversation")
    print("  - Type 'quit' to exit")
    print("=" * 60)

    while True:
        try:
            user_input = input("\n> ").strip()

            if user_input.lower() == "quit":
                break
            elif user_input.lower() == "status":
                print(json.dumps(server.get_status(), indent=2))
                continue
            elif user_input.lower() == "history":
                for entry in server.get_history()[-5:]:
                    print(f"\n[{entry['agent']}] {entry['response'][:100]}...")
                continue
            elif not user_input:
                continue

            responses = await server.process_message(user_input)

            for response in responses:
                print(f"\n[{response['handle']}]")
                print(response['response'])

        except KeyboardInterrupt:
            break
        except Exception as e:
            print(f"Error: {e}")

    print("\nGoodbye!")

if __name__ == "__main__":
    asyncio.run(main())
