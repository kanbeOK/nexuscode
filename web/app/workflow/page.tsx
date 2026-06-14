'use client';

export default function WorkflowPage() {
  const steps = [
    { name: 'Planner', role: 'planner', color: '#3b82f6', description: 'Analyze requirements, create user stories' },
    { name: 'Architect', role: 'architect', color: '#8b5cf6', description: 'Design system architecture, define APIs' },
    { name: 'Developer', role: 'developer', color: '#10b981', description: 'Implement production-ready code' },
    { name: 'Reviewer', role: 'reviewer', color: '#f59e0b', description: 'Review code quality, best practices' },
    { name: 'RedTeamer', role: 'red_teamer', color: '#ef4444', description: 'Find security vulnerabilities' },
    { name: 'QA', role: 'qa', color: '#ec4899', description: 'Create tests, verify quality' },
    { name: 'DevOps', role: 'devops', color: '#14b8a6', description: 'Handle deployment, CI/CD' },
    { name: 'Scribe', role: 'scribe', color: '#a855f7', description: 'Create documentation' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Development Workflow</h1>
        <p className="text-sm text-gray-400 mt-1">Multi-agent pipeline for software development</p>
      </div>

      <div className="glass-card rounded-xl p-8">
        <div className="space-y-4">
          {steps.map((step, i) => (
            <div key={step.role} className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold"
                style={{ background: `${step.color}20`, color: step.color }}
              >
                {i + 1}
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold">{step.name}</h3>
                <p className="text-sm text-gray-400">{step.description}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="text-gray-600">→</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
