"""
NexusCode LoopAgent

Based on the Google Codelabs agent pattern. Executes agent actions
in a loop until conditions are met, with support for max iterations,
timeout, state management, and parallel execution.
"""

from __future__ import annotations

import asyncio
import logging
import time
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Callable, Optional

logger = logging.getLogger(__name__)


class LoopStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    TIMEOUT = "timeout"
    MAX_ITERATIONS = "max_iterations"


class LoopCondition(str, Enum):
    SUCCESS = "success"
    FAILURE = "failure"
    CONTINUE = "continue"
    STOP = "stop"


@dataclass
class IterationResult:
    iteration: int
    status: str
    output: Any = None
    error: Optional[str] = None
    duration_seconds: float = 0.0
    timestamp: str = ""

    def __post_init__(self):
        if not self.timestamp:
            self.timestamp = datetime.now(timezone.utc).isoformat()


@dataclass
class LoopConfig:
    max_iterations: int = 10
    timeout_seconds: float = 300.0
    continue_on_error: bool = False
    parallel: bool = False
    max_parallel: int = 5


class LoopAgent:
    """
    Executes agent actions in a loop until a condition is met.

    Supports:
    - Max iterations limit
    - Timeout
    - State management between iterations
    - Condition evaluation (success, failure, continue, stop)
    - History tracking
    - Parallel execution
    - Error handling and recovery
    """

    def __init__(
        self,
        name: str = "LoopAgent",
        config: Optional[LoopConfig] = None,
    ):
        self.name = name
        self.config = config or LoopConfig()
        self._state: dict[str, Any] = {}
        self._history: list[IterationResult] = []
        self._status = LoopStatus.PENDING
        self._start_time: Optional[float] = None

    @property
    def status(self) -> LoopStatus:
        return self._status

    @property
    def state(self) -> dict[str, Any]:
        return self._state.copy()

    @property
    def history(self) -> list[IterationResult]:
        return list(self._history)

    def set_state(self, key: str, value: Any) -> None:
        self._state[key] = value

    def get_state(self, key: str, default: Any = None) -> Any:
        return self._state.get(key, default)

    async def run(
        self,
        action: Callable[[dict[str, Any]], Any],
        condition: Callable[[dict[str, Any]], LoopCondition],
        initial_state: Optional[dict[str, Any]] = None,
        on_iteration: Optional[Callable[[IterationResult], None]] = None,
        on_error: Optional[Callable[[Exception, int], None]] = None,
    ) -> dict[str, Any]:
        if initial_state:
            self._state.update(initial_state)
        self._status = LoopStatus.RUNNING
        self._start_time = time.time()
        self._history.clear()

        logger.info("LoopAgent '%s' starting with max_iterations=%d, timeout=%.1fs",
                     self.name, self.config.max_iterations, self.config.timeout_seconds)

        iteration = 0
        final_output = None

        try:
            while iteration < self.config.max_iterations:
                elapsed = time.time() - self._start_time
                if elapsed >= self.config.timeout_seconds:
                    self._status = LoopStatus.TIMEOUT
                    logger.warning("LoopAgent '%s' timed out after %.1fs", self.name, elapsed)
                    break

                iteration += 1
                iter_start = time.time()

                try:
                    output = await action(self._state)
                    duration = time.time() - iter_start
                    result = IterationResult(
                        iteration=iteration,
                        status="success",
                        output=output,
                        duration_seconds=duration,
                    )
                    self._history.append(result)
                    final_output = output

                    if on_iteration:
                        on_iteration(result)

                    loop_cond = condition({
                        "state": self._state,
                        "output": output,
                        "iteration": iteration,
                    })

                    if loop_cond == LoopCondition.SUCCESS:
                        self._status = LoopStatus.COMPLETED
                        logger.info("LoopAgent '%s' completed successfully at iteration %d",
                                    self.name, iteration)
                        break
                    elif loop_cond == LoopCondition.FAILURE:
                        self._status = LoopStatus.FAILED
                        logger.error("LoopAgent '%s' failed at iteration %d", self.name, iteration)
                        break
                    elif loop_cond == LoopCondition.STOP:
                        self._status = LoopStatus.COMPLETED
                        logger.info("LoopAgent '%s' stopped at iteration %d", self.name, iteration)
                        break

                except Exception as exc:
                    duration = time.time() - iter_start
                    result = IterationResult(
                        iteration=iteration,
                        status="error",
                        error=str(exc),
                        duration_seconds=duration,
                    )
                    self._history.append(result)
                    logger.error("LoopAgent '%s' iteration %d error: %s", self.name, iteration, exc)

                    if on_error:
                        on_error(exc, iteration)

                    if not self.config.continue_on_error:
                        self._status = LoopStatus.FAILED
                        break

            if iteration >= self.config.max_iterations and self._status == LoopStatus.RUNNING:
                self._status = LoopStatus.MAX_ITERATIONS
                logger.warning("LoopAgent '%s' reached max iterations (%d)",
                               self.name, self.config.max_iterations)

        except Exception as exc:
            self._status = LoopStatus.FAILED
            logger.error("LoopAgent '%s' fatal error: %s", self.name, exc)

        total_time = time.time() - self._start_time if self._start_time else 0
        return {
            "status": self._status.value,
            "iterations": iteration,
            "total_time_seconds": total_time,
            "output": final_output,
            "state": self._state.copy(),
            "history": [h.__dict__ for h in self._history],
        }

    async def run_parallel(
        self,
        actions: list[Callable[[dict[str, Any]], Any]],
        condition: Callable[[dict[str, Any]], LoopCondition],
        initial_state: Optional[dict[str, Any]] = None,
    ) -> dict[str, Any]:
        if initial_state:
            self._state.update(initial_state)
        self._status = LoopStatus.RUNNING
        self._start_time = time.time()

        all_results = []
        sem = asyncio.Semaphore(self.config.max_parallel)

        async def limited_action(act: Callable) -> Any:
            async with sem:
                return await act(self._state)

        try:
            tasks = [limited_action(a) for a in actions]
            results = await asyncio.gather(*tasks, return_exceptions=True)

            for i, result in enumerate(results):
                if isinstance(result, Exception):
                    all_results.append(IterationResult(
                        iteration=i + 1, status="error", error=str(result)
                    ))
                else:
                    all_results.append(IterationResult(
                        iteration=i + 1, status="success", output=result
                    ))

            self._history.extend(all_results)
            self._status = LoopStatus.COMPLETED

        except Exception as exc:
            self._status = LoopStatus.FAILED
            logger.error("LoopAgent parallel execution failed: %s", exc)

        total_time = time.time() - self._start_time if self._start_time else 0
        return {
            "status": self._status.value,
            "total_time_seconds": total_time,
            "results": [r.__dict__ for r in all_results],
            "state": self._state.copy(),
        }

    def reset(self) -> None:
        self._state.clear()
        self._history.clear()
        self._status = LoopStatus.PENDING
        self._start_time = None

    def summary(self) -> dict[str, Any]:
        completed = sum(1 for h in self._history if h.status == "success")
        failed = sum(1 for h in self._history if h.status == "error")
        total_time = sum(h.duration_seconds for h in self._history)
        return {
            "name": self.name,
            "status": self._status.value,
            "total_iterations": len(self._history),
            "successful": completed,
            "failed": failed,
            "total_time_seconds": total_time,
            "avg_time_per_iteration": total_time / len(self._history) if self._history else 0,
        }
