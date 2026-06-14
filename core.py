"""
NexusCode - Advanced Multi-Agent Orchestration

This module provides advanced orchestration features:
- Task state management
- Agent communication protocols
- Workflow visualization
- Error handling and recovery
"""

import asyncio
import json
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any
from enum import Enum

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class TaskState(Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    BLOCKED = "blocked"


class AgentRole(Enum):
    PLANNER = "planner"
    ARCHITECT = "architect"
    DEVELOPER = "developer"
    REVIEWER = "reviewer"
    QA = "qa"
    SCRIBE = "scribe"


class Task:
    def __init__(self, task_id: str, description: str, assigned_to: AgentRole):
        self.task_id = task_id
        self.description = description
        self.assigned_to = assigned_to
        self.state = TaskState.PENDING
        self.created_at = datetime.now()
        self.updated_at = datetime.now()
        self.context = {}
        self.result = None

    def update_state(self, state: TaskState, result: Any = None):
        self.state = state
        self.updated_at = datetime.now()
        if result:
            self.result = result

    def to_dict(self) -> Dict:
        return {
            "task_id": self.task_id,
            "description": self.description,
            "assigned_to": self.assigned_to.value,
            "state": self.state.value,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "context": self.context,
            "result": self.result
        }


class WorkflowEngine:
    def __init__(self):
        self.tasks: Dict[str, Task] = {}
        self.workflow_history: List[Dict] = []

    def create_task(self, description: str, assigned_to: AgentRole) -> Task:
        task_id = f"TASK-{len(self.tasks) + 1:04d}"
        task = Task(task_id, description, assigned_to)
        self.tasks[task_id] = task
        self._log_event("task_created", task.to_dict())
        return task

    def update_task(self, task_id: str, state: TaskState, result: Any = None):
        if task_id in self.tasks:
            self.tasks[task_id].update_state(state, result)
            self._log_event("task_updated", self.tasks[task_id].to_dict())

    def get_tasks_by_agent(self, agent_role: AgentRole) -> List[Task]:
        return [t for t in self.tasks.values() if t.assigned_to == agent_role]

    def get_pending_tasks(self) -> List[Task]:
        return [t for t in self.tasks.values() if t.state == TaskState.PENDING]

    def _log_event(self, event_type: str, data: Dict):
        self.workflow_history.append({
            "timestamp": datetime.now().isoformat(),
            "event_type": event_type,
            "data": data
        })

    def get_workflow_summary(self) -> Dict:
        total_tasks = len(self.tasks)
        completed = sum(1 for t in self.tasks.values() if t.state == TaskState.COMPLETED)
        in_progress = sum(1 for t in self.tasks.values() if t.state == TaskState.IN_PROGRESS)
        failed = sum(1 for t in self.tasks.values() if t.state == TaskState.FAILED)

        return {
            "total_tasks": total_tasks,
            "completed": completed,
            "in_progress": in_progress,
            "failed": failed,
            "completion_rate": (completed / total_tasks * 100) if total_tasks > 0 else 0
        }


class AgentMessage:
    def __init__(self, sender: AgentRole, recipient: AgentRole, content: str, message_type: str = "task"):
        self.sender = sender
        self.recipient = recipient
        self.content = content
        self.message_type = message_type
        self.timestamp = datetime.now()
        self.read = False

    def to_dict(self) -> Dict:
        return {
            "sender": self.sender.value,
            "recipient": self.recipient.value,
            "content": self.content,
            "message_type": self.message_type,
            "timestamp": self.timestamp.isoformat(),
            "read": self.read
        }


class CommunicationHub:
    def __init__(self):
        self.messages: List[AgentMessage] = []
        self.queues: Dict[AgentRole, List[AgentMessage]] = {
            role: [] for role in AgentRole
        }

    def send_message(self, sender: AgentRole, recipient: AgentRole, content: str, message_type: str = "task"):
        message = AgentMessage(sender, recipient, content, message_type)
        self.messages.append(message)
        self.queues[recipient].append(message)
        logger.info(f"Message sent: {sender.value} -> {recipient.value}")

    def get_messages(self, agent_role: AgentRole) -> List[AgentMessage]:
        return self.queues[agent_role]

    def get_unread_messages(self, agent_role: AgentRole) -> List[AgentMessage]:
        return [m for m in self.queues[agent_role] if not m.read]

    def mark_as_read(self, agent_role: AgentRole):
        for message in self.queues[agent_role]:
            message.read = True


class NexusOrchestrator:
    def __init__(self):
        self.workflow_engine = WorkflowEngine()
        self.communication_hub = CommunicationHub()
        self.current_task_id = None

    def create_feature_request(self, description: str) -> Task:
        task = self.workflow_engine.create_task(description, AgentRole.PLANNER)
        self.current_task_id = task.task_id
        self.communication_hub.send_message(
            AgentRole.PLANNER,
            AgentRole.PLANNER,
            f"New feature request: {description}",
            "request"
        )
        return task

    def handoff_task(self, from_agent: AgentRole, to_agent: AgentRole, task_id: str, context: Dict):
        self.communication_hub.send_message(
            from_agent,
            to_agent,
            json.dumps({"task_id": task_id, "context": context}),
            "handoff"
        )
        self.workflow_engine.update_task(task_id, TaskState.IN_PROGRESS)
        logger.info(f"Task {task_id} handed off: {from_agent.value} -> {to_agent.value}")

    def get_status(self) -> Dict:
        return {
            "current_task": self.current_task_id,
            "workflow_summary": self.workflow_engine.get_workflow_summary(),
            "pending_tasks": len(self.workflow_engine.get_pending_tasks()),
            "total_messages": len(self.communication_hub.messages)
        }


def create_demo_workflow():
    orchestrator = NexusOrchestrator()

    task = orchestrator.create_feature_request("Implement user authentication system")

    print(f"Created task: {task.task_id}")
    print(f"Status: {orchestrator.get_status()}")

    orchestrator.handoff_task(
        AgentRole.PLANNER,
        AgentRole.ARCHITECT,
        task.task_id,
        {"user_stories": ["US-001: User registration", "US-002: Login", "US-003: Password reset"]}
    )

    print(f"After handoff: {orchestrator.get_status()}")

    return orchestrator


if __name__ == "__main__":
    create_demo_workflow()
