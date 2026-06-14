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
          <div className="w-12 h-12 border-4 border-nexus-accent border-t-transparent rounded-full animate-spin"></div>
          <p className="text-nexus-muted">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const activeAgents = agents.filter(
    (a) => a.status === 'active' || a.status === 'processing'
  );
  const idleAgents = agents.filter((a) => a.status === 'idle');

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
          <p className="text-nexus-muted mt-1">
            Real-time monitoring of the NexusCode multi-agent system
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-nexus-card border border-nexus-border">
            <div className="w-2 h-2 rounded-full bg-nexus-green animate-pulse"></div>
            <span className="text-sm text-nexus-green">All Systems Operational</span>
          </div>
        </div>
      </div>

      {metrics && <MetricsDashboard metrics={metrics} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Agent Status</h2>
            <span className="badge badge-blue">{agents.length} Agents</span>
          </div>
          <div className="space-y-3">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="flex items-center justify-between p-4 rounded-lg bg-nexus-bg border border-nexus-border hover:border-nexus-accent/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="text-2xl">{agent.avatar}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{agent.name}</span>
                      <span
                        className={`status-${agent.status}`}
                      ></span>
                    </div>
                    <p className="text-sm text-nexus-muted">{agent.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-nexus-muted">Tasks</p>
                    <p className="font-medium text-white">
                      {agent.metrics.tasksCompleted.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-nexus-muted">Success</p>
                    <p className="font-medium text-nexus-green">
                      {agent.metrics.successRate}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-nexus-muted">Avg Time</p>
                    <p className="font-medium text-white">
                      {agent.metrics.avgResponseTime}s
                    </p>
                  </div>
                  <div className="w-24">
                    <div className="h-1.5 bg-nexus-bg rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-nexus-accent to-nexus-green rounded-full"
                        style={{
                          width: `${agent.metrics.successRate}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold text-white mb-4">System Health</h2>
            <div className="space-y-3">
              {systemStatus?.components.map((component) => (
                <div
                  key={component.name}
                  className="flex items-center justify-between p-3 rounded-lg bg-nexus-bg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        component.status === 'operational'
                          ? 'bg-nexus-green'
                          : component.status === 'degraded'
                          ? 'bg-nexus-orange'
                          : 'bg-nexus-red'
                      }`}
                    ></div>
                    <span className="text-sm text-nexus-text">{component.name}</span>
                  </div>
                  <span className="text-xs text-nexus-muted">{component.latency}ms</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full btn-primary flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Workflow
              </button>
              <button className="w-full btn-secondary flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Status
              </button>
              <button className="w-full btn-secondary flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export Report
              </button>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-nexus-bg">
                <div className="w-2 h-2 rounded-full bg-nexus-green mt-2"></div>
                <div>
                  <p className="text-sm text-nexus-text">Payment module tests passed</p>
                  <p className="text-xs text-nexus-muted">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-nexus-bg">
                <div className="w-2 h-2 rounded-full bg-nexus-accent mt-2"></div>
                <div>
                  <p className="text-sm text-nexus-text">Security scan completed</p>
                  <p className="text-xs text-nexus-muted">5 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-nexus-bg">
                <div className="w-2 h-2 rounded-full bg-nexus-purple mt-2"></div>
                <div>
                  <p className="text-sm text-nexus-text">Architecture review approved</p>
                  <p className="text-xs text-nexus-muted">12 minutes ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Band Room</h2>
          <span className="badge badge-cyan">Live Communication</span>
        </div>
        <BandRoom />
      </div>
    </div>
  );
}
