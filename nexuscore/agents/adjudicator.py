"""
NexusCode Adjudicator Agent

Resolves disagreements between agents, makes final decisions
when consensus fails, evaluates competing proposals, and
documents resolution rationale.
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any, Optional

from nexuscore.agents.base_agent import BaseAgent
from nexuscore.models import (
    AgentMessage,
    AgentRole,
    ReviewResult,
    Task,
    Verdict,
    VetoDecision,
)

logger = logging.getLogger(__name__)


class AdjudicatorAgent(BaseAgent):
    role = AgentRole.ADJUDICATOR

    def _default_capabilities(self) -> list[str]:
        return [
            "conflict_resolution",
            "decision_making",
            "trade_off_evaluation",
            "consensus_building",
            "arbitration",
        ]

    def _default_permissions(self) -> list[str]:
        return [
            "resolve_conflicts",
            "make_final_decisions",
            "override_vetoes",
            "read_all_reviews",
            "document_decisions",
        ]

    async def think(self, context: dict[str, Any]) -> dict[str, Any]:
        conflicts = context.get("conflicts", [])
        vetoes = context.get("vetoes", [])
        plan = {
            "conflicts": conflicts,
            "vetoes": vetoes,
            "resolution_strategy": "weighted_scoring",
            "factors": [
                "severity_of_issues",
                "confidence_levels",
                "evidence_quality",
                "impact_on_deadline",
                "security_implications",
            ],
        }
        return plan

    async def act(self, plan: dict[str, Any]) -> dict[str, Any]:
        resolutions = []
        for veto in plan.get("vetoes", []):
            resolution = self._resolve_veto(veto, plan)
            resolutions.append(resolution)
        conflicts = plan.get("conflicts", [])
        for conflict in conflicts:
            resolution = self._resolve_conflict(conflict, plan)
            resolutions.append(resolution)
        return {
            "resolutions": resolutions,
            "total_resolved": len(resolutions),
            "overrides": sum(1 for r in resolutions if r.get("overridden", False)),
        }

    async def communicate(self, message: AgentMessage) -> Optional[AgentMessage]:
        self.handle_message(message)
        content = message.content.lower()
        if "conflict" in content or "disagree" in content:
            return self.send_message(
                "I see a conflict between agents. I'll evaluate both positions "
                "and make a fair decision based on evidence and impact.",
                channel_id=message.channel_id or "general",
                reply_to=message.id,
            )
        elif "veto" in content:
            return self.send_message(
                "A veto has been raised. I'll evaluate the evidence and "
                "determine if the veto is justified or should be overridden.",
                channel_id=message.channel_id or "review",
                reply_to=message.id,
            )
        elif "decide" in content or "adjudicate" in content:
            return self.send_message(
                "I'll adjudicate this decision. Evaluating all perspectives, "
                "evidence, and potential impacts before ruling.",
                channel_id=message.channel_id or "general",
                reply_to=message.id,
            )
        return None

    def _resolve_veto(self, veto: dict[str, Any], plan: dict[str, Any]) -> dict[str, Any]:
        severity = veto.get("severity", "warning")
        confidence = veto.get("confidence", 0.5)
        evidence = veto.get("evidence", [])
        has_evidence = len(evidence) > 0
        should_override = False
        if severity == "info" and confidence < 0.6:
            should_override = True
        elif severity == "warning" and not has_evidence:
            should_override = True
        elif severity == "critical" and has_evidence and confidence > 0.8:
            should_override = False
        else:
            should_override = confidence < 0.7 or not has_evidence
        resolution = {
            "veto_id": veto.get("id", "unknown"),
            "agent_id": veto.get("agent_id", "unknown"),
            "original_reason": veto.get("reason", ""),
            "overridden": should_override,
            "resolution": "Veto sustained" if not should_override else "Veto overridden",
            "rationale": self._generate_rationale(veto, should_override),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        self._log_audit("veto_resolution", {
            "veto_id": veto.get("id"),
            "overridden": should_override,
        })
        return resolution

    def _resolve_conflict(self, conflict: dict[str, Any], plan: dict[str, Any]) -> dict[str, Any]:
        side_a = conflict.get("side_a", {})
        side_b = conflict.get("side_b", {})
        score_a = self._score_position(side_a)
        score_b = self._score_position(side_b)
        winner = "side_a" if score_a >= score_b else "side_b"
        return {
            "conflict_id": conflict.get("id", "unknown"),
            "side_a_score": score_a,
            "side_b_score": score_b,
            "winner": winner,
            "resolution": f"Resolved in favor of {winner}",
            "rationale": f"Score A: {score_a:.2f} vs Score B: {score_b:.2f}",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    def _score_position(self, position: dict[str, Any]) -> float:
        score = 0.0
        confidence = position.get("confidence", 0.5)
        evidence_count = len(position.get("evidence", []))
        severity = position.get("severity", "warning")
        score += confidence * 0.4
        score += min(evidence_count / 5, 1.0) * 0.3
        severity_scores = {"info": 0.1, "warning": 0.5, "error": 0.7, "critical": 0.9}
        score += severity_scores.get(severity, 0.5) * 0.3
        return score

    def _generate_rationale(self, veto: dict[str, Any], overridden: bool) -> str:
        confidence = veto.get("confidence", 0.5)
        evidence = veto.get("evidence", [])
        if overridden:
            return (
                f"Veto overridden: confidence ({confidence:.2f}) is below threshold "
                f"and/or insufficient evidence ({len(evidence)} items provided). "
                f"Recommend addressing concerns iteratively."
            )
        else:
            return (
                f"Veto sustained: confidence ({confidence:.2f}) is above threshold "
                f"with adequate evidence ({len(evidence)} items). "
                f"Recommend addressing issues before proceeding."
            )

    def break_tie(self, proposals: list[dict[str, Any]]) -> dict[str, Any]:
        if not proposals:
            return {"winner": None, "rationale": "No proposals to evaluate"}
        scored = [(p, self._score_position(p)) for p in proposals]
        scored.sort(key=lambda x: x[1], reverse=True)
        winner = scored[0][0]
        return {
            "winner": winner,
            "score": scored[0][1],
            "rationale": f"Selected proposal with highest score: {scored[0][1]:.2f}",
        }
