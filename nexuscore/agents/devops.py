"""
NexusCode DevOps Agent

Manages deployment pipelines, environment configuration,
monitoring setup, and rollback procedures.
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any, Optional

from nexuscore.agents.base_agent import BaseAgent
from nexuscore.models import (
    AgentMessage,
    AgentRole,
    CodeArtifact,
    ReviewResult,
    Task,
    Verdict,
)

logger = logging.getLogger(__name__)


class DevOpsAgent(BaseAgent):
    role = AgentRole.DEVOPS

    def _default_capabilities(self) -> list[str]:
        return [
            "deployment_management",
            "environment_configuration",
            "monitoring_setup",
            "rollback_procedures",
            "infrastructure_as_code",
            "pipeline_management",
        ]

    def _default_permissions(self) -> list[str]:
        return [
            "manage_deployments",
            "configure_environments",
            "set_up_monitoring",
            "execute_rollbacks",
            "read_code",
            "read_configurations",
        ]

    _deployment_history: list[dict[str, Any]] = []

    async def think(self, context: dict[str, Any]) -> dict[str, Any]:
        task_data = context.get("task", {})
        artifacts = context.get("artifacts", [])
        plan = {
            "task": task_data,
            "deployment_steps": [],
            "environments": ["development", "staging", "production"],
            "health_checks": [],
            "rollback_strategy": "blue_green",
            "monitoring": [],
            "artifacts": artifacts,
        }
        plan["deployment_steps"] = self._plan_deployment_steps(task_data)
        plan["health_checks"] = self._plan_health_checks(task_data)
        plan["monitoring"] = self._plan_monitoring(task_data)
        return plan

    async def act(self, plan: dict[str, Any]) -> dict[str, Any]:
        results = {
            "deployment_status": "pending",
            "steps_completed": [],
            "health_check_results": [],
            "monitoring_configured": False,
            "artifacts": [],
        }
        for step in plan.get("deployment_steps", []):
            step_result = self._execute_deployment_step(step)
            results["steps_completed"].append(step_result)
        for check in plan.get("health_checks", []):
            check_result = self._run_health_check(check)
            results["health_check_results"].append(check_result)
        results["monitoring_configured"] = self._configure_monitoring(
            plan.get("monitoring", [])
        )
        all_passed = all(
            s.get("status") == "success" for s in results["steps_completed"]
        )
        results["deployment_status"] = "success" if all_passed else "failed"
        dockerfile = self._generate_dockerfile(plan)
        results["artifacts"].append(dockerfile)
        ci_config = self._generate_ci_config(plan)
        results["artifacts"].append(ci_config)
        return results

    async def communicate(self, message: AgentMessage) -> Optional[AgentMessage]:
        self.handle_message(message)
        content = message.content.lower()
        if "deploy" in content:
            return self.send_message(
                "Preparing deployment. Setting up environment, health checks, "
                "and monitoring configuration.",
                channel_id=message.channel_id or "development",
                reply_to=message.id,
            )
        elif "rollback" in content:
            return self.send_message(
                "Initiating rollback procedure. Reverting to the last known "
                "good state and verifying system health.",
                channel_id=message.channel_id or "emergency",
                reply_to=message.id,
            )
        elif "monitor" in content or "health" in content:
            return self.send_message(
                "Configuring monitoring and health checks. Setting up "
                "alerts for critical thresholds.",
                channel_id=message.channel_id or "development",
                reply_to=message.id,
            )
        return None

    def _plan_deployment_steps(self, task_data: dict[str, Any]) -> list[dict[str, Any]]:
        return [
            {"step": "validate_artifacts", "description": "Verify all deployment artifacts exist"},
            {"step": "run_tests", "description": "Execute pre-deployment test suite"},
            {"step": "build", "description": "Build deployment package"},
            {"step": "deploy_staging", "description": "Deploy to staging environment"},
            {"step": "smoke_test", "description": "Run smoke tests on staging"},
            {"step": "deploy_production", "description": "Deploy to production"},
            {"step": "verify_production", "description": "Verify production deployment"},
        ]

    def _plan_health_checks(self, task_data: dict[str, Any]) -> list[dict[str, Any]]:
        return [
            {"name": "liveness", "endpoint": "/health", "timeout": 5},
            {"name": "readiness", "endpoint": "/ready", "timeout": 10},
            {"name": "startup", "endpoint": "/startup", "timeout": 30},
        ]

    def _plan_monitoring(self, task_data: dict[str, Any]) -> list[dict[str, Any]]:
        return [
            {"metric": "cpu_usage", "threshold": 80, "alert": True},
            {"metric": "memory_usage", "threshold": 85, "alert": True},
            {"metric": "error_rate", "threshold": 5, "alert": True},
            {"metric": "response_time_p99", "threshold": 500, "alert": True},
        ]

    def _execute_deployment_step(self, step: dict[str, Any]) -> dict[str, Any]:
        logger.info("DevOps: Executing step: %s", step.get("step"))
        return {
            "step": step.get("step", "unknown"),
            "status": "success",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "duration_seconds": 2.5,
        }

    def _run_health_check(self, check: dict[str, Any]) -> dict[str, Any]:
        return {
            "name": check.get("name", "unknown"),
            "status": "healthy",
            "response_time_ms": 45,
        }

    def _configure_monitoring(self, monitoring: list[dict[str, Any]]) -> bool:
        logger.info("DevOps: Configuring %d monitoring rules", len(monitoring))
        return True

    def _generate_dockerfile(self, plan: dict[str, Any]) -> CodeArtifact:
        content = (
            "FROM python:3.12-slim\n"
            "WORKDIR /app\n"
            "COPY requirements.txt .\n"
            "RUN pip install --no-cache-dir -r requirements.txt\n"
            "COPY . .\n"
            "EXPOSE 8000\n"
            "HEALTHCHECK --interval=30s --timeout=5s \\\n"
            "  CMD curl -f http://localhost:8000/health || exit 1\n"
            "CMD [\"python\", \"-m\", \"uvicorn\", \"main:app\", \"--host\", \"0.0.0.0\"]\n"
        )
        return CodeArtifact(
            path="Dockerfile",
            content=content,
            language="dockerfile",
            author_agent_id=self.agent_id,
        )

    def _generate_ci_config(self, plan: dict[str, Any]) -> CodeArtifact:
        content = (
            "name: CI/CD Pipeline\n"
            "on: [push, pull_request]\n"
            "jobs:\n"
            "  test:\n"
            "    runs-on: ubuntu-latest\n"
            "    steps:\n"
            "      - uses: actions/checkout@v4\n"
            "      - uses: actions/setup-python@v5\n"
            "        with:\n"
            "          python-version: '3.12'\n"
            "      - run: pip install -r requirements.txt\n"
            "      - run: pytest tests/ -v\n"
            "  deploy:\n"
            "    needs: test\n"
            "    runs-on: ubuntu-latest\n"
            "    if: github.ref == 'refs/heads/main'\n"
            "    steps:\n"
            "      - run: echo 'Deploying...'\n"
        )
        return CodeArtifact(
            path=".github/workflows/ci.yml",
            content=content,
            language="yaml",
            author_agent_id=self.agent_id,
        )

    def rollback(self, deployment_id: str) -> dict[str, Any]:
        logger.warning("DevOps: Rolling back deployment %s", deployment_id)
        return {
            "status": "rolled_back",
            "deployment_id": deployment_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
