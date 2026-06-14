"""
NexusCode Test Suite

Tests for the multi-agent system components.
"""

from config import AGENTS, WORKFLOW
from core import (
    Task, TaskState, AgentRole, WorkflowEngine,
    AgentMessage, CommunicationHub, NexusOrchestrator
)


def test_config_loads():
    assert len(AGENTS) == 6
    assert len(WORKFLOW) == 6
    assert WORKFLOW[0] == "planner"
    assert WORKFLOW[-1] == "scribe"


def test_agent_roles():
    for agent_name in AGENTS:
        assert "role" in AGENTS[agent_name]
        assert "model" in AGENTS[agent_name]
        assert "system_prompt" in AGENTS[agent_name]


def test_task_creation():
    engine = WorkflowEngine()
    task = engine.create_task("Test task", AgentRole.PLANNER)

    assert task.task_id.startswith("TASK-")
    assert task.state == TaskState.PENDING
    assert task.assigned_to == AgentRole.PLANNER


def test_task_update():
    engine = WorkflowEngine()
    task = engine.create_task("Test task", AgentRole.PLANNER)

    engine.update_task(task.task_id, TaskState.IN_PROGRESS)
    assert engine.tasks[task.task_id].state == TaskState.IN_PROGRESS

    engine.update_task(task.task_id, TaskState.COMPLETED, {"result": "done"})
    assert engine.tasks[task.task_id].state == TaskState.COMPLETED
    assert engine.tasks[task.task_id].result == {"result": "done"}


def test_workflow_summary():
    engine = WorkflowEngine()
    engine.create_task("Task 1", AgentRole.PLANNER)
    engine.create_task("Task 2", AgentRole.DEVELOPER)

    summary = engine.get_workflow_summary()
    assert summary["total_tasks"] == 2
    assert summary["completed"] == 0
    assert summary["completion_rate"] == 0


def test_communication_hub():
    hub = CommunicationHub()
    hub.send_message(AgentRole.PLANNER, AgentRole.ARCHITECT, "Design this")

    messages = hub.get_messages(AgentRole.ARCHITECT)
    assert len(messages) == 1
    assert messages[0].sender == AgentRole.PLANNER

    unread = hub.get_unread_messages(AgentRole.ARCHITECT)
    assert len(unread) == 1

    hub.mark_as_read(AgentRole.ARCHITECT)
    unread = hub.get_unread_messages(AgentRole.ARCHITECT)
    assert len(unread) == 0


def test_orchestrator():
    orch = NexusOrchestrator()
    task = orch.create_feature_request("Build API")

    assert task.task_id == orch.current_task_id
    assert orch.get_status()["total_messages"] == 1


def test_agent_message_serialization():
    msg = AgentMessage(AgentRole.DEVELOPER, AgentRole.REVIEWER, "Review my code")
    data = msg.to_dict()

    assert data["sender"] == "developer"
    assert data["recipient"] == "reviewer"
    assert data["content"] == "Review my code"
    assert "timestamp" in data


if __name__ == "__main__":
    test_config_loads()
    test_agent_roles()
    test_task_creation()
    test_task_update()
    test_workflow_summary()
    test_communication_hub()
    test_orchestrator()
    test_agent_message_serialization()
    print("All tests passed!")
