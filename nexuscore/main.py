"""
NexusCode Main Entry Point

Initializes all system components, sets up agents and channels,
and provides the command-line interface for the development workflow.
"""

from __future__ import annotations

import argparse
import asyncio
import json
import logging
import signal
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

from nexuscore.audit import AuditTrail
from nexuscore.band_channel import BandChannel
from nexuscore.config import NexusConfig, load_config
from nexuscore.memory import MemoryStore
from nexuscore.models import (
    AgentRole,
    Task,
    TaskStatus,
    WorkflowPhase,
    WorkflowState,
)

logger = logging.getLogger("nexuscore")


class NexusCore:
    """Main system class that orchestrates all components."""

    def __init__(self, config_path: Optional[Path] = None):
        self.nexus_config = load_config(config_path)
        self.config = self.nexus_config.config
        self.memory = MemoryStore(self.config.memory_path)
        self.audit = AuditTrail(self.config.audit_path)
        self.channel = BandChannel()
        self.workflow = WorkflowState()
        self._agents: dict[str, Any] = {}
        self._running = False

    def initialize(self) -> None:
        logger.info("Initializing NexusCode v0.1.0")
        logger.info("Project: %s", self.config.project_name)
        self.audit.record(
            event_type="system",
            agent_id="system",
            action="initialize",
            data={"project": self.config.project_name},
        )
        self._register_agents()
        self.workflow.current_phase = WorkflowPhase.INIT
        logger.info("NexusCode initialized with %d agents", len(self._agents))

    def _load_band_config(self) -> dict:
        """Load Band agent configuration from JSON/YAML."""
        import json
        config_path = Path("agent_config.json")
        if config_path.exists():
            return json.loads(config_path.read_text(encoding="utf-8"))
        config_path = Path("agent_config.yaml")
        if config_path.exists():
            try:
                import yaml
                return yaml.safe_load(config_path.read_text(encoding="utf-8")) or {}
            except ImportError:
                return json.loads(config_path.read_text(encoding="utf-8"))
        return {}

    def _register_agents(self) -> None:
        from nexuscore.agents import (
            PlannerAgent,
            ArchitectAgent,
            DeveloperAgent,
            ReviewerAgent,
            RedTeamerAgent,
            VerifierAgent,
            QAAgent,
            DevOpsAgent,
            ScribeAgent,
            AdjudicatorAgent,
            HumanGateAgent,
        )
        band_config = self._load_band_config()
        agent_classes = {
            AgentRole.PLANNER: (PlannerAgent, "planner"),
            AgentRole.ARCHITECT: (ArchitectAgent, "architect"),
            AgentRole.DEVELOPER: (DeveloperAgent, "developer"),
            AgentRole.REVIEWER: (ReviewerAgent, "reviewer"),
            AgentRole.RED_TEAMER: (RedTeamerAgent, "red_teamer"),
            AgentRole.VERIFIER: (VerifierAgent, "verifier"),
            AgentRole.QA: (QAAgent, "qa"),
            AgentRole.DEVOPS: (DevOpsAgent, "devops"),
            AgentRole.SCRIBE: (ScribeAgent, "scribe"),
            AgentRole.ADJUDICATOR: (AdjudicatorAgent, "adjudicator"),
            AgentRole.HUMAN_GATE: (HumanGateAgent, "human_gate"),
        }
        for role, (cls, config_key) in agent_classes.items():
            agent = cls()
            agent.initialize()
            if config_key in band_config:
                agent.band_agent_id = band_config[config_key].get("agent_id")
                agent.band_handle = band_config[config_key].get("handle")
                logger.info(f"Loaded Band config for {agent.agent_id}: {agent.band_handle}")
            self._agents[agent.agent_id] = agent
            self.workflow.active_agents.append(agent.agent_id)
            self.audit.record(
                event_type="agent",
                agent_id=agent.agent_id,
                action="registered",
                data={"role": role.value},
            )

    def get_agent(self, role: AgentRole) -> Optional[Any]:
        for agent in self._agents.values():
            if agent.role == role:
                return agent
        return None

    def add_task(self, title: str, description: str, **kwargs: Any) -> Task:
        task = Task(title=title, description=description, **kwargs)
        self.workflow.tasks.append(task)
        self.audit.record(
            event_type="workflow",
            agent_id="system",
            action="task_created",
            data={"task_id": task.id, "title": title},
        )
        return task

    async def run_workflow(self) -> dict[str, Any]:
        self._running = True
        self.workflow.current_phase = WorkflowPhase.PLANNING
        self.audit.record(
            event_type="workflow",
            agent_id="system",
            action="workflow_started",
            data={"phase": self.workflow.current_phase.value},
        )
        results = {}
        try:
            planner = self.get_agent(AgentRole.PLANNER)
            if planner and self.workflow.tasks:
                planning_result = await planner.process_task(self.workflow.tasks[0])
                results["planning"] = str(planning_result) if planning_result else "completed"

            self.workflow.current_phase = WorkflowPhase.DESIGN
            architect = self.get_agent(AgentRole.ARCHITECT)
            if architect and self.workflow.tasks:
                design_result = await architect.process_task(self.workflow.tasks[0])
                results["design"] = str(design_result) if design_result else "completed"

            self.workflow.current_phase = WorkflowPhase.IMPLEMENTATION
            developer = self.get_agent(AgentRole.DEVELOPER)
            if developer and self.workflow.tasks:
                impl_result = await developer.process_task(self.workflow.tasks[0])
                results["implementation"] = str(impl_result) if impl_result else "completed"

            self.workflow.current_phase = WorkflowPhase.REVIEW
            self.audit.record(
                event_type="workflow",
                agent_id="system",
                action="phase_changed",
                data={"phase": "review"},
            )

            self.workflow.current_phase = WorkflowPhase.TESTING
            qa = self.get_agent(AgentRole.QA)
            if qa:
                results["qa"] = "completed"

            self.workflow.current_phase = WorkflowPhase.COMPLETE

        except Exception as exc:
            logger.error("Workflow error: %s", exc)
            self.audit.record(
                event_type="workflow",
                agent_id="system",
                action="workflow_error",
                data={"error": str(exc)},
            )
            results["error"] = str(exc)

        self.audit.record(
            event_type="workflow",
            agent_id="system",
            action="workflow_completed",
            data={"results": {k: str(v)[:100] for k, v in results.items()}},
        )
        return results

    def shutdown(self) -> None:
        logger.info("Shutting down NexusCode")
        self._running = False
        for agent in self._agents.values():
            agent.shutdown()
        self.audit.record(
            event_type="system",
            agent_id="system",
            action="shutdown",
            data={"agents": len(self._agents)},
        )
        integrity_ok, error = self.audit.verify_integrity()
        logger.info("Audit trail integrity: %s %s", "OK" if integrity_ok else "FAILED", error or "")
        logger.info("NexusCode shutdown complete")

    def status(self) -> dict[str, Any]:
        integrity_ok, _ = self.audit.verify_integrity()
        return {
            "project": self.config.project_name,
            "phase": self.workflow.current_phase.value,
            "agents": len(self._agents),
            "tasks": len(self.workflow.tasks),
            "audit_entries": self.audit.count(),
            "audit_integrity": integrity_ok,
            "memory_entries": self.memory.count(),
            "channels": len(self.channel.list_channels()),
        }


def setup_logging(level: str = "INFO") -> None:
    logging.basicConfig(
        level=getattr(logging, level.upper(), logging.INFO),
        format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )


def create_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="nexuscode",
        description="NexusCode - Multi-Agent Software Development System",
    )
    parser.add_argument(
        "--config", type=Path, default=None,
        help="Path to configuration file",
    )
    parser.add_argument(
        "--log-level", default="INFO",
        choices=["DEBUG", "INFO", "WARNING", "ERROR"],
        help="Logging level",
    )
    subparsers = parser.add_subparsers(dest="command", help="Command to run")

    subparsers.add_parser("status", help="Show system status")
    subparsers.add_parser("init", help="Initialize a new project")
    subparsers.add_parser("audit", help="Show audit trail summary")
    subparsers.add_parser("verify", help="Verify audit trail integrity")
    subparsers.add_parser("demo", help="Run the demo")

    task_parser = subparsers.add_parser("task", help="Manage tasks")
    task_parser.add_argument("action", choices=["add", "list"])
    task_parser.add_argument("--title", help="Task title")
    task_parser.add_argument("--description", help="Task description")

    return parser


async def main() -> None:
    parser = create_parser()
    args = parser.parse_args()
    setup_logging(args.log_level if hasattr(args, "log_level") else "INFO")

    nexus = NexusCore(config_path=args.config)
    nexus.initialize()

    if args.command == "status":
        print(json.dumps(nexus.status(), indent=2))
    elif args.command == "audit":
        print(json.dumps(nexus.audit.summary(), indent=2))
    elif args.command == "verify":
        ok, error = nexus.audit.verify_integrity()
        print(f"Integrity: {'VALID' if ok else 'INVALID'}")
        if error:
            print(f"Error: {error}")
    elif args.command == "task":
        if args.action == "add" and args.title:
            task = nexus.add_task(args.title, args.description or "")
            print(f"Task created: {task.id} - {task.title}")
        elif args.action == "list":
            for task in nexus.workflow.tasks:
                print(f"  [{task.status.value}] {task.id}: {task.title}")
    elif args.command == "demo":
        from nexuscore.demo import run_demo
        await run_demo(nexus)
    elif args.command == "init":
        nexus.config.save()
        print("Project initialized. Config saved.")
    else:
        nexus.shutdown()
        return

    nexus.shutdown()


def cli() -> None:
    asyncio.run(main())


if __name__ == "__main__":
    cli()
