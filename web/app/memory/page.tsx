'use client';

import { useEffect, useState } from 'react';
import { MemoryEntry } from '@/lib/types';
import { fetchMemoryEntries } from '@/lib/api';

export default function MemoryPage() {
  const [entries, setEntries] = useState<MemoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedEntry, setSelectedEntry] = useState<MemoryEntry | null>(null);

  useEffect(() => {
    fetchMemoryEntries().then((data) => {
      setEntries(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (searchQuery) {
      fetchMemoryEntries(searchQuery).then((data) => {
        setEntries(data);
      });
    } else {
      fetchMemoryEntries().then((data) => {
        setEntries(data);
      });
    }
  }, [searchQuery]);

  const uniqueTypes = Array.from(new Set(entries.map((e) => e.type)));

  const filteredEntries =
    selectedType === 'all'
      ? entries
      : entries.filter((e) => e.type === selectedType);

  const typeColors: Record<string, string> = {
    context: 'badge-blue',
    decision: 'badge-purple',
    error: 'badge-red',
    learning: 'badge-green',
    preference: 'badge-orange',
  };

  const typeIcons: Record<string, string> = {
    context: '📄',
    decision: '⚡',
    error: '🐛',
    learning: '📚',
    preference: '⭐',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-nexus-accent border-t-transparent rounded-full animate-spin"></div>
          <p className="text-nexus-muted">Loading memory entries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Memory Search</h1>
          <p className="text-nexus-muted mt-1">
            Search and explore the collective knowledge base of all agents
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-lg bg-nexus-card border border-nexus-border">
            <span className="text-nexus-muted text-sm">
              {entries.length} entries
            </span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-nexus-dim"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search memory entries by content, tags, or agent..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {(['all', ...uniqueTypes] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedType === type
                    ? 'bg-nexus-accent text-white'
                    : 'bg-nexus-card border border-nexus-border text-nexus-muted hover:text-white hover:border-nexus-accent/50'
                }`}
              >
                {type === 'all' ? 'All' : (
                  <span className="flex items-center gap-1.5">
                    <span>{typeIcons[type]}</span>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {filteredEntries.map((entry, index) => (
            <div
              key={entry.id}
              className={`card cursor-pointer transition-all duration-200 ${
                selectedEntry?.id === entry.id
                  ? 'border-nexus-accent glow-border'
                  : ''
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => setSelectedEntry(entry)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{typeIcons[entry.type]}</span>
                  <div>
                    <span className={`badge ${typeColors[entry.type]}`}>
                      {entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-nexus-muted">
                  {new Date(entry.timestamp).toLocaleDateString()}
                </span>
              </div>
              <p className="text-nexus-text text-sm mb-3 line-clamp-3">
                {entry.content}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1.5">
                  {entry.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md bg-nexus-bg text-xs text-nexus-muted"
                    >
                      #{tag}
                    </span>
                  ))}
                  {entry.tags.length > 3 && (
                    <span className="px-2 py-0.5 rounded-md bg-nexus-bg text-xs text-nexus-dim">
                      +{entry.tags.length - 3}
                    </span>
                  )}
                </div>
                <span className="text-xs text-nexus-muted">
                  by {entry.agent}
                </span>
              </div>
              {entry.relevance && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-nexus-muted">Relevance:</span>
                  <div className="flex-1 h-1.5 bg-nexus-bg rounded-full overflow-hidden">
                    <div
                      className="h-full bg-nexus-green rounded-full"
                      style={{ width: `${entry.relevance * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-nexus-green">
                    {Math.round(entry.relevance * 100)}%
                  </span>
                </div>
              )}
            </div>
          ))}

          {filteredEntries.length === 0 && (
            <div className="text-center py-12 card">
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-nexus-muted">No memory entries found</p>
              <p className="text-sm text-nexus-dim mt-2">
                Try adjusting your search query or filters
              </p>
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          {selectedEntry ? (
            <div className="card animate-slide-up">
              <div className="flex items-center justify-between mb-4">
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
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{typeIcons[selectedEntry.type]}</span>
                  <div>
                    <span className={`badge ${typeColors[selectedEntry.type]}`}>
                      {selectedEntry.type.charAt(0).toUpperCase() + selectedEntry.type.slice(1)}
                    </span>
                    <p className="text-sm text-nexus-muted mt-1">
                      {new Date(selectedEntry.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-nexus-muted block mb-2">Content</label>
                  <p className="text-white bg-nexus-bg p-4 rounded-lg text-sm leading-relaxed">
                    {selectedEntry.content}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-nexus-muted block mb-2">Agent</label>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {getAgentAvatar(selectedEntry.agent)}
                    </span>
                    <span className="text-white">{selectedEntry.agent}</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-nexus-muted block mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedEntry.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-lg bg-nexus-bg text-sm text-nexus-muted"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-nexus-muted block mb-2">Entry ID</label>
                  <p className="text-white font-mono text-xs bg-nexus-bg p-2 rounded-lg">
                    {selectedEntry.id}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="card text-center py-12">
              <div className="text-4xl mb-4">📋</div>
              <p className="text-nexus-muted">
                Select a memory entry to view details
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-6">Knowledge Graph Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {uniqueTypes.map((type) => {
            const count = entries.filter((e) => e.type === type).length;
            return (
              <div
                key={type}
                className="p-4 rounded-xl bg-nexus-bg border border-nexus-border hover:border-nexus-accent/30 transition-colors"
              >
                <div className="text-2xl mb-2">{typeIcons[type]}</div>
                <p className="text-2xl font-bold text-white">{count}</p>
                <p className="text-sm text-nexus-muted capitalize">{type}s</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-4">Popular Tags</h2>
        <div className="flex flex-wrap gap-2">
          {getPopularTags(entries).map(({ tag, count }) => (
            <button
              key={tag}
              onClick={() => setSearchQuery(tag)}
              className="px-3 py-1.5 rounded-lg bg-nexus-bg border border-nexus-border hover:border-nexus-accent/50 transition-colors text-sm text-nexus-muted hover:text-white"
            >
              #{tag}
              <span className="ml-1 text-nexus-dim">({count})</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function getPopularTags(
  entries: MemoryEntry[]
): { tag: string; count: number }[] {
  const tagCounts: Record<string, number> = {};
  entries.forEach((entry) => {
    entry.tags.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  return Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);
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
