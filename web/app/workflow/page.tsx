'use client';

import { useEffect, useState } from 'react';
import { Workflow } from '@/lib/types';
import { fetchWorkflow } from '@/lib/api';
import WorkflowTimeline from '@/components/WorkflowTimeline';

const agentColors: Record<string, string> = {
  planner: '#3b82f6', architect: '#a855f7', developer: '#00e5ff', reviewer: '#00ff88',
  redteamer: '#ff3d71', qa: '#ff9100', devops: '#6366f1', scribe: '#f472b6',
  debugger: '#f87171', optimizer: '#fbbf24', integrator: '#2dd4bf',
};

const agentData: Record<string, { avatar: string; role: string }> = {
  planner: { avatar: '🎯', role: 'Strategic Planner' },
  architect: { avatar: '🏗️', role: 'System Architect' },
  developer: { avatar: '💻', role: 'Full-Stack Developer' },
  reviewer: { avatar: '🔍', role: 'Code Reviewer' },
  redteamer: { avatar: '🛡️', role: 'Security Analyst' },
  qa: { avatar: '🧪', role: 'Quality Assurance' },
  devops: { avatar: '🚀', role: 'DevOps Engineer' },
  scribe: { avatar: '📝', role: 'Technical Writer' },
  debugger: { avatar: '🐛', role: 'Debug Specialist' },
  optimizer: { avatar: '⚡', role: 'Performance Engineer' },
  integrator: { avatar: '🔗', role: 'Integration Specialist' },
};

export default function WorkflowPage() {
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStep, setSelectedStep] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkflow().then((data) => {
      setWorkflow(data);
      setLoading(false);
    });
  }, []);

  if (loading || !workflow) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-2 border-nexus-cyan/10 rounded-full"></div>
            <div className="absolute inset-0 border-2 border-nexus-cyan/40 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-nexus-dim text-xs font-mono">LOADING WORKFLOW PIPELINE...</p>
        </div>
      </div>
    );
  }

  const currentStep = workflow.steps.find((s) => s.id === selectedStep);
  const completedSteps = workflow.steps.filter((s) => s.status === 'completed').length;

  return (
    <div className="space-y-8" style={{ animation: 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">
            <span className="neon-text">Workflow</span>
            <span className="text-white ml-2">Pipeline</span>
          </h1>
          <p className="text-sm text-nexus-muted mt-1 font-mono">VISUAL DEVELOPMENT WORKFLOW REPRESENTATION</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl font-mono text-xs" style={{
            background: 'rgba(0, 229, 255, 0.05)',
            border: '1px solid rgba(0, 229, 255, 0.12)',
          }}>
            <span className="text-nexus-dim">PROGRESS </span>
            <span className="text-nexus-cyan font-bold">{workflow.progress}%</span>
          </div>
          <div className="px-4 py-2 rounded-xl font-mono text-xs" style={{
            background: 'rgba(0, 255, 136, 0.05)',
            border: '1px solid rgba(0, 255, 136, 0.12)',
          }}>
            <span className="text-nexus-dim">STEPS </span>
            <span className="text-nexus-green font-bold">{completedSteps}/{workflow.steps.length}</span>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">{workflow.name}</h2>
          <span
            className="px-3 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase"
            style={{
              background: workflow.status === 'running' ? 'rgba(0, 255, 136, 0.1)' : workflow.status === 'completed' ? 'rgba(0, 229, 255, 0.1)' : workflow.status === 'failed' ? 'rgba(255, 61, 113, 0.1)' : 'rgba(255, 145, 0, 0.1)',
              color: workflow.status === 'running' ? '#00ff88' : workflow.status === 'completed' ? '#00e5ff' : workflow.status === 'failed' ? '#ff3d71' : '#ff9100',
              border: `1px solid ${workflow.status === 'running' ? 'rgba(0, 255, 136, 0.2)' : workflow.status === 'completed' ? 'rgba(0, 229, 255, 0.2)' : workflow.status === 'failed' ? 'rgba(255, 61, 113, 0.2)' : 'rgba(255, 145, 0, 0.2)'}`,
            }}
          >
            {workflow.status}
          </span>
        </div>

        <div className="w-full h-2 rounded-full overflow-hidden mb-8" style={{ background: 'rgba(6, 8, 15, 0.6)' }}>
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${workflow.progress}%`,
              background: 'linear-gradient(90deg, #0066ff, #00e5ff, #00ff88)',
              boxShadow: '0 0 20px rgba(0, 229, 255, 0.4), 0 0 40px rgba(0, 229, 255, 0.2)',
            }}
          ></div>
        </div>

        <WorkflowTimeline
          steps={workflow.steps}
          selectedStep={selectedStep}
          onStepSelect={setSelectedStep}
        />
      </div>

      {currentStep && (
        <div className="glass-card p-6" style={{ animation: 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-white">Step Details: {currentStep.name}</h3>
            <button
              onClick={() => setSelectedStep(null)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-nexus-dim hover:text-white hover:bg-white/5 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-nexus-dim font-mono uppercase tracking-wider block mb-1.5">Agent</label>
                <p className="text-sm text-white font-medium">{currentStep.agent}</p>
              </div>
              <div>
                <label className="text-[10px] text-nexus-dim font-mono uppercase tracking-wider block mb-1.5">Status</label>
                <span
                  className="px-2.5 py-1 rounded-lg text-xs font-bold"
                  style={{
                    background: currentStep.status === 'completed' ? 'rgba(0, 255, 136, 0.1)' : currentStep.status === 'active' ? 'rgba(0, 229, 255, 0.1)' : currentStep.status === 'failed' ? 'rgba(255, 61, 113, 0.1)' : 'rgba(255, 145, 0, 0.1)',
                    color: currentStep.status === 'completed' ? '#00ff88' : currentStep.status === 'active' ? '#00e5ff' : currentStep.status === 'failed' ? '#ff3d71' : '#ff9100',
                  }}
                >
                  {currentStep.status}
                </span>
              </div>
              {currentStep.startTime && (
                <div>
                  <label className="text-[10px] text-nexus-dim font-mono uppercase tracking-wider block mb-1.5">Start Time</label>
                  <p className="text-sm text-white font-mono">{new Date(currentStep.startTime).toLocaleString()}</p>
                </div>
              )}
              {currentStep.duration && (
                <div>
                  <label className="text-[10px] text-nexus-dim font-mono uppercase tracking-wider block mb-1.5">Duration</label>
                  <p className="text-sm text-white font-mono">{Math.round(currentStep.duration / 60)}m {currentStep.duration % 60}s</p>
                </div>
              )}
            </div>
            <div className="space-y-4">
              {currentStep.output && (
                <div>
                  <label className="text-[10px] text-nexus-dim font-mono uppercase tracking-wider block mb-1.5">Output</label>
                  <p className="text-sm text-white p-3 rounded-xl" style={{
                    background: 'rgba(6, 8, 15, 0.5)',
                    border: '1px solid rgba(0, 229, 255, 0.06)',
                  }}>{currentStep.output}</p>
                </div>
              )}
              <div>
                <label className="text-[10px] text-nexus-dim font-mono uppercase tracking-wider block mb-1.5">Dependencies</label>
                <div className="flex flex-wrap gap-1.5">
                  {currentStep.dependencies.length > 0 ? (
                    currentStep.dependencies.map((dep) => (
                      <span key={dep} className="px-2 py-0.5 rounded-md text-[10px] font-mono" style={{
                        background: 'rgba(168, 85, 247, 0.08)',
                        color: '#a855f7',
                        border: '1px solid rgba(168, 85, 247, 0.15)',
                      }}>{dep}</span>
                    ))
                  ) : (
                    <span className="text-[10px] text-nexus-dim">None</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="glass-card p-6">
        <h2 className="text-lg font-bold text-white mb-5">Pipeline Visualization</h2>
        <div className="relative overflow-x-auto pb-4 scrollbar-thin">
          <div className="flex items-center gap-4 min-w-max">
            {workflow.steps.map((step, index) => {
              const agentInfo = agentData[step.agent];
              const color = agentColors[step.agent] || '#00e5ff';

              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className="relative p-4 rounded-2xl cursor-pointer transition-all duration-300 w-44 group"
                    style={{
                      background: step.status === 'active' ? `${color}08` : step.status === 'completed' ? `${color}05` : 'rgba(17, 22, 40, 0.4)',
                      border: `2px solid ${
                        step.status === 'completed' ? `${color}40` :
                        step.status === 'active' ? `${color}50` :
                        step.status === 'failed' ? 'rgba(255, 61, 113, 0.4)' :
                        'rgba(26, 35, 64, 0.4)'
                      }`,
                      boxShadow: step.status === 'active' ? `0 0 20px ${color}20, 0 0 40px ${color}10` : 'none',
                    }}
                    onClick={() => setSelectedStep(step.id)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{agentInfo?.avatar}</span>
                      <span className="text-[10px] font-bold" style={{
                        color: step.status === 'completed' ? '#00ff88' : step.status === 'active' ? color : step.status === 'failed' ? '#ff3d71' : '#7a8baa',
                      }}>
                        {step.status === 'completed' ? '✓' : step.status === 'active' ? '●' : step.status === 'failed' ? '✗' : '○'}
                      </span>
                    </div>
                    <h4 className="font-semibold text-white text-sm mb-0.5">{step.name}</h4>
                    <p className="text-[10px] text-nexus-dim">{agentInfo?.role}</p>
                    {step.duration && (
                      <p className="text-[10px] font-mono text-nexus-dim mt-2">
                        {Math.round(step.duration / 60)}m {step.duration % 60}s
                      </p>
                    )}
                  </div>
                  {index < workflow.steps.length - 1 && (
                    <div className="flex items-center mx-2">
                      <div className="w-8 h-[2px] rounded-full" style={{
                        background: step.status === 'completed'
                          ? `linear-gradient(90deg, ${color}, ${agentColors[workflow.steps[index + 1]?.agent] || color})`
                          : 'rgba(26, 35, 64, 0.4)',
                        boxShadow: step.status === 'completed' ? `0 0 6px ${color}30` : 'none',
                      }}></div>
                      <svg className="w-3 h-3" fill={step.status === 'completed' ? color : 'rgba(26, 35, 64, 0.4)'} viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-5">
          <h2 className="text-lg font-bold text-white mb-4">Pipeline Statistics</h2>
          <div className="space-y-2">
            {[
              { label: 'Total Steps', value: workflow.steps.length, color: '#00e5ff' },
              { label: 'Completed', value: completedSteps, color: '#00ff88' },
              { label: 'In Progress', value: workflow.steps.filter((s) => s.status === 'active').length, color: '#a855f7' },
              { label: 'Pending', value: workflow.steps.filter((s) => s.status === 'pending').length, color: '#7a8baa' },
              { label: 'Failed', value: workflow.steps.filter((s) => s.status === 'failed').length, color: '#ff3d71' },
            ].map((stat, index) => (
              <div key={stat.label} className="flex items-center justify-between p-3 rounded-xl" style={{
                background: `${stat.color}05`,
                border: `1px solid ${stat.color}08`,
              }}>
                <span className="text-xs text-nexus-muted">{stat.label}</span>
                <span className="text-sm font-bold font-mono" style={{ color: stat.color }}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-5">
          <h2 className="text-lg font-bold text-white mb-4">Timeline</h2>
          <div className="space-y-3">
            {workflow.steps.map((step, index) => {
              const color = agentColors[step.agent] || '#00e5ff';
              return (
                <div key={step.id} className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{
                    background: step.status === 'completed' ? '#00ff88' : step.status === 'active' ? color : step.status === 'failed' ? '#ff3d71' : '#3a4565',
                    boxShadow: step.status === 'active' ? `0 0 8px ${color}` : 'none',
                    animation: step.status === 'active' ? 'pulse 2s ease-in-out infinite' : 'none',
                  }}></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white font-medium">{step.name}</span>
                      <span className="text-[10px] text-nexus-dim font-mono">
                        {step.startTime ? new Date(step.startTime).toLocaleTimeString() : '—'}
                      </span>
                    </div>
                    <div className="w-full h-1 rounded-full mt-1.5" style={{ background: 'rgba(6, 8, 15, 0.6)' }}>
                      <div className="h-full rounded-full transition-all duration-500" style={{
                        width: step.status === 'completed' ? '100%' : step.status === 'active' ? '50%' : '0%',
                        background: step.status === 'completed' ? '#00ff88' : step.status === 'active' ? color : 'transparent',
                        boxShadow: step.status === 'active' ? `0 0 6px ${color}` : 'none',
                      }}></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
