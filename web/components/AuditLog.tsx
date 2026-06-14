'use client';

import { AuditEntry } from '@/lib/types';

interface AuditLogProps {
  entries: AuditEntry[];
  onSelectEntry: (entry: AuditEntry) => void;
}

const agentData: Record<string, { name: string; avatar: string; color: string }> = {
  planner: { name: 'NexusPlanner', avatar: '🎯', color: '#3b82f6' },
  architect: { name: 'NexusArchitect', avatar: '🏗️', color: '#a855f7' },
  developer: { name: 'NexusDeveloper', avatar: '💻', color: '#00e5ff' },
  reviewer: { name: 'NexusReviewer', avatar: '🔍', color: '#00ff88' },
  redteamer: { name: 'NexusRedTeam', avatar: '🛡️', color: '#ff3d71' },
  qa: { name: 'NexusQA', avatar: '🧪', color: '#ff9100' },
  devops: { name: 'NexusDevOps', avatar: '🚀', color: '#6366f1' },
  scribe: { name: 'NexusScribe', avatar: '📝', color: '#f472b6' },
  debugger: { name: 'NexusDebugger', avatar: '🐛', color: '#f87171' },
  optimizer: { name: 'NexusOptimizer', avatar: '⚡', color: '#fbbf24' },
  integrator: { name: 'NexusIntegrator', avatar: '🔗', color: '#2dd4bf' },
};

export default function AuditLog({ entries, onSelectEntry }: AuditLogProps) {
  const getActionColor = (action: string) => {
    if (action.includes('created') || action.includes('generated')) return '#00ff88';
    if (action.includes('review') || action.includes('scan')) return '#00e5ff';
    if (action.includes('test') || action.includes('verified')) return '#a855f7';
    if (action.includes('deploy')) return '#6366f1';
    if (action.includes('error') || action.includes('failed')) return '#ff3d71';
    return '#ff9100';
  };

  return (
    <div className="space-y-3">
      {entries.map((entry, index) => {
        const agent = agentData[entry.agent] || { name: entry.agent, avatar: '🤖', color: '#7a8baa' };
        const actionColor = getActionColor(entry.action);

        return (
          <div
            key={entry.id}
            className="glass-card p-4 cursor-pointer group relative"
            style={{
              animation: `slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${index * 40}ms both`,
            }}
            onClick={() => onSelectEntry(entry)}
          >
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{
              background: `radial-gradient(circle at 50% 50%, ${agent.color}08, transparent 60%)`,
            }}></div>

            <div className="flex items-start gap-4 relative z-10">
              <div className="flex flex-col items-center">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: `${agent.color}12`,
                    border: `1px solid ${agent.color}25`,
                    boxShadow: `0 0 10px ${agent.color}10`,
                  }}
                >
                  {agent.avatar}
                </div>
                {index < entries.length - 1 && (
                  <div className="w-[2px] h-6 mt-2 rounded-full" style={{
                    background: `linear-gradient(180deg, ${agent.color}30, transparent)`,
                  }}></div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-semibold" style={{ color: agent.color }}>{agent.name}</span>
                    <span
                      className="px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide uppercase"
                      style={{
                        background: `${actionColor}12`,
                        color: actionColor,
                        border: `1px solid ${actionColor}20`,
                      }}
                    >
                      {formatAction(entry.action)}
                    </span>
                  </div>
                  <span className="text-[10px] text-nexus-dim font-mono">
                    {new Date(entry.timestamp).toLocaleString()}
                  </span>
                </div>

                <p className="text-sm text-nexus-text/80 mb-2.5 leading-relaxed">{entry.details}</p>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="hash-text truncate max-w-[180px]">{entry.hash.substring(0, 20)}...</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-nexus-dim font-mono">
                    <span>CHAIN:</span>
                    <span className="hash-text">{entry.previousHash.substring(0, 8)}→</span>
                  </div>
                </div>

                {Object.keys(entry.metadata).length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {Object.entries(entry.metadata).map(([key, value]) => (
                      <span
                        key={key}
                        className="px-2 py-0.5 rounded-md text-[10px] font-mono"
                        style={{
                          background: 'rgba(0, 229, 255, 0.05)',
                          color: 'rgba(0, 229, 255, 0.6)',
                          border: '1px solid rgba(0, 229, 255, 0.08)',
                        }}
                      >
                        {key}: {value}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function formatAction(action: string): string {
  return action.split('_').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}
