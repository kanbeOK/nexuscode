"""
NexusCode 2.0 Demo - Enhanced with ChatDev Patterns

Demonstrates:
1. Virtual company structure
2. Chat Chain workflow
3. Memory system
4. Phase-based execution
"""

import json
import sys
import time
from nexus_company import NexusCompany, CompanyRole, create_demo_company


def print_header():
    print("\n" + "=" * 70)
    print("  NexusCode 2.0 - Virtual Software Company")
    print("  Inspired by ChatDev + Band.ai Integration")
    print("=" * 70)


def print_company_info(company: NexusCompany):
    print(f"\n  Company: {company.company_name}")
    print(f"  Agents: {len(company.agents)}")
    print(f"  Active Projects: {len(company.active_tasks)}")


def print_agent_roster(company: NexusCompany):
    print("\n  Agent Roster:")
    print("  " + "-" * 50)
    for role, agent in company.agents.items():
        print(f"  {role.value.upper():12} | {agent['name']}")
    print("  " + "-" * 50)


def print_phase_result(phase_num: int, result: dict):
    print(f"\n  Phase {phase_num}: {result['phase_type'].upper()}")
    print(f"  Agents: {', '.join(result['agents_involved'])}")
    print(f"  Output: {json.dumps(result['output'], indent=4)}")


def run_full_demo():
    print_header()

    # Create company
    company = create_demo_company()
    print_company_info(company)
    print_agent_roster(company)

    # Create project
    print("\n" + "=" * 70)
    print("  Creating Project: User Authentication System")
    print("=" * 70)

    chain = company.create_project("Build a user authentication system with JWT tokens, role-based access control, and password reset")

    print(f"\n  Project ID: {chain.task_id}")
    print(f"  Phases: {len(chain.phases)}")

    # Execute all phases
    print("\n" + "=" * 70)
    print("  Executing Development Phases")
    print("=" * 70)

    for i in range(1, len(chain.phases) + 1):
        result = company.execute_phase(chain, i)
        print_phase_result(i, result)
        time.sleep(0.5)

    # Get final status
    print("\n" + "=" * 70)
    print("  Project Status")
    print("=" * 70)

    status = company.get_project_status(chain)
    print(f"\n  Task ID: {status['task_id']}")
    print(f"  Progress: {status['progress']} ({status['percentage']:.0f}%)")
    print(f"  Current Phase: {status['current_phase']}")

    print("\n  Phase Details:")
    for phase in status['phases']:
        status_icon = "[OK]" if phase['status'] == 'completed' else "[  ]"
        print(f"    {status_icon} Phase {phase['id']}: {phase['type']}")

    # Show band integration instructions
    print("\n" + "=" * 70)
    print("  Band.ai Integration")
    print("=" * 70)
    print("""
  To run with Band.ai:

  1. Register agents on https://app.band.ai
     - Create 9 agents (CEO, CTO, Tech Lead, Planner, Architect,
       Developer, Reviewer, QA, Scribe)
     - Copy API keys and UUIDs

  2. Update configuration:
     - Edit .env with your API keys
     - Edit agent_config.yaml with agent UUIDs

  3. Run the system:
     python main.py

  4. Create a chat room on Band.ai
     - Add all 9 agents
     - Send: @CEO Build a user authentication system

  5. Watch agents collaborate through Band!
    """)

    print("=" * 70)
    print("  Demo Complete!")
    print("=" * 70)


def run_interactive_demo():
    print_header()
    print("\n  Interactive Mode")
    print("  Type 'quit' to exit\n")

    company = create_demo_company()

    while True:
        user_input = input("\n  You: ").strip()

        if user_input.lower() in ['quit', 'exit', 'q']:
            print("\n  Goodbye!")
            break

        if user_input.lower() == 'status':
            if company.chat_chains:
                chain = company.chat_chains[-1]
                status = company.get_project_status(chain)
                print(f"\n  Status: {json.dumps(status, indent=2)}")
            else:
                print("\n  No active projects")
            continue

        if user_input.lower() == 'agents':
            print_agent_roster(company)
            continue

        # Create new project
        chain = company.create_project(user_input)
        print(f"\n  Created project: {chain.task_id}")

        # Execute all phases
        for i in range(1, len(chain.phases) + 1):
            result = company.execute_phase(chain, i)
            print(f"\n  Phase {i} ({result['phase_type']}): Completed")

        status = company.get_project_status(chain)
        print(f"\n  Project completed! Progress: {status['percentage']:.0f}%")


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--interactive":
        run_interactive_demo()
    else:
        run_full_demo()
