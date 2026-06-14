"""
Pydantic v2 models for the NexusCode multi-agent system.

All agent outputs, messages, and system state are represented as validated
Pydantic models to ensure type safety and structured communication.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Optional

try:
    from pydantic import BaseModel, Field, field_validator, model_validator
    PYDANTIC_AVAILABLE = True
except ImportError:
    from dataclasses import dataclass, field as dc_field
    PYDANTIC_AVAILABLE = False

    class BaseModel:
        def __init__(self, **kwargs):
            for k, v in kwargs.items():
                setattr(self, k, v)
            # Apply default factories for missing fields
            import dataclasses
            for cls in type(self).__mro__:
                if hasattr(cls, '__dataclass_fields__'):
                    for name, field in cls.__dataclass_fields__.items():
                        if not hasattr(self, name) and field.default_factory:
                            setattr(self, name, field.default_factory())
                        elif not hasattr(self, name) and field.default is not dataclasses.MISSING:
                            setattr(self, name, field.default)
        def dict(self):
            return {k: v for k, v in self.__dict__.items() if not k.startswith('_')}
        def model_dump(self, **kw):
            return self.dict()
        def json(self, **kw):
            import json
            return json.dumps(self.dict(), default=str, **kw)
        def model_dump_json(self, **kw):
            return self.json(**kw)

    def Field(default=None, default_factory=None, **kw):
        if default_factory:
            return default_factory()
        return default if default is not None else kw.get('default', None)

    def field_validator(*a, **kw):
        def decorator(f):
            return f
        return decorator

    def model_validator(*a, **kw):
        def decorator(f):
            return f
        return decorator


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _new_id() -> str:
    return uuid.uuid4().hex[:16]


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class TaskStatus(str, Enum):
    PENDING = "pending"
    PLANNED = "planned"
    IN_PROGRESS = "in_progress"
    IN_REVIEW = "in_review"
    BLOCKED = "blocked"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class Priority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class Verdict(str, Enum):
    APPROVED = "approved"
    REJECTED = "rejected"
    CONDITIONAL = "conditional"
    ABSTAIN = "abstain"


class WorkflowPhase(str, Enum):
    INIT = "init"
    PLANNING = "planning"
    DESIGN = "design"
    IMPLEMENTATION = "implementation"
    REVIEW = "review"
    TESTING = "testing"
    DEPLOYMENT = "deployment"
    COMPLETE = "complete"


class GateStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    TIMEOUT = "timeout"
    DEFAULTED = "defaulted"


class ChannelType(str, Enum):
    GENERAL = "general"
    TASK = "task"
    REVIEW = "review"
    SECURITY = "security"
    EMERGENCY = "emergency"


class AgentRole(str, Enum):
    PLANNER = "planner"
    ARCHITECT = "architect"
    DEVELOPER = "developer"
    REVIEWER = "reviewer"
    RED_TEAMER = "red_teamer"
    VERIFIER = "verifier"
    QA = "qa"
    DEVOPS = "devops"
    SCRIBE = "scribe"
    ADJUDICATOR = "adjudicator"
    HUMAN_GATE = "human_gate"


# ---------------------------------------------------------------------------
# Core Models
# ---------------------------------------------------------------------------

class AgentMessage(BaseModel):
    """A message exchanged between agents on the band channel."""
    id: str = Field(default_factory=_new_id)
    role: AgentRole
    content: str
    agent_id: str
    timestamp: datetime = Field(default_factory=_utcnow)
    metadata: dict[str, Any] = Field(default_factory=dict)
    reply_to: Optional[str] = None
    mentions: list[str] = Field(default_factory=list)
    channel_id: Optional[str] = None

    model_config = {"populate_by_name": True}


class AgentState(BaseModel):
    """Current state of an agent in the system."""
    agent_id: str = Field(default_factory=_new_id)
    role: AgentRole
    status: str = "idle"
    current_task_id: Optional[str] = None
    context: dict[str, Any] = Field(default_factory=dict)
    messages_sent: int = 0
    messages_received: int = 0
    vetoes_issued: int = 0
    last_active: datetime = Field(default_factory=_utcnow)
    capabilities: list[str] = Field(default_factory=list)
    permissions: list[str] = Field(default_factory=list)

    def is_available(self) -> bool:
        return self.status in ("idle", "waiting")


class Task(BaseModel):
    """A unit of work in the system."""
    id: str = Field(default_factory=_new_id)
    title: str
    description: str
    requirements: list[str] = Field(default_factory=list)
    acceptance_criteria: list[str] = Field(default_factory=list)
    status: TaskStatus = TaskStatus.PENDING
    priority: Priority = Priority.MEDIUM
    assigned_agent_id: Optional[str] = None
    dependencies: list[str] = Field(default_factory=list)
    subtasks: list[str] = Field(default_factory=list)
    parent_task_id: Optional[str] = None
    created_at: datetime = Field(default_factory=_utcnow)
    updated_at: datetime = Field(default_factory=_utcnow)
    completed_at: Optional[datetime] = None
    artifacts: list[str] = Field(default_factory=list)
    tags: list[str] = Field(default_factory=list)
    metadata: dict[str, Any] = Field(default_factory=dict)

    @field_validator("title")
    @classmethod
    def title_must_not_be_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Task title must not be empty")
        return v.strip()

    def is_ready(self, completed_ids: set[str]) -> bool:
        return all(dep in completed_ids for dep in self.dependencies)


class CodeArtifact(BaseModel):
    """A piece of code produced by an agent."""
    id: str = Field(default_factory=_new_id)
    path: str
    content: str
    language: str = "python"
    checksum: str = ""
    author_agent_id: str = ""
    task_id: Optional[str] = None
    created_at: datetime = Field(default_factory=_utcnow)
    version: int = 1
    parent_id: Optional[str] = None
    metadata: dict[str, Any] = Field(default_factory=dict)

    @field_validator("path")
    @classmethod
    def path_must_be_relative(cls, v: str) -> str:
        if v.startswith("/"):
            raise ValueError("Path must be relative")
        return v


class ReviewResult(BaseModel):
    """Output of a code or design review."""
    id: str = Field(default_factory=_new_id)
    artifact_id: str
    reviewer_agent_id: str
    verdict: Verdict
    issues: list[ReviewIssue] = Field(default_factory=list)
    suggestions: list[str] = Field(default_factory=list)
    confidence: float = Field(default=0.8, ge=0.0, le=1.0)
    summary: str = ""
    timestamp: datetime = Field(default_factory=_utcnow)
    evidence: list[str] = Field(default_factory=list)
    requires_human_gate: bool = False


class ReviewIssue(BaseModel):
    """A specific issue found during review."""
    severity: str = "warning"  # info, warning, error, critical
    category: str = "general"  # security, performance, style, logic, test
    file_path: Optional[str] = None
    line_number: Optional[int] = None
    description: str = ""
    suggestion: str = ""


class AuditEntry(BaseModel):
    """A single entry in the tamper-evident audit log."""
    sequence: int
    timestamp: datetime = Field(default_factory=_utcnow)
    event_type: str
    agent_id: str
    action: str
    data: dict[str, Any] = Field(default_factory=dict)
    data_hash: str = ""
    previous_hash: str = ""
    entry_hash: str = ""

    model_config = {"populate_by_name": True}


class WorkflowState(BaseModel):
    """State of an active workflow."""
    id: str = Field(default_factory=_new_id)
    tasks: list[Task] = Field(default_factory=list)
    active_agents: list[str] = Field(default_factory=list)
    current_phase: WorkflowPhase = WorkflowPhase.INIT
    history: list[WorkflowEvent] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=_utcnow)
    updated_at: datetime = Field(default_factory=_utcnow)
    metadata: dict[str, Any] = Field(default_factory=dict)

    def completed_task_ids(self) -> set[str]:
        return {
            t.id for t in self.tasks
            if t.status in (TaskStatus.COMPLETED, TaskStatus.CANCELLED)
        }

    def blocked_tasks(self) -> list[Task]:
        return [t for t in self.tasks if t.status == TaskStatus.BLOCKED]

    def active_tasks(self) -> list[Task]:
        return [t for t in self.tasks if t.status == TaskStatus.IN_PROGRESS]


class WorkflowEvent(BaseModel):
    """An event in the workflow history."""
    id: str = Field(default_factory=_new_id)
    timestamp: datetime = Field(default_factory=_utcnow)
    event_type: str
    agent_id: str
    description: str
    data: dict[str, Any] = Field(default_factory=dict)


class MemoryEntry(BaseModel):
    """A piece of knowledge stored in persistent memory."""
    id: str = Field(default_factory=_new_id)
    key: str
    value: str
    tags: list[str] = Field(default_factory=list)
    scope: str = "project"
    timestamp: datetime = Field(default_factory=_utcnow)
    agent_id: str = ""
    version: int = 1
    metadata: dict[str, Any] = Field(default_factory=dict)

    @field_validator("key")
    @classmethod
    def key_must_not_be_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Memory key must not be empty")
        return v.strip().lower()


class VetoDecision(BaseModel):
    """A veto decision from an agent."""
    id: str = Field(default_factory=_new_id)
    agent_id: str
    artifact_id: str
    task_id: Optional[str] = None
    reason: str
    confidence: float = Field(default=0.8, ge=0.0, le=1.0)
    evidence: list[str] = Field(default_factory=list)
    proposed_fix: Optional[str] = None
    timestamp: datetime = Field(default_factory=_utcnow)
    is_counter_proposal: bool = False
    severity: str = "warning"  # info, warning, critical

    @field_validator("reason")
    @classmethod
    def reason_required(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Veto must include a reason")
        return v.strip()


class HumanGateRequest(BaseModel):
    """A request for human intervention."""
    id: str = Field(default_factory=_new_id)
    agent_id: str
    question: str
    context: str = ""
    options: list[str] = Field(default_factory=list)
    default_option: Optional[str] = None
    status: GateStatus = GateStatus.PENDING
    response: Optional[str] = None
    timeout_seconds: int = 300
    created_at: datetime = Field(default_factory=_utcnow)
    responded_at: Optional[datetime] = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class BandMessage(BaseModel):
    """A message on the band channel."""
    id: str = Field(default_factory=_new_id)
    sender_id: str
    sender_role: AgentRole
    recipients: list[str] = Field(default_factory=list)
    content: str
    channel_id: str = ""
    channel_type: ChannelType = ChannelType.GENERAL
    timestamp: datetime = Field(default_factory=_utcnow)
    reply_to: Optional[str] = None
    mentions: list[str] = Field(default_factory=list)
    attachments: list[str] = Field(default_factory=list)
    is_broadcast: bool = False

    def targets_agent(self, agent_id: str) -> bool:
        return (
            self.is_broadcast
            or agent_id in self.recipients
            or f"@{agent_id}" in self.content
        )


class Config(BaseModel):
    """System configuration."""
    project_name: str = "nexuscode-project"
    max_agents: int = 15
    max_veto_rounds: int = 3
    human_gate_timeout: int = 300
    memory_path: str = ".nexuscode/memory"
    audit_path: str = ".nexuscode/audit"
    log_level: str = "INFO"
    enabled_agents: list[AgentRole] = Field(
        default_factory=lambda: list(AgentRole)
    )
    workflow_timeout: int = 3600
    max_task_retries: int = 3
    require_evidence_for_claims: bool = True
    adversarial_review_enabled: bool = True
    parallel_agent_execution: bool = True
    metadata: dict[str, Any] = Field(default_factory=dict)
