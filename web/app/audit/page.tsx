'use client';

export default function AuditPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Audit Trail</h1>
        <p className="text-sm text-gray-400 mt-1">SHA-256 tamper-evident log</p>
      </div>

      <div className="glass-card rounded-xl p-6">
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔐</div>
          <h3 className="text-lg font-semibold text-white mb-2">Blockchain-Style Audit</h3>
          <p className="text-sm text-gray-400 max-w-md mx-auto">
            Every agent action is recorded with SHA-256 hashing, creating a tamper-evident chain.
            Connect to backend to see real audit entries.
          </p>
          <div className="mt-6 p-4 rounded-lg bg-white/5 border border-white/10">
            <code className="text-xs text-cyan-400 font-mono">
              GET /api/audit - Query audit trail<br/>
              GET /api/audit/verify - Verify chain integrity
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
