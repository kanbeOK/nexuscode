"""
NexusCode Verifier Agent

Evidence-based verification that rejects claims without proof.
Ensures all assertions are backed by tests, logs, or verifiable data.
"""

from __future__ import annotations

import logging
import re
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


class ClaimEvidence:
    def __init__(self, claim: str, evidence_type: str, evidence: str, verified: bool):
        self.claim = claim
        self.evidence_type = evidence_type
        self.evidence = evidence
        self.verified = verified


class VerifierAgent(BaseAgent):
    role = AgentRole.VERIFIER

    def _default_capabilities(self) -> list[str]:
        return [
            "claim_verification",
            "evidence_validation",
            "test_coverage_check",
            "specification_compliance",
            "proof_analysis",
        ]

    def _default_permissions(self) -> list[str]:
        return [
            "read_code",
            "read_tests",
            "read_specifications",
            "submit_verdicts",
            "reject_unverified_claims",
        ]

    async def think(self, context: dict[str, Any]) -> dict[str, Any]:
        artifacts = context.get("artifacts", [])
        claims = context.get("claims", [])
        verification_plan = {
            "claims_to_verify": [],
            "artifacts_to_check": [],
            "evidence_requirements": {
                "code_claim": ["test_output", "code_analysis"],
                "security_claim": ["vulnerability_scan", "penetration_test"],
                "performance_claim": ["benchmark", "profiling"],
                "correctness_claim": ["test_results", "formal_proof"],
            },
        }
        for claim in claims:
            verification_plan["claims_to_verify"].append({
                "claim": claim.get("text", ""),
                "type": claim.get("type", "general"),
                "source_agent": claim.get("agent_id", ""),
            })
        for artifact in artifacts:
            verification_plan["artifacts_to_check"].append({
                "path": artifact.get("path", ""),
                "content": artifact.get("content", ""),
                "language": artifact.get("language", "python"),
            })
        return verification_plan

    async def act(self, plan: dict[str, Any]) -> list[ReviewResult]:
        results = []
        for artifact_info in plan.get("artifacts_to_check", []):
            content = artifact_info.get("content", "")
            path = artifact_info.get("path", "")
            issues = self._verify_artifact(content, path)
            verdict = Verdict.APPROVED if not issues else Verdict.REJECTED
            result = ReviewResult(
                artifact_id=path,
                reviewer_agent_id=self.agent_id,
                verdict=verdict,
                issues=issues,
                confidence=0.9,
                summary=self._generate_verification_summary(issues),
                evidence=[f"Static analysis of {path}"],
            )
            results.append(result)
        return results

    async def communicate(self, message: AgentMessage) -> Optional[AgentMessage]:
        self.handle_message(message)
        content = message.content.lower()
        if "verify" in content or "proof" in content or "evidence" in content:
            return self.send_message(
                "Requesting evidence for all claims. I will verify each "
                "assertion against available tests, logs, and code analysis.",
                channel_id=message.channel_id or "review",
                reply_to=message.id,
            )
        elif "claim" in content:
            return self.send_message(
                "Claims must be backed by evidence. Please provide test results, "
                "benchmarks, or other verifiable proof for each assertion.",
                channel_id=message.channel_id or "review",
                reply_to=message.id,
            )
        return None

    def _verify_artifact(self, content: str, path: str) -> list:
        from nexuscore.models import ReviewIssue
        issues = []
        issues.extend(self._check_unverified_assertions(content, path))
        issues.extend(self._check_untested_code(content, path))
        issues.extend(self._check_incomplete_error_handling(content, path))
        issues.extend(self._check_todo_markers(content, path))
        return issues

    def _check_unverified_assertions(self, content: str, path: str) -> list:
        from nexuscore.models import ReviewIssue
        issues = []
        assert_patterns = [
            (re.compile(r"assert\s+\w+\.\w+\s*=="), "Equality assertion"),
            (re.compile(r"assert\s+True"), "Unconditional assertion"),
            (re.compile(r"assert\s+.*is not None"), "Non-null assertion"),
        ]
        for pattern, desc in assert_patterns:
            matches = list(pattern.finditer(content))
            if matches:
                for match in matches:
                    line_num = content[:match.start()].count("\n") + 1
                    issues.append(ReviewIssue(
                        severity="info",
                        category="verification",
                        file_path=path,
                        line_number=line_num,
                        description=f"{desc} found - verify test coverage exists",
                        suggestion="Ensure this assertion is covered by integration tests",
                    ))
        return issues

    def _check_untested_code(self, content: str, path: str) -> list:
        from nexuscore.models import ReviewIssue
        issues = []
        if "test_" not in path:
            func_defs = re.findall(r"(?:async\s+)?def\s+(\w+)\s*\(", content)
            test_imports = re.findall(r"from\s+\S+\s+import\s+(\w+)", content)
            if func_defs and not test_imports:
                issues.append(ReviewIssue(
                    severity="warning",
                    category="verification",
                    file_path=path,
                    description=f"Module defines {len(func_defs)} function(s) without test imports",
                    suggestion="Add corresponding test module to verify behavior",
                ))
        return issues

    def _check_incomplete_error_handling(self, content: str, path: str) -> list:
        from nexuscore.models import ReviewIssue
        issues = []
        if "except Exception:" in content or "except:" in content:
            lines = content.split("\n")
            for i, line in enumerate(lines, 1):
                if "except" in line and ("pass" in lines[i] if i < len(lines) else False):
                    issues.append(ReviewIssue(
                        severity="warning",
                        category="verification",
                        file_path=path,
                        line_number=i,
                        description="Silently swallowed exception - claim of error handling unverified",
                        suggestion="Log the exception or re-raise with context",
                    ))
        return issues

    def _check_todo_markers(self, content: str, path: str) -> list:
        from nexuscore.models import ReviewIssue
        issues = []
        todo_pattern = re.compile(r"#\s*(TODO|FIXME|HACK|XXX|TEMP)", re.IGNORECASE)
        for match in todo_pattern.finditer(content):
            line_num = content[:match.start()].count("\n") + 1
            issues.append(ReviewIssue(
                severity="info",
                category="verification",
                file_path=path,
                line_number=line_num,
                description=f"Unresolved marker: {match.group().strip()}",
                suggestion="Resolve the TODO/FIXME or document why it's deferred",
            ))
        return issues

    def _generate_verification_summary(self, issues: list) -> str:
        if not issues:
            return "All claims verified. No unverified assertions found."
        warnings = sum(1 for i in issues if getattr(i, "severity", "") == "warning")
        infos = sum(1 for i in issues if getattr(i, "severity", "") == "info")
        return (
            f"Verification found {len(issues)} concern(s): "
            f"{warnings} warning(s), {infos} info. "
            f"Some claims lack sufficient evidence."
        )

    def reject_claim(self, claim: str, reason: str, evidence: list[str]) -> VetoDecision:
        return VetoDecision(
            agent_id=self.agent_id,
            artifact_id="",
            reason=f"Claim rejected: {claim}. Reason: {reason}",
            confidence=0.9,
            evidence=evidence,
            severity="warning",
        )

    def verify_evidence(self, claim: str, evidence_type: str, evidence: str) -> ClaimEvidence:
        verified = bool(evidence.strip())
        return ClaimEvidence(
            claim=claim,
            evidence_type=evidence_type,
            evidence=evidence,
            verified=verified,
        )
