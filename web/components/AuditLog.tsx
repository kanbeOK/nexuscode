'use client';

export default function AuditLog({ entries = [] }: { entries?: any[] }) {
  return (
    <div className="space-y-3">
      {entries.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No audit entries yet</p>
        </div>
      ) : (
        entries.map((entry: any, i: number) => (
          <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white">{entry.action}</span>
              <span className="text-xs text-gray-400">{entry.timestamp}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
