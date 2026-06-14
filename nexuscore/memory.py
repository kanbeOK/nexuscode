"""
NexusCode Persistent Memory System

File-based storage with JSON serialization, BM25-style search indexing,
and support for project, session, and global memory scopes.
Thread-safe operations for concurrent agent access.
"""

from __future__ import annotations

import json
import logging
import math
import re
import threading
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

from nexuscore.models import MemoryEntry

logger = logging.getLogger(__name__)


class MemoryScope:
    PROJECT = "project"
    SESSION = "session"
    GLOBAL = "global"


def _tokenize(text: str) -> list[str]:
    return re.findall(r"\w+", text.lower())


class BM25Index:
    """Simple BM25 search index for memory entries."""

    def __init__(self, k1: float = 1.5, b: float = 0.75):
        self.k1 = k1
        self.b = b
        self._docs: dict[str, list[str]] = {}
        self._doc_lengths: dict[str, int] = {}
        self._avg_doc_length: float = 0.0
        self._df: Counter[str] = Counter()
        self._total_docs: int = 0

    def add(self, doc_id: str, text: str) -> None:
        tokens = _tokenize(text)
        self._docs[doc_id] = tokens
        self._doc_lengths[doc_id] = len(tokens)
        self._total_docs += 1
        self._avg_doc_length = (
            sum(self._doc_lengths.values()) / self._total_docs
            if self._total_docs > 0 else 0.0
        )
        unique_tokens = set(tokens)
        for token in unique_tokens:
            self._df[token] += 1

    def remove(self, doc_id: str) -> None:
        if doc_id not in self._docs:
            return
        tokens = set(self._docs[doc_id])
        del self._docs[doc_id]
        del self._doc_lengths[doc_id]
        self._total_docs -= 1
        if self._total_docs > 0:
            self._avg_doc_length = (
                sum(self._doc_lengths.values()) / self._total_docs
            )
        for token in tokens:
            self._df[token] -= 1
            if self._df[token] <= 0:
                del self._df[token]

    def search(self, query: str, top_k: int = 10) -> list[tuple[str, float]]:
        query_tokens = _tokenize(query)
        scores: dict[str, float] = {}
        n = self._total_docs
        if n == 0:
            return []

        for doc_id, doc_tokens in self._docs.items():
            doc_len = self._doc_lengths[doc_id]
            tf_map = Counter(doc_tokens)
            score = 0.0
            for qt in query_tokens:
                if qt not in self._df:
                    continue
                df = self._df[qt]
                idf = math.log((n - df + 0.5) / (df + 0.5) + 1.0)
                tf = tf_map.get(qt, 0)
                norm = 1.0 - self.b + self.b * (doc_len / self._avg_doc_length) if self._avg_doc_length > 0 else 1.0
                tf_component = (tf * (self.k1 + 1)) / (tf + self.k1 * norm)
                score += idf * tf_component
            if score > 0:
                scores[doc_id] = score

        ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        return ranked[:top_k]


class MemoryStore:
    """Persistent, searchable memory store."""

    def __init__(self, base_path: str | Path = ".nexuscode/memory"):
        self._base = Path(base_path)
        self._base.mkdir(parents=True, exist_ok=True)
        self._lock = threading.RLock()
        self._entries: dict[str, MemoryEntry] = {}
        self._index = BM25Index()
        self._load_all()

    def _scope_dir(self, scope: str) -> Path:
        d = self._base / scope
        d.mkdir(parents=True, exist_ok=True)
        return d

    def _load_all(self) -> None:
        for scope in (MemoryScope.PROJECT, MemoryScope.SESSION, MemoryScope.GLOBAL):
            d = self._scope_dir(scope)
            for f in d.glob("*.json"):
                try:
                    data = json.loads(f.read_text(encoding="utf-8"))
                    entry = MemoryEntry(**data)
                    self._entries[entry.id] = entry
                    self._reindex_entry(entry)
                except Exception as exc:
                    logger.warning("Failed to load memory %s: %s", f, exc)
        logger.info("Loaded %d memory entries", len(self._entries))

    def _reindex_entry(self, entry: MemoryEntry) -> None:
        text = f"{entry.key} {entry.value} {' '.join(entry.tags)}"
        self._index.add(entry.id, text)

    def store(self, key: str, value: str, **kwargs: Any) -> MemoryEntry:
        with self._lock:
            existing = self._find_by_key(key, kwargs.get("scope", MemoryScope.PROJECT))
            if existing:
                existing.value = value
                existing.tags = kwargs.get("tags", existing.tags)
                existing.version += 1
                existing.timestamp = datetime.now(timezone.utc)
                self._save_entry(existing)
                self._index.remove(existing.id)
                self._reindex_entry(existing)
                return existing
            entry = MemoryEntry(
                key=key,
                value=value,
                tags=kwargs.get("tags", []),
                scope=kwargs.get("scope", MemoryScope.PROJECT),
                agent_id=kwargs.get("agent_id", ""),
                metadata=kwargs.get("metadata", {}),
            )
            self._entries[entry.id] = entry
            self._save_entry(entry)
            self._reindex_entry(entry)
            return entry

    def retrieve(self, entry_id: str) -> Optional[MemoryEntry]:
        return self._entries.get(entry_id)

    def search(self, query: str, scope: Optional[str] = None, top_k: int = 10) -> list[MemoryEntry]:
        results = self._index.search(query, top_k=top_k * 3)
        entries = []
        for entry_id, score in results:
            entry = self._entries.get(entry_id)
            if entry is None:
                continue
            if scope and entry.scope != scope:
                continue
            entries.append(entry)
            if len(entries) >= top_k:
                break
        return entries

    def search_by_tags(self, tags: list[str], scope: Optional[str] = None) -> list[MemoryEntry]:
        tag_set = set(tags)
        results = []
        for entry in self._entries.values():
            if scope and entry.scope != scope:
                continue
            if tag_set.intersection(entry.tags):
                results.append(entry)
        return results

    def delete(self, entry_id: str) -> bool:
        with self._lock:
            entry = self._entries.pop(entry_id, None)
            if entry is None:
                return False
            self._index.remove(entry_id)
            path = self._scope_dir(entry.scope) / f"{entry_id}.json"
            if path.exists():
                path.unlink()
            return True

    def list_entries(self, scope: Optional[str] = None) -> list[MemoryEntry]:
        entries = list(self._entries.values())
        if scope:
            entries = [e for e in entries if e.scope == scope]
        return sorted(entries, key=lambda e: e.timestamp, reverse=True)

    def count(self, scope: Optional[str] = None) -> int:
        if scope:
            return sum(1 for e in self._entries.values() if e.scope == scope)
        return len(self._entries)

    def clear_scope(self, scope: str) -> int:
        with self._lock:
            to_remove = [eid for eid, e in self._entries.items() if e.scope == scope]
            for eid in to_remove:
                entry = self._entries.pop(eid)
                self._index.remove(eid)
            d = self._scope_dir(scope)
            for f in d.glob("*.json"):
                f.unlink()
            return len(to_remove)

    def _find_by_key(self, key: str, scope: str) -> Optional[MemoryEntry]:
        for entry in self._entries.values():
            if entry.key == key and entry.scope == scope:
                return entry
        return None

    def _save_entry(self, entry: MemoryEntry) -> None:
        d = self._scope_dir(entry.scope)
        path = d / f"{entry.id}.json"
        path.write_text(
            entry.model_dump_json(indent=2),
            encoding="utf-8",
        )

    def export_all(self) -> list[dict[str, Any]]:
        return [e.model_dump(mode="json") for e in self._entries.values()]

    def import_entries(self, data: list[dict[str, Any]]) -> int:
        count = 0
        for item in data:
            try:
                entry = MemoryEntry(**item)
                self._entries[entry.id] = entry
                self._save_entry(entry)
                self._reindex_entry(entry)
                count += 1
            except Exception as exc:
                logger.warning("Failed to import entry: %s", exc)
        return count
