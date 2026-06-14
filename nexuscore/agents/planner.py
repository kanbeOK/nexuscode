"""
NexusCode Planner Agent

Decomposes high-level requirements into actionable tasks, creates
dependency graphs, and assigns work to appropriate agents.
"""

from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone
from typing import Any, Optional

from nexuscore.agents.base_agent import BaseAgent
from nexuscore.models import (
    AgentMessage,
    AgentRole,
    Priority,
    ReviewResult,
    Task,
    TaskStatus,
    Verdict,
)

logger = logging.getLogger(__name__)


class PlannerAgent(BaseAgent):
    role = AgentRole.PLANNER

    def _default_capabilities(self) -> list[str]:
        return [
            "task_decomposition",
            "dependency_analysis",
            "priority_assignment",
            "resource_estimation",
            "progress_tracking",
        ]

    def _default_permissions(self) -> list[str]:
        return [
            "create_tasks",
            "assign_tasks",
            "modify_task_status",
            "read_requirements",
            "broadcast_plans",
        ]

    async def think(self, context: dict[str, Any]) -> dict[str, Any]:
        task_data = context.get("task", {})
        requirements = task_data.get("requirements", [])
        description = task_data.get("description", "")
        plan = {
            "original_task": task_data,
            "subtasks": [],
            "dependencies": [],
            "estimated_effort": "medium",
            "risk_factors": [],
        }
        subtasks = self._decompose_task(description, requirements)
        plan["subtasks"] = subtasks
        plan["dependencies"] = self._build_dependency_graph(subtasks)
        plan["estimated_effort"] = self._estimate_effort(subtasks)
        plan["risk_factors"] = self._identify_risks(description, requirements)
        return plan

    async def act(self, plan: dict[str, Any]) -> list[Task]:
        tasks = []
        original = plan.get("original_task", {})
        for subtask_data in plan.get("subtasks", []):
            task = Task(
                title=subtask_data["title"],
                description=subtask_data["description"],
                requirements=subtask_data.get("requirements", []),
                acceptance_criteria=subtask_data.get("acceptance_criteria", []),
                priority=Priority(subtask_data.get("priority", "medium")),
                dependencies=subtask_data.get("dependencies", []),
                tags=subtask_data.get("tags", []),
                parent_task_id=original.get("id"),
                metadata={"estimated_effort": subtask_data.get("effort", "medium")},
            )
            tasks.append(task)
        return tasks

    async def communicate(self, message: AgentMessage) -> Optional[AgentMessage]:
        self.handle_message(message)
        content = message.content.lower()
        if "plan" in content or "decompose" in content:
            return self.send_message(
                f"I'll create a plan for the given requirements. "
                f"Analyzing scope and creating task breakdown.",
                channel_id=message.channel_id or "planning",
                reply_to=message.id,
            )
        elif "status" in content or "progress" in content:
            return self.send_message(
                "Requesting status updates from all assigned agents.",
                channel_id=message.channel_id or "planning",
                is_broadcast=True,
            )
        return None

    def _decompose_task(self, description: str, requirements: list[str]) -> list[dict[str, Any]]:
        subtasks = []
        if not description:
            return subtasks
        phases = [
            ("design", "Design and architecture", ["high"], ["design", "architecture"]),
            ("implement", "Core implementation", ["high"], ["coding", "implementation"]),
            ("test", "Testing and validation", ["medium"], ["testing", "qa"]),
            ("review", "Code review and polish", ["medium"], ["review"]),
            ("deploy", "Deployment preparation", ["low"], ["devops", "deployment"]),
        ]
        for i, (phase, title, priorities, tags) in enumerate(phases):
            subtasks.append({
                "title": f"[{phase.upper()}] {title}",
                "description": f"Phase {i+1}: {title} for the given project.",
                "requirements": requirements[:2] if requirements else [],
                "acceptance_criteria": [
                    f"{title} completed successfully",
                    f"All {phase} checks passing",
                ],
                "priority": priorities[0] if priorities else "medium",
                "dependencies": [subtasks[-1]["title"]] if subtasks else [],
                "tags": tags,
                "effort": "high" if i == 1 else "medium",
            })
        return subtasks

    def _build_dependency_graph(self, subtasks: list[dict[str, Any]]) -> list[dict[str, str]]:
        deps = []
        for i, task in enumerate(subtasks):
            if i > 0:
                deps.append({
                    "from": subtasks[i - 1]["title"],
                    "to": task["title"],
                })
        return deps

    def _estimate_effort(self, subtasks: list[dict[str, Any]]) -> str:
        count = len(subtasks)
        if count <= 2:
            return "low"
        elif count <= 5:
            return "medium"
        else:
            return "high"

    def _identify_risks(self, description: str, requirements: list[str]) -> list[str]:
        risks = []
        if len(requirements) > 5:
            risks.append("High complexity: many requirements to satisfy")
        if "security" in description.lower():
            risks.append("Security-sensitive: requires thorough review")
        if "migration" in description.lower():
            risks.append("Migration work: data loss risk")
        if not risks:
            risks.append("Standard complexity")
        return risks

    def create_epic(self, title: str, description: str, goals: list[str]) -> Task:
        return Task(
            title=title,
            description=description,
            requirements=goals,
            priority=Priority.HIGH,
            tags=["epic"],
        )

    def reprioritize(self, task: Task, new_priority: Priority) -> Task:
        task.priority = new_priority
        task.updated_at = datetime.now(timezone.utc)
        self._log_audit("reprioritize", {
            "task_id": task.id,
            "new_priority": new_priority.value,
        })
        return task
