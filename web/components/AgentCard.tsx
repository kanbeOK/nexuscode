'use client';

interface AgentCardProps {
  agent: {
    role: string;
    name: string;
    handle: string;
    status: string;
  };
  index?: number;
}

const roleEmojis: Record<string, string> = {
  planner: '🎯', architect: '🏗️', developer: '💻',
  reviewer: '🔍', red_teamer: '🛡️', verifier: '✅',
  qa: '🧪', devops: '🚀', scribe: '📝',
  adjudicator: '⚖️', human_gate: '👤',
};

const roleColors: Record<string, string> = {
  planner: '#3b82f6', architect: '#8b5cf6', developer: '#10b981',
  reviewer: '#f59e0b', red_teamer: '#ef4444', verifier: '#06b6d4',
  qa: '#ec4899', devops: '#14b8a6', scribe: '#a855f7',
  adjudicator: '#6366f1', human_gate: '#f97316',
};

export default function AgentCard({ agent, index = 0 }: AgentCardProps) {
  const color = roleColors[agent.role] || '#6b7280';
  const emoji = roleEmojis[agent.role] || '🤖';

  return (
    <div
      className="glass-card rounded-xl p-5 hover:scale-105 transition-all duration-300 cursor-pointer"
      style={{
        border: `1px solid ${color}30`,
        animation: `slideUp 0.4s ease-out ${index * 50}ms both`,
      }}
    >
      <div className="flex items-center gap-4">
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
          style={{ background: `${color}20` }}
        >
          {emoji}
        </div>
        <div className="flex-1">
          <h3 className="text-white font-semibold">{agent.name}</h3>
          <p className="text-xs text-gray-400">{agent.handle}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs text-green-400">Online</span>
        </div>
      </div>
    </div>
  );
}
