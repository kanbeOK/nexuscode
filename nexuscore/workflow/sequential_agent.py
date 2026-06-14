"""
NexusCode SequentialAgent

Based on the Google Codelabs agent pattern. Executes agents in
sequence, passing output from one as input to the next, with
checkpoint and resume capability.
"""

from __future__ import annotations

import asyncio
import json
import logging
import time
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from pathlib import Path
from typing import Any, Callable, Optional

logger = logging.getLogger(__name__)


class StepStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"


@dataclass
class StepResult:
    step_index: int
    step_name: str
    status: StepStatus
    input_data: Any = None
    output_data: Any = None
    error: Optional[str] = None
    duration_seconds: float = 0.0
    timestamp: str = ""

    def __post_init__(self):
        if not self.timestamp:
            self.timestamp = datetime.now(timezone.utc).isoformat()


@dataclass
class Step:
    name: str
    action: Callable[[Any], Any]
    timeout: float = 60.0
    retry_count: int = 0
    optional: bool = False


class SequentialAgent:
    """
    Executes steps in sequence, passing output from one step
    as input to the next.

    Supports:
    - Sequential step execution
    - Output chaining between steps
    - Checkpoint and resume capability
    - Error handling at each step
    - Progress tracking
    - Timeout per step
    """

    def __init__(
        self,
        name: str = "SequentialAgent",
        checkpoint_path: Optional[str | Path] = None,
    ):
        self.name = name
        self._steps: list[Step] = []
        self._results: list[StepResult] = []
        self._current_index = 0
        self._checkpoint_path = Path(checkpoint_path) if checkpoint_path else None
        self._context: dict[str, Any] = {}

    @property
    def steps(self) -> list[Step]:
        return list(self._steps)

    @property
    def results(self) -> list[StepResult]:
        return list(self._results)

    @property
    def context(self) -> dict[str, Any]:
        return self._context.copy()

    def add_step(
        self,
        name: str,
        action: Callable[[Any], Any],
        timeout: float = 60.0,
        retry_count: int = 0,
        optional: bool = False,
    ) -> None:
        self._steps.append(Step(
            name=name,
            action=action,
            timeout=timeout,
            retry_count=retry_count,
            optional=optional,
        ))

    def set_context(self, key: str, value: Any) -> None:
        self._context[key] = value

    async def run(
        self,
        initial_input: Any = None,
        on_step_complete: Optional[Callable[[StepResult], None]] = None,
    ) -> dict[str, Any]:
        logger.info("SequentialAgent '%s' starting with %d steps", self.name, len(self._steps))
        start_time = time.time()
        current_input = initial_input
        completed_steps = 0

        for i, step in enumerate(self._steps):
            if i < self._current_index:
                continue
            step_start = time.time()
            result = StepResult(
                step_index=i,
                step_name=step.name,
                status=StepStatus.RUNNING,
                input_data=current_input,
            )
            logger.info("SequentialAgent '%s' executing step %d: %s",
                        self.name, i, step.name)

            retries = 0
            max_attempts = step.retry_count + 1

            while retries < max_attempts:
                try:
                    output = await asyncio.wait_for(
                        step.action(current_input),
                        timeout=step.timeout,
                    )
                    result.output_data = output
                    result.status = StepStatus.COMPLETED
                    current_input = output
                    completed_steps += 1
                    self._current_index = i + 1
                    break
                except asyncio.TimeoutError:
                    result.error = f"Step '{step.name}' timed out after {step.timeout}s"
                    retries += 1
                    if retries < max_attempts:
                        logger.warning("Step '%s' timed out, retrying (%d/%d)",
                                       step.name, retries, max_attempts)
                    else:
                        result.status = StepStatus.FAILED
                except Exception as exc:
                    result.error = str(exc)
                    retries += 1
                    if retries < max_attempts:
                        logger.warning("Step '%s' failed, retrying (%d/%d): %s",
                                       step.name, retries, max_attempts, exc)
                    else:
                        result.status = StepStatus.FAILED

            result.duration_seconds = time.time() - step_start
            self._results.append(result)

            if on_step_complete:
                on_step_complete(result)

            if result.status == StepStatus.FAILED and not step.optional:
                logger.error("SequentialAgent '%s' failed at step %d: %s",
                             self.name, i, result.error)
                break

            if result.status == StepStatus.FAILED and step.optional:
                result.status = StepStatus.SKIPPED
                logger.warning("Optional step '%s' skipped", step.name)

        total_time = time.time() - start_time
        all_passed = all(
            r.status in (StepStatus.COMPLETED, StepStatus.SKIPPED) for r in self._results
        )
        return {
            "status": "completed" if all_passed else "failed",
            "steps_completed": completed_steps,
            "total_steps": len(self._steps),
            "total_time_seconds": total_time,
            "output": current_input,
            "results": [r.__dict__ for r in self._results],
            "context": self._context.copy(),
        }

    def save_checkpoint(self, path: Optional[str | Path] = None) -> None:
        checkpoint_path = Path(path) if path else self._checkpoint_path
        if not checkpoint_path:
            return
        checkpoint_path.parent.mkdir(parents=True, exist_ok=True)
        data = {
            "name": self.name,
            "current_index": self._current_index,
            "completed_steps": self._current_index,
            "total_steps": len(self._steps),
            "results": [
                {
                    "step_index": r.step_index,
                    "step_name": r.step_name,
                    "status": r.status.value,
                    "duration_seconds": r.duration_seconds,
                }
                for r in self._results
            ],
            "context": self._context.copy(),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        checkpoint_path.write_text(json.dumps(data, indent=2, default=str), encoding="utf-8")
        logger.info("Checkpoint saved to %s", checkpoint_path)

    def load_checkpoint(self, path: Optional[str | Path] = None) -> bool:
        checkpoint_path = Path(path) if path else self._checkpoint_path
        if not checkpoint_path or not checkpoint_path.exists():
            return False
        try:
            data = json.loads(checkpoint_path.read_text(encoding="utf-8"))
            self._current_index = data.get("current_index", 0)
            self._context = data.get("context", {})
            logger.info("Checkpoint loaded: step %d/%d",
                        self._current_index, len(self._steps))
            return True
        except Exception as exc:
            logger.error("Failed to load checkpoint: %s", exc)
            return False

    def reset(self) -> None:
        self._results.clear()
        self._current_index = 0
        self._context.clear()

    def summary(self) -> dict[str, Any]:
        completed = sum(1 for r in self._results if r.status == StepStatus.COMPLETED)
        failed = sum(1 for r in self._results if r.status == StepStatus.FAILED)
        skipped = sum(1 for r in self._results if r.status == StepStatus.SKIPPED)
        total_time = sum(r.duration_seconds for r in self._results)
        return {
            "name": self.name,
            "total_steps": len(self._steps),
            "completed": completed,
            "failed": failed,
            "skipped": skipped,
            "total_time_seconds": total_time,
            "current_step": self._current_index,
        }
