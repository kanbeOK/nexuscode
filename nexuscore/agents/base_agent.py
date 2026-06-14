"""
NexusCode Base Agent

Abstract base class for all agents in the system. Provides lifecycle
management, message handling, memory access, audit logging, and
state management. All agents inherit from this class.
"""

from __future__ import annotations

import logging
import uuid
from abc import ABC, abstractmethod
from datetime import datetime, timezone
from typing import Any, Optional

from nexuscore.models import (
    AgentMessage,
    AgentRole,
    AgentState,
    AuditEntry,
    ReviewResult,
    Task,
)

logger = logging.getLogger(__name__)


class BaseAgent(ABC):
    """Abstract base class for all NexusCode agents."""

    role: AgentRole

    def __init__(
        self,
        agent_id: Optional[str] = None,
        config: Optional[dict[str, Any]] = None,
    ):
        self.agent_id = agent_id or f"{self.role.value}_{uuid.uuid4().hex[:8]}"
        self.config = config or {}
        self.state = AgentState(
            agent_id=self.agent_id,
            role=self.role,
            capabilities=self._default_capabilities(),
            permissions=self._default_permissions(),
        )
        self._message_handlers: dict[str, Any] = {}
        self._initialized = False

    @abstractmethod
    def _default_capabilities(self) -> list[str]:
        return []

    @abstractmethod
    def _default_permissions(self) -> list[str]:
        return []

    @abstractmethod
    async def think(self, context: dict[str, Any]) -> dict[str, Any]:
        """Analyze the current situation and form a plan."""
        ...

    @abstractmethod
    async def act(self, plan: dict[str, Any]) -> Any:
        """Execute the planned action."""
        ...

    @abstractmethod
    async def communicate(self, message: AgentMessage) -> Optional[AgentMessage]:
        """Handle incoming messages and produce responses."""
        ...

    async def process_task(self, task: Task) -> Optional[ReviewResult]:
        self.state.status = "working"
        self.state.current_task_id = task.id
        self._log_audit("task_start", {"task_id": task.id, "task_title": task.title})
        try:
            context = {"task": task.model_dump(), "agent_state": self.state.model_dump()}
            plan = await self.think(context)
            result = await self.act(plan)
            self.state.status = "idle"
            self.state.current_task_id = None
            self._log_audit("task_complete", {"task_id": task.id, "result": str(result)[:200]})
            return result
        except Exception as exc:
            self.state.status = "error"
            self._log_audit("task_error", {"task_id": task.id, "error": str(exc)})
            raise

    def handle_message(self, message: AgentMessage) -> Optional[AgentMessage]:
        self.state.messages_received += 1
        self.state.last_active = datetime.now(timezone.utc)
        self._log_audit("message_received", {
            "from": message.agent_id,
            "channel": message.channel_id,
        })

    def send_message(
        self,
        content: str,
        channel_id: str = "general",
        recipients: Optional[list[str]] = None,
        mentions: Optional[list[str]] = None,
        reply_to: Optional[str] = None,
    ) -> AgentMessage:
        msg = AgentMessage(
            role=self.role,
            content=content,
            agent_id=self.agent_id,
            channel_id=channel_id,
            mentions=mentions or [],
            reply_to=reply_to,
        )
        self.state.messages_sent += 1
        self.state.last_active = datetime.now(timezone.utc)
        self._log_audit("message_sent", {
            "channel": channel_id,
            "recipients": recipients or [],
            "content_preview": content[:100],
        })
        return msg

    def initialize(self) -> None:
        self.state.status = "idle"
        self._initialized = True
        self._log_audit("agent_initialized", {"role": self.role.value})

    def shutdown(self) -> None:
        self.state.status = "shutdown"
        self._log_audit("agent_shutdown", {"role": self.role.value})

    def get_state(self) -> AgentState:
        return self.state.model_copy()

    def update_context(self, key: str, value: Any) -> None:
        self.state.context[key] = value
        self.state.last_active = datetime.now(timezone.utc)

    def get_context(self, key: str, default: Any = None) -> Any:
        return self.state.context.get(key, default)

    def has_permission(self, permission: str) -> bool:
        return permission in self.state.permissions

    def has_capability(self, capability: str) -> bool:
        return capability in self.state.capabilities

    def _log_audit(self, action: str, data: Optional[dict[str, Any]] = None) -> None:
        logger.debug("[Agent:%s] %s: %s", self.agent_id, action, data)

    def __repr__(self) -> str:
        return f"{self.__class__.__name__}(id={self.agent_id!r}, role={self.role.value!r})"

    def __str__(self) -> str:
        return f"{self.role.value}:{self.agent_id}"
