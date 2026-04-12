import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Github, GitBranch, GitCommit, GitPullRequest, UploadCloud, RefreshCw, Check } from "lucide-react";

export default function GithubHub() {
  const [commitMsg, setCommitMsg] = useState("");
  const [isPushing, setIsPushing] = useState(false);

  const handlePush = () => {
    if (!commitMsg.trim()) return;
    setIsPushing(true);
    setTimeout(() => {
      setIsPushing(false);
      setCommitMsg("");
    }, 2000);
  };

  return (
    <div className="flex h-full flex-col bg-[#050a0f] text-white p-6 font-sans overflow-hidden relative" dir="ltr">
      <div className="absolute inset-0 pointer-events-none opacity-20" 
           style={{ backgroundImage: `radial-gradient(circle at 0% 100%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)` }} />

      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-[#161b22] border border-white/20 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            <Github className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-white tracking-wide">GitHub Hub</h1>
            <span dir="rtl" className="font-arabic text-xs text-white/60">مركز التحكم بالإصدارات</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#161b22] border border-white/10 px-3 py-1.5 rounded-md text-xs">
            <GitBranch className="h-4 w-4 text-cyan-400" />
            <span className="font-mono text-white/80">main</span>
          </div>
          <button className="p-2 bg-white/5 border border-white/10 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0 relative z-10">
        
        {/* Left: Staging & Commit */}
        <GlassCard className="col-span-12 lg:col-span-5 flex flex-col bg-[#0d1117]/90 border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-[#161b22]/80">
            <h3 className="text-sm font-bold text-white">Changes</h3>
            <p className="text-xs text-white/50 mt-1">3 files modified</p>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {['src/App.tsx', 'src/components/github/GithubHub.tsx', 'package.json'].map((file, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2 hover:bg-white/5 rounded-md text-xs">
                <span className="font-mono text-white/80">{file}</span>
                <span className="text-yellow-400 font-mono">M</span>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-white/10 bg-[#161b22]/50 flex flex-col gap-3">
            <input 
              type="text" 
              value={commitMsg}
              onChange={(e) => setCommitMsg(e.target.value)}
              placeholder="Commit message..."
              className="w-full bg-[#0d1117] border border-white/20 rounded-md px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
            />
            <button 
              onClick={handlePush}
              disabled={isPushing || !commitMsg.trim()}
              className="w-full py-2 bg-green-600 hover:bg-green-500 disabled:bg-green-900/50 rounded-md text-white text-sm font-bold transition-colors flex items-center justify-center gap-2"
            >
              {isPushing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
              {isPushing ? 'Pushing...' : 'Commit & Push'}
            </button>
          </div>
        </GlassCard>

        {/* Right: History & PRs */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-4">
          <GlassCard className="flex-1 flex flex-col bg-[#0d1117]/90 border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-[#161b22]/80 flex items-center gap-2">
              <GitCommit className="h-4 w-4 text-white/70" />
              <h3 className="text-sm font-bold text-white">Recent Commits</h3>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
              {[
                { hash: 'a1b2c3d', msg: 'Implement GithubHub component', time: '2 mins ago', author: 'user-ai-dev' },
                { hash: 'e4f5g6h', msg: 'Fix layout issues in App.tsx', time: '1 hour ago', author: 'user-ai-dev' },
                { hash: 'i7j8k9l', msg: 'Initial commit', time: '2 days ago', author: 'user-ai-dev' },
              ].map((commit, i) => (
                <div key={i} className="flex flex-col p-4 border-b border-white/5 hover:bg-white/5 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white font-medium">{commit.msg}</span>
                    <span className="text-xs text-white/40">{commit.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="h-4 w-4 rounded-full bg-cyan-500/20 flex items-center justify-center text-[8px] text-cyan-400">U</div>
                    <span className="text-white/60">{commit.author}</span>
                    <span className="text-white/30">•</span>
                    <span className="font-mono text-cyan-400/70">{commit.hash}</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

      </div>
    </div>
  );
}
