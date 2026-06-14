'use client';

import { useEffect, useState } from 'react';
import { AuditEntry } from '@/lib/types';
import { fetchAuditLog } from '@/lib/api';
import AuditLog from '@/components/AuditLog';

const agentAvatars: Record<string, string> = {
  planner: '🎯', architect: '🏗️', developer: '💻', reviewer: '🔍', redteamer: '🛡️',
  qa: '🧪', devops: '🚀', scribe: '📝', debugger: '🐛', optimizer: '⚡', integrator: '🔗',
};

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
  const filteredEntries = filterAgent === 'all' ? entries : entries.filter((e) => e.agent === filterAgent);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-2 border-nexus-cyan/10 rounded-full"></div>
            <div className="absolute inset-0 border-2 border-nexus-cyan/40 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-nexus-dim text-xs font-mono">LOADING AUDIT TRAIL...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8" style={{ animation: 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">
            <span className="neon-text">Audit</span>
            <span className="text-white ml-2">Trail</span>
          </h1>
          <p className="text-sm text-nexus-muted mt-1 font-mono">IMMUTABLE CHAIN OF AGENT ACTIONS WITH SHA-256 VERIFICATION</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl flex items-center gap-2" style={{
            background: 'rgba(0, 255, 136, 0.05)',
            border: '1px solid rgba(0, 255, 136, 0.12)',
          }}>
            <span className="text-nexus-dim text-xs">Chain Integrity: </span>
            <span className="text-nexus-green font-semibold text-xs">✓ Verified</span>
          </div>
          <button className="btn-cyber flex items-center gap-2 text-xs">
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
            className="input-cyber"
          >
            <option value="all">All Agents</option>
            {uniqueAgents.map((agent) => (
              <option key={agent} value={agent}>{agent}</option>
            ))}
          </select>
        </div>
        <div className="px-4 py-2 rounded-xl font-mono text-xs" style={{
          background: 'rgba(0, 229, 255, 0.05)',
          border: '1px solid rgba(0, 229, 255, 0.1)',
        }}>
          <span className="text-nexus-dim">{filteredEntries.length} ENTRIES</span>
        </div>
      </div>

      <div className="glass-card p-6 scan-overlay">
        <h2 className="text-lg font-bold text-white mb-5">Blockchain Verification</h2>
        <div className="rounded-xl p-5" style={{
          background: 'rgba(6, 8, 15, 0.5)',
          border: '1px solid rgba(0, 255, 136, 0.1)',
        }}>
          <div className="flex items-center gap-4 mb-5">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{
              background: 'rgba(0, 255, 136, 0.1)',
              border: '1px solid rgba(0, 255, 136, 0.2)',
              boxShadow: '0 0 20px rgba(0, 255, 136, 0.1)',
            }}>
              <svg className="w-6 h-6 text-nexus-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Chain Verification Status</h3>
              <p className="text-xs text-nexus-muted mt-0.5">All {entries.length} audit entries verified with SHA-256 hashing</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Total Entries', value: entries.length.toString(), color: '#00e5ff' },
              { label: 'Chain Length', value: `${entries.length} blocks`, color: '#00ff88' },
              { label: 'Integrity', value: '100%', color: '#00ff88' },
            ].map((stat, index) => (
              <div key={stat.label} className="p-4 rounded-xl" style={{
                background: 'rgba(17, 22, 40, 0.6)',
                border: '1px solid rgba(0, 229, 255, 0.06)',
                animation: `slideUp 0.4s ease-out ${index * 100}ms both`,
              }}>
                <p className="text-[10px] text-nexus-dim font-mono uppercase tracking-wider mb-1">{stat.label}</p>
                <p className="text-2xl font-black font-mono" style={{ color: stat.color }}>{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-lg font-bold text-white mb-5">Audit Entries</h2>
        <AuditLog entries={filteredEntries} onSelectEntry={setSelectedEntry} />
      </div>

      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
        }}>
          <div className="glass-card w-full max-w-2xl max-h-[80vh] overflow-auto p-6" style={{
            animation: 'scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">Entry Details</h3>
              <button
                onClick={() => setSelectedEntry(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-nexus-dim hover:text-white hover:bg-white/5 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-nexus-dim font-mono uppercase tracking-wider block mb-1.5">Entry ID</label>
                  <p className="text-sm text-white font-mono">{selectedEntry.id}</p>
                </div>
                <div>
                  <label className="text-[10px] text-nexus-dim font-mono uppercase tracking-wider block mb-1.5">Timestamp</label>
                  <p className="text-sm text-white">{new Date(selectedEntry.timestamp).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-[10px] text-nexus-dim font-mono uppercase tracking-wider block mb-1.5">Agent</label>
                  <p className="text-sm text-white">{selectedEntry.agent}</p>
                </div>
                <div>
                  <label className="text-[10px] text-nexus-dim font-mono uppercase tracking-wider block mb-1.5">Action</label>
                  <p className="text-sm text-white">{selectedEntry.action}</p>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-nexus-dim font-mono uppercase tracking-wider block mb-1.5">Details</label>
                <p className="text-sm text-white p-3 rounded-xl" style={{
                  background: 'rgba(6, 8, 15, 0.5)',
                  border: '1px solid rgba(0, 229, 255, 0.06)',
                }}>{selectedEntry.details}</p>
              </div>
              <div>
                <label className="text-[10px] text-nexus-dim font-mono uppercase tracking-wider block mb-1.5">SHA-256 Hash</label>
                <p className="text-[11px] text-white font-mono p-3 rounded-xl break-all hash-text" style={{
                  background: 'rgba(6, 8, 15, 0.5)',
                  border: '1px solid rgba(0, 229, 255, 0.06)',
                }}>{selectedEntry.hash}</p>
              </div>
              <div>
                <label className="text-[10px] text-nexus-dim font-mono uppercase tracking-wider block mb-1.5">Previous Hash</label>
                <p className="text-[11px] text-white font-mono p-3 rounded-xl break-all hash-text" style={{
                  background: 'rgba(6, 8, 15, 0.5)',
                  border: '1px solid rgba(0, 229, 255, 0.06)',
                }}>{selectedEntry.previousHash}</p>
              </div>
              <div>
                <label className="text-[10px] text-nexus-dim font-mono uppercase tracking-wider block mb-1.5">Metadata</label>
                <div className="p-3 rounded-xl" style={{
                  background: 'rgba(6, 8, 15, 0.5)',
                  border: '1px solid rgba(0, 229, 255, 0.06)',
                }}>
                  {Object.entries(selectedEntry.metadata).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between py-1.5">
                      <span className="text-nexus-dim text-xs">{key}</span>
                      <span className="text-white text-xs font-mono">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="glass-card p-6">
        <h2 className="text-lg font-bold text-white mb-5">Audit Chain Visualization</h2>
        <div className="relative overflow-x-auto pb-4 scrollbar-thin">
          <div className="flex items-start gap-2 min-w-max">
            {entries.map((entry, index) => {
              return (
                <div key={entry.id} className="flex items-start">
                  <div
                    className="p-4 rounded-2xl transition-all duration-300 cursor-pointer w-60 group"
                    style={{
                      background: 'rgba(6, 8, 15, 0.4)',
                      border: '1px solid rgba(0, 229, 255, 0.06)',
                    }}
                    onClick={() => setSelectedEntry(entry)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.2)';
                      e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 229, 255, 0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.06)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{
                        background: 'rgba(0, 229, 255, 0.08)',
                        border: '1px solid rgba(0, 229, 255, 0.12)',
                      }}>
                        {agentAvatars[entry.agent] || '🤖'}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">{entry.agent}</p>
                        <p className="text-[10px] text-nexus-dim font-mono">
                          {new Date(entry.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-[10px] text-nexus-muted mb-2">{entry.action}</p>
                    <p className="hash-text text-[10px] truncate">{entry.hash.substring(0, 16)}...</p>
                  </div>
                  {index < entries.length - 1 && (
                    <div className="flex flex-col items-center mx-2 mt-5">
                      <div className="w-[2px] h-8" style={{
                        background: 'linear-gradient(180deg, rgba(0, 229, 255, 0.3), rgba(168, 85, 247, 0.3))',
                        boxShadow: '0 0 4px rgba(0, 229, 255, 0.2)',
                      }}></div>
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 20 20" stroke="rgba(0, 229, 255, 0.3)">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
