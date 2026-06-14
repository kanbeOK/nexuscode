import { MetricsData } from '@/lib/types';

interface MetricsDashboardProps {
  metrics: MetricsData;
}

export default function MetricsDashboard({ metrics }: MetricsDashboardProps) {
  const completionRate = ((metrics.completedTasks / metrics.totalTasks) * 100).toFixed(1);

  const metricCards = [
    {
      label: 'Total Tasks',
      value: metrics.totalTasks.toLocaleString(),
      subtext: `${completionRate}% completed`,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      color: 'text-nexus-accent',
      bg: 'bg-nexus-accent/10',
    },
    {
      label: 'Completed Tasks',
      value: metrics.completedTasks.toLocaleString(),
      subtext: `${metrics.totalTasks - metrics.completedTasks} in progress`,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      color: 'text-nexus-green',
      bg: 'bg-nexus-green/10',
    },
    {
      label: 'Active Workflows',
      value: metrics.activeWorkflows.toString(),
      subtext: 'Running in parallel',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: 'text-nexus-purple',
      bg: 'bg-nexus-purple/10',
    },
    {
      label: 'Avg Response Time',
      value: `${metrics.avgResponseTime}s`,
      subtext: 'Across all agents',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'text-nexus-cyan',
      bg: 'bg-nexus-cyan/10',
    },
    {
      label: 'Success Rate',
      value: `${metrics.successRate}%`,
      subtext: 'System reliability',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'text-nexus-green',
      bg: 'bg-nexus-green/10',
    },
    {
      label: 'Tokens Used',
      value: `${(metrics.tokensUsed / 1000000).toFixed(1)}M`,
      subtext: `Est. $${metrics.costEstimate.toFixed(2)}`,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'text-nexus-orange',
      bg: 'bg-nexus-orange/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {metricCards.map((metric, index) => (
        <div
          key={metric.label}
          className="card p-4 animate-slide-up"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-lg ${metric.bg}`}>
              <div className={metric.color}>{metric.icon}</div>
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{metric.value}</p>
          <p className="text-sm text-nexus-muted mt-1">{metric.label}</p>
          <p className="text-xs text-nexus-dim mt-0.5">{metric.subtext}</p>
        </div>
      ))}
    </div>
  );
}
