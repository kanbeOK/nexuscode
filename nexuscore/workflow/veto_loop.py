"""
NexusCode Veto Loop

Implements the adversarial veto mechanism. Agents can reject work
with evidence-backed decisions, make counter-proposals, escalate
when vetoes persist, and use majority voting for resolution.
"""

from __future__ import annotations

import logging
import time
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Callable, Optional

from nexuscore.models import VetoDecision

logger = logging.getLogger(__name__)


class VetoLoopStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    APPROVED = "approved"
    REJECTED = "rejected"
    ESCALATED = "escalated"


class VoteResult(str, Enum):
    APPROVE = "approve"
    REJECT = "reject"
    ABSTAIN = "abstain"


@dataclass
class Vote:
    agent_id: str
    result: VoteResult
    reason: str = ""
    timestamp: str = ""

    def __post_init__(self):
        if not self.timestamp:
            self.timestamp = datetime.now(timezone.utc).isoformat()


@dataclass
class VetoRound:
    round_number: int
    vetoes: list[VetoDecision]
    counter_proposals: list[VetoDecision]
    votes: list[Vote]
    resolution: Optional[str] = None
    timestamp: str = ""

    def __post_init__(self):
        if not self.timestamp:
            self.timestamp = datetime.now(timezone.utc).isoformat()


@dataclass
class VetoLoopConfig:
    max_rounds: int = 3
    require_evidence: bool = True
    min_confidence: float = 0.6
    majority_threshold: float = 0.5
    escalate_on_stalemate: bool = True


class VetoLoop:
    """
    Manages the adversarial veto process where agents can reject
    work and propose alternatives.

    Features:
    - Agents can reject with VetoDecision (reason + evidence)
    - Counter-proposal mechanism
    - Escalation when vetoes persist
    - Majority voting for resolution
    - Adjudicator integration
    """

    def __init__(
        self,
        artifact_id: str,
        config: Optional[VetoLoopConfig] = None,
        adjudicator_fn: Optional[Callable[[list[VetoDecision]], dict[str, Any]]] = None,
    ):
        self.artifact_id = artifact_id
        self.config = config or VetoLoopConfig()
        self.adjudicator_fn = adjudicator_fn
        self._status = VetoLoopStatus.PENDING
        self._rounds: list[VetoRound] = []
        self._current_round = 0
        self._vetoes: list[VetoDecision] = []
        self._counter_proposals: list[VetoDecision] = []
        self._votes: list[Vote] = []
        self._start_time: Optional[float] = None

    @property
    def status(self) -> VetoLoopStatus:
        return self._status

    @property
    def rounds(self) -> list[VetoRound]:
        return list(self._rounds)

    @property
    def total_vetoes(self) -> int:
        return sum(len(r.vetoes) for r in self._rounds)

    def submit_veto(self, veto: VetoDecision) -> None:
        if veto.artifact_id != self.artifact_id:
            raise ValueError(f"Veto artifact_id mismatch: expected {self.artifact_id}, got {veto.artifact_id}")
        if self.config.require_evidence and not veto.evidence:
            raise ValueError("Veto must include evidence when require_evidence is True")
        if veto.confidence < self.config.min_confidence:
            logger.warning("Veto confidence %.2f below threshold %.2f",
                           veto.confidence, self.config.min_confidence)
        self._vetoes.append(veto)
        self._status = VetoLoopStatus.IN_PROGRESS
        logger.info("Veto submitted by %s: %s", veto.agent_id, veto.reason[:80])

    def submit_counter_proposal(self, proposal: VetoDecision) -> None:
        proposal.is_counter_proposal = True
        self._counter_proposals.append(proposal)
        logger.info("Counter-proposal from %s: %s", proposal.agent_id, proposal.reason[:80])

    def cast_vote(self, vote: Vote) -> None:
        self._votes.append(vote)
        logger.info("Vote cast by %s: %s", vote.agent_id, vote.result.value)

    def resolve_round(self) -> dict[str, Any]:
        if not self._vetoes and not self._counter_proposals:
            self._status = VetoLoopStatus.APPROVED
            return {"status": "approved", "reason": "No vetoes submitted"}

        round_result = VetoRound(
            round_number=self._current_round + 1,
            vetoes=list(self._vetoes),
            counter_proposals=list(self._counter_proposals),
            votes=list(self._votes),
        )
        self._rounds.append(round_result)
        self._current_round += 1

        resolution = self._evaluate_round()
        round_result.resolution = resolution.get("resolution", "")

        self._vetoes.clear()
        self._counter_proposals.clear()
        self._votes.clear()

        if resolution["status"] == "approved":
            self._status = VetoLoopStatus.APPROVED
        elif resolution["status"] == "rejected":
            self._status = VetoLoopStatus.REJECTED
        elif resolution["status"] == "escalated":
            self._status = VetoLoopStatus.ESCALATED
        elif resolution["status"] == "continue":
            if self._current_round >= self.config.max_rounds:
                self._status = VetoLoopStatus.ESCALATED
                resolution["status"] = "escalated"
                resolution["reason"] = "Max rounds reached"
            else:
                self._status = VetoLoopStatus.IN_PROGRESS

        return resolution

    def _evaluate_round(self) -> dict[str, Any]:
        if self._votes:
            return self._evaluate_by_voting()
        if self.adjudicator_fn and self._vetoes:
            return self._evaluate_by_adjudicator()
        return self._evaluate_by_severity()

    def _evaluate_by_voting(self) -> dict[str, Any]:
        approve_count = sum(1 for v in self._votes if v.result == VoteResult.APPROVE)
        reject_count = sum(1 for v in self._votes if v.result == VoteResult.REJECT)
        total = approve_count + reject_count

        if total == 0:
            return {"status": "continue", "reason": "No votes cast"}

        approve_ratio = approve_count / total
        if approve_ratio > self.config.majority_threshold:
            return {"status": "approved", "reason": f"Majority approved ({approve_count}/{total})"}
        elif approve_ratio < (1 - self.config.majority_threshold):
            return {"status": "rejected", "reason": f"Majority rejected ({reject_count}/{total})"}
        else:
            return {"status": "continue", "reason": f"Split vote ({approve_count}A/{reject_count}R)"}

    def _evaluate_by_adjudicator(self) -> dict[str, Any]:
        try:
            result = self.adjudicator_fn(self._vetoes)
            return result
        except Exception as exc:
            logger.error("Adjudicator failed: %s", exc)
            return self._evaluate_by_severity()

    def _evaluate_by_severity(self) -> dict[str, Any]:
        if not self._vetoes:
            return {"status": "approved", "reason": "No vetoes"}

        critical_vetoes = [v for v in self._vetoes if v.severity == "critical"]
        high_confidence = [v for v in self._vetoes if v.confidence >= 0.8]

        if critical_vetoes and len(high_confidence) >= 2:
            return {
                "status": "rejected",
                "reason": f"{len(critical_vetoes)} critical vetoes with high confidence",
            }
        elif self._counter_proposals:
            return {
                "status": "continue",
                "reason": "Counter-proposals submitted for review",
            }
        elif len(self._vetoes) >= 3:
            return {
                "status": "rejected",
                "reason": f"Multiple vetoes ({len(self._vetoes)})",
            }

        return {
            "status": "continue",
            "reason": f"Vetoes present ({len(self._vetoes)}) but below rejection threshold",
        }

    def get_evidence_summary(self) -> list[dict[str, Any]]:
        evidence_list = []
        for round_data in self._rounds:
            for veto in round_data.vetoes:
                evidence_list.append({
                    "round": round_data.round_number,
                    "agent_id": veto.agent_id,
                    "reason": veto.reason,
                    "evidence": veto.evidence,
                    "confidence": veto.confidence,
                    "severity": veto.severity,
                })
        return evidence_list

    def summary(self) -> dict[str, Any]:
        return {
            "artifact_id": self.artifact_id,
            "status": self._status.value,
            "total_rounds": self._current_round,
            "total_vetoes": self.total_vetoes,
            "total_counter_proposals": len(self._counter_proposals),
            "max_rounds": self.config.max_rounds,
        }
