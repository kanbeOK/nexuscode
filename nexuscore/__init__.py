"""
NexusCode Core - Multi-Agent Software Development System
=========================================================

A production-ready multi-agent framework for the Band of Agents Hackathon 2026.

Key Patterns:
- Band-Only Communication: No hidden orchestrator; workflow emerges from @mentions
- Adversarial Dual Review: Cooperative + red-team review for every artifact
- Veto Loop: Agents can reject work with evidence-backed decisions
- Persistent Memory: Searchable knowledge base across sessions
- SHA-256 Audit Trail: Tamper-evident logging of all actions
- Human Gates: Critical decisions require human approval
- Pydantic Structured Output: All agent outputs are validated models
"""

__version__ = "0.1.0"
__author__ = "NexusCode Team"
__license__ = "MIT"

from nexuscore.models import (
    AgentMessage,
    AgentState,
    Task,
    TaskStatus,
    Priority,
    CodeArtifact,
    ReviewResult,
    Verdict,
    AuditEntry,
    WorkflowState,
    WorkflowPhase,
    MemoryEntry,
    VetoDecision,
    HumanGateRequest,
    GateStatus,
    BandMessage,
    ChannelType,
    Config,
)
from nexuscore.config import NexusConfig, load_config, save_config
from nexuscore.memory import MemoryStore, MemoryScope
from nexuscore.audit import AuditTrail
from nexuscore.band_channel import BandChannel, Channel

__all__ = [
    "__version__",
    "AgentMessage",
    "AgentState",
    "Task",
    "TaskStatus",
    "Priority",
    "CodeArtifact",
    "ReviewResult",
    "Verdict",
    "AuditEntry",
    "WorkflowState",
    "WorkflowPhase",
    "MemoryEntry",
    "VetoDecision",
    "HumanGateRequest",
    "GateStatus",
    "BandMessage",
    "ChannelType",
    "Config",
    "NexusConfig",
    "load_config",
    "save_config",
    "MemoryStore",
    "MemoryScope",
    "AuditTrail",
    "BandChannel",
    "Channel",
]
