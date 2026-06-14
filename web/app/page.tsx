'use client';

import { useEffect, useState } from 'react';
import { Agent, MetricsData, SystemStatus } from '@/lib/types';
import { fetchAgents, fetchMetrics, fetchSystemStatus } from '@/lib/api';
import MetricsDashboard from '@/components/MetricsDashboard';
import BandRoom from '@/components/BandRoom';

export default function DashboardPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchAgents(), fetchMetrics(), fetchSystemStatus()]).then(
      ([agentsData, metricsData, statusData]) => {
        setAgents(agentsData);
        setMetrics(metricsData);
        setSystemStatus(statusData);
        setLoading(false);
      }
    );
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-2 border-nexus-cyan/10 rounded-full"></div>
            <div className="absolute inset-0 border-2 border-nexus-cyan/40 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-2 border-nexus-purple/30 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-nexus-cyan animate-pulse" style={{ boxShadow: '0 0 10px rgba(0, 229, 255, 0.6)' }}></div>
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm text-nexus-muted font-medium">Initializing Neural Dashboard</p>
            <p className="text-[10px] text-nexus-dim font-mono mt-1">CONNECTING TO AGENT MATRIX...</p>
          </div>
        </div>
      </div>
    );
  }

  const activeAgents = agents.filter((a) => a.status === 'active' || a.status === 'processing');

  return (
    <div className="space-y-8" style={{ animation: 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">
            <span className="neon-text">Dashboard</span>
            <span className="text-white ml-2">Overview</span>
          </h1>
          <p className="text-sm text-nexus-muted mt-1 font-mono">
            REAL-TIME NEURAL AGENT MONITORING
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl flex items-center gap-2" style={{
            background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.08), rgba(0, 229, 255, 0.05))',
            border: '1px solid rgba(0, 255, 136, 0.15)',
          }}>
            <span className="status-active-neon"></span>
            <span className="text-xs font-semibold text-nexus-green">All Systems Operational</span>
          </div>
        </div>
      </div>

      {metrics && <MetricsDashboard metrics={metrics} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-white">Agent Status</h2>
              <p className="text-[10px] text-nexus-dim font-mono tracking-wider mt-0.5">{agents.length} AGENTS IN NETWORK</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="status-active-neon"></span>
              <span className="text-[10px] font-mono text-nexus-green">{activeAgents.length} ACTIVE</span>
            </div>
          </div>

          <div className="space-y-2">
            {agents.map((agent, index) => {
              const statusColors: Record<string, string> = {
                active: '#00ff88', idle: '#ff9100', processing: '#00e5ff', error: '#ff3d71',
              };
              const color = statusColors[agent.status] || '#7a8baa';

              return (
                <div
                  key={agent.id}
                  className="flex items-center justify-between p-3.5 rounded-xl transition-all duration-300 group hover:bg-white/[0.02]"
                  style={{
                    border: '1px solid transparent',
                    animation: `slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${index * 40}ms both`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${color}20`;
                    e.currentTarget.style.background = `${color}05`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'transparent';
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-xl transition-transform duration-300 group-hover:scale-110">{agent.avatar}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{agent.name}</span>
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            background: color,
                            boxShadow: `0 0 6px ${color}`,
                            animation: agent.status === 'active' || agent.status === 'processing' ? 'pulse 2s ease-in-out infinite' : 'none',
                          }}
                        ></div>
                      </div>
                      <p className="text-[11px] text-nexus-dim">{agent.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-[10px] text-nexus-dim font-mono">TASKS</p>
                      <p className="text-sm font-bold text-white font-mono">{agent.metrics.tasksCompleted.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-nexus-dim font-mono">SUCCESS</p>
                      <p className="text-sm font-bold font-mono" style={{ color }}>{agent.metrics.successRate}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-nexus-dim font-mono">AVG TIME</p>
                      <p className="text-sm font-bold text-white font-mono">{agent.metrics.avgResponseTime}s</p>
                    </div>
                    <div className="w-20">
                      <div className="h-1.5 bg-nexus-bg/80 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{
                            width: `${agent.metrics.successRate}%`,
                            background: `linear-gradient(90deg, ${color}80, ${color})`,
                            boxShadow: `0 0 8px ${color}40`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-5">
            <h2 className="text-lg font-bold text-white mb-4">System Health</h2>
            <div className="space-y-2">
              {systemStatus?.components.map((component, index) => {
                const isOk = component.status === 'operational';
                const isDegraded = component.status === 'degraded';
                const dotColor = isOk ? '#00ff88' : isDegraded ? '#ff9100' : '#ff3d71';

                return (
                  <div
                    key={component.name}
                    className="flex items-center justify-between p-3 rounded-xl transition-all duration-300"
                    style={{
                      background: `${dotColor}05`,
                      border: `1px solid ${dotColor}10`,
                      animation: `slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${index * 50}ms both`,
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          background: dotColor,
                          boxShadow: `0 0 6px ${dotColor}`,
                          animation: isOk ? 'none' : 'pulse 2s ease-in-out infinite',
                        }}
                      ></div>
                      <span className="text-xs text-nexus-text">{component.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-nexus-dim">{component.latency}ms</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass-card p-5">
            <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { label: 'New Workflow', icon: 'M12 4v16m8-8H4' },
                { label: 'Refresh Status', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' },
                { label: 'Export Report', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
              ].map((action, index) => (
                <button
                  key={action.label}
                  className="w-full btn-cyber flex items-center justify-center gap-2 text-xs"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={action.icon} />
                  </svg>
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card p-5">
            <h2 className="text-lg font-bold text-white mb-4">Recent Activity</h2>
            <div className="space-y-2">
              {[
                { text: 'Payment module tests passed', time: '2 min ago', color: '#00ff88' },
                { text: 'Security scan completed', time: '5 min ago', color: '#00e5ff' },
                { text: 'Architecture review approved', time: '12 min ago', color: '#a855f7' },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2.5 p-3 rounded-xl transition-all duration-300"
                  style={{
                    animation: `slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${index * 60}ms both`,
                  }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                    style={{ background: activity.color, boxShadow: `0 0 4px ${activity.color}` }}
                  ></div>
                  <div>
                    <p className="text-xs text-nexus-text">{activity.text}</p>
                    <p className="text-[10px] text-nexus-dim font-mono mt-0.5">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-white">Band Room</h2>
            <p className="text-[10px] text-nexus-dim font-mono tracking-wider mt-0.5">LIVE AGENT COMMUNICATION</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{
            background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.08), rgba(168, 85, 247, 0.08))',
            border: '1px solid rgba(0, 229, 255, 0.15)',
          }}>
            <span className="w-1.5 h-1.5 rounded-full bg-nexus-cyan animate-pulse" style={{ boxShadow: '0 0 6px rgba(0, 229, 255, 0.6)' }}></span>
            <span className="text-[10px] font-mono text-nexus-cyan">LIVE</span>
          </div>
        </div>
        <BandRoom />
      </div>
    </div>
  );
}
