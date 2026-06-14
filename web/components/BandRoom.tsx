'use client';

import { useEffect, useState, useRef } from 'react';
import { BandMessage } from '@/lib/types';
import { fetchBandMessages } from '@/lib/api';

const agentColors: Record<string, string> = {
  planner: '#3b82f6',
  architect: '#a855f7',
  developer: '#00e5ff',
  reviewer: '#00ff88',
  redteamer: '#ff3d71',
  qa: '#ff9100',
  devops: '#6366f1',
  scribe: '#f472b6',
  debugger: '#f87171',
  optimizer: '#fbbf24',
  integrator: '#2dd4bf',
};

export default function BandRoom() {
  const [messages, setMessages] = useState<BandMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [selectedMention, setSelectedMention] = useState(0);
  const [typingAgents, setTypingAgents] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const agents = [
    { id: 'planner', name: 'NexusPlanner', avatar: '🎯' },
    { id: 'architect', name: 'NexusArchitect', avatar: '🏗️' },
    { id: 'developer', name: 'NexusDeveloper', avatar: '💻' },
    { id: 'reviewer', name: 'NexusReviewer', avatar: '🔍' },
    { id: 'redteamer', name: 'NexusRedTeam', avatar: '🛡️' },
    { id: 'qa', name: 'NexusQA', avatar: '🧪' },
    { id: 'devops', name: 'NexusDevOps', avatar: '🚀' },
    { id: 'scribe', name: 'NexusScribe', avatar: '📝' },
    { id: 'debugger', name: 'NexusDebugger', avatar: '🐛' },
    { id: 'optimizer', name: 'NexusOptimizer', avatar: '⚡' },
    { id: 'integrator', name: 'NexusIntegrator', avatar: '🔗' },
  ];

  useEffect(() => {
    fetchBandMessages().then((data) => {
      setMessages(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (messages.length > 0) {
        const randomAgent = agents[Math.floor(Math.random() * agents.length)];
        setTypingAgents([randomAgent.id]);
        setTimeout(() => setTypingAgents([]), 2000 + Math.random() * 3000);
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [messages.length]);

  const filteredAgents = agents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(mentionFilter.toLowerCase()) ||
      agent.id.toLowerCase().includes(mentionFilter.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    const lastAtIndex = value.lastIndexOf('@');
    if (lastAtIndex !== -1 && lastAtIndex === value.length - 1) {
      setShowMentions(true);
      setMentionFilter('');
      setSelectedMention(0);
    } else if (lastAtIndex !== -1) {
      const afterAt = value.substring(lastAtIndex + 1);
      if (!afterAt.includes(' ')) {
        setShowMentions(true);
        setMentionFilter(afterAt);
        setSelectedMention(0);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const handleMentionSelect = (agent: typeof agents[0]) => {
    const lastAtIndex = inputValue.lastIndexOf('@');
    const newValue = inputValue.substring(0, lastAtIndex) + `@${agent.id} `;
    setInputValue(newValue);
    setShowMentions(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showMentions) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedMention((prev) => prev < filteredAgents.length - 1 ? prev + 1 : 0);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedMention((prev) => prev > 0 ? prev - 1 : filteredAgents.length - 1);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        if (filteredAgents[selectedMention]) {
          handleMentionSelect(filteredAgents[selectedMention]);
        }
      } else if (e.key === 'Escape') {
        setShowMentions(false);
      }
    } else if (e.key === 'Enter' && inputValue.trim()) {
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    const mentions = inputValue.match(/@(\w+)/g)?.map((m) => m.substring(1)) || [];
    const newMessage: BandMessage = {
      id: `msg-${Date.now()}`,
      agent: 'user',
      content: inputValue,
      mentions,
      timestamp: new Date().toISOString(),
      type: mentions.length > 0 ? 'mention' : 'message',
    };
    setMessages((prev) => [...prev, newMessage]);
    setInputValue('');
  };

  const renderContent = (content: string) => {
    const parts = content.split(/(@\w+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        const agentId = part.substring(1);
        const agent = agents.find((a) => a.id === agentId);
        const color = agentColors[agentId] || '#00e5ff';
        return (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md font-medium text-xs"
            style={{
              background: `${color}15`,
              color: color,
              border: `1px solid ${color}25`,
            }}
          >
            {agent?.avatar} {agent?.name || agentId}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 border-2 border-nexus-cyan/20 rounded-full"></div>
            <div className="absolute inset-0 border-2 border-nexus-cyan border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-nexus-dim text-xs font-mono">CONNECTING TO BAND ROOM...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[500px]">
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3 relative" style={{
        background: 'rgba(6, 8, 15, 0.4)',
        borderRadius: '12px',
        border: '1px solid rgba(0, 229, 255, 0.06)',
      }}>
        <div className="absolute inset-0 pointer-events-none opacity-30" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(0, 229, 255, 0.03), transparent 50%), radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.03), transparent 50%)',
        }}></div>

        {messages.map((message, index) => {
          const agent = agents.find((a) => a.id === message.agent);
          const color = agentColors[message.agent] || '#7a8baa';
          const isSystem = message.type === 'system';
          const isAlert = message.type === 'alert';
          const isUser = message.agent === 'user';

          return (
            <div
              key={message.id}
              className="flex gap-3 group relative"
              style={{
                animation: `messageIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 30}ms both`,
              }}
            >
              <div className="flex-shrink-0 relative">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: isUser
                      ? 'linear-gradient(135deg, #0066ff, #00e5ff)'
                      : `${color}12`,
                    border: `1px solid ${isUser ? 'rgba(0, 229, 255, 0.3)' : `${color}20`}`,
                    boxShadow: `0 0 10px ${isUser ? 'rgba(0, 229, 255, 0.15)' : `${color}10`}`,
                  }}
                >
                  {isUser ? '👤' : agent?.avatar || '🤖'}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold" style={{ color: isUser ? '#00e5ff' : color }}>
                    {isUser ? 'You' : agent?.name || message.agent}
                  </span>
                  {isSystem && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono" style={{
                      background: 'rgba(168, 85, 247, 0.12)',
                      color: '#a855f7',
                      border: '1px solid rgba(168, 85, 247, 0.2)',
                    }}>SYS</span>
                  )}
                  {isAlert && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono" style={{
                      background: 'rgba(255, 145, 0, 0.12)',
                      color: '#ff9100',
                      border: '1px solid rgba(255, 145, 0, 0.2)',
                    }}>ALERT</span>
                  )}
                  <span className="text-[10px] text-nexus-dim font-mono">{formatTime(message.timestamp)}</span>
                </div>
                <p className="text-sm text-nexus-text leading-relaxed">{renderContent(message.content)}</p>
                {message.mentions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {message.mentions.map((mention) => {
                      const mentionedAgent = agents.find((a) => a.id === mention);
                      const mentionColor = agentColors[mention] || '#00e5ff';
                      return (
                        <span
                          key={mention}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium"
                          style={{
                            background: `${mentionColor}10`,
                            color: mentionColor,
                            border: `1px solid ${mentionColor}20`,
                          }}
                        >
                          <span>{mentionedAgent?.avatar}</span>
                          {mentionedAgent?.name || mention}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {typingAgents.length > 0 && (
          <div className="flex items-center gap-2 px-1 animate-fade-in" style={{ animation: 'messageIn 0.3s ease-out' }}>
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-nexus-cyan"
                  style={{
                    animation: `typingDot 1.4s ease-in-out ${i * 0.2}s infinite`,
                    boxShadow: '0 0 4px rgba(0, 229, 255, 0.4)',
                  }}
                ></div>
              ))}
            </div>
            <span className="text-[10px] text-nexus-dim font-mono">
              {typingAgents.map(id => agents.find(a => a.id === id)?.name).join(', ')} typing...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="relative mt-3">
        {showMentions && filteredAgents.length > 0 && (
          <div className="absolute bottom-full left-0 right-0 mb-2 rounded-xl shadow-xl overflow-hidden z-10" style={{
            background: 'rgba(17, 22, 40, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 229, 255, 0.15)',
            boxShadow: '0 -4px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(0, 229, 255, 0.05)',
          }}>
            <div className="p-2 border-b" style={{ borderColor: 'rgba(0, 229, 255, 0.08)' }}>
              <span className="text-[10px] text-nexus-dim font-mono tracking-wider">MENTION AN AGENT</span>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filteredAgents.map((agent, index) => {
                const color = agentColors[agent.id] || '#00e5ff';
                return (
                  <button
                    key={agent.id}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-200 ${
                      index === selectedMention ? 'bg-white/5' : 'hover:bg-white/3'
                    }`}
                    onClick={() => handleMentionSelect(agent)}
                    onMouseEnter={() => setSelectedMention(index)}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{
                      background: `${color}15`,
                      border: `1px solid ${color}20`,
                    }}>
                      {agent.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{agent.name}</p>
                      <p className="text-[10px] font-mono" style={{ color }}>@{agent.id}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              placeholder="Type a message... Use @ to mention agents"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="input-cyber pr-10"
            />
            <button
              onClick={() => {
                setInputValue((prev) => prev + '@');
                setShowMentions(true);
                setMentionFilter('');
                inputRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-nexus-dim hover:text-nexus-cyan transition-colors"
              title="Mention an agent"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            </button>
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className="btn-neon-primary disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Send
          </button>
        </div>

        <div className="flex items-center gap-4 mt-2.5 text-[10px] text-nexus-dim font-mono">
          <span>TYPE @ TO MENTION</span>
          <span className="text-nexus-border">•</span>
          <span>{messages.length} MESSAGES</span>
          <span className="text-nexus-border">•</span>
          <span>{agents.length} AGENTS</span>
        </div>
      </div>
    </div>
  );
}
