'use client';

export default function WorkflowTimeline({ steps = [] }: { steps?: any[] }) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-4">
      {(steps.length ? steps : ['Planner', 'Architect', 'Developer', 'Reviewer', 'QA', 'DevOps', 'Scribe']).map((step: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center text-sm font-bold text-cyan-400">
            {i + 1}
          </div>
          <span className="text-sm text-gray-300">{typeof step === 'string' ? step : step.name}</span>
          {i < 6 && <span className="text-gray-600 mx-2">→</span>}
        </div>
      ))}
    </div>
  );
}
