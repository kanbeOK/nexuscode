"""
NexusCode Human Gate Agent

Manages human-in-the-loop decision points. Requests human approval
at critical moments, presents options clearly, handles timeouts,
and logs human decisions.
"""

from __future__ import annotations

import logging
import queue
import threading
import time
from datetime import datetime, timezone
from typing import Any, Optional

from nexuscore.agents.base_agent import BaseAgent
from nexuscore.models import (
    AgentMessage,
    AgentRole,
    GateStatus,
    HumanGateRequest,
    ReviewResult,
    Task,
)

logger = logging.getLogger(__name__)


class HumanGateAgent(BaseAgent):
    role = AgentRole.HUMAN_GATE

    def _default_capabilities(self) -> list[str]:
        return [
            "human_approval_request",
            "option_presentation",
            "timeout_handling",
            "decision_logging",
            "gate_management",
        ]

    def _default_permissions(self) -> list[str]:
        return [
            "request_human_input",
            "log_human_decisions",
            "manage_gates",
            "set_defaults",
        ]

    def __init__(self, **kwargs: Any):
        super().__init__(**kwargs)
        self._pending_gates: dict[str, HumanGateRequest] = {}
        self._gate_history: list[HumanGateRequest] = []
        self._response_queue: queue.Queue = queue.Queue()
        self._lock = threading.Lock()

    async def think(self, context: dict[str, Any]) -> dict[str, Any]:
        gate_requests = context.get("gate_requests", [])
        plan = {
            "gates_to_process": [],
            "timeout_default": 300,
            "auto_approve_threshold": 0.5,
        }
        for request in gate_requests:
            plan["gates_to_process"].append({
                "request_id": request.get("id", ""),
                "question": request.get("question", ""),
                "options": request.get("options", []),
                "context": request.get("context", ""),
                "timeout": request.get("timeout_seconds", 300),
            })
        return plan

    async def act(self, plan: dict[str, Any]) -> list[HumanGateRequest]:
        processed = []
        for gate_info in plan.get("gates_to_process", []):
            request = HumanGateRequest(
                agent_id=self.agent_id,
                question=gate_info["question"],
                options=gate_info.get("options", []),
                context=gate_info.get("context", ""),
                timeout_seconds=gate_info.get("timeout", plan.get("timeout_default", 300)),
            )
            with self._lock:
                self._pending_gates[request.id] = request
            self._log_audit("gate_created", {
                "request_id": request.id,
                "question": request.question[:100],
            })
            processed.append(request)
        return processed

    async def communicate(self, message: AgentMessage) -> Optional[AgentMessage]:
        self.handle_message(message)
        content = message.content.lower()
        if "approve" in content or "gate" in content or "human" in content:
            return self.send_message(
                "A human approval gate has been triggered. Presenting the "
                "decision to the human operator for review.",
                channel_id=message.channel_id or "general",
                reply_to=message.id,
            )
        elif "default" in content:
            return self.send_message(
                "Using default response for the human gate due to timeout. "
                "The decision has been logged.",
                channel_id=message.channel_id or "general",
                reply_to=message.id,
            )
        return None

    def request_approval(
        self,
        question: str,
        options: Optional[list[str]] = None,
        context: str = "",
        timeout: int = 300,
        default: Optional[str] = None,
    ) -> HumanGateRequest:
        request = HumanGateRequest(
            agent_id=self.agent_id,
            question=question,
            options=options or ["Approve", "Reject"],
            context=context,
            timeout_seconds=timeout,
            default_option=default,
        )
        with self._lock:
            self._pending_gates[request.id] = request
        self._log_audit("approval_requested", {
            "request_id": request.id,
            "question": question[:100],
        })
        return request

    def respond(
        self,
        request_id: str,
        response: str,
    ) -> Optional[HumanGateRequest]:
        with self._lock:
            request = self._pending_gates.get(request_id)
            if request is None:
                return None
            request.response = response
            request.status = GateStatus.APPROVED if response.lower() in ("approve", "yes", "y", "true") else GateStatus.REJECTED
            request.responded_at = datetime.now(timezone.utc)
            self._gate_history.append(request)
            del self._pending_gates[request_id]
        self._log_audit("gate_responded", {
            "request_id": request_id,
            "response": response,
            "status": request.status.value,
        })
        return request

    def check_timeouts(self) -> list[HumanGateRequest]:
        timed_out = []
        now = datetime.now(timezone.utc)
        with self._lock:
            expired_ids = []
            for rid, request in self._pending_gates.items():
                elapsed = (now - request.created_at).total_seconds()
                if elapsed >= request.timeout_seconds:
                    if request.default_option:
                        request.response = request.default_option
                        request.status = GateStatus.DEFAULTED
                    else:
                        request.status = GateStatus.TIMEOUT
                    request.responded_at = now
                    timed_out.append(request)
                    expired_ids.append(rid)
                    self._gate_history.append(request)
            for rid in expired_ids:
                del self._pending_gates[rid]
        for request in timed_out:
            self._log_audit("gate_timeout", {
                "request_id": request.id,
                "status": request.status.value,
            })
        return timed_out

    def get_pending_gates(self) -> list[HumanGateRequest]:
        with self._lock:
            return list(self._pending_gates.values())

    def get_gate_history(self) -> list[HumanGateRequest]:
        return list(self._gate_history)

    def get_pending_count(self) -> int:
        with self._lock:
            return len(self._pending_gates)

    def format_gate_for_display(self, request: HumanGateRequest) -> str:
        lines = [
            f"=== HUMAN GATE REQUEST ===",
            f"ID: {request.id}",
            f"Question: {request.question}",
        ]
        if request.context:
            lines.append(f"Context: {request.context}")
        if request.options:
            lines.append("Options:")
            for i, option in enumerate(request.options, 1):
                lines.append(f"  {i}. {option}")
        lines.append(f"Timeout: {request.timeout_seconds}s")
        if request.default_option:
            lines.append(f"Default: {request.default_option}")
        lines.append("==========================")
        return "\n".join(lines)

    def approve_all(self, reason: str = "Bulk approval") -> int:
        count = 0
        with self._lock:
            for rid, request in list(self._pending_gates.items()):
                request.response = "approve"
                request.status = GateStatus.APPROVED
                request.responded_at = datetime.now(timezone.utc)
                self._gate_history.append(request)
                del self._pending_gates[rid]
                count += 1
        return count

    def reject_all(self, reason: str = "Bulk rejection") -> int:
        count = 0
        with self._lock:
            for rid, request in list(self._pending_gates.items()):
                request.response = "reject"
                request.status = GateStatus.REJECTED
                request.responded_at = datetime.now(timezone.utc)
                self._gate_history.append(request)
                del self._pending_gates[rid]
                count += 1
        return count

    def summary(self) -> dict[str, Any]:
        with self._lock:
            pending = len(self._pending_gates)
        history = self._gate_history
        approved = sum(1 for g in history if g.status == GateStatus.APPROVED)
        rejected = sum(1 for g in history if g.status == GateStatus.REJECTED)
        defaulted = sum(1 for g in history if g.status == GateStatus.DEFAULTED)
        return {
            "pending": pending,
            "total_processed": len(history),
            "approved": approved,
            "rejected": rejected,
            "defaulted": defaulted,
        }
