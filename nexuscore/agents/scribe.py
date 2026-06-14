"""
NexusCode Scribe Agent

Handles documentation generation, knowledge base maintenance,
user guides, decision documentation, and memory management.
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
    MemoryEntry,
    ReviewResult,
    Task,
)

logger = logging.getLogger(__name__)


class ScribeAgent(BaseAgent):
    role = AgentRole.SCRIBE

    def _default_capabilities(self) -> list[str]:
        return [
            "documentation_generation",
            "knowledge_management",
            "decision_documentation",
            "changelog_maintenance",
            "readme_generation",
        ]

    def _default_permissions(self) -> list[str]:
        return [
            "write_documentation",
            "manage_memory",
            "read_code",
            "read_decisions",
            "update_knowledge_base",
        ]

    async def think(self, context: dict[str, Any]) -> dict[str, Any]:
        task_data = context.get("task", {})
        artifacts = context.get("artifacts", [])
        decisions = context.get("decisions", [])
        plan = {
            "task": task_data,
            "docs_to_generate": [],
            "memory_entries": [],
            "artifacts": artifacts,
            "decisions": decisions,
        }
        plan["docs_to_generate"] = self._plan_documentation(task_data, artifacts)
        plan["memory_entries"] = self._plan_memory_entries(task_data, decisions)
        return plan

    async def act(self, plan: dict[str, Any]) -> list[CodeArtifact]:
        artifacts = []
        task = plan.get("task", {})
        for doc_spec in plan.get("docs_to_generate", []):
            content = self._generate_documentation(doc_spec, plan)
            artifact = CodeArtifact(
                path=doc_spec["path"],
                content=content,
                language="markdown",
                author_agent_id=self.agent_id,
                task_id=task.get("id"),
            )
            artifacts.append(artifact)
        return artifacts

    async def communicate(self, message: AgentMessage) -> Optional[AgentMessage]:
        self.handle_message(message)
        content = message.content.lower()
        if "document" in content or "docs" in content or "readme" in content:
            return self.send_message(
                "Generating documentation. I'll create comprehensive docs "
                "covering architecture, API reference, and usage guides.",
                channel_id=message.channel_id or "general",
                reply_to=message.id,
            )
        elif "decision" in content or "adr" in content:
            return self.send_message(
                "Recording architectural decision. I'll document the context, "
                "decision, and consequences for future reference.",
                channel_id=message.channel_id or "planning",
                reply_to=message.id,
            )
        elif "knowledge" in content or "memory" in content:
            return self.send_message(
                "Updating knowledge base. Storing key learnings and "
                "cross-referencing with existing entries.",
                channel_id=message.channel_id or "general",
                reply_to=message.id,
            )
        return None

    def _plan_documentation(
        self, task_data: dict[str, Any], artifacts: list[dict[str, Any]]
    ) -> list[dict[str, str]]:
        docs = []
        docs.append({
            "path": "README.md",
            "type": "readme",
            "title": task_data.get("title", "Project"),
        })
        docs.append({
            "path": "docs/ARCHITECTURE.md",
            "type": "architecture",
            "title": "Architecture Overview",
        })
        docs.append({
            "path": "docs/API.md",
            "type": "api",
            "title": "API Reference",
        })
        if artifacts:
            docs.append({
                "path": "docs/CHANGELOG.md",
                "type": "changelog",
                "title": "Changelog",
            })
        return docs

    def _plan_memory_entries(
        self, task_data: dict[str, Any], decisions: list[dict[str, Any]]
    ) -> list[dict[str, str]]:
        entries = []
        entries.append({
            "key": f"project:{task_data.get('title', 'unknown').lower().replace(' ', '_')}",
            "value": task_data.get("description", ""),
            "tags": ["project", "description"],
        })
        for decision in decisions:
            entries.append({
                "key": f"decision:{decision.get('area', 'unknown').lower().replace(' ', '_')}",
                "value": f"{decision.get('decision', '')} - {decision.get('rationale', '')}",
                "tags": ["decision", decision.get("area", "").lower()],
            })
        return entries

    def _generate_documentation(self, doc_spec: dict[str, str], plan: dict[str, Any]) -> str:
        doc_type = doc_spec.get("type", "readme")
        title = doc_spec.get("title", "Documentation")
        if doc_type == "readme":
            return self._generate_readme(title, plan)
        elif doc_type == "architecture":
            return self._generate_architecture_doc(title, plan)
        elif doc_type == "api":
            return self._generate_api_doc(title, plan)
        elif doc_type == "changelog":
            return self._generate_changelog(title, plan)
        return f"# {title}\n\nDocumentation generated by NexusCode Scribe Agent.\n"

    def _generate_readme(self, title: str, plan: dict[str, Any]) -> str:
        task = plan.get("task", {})
        return (
            f"# {title}\n\n"
            f"{task.get('description', 'A software project built with NexusCode.')}\n\n"
            f"## Features\n\n"
            f"- Multi-agent development workflow\n"
            f"- Adversarial dual review\n"
            f"- Persistent memory and audit trail\n"
            f"- Human-in-the-loop gates\n\n"
            f"## Getting Started\n\n"
            f"```bash\npip install nexuscore\n```\n\n"
            f"## Architecture\n\n"
            f"See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for details.\n\n"
            f"## License\n\n"
            f"MIT\n"
        )

    def _generate_architecture_doc(self, title: str, plan: dict[str, Any]) -> str:
        return (
            f"# {title}\n\n"
            f"## Overview\n\n"
            f"This document describes the system architecture.\n\n"
            f"## Components\n\n"
            f"### Agents\n\n"
            f"- **Planner**: Task decomposition and scheduling\n"
            f"- **Architect**: System design and specifications\n"
            f"- **Developer**: Code generation and implementation\n"
            f"- **Reviewer**: Cooperative code review\n"
            f"- **Red Teamer**: Adversarial security review\n"
            f"- **Verifier**: Evidence-based verification\n"
            f"- **QA**: Quality assurance and testing\n"
            f"- **DevOps**: Deployment and operations\n"
            f"- **Scribe**: Documentation and knowledge\n"
            f"- **Adjudicator**: Conflict resolution\n"
            f"- **Human Gate**: Human-in-the-loop approval\n\n"
            f"## Communication\n\n"
            f"Agents communicate via band channels using @mentions.\n"
            f"There is no hidden orchestrator.\n\n"
            f"## Data Flow\n\n"
            f"1. Task is planned and decomposed\n"
            f"2. Architect designs the solution\n"
            f"3. Developer implements the code\n"
            f"4. Dual review (cooperative + red-team)\n"
            f"5. Verifier checks evidence\n"
            f"6. QA runs tests\n"
            f"7. DevOps deploys\n"
        )

    def _generate_api_doc(self, title: str, plan: dict[str, Any]) -> str:
        return (
            f"# {title}\n\n"
            f"## Core Classes\n\n"
            f"### MemoryStore\n\n"
            f"```python\n"
            f"store = MemoryStore(base_path='.nexuscode/memory')\n"
            f"store.store('key', 'value', tags=['tag1'])\n"
            f"results = store.search('query')\n"
            f"```\n\n"
            f"### AuditTrail\n\n"
            f"```python\n"
            f"audit = AuditTrail(path='.nexuscode/audit')\n"
            f"audit.record('action', 'agent_id', 'performed')\n"
            f"is_valid, error = audit.verify_integrity()\n"
            f"```\n\n"
            f"### BandChannel\n\n"
            f"```python\n"
            f"channel = BandChannel()\n"
            f"channel.send('agent1', AgentRole.DEVELOPER, 'Hello')\n"
            f"messages = channel.get_messages_for_agent('agent2')\n"
            f"```\n"
        )

    def _generate_changelog(self, title: str, plan: dict[str, Any]) -> str:
        return (
            f"# {title}\n\n"
            f"## [Unreleased]\n\n"
            f"### Added\n\n"
            f"- Initial project setup\n"
            f"- Multi-agent workflow\n"
            f"- Persistent memory system\n"
            f"- SHA-256 audit trail\n"
            f"- Band-only communication\n\n"
        )

    def record_decision(self, decision: dict[str, Any]) -> MemoryEntry:
        key = f"decision:{decision.get('area', 'unknown').lower().replace(' ', '_')}"
        value = f"{decision.get('decision', '')} - {decision.get('rationale', '')}"
        tags = ["decision", decision.get("area", "").lower()]
        return MemoryEntry(
            key=key,
            value=value,
            tags=tags,
            agent_id=self.agent_id,
        )
