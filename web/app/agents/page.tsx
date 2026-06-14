'use client';

import { useEffect, useState } from 'react';
import { fetchAgents, Agent } from '@/lib/api';

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgents().then((data) => {
      setAgents(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Agent Network</h1>
        <p className="text-sm text-gray-400 mt-1">{agents.length} agents connected to Band</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => (
          <div key={agent.role} className="glass-card rounded-xl p-6 hover:border-cyan-500/30 transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center text-2xl">
                {getAgentEmoji(agent.role)}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{agent.name}</h3>
                <p className="text-xs text-gray-400">{agent.handle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm text-green-400">Online</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getAgentEmoji(role: string): string {
  const emojis: Record<string, string> = {
    planner: '🎯', architect: '🏗️', developer: '💻',
    reviewer: '🔍', red_teamer: '🛡️', verifier: '✅',
    qa: '🧪', devops: '🚀', scribe: '📝',
    adjudicator: '⚖️', human_gate: '👤',
  };
  return emojis[role] || '🤖';
}
