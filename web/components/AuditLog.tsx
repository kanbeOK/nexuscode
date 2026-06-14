import { AuditEntry } from '@/lib/types';

interface AuditLogProps {
  entries: AuditEntry[];
  onSelectEntry: (entry: AuditEntry) => void;
}

export default function AuditLog({ entries, onSelectEntry }: AuditLogProps) {
  const agentData: Record<string, { name: string; avatar: string }> = {
    planner: { name: 'NexusPlanner', avatar: '🎯' },
    architect: { name: 'NexusArchitect', avatar: '🏗️' },
    developer: { name: 'NexusDeveloper', avatar: '💻' },
    reviewer: { name: 'NexusReviewer', avatar: '🔍' },
    redteamer: { name: 'NexusRedTeam', avatar: '🛡️' },
    qa: { name: 'NexusQA', avatar: '🧪' },
    devops: { name: 'NexusDevOps', avatar: '🚀' },
    scribe: { name: 'NexusScribe', avatar: '📝' },
    debugger: { name: 'NexusDebugger', avatar: '🐛' },
    optimizer: { name: 'NexusOptimizer', avatar: '⚡' },
    integrator: { name: 'NexusIntegrator', avatar: '🔗' },
  };

  const getActionBadge = (action: string) => {
    if (action.includes('created') || action.includes('generated')) {
      return 'badge-green';
    }
    if (action.includes('review') || action.includes('scan')) {
      return 'badge-blue';
    }
    if (action.includes('test') || action.includes('verified')) {
      return 'badge-purple';
    }
    if (action.includes('deploy')) {
      return 'badge-cyan';
    }
    if (action.includes('error') || action.includes('failed')) {
      return 'badge-red';
    }
    return 'badge-orange';
  };

  return (
    <div className="space-y-4">
      {entries.map((entry, index) => {
        const agent = agentData[entry.agent] || { name: entry.agent, avatar: '🤖' };

        return (
          <div
            key={entry.id}
            className="p-4 rounded-xl bg-nexus-bg border border-nexus-border hover:border-nexus-accent/30 transition-all duration-200 cursor-pointer animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
            onClick={() => onSelectEntry(entry)}
          >
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-nexus-card border border-nexus-border flex items-center justify-center text-lg">
                  {agent.avatar}
                </div>
                {index < entries.length - 1 && (
                  <div className="w-0.5 h-8 bg-nexus-border mt-2"></div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-white">{agent.name}</span>
                    <span className={`badge ${getActionBadge(entry.action)}`}>
                      {formatAction(entry.action)}
                    </span>
                  </div>
                  <span className="text-xs text-nexus-muted">
                    {new Date(entry.timestamp).toLocaleString()}
                  </span>
                </div>

                <p className="text-sm text-nexus-text mb-3">{entry.details}</p>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-nexus-dim"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                      />
                    </svg>
                    <span className="text-xs text-nexus-dim font-mono truncate max-w-[200px]">
                      {entry.hash.substring(0, 20)}...
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-nexus-dim">Chain:</span>
                    <span className="text-xs text-nexus-dim font-mono">
                      {entry.previousHash.substring(0, 8)}→
                    </span>
                  </div>
                </div>

                {Object.keys(entry.metadata).length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {Object.entries(entry.metadata).map(([key, value]) => (
                      <span
                        key={key}
                        className="px-2 py-0.5 rounded bg-nexus-card text-xs text-nexus-muted"
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
  return action
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
