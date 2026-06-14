'use client';

import { useEffect, useState, useRef } from 'react';
import { sendMessage, fetchHistory, connectWebSocket, Message } from '@/lib/api';

const agentColors: Record<string, string> = {
  planner: '#3b82f6',
  architect: '#a855f7',
  developer: '#10b981',
  reviewer: '#f59e0b',
  red_teamer: '#ef4444',
  verifier: '#06b6d4',
  qa: '#ec4899',
  devops: '#14b8a6',
  scribe: '#a855f7',
  adjudicator: '#6366f1',
  human_gate: '#f97316',
};

const agentAvatars: Record<string, string> = {
  planner: '🎯',
  architect: '🏗️',
  developer: '💻',
  reviewer: '🔍',
  red_teamer: '🛡️',
  verifier: '✅',
  qa: '🧪',
  devops: '🚀',
  scribe: '📝',
  adjudicator: '⚖️',
  human_gate: '👤',
};

export default function BandRoom() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [selectedMention, setSelectedMention] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const agents = [
    { id: 'planner', name: 'NexusPlanner' },
    { id: 'architect', name: 'NexusArchitect' },
    { id: 'developer', name: 'NexusDeveloper' },
    { id: 'reviewer', name: 'NexusReviewer' },
    { id: 'red_teamer', name: 'NexusRedTeamer' },
    { id: 'verifier', name: 'NexusVerifier' },
    { id: 'qa', name: 'NexusQA' },
    { id: 'devops', name: 'NexusDevOps' },
    { id: 'scribe', name: 'NexusScribe' },
    { id: 'adjudicator', name: 'NexusAdjudicator' },
    { id: 'human_gate', name: 'NexusHumanGate' },
  ];

  // Load history on mount
  useEffect(() => {
    fetchHistory().then((data) => {
      setMessages(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Connect WebSocket for real-time updates
  useEffect(() => {
    const ws = connectWebSocket((msg: Message) => {
      setMessages(prev => [...prev, msg]);
      setIsProcessing(false);
    });
    return () => ws?.close();
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    const lastAtIndex = value.lastIndexOf('@');
    if (lastAtIndex !== -1 && lastAtIndex === value.length - 1) {
      setShowMentions(true);
      setMentionFilter('');
    } else if (lastAtIndex !== -1) {
      setShowMentions(true);
      setMentionFilter(value.slice(lastAtIndex + 1));
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (agent: { id: string; name: string }) => {
    const lastAtIndex = inputValue.lastIndexOf('@');
    const newValue = inputValue.slice(0, lastAtIndex) + `@${agent.name} `;
    setInputValue(newValue);
    setShowMentions(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showMentions) {
      const filtered = agents.filter(a =>
        a.name.toLowerCase().includes(mentionFilter.toLowerCase())
      );
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedMention(prev => Math.min(prev + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedMention(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        if (filtered[selectedMention]) {
          insertMention(filtered[selectedMention]);
        }
      } else if (e.key === 'Escape') {
        setShowMentions(false);
      }
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isProcessing) return;

    const userMessage: Message = {
      agent: 'user',
      handle: 'You',
      content: inputValue,
      timestamp: new Date().toISOString(),
      mentions: []
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsProcessing(true);

    try {
      const responses = await sendMessage(inputValue);
      setMessages(prev => [...prev, ...responses]);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-black/30 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-lg">
            💬
          </div>
          <div>
            <h3 className="font-semibold text-white">NexusCode Band Room</h3>
            <p className="text-xs text-gray-400">{agents.length} agents online • Type @ to mention</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="text-4xl mb-4">🤖</div>
            <p className="text-lg">Start a conversation</p>
            <p className="text-sm">Type @NexusPlanner to begin</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isUser = msg.agent === 'user';
            const color = agentColors[msg.agent] || '#6b7280';
            const avatar = isUser ? '👤' : (agentAvatars[msg.agent] || '🤖');

            return (
              <div key={i} className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                  style={{ background: `${color}20`, border: `1px solid ${color}40` }}
                >
                  {avatar}
                </div>
                <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium" style={{ color }}>
                      {isUser ? 'You' : msg.agent}
                    </span>
                    <span className="text-xs text-gray-500">{formatTime(msg.timestamp)}</span>
                  </div>
                  <div
                    className="rounded-2xl px-4 py-3 text-sm"
                    style={{
                      background: isUser ? `${color}20` : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${isUser ? `${color}40` : 'rgba(255,255,255,0.1)'}`,
                      color: isUser ? 'white' : '#e5e7eb'
                    }}
                  >
                    <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        {isProcessing && (
          <div className="flex items-center gap-2 text-gray-400">
            <div className="animate-pulse flex gap-1">
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-xs">Agents processing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Mention popup */}
      {showMentions && (
        <div className="absolute bottom-20 left-4 right-4 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl max-h-48 overflow-y-auto z-50">
          {agents
            .filter(a => a.name.toLowerCase().includes(mentionFilter.toLowerCase()))
            .map((agent, i) => (
              <button
                key={agent.id}
                className={`w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-white/10 transition-colors ${
                  i === selectedMention ? 'bg-white/10' : ''
                }`}
                onClick={() => insertMention(agent)}
              >
                <span className="text-lg">{agentAvatars[agent.id]}</span>
                <div>
                  <div className="text-sm text-white">{agent.name}</div>
                  <div className="text-xs text-gray-400">@lamt78789/nexus{agent.id}</div>
                </div>
              </button>
            ))}
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-white/10 bg-black/30 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type @ to mention an agent..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isProcessing}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          💡 Try: @NexusPlanner Build a user authentication system
        </p>
      </div>
    </div>
  );
}
