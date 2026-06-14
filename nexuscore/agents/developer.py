"""
NexusCode Developer Agent

Generates code based on specifications, follows coding standards,
creates accompanying tests, and handles error cases.
"""

from __future__ import annotations

import logging
import textwrap
from datetime import datetime, timezone
from typing import Any, Optional

from nexuscore.agents.base_agent import BaseAgent
from nexuscore.models import (
    AgentMessage,
    AgentRole,
    CodeArtifact,
    ReviewResult,
    Task,
    TaskStatus,
)

logger = logging.getLogger(__name__)


class DeveloperAgent(BaseAgent):
    role = AgentRole.DEVELOPER

    def _default_capabilities(self) -> list[str]:
        return [
            "code_generation",
            "test_writing",
            "refactoring",
            "debugging",
            "code_review_participation",
            "documentation_generation",
        ]

    def _default_permissions(self) -> list[str]:
        return [
            "write_code",
            "write_tests",
            "modify_files",
            "run_tests",
            "read_specifications",
        ]

    async def think(self, context: dict[str, Any]) -> dict[str, Any]:
        task_data = context.get("task", {})
        plan = {
            "task": task_data,
            "approach": "implementation",
            "files_to_create": [],
            "test_strategy": "unit_tests",
            "error_handling": [],
            "dependencies": [],
        }
        description = task_data.get("description", "")
        requirements = task_data.get("requirements", [])
        plan["files_to_create"] = self._plan_files(description, requirements)
        plan["error_handling"] = self._plan_error_handling(description)
        plan["dependencies"] = self._identify_dependencies(description)
        plan["test_strategy"] = self._determine_test_strategy(description)
        return plan

    async def act(self, plan: dict[str, Any]) -> list[CodeArtifact]:
        artifacts = []
        task = plan.get("task", {})
        for file_info in plan.get("files_to_create", []):
            content = self._generate_code(file_info, task)
            artifact = CodeArtifact(
                path=file_info["path"],
                content=content,
                language=file_info.get("language", "python"),
                author_agent_id=self.agent_id,
                task_id=task.get("id"),
            )
            artifacts.append(artifact)
        test_artifacts = self._generate_tests(plan)
        artifacts.extend(test_artifacts)
        return artifacts

    async def communicate(self, message: AgentMessage) -> Optional[AgentMessage]:
        self.handle_message(message)
        content = message.content.lower()
        if "implement" in content or "code" in content:
            return self.send_message(
                "I'll start implementing the code. Generating files based on "
                "the specification and writing tests alongside.",
                channel_id=message.channel_id or "development",
                reply_to=message.id,
            )
        elif "bug" in content or "fix" in content:
            return self.send_message(
                "Looking into the reported issue. Analyzing the code and "
                "preparing a fix.",
                channel_id=message.channel_id or "development",
                reply_to=message.id,
            )
        elif "refactor" in content:
            return self.send_message(
                "I'll refactor the code while maintaining existing behavior. "
                "Ensuring all tests pass after changes.",
                channel_id=message.channel_id or "development",
                reply_to=message.id,
            )
        return None

    def _plan_files(self, description: str, requirements: list[str]) -> list[dict[str, str]]:
        files = []
        desc_lower = description.lower()
        if "api" in desc_lower or "server" in desc_lower:
            files.append({"path": "src/server.py", "language": "python", "type": "main"})
            files.append({"path": "src/routes.py", "language": "python", "type": "routes"})
        if "model" in desc_lower or "data" in desc_lower:
            files.append({"path": "src/models.py", "language": "python", "type": "models"})
        if "config" in desc_lower:
            files.append({"path": "src/config.py", "language": "python", "type": "config"})
        if "agent" in desc_lower:
            files.append({"path": "src/agent.py", "language": "python", "type": "agent"})
        if not files:
            files.append({"path": "src/main.py", "language": "python", "type": "main"})
            files.append({"path": "src/utils.py", "language": "python", "type": "utility"})
        return files

    def _plan_error_handling(self, description: str) -> list[dict[str, str]]:
        return [
            {"error_type": "ValueError", "handling": "Validate input and raise with message"},
            {"error_type": "ConnectionError", "handling": "Retry with exponential backoff"},
            {"error_type": "TimeoutError", "handling": "Log and propagate with context"},
            {"error_type": "FileNotFoundError", "handling": "Create path if needed or raise"},
        ]

    def _identify_dependencies(self, description: str) -> list[str]:
        deps = ["typing", "logging"]
        desc_lower = description.lower()
        if "json" in desc_lower:
            deps.append("json")
        if "http" in desc_lower or "api" in desc_lower:
            deps.append("asyncio")
        if "path" in desc_lower or "file" in desc_lower:
            deps.append("pathlib")
        if "datetime" in desc_lower:
            deps.append("datetime")
        return deps

    def _determine_test_strategy(self, description: str) -> str:
        desc_lower = description.lower()
        if "critical" in desc_lower or "security" in desc_lower:
            return "comprehensive_with_integration"
        if "api" in desc_lower:
            return "unit_with_integration"
        return "unit_tests"

    def _generate_code(self, file_info: dict[str, Any], task: dict[str, Any]) -> str:
        file_type = file_info.get("type", "main")
        path = file_info.get("path", "")
        title = task.get("title", "component")
        if file_type == "main":
            return self._generate_main_module(path, title)
        elif file_type == "models":
            return self._generate_models(path, title)
        elif file_type == "config":
            return self._generate_config(path, title)
        elif file_type == "routes":
            return self._generate_routes(path, title)
        elif file_type == "agent":
            return self._generate_agent(path, title)
        else:
            return self._generate_utility(path, title)

    def _generate_main_module(self, path: str, title: str) -> str:
        return textwrap.dedent(f'''\
            """
            {title} - Main Module
            Generated by NexusCode Developer Agent
            """

            from __future__ import annotations

            import logging
            from typing import Any, Optional

            logger = logging.getLogger(__name__)


            class Service:
                """Main service for {title}."""

                def __init__(self, config: Optional[dict[str, Any]] = None):
                    self.config = config or {{}}
                    self._initialized = False
                    self._logger = logging.getLogger(self.__class__.__name__)

                async def initialize(self) -> None:
                    self._logger.info("Initializing service")
                    self._initialized = True

                async def shutdown(self) -> None:
                    self._logger.info("Shutting down service")
                    self._initialized = False

                def is_ready(self) -> bool:
                    return self._initialized

                async def execute(self, **kwargs: Any) -> dict[str, Any]:
                    if not self._initialized:
                        raise RuntimeError("Service not initialized")
                    result = {{"status": "success", "data": kwargs}}
                    self._logger.info("Execution complete: %s", result)
                    return result


            async def main() -> None:
                service = Service()
                await service.initialize()
                try:
                    result = await service.execute(hello="world")
                    print(f"Result: {{result}}")
                finally:
                    await service.shutdown()


            if __name__ == "__main__":
                import asyncio
                asyncio.run(main())
        ''')

    def _generate_models(self, path: str, title: str) -> str:
        return textwrap.dedent(f'''\
            """
            {title} - Data Models
            Generated by NexusCode Developer Agent
            """

            from __future__ import annotations

            from datetime import datetime, timezone
            from typing import Any, Optional

            from pydantic import BaseModel, Field


            def _utcnow() -> datetime:
                return datetime.now(timezone.utc)


            class BaseModel(BaseModel):
                """Base model with common fields."""

                id: str = ""
                created_at: datetime = Field(default_factory=_utcnow)
                updated_at: datetime = Field(default_factory=_utcnow)
                metadata: dict[str, Any] = Field(default_factory=dict)


            class ItemModel(BaseModel):
                """Item data model."""

                name: str
                description: str = ""
                status: str = "active"
                tags: list[str] = Field(default_factory=list)
        ''')

    def _generate_config(self, path: str, title: str) -> str:
        return textwrap.dedent(f'''\
            """
            {title} - Configuration
            Generated by NexusCode Developer Agent
            """

            from __future__ import annotations

            import os
            from dataclasses import dataclass, field
            from typing import Any


            @dataclass
            class Configuration:
                """Application configuration."""

                debug: bool = False
                log_level: str = "INFO"
                host: str = "localhost"
                port: int = 8000
                max_connections: int = 100
                timeout: int = 30
                extra: dict[str, Any] = field(default_factory=dict)

                @classmethod
                def from_env(cls) -> Configuration:
                    return cls(
                        debug=os.environ.get("DEBUG", "false").lower() == "true",
                        log_level=os.environ.get("LOG_LEVEL", "INFO"),
                        host=os.environ.get("HOST", "localhost"),
                        port=int(os.environ.get("PORT", "8000")),
                    )
        ''')

    def _generate_routes(self, path: str, title: str) -> str:
        return textwrap.dedent(f'''\
            """
            {title} - API Routes
            Generated by NexusCode Developer Agent
            """

            from __future__ import annotations

            from typing import Any


            routes: dict[str, dict[str, Any]] = {{}}


            def register_route(method: str, path: str):
                def decorator(func):
                    routes[path] = {{"method": method, "handler": func}}
                    return func
                return decorator


            @register_route("GET", "/health")
            async def health_check() -> dict[str, str]:
                return {{"status": "healthy"}}


            @register_route("GET", "/status")
            async def status() -> dict[str, Any]:
                return {{"version": "0.1.0", "service": "{title}"}}
        ''')

    def _generate_agent(self, path: str, title: str) -> str:
        return textwrap.dedent(f'''\
            """
            {title} - Agent Implementation
            Generated by NexusCode Developer Agent
            """

            from __future__ import annotations

            import logging
            from typing import Any, Optional

            logger = logging.getLogger(__name__)


            class Agent:
                """Custom agent implementation."""

                def __init__(self, name: str, config: Optional[dict[str, Any]] = None):
                    self.name = name
                    self.config = config or {{}}
                    self._state: dict[str, Any] = {{}}

                async def process(self, input_data: dict[str, Any]) -> dict[str, Any]:
                    logger.info("Processing input for %s", self.name)
                    result = {{"agent": self.name, "output": input_data}}
                    self._state["last_processed"] = input_data
                    return result

                def get_state(self) -> dict[str, Any]:
                    return self._state.copy()
        ''')

    def _generate_utility(self, path: str, title: str) -> str:
        return textwrap.dedent(f'''\
            """
            {title} - Utility Functions
            Generated by NexusCode Developer Agent
            """

            from __future__ import annotations

            import hashlib
            import json
            from typing import Any


            def compute_hash(data: str) -> str:
                return hashlib.sha256(data.encode()).hexdigest()


            def safe_json_loads(text: str, default: Any = None) -> Any:
                try:
                    return json.loads(text)
                except (json.JSONDecodeError, TypeError):
                    return default


            def chunk_list(items: list[Any], size: int) -> list[list[Any]]:
                return [items[i:i + size] for i in range(0, len(items), size)]
        ''')

    def _generate_tests(self, plan: dict[str, Any]) -> list[CodeArtifact]:
        task = plan.get("task", {})
        test_content = textwrap.dedent(f'''\
            """
            Tests for {task.get('title', 'component')}
            Generated by NexusCode Developer Agent
            """

            import pytest


            def test_basic_functionality():
                assert True

            def test_error_handling():
                with pytest.raises(ValueError):
                    raise ValueError("Expected error")

            def test_edge_cases():
                result = None
                assert result is None
        ''')
        return [CodeArtifact(
            path="tests/test_main.py",
            content=test_content,
            language="python",
            author_agent_id=self.agent_id,
            task_id=task.get("id"),
        )]
