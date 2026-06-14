"""
NexusCode Demo Script

Demonstrates all major features of the system:
- Multi-agent workflow execution
- Band-only communication
- Adversarial dual review
- Persistent memory and audit trail
- Human gate simulation
- Veto loop example
"""

from __future__ import annotations

import asyncio
import json
import logging
import sys
from typing import Any, Optional

from nexuscore.audit import AuditTrail
from nexuscore.band_channel import BandChannel
from nexuscore.config import load_config
from nexuscore.memory import MemoryStore, MemoryScope
from nexuscore.models import (
    AgentRole,
    ChannelType,
    Task,
    TaskStatus,
    VetoDecision,
    WorkflowPhase,
)
from nexuscore.workflow.veto_loop import VetoLoop, VetoLoopConfig

logger = logging.getLogger(__name__)


def section(title: str) -> None:
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")


def subsection(title: str) -> None:
    print(f"\n  --- {title} ---")


async def demo_memory(memory: MemoryStore) -> None:
    section("PERSISTENT MEMORY DEMO")
    subsection("Storing knowledge")
    entries = [
        ("architecture:pattern", "Agent-based architecture with band channels", ["architecture", "pattern"]),
        ("decision:database", "PostgreSQL for persistent storage - ACID compliance", ["decision", "database"]),
        ("security:auth", "JWT-based authentication with refresh tokens", ["security", "auth"]),
        ("team:convention", "All PRs require dual review before merge", ["team", "convention"]),
        ("project:goal", "Build production-ready multi-agent dev system", ["project", "goal"]),
    ]
    for key, value, tags in entries:
        entry = memory.store(key, value, tags=tags, scope=MemoryScope.PROJECT)
        print(f"    Stored: {entry.key} -> {entry.value[:50]}...")

    subsection("Searching knowledge")
    results = memory.search("architecture agent")
    print(f"    Search 'architecture agent': {len(results)} results")
    for r in results[:3]:
        print(f"      - [{r.key}] {r.value[:60]}...")

    subsection("Tag-based retrieval")
    security_entries = memory.search_by_tags(["security"], scope=MemoryScope.PROJECT)
    print(f"    Security entries: {len(security_entries)}")
    for e in security_entries:
        print(f"      - {e.key}: {e.value[:50]}...")

    subsection("Memory statistics")
    print(f"    Total entries: {memory.count()}")
    print(f"    Project scope: {memory.count(scope=MemoryScope.PROJECT)}")


async def demo_audit(audit: AuditTrail) -> None:
    section("SHA-256 AUDIT TRAIL DEMO")
    subsection("Recording events")
    actions = [
        ("agent", "planner_001", "task_created", {"task_id": "T1", "title": "Design API"}),
        ("agent", "architect_001", "design_complete", {"artifact": "architecture.md"}),
        ("agent", "developer_001", "code_written", {"files": ["src/api.py", "src/models.py"]}),
        ("review", "reviewer_001", "code_approved", {"score": 85}),
        ("review", "red_teamer_001", "vulnerability_found", {"severity": "warning"}),
        ("agent", "qa_001", "tests_passed", {"coverage": 87.5}),
    ]
    for event_type, agent_id, action, data in actions:
        entry = audit.record(event_type, agent_id, action, data)
        print(f"    [{entry.sequence}] {event_type}/{agent_id}: {action}")

    subsection("Verifying integrity")
    is_valid, error = audit.verify_integrity()
    print(f"    Chain valid: {is_valid}")
    if error:
        print(f"    Error: {error}")

    subsection("Querying audit trail")
    agent_entries = audit.query(agent_id="developer_001")
    print(f"    Developer entries: {len(agent_entries)}")

    subsection("Audit summary")
    summary = audit.summary()
    print(f"    Total entries: {summary['total_entries']}")
    print(f"    Event types: {summary['event_counts']}")


async def demo_band_channel(channel: BandChannel) -> None:
    section("BAND-ONLY COMMUNICATION DEMO")
    subsection("Channel-based messaging")
    channel.send(
        sender_id="planner_001",
        sender_role=AgentRole.PLANNER,
        content="@architect_001 Please design the system architecture for our API.",
        channel_id="planning",
        mentions=["architect_001"],
    )
    channel.send(
        sender_id="architect_001",
        sender_role=AgentRole.ARCHITECT,
        content="@developer_001 Here's the architecture spec. Start implementing the core module.",
        channel_id="planning",
        mentions=["developer_001"],
    )
    channel.send(
        sender_id="developer_001",
        sender_role=AgentRole.DEVELOPER,
        content="@reviewer_001 @red_teamer_001 Code is ready for review.",
        channel_id="review",
        mentions=["reviewer_001", "red_teamer_001"],
    )
    print("    Messages sent across channels")

    subsection("Retrieving messages for agents")
    planner_msgs = channel.get_messages_for_agent("planner_001")
    print(f"    Planner messages: {len(planner_msgs)}")
    dev_msgs = channel.get_messages_for_agent("developer_001")
    print(f"    Developer messages: {len(dev_msgs)}")

    subsection("Channel listing")
    channels = channel.list_channels()
    for ch in channels:
        print(f"    [{ch['type']}] {ch['name']}: {ch['message_count']} messages")

    subsection("Channel statistics")
    stats = channel.stats()
    print(f"    Total channels: {stats['channels']}")
    print(f"    Total messages: {stats['total_messages']}")


async def demo_veto_loop() -> None:
    section("VETO LOOP DEMO")
    subsection("Adversarial review with veto")
    config = VetoLoopConfig(max_rounds=3, require_evidence=True)
    veto_loop = VetoLoop(artifact_id="code_module_001", config=config)

    print("    Round 1: Red teamer finds issues")
    veto1 = VetoDecision(
        agent_id="red_teamer_001",
        artifact_id="code_module_001",
        reason="SQL injection vulnerability in query builder",
        confidence=0.92,
        evidence=[
            "Line 45: f-string used in SQL query",
            "No parameterized query used",
            "Similar pattern flagged in OWASP Top 10",
        ],
        severity="critical",
    )
    veto_loop.submit_veto(veto1)

    counter = VetoDecision(
        agent_id="developer_001",
        artifact_id="code_module_001",
        reason="Input is already sanitized by middleware",
        confidence=0.6,
        evidence=["Sanitization middleware applied at route level"],
        is_counter_proposal=True,
        severity="info",
    )
    veto_loop.submit_counter_proposal(counter)

    resolution = veto_loop.resolve_round()
    print(f"    Resolution: {resolution['status']}")
    print(f"    Reason: {resolution['reason']}")

    subsection("Veto loop summary")
    summary = veto_loop.summary()
    print(f"    Status: {summary['status']}")
    print(f"    Rounds: {summary['total_rounds']}")
    print(f"    Total vetoes: {summary['total_vetoes']}")

    subsection("Evidence summary")
    evidence = veto_loop.get_evidence_summary()
    for e in evidence:
        print(f"    Round {e['round']}: [{e['severity']}] {e['reason'][:60]}")


async def demo_agents() -> None:
    section("AGENT DEMO")
    from nexuscore.agents.planner import PlannerAgent
    from nexuscore.agents.architect import ArchitectAgent
    from nexuscore.agents.developer import DeveloperAgent
    from nexuscore.agents.reviewer import ReviewerAgent
    from nexuscore.agents.red_teamer import RedTeamerAgent
    from nexuscore.agents.verifier import VerifierAgent

    subsection("Planner Agent")
    planner = PlannerAgent()
    planner.initialize()
    task = Task(title="Build REST API", description="Create a REST API with authentication")
    plan = await planner.think({"task": task.model_dump()})
    print(f"    Decomposed into {len(plan.get('subtasks', []))} subtasks")
    for st in plan.get("subtasks", []):
        print(f"      - [{st.get('priority', 'medium')}] {st.get('title', 'N/A')}")

    subsection("Developer Agent")
    developer = DeveloperAgent()
    developer.initialize()
    dev_plan = await developer.think({"task": task.model_dump()})
    artifacts = await developer.act(dev_plan)
    print(f"    Generated {len(artifacts)} artifacts")
    for art in artifacts:
        print(f"      - {art.path} ({art.language}, {len(art.content)} chars)")

    subsection("Dual Review")
    reviewer = ReviewerAgent()
    reviewer.initialize()
    reviewer_results = await reviewer.act({"artifacts": [a.model_dump() for a in artifacts]})
    print(f"    Cooperative review: {len(reviewer_results)} result(s)")
    for r in reviewer_results:
        print(f"      Verdict: {r.verdict.value} | Issues: {len(r.issues)}")

    red_teamer = RedTeamerAgent()
    red_teamer.initialize()
    red_team_results = await red_teamer.act({"artifacts": [a.model_dump() for a in artifacts]})
    print(f"    Red-team review: {len(red_team_results)} result(s)")
    for r in red_team_results:
        print(f"      Verdict: {r.verdict.value} | Issues: {len(r.issues)}")

    subsection("Evidence Verification")
    verifier = VerifierAgent()
    verifier.initialize()
    verify_results = await verifier.act({"artifacts": [a.model_dump() for a in artifacts]})
    print(f"    Verification: {len(verify_results)} result(s)")
    for r in verify_results:
        print(f"      Verdict: {r.verdict.value} | Issues: {len(r.issues)}")


async def demo_human_gate() -> None:
    section("HUMAN GATE DEMO")
    from nexuscore.agents.human_gate import HumanGateAgent

    gate = HumanGateAgent()
    gate.initialize()

    request = gate.request_approval(
        question="Should we deploy to production?",
        options=["Deploy", "Hold", "Rollback"],
        context="All tests passed. Security review clean.",
        timeout=300,
        default="Hold",
    )
    print(f"    Gate request created: {request.id}")
    print(f"    Question: {request.question}")
    print(f"    Options: {request.options}")
    print(f"\n{gate.format_gate_for_display(request)}")

    gate.respond(request.id, "Deploy")
    print(f"    Response submitted: {request.response}")
    print(f"    Status: {request.status.value}")

    summary = gate.summary()
    print(f"    Gate summary: {summary}")


async def run_demo(nexus: Optional[Any] = None) -> None:
    print("\n" + "="*60)
    print("  NexusCode Demo - Multi-Agent Development System")
    print("  Band of Agents Hackathon 2026")
    print("="*60)

    if nexus is None:
        from nexuscore.main import NexusCore
        nexus = NexusCore()
        nexus.initialize()

    await demo_memory(nexus.memory)
    await demo_audit(nexus.audit)
    await demo_band_channel(nexus.channel)
    await demo_veto_loop()
    await demo_agents()
    await demo_human_gate()

    section("SYSTEM STATUS")
    status = nexus.status()
    print(json.dumps(status, indent=2))

    section("DEMO COMPLETE")
    print("  All features demonstrated successfully.")
    print("  NexusCode is ready for the Band of Agents Hackathon 2026.")
    print("="*60)


async def main() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
    )
    await run_demo()


if __name__ == "__main__":
    asyncio.run(main())
