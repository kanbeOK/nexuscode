'use client';

import { useEffect, useState, useRef } from 'react';
import { MemoryEntry } from '@/lib/types';
import { fetchMemoryEntries } from '@/lib/api';

const typeConfig: Record<string, { color: string; icon: string }> = {
  context: { color: '#00e5ff', icon: '📄' },
  decision: { color: '#a855f7', icon: '⚡' },
  error: { color: '#ff3d71', icon: '🐛' },
  learning: { color: '#00ff88', icon: '📚' },
  preference: { color: '#ff9100', icon: '⭐' },
};

function NeuralGraph({ entries }: { entries: MemoryEntry[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  interface GraphNode {
    x: number; y: number; vx: number; vy: number;
    type: string; size: number; connections: number[];
  }
  const nodesRef = useRef<GraphNode[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
      ctx.scale(2, 2);
    };
    resize();

    const types = Array.from(new Set(entries.map(e => e.type)));
    const nodes: GraphNode[] = types.map((type, i) => {
      const angle = (i / types.length) * Math.PI * 2;
      const radius = Math.min(canvas.offsetWidth, canvas.offsetHeight) * 0.3;
      return {
        x: canvas.offsetWidth / 2 + Math.cos(angle) * radius,
        y: canvas.offsetHeight / 2 + Math.sin(angle) * radius,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        type,
        size: 6 + entries.filter(e => e.type === type).length * 0.5,
        connections: [] as number[],
      };
    });

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (Math.random() > 0.4) {
          nodes[i].connections.push(j);
          nodes[j].connections.push(i);
        }
      }
    }

    nodesRef.current = nodes;

    let time = 0;
    const draw = () => {
      time += 0.005;
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;

      nodes.forEach((node) => {
        node.x += node.vx + Math.sin(time + node.x * 0.01) * 0.1;
        node.y += node.vy + Math.cos(time + node.y * 0.01) * 0.1;

        if (node.x < 30 || node.x > w - 30) node.vx *= -1;
        if (node.y < 30 || node.y > h - 30) node.vy *= -1;
        node.x = Math.max(30, Math.min(w - 30, node.x));
        node.y = Math.max(30, Math.min(h - 30, node.y));
      });

      nodes.forEach((node) => {
        node.connections.forEach((ci) => {
          const other = nodes[ci];
          const gradient = ctx.createLinearGradient(node.x, node.y, other.x, other.y);
          const color = typeConfig[node.type]?.color || '#00e5ff';
          const otherColor = typeConfig[other.type]?.color || '#00e5ff';
          gradient.addColorStop(0, `${color}20`);
          gradient.addColorStop(0.5, `${color}10`);
          gradient.addColorStop(1, `${otherColor}20`);

          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(other.x, other.y);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 1;
          ctx.stroke();

          const px = node.x + (other.x - node.x) * ((Math.sin(time * 2 + node.x) + 1) / 2);
          const py = node.y + (other.y - node.y) * ((Math.sin(time * 2 + node.x) + 1) / 2);
          ctx.beginPath();
          ctx.arc(px, py, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `${color}60`;
          ctx.fill();
        });
      });

      nodes.forEach((node) => {
        const color = typeConfig[node.type]?.color || '#00e5ff';
        const glow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.size * 3);
        glow.addColorStop(0, `${color}15`);
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.fillRect(node.x - node.size * 3, node.y - node.size * 3, node.size * 6, node.size * 6);

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fillStyle = `${color}40`;
        ctx.fill();
        ctx.strokeStyle = `${color}80`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        ctx.fillStyle = '#e2e8f0';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(node.type, node.x, node.y + node.size + 14);
      });

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [entries]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-64 rounded-xl"
      style={{ background: 'rgba(6, 8, 15, 0.3)' }}
    />
  );
}

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
      fetchMemoryEntries(searchQuery).then((data) => setEntries(data));
    } else {
      fetchMemoryEntries().then((data) => setEntries(data));
    }
  }, [searchQuery]);

  const uniqueTypes = Array.from(new Set(entries.map((e) => e.type)));
  const filteredEntries = selectedType === 'all' ? entries : entries.filter((e) => e.type === selectedType);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-2 border-nexus-cyan/10 rounded-full"></div>
            <div className="absolute inset-0 border-2 border-nexus-cyan/40 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-nexus-dim text-xs font-mono">LOADING MEMORY NEURAL NETWORK...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8" style={{ animation: 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">
            <span className="neon-text">Memory</span>
            <span className="text-white ml-2">Search</span>
          </h1>
          <p className="text-sm text-nexus-muted mt-1 font-mono">COLLECTIVE KNOWLEDGE BASE OF ALL AGENTS</p>
        </div>
        <div className="px-4 py-2 rounded-xl font-mono text-xs" style={{
          background: 'rgba(0, 229, 255, 0.05)',
          border: '1px solid rgba(0, 229, 255, 0.1)',
        }}>
          <span className="text-nexus-dim">{entries.length} ENTRIES</span>
        </div>
      </div>

      <div className="glass-card p-5">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-nexus-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search memory entries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-cyber pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['all', ...uniqueTypes] as const).map((type) => {
              const isActive = selectedType === type;
              const config = typeConfig[type];
              return (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className="px-3 py-2 rounded-xl text-xs font-medium transition-all duration-300"
                  style={isActive ? {
                    background: type === 'all' ? 'rgba(0, 229, 255, 0.1)' : `${config?.color}12`,
                    border: `1px solid ${type === 'all' ? 'rgba(0, 229, 255, 0.2)' : `${config?.color}25`}`,
                    color: type === 'all' ? '#00e5ff' : config?.color,
                  } : {
                    background: 'rgba(17, 22, 40, 0.4)',
                    border: '1px solid rgba(26, 35, 64, 0.4)',
                    color: '#7a8baa',
                  }}
                >
                  {type === 'all' ? 'All' : (
                    <span className="flex items-center gap-1.5">
                      <span>{config?.icon}</span>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          {filteredEntries.map((entry, index) => {
            const config = typeConfig[entry.type] || { color: '#7a8baa', icon: '📄' };
            return (
              <div
                key={entry.id}
                className={`glass-card p-4 cursor-pointer transition-all duration-300 ${
                  selectedEntry?.id === entry.id ? 'animate-glow' : ''
                }`}
                style={{
                  animation: `slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${index * 40}ms both`,
                  borderColor: selectedEntry?.id === entry.id ? `${config.color}30` : undefined,
                  boxShadow: selectedEntry?.id === entry.id ? `0 0 20px ${config.color}15` : undefined,
                }}
                onClick={() => setSelectedEntry(entry)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{config.icon}</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase" style={{
                      background: `${config.color}12`,
                      color: config.color,
                      border: `1px solid ${config.color}20`,
                    }}>
                      {entry.type}
                    </span>
                  </div>
                  <span className="text-[10px] text-nexus-dim font-mono">
                    {new Date(entry.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-nexus-text/80 mb-3 line-clamp-3 leading-relaxed">{entry.content}</p>
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {entry.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded-md text-[10px] font-mono" style={{
                        background: 'rgba(0, 229, 255, 0.04)',
                        color: 'rgba(0, 229, 255, 0.5)',
                        border: '1px solid rgba(0, 229, 255, 0.08)',
                      }}>#{tag}</span>
                    ))}
                  </div>
                  <span className="text-[10px] text-nexus-dim">by {entry.agent}</span>
                </div>
                {entry.relevance && (
                  <div className="mt-2.5 flex items-center gap-2">
                    <span className="text-[10px] text-nexus-dim">Relevance:</span>
                    <div className="flex-1 h-1 bg-nexus-bg/80 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{
                        width: `${entry.relevance * 100}%`,
                        background: `linear-gradient(90deg, ${config.color}60, ${config.color})`,
                        boxShadow: `0 0 6px ${config.color}40`,
                      }}></div>
                    </div>
                    <span className="text-[10px] font-mono" style={{ color: config.color }}>
                      {Math.round(entry.relevance * 100)}%
                    </span>
                  </div>
                )}
              </div>
            );
          })}
          {filteredEntries.length === 0 && (
            <div className="text-center py-16 glass-card">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-nexus-muted text-sm">No memory entries found</p>
              <p className="text-[10px] text-nexus-dim font-mono mt-2">TRY ADJUSTING YOUR SEARCH</p>
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          {selectedEntry ? (
            <div className="glass-card p-5" style={{ animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white">Entry Details</h3>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-nexus-dim hover:text-white hover:bg-white/5 transition-all"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{typeConfig[selectedEntry.type]?.icon}</span>
                  <div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase" style={{
                      background: `${typeConfig[selectedEntry.type]?.color}12`,
                      color: typeConfig[selectedEntry.type]?.color,
                    }}>{selectedEntry.type}</span>
                    <p className="text-[10px] text-nexus-dim font-mono mt-1">
                      {new Date(selectedEntry.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-nexus-dim font-mono uppercase tracking-wider block mb-1.5">Content</label>
                  <p className="text-xs text-white p-3 rounded-xl leading-relaxed" style={{
                    background: 'rgba(6, 8, 15, 0.5)',
                    border: '1px solid rgba(0, 229, 255, 0.06)',
                  }}>{selectedEntry.content}</p>
                </div>
                <div>
                  <label className="text-[10px] text-nexus-dim font-mono uppercase tracking-wider block mb-1.5">Agent</label>
                  <p className="text-sm text-white">{selectedEntry.agent}</p>
                </div>
                <div>
                  <label className="text-[10px] text-nexus-dim font-mono uppercase tracking-wider block mb-1.5">Tags</label>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedEntry.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded-md text-[10px] font-mono" style={{
                        background: 'rgba(0, 229, 255, 0.05)',
                        color: 'rgba(0, 229, 255, 0.6)',
                        border: '1px solid rgba(0, 229, 255, 0.08)',
                      }}>#{tag}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-nexus-dim font-mono uppercase tracking-wider block mb-1.5">Entry ID</label>
                  <p className="text-[11px] text-white font-mono p-2 rounded-lg hash-text" style={{
                    background: 'rgba(6, 8, 15, 0.5)',
                    border: '1px solid rgba(0, 229, 255, 0.06)',
                  }}>{selectedEntry.id}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card text-center py-12">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-nexus-muted text-xs">Select a memory entry to view details</p>
            </div>
          )}
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-lg font-bold text-white mb-5">Neural Knowledge Graph</h2>
        <NeuralGraph entries={entries} />
      </div>

      <div className="glass-card p-6">
        <h2 className="text-lg font-bold text-white mb-5">Knowledge Distribution</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {uniqueTypes.map((type) => {
            const config = typeConfig[type] || { color: '#7a8baa', icon: '📄' };
            const count = entries.filter((e) => e.type === type).length;
            return (
              <div
                key={type}
                className="p-4 rounded-2xl text-center transition-all duration-300 group"
                style={{
                  background: `${config.color}05`,
                  border: `1px solid ${config.color}10`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${config.color}30`;
                  e.currentTarget.style.boxShadow = `0 0 20px ${config.color}15`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = `${config.color}10`;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div className="text-2xl mb-2">{config.icon}</div>
                <p className="text-2xl font-black font-mono" style={{ color: config.color }}>{count}</p>
                <p className="text-[10px] text-nexus-dim uppercase tracking-wider mt-1">{type}s</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-lg font-bold text-white mb-4">Popular Tags</h2>
        <div className="flex flex-wrap gap-2">
          {getPopularTags(entries).map(({ tag, count }) => (
            <button
              key={tag}
              onClick={() => setSearchQuery(tag)}
              className="px-3 py-1.5 rounded-xl text-xs font-mono transition-all duration-300"
              style={{
                background: 'rgba(0, 229, 255, 0.04)',
                border: '1px solid rgba(0, 229, 255, 0.08)',
                color: 'rgba(0, 229, 255, 0.6)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.2)';
                e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 229, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.08)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              #{tag}
              <span className="ml-1 opacity-50">({count})</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function getPopularTags(entries: MemoryEntry[]): { tag: string; count: number }[] {
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
