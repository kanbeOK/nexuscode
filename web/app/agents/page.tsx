'use client';

import { useEffect, useState } from 'react';
import { Agent } from '@/lib/types';
import { fetchAgents } from '@/lib/api';
import AgentCard from '@/components/AgentCard';

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'idle' | 'processing'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAgents().then((data) => {
      setAgents(data);
      setLoading(false);
    });
  }, []);

  const filteredAgents = agents.filter((agent) => {
    const matchesFilter = filter === 'all' || agent.status === filter;
    const matchesSearch =
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const statusCounts = {
    all: agents.length,
    active: agents.filter((a) => a.status === 'active').length,
    processing: agents.filter((a) => a.status === 'processing').length,
    idle: agents.filter((a) => a.status === 'idle').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-2 border-nexus-cyan/10 rounded-full"></div>
            <div className="absolute inset-0 border-2 border-nexus-cyan/40 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-2 border-nexus-purple/30 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="text-nexus-dim text-xs font-mono">LOADING AGENT ROSTER...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8" style={{ animation: 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}>
      <div>
        <h1 className="text-3xl font-black tracking-tight">
          <span className="neon-text">Agent</span>
          <span className="text-white ml-2">Roster</span>
        </h1>
        <p className="text-sm text-nexus-muted mt-1 font-mono">
          {agents.length} SPECIALIZED AGENTS POWERING THE NEXUSCODE SYSTEM
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <svg
              className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-nexus-dim"
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-cyber pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'processing', 'idle'] as const).map((status) => {
            const isActive = filter === status;
            const colors: Record<string, string> = {
              all: '#00e5ff', active: '#00ff88', processing: '#a855f7', idle: '#ff9100',
            };
            return (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className="px-4 py-2 rounded-xl font-medium text-xs transition-all duration-300"
                style={isActive ? {
                  background: `linear-gradient(135deg, ${colors[status]}15, ${colors[status]}08)`,
                  border: `1px solid ${colors[status]}30`,
                  color: colors[status],
                  boxShadow: `0 0 15px ${colors[status]}15`,
                } : {
                  background: 'rgba(17, 22, 40, 0.4)',
                  border: '1px solid rgba(26, 35, 64, 0.4)',
                  color: '#7a8baa',
                }}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                <span className="ml-1.5 opacity-60">({statusCounts[status]})</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredAgents.map((agent, index) => (
          <AgentCard key={agent.id} agent={agent} index={index} />
        ))}
      </div>

      {filteredAgents.length === 0 && (
        <div className="text-center py-16 glass-card">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-nexus-muted text-sm">No agents match your search criteria</p>
          <p className="text-[10px] text-nexus-dim font-mono mt-2">TRY ADJUSTING YOUR FILTERS</p>
        </div>
      )}

      <div className="glass-card p-6">
        <h2 className="text-lg font-bold text-white mb-5">Agent Capabilities Matrix</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: 'rgba(0, 229, 255, 0.08)' }}>
                {['Agent', 'Role', 'Tasks', 'Success', 'Avg Response', 'Tokens', 'Status'].map((header) => (
                  <th key={header} className="text-left py-3 px-4 text-[10px] text-nexus-dim font-mono uppercase tracking-wider">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {agents.map((agent, index) => {
                const statusColors: Record<string, string> = {
                  active: '#00ff88', idle: '#ff9100', processing: '#00e5ff', error: '#ff3d71',
                };
                const color = statusColors[agent.status] || '#7a8baa';

                return (
                  <tr
                    key={agent.id}
                    className="border-b transition-colors duration-200"
                    style={{
                      borderColor: 'rgba(26, 35, 64, 0.2)',
                      animation: `fadeIn 0.4s ease-out ${index * 30}ms both`,
                    }}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{agent.avatar}</span>
                        <span className="text-sm font-semibold text-white">{agent.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-nexus-muted">{agent.role}</td>
                    <td className="py-3.5 px-4 text-sm text-white font-mono">{agent.metrics.tasksCompleted.toLocaleString()}</td>
                    <td className="py-3.5 px-4">
                      <span className="text-sm font-mono font-semibold" style={{ color }}>{agent.metrics.successRate}%</span>
                    </td>
                    <td className="py-3.5 px-4 text-sm text-white font-mono">{agent.metrics.avgResponseTime}s</td>
                    <td className="py-3.5 px-4 text-xs text-nexus-muted font-mono">{(agent.metrics.totalTokensUsed / 1000000).toFixed(1)}M</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: color, boxShadow: `0 0 4px ${color}` }}
                        ></div>
                        <span className="text-[10px] font-mono uppercase" style={{ color }}>{agent.status}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
