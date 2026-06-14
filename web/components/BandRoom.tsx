'use client';

import { useEffect, useState, useRef } from 'react';
import { BandMessage } from '@/lib/types';
import { fetchBandMessages } from '@/lib/api';

export default function BandRoom() {
  const [messages, setMessages] = useState<BandMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [selectedMention, setSelectedMention] = useState<number>(0);
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
    const newValue =
      inputValue.substring(0, lastAtIndex) + `@${agent.id} `;
    setInputValue(newValue);
    setShowMentions(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showMentions) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedMention((prev) =>
          prev < filteredAgents.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedMention((prev) =>
          prev > 0 ? prev - 1 : filteredAgents.length - 1
        );
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
        return (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-nexus-accent/20 text-nexus-accent font-medium"
          >
            {agent?.avatar} {agent?.name || agentId}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMessageTypeStyle = (type: string) => {
    switch (type) {
      case 'alert':
        return 'border-l-4 border-nexus-orange';
      case 'mention':
        return 'border-l-4 border-nexus-accent';
      case 'system':
        return 'border-l-4 border-nexus-purple';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-nexus-accent border-t-transparent rounded-full animate-spin"></div>
          <p className="text-nexus-muted text-sm">Loading Band room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[500px]">
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4 bg-nexus-bg rounded-xl mb-4">
        {messages.map((message) => {
          const agent = agents.find((a) => a.id === message.agent);
          const isSystem = message.type === 'system';
          const isAlert = message.type === 'alert';

          return (
            <div
              key={message.id}
              className={`flex gap-3 animate-slide-up ${getMessageTypeStyle(
                message.type
              )} ${isSystem ? 'bg-nexus-purple/5 rounded-lg p-3' : ''} ${
                isAlert ? 'bg-nexus-orange/5 rounded-lg p-3' : ''
              }`}
            >
              <div className="flex-shrink-0">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                    isSystem
                      ? 'bg-nexus-purple/20 border border-nexus-purple/30'
                      : isAlert
                      ? 'bg-nexus-orange/20 border border-nexus-orange/30'
                      : 'bg-nexus-card border border-nexus-border'
                  }`}
                >
                  {agent?.avatar || '👤'}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-white">
                    {agent?.name || message.agent}
                  </span>
                  {isSystem && (
                    <span className="badge badge-purple text-[10px]">System</span>
                  )}
                  {isAlert && (
                    <span className="badge badge-orange text-[10px]">Alert</span>
                  )}
                  <span className="text-xs text-nexus-dim">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-nexus-text">
                  {renderContent(message.content)}
                </p>
                {message.mentions.length > 0 && (
                  <div className="flex gap-1.5 mt-2">
                    {message.mentions.map((mention) => {
                      const mentionedAgent = agents.find((a) => a.id === mention);
                      return (
                        <span
                          key={mention}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-nexus-accent/10 text-xs text-nexus-accent"
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
        <div ref={messagesEndRef} />
      </div>

      <div className="relative">
        {showMentions && filteredAgents.length > 0 && (
          <div className="absolute bottom-full left-0 right-0 mb-2 bg-nexus-card border border-nexus-border rounded-xl shadow-lg overflow-hidden z-10">
            <div className="p-2 border-b border-nexus-border">
              <span className="text-xs text-nexus-muted">Select an agent to mention</span>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filteredAgents.map((agent, index) => (
                <button
                  key={agent.id}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${
                    index === selectedMention
                      ? 'bg-nexus-accent/10 text-white'
                      : 'text-nexus-text hover:bg-nexus-bg'
                  }`}
                  onClick={() => handleMentionSelect(agent)}
                  onMouseEnter={() => setSelectedMention(index)}
                >
                  <span className="text-lg">{agent.avatar}</span>
                  <div>
                    <p className="text-sm font-medium">{agent.name}</p>
                    <p className="text-xs text-nexus-muted">@{agent.id}</p>
                  </div>
                </button>
              ))}
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
              className="input-field pr-10"
            />
            <button
              onClick={() => {
                setInputValue((prev) => prev + '@');
                setShowMentions(true);
                setMentionFilter('');
                inputRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-nexus-dim hover:text-nexus-accent transition-colors"
              title="Mention an agent"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                />
              </svg>
            </button>
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
            Send
          </button>
        </div>

        <div className="flex items-center gap-4 mt-3 text-xs text-nexus-dim">
          <span>Tip: Type @ to see available agents</span>
          <span>•</span>
          <span>{messages.length} messages in room</span>
          <span>•</span>
          <span>{agents.length} agents connected</span>
        </div>
      </div>
    </div>
  );
}
