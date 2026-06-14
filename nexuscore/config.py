"""
NexusCode Configuration Management

Handles loading, saving, and validating system configuration from
YAML/JSON files with environment variable overrides.
"""

from __future__ import annotations

import json
import logging
import os
from pathlib import Path
from typing import Any, Optional

from nexuscore.models import AgentRole, Config

logger = logging.getLogger(__name__)

DEFAULT_CONFIG_PATH = Path(".nexuscode/config.json")
ENV_PREFIX = "NEXUSCODE_"


def _env_override(key: str, value: Any) -> Any:
    env_key = f"{ENV_PREFIX}{key.upper().replace('.', '_')}"
    env_val = os.environ.get(env_key)
    if env_val is None:
        return value
    if isinstance(value, bool):
        return env_val.lower() in ("true", "1", "yes")
    if isinstance(value, int):
        try:
            return int(env_val)
        except ValueError:
            return value
    return env_val


class NexusConfig:
    """Manages system configuration with file persistence and env overrides."""

    def __init__(self, config_path: Optional[Path] = None, raw: Optional[dict] = None):
        self._path = config_path or DEFAULT_CONFIG_PATH
        if raw:
            self._config = Config(**raw)
        else:
            self._config = self._load_from_file()
        self._apply_env_overrides()

    @property
    def config(self) -> Config:
        return self._config

    def _load_from_file(self) -> Config:
        if not self._path.exists():
            logger.info("No config file found at %s, using defaults", self._path)
            return Config()
        try:
            content = self._path.read_text(encoding="utf-8")
            if self._path.suffix == ".json":
                data = json.loads(content)
            else:
                data = self._load_yaml(content)
            return Config(**data)
        except Exception as exc:
            logger.warning("Failed to load config from %s: %s", self._path, exc)
            return Config()

    @staticmethod
    def _load_yaml(content: str) -> dict[str, Any]:
        try:
            import yaml
            return yaml.safe_load(content) or {}
        except ImportError:
            logger.warning("PyYAML not installed, falling back to JSON")
            return json.loads(content)

    def _apply_env_overrides(self) -> None:
        raw = self._config.model_dump()
        for key in raw:
            new_val = _env_override(key, raw[key])
            if new_val != raw[key]:
                logger.info("Config override from env: %s", key)
        self._config = Config(
            project_name=_env_override("project_name", self._config.project_name),
            max_agents=_env_override("max_agents", self._config.max_agents),
            max_veto_rounds=_env_override("max_veto_rounds", self._config.max_veto_rounds),
            human_gate_timeout=_env_override("human_gate_timeout", self._config.human_gate_timeout),
            memory_path=_env_override("memory_path", self._config.memory_path),
            audit_path=_env_override("audit_path", self._config.audit_path),
            log_level=_env_override("log_level", self._config.log_level),
            workflow_timeout=_env_override("workflow_timeout", self._config.workflow_timeout),
            max_task_retries=_env_override("max_task_retries", self._config.max_task_retries),
            require_evidence_for_claims=_env_override("require_evidence", self._config.require_evidence_for_claims),
            adversarial_review_enabled=_env_override("adversarial_review", self._config.adversarial_review_enabled),
            parallel_agent_execution=_env_override("parallel_execution", self._config.parallel_agent_execution),
        )

    def save(self, path: Optional[Path] = None) -> None:
        target = path or self._path
        target.parent.mkdir(parents=True, exist_ok=True)
        data = self._config.model_dump(mode="json")
        target.write_text(json.dumps(data, indent=2, default=str), encoding="utf-8")
        logger.info("Config saved to %s", target)

    def update(self, **kwargs: Any) -> None:
        current = self._config.model_dump()
        current.update(kwargs)
        self._config = Config(**current)

    def get(self, key: str, default: Any = None) -> Any:
        return getattr(self._config, key, default)

    def agent_enabled(self, role: AgentRole) -> bool:
        return role in self._config.enabled_agents

    def __repr__(self) -> str:
        return f"NexusConfig(project={self._config.project_name!r})"


def load_config(
    path: Optional[Path] = None,
    raw: Optional[dict] = None,
) -> NexusConfig:
    return NexusConfig(config_path=path, raw=raw)


def save_config(config: NexusConfig, path: Optional[Path] = None) -> None:
    config.save(path)
