"""
NexusCode 2.0 - Main Entry Point

Multi-Agent Software Development Pipeline
Inspired by ChatDev + Band.ai Integration
"""

import asyncio
import sys
from nexus_company import NexusCompany, CompanyRole, create_demo_company


async def main():
    print("=" * 70)
    print("  NexusCode 2.0 - Virtual Software Company")
    print("  Band of Agents Hackathon 2026")
    print("=" * 70)

    company = create_demo_company()

    print(f"\n  Company: {company.company_name}")
    print(f"  Agents: {len(company.agents)}")

    # Get project description from user or use default
    if len(sys.argv) > 1:
        project_desc = " ".join(sys.argv[1:])
    else:
        project_desc = "Build a user authentication system with JWT tokens"

    print(f"\n  Project: {project_desc}")

    # Create and execute project
    chain = company.create_project(project_desc)

    print(f"\n  Project ID: {chain.task_id}")
    print(f"  Phases: {len(chain.phases)}")

    # Execute all phases
    for i in range(1, len(chain.phases) + 1):
        result = company.execute_phase(chain, i)
        print(f"\n  Phase {i} ({result['phase_type']}): Completed")

    # Get final status
    status = company.get_project_status(chain)
    print(f"\n  Progress: {status['progress']} ({status['percentage']:.0f}%)")
    print("\n" + "=" * 70)
    print("  Project Complete!")
    print("=" * 70)


if __name__ == "__main__":
    asyncio.run(main())
