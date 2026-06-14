"""
NexusCode Architect Agent

Responsible for system design, defining interfaces and contracts,
reviewing architectural decisions, and evaluating trade-offs.
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any, Optional

from nexuscore.agents.base_agent import BaseAgent
from nexuscore.models import (
    AgentMessage,
    AgentRole,
    CodeArtifact,
    ReviewResult,
    Task,
    Verdict,
)

logger = logging.getLogger(__name__)


class ArchitectAgent(BaseAgent):
    role = AgentRole.ARCHITECT

    def _default_capabilities(self) -> list[str]:
        return [
            "system_design",
            "interface_definition",
            "trade_off_analysis",
            "architecture_review",
            "technical_specification",
        ]

    def _default_permissions(self) -> list[str]:
        return [
            "design_systems",
            "define_interfaces",
            "review_architecture",
            "write_specifications",
            "reject_designs",
        ]

    async def think(self, context: dict[str, Any]) -> dict[str, Any]:
        task_data = context.get("task", {})
        analysis = {
            "task": task_data,
            "architectural_decisions": [],
            "interfaces": [],
            "trade_offs": [],
            "patterns": [],
            "risks": [],
        }
        description = task_data.get("description", "")
        analysis["architectural_decisions"] = self._suggest_decisions(description)
        analysis["interfaces"] = self._define_interfaces(description)
        analysis["trade_offs"] = self._evaluate_trade_offs(description)
        analysis["patterns"] = self._suggest_patterns(description)
        analysis["risks"] = self._assess_architectural_risks(description)
        return analysis

    async def act(self, plan: dict[str, Any]) -> CodeArtifact:
        spec_content = self._generate_spec(plan)
        artifact = CodeArtifact(
            path="docs/architecture.md",
            content=spec_content,
            language="markdown",
            author_agent_id=self.agent_id,
            task_id=plan.get("task", {}).get("id"),
        )
        return artifact

    async def communicate(self, message: AgentMessage) -> Optional[AgentMessage]:
        self.handle_message(message)
        content = message.content.lower()
        if "design" in content or "architecture" in content:
            return self.send_message(
                "Analyzing the design. I'll provide architectural guidance "
                "and identify key interfaces and patterns.",
                channel_id=message.channel_id or "planning",
                reply_to=message.id,
            )
        elif "review" in content:
            return self.send_message(
                "I'll review the architectural decisions for consistency "
                "and propose improvements where needed.",
                channel_id=message.channel_id or "review",
                reply_to=message.id,
            )
        elif "trade-off" in content or "tradeoff" in content:
            return self.send_message(
                "Let me analyze the trade-offs. I'll document the "
                "pros and cons of each approach.",
                channel_id=message.channel_id or "planning",
                reply_to=message.id,
            )
        return None

    def _suggest_decisions(self, description: str) -> list[dict[str, str]]:
        decisions = []
        desc_lower = description.lower()
        if "api" in desc_lower:
            decisions.append({
                "area": "API Design",
                "decision": "Use RESTful API with versioned endpoints",
                "rationale": "Standard, well-understood pattern for service interfaces",
            })
        if "database" in desc_lower or "data" in desc_lower:
            decisions.append({
                "area": "Data Layer",
                "decision": "Repository pattern with abstract data access",
                "rationale": "Enables testing and future data source changes",
            })
        if "auth" in desc_lower or "security" in desc_lower:
            decisions.append({
                "area": "Authentication",
                "decision": "JWT-based auth with refresh tokens",
                "rationale": "Stateless, scalable, industry standard",
            })
        if "config" in desc_lower:
            decisions.append({
                "area": "Configuration",
                "decision": "Hierarchical config with env overrides",
                "rationale": "Supports multiple environments and deployment targets",
            })
        decisions.append({
            "area": "General",
            "decision": "Event-driven architecture with message channels",
            "rationale": "Loose coupling enables independent agent operation",
        })
        return decisions

    def _define_interfaces(self, description: str) -> list[dict[str, Any]]:
        return [
            {
                "name": "AgentInterface",
                "methods": ["think()", "act()", "communicate()"],
                "description": "Standard interface for all agents",
            },
            {
                "name": "MemoryInterface",
                "methods": ["store()", "search()", "retrieve()"],
                "description": "Persistent memory access contract",
            },
            {
                "name": "AuditInterface",
                "methods": ["record()", "verify()", "query()"],
                "description": "Audit trail operations",
            },
        ]

    def _evaluate_trade_offs(self, description: str) -> list[dict[str, Any]]:
        return [
            {
                "topic": "Coupling vs. Performance",
                "option_a": "Loose coupling via messages (slower, more flexible)",
                "option_b": "Direct function calls (faster, tightly coupled)",
                "recommendation": "Loose coupling for agent systems",
            },
            {
                "topic": "Persistence vs. Speed",
                "option_a": "Full persistence on every action (slower, durable)",
                "option_b": "Periodic snapshots (faster, risk of loss)",
                "recommendation": "Full persistence for audit trail, periodic for memory",
            },
        ]

    def _suggest_patterns(self, description: str) -> list[str]:
        patterns = ["Agent Pattern", "Observer Pattern"]
        desc_lower = description.lower()
        if "queue" in desc_lower or "async" in desc_lower:
            patterns.append("Producer-Consumer")
        if "state" in desc_lower:
            patterns.append("State Machine")
        if "cache" in desc_lower:
            patterns.append("Cache-Aside")
        return patterns

    def _assess_architectural_risks(self, description: str) -> list[dict[str, str]]:
        return [
            {
                "risk": "Single point of failure in message routing",
                "mitigation": "Redundant channel support with fallback paths",
                "severity": "high",
            },
            {
                "risk": "Memory growth over long sessions",
                "mitigation": "LRU eviction and scope-based cleanup",
                "severity": "medium",
            },
        ]

    def _generate_spec(self, plan: dict[str, Any]) -> str:
        task = plan.get("task", {})
        decisions = plan.get("architectural_decisions", [])
        interfaces = plan.get("interfaces", [])
        lines = [
            f"# Architecture Specification",
            f"",
            f"## Overview",
            f"",
            f"**Task:** {task.get('title', 'Untitled')}",
            f"",
            f"**Description:** {task.get('description', '')}",
            f"",
            f"## Architectural Decisions",
            f"",
        ]
        for d in decisions:
            lines.append(f"### {d['area']}")
            lines.append(f"**Decision:** {d['decision']}")
            lines.append(f"**Rationale:** {d['rationale']}")
            lines.append("")
        lines.append("## Interfaces")
        lines.append("")
        for iface in interfaces:
            lines.append(f"### {iface['name']}")
            lines.append(f"**Methods:** {', '.join(iface['methods'])}")
            lines.append(f"**Description:** {iface['description']}")
            lines.append("")
        return "\n".join(lines)
