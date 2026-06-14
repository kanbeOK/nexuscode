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
          <div className="w-12 h-12 border-4 border-nexus-accent border-t-transparent rounded-full animate-spin"></div>
          <p className="text-nexus-muted">Loading agents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-white">Agent Roster</h1>
        <p className="text-nexus-muted mt-1">
          {agents.length} specialized agents powering the NexusCode system
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-nexus-dim"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search agents by name, role, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'processing', 'idle'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === status
                  ? 'bg-nexus-accent text-white'
                  : 'bg-nexus-card border border-nexus-border text-nexus-muted hover:text-white hover:border-nexus-accent/50'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              <span className="ml-1.5 text-xs opacity-70">
                ({statusCounts[status]})
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredAgents.map((agent, index) => (
          <div
            key={agent.id}
            className="animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <AgentCard agent={agent} />
          </div>
        ))}
      </div>

      {filteredAgents.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-nexus-muted">No agents match your search criteria</p>
        </div>
      )}

      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-4">Agent Capabilities Matrix</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-nexus-border">
                <th className="text-left py-3 px-4 text-nexus-muted font-medium">Agent</th>
                <th className="text-left py-3 px-4 text-nexus-muted font-medium">Role</th>
                <th className="text-left py-3 px-4 text-nexus-muted font-medium">Tasks</th>
                <th className="text-left py-3 px-4 text-nexus-muted font-medium">Success Rate</th>
                <th className="text-left py-3 px-4 text-nexus-muted font-medium">Avg Response</th>
                <th className="text-left py-3 px-4 text-nexus-muted font-medium">Tokens Used</th>
                <th className="text-left py-3 px-4 text-nexus-muted font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => (
                <tr
                  key={agent.id}
                  className="border-b border-nexus-border/50 hover:bg-nexus-bg/50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{agent.avatar}</span>
                      <span className="font-medium text-white">{agent.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-nexus-muted">{agent.role}</td>
                  <td className="py-4 px-4 text-white">
                    {agent.metrics.tasksCompleted.toLocaleString()}
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-nexus-green">{agent.metrics.successRate}%</span>
                  </td>
                  <td className="py-4 px-4 text-white">{agent.metrics.avgResponseTime}s</td>
                  <td className="py-4 px-4 text-nexus-muted">
                    {(agent.metrics.totalTokensUsed / 1000000).toFixed(1)}M
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className={`status-${agent.status}`}></span>
                      <span className="text-sm text-nexus-muted capitalize">
                        {agent.status}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
