import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Database, Brain, Search, Network as NetworkIcon, Lock, Zap } from "lucide-react";

export default function MemoryVault() {
  const [searchQuery, setSearchQuery] = useState("");

  const memories = [
    { id: 1, text: "User prefers dark mode and cyan neon accents.", type: "preference", score: 0.98 },
    { id: 2, text: "Project architecture relies on React, Tailwind, and Vite.", type: "context", score: 0.95 },
    { id: 3, text: "API keys must be stored in .env and never exposed to the client.", type: "security", score: 0.99 },
    { id: 4, text: "The agent's persona is an 'Intelligence Engineer'.", type: "persona", score: 0.92 },
  ];

  return (
    <div className="flex h-full flex-col bg-[#050a0f] text-white p-6 font-sans overflow-hidden relative" dir="ltr">
      <div className="absolute inset-0 pointer-events-none opacity-20" 
           style={{ backgroundImage: `radial-gradient(circle at 50% 0%, rgba(168, 85, 247, 0.15) 0%, transparent 60%)` }} />

      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-[#130a1a] border border-purple-500/30 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            <Database className="h-5 w-5 text-purple-400" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-white tracking-wide">Memory Vault</h1>
            <span dir="rtl" className="font-arabic text-xs text-purple-400/80">خزنة الذاكرة (Vector DB)</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 px-3 py-1.5 rounded-full text-xs text-purple-300">
            <NetworkIcon className="h-4 w-4" />
            <span>1,245 Vectors</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0 relative z-10">
        
        {/* Left: Search & Query */}
        <GlassCard className="col-span-12 lg:col-span-4 flex flex-col bg-[#0a0514]/90 border-purple-500/20 overflow-hidden" glowColor="rgba(168, 85, 247, 0.05)">
          <div className="p-4 border-b border-purple-500/20 bg-[#130a1a]/80">
            <h3 className="text-sm font-bold text-purple-100 flex items-center gap-2">
              <Search className="h-4 w-4" /> Semantic Search
            </h3>
            <span dir="rtl" className="font-arabic text-[10px] text-purple-400/60 block mt-1">البحث الدلالي في الذاكرة</span>
          </div>
          <div className="p-4 flex flex-col gap-4">
            <textarea 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Query memory space..."
              className="w-full h-24 bg-[#050a0f] border border-purple-500/30 rounded-lg p-3 text-sm text-white outline-none focus:border-purple-400 resize-none custom-scrollbar"
            />
            <button className="w-full py-2 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/50 rounded-lg text-purple-300 text-sm font-bold transition-colors flex items-center justify-center gap-2">
              <Zap className="h-4 w-4" /> Query Vectors
            </button>
          </div>
          <div className="flex-1 p-4 border-t border-purple-500/20 bg-[#050a0f]/50">
            <h4 className="text-xs font-bold text-white/50 mb-3 uppercase tracking-wider">Cluster Stats</h4>
            <div className="space-y-2 text-xs text-white/70">
              <div className="flex justify-between"><span>Dimensions:</span> <span className="text-purple-400 font-mono">1536</span></div>
              <div className="flex justify-between"><span>Index Type:</span> <span className="text-purple-400 font-mono">HNSW</span></div>
              <div className="flex justify-between"><span>Distance Metric:</span> <span className="text-purple-400 font-mono">Cosine</span></div>
            </div>
          </div>
        </GlassCard>

        {/* Right: Embeddings List */}
        <GlassCard className="col-span-12 lg:col-span-8 flex flex-col bg-[#0a0514]/90 border-cyan-500/20 overflow-hidden" glowColor="rgba(0, 255, 255, 0.02)">
          <div className="p-4 border-b border-cyan-500/20 bg-[#0a1118]/80 flex items-center justify-between">
            <h3 className="text-sm font-bold text-cyan-100 flex items-center gap-2">
              <Brain className="h-4 w-4" /> Retrieved Context
            </h3>
            <span className="text-xs text-cyan-400/60 font-mono">Top-K: 4</span>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
            {memories.map((mem) => (
              <div key={mem.id} className="bg-[#0f172a]/50 border border-cyan-500/20 rounded-lg p-4 hover:border-cyan-500/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    mem.type === 'security' ? 'bg-red-500/20 text-red-400' :
                    mem.type === 'preference' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-cyan-500/20 text-cyan-400'
                  }`}>
                    {mem.type}
                  </span>
                  <span className="text-[10px] font-mono text-green-400 flex items-center gap-1">
                    Score: {mem.score}
                  </span>
                </div>
                <p className="text-sm text-white/90">{mem.text}</p>
                <div className="mt-3 text-[8px] text-white/30 font-mono break-all line-clamp-1">
                  [0.012, -0.045, 0.892, 0.111, -0.555, 0.234, 0.777, -0.999, 0.444, 0.666, ...]
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

      </div>
    </div>
  );
}
