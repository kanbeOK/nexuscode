'use client';

export default function MetricsDashboard({ metrics }: { metrics?: any }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { label: 'Tasks', value: metrics?.totalTasks || 0 },
        { label: 'Completed', value: metrics?.completedTasks || 0 },
        { label: 'Success Rate', value: `${metrics?.successRate || 0}%` },
        { label: 'Tokens Used', value: metrics?.tokensUsed || 0 },
      ].map((m) => (
        <div key={m.label} className="glass-card p-4 rounded-xl">
          <p className="text-xs text-gray-400">{m.label}</p>
          <p className="text-2xl font-bold text-cyan-400">{m.value}</p>
        </div>
      ))}
    </div>
  );
}
