import { Agent } from '@/lib/types';

interface AgentCardProps {
  agent: Agent;
}

export default function AgentCard({ agent }: AgentCardProps) {
  const statusColors: Record<string, string> = {
    active: 'text-nexus-green',
    idle: 'text-nexus-orange',
    processing: 'text-nexus-accent',
    error: 'text-nexus-red',
  };

  const statusBg: Record<string, string> = {
    active: 'bg-nexus-green/10',
    idle: 'bg-nexus-orange/10',
    processing: 'bg-nexus-accent/10',
    error: 'bg-nexus-red/10',
  };

  return (
    <div className="card h-full flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-nexus-bg border border-nexus-border flex items-center justify-center text-2xl">
            {agent.avatar}
          </div>
          <div>
            <h3 className="font-semibold text-white">{agent.name}</h3>
            <p className="text-sm text-nexus-muted">{agent.role}</p>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full ${statusBg[agent.status]}`}>
          <span className={`status-${agent.status}`}></span>
          <span className={`text-xs font-medium ${statusColors[agent.status]}`}>
            {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
          </span>
        </div>
      </div>

      <p className="text-sm text-nexus-muted mb-4 flex-1">{agent.description}</p>

      {agent.currentTask && (
        <div className="p-3 rounded-lg bg-nexus-bg border border-nexus-border mb-4">
          <p className="text-xs text-nexus-dim mb-1">Current Task</p>
          <p className="text-sm text-nexus-text line-clamp-2">{agent.currentTask}</p>
        </div>
      )}

      <div className="mb-4">
        <p className="text-xs text-nexus-dim mb-2">Capabilities</p>
        <div className="flex flex-wrap gap-1.5">
          {agent.capabilities.slice(0, 4).map((cap) => (
            <span
              key={cap}
              className="px-2 py-0.5 rounded-md bg-nexus-bg text-xs text-nexus-muted"
            >
              {cap}
            </span>
          ))}
          {agent.capabilities.length > 4 && (
            <span className="px-2 py-0.5 rounded-md bg-nexus-bg text-xs text-nexus-dim">
              +{agent.capabilities.length - 4}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-nexus-border">
        <div className="text-center">
          <p className="text-lg font-semibold text-white">
            {agent.metrics.tasksCompleted.toLocaleString()}
          </p>
          <p className="text-xs text-nexus-muted">Tasks</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-nexus-green">
            {agent.metrics.successRate}%
          </p>
          <p className="text-xs text-nexus-muted">Success</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-white">
            {agent.metrics.avgResponseTime}s
          </p>
          <p className="text-xs text-nexus-muted">Avg Time</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-nexus-dim">Uptime</span>
          <span className="text-xs text-nexus-muted">{agent.metrics.uptime}%</span>
        </div>
        <div className="w-full h-1.5 bg-nexus-bg rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-nexus-accent to-nexus-green rounded-full"
            style={{ width: `${agent.metrics.uptime}%` }}
          ></div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-nexus-dim">
        <span>
          Tokens: {(agent.metrics.totalTokensUsed / 1000000).toFixed(1)}M
        </span>
        <span>
          Last active: {formatTimeAgo(agent.lastActive)}
        </span>
      </div>
    </div>
  );
}

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}
