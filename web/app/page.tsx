'use client';

import { useEffect, useState } from 'react';
import { fetchAgents, fetchStatus, Agent, SystemStatus } from '@/lib/api';
import BandRoom from '@/components/BandRoom';

export default function DashboardPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchAgents(), fetchStatus()]).then(
      ([agentsData, statusData]) => {
        setAgents(agentsData);
        setStatus(statusData);
        setLoading(false);
      }
    ).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-sm text-gray-400">Connecting to NexusCode...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">NexusCode Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">Multi-Agent Software Development System</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-green-400">System Online</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Agents', value: status?.agents || agents.length, color: 'cyan' },
          { label: 'Band Config', value: status?.band_config || 0, color: 'purple' },
          { label: 'OpenAI', value: status?.openai_configured ? '✓' : '✗', color: status?.openai_configured ? 'green' : 'red' },
          { label: 'Messages', value: status?.history || 0, color: 'blue' },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-4 rounded-xl">
            <p className="text-xs text-gray-400 uppercase tracking-wider">{stat.label}</p>
            <p className={`text-2xl font-bold text-${stat.color}-400 mt-1`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Band Room */}
        <div className="glass-card rounded-xl overflow-hidden" style={{ height: '500px' }}>
          <BandRoom />
        </div>

        {/* Agent List */}
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Agent Network</h2>
          <div className="space-y-3">
            {agents.map((agent) => (
              <div key={agent.role} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{agent.name}</p>
                    <p className="text-xs text-gray-400">{agent.handle}</p>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-400">Online</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Workflow */}
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Development Workflow</h2>
        <div className="flex items-center justify-between flex-wrap gap-4">
          {['Planner', 'Architect', 'Developer', 'Reviewer', 'RedTeamer', 'QA', 'DevOps', 'Scribe'].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center text-sm font-bold text-cyan-400">
                {i + 1}
              </div>
              <span className="text-sm text-gray-300">{step}</span>
              {i < 7 && <span className="text-gray-600 mx-2">→</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
