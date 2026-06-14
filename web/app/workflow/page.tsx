'use client';

import { useEffect, useState } from 'react';
import { Workflow } from '@/lib/types';
import { fetchWorkflow } from '@/lib/api';
import WorkflowTimeline from '@/components/WorkflowTimeline';

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
          <div className="w-12 h-12 border-4 border-nexus-accent border-t-transparent rounded-full animate-spin"></div>
          <p className="text-nexus-muted">Loading workflow...</p>
        </div>
      </div>
    );
  }

  const currentStep = workflow.steps.find((s) => s.id === selectedStep);
  const completedSteps = workflow.steps.filter((s) => s.status === 'completed').length;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Workflow Pipeline</h1>
          <p className="text-nexus-muted mt-1">
            Visual representation of the development workflow
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-lg bg-nexus-card border border-nexus-border">
            <span className="text-nexus-muted text-sm">Progress: </span>
            <span className="text-white font-medium">{workflow.progress}%</span>
          </div>
          <div className="px-4 py-2 rounded-lg bg-nexus-card border border-nexus-border">
            <span className="text-nexus-muted text-sm">Steps: </span>
            <span className="text-white font-medium">
              {completedSteps}/{workflow.steps.length}
            </span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            {workflow.name}
          </h2>
          <div className="flex items-center gap-2">
            <span className={`badge ${
              workflow.status === 'running' ? 'badge-green' :
              workflow.status === 'completed' ? 'badge-blue' :
              workflow.status === 'failed' ? 'badge-red' : 'badge-orange'
            }`}>
              {workflow.status.charAt(0).toUpperCase() + workflow.status.slice(1)}
            </span>
          </div>
        </div>

        <div className="w-full h-2 bg-nexus-bg rounded-full overflow-hidden mb-8">
          <div
            className="h-full bg-gradient-to-r from-nexus-accent to-nexus-green rounded-full transition-all duration-500"
            style={{ width: `${workflow.progress}%` }}
          ></div>
        </div>

        <WorkflowTimeline
          steps={workflow.steps}
          selectedStep={selectedStep}
          onStepSelect={setSelectedStep}
        />
      </div>

      {currentStep && (
        <div className="card animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              Step Details: {currentStep.name}
            </h3>
            <button
              onClick={() => setSelectedStep(null)}
              className="text-nexus-muted hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-nexus-muted block mb-1">Agent</label>
                <p className="text-white">{currentStep.agent}</p>
              </div>
              <div>
                <label className="text-sm text-nexus-muted block mb-1">Status</label>
                <span className={`badge ${
                  currentStep.status === 'completed' ? 'badge-green' :
                  currentStep.status === 'active' ? 'badge-blue' :
                  currentStep.status === 'failed' ? 'badge-red' : 'badge-orange'
                }`}>
                  {currentStep.status.charAt(0).toUpperCase() + currentStep.status.slice(1)}
                </span>
              </div>
              {currentStep.startTime && (
                <div>
                  <label className="text-sm text-nexus-muted block mb-1">Start Time</label>
                  <p className="text-white">
                    {new Date(currentStep.startTime).toLocaleString()}
                  </p>
                </div>
              )}
              {currentStep.endTime && (
                <div>
                  <label className="text-sm text-nexus-muted block mb-1">End Time</label>
                  <p className="text-white">
                    {new Date(currentStep.endTime).toLocaleString()}
                  </p>
                </div>
              )}
              {currentStep.duration && (
                <div>
                  <label className="text-sm text-nexus-muted block mb-1">Duration</label>
                  <p className="text-white">
                    {Math.round(currentStep.duration / 60)}m {currentStep.duration % 60}s
                  </p>
                </div>
              )}
            </div>
            <div className="space-y-4">
              {currentStep.input && (
                <div>
                  <label className="text-sm text-nexus-muted block mb-1">Input</label>
                  <p className="text-white bg-nexus-bg p-3 rounded-lg text-sm">
                    {currentStep.input}
                  </p>
                </div>
              )}
              {currentStep.output && (
                <div>
                  <label className="text-sm text-nexus-muted block mb-1">Output</label>
                  <p className="text-white bg-nexus-bg p-3 rounded-lg text-sm">
                    {currentStep.output}
                  </p>
                </div>
              )}
              <div>
                <label className="text-sm text-nexus-muted block mb-1">Dependencies</label>
                <div className="flex flex-wrap gap-2">
                  {currentStep.dependencies.length > 0 ? (
                    currentStep.dependencies.map((dep) => (
                      <span key={dep} className="badge badge-purple">
                        {dep}
                      </span>
                    ))
                  ) : (
                    <span className="text-nexus-dim text-sm">None</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-6">Workflow Visualization</h2>
        <div className="relative overflow-x-auto pb-4">
          <div className="flex items-center gap-4 min-w-max">
            {workflow.steps.map((step, index) => {
              const agentData = getAgentForStep(step.agent);
              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 w-48 ${
                      step.status === 'completed'
                        ? 'border-nexus-green bg-nexus-green/5 hover:bg-nexus-green/10'
                        : step.status === 'active'
                        ? 'border-nexus-accent bg-nexus-accent/5 glow-border'
                        : step.status === 'failed'
                        ? 'border-nexus-red bg-nexus-red/5'
                        : 'border-nexus-border bg-nexus-card hover:border-nexus-accent/30'
                    }`}
                    onClick={() => setSelectedStep(step.id)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{agentData?.avatar}</span>
                      <span className={`text-xs font-medium ${
                        step.status === 'completed' ? 'text-nexus-green' :
                        step.status === 'active' ? 'text-nexus-accent' :
                        step.status === 'failed' ? 'text-nexus-red' : 'text-nexus-muted'
                      }`}>
                        {step.status === 'completed' ? '✓' :
                         step.status === 'active' ? '●' :
                         step.status === 'failed' ? '✗' : '○'}
                      </span>
                    </div>
                    <h4 className="font-medium text-white text-sm mb-1">{step.name}</h4>
                    <p className="text-xs text-nexus-muted">{agentData?.role}</p>
                    {step.duration && (
                      <p className="text-xs text-nexus-dim mt-2">
                        {Math.round(step.duration / 60)}m {step.duration % 60}s
                      </p>
                    )}
                  </div>
                  {index < workflow.steps.length - 1 && (
                    <div className="flex items-center mx-2">
                      <div className={`w-8 h-0.5 ${
                        step.status === 'completed' ? 'bg-nexus-green' : 'bg-nexus-border'
                      }`}></div>
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold text-white mb-4">Pipeline Statistics</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-nexus-bg">
              <span className="text-nexus-muted">Total Steps</span>
              <span className="text-white font-medium">{workflow.steps.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-nexus-bg">
              <span className="text-nexus-muted">Completed</span>
              <span className="text-nexus-green font-medium">{completedSteps}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-nexus-bg">
              <span className="text-nexus-muted">In Progress</span>
              <span className="text-nexus-accent font-medium">
                {workflow.steps.filter((s) => s.status === 'active').length}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-nexus-bg">
              <span className="text-nexus-muted">Pending</span>
              <span className="text-nexus-muted font-medium">
                {workflow.steps.filter((s) => s.status === 'pending').length}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-nexus-bg">
              <span className="text-nexus-muted">Failed</span>
              <span className="text-nexus-red font-medium">
                {workflow.steps.filter((s) => s.status === 'failed').length}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-white mb-4">Timeline</h2>
          <div className="space-y-4">
            {workflow.steps.map((step) => (
              <div key={step.id} className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${
                  step.status === 'completed' ? 'bg-nexus-green' :
                  step.status === 'active' ? 'bg-nexus-accent animate-pulse' :
                  step.status === 'failed' ? 'bg-nexus-red' : 'bg-nexus-dim'
                }`}></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white">{step.name}</span>
                    <span className="text-xs text-nexus-muted">
                      {step.startTime
                        ? new Date(step.startTime).toLocaleTimeString()
                        : 'Not started'}
                    </span>
                  </div>
                  <div className="w-full h-1 bg-nexus-bg rounded-full mt-1">
                    <div
                      className={`h-full rounded-full ${
                        step.status === 'completed' ? 'bg-nexus-green' :
                        step.status === 'active' ? 'bg-nexus-accent' : 'bg-nexus-border'
                      }`}
                      style={{
                        width: step.status === 'completed' ? '100%' :
                               step.status === 'active' ? '50%' : '0%'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function getAgentForStep(agentId: string) {
  const agents: Record<string, { avatar: string; role: string }> = {
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
  return agents[agentId];
}
