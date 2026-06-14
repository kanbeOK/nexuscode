"""
NexusCode Red Teamer Agent

Adversarial security review agent that actively tries to find
vulnerabilities, edge cases, and logical flaws in code and designs.
Works alongside the cooperative reviewer for dual review.
"""

from __future__ import annotations

import logging
import re
from typing import Any, Optional

from nexuscore.agents.base_agent import BaseAgent
from nexuscore.models import (
    AgentMessage,
    AgentRole,
    ReviewIssue,
    ReviewResult,
    Task,
    Verdict,
    VetoDecision,
)

logger = logging.getLogger(__name__)

VULNERABILITY_PATTERNS = {
    "injection": [
        re.compile(r"\beval\s*\("),
        re.compile(r"\bexec\s*\("),
        re.compile(r"os\.system\s*\("),
        re.compile(r"subprocess\.call\s*\(\s*['\"]"),
    ],
    "secrets": [
        re.compile(r"(password|secret|api_key|token)\s*=\s*['\"][^'\"]+['\"]", re.IGNORECASE),
        re.compile(r"AKIA[0-9A-Z]{16}"),
    ],
    "auth_bypass": [
        re.compile(r"if\s+(True|1)\s*:", re.MULTILINE),
        re.compile(r"#.*skip.*auth", re.IGNORECASE),
        re.compile(r"disabled.*=.*True.*#.*security", re.IGNORECASE),
    ],
    "data_exposure": [
        re.compile(r"print\s*\(.*password"),
        re.compile(r"log.*\{.*password"),
        re.compile(r"response.*password"),
    ],
    "resource_exhaustion": [
        re.compile(r"while\s+True\s*:"),
        re.compile(r"for\s+.*\s+in\s+range\s*\(\s*10\s*\*\*\s*"),
        re.compile(r"\.append\s*\(.*\)\s*#.*unbounded", re.IGNORECASE),
    ],
    "race_condition": [
        re.compile(r"global\s+\w+"),
        re.compile(r"shared.*=.*\[\]", re.IGNORECASE),
    ],
}

ATTACK_VECTORS = [
    "empty_input",
    "very_long_input",
    "special_characters",
    "negative_numbers",
    "zero_division",
    "null_none",
    "concurrent_access",
    "permission_escalation",
    "denial_of_service",
    "data_injection",
]


class RedTeamerAgent(BaseAgent):
    role = AgentRole.RED_TEAMER

    def _default_capabilities(self) -> list[str]:
        return [
            "security_analysis",
            "vulnerability_detection",
            "penetration_thinking",
            "adversarial_testing",
            "edge_case_identification",
        ]

    def _default_permissions(self) -> list[str]:
        return [
            "read_code",
            "submit_vetoes",
            "flag_vulnerabilities",
            "propose_counter_measures",
        ]

    async def think(self, context: dict[str, Any]) -> dict[str, Any]:
        artifacts = context.get("artifacts", [])
        plan = {
            "attack_surface": [],
            "vulnerability_checks": list(VULNERABILITY_PATTERNS.keys()),
            "attack_vectors": ATTACK_VECTORS,
            "artifacts": [],
        }
        for artifact in artifacts:
            plan["artifacts"].append({
                "path": artifact.get("path", ""),
                "content": artifact.get("content", ""),
                "language": artifact.get("language", "python"),
            })
        return plan

    async def act(self, plan: dict[str, Any]) -> list[ReviewResult]:
        results = []
        for artifact_info in plan.get("artifacts", []):
            content = artifact_info.get("content", "")
            path = artifact_info.get("path", "")
            vulnerabilities = self._scan_vulnerabilities(content, path)
            attack_results = self._simulate_attacks(content, path)
            all_issues = vulnerabilities + attack_results
            verdict = Verdict.APPROVED if not all_issues else (
                Verdict.REJECTED if any(i.severity == "critical" for i in all_issues) else Verdict.CONDITIONAL
            )
            confidence = 0.7 if all_issues else 0.9
            result = ReviewResult(
                artifact_id=path,
                reviewer_agent_id=self.agent_id,
                verdict=verdict,
                issues=all_issues,
                suggestions=self._suggest_mitigations(all_issues),
                confidence=confidence,
                summary=self._generate_adversarial_summary(all_issues),
                requires_human_gate=any(i.severity == "critical" for i in all_issues),
            )
            results.append(result)
        return results

    async def communicate(self, message: AgentMessage) -> Optional[AgentMessage]:
        self.handle_message(message)
        content = message.content.lower()
        if "red" in content or "security" in content or "attack" in content:
            return self.send_message(
                "Initiating adversarial review. I'll attempt to break the "
                "implementation and identify security vulnerabilities.",
                channel_id=message.channel_id or "security",
                reply_to=message.id,
            )
        elif "vulnerability" in content or "vuln" in content:
            return self.send_message(
                "Scanning for known vulnerability patterns and injection points. "
                "Testing edge cases and error conditions.",
                channel_id=message.channel_id or "security",
                reply_to=message.id,
            )
        return None

    def _scan_vulnerabilities(self, content: str, path: str) -> list[ReviewIssue]:
        issues = []
        for category, patterns in VULNERABILITY_PATTERNS.items():
            for pattern in patterns:
                matches = pattern.finditer(content)
                for match in matches:
                    line_num = content[:match.start()].count("\n") + 1
                    severity = self._classify_severity(category)
                    issues.append(ReviewIssue(
                        severity=severity,
                        category="security",
                        file_path=path,
                        line_number=line_num,
                        description=f"Potential {category}: `{match.group().strip()}`",
                        suggestion=self._get_mitigation(category),
                    ))
        return issues

    def _simulate_attacks(self, content: str, path: str) -> list[ReviewIssue]:
        issues = []
        if "def " in content:
            func_names = re.findall(r"def\s+(\w+)\s*\(", content)
            for func_name in func_names:
                if not func_name.startswith("_"):
                    has_input_validation = "if" in content and ("raise" in content or "assert" in content)
                    if not has_input_validation:
                        issues.append(ReviewIssue(
                            severity="warning",
                            category="security",
                            file_path=path,
                            description=f"Function `{func_name}` lacks input validation",
                            suggestion=f"Add input validation to `{func_name}` to prevent abuse",
                        ))
        if "open(" in content and "with" not in content:
            issues.append(ReviewIssue(
                severity="warning",
                category="security",
                file_path=path,
                description="File opened without context manager",
                suggestion="Use `with open(...)` to ensure proper resource cleanup",
            ))
        return issues

    def _classify_severity(self, category: str) -> str:
        severity_map = {
            "injection": "critical",
            "secrets": "critical",
            "auth_bypass": "critical",
            "data_exposure": "error",
            "resource_exhaustion": "warning",
            "race_condition": "warning",
        }
        return severity_map.get(category, "warning")

    def _get_mitigation(self, category: str) -> str:
        mitigations = {
            "injection": "Use parameterized queries and input sanitization. Never use eval/exec with user input.",
            "secrets": "Use environment variables or secret managers. Never hardcode credentials.",
            "auth_bypass": "Remove bypass shortcuts. Implement proper authorization checks.",
            "data_exposure": "Sanitize logs and outputs. Use structured logging with field filtering.",
            "resource_exhaustion": "Add bounds checking, rate limiting, and resource quotas.",
            "race_condition": "Use locks or atomic operations. Prefer thread-safe data structures.",
        }
        return mitigations.get(category, "Review and apply appropriate security controls.")

    def _suggest_mitigations(self, issues: list[ReviewIssue]) -> list[str]:
        mitigations = []
        seen_categories = set()
        for issue in issues:
            if issue.category not in seen_categories:
                seen_categories.add(issue.category)
                if issue.severity == "critical":
                    mitigations.append(f"CRITICAL: {issue.suggestion}")
                else:
                    mitigations.append(issue.suggestion)
        if not mitigations:
            mitigations.append("No critical vulnerabilities found. Continue monitoring.")
        return mitigations

    def _generate_adversarial_summary(self, issues: list[ReviewIssue]) -> str:
        if not issues:
            return "Adversarial review found no vulnerabilities. Code is resilient to basic attacks."
        critical = sum(1 for i in issues if i.severity == "critical")
        errors = sum(1 for i in issues if i.severity == "error")
        warnings = sum(1 for i in issues if i.severity == "warning")
        parts = [f"Adversarial review found {len(issues)} issue(s)"]
        if critical:
            parts.append(f"{critical} critical vulnerabilities")
        if errors:
            parts.append(f"{errors} errors")
        if warnings:
            parts.append(f"{warnings} warnings")
        return ". ".join(parts) + "."

    def create_veto(self, artifact_id: str, reason: str, evidence: list[str]) -> VetoDecision:
        return VetoDecision(
            agent_id=self.agent_id,
            artifact_id=artifact_id,
            reason=reason,
            confidence=0.85,
            evidence=evidence,
            severity="critical",
        )
