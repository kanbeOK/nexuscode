"""
NexusCode Demo - Multi-Agent Software Development Pipeline

This script demonstrates the multi-agent workflow.
Run this after setting up your Band.ai agents.

Usage:
    python demo.py "Implement a user authentication system"
"""

import asyncio
import sys
import time
from config import AGENTS, WORKFLOW


def print_header():
    print("\n" + "=" * 70)
    print("  NexusCode - Multi-Agent Software Development Pipeline")
    print("  Band of Agents Hackathon 2026")
    print("=" * 70)


def print_workflow():
    print("\n  Workflow:")
    print("  " + " -> ".join(WORKFLOW).upper())
    print("-" * 70)


def print_agent_info(agent_name):
    config = AGENTS[agent_name]
    print(f"\n  [{agent_name.upper()}]")
    print(f"  Role: {config['role']}")
    print(f"  Model: {config['model']}")
    print(f"  Status: Active")


def simulate_workflow(feature_request: str):
    print_header()
    print(f"\n  Feature Request: {feature_request}")
    print_workflow()

    print("\n  Initializing agents...")
    time.sleep(0.5)

    for agent_name in WORKFLOW:
        print_agent_info(agent_name)
        time.sleep(0.3)

    print("\n" + "-" * 70)
    print("  Agent Collaboration Flow:")
    print("-" * 70)

    steps = [
        ("planner", "Analyzing requirements and creating user stories..."),
        ("architect", "Designing system architecture and API contracts..."),
        ("developer", "Implementing code based on architecture..."),
        ("reviewer", "Reviewing code quality and security..."),
        ("qa", "Creating test plan and executing tests..."),
        ("scribe", "Generating documentation and README...")
    ]

    for agent_name, description in steps:
        print(f"\n  @{agent_name.upper()}")
        print(f"  {description}")
        time.sleep(0.5)

    print("\n" + "-" * 70)
    print("  Workflow Complete!")
    print("-" * 70)

    print("\n  To run with Band.ai integration:")
    print("  1. Set up your Band.ai account at https://app.band.ai")
    print("  2. Register 6 agents (Planner, Architect, Developer, Reviewer, QA, Scribe)")
    print("  3. Update .env with your API keys")
    print("  4. Update agent_config.yaml with agent UUIDs")
    print("  5. Run: python main.py")
    print("  6. Create a chat room in Band.ai and add all agents")
    print("  7. Send a feature request to @Planner")

    print("\n" + "=" * 70)


if __name__ == "__main__":
    if len(sys.argv) > 1:
        request = " ".join(sys.argv[1:])
    else:
        request = "Implement a REST API for task management with CRUD operations"

    simulate_workflow(request)
