"""
NexusCode Band-Only Communication Channel

No hidden orchestrator — workflow emerges from agent interactions on
the band channel. Agents communicate via @mentions, broadcast messages,
and channel-specific discussions. The system is decentralized by design.
"""

from __future__ import annotations

import json
import logging
import threading
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable, Optional

from nexuscore.models import AgentRole, BandMessage, ChannelType

logger = logging.getLogger(__name__)


class Channel:
    """A named communication channel for agent interactions."""

    def __init__(
        self,
        channel_id: str,
        channel_type: ChannelType = ChannelType.GENERAL,
        name: str = "",
    ):
        self.channel_id = channel_id
        self.channel_type = channel_type
        self.name = name or channel_id
        self._messages: list[BandMessage] = []
        self._subscribers: set[str] = set()
        self._lock = threading.RLock()

    def post(self, message: BandMessage) -> None:
        with self._lock:
            message.channel_id = self.channel_id
            self._messages.append(message)

    def get_messages(self, limit: int = 50) -> list[BandMessage]:
        with self._lock:
            return list(self._messages[-limit:])

    def get_messages_since(self, since: datetime) -> list[BandMessage]:
        with self._lock:
            return [m for m in self._messages if m.timestamp >= since]

    def message_count(self) -> int:
        return len(self._messages)

    def clear(self) -> int:
        with self._lock:
            count = len(self._messages)
            self._messages.clear()
            return count


class BandChannel:
    """
    The band-only communication system. No orchestrator — agents talk
    directly to each other via channels and @mentions.
    """

    def __init__(self, persistence_path: Optional[str | Path] = None):
        self._channels: dict[str, Channel] = {}
        self._lock = threading.RLock()
        self._handlers: dict[str, list[Callable[[BandMessage], None]]] = defaultdict(list)
        self._persistence_path = Path(persistence_path) if persistence_path else None
        if self._persistence_path:
            self._persistence_path.mkdir(parents=True, exist_ok=True)
        self._create_default_channels()

    def _create_default_channels(self) -> None:
        self.create_channel("general", ChannelType.GENERAL, "General Discussion")
        self.create_channel("planning", ChannelType.TASK, "Planning & Design")
        self.create_channel("development", ChannelType.TASK, "Development")
        self.create_channel("review", ChannelType.REVIEW, "Code Review")
        self.create_channel("security", ChannelType.SECURITY, "Security Review")
        self.create_channel("emergency", ChannelType.EMERGENCY, "Emergency")

    def create_channel(
        self,
        channel_id: str,
        channel_type: ChannelType = ChannelType.GENERAL,
        name: str = "",
    ) -> Channel:
        with self._lock:
            if channel_id not in self._channels:
                self._channels[channel_id] = Channel(channel_id, channel_type, name)
            return self._channels[channel_id]

    def get_channel(self, channel_id: str) -> Optional[Channel]:
        return self._channels.get(channel_id)

    def send(
        self,
        sender_id: str,
        sender_role: AgentRole,
        content: str,
        channel_id: str = "general",
        recipients: Optional[list[str]] = None,
        mentions: Optional[list[str]] = None,
        reply_to: Optional[str] = None,
        is_broadcast: bool = False,
        attachments: Optional[list[str]] = None,
    ) -> BandMessage:
        channel = self._channels.get(channel_id)
        if channel is None:
            channel = self.create_channel(channel_id, ChannelType.TASK, channel_id)

        extracted_mentions = self._extract_mentions(content)
        all_mentions = list(set((mentions or []) + extracted_mentions))

        message = BandMessage(
            sender_id=sender_id,
            sender_role=sender_role,
            content=content,
            channel_id=channel_id,
            recipients=recipients or [],
            mentions=all_mentions,
            reply_to=reply_to,
            is_broadcast=is_broadcast,
            attachments=attachments or [],
        )
        channel.post(message)
        self._notify_handlers(message)
        self._persist_message(message)
        logger.info(
            "[%s] %s: %s (mentions=%s)",
            channel_id, sender_id, content[:80], all_mentions,
        )
        return message

    def broadcast(
        self,
        sender_id: str,
        sender_role: AgentRole,
        content: str,
        channel_id: str = "general",
    ) -> BandMessage:
        return self.send(
            sender_id=sender_id,
            sender_role=sender_role,
            content=content,
            channel_id=channel_id,
            is_broadcast=True,
        )

    def mention_agent(
        self,
        sender_id: str,
        sender_role: AgentRole,
        target_agent_id: str,
        content: str,
        channel_id: str = "general",
    ) -> BandMessage:
        mention_text = f"@{target_agent_id} {content}"
        return self.send(
            sender_id=sender_id,
            sender_role=sender_role,
            content=mention_text,
            channel_id=channel_id,
            recipients=[target_agent_id],
            mentions=[target_agent_id],
        )

    def get_messages_for_agent(
        self,
        agent_id: str,
        channel_id: Optional[str] = None,
        limit: int = 50,
    ) -> list[BandMessage]:
        messages = []
        channels = (
            [self._channels[channel_id]]
            if channel_id and channel_id in self._channels
            else list(self._channels.values())
        )
        for ch in channels:
            for msg in ch.get_messages(limit=limit):
                if msg.targets_agent(agent_id):
                    messages.append(msg)
        messages.sort(key=lambda m: m.timestamp, reverse=True)
        return messages[:limit]

    def get_channel_history(
        self,
        channel_id: str,
        limit: int = 100,
        before: Optional[datetime] = None,
    ) -> list[BandMessage]:
        channel = self._channels.get(channel_id)
        if not channel:
            return []
        messages = channel.get_messages(limit=limit)
        if before:
            messages = [m for m in messages if m.timestamp < before]
        return messages

    def register_handler(
        self,
        agent_id: str,
        handler: Callable[[BandMessage], None],
    ) -> None:
        self._handlers[agent_id].append(handler)

    def _notify_handlers(self, message: BandMessage) -> None:
        for handler in self._handlers.get(message.sender_id, []):
            try:
                handler(message)
            except Exception as exc:
                logger.error("Handler error for %s: %s", message.sender_id, exc)
        for mention in message.mentions:
            for handler in self._handlers.get(mention, []):
                try:
                    handler(message)
                except Exception as exc:
                    logger.error("Mention handler error for %s: %s", mention, exc)

    def _extract_mentions(self, content: str) -> list[str]:
        import re
        return re.findall(r"@(\w+)", content)

    def _persist_message(self, message: BandMessage) -> None:
        if not self._persistence_path:
            return
        try:
            ch_dir = self._persistence_path / message.channel_id
            ch_dir.mkdir(parents=True, exist_ok=True)
            log_file = ch_dir / "messages.jsonl"
            line = message.model_dump_json() + "\n"
            with open(log_file, "a", encoding="utf-8") as f:
                f.write(line)
        except Exception as exc:
            logger.warning("Failed to persist message: %s", exc)

    def list_channels(self) -> list[dict[str, Any]]:
        return [
            {
                "id": ch.channel_id,
                "name": ch.name,
                "type": ch.channel_type.value,
                "message_count": ch.message_count(),
            }
            for ch in self._channels.values()
        ]

    def stats(self) -> dict[str, Any]:
        total_messages = sum(ch.message_count() for ch in self._channels.values())
        return {
            "channels": len(self._channels),
            "total_messages": total_messages,
            "channel_details": self.list_channels(),
        }
