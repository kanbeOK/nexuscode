"""
NexusCode Tamper-Evident Audit Trail

Append-only audit log with SHA-256 chaining for integrity verification.
Every agent action, workflow change, and decision is recorded with
cryptographic proof of the log's integrity.
"""

from __future__ import annotations

import hashlib
import json
import logging
import threading
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

from nexuscore.models import AuditEntry

logger = logging.getLogger(__name__)

GENESIS_HASH = "0" * 64


def _sha256(data: str) -> str:
    return hashlib.sha256(data.encode("utf-8")).hexdigest()


def _compute_entry_hash(entry: AuditEntry) -> str:
    ts = entry.timestamp
    if isinstance(ts, str):
        ts_str = ts
    elif hasattr(ts, 'isoformat'):
        ts_str = ts.isoformat()
    else:
        ts_str = str(ts)
    payload = json.dumps(
        {
            "sequence": entry.sequence,
            "timestamp": ts_str,
            "event_type": entry.event_type,
            "agent_id": entry.agent_id,
            "action": entry.action,
            "data_hash": entry.data_hash,
            "previous_hash": entry.previous_hash,
        },
        sort_keys=True,
    )
    return _sha256(payload)


def _compute_data_hash(data: dict[str, Any]) -> str:
    serialized = json.dumps(data, sort_keys=True, default=str)
    return _sha256(serialized)


class AuditTrail:
    """Append-only, SHA-256-chained audit trail."""

    def __init__(self, path: str | Path = ".nexuscode/audit"):
        self._path = Path(path)
        self._path.mkdir(parents=True, exist_ok=True)
        self._lock = threading.RLock()
        self._entries: list[AuditEntry] = []
        self._load()

    def _load(self) -> None:
        log_file = self._path / "audit.jsonl"
        if not log_file.exists():
            return
        try:
            lines = log_file.read_text(encoding="utf-8").strip().split("\n")
            for line in lines:
                if not line.strip():
                    continue
                data = json.loads(line)
                self._entries.append(AuditEntry(**data))
            logger.info("Loaded %d audit entries", len(self._entries))
        except Exception as exc:
            logger.error("Failed to load audit trail: %s", exc)

    def _next_sequence(self) -> int:
        if not self._entries:
            return 1
        return self._entries[-1].sequence + 1

    def _last_hash(self) -> str:
        if not self._entries:
            return GENESIS_HASH
        return self._entries[-1].entry_hash

    def record(
        self,
        event_type: str,
        agent_id: str,
        action: str,
        data: Optional[dict[str, Any]] = None,
    ) -> AuditEntry:
        with self._lock:
            data = data or {}
            data_hash = _compute_data_hash(data)
            previous_hash = self._last_hash()
            sequence = self._next_sequence()

            entry = AuditEntry(
                sequence=sequence,
                timestamp=datetime.now(timezone.utc),
                event_type=event_type,
                agent_id=agent_id,
                action=action,
                data=data,
                data_hash=data_hash,
                previous_hash=previous_hash,
            )
            entry.entry_hash = _compute_entry_hash(entry)
            self._entries.append(entry)
            self._append_to_file(entry)
            return entry

    def _append_to_file(self, entry: AuditEntry) -> None:
        log_file = self._path / "audit.jsonl"
        line = entry.model_dump_json() + "\n"
        with open(log_file, "a", encoding="utf-8") as f:
            f.write(line)

    def verify_integrity(self) -> tuple[bool, Optional[str]]:
        with self._lock:
            expected_prev = GENESIS_HASH
            for i, entry in enumerate(self._entries):
                if entry.previous_hash != expected_prev:
                    return False, f"Chain broken at entry {entry.sequence}: expected prev {expected_prev}, got {entry.previous_hash}"
                computed_hash = _compute_entry_hash(entry)
                if computed_hash != entry.entry_hash:
                    return False, f"Tamper detected at entry {entry.sequence}: expected {computed_hash}, got {entry.entry_hash}"
                expected_prev = entry.entry_hash
            return True, None

    def query(
        self,
        event_type: Optional[str] = None,
        agent_id: Optional[str] = None,
        action: Optional[str] = None,
        since: Optional[datetime] = None,
        until: Optional[datetime] = None,
        limit: int = 100,
    ) -> list[AuditEntry]:
        results = []
        for entry in self._entries:
            if event_type and entry.event_type != event_type:
                continue
            if agent_id and entry.agent_id != agent_id:
                continue
            if action and entry.action != action:
                continue
            if since and entry.timestamp < since:
                continue
            if until and entry.timestamp > until:
                continue
            results.append(entry)
            if len(results) >= limit:
                break
        return results

    def get_entry(self, sequence: int) -> Optional[AuditEntry]:
        for entry in self._entries:
            if entry.sequence == sequence:
                return entry
        return None

    def count(self) -> int:
        return len(self._entries)

    def summary(self) -> dict[str, Any]:
        with self._lock:
            event_counts: dict[str, int] = {}
            agent_counts: dict[str, int] = {}
            for entry in self._entries:
                event_counts[entry.event_type] = event_counts.get(entry.event_type, 0) + 1
                agent_counts[entry.agent_id] = agent_counts.get(entry.agent_id, 0) + 1
            is_valid, error = self.verify_integrity()
            return {
                "total_entries": len(self._entries),
                "event_counts": event_counts,
                "agent_counts": agent_counts,
                "integrity_valid": is_valid,
                "integrity_error": error,
                "first_entry": str(self._entries[0].timestamp) if self._entries else None,
                "last_entry": str(self._entries[-1].timestamp) if self._entries else None,
            }

    def export_entries(self) -> list[dict[str, Any]]:
        return [e.model_dump(mode="json") for e in self._entries]

    def export_verified_log(self, path: str | Path) -> None:
        with self._lock:
            is_valid, error = self.verify_integrity()
            export = {
                "version": "1.0",
                "integrity_valid": is_valid,
                "integrity_error": error,
                "entries": [e.model_dump(mode="json") for e in self._entries],
            }
            Path(path).write_text(
                json.dumps(export, indent=2, default=str),
                encoding="utf-8",
            )

    def clear(self) -> int:
        with self._lock:
            count = len(self._entries)
            self._entries.clear()
            log_file = self._path / "audit.jsonl"
            if log_file.exists():
                log_file.unlink()
            return count
