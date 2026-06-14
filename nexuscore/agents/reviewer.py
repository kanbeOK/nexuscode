"""
NexusCode Reviewer Agent

Cooperative code review focused on quality, style, best practices,
and constructive feedback. Works alongside the red_teamer for
adversarial dual review.
"""

from __future__ import annotations

import logging
import re
from datetime import datetime, timezone
from typing import Any, Optional

from nexuscore.agents.base_agent import BaseAgent
from nexuscore.models import (
    AgentMessage,
    AgentRole,
    ReviewIssue,
    ReviewResult,
    Task,
    Verdict,
)

logger = logging.getLogger(__name__)

STYLE_RULES = {
    "no_trailing_whitespace": re.compile(r" +$"),
    "max_line_length": 120,
    "must_have_docstring": re.compile(r'^\s*(class|def)\s+'),
    "no_bare_except": re.compile(r"except\s*:"),
    "no_print_statements": re.compile(r"^\s*print\s*\("),
    "must_have_type_hints": re.compile(r"def\s+\w+\((?!.*:\s*\w+)"),
}

SECURITY_PATTERNS = {
    "eval_usage": re.compile(r"\beval\s*\("),
    "exec_usage": re.compile(r"\bexec\s*\("),
    "hardcoded_secret": re.compile(r"(password|secret|token)\s*=\s*['\"][^'\"]+['\"]", re.IGNORECASE),
    "sql_injection_risk": re.compile(r"f['\"].*\{.*\}.*SELECT|\.format\(.*SELECT", re.IGNORECASE),
}


class ReviewerAgent(BaseAgent):
    role = AgentRole.REVIEWER

    def _default_capabilities(self) -> list[str]:
        return [
            "code_review",
            "style_checking",
            "quality_assessment",
            "best_practices",
            "documentation_review",
        ]

    def _default_permissions(self) -> list[str]:
        return [
            "read_code",
            "submit_reviews",
            "suggest_changes",
            "approve_code",
        ]

    async def think(self, context: dict[str, Any]) -> dict[str, Any]:
        artifacts = context.get("artifacts", [])
        review_plan = {
            "artifacts_to_review": [],
            "check_categories": [
                "style",
                "quality",
                "documentation",
                "error_handling",
                "security",
                "performance",
            ],
        }
        for artifact in artifacts:
            review_plan["artifacts_to_review"].append({
                "path": artifact.get("path", ""),
                "content": artifact.get("content", ""),
                "language": artifact.get("language", "python"),
            })
        return review_plan

    async def act(self, plan: dict[str, Any]) -> list[ReviewResult]:
        results = []
        for artifact_info in plan.get("artifacts_to_review", []):
            content = artifact_info.get("content", "")
            path = artifact_info.get("path", "")
            issues = self._review_code(content, path)
            suggestions = self._generate_suggestions(content, issues)
            verdict = Verdict.APPROVED if not issues else (
                Verdict.REJECTED if any(i.severity == "error" for i in issues) else Verdict.CONDITIONAL
            )
            result = ReviewResult(
                artifact_id=path,
                reviewer_agent_id=self.agent_id,
                verdict=verdict,
                issues=issues,
                suggestions=suggestions,
                confidence=0.85,
                summary=self._generate_summary(issues, suggestions),
            )
            results.append(result)
        return results

    async def communicate(self, message: AgentMessage) -> Optional[AgentMessage]:
        self.handle_message(message)
        content = message.content.lower()
        if "review" in content:
            return self.send_message(
                "I'll perform a cooperative code review. Checking style, "
                "quality, documentation, and best practices.",
                channel_id=message.channel_id or "review",
                reply_to=message.id,
            )
        elif "approved" in content:
            return self.send_message(
                "The code meets quality standards. Minor suggestions available "
                "for future improvements.",
                channel_id=message.channel_id or "review",
                reply_to=message.id,
            )
        return None

    def _review_code(self, content: str, path: str) -> list[ReviewIssue]:
        issues = []
        lines = content.split("\n")
        issues.extend(self._check_style(lines, path))
        issues.extend(self._check_quality(lines, path))
        issues.extend(self._check_security(lines, path))
        issues.extend(self._check_documentation(lines, path))
        issues.extend(self._check_error_handling(lines, path))
        return issues

    def _check_style(self, lines: list[str], path: str) -> list[ReviewIssue]:
        issues = []
        for i, line in enumerate(lines, 1):
            if STYLE_RULES["no_trailing_whitespace"].search(line):
                issues.append(ReviewIssue(
                    severity="info",
                    category="style",
                    file_path=path,
                    line_number=i,
                    description="Trailing whitespace detected",
                    suggestion="Remove trailing whitespace",
                ))
            if len(line) > STYLE_RULES["max_line_length"]:
                issues.append(ReviewIssue(
                    severity="info",
                    category="style",
                    file_path=path,
                    line_number=i,
                    description=f"Line exceeds {STYLE_RULES['max_line_length']} characters",
                    suggestion="Break line or extract to variable",
                ))
        return issues

    def _check_quality(self, lines: list[str], path: str) -> list[ReviewIssue]:
        issues = []
        if STYLE_RULES["no_bare_except"].search("\n".join(lines)):
            issues.append(ReviewIssue(
                severity="warning",
                category="quality",
                file_path=path,
                description="Bare except clause detected",
                suggestion="Use specific exception types (e.g., except Exception:)",
            ))
        if STYLE_RULES["no_print_statements"].search("\n".join(lines)):
            issues.append(ReviewIssue(
                severity="info",
                category="quality",
                file_path=path,
                description="Print statement found in production code",
                suggestion="Use logging instead of print()",
            ))
        return issues

    def _check_security(self, lines: list[str], path: str) -> list[ReviewIssue]:
        issues = []
        full_content = "\n".join(lines)
        for rule_name, pattern in SECURITY_PATTERNS.items():
            if pattern.search(full_content):
                severity = "error" if "eval" in rule_name or "exec" in rule_name else "warning"
                issues.append(ReviewIssue(
                    severity=severity,
                    category="security",
                    file_path=path,
                    description=f"Security concern: {rule_name.replace('_', ' ')}",
                    suggestion=f"Review and address {rule_name.replace('_', ' ')} usage",
                ))
        return issues

    def _check_documentation(self, lines: list[str], path: str) -> list[ReviewIssue]:
        issues = []
        in_class = False
        in_def = False
        for i, line in enumerate(lines, 1):
            if STYLE_RULES["must_have_docstring"].match(line):
                if "class " in line:
                    in_class = True
                elif "def " in line:
                    in_def = True
                next_line = lines[i] if i < len(lines) else ""
                has_docstring = '"""' in next_line or "'''" in next_line
                if not has_docstring and (in_class or in_def):
                    issues.append(ReviewIssue(
                        severity="info",
                        category="documentation",
                        file_path=path,
                        line_number=i,
                        description="Missing docstring",
                        suggestion="Add a docstring to document the purpose",
                    ))
                    in_class = False
                    in_def = False
        return issues

    def _check_error_handling(self, lines: list[str], path: str) -> list[ReviewIssue]:
        issues = []
        full_content = "\n".join(lines)
        has_try = "try:" in full_content
        has_except = "except" in full_content
        if "async def" in full_content and not has_try and len(lines) > 20:
            issues.append(ReviewIssue(
                severity="warning",
                category="quality",
                file_path=path,
                description="No error handling in substantial async function",
                suggestion="Consider adding try/except blocks for error resilience",
            ))
        return issues

    def _generate_suggestions(self, content: str, issues: list[ReviewIssue]) -> list[str]:
        suggestions = []
        if not issues:
            suggestions.append("Code looks good! Consider adding more tests.")
        else:
            error_count = sum(1 for i in issues if i.severity == "error")
            warning_count = sum(1 for i in issues if i.severity == "warning")
            if error_count > 0:
                suggestions.append(f"Address {error_count} error(s) before merging")
            if warning_count > 0:
                suggestions.append(f"Consider fixing {warning_count} warning(s)")
            suggestions.append("Run linter and type checker after fixes")
        return suggestions

    def _generate_summary(self, issues: list[ReviewIssue], suggestions: list[str]) -> str:
        if not issues:
            return "Code review passed with no issues found."
        error_count = sum(1 for i in issues if i.severity == "error")
        warning_count = sum(1 for i in issues if i.severity == "warning")
        info_count = sum(1 for i in issues if i.severity == "info")
        return (
            f"Found {len(issues)} issues: {error_count} errors, "
            f"{warning_count} warnings, {info_count} info. "
            f"{len(suggestions)} suggestion(s) provided."
        )
