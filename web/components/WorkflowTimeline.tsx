'use client';

import { WorkflowStep } from '@/lib/types';

interface WorkflowTimelineProps {
  steps: WorkflowStep[];
  selectedStep: string | null;
  onStepSelect: (stepId: string | null) => void;
}

const agentData: Record<string, { name: string; avatar: string; role: string; color: string }> = {
  planner: { name: 'NexusPlanner', avatar: '🎯', role: 'Strategic Planner', color: '#3b82f6' },
  architect: { name: 'NexusArchitect', avatar: '🏗️', role: 'System Architect', color: '#a855f7' },
  developer: { name: 'NexusDeveloper', avatar: '💻', role: 'Full-Stack Developer', color: '#00e5ff' },
  reviewer: { name: 'NexusReviewer', avatar: '🔍', role: 'Code Reviewer', color: '#00ff88' },
  redteamer: { name: 'NexusRedTeam', avatar: '🛡️', role: 'Security Analyst', color: '#ff3d71' },
  qa: { name: 'NexusQA', avatar: '🧪', role: 'Quality Assurance', color: '#ff9100' },
  devops: { name: 'NexusDevOps', avatar: '🚀', role: 'DevOps Engineer', color: '#6366f1' },
  scribe: { name: 'NexusScribe', avatar: '📝', role: 'Technical Writer', color: '#f472b6' },
  debugger: { name: 'NexusDebugger', avatar: '🐛', role: 'Debug Specialist', color: '#f87171' },
  optimizer: { name: 'NexusOptimizer', avatar: '⚡', role: 'Performance Engineer', color: '#fbbf24' },
  integrator: { name: 'NexusIntegrator', avatar: '🔗', role: 'Integration Specialist', color: '#2dd4bf' },
};

function ParticleEffect({ active, color }: { active: boolean; color: string }) {
  if (!active) return null;
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            background: color,
            boxShadow: `0 0 6px ${color}`,
            left: `${20 + Math.random() * 60}%`,
            top: `${20 + Math.random() * 60}%`,
            animation: `particleDrift ${2 + Math.random() * 2}s linear infinite`,
            animationDelay: `${i * 0.3}s`,
            '--drift-x': `${(Math.random() - 0.5) * 80}px`,
            '--drift-y': `${-40 - Math.random() * 60}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

export default function WorkflowTimeline({ steps, selectedStep, onStepSelect }: WorkflowTimelineProps) {
  return (
    <div className="relative">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-0 overflow-x-auto pb-4 scrollbar-thin">
        {steps.map((step, index) => {
          const agent = agentData[step.agent];
          const isSelected = selectedStep === step.id;
          const isActive = step.status === 'active';
          const isCompleted = step.status === 'completed';
          const isFailed = step.status === 'failed';
          const color = agent?.color || '#00e5ff';

          return (
            <div key={step.id} className="flex items-center">
              <div
                className={`relative flex flex-col items-center cursor-pointer transition-all duration-500 ${
                  isSelected ? 'scale-110' : 'hover:scale-105'
                }`}
                onClick={() => onStepSelect(isSelected ? null : step.id)}
              >
                <div
                  className="relative w-20 h-20 rounded-2xl flex items-center justify-center text-3xl mb-3 transition-all duration-500"
                  style={{
                    background: isCompleted
                      ? `linear-gradient(135deg, ${color}20, ${color}08)`
                      : isActive
                      ? `linear-gradient(135deg, ${color}30, ${color}10)`
                      : 'rgba(17, 22, 40, 0.6)',
                    border: `2px solid ${
                      isSelected
                        ? color
                        : isCompleted
                        ? `${color}50`
                        : isActive
                        ? `${color}40`
                        : 'rgba(26, 35, 64, 0.6)'
                    }`,
                    boxShadow: isActive
                      ? `0 0 20px ${color}30, 0 0 40px ${color}15, inset 0 0 20px ${color}10`
                      : isCompleted
                      ? `0 0 10px ${color}15`
                      : 'none',
                    ...(isSelected ? {
                      boxShadow: `0 0 25px ${color}40, 0 0 50px ${color}20, inset 0 0 25px ${color}15`,
                      borderColor: color,
                    } : {}),
                  }}
                >
                  <ParticleEffect active={isActive} color={color} />
                  {agent?.avatar}

                  {isActive && (
                    <div
                      className="absolute inset-0 rounded-2xl"
                      style={{
                        animation: 'glowPulse 2s ease-in-out infinite',
                        boxShadow: `0 0 20px ${color}30`,
                      }}
                    ></div>
                  )}

                  {isCompleted && (
                    <div
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white font-bold"
                      style={{
                        background: color,
                        boxShadow: `0 0 10px ${color}60`,
                      }}
                    >
                      ✓
                    </div>
                  )}

                  {isFailed && (
                    <div
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white font-bold"
                      style={{
                        background: '#ff3d71',
                        boxShadow: '0 0 10px rgba(255, 61, 113, 0.6)',
                      }}
                    >
                      ✗
                    </div>
                  )}
                </div>

                <p className="text-xs font-semibold text-white text-center max-w-[100px] leading-tight">{step.name}</p>
                <p className="text-[10px] text-nexus-dim text-center mt-0.5">{agent?.role}</p>

                {step.duration && (
                  <span className="text-[10px] font-mono text-nexus-dim mt-1">
                    {Math.round(step.duration / 60)}m {step.duration % 60}s
                  </span>
                )}
              </div>

              {index < steps.length - 1 && (
                <div className="flex items-center mx-3 relative">
                  <div
                    className="w-16 h-[2px] rounded-full transition-all duration-500"
                    style={{
                      background: isCompleted
                        ? `linear-gradient(90deg, ${color}, ${agentData[steps[index + 1]?.agent]?.color || color})`
                        : isActive
                        ? `linear-gradient(90deg, ${color}60, rgba(26, 35, 64, 0.4))`
                        : 'rgba(26, 35, 64, 0.4)',
                      boxShadow: isCompleted ? `0 0 8px ${color}40` : 'none',
                    }}
                  ></div>

                  {isCompleted && (
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
                      style={{
                        background: color,
                        boxShadow: `0 0 6px ${color}`,
                        animation: 'particleDrift 2s linear infinite',
                        left: '50%',
                      }}
                    ></div>
                  )}

                  <svg
                    className="w-3 h-3 flex-shrink-0"
                    fill={isCompleted ? color : 'rgba(26, 35, 64, 0.6)'}
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
