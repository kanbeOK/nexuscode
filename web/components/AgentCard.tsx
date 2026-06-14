'use client';

import { useState, useRef, useCallback } from 'react';
import { Agent } from '@/lib/types';

interface AgentCardProps {
  agent: Agent;
  index?: number;
}

const roleColors: Record<string, { gradient: string; glow: string; border: string }> = {
  planner: { gradient: 'from-blue-500 to-cyan-400', glow: 'rgba(59, 130, 246, 0.3)', border: 'rgba(59, 130, 246, 0.3)' },
  architect: { gradient: 'from-purple-500 to-pink-400', glow: 'rgba(168, 85, 247, 0.3)', border: 'rgba(168, 85, 247, 0.3)' },
  developer: { gradient: 'from-cyan-400 to-blue-500', glow: 'rgba(0, 229, 255, 0.3)', border: 'rgba(0, 229, 255, 0.3)' },
  reviewer: { gradient: 'from-green-400 to-emerald-500', glow: 'rgba(0, 255, 136, 0.3)', border: 'rgba(0, 255, 136, 0.3)' },
  redteamer: { gradient: 'from-red-500 to-orange-400', glow: 'rgba(255, 61, 113, 0.3)', border: 'rgba(255, 61, 113, 0.3)' },
  qa: { gradient: 'from-yellow-400 to-orange-500', glow: 'rgba(255, 145, 0, 0.3)', border: 'rgba(255, 145, 0, 0.3)' },
  devops: { gradient: 'from-indigo-500 to-blue-500', glow: 'rgba(99, 102, 241, 0.3)', border: 'rgba(99, 102, 241, 0.3)' },
  scribe: { gradient: 'from-pink-500 to-rose-400', glow: 'rgba(244, 114, 182, 0.3)', border: 'rgba(244, 114, 182, 0.3)' },
  debugger: { gradient: 'from-red-400 to-pink-500', glow: 'rgba(248, 113, 113, 0.3)', border: 'rgba(248, 113, 113, 0.3)' },
  optimizer: { gradient: 'from-amber-400 to-yellow-500', glow: 'rgba(251, 191, 36, 0.3)', border: 'rgba(251, 191, 36, 0.3)' },
  integrator: { gradient: 'from-teal-400 to-cyan-500', glow: 'rgba(45, 212, 191, 0.3)', border: 'rgba(45, 212, 191, 0.3)' },
};

export default function AgentCard({ agent, index = 0 }: AgentCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const colors = roleColors[agent.id] || roleColors.developer;

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  }, []);

  const statusConfig: Record<string, { color: string; label: string; pulse: boolean }> = {
    active: { color: '#00ff88', label: 'Active', pulse: true },
    idle: { color: '#ff9100', label: 'Idle', pulse: false },
    processing: { color: '#00e5ff', label: 'Processing', pulse: true },
    error: { color: '#ff3d71', label: 'Error', pulse: true },
  };

  const status = statusConfig[agent.status] || statusConfig.idle;

  return (
    <div
      ref={cardRef}
      className="card-3d group relative"
      style={{
        animationDelay: `${index * 60}ms`,
        animation: `slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${index * 60}ms both`,
      }}
      onMouseMove={handleMouseMove}
    >
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(400px circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, ${colors.glow}, transparent 60%)`,
        }}
      ></div>

      <div className="relative z-10 p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="relative w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{
                background: `linear-gradient(135deg, ${colors.glow}, rgba(6, 8, 15, 0.8))`,
                border: `1px solid ${colors.border}`,
              }}
            >
              {agent.avatar}
              {status.pulse && (
                <div
                  className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-nexus-card"
                  style={{
                    background: status.color,
                    boxShadow: `0 0 8px ${status.color}`,
                    animation: 'pulse 2s ease-in-out infinite',
                  }}
                ></div>
              )}
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">{agent.name}</h3>
              <p className="text-xs text-nexus-muted">{agent.role}</p>
            </div>
          </div>
          <div
            className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase"
            style={{
              background: `${status.color}15`,
              color: status.color,
              border: `1px solid ${status.color}30`,
              boxShadow: status.pulse ? `0 0 10px ${status.color}20` : 'none',
            }}
          >
            {status.label}
          </div>
        </div>

        <p className="text-xs text-nexus-muted/80 mb-4 leading-relaxed line-clamp-2">{agent.description}</p>

        {agent.currentTask && (
          <div
            className="p-3 rounded-xl mb-4"
            style={{
              background: 'rgba(0, 229, 255, 0.03)',
              border: '1px solid rgba(0, 229, 255, 0.08)',
            }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-1 h-1 rounded-full bg-nexus-cyan animate-pulse"></div>
              <p className="text-[10px] text-nexus-cyan font-mono tracking-wider">CURRENT TASK</p>
            </div>
            <p className="text-xs text-nexus-text line-clamp-2">{agent.currentTask}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-1.5 mb-4">
          {agent.capabilities.slice(0, 3).map((cap) => (
            <span
              key={cap}
              className="px-2 py-0.5 rounded-md text-[10px] font-mono"
              style={{
                background: 'rgba(168, 85, 247, 0.08)',
                color: 'rgba(168, 85, 247, 0.7)',
                border: '1px solid rgba(168, 85, 247, 0.12)',
              }}
            >
              {cap}
            </span>
          ))}
          {agent.capabilities.length > 3 && (
            <span className="px-2 py-0.5 rounded-md text-[10px] text-nexus-dim bg-nexus-bg/50">
              +{agent.capabilities.length - 3}
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-nexus-border/30">
          <div className="text-center">
            <p className="text-lg font-bold text-white font-mono">{agent.metrics.tasksCompleted.toLocaleString()}</p>
            <p className="text-[10px] text-nexus-dim uppercase tracking-wider">Tasks</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold font-mono" style={{ color: status.color }}>{agent.metrics.successRate}%</p>
            <p className="text-[10px] text-nexus-dim uppercase tracking-wider">Success</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-white font-mono">{agent.metrics.avgResponseTime}s</p>
            <p className="text-[10px] text-nexus-dim uppercase tracking-wider">Avg Time</p>
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-nexus-dim uppercase tracking-wider">Uptime</span>
            <span className="text-[10px] font-mono" style={{ color: status.color }}>{agent.metrics.uptime}%</span>
          </div>
          <div className="h-1 bg-nexus-bg/80 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${agent.metrics.uptime}%`,
                background: `linear-gradient(90deg, ${colors.glow.replace('0.3', '0.8')}, ${status.color})`,
                boxShadow: `0 0 10px ${status.color}40`,
              }}
            ></div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-[10px] text-nexus-dim font-mono">
            {(agent.metrics.totalTokensUsed / 1000000).toFixed(1)}M tokens
          </span>
          <span className="text-[10px] text-nexus-dim">
            {formatTimeAgo(agent.lastActive)}
          </span>
        </div>
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
