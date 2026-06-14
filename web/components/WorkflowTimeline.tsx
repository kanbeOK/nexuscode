import { WorkflowStep } from '@/lib/types';

interface WorkflowTimelineProps {
  steps: WorkflowStep[];
  selectedStep: string | null;
  onStepSelect: (stepId: string | null) => void;
}

export default function WorkflowTimeline({
  steps,
  selectedStep,
  onStepSelect,
}: WorkflowTimelineProps) {
  const agentData: Record<string, { name: string; avatar: string; role: string }> = {
    planner: { name: 'NexusPlanner', avatar: '🎯', role: 'Strategic Planner' },
    architect: { name: 'NexusArchitect', avatar: '🏗️', role: 'System Architect' },
    developer: { name: 'NexusDeveloper', avatar: '💻', role: 'Full-Stack Developer' },
    reviewer: { name: 'NexusReviewer', avatar: '🔍', role: 'Code Reviewer' },
    redteamer: { name: 'NexusRedTeam', avatar: '🛡️', role: 'Security Analyst' },
    qa: { name: 'NexusQA', avatar: '🧪', role: 'Quality Assurance' },
    devops: { name: 'NexusDevOps', avatar: '🚀', role: 'DevOps Engineer' },
    scribe: { name: 'NexusScribe', avatar: '📝', role: 'Technical Writer' },
    debugger: { name: 'NexusDebugger', avatar: '🐛', role: 'Debug Specialist' },
    optimizer: { name: 'NexusOptimizer', avatar: '⚡', role: 'Performance Engineer' },
    integrator: { name: 'NexusIntegrator', avatar: '🔗', role: 'Integration Specialist' },
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-nexus-green text-white';
      case 'active':
        return 'bg-nexus-accent text-white animate-pulse';
      case 'failed':
        return 'bg-nexus-red text-white';
      default:
        return 'bg-nexus-card border-2 border-nexus-border text-nexus-muted';
    }
  };

  const getLineColor = (status: string) => {
    return status === 'completed' ? 'bg-nexus-green' : 'bg-nexus-border';
  };

  return (
    <div className="relative">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-0 overflow-x-auto pb-4">
        {steps.map((step, index) => {
          const agent = agentData[step.agent];
          const isSelected = selectedStep === step.id;

          return (
            <div key={step.id} className="flex items-center">
              <div
                className={`relative flex flex-col items-center cursor-pointer transition-all duration-200 ${
                  isSelected ? 'scale-105' : 'hover:scale-102'
                }`}
                onClick={() => onStepSelect(isSelected ? null : step.id)}
              >
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mb-2 ${getStatusColor(
                    step.status
                  )} ${
                    isSelected ? 'ring-2 ring-nexus-accent ring-offset-2 ring-offset-nexus-bg' : ''
                  }`}
                >
                  {agent?.avatar}
                </div>
                <p className="text-sm font-medium text-white text-center max-w-[120px]">
                  {step.name}
                </p>
                <p className="text-xs text-nexus-muted text-center">
                  {agent?.role}
                </p>
                {step.status === 'completed' && (
                  <span className="text-xs text-nexus-green mt-1">✓ Done</span>
                )}
                {step.status === 'active' && (
                  <span className="text-xs text-nexus-accent mt-1">● Active</span>
                )}
                {step.status === 'failed' && (
                  <span className="text-xs text-nexus-red mt-1">✗ Failed</span>
                )}
                {step.duration && (
                  <span className="text-xs text-nexus-dim mt-1">
                    {Math.round(step.duration / 60)}m {step.duration % 60}s
                  </span>
                )}
              </div>
              {index < steps.length - 1 && (
                <div className="flex items-center mx-4">
                  <div className={`w-12 h-0.5 ${getLineColor(step.status)}`}></div>
                  <svg
                    className={`w-4 h-4 ${
                      step.status === 'completed' ? 'text-nexus-green' : 'text-nexus-border'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
