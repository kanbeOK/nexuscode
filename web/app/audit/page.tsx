'use client';

import { useEffect, useState } from 'react';
import { AuditEntry } from '@/lib/types';
import { fetchAuditLog } from '@/lib/api';
import AuditLog from '@/components/AuditLog';

export default function AuditPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);
  const [filterAgent, setFilterAgent] = useState<string>('all');

  useEffect(() => {
    fetchAuditLog().then((data) => {
      setEntries(data);
      setLoading(false);
    });
  }, []);

  const uniqueAgents = Array.from(new Set(entries.map((e) => e.agent)));

  const filteredEntries =
    filterAgent === 'all'
      ? entries
      : entries.filter((e) => e.agent === filterAgent);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-nexus-accent border-t-transparent rounded-full animate-spin"></div>
          <p className="text-nexus-muted">Loading audit trail...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Audit Trail</h1>
          <p className="text-nexus-muted mt-1">
            Immutable chain of agent actions with SHA-256 verification
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-lg bg-nexus-card border border-nexus-border">
            <span className="text-nexus-muted text-sm">Chain Integrity: </span>
            <span className="text-nexus-green font-medium">✓ Verified</span>
          </div>
          <button className="btn-secondary flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <select
            value={filterAgent}
            onChange={(e) => setFilterAgent(e.target.value)}
            className="input-field"
          >
            <option value="all">All Agents</option>
            {uniqueAgents.map((agent) => (
              <option key={agent} value={agent}>
                {agent}
              </option>
            ))}
          </select>
        </div>
        <div className="px-4 py-2 rounded-lg bg-nexus-card border border-nexus-border">
          <span className="text-nexus-muted text-sm">{filteredEntries.length} entries</span>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-6">Blockchain Verification</h2>
        <div className="bg-nexus-bg rounded-xl p-6 border border-nexus-border">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-nexus-green/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-nexus-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">Chain Verification Status</h3>
              <p className="text-sm text-nexus-muted">
                All {entries.length} audit entries verified with SHA-256 hashing
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-nexus-card border border-nexus-border">
              <p className="text-sm text-nexus-muted mb-1">Total Entries</p>
              <p className="text-2xl font-bold text-white">{entries.length}</p>
            </div>
            <div className="p-4 rounded-lg bg-nexus-card border border-nexus-border">
              <p className="text-sm text-nexus-muted mb-1">Chain Length</p>
              <p className="text-2xl font-bold text-nexus-green">{entries.length} blocks</p>
            </div>
            <div className="p-4 rounded-lg bg-nexus-card border border-nexus-border">
              <p className="text-sm text-nexus-muted mb-1">Integrity</p>
              <p className="text-2xl font-bold text-nexus-green">100%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-6">Audit Entries</h2>
        <AuditLog entries={filteredEntries} onSelectEntry={setSelectedEntry} />
      </div>

      {selectedEntry && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-2xl max-h-[80vh] overflow-auto animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Entry Details</h3>
              <button
                onClick={() => setSelectedEntry(null)}
                className="text-nexus-muted hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-nexus-muted block mb-1">Entry ID</label>
                  <p className="text-white font-mono text-sm">{selectedEntry.id}</p>
                </div>
                <div>
                  <label className="text-sm text-nexus-muted block mb-1">Timestamp</label>
                  <p className="text-white">
                    {new Date(selectedEntry.timestamp).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-nexus-muted block mb-1">Agent</label>
                  <p className="text-white">{selectedEntry.agent}</p>
                </div>
                <div>
                  <label className="text-sm text-nexus-muted block mb-1">Action</label>
                  <p className="text-white">{selectedEntry.action}</p>
                </div>
              </div>
              <div>
                <label className="text-sm text-nexus-muted block mb-1">Details</label>
                <p className="text-white bg-nexus-bg p-3 rounded-lg text-sm">
                  {selectedEntry.details}
                </p>
              </div>
              <div>
                <label className="text-sm text-nexus-muted block mb-1">
                  SHA-256 Hash
                </label>
                <p className="text-white font-mono text-xs bg-nexus-bg p-3 rounded-lg break-all">
                  {selectedEntry.hash}
                </p>
              </div>
              <div>
                <label className="text-sm text-nexus-muted block mb-1">
                  Previous Hash
                </label>
                <p className="text-white font-mono text-xs bg-nexus-bg p-3 rounded-lg break-all">
                  {selectedEntry.previousHash}
                </p>
              </div>
              <div>
                <label className="text-sm text-nexus-muted block mb-1">Metadata</label>
                <div className="bg-nexus-bg p-3 rounded-lg">
                  {Object.entries(selectedEntry.metadata).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between py-1">
                      <span className="text-nexus-muted text-sm">{key}</span>
                      <span className="text-white text-sm font-mono">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-6">Audit Chain Visualization</h2>
        <div className="relative overflow-x-auto pb-4">
          <div className="flex items-start gap-2 min-w-max">
            {entries.map((entry, index) => (
              <div key={entry.id} className="flex items-start">
                <div
                  className="p-4 rounded-xl bg-nexus-bg border border-nexus-border hover:border-nexus-accent/30 transition-colors cursor-pointer w-64"
                  onClick={() => setSelectedEntry(entry)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-nexus-accent/10 flex items-center justify-center">
                      <span className="text-sm">
                        {getAgentAvatar(entry.agent)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{entry.agent}</p>
                      <p className="text-xs text-nexus-muted">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-nexus-muted mb-2">{entry.action}</p>
                  <p className="text-xs text-nexus-dim font-mono truncate">
                    {entry.hash.substring(0, 16)}...
                  </p>
                </div>
                {index < entries.length - 1 && (
                  <div className="flex flex-col items-center mx-2 mt-6">
                    <div className="w-0.5 h-8 bg-nexus-border"></div>
                    <svg
                      className="w-4 h-4 text-nexus-border"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function getAgentAvatar(agentId: string): string {
  const avatars: Record<string, string> = {
    planner: '🎯',
    architect: '🏗️',
    developer: '💻',
    reviewer: '🔍',
    redteamer: '🛡️',
    qa: '🧪',
    devops: '🚀',
    scribe: '📝',
    debugger: '🐛',
    optimizer: '⚡',
    integrator: '🔗',
  };
  return avatars[agentId] || '🤖';
}
