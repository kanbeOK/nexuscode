'use client';

export default function MemoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Memory System</h1>
        <p className="text-sm text-gray-400 mt-1">Persistent knowledge base across sessions</p>
      </div>

      <div className="glass-card rounded-xl p-6">
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🧠</div>
          <h3 className="text-lg font-semibold text-white mb-2">Neural Knowledge Network</h3>
          <p className="text-sm text-gray-400 max-w-md mx-auto">
            Agents share knowledge through a persistent memory system with BM25 search.
            Connect to backend to see real memory entries.
          </p>
          <div className="mt-6 p-4 rounded-lg bg-white/5 border border-white/10">
            <code className="text-xs text-cyan-400 font-mono">
              POST /api/memory/store - Store knowledge<br/>
              GET /api/memory/search - Search knowledge
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
