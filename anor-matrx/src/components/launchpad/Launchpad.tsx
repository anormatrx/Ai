import React, { useState, useEffect, useRef } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Rocket, Server, Box, Download, Terminal, CheckCircle2, CircleDashed, Globe } from "lucide-react";

export default function Launchpad() {
  const [isDeploying, setIsDeploying] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleDeploy = () => {
    setIsDeploying(true);
    setLogs(["[SYSTEM] Initiating deployment sequence..."]);
    
    const steps = [
      "Compiling assets...",
      "Building Docker image (nexus-core:latest)...",
      "Pushing to container registry...",
      "Provisioning cloud resources...",
      "Deploying to production cluster...",
      "Running health checks...",
      "Deployment successful. System is live."
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        setLogs(prev => [...prev, `[${new Date().toISOString().split('T')[1].split('.')[0]}] ${step}`]);
        if (index === steps.length - 1) setIsDeploying(false);
      }, (index + 1) * 1200);
    });
  };

  return (
    <div className="flex h-full flex-col bg-[#050a0f] text-white p-6 font-sans overflow-hidden relative" dir="ltr">
      <div className="absolute inset-0 pointer-events-none opacity-20" 
           style={{ backgroundImage: `radial-gradient(circle at 50% 50%, rgba(239, 68, 68, 0.1) 0%, transparent 70%)` }} />

      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-[#1a0f14] border border-red-500/30 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <Rocket className="h-5 w-5 text-red-400" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-white tracking-wide">Deployment Launchpad</h1>
            <span dir="rtl" className="font-arabic text-xs text-red-400/80">منصة الإطلاق والنشر</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0 relative z-10">
        
        {/* Left: Deployment Options */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-4">
          <GlassCard className="p-6 bg-[#110808]/90 border-red-500/20 flex flex-col items-center text-center" glowColor="rgba(239, 68, 68, 0.05)">
            <div className="w-24 h-24 rounded-full border-4 border-red-500/30 flex items-center justify-center mb-6 relative">
              {isDeploying && <div className="absolute inset-0 rounded-full border-4 border-red-500 border-t-transparent animate-spin"></div>}
              <Globe className={`h-10 w-10 ${isDeploying ? 'text-red-400 animate-pulse' : 'text-white/50'}`} />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Production Environment</h2>
            <p className="text-xs text-white/50 mb-6">Deploy the current build to the live global edge network.</p>
            
            <button 
              onClick={handleDeploy}
              disabled={isDeploying}
              className="w-full py-3 bg-red-600 hover:bg-red-500 disabled:bg-red-900/50 rounded-lg text-white font-bold tracking-widest transition-colors shadow-[0_0_20px_rgba(239,68,68,0.4)] flex items-center justify-center gap-2"
            >
              {isDeploying ? <CircleDashed className="h-5 w-5 animate-spin" /> : <Rocket className="h-5 w-5" />}
              {isDeploying ? 'DEPLOYING...' : 'INITIATE LAUNCH'}
            </button>
          </GlassCard>

          <div className="grid grid-cols-2 gap-4">
            <GlassCard className="p-4 bg-[#0a1118]/90 border-cyan-500/20 cursor-pointer hover:bg-[#0f172a] transition-colors flex flex-col items-center text-center">
              <Box className="h-8 w-8 text-cyan-400 mb-2" />
              <span className="text-xs font-bold text-white">Build Docker Image</span>
              <span dir="rtl" className="font-arabic text-[10px] text-cyan-400/70 mt-1">بناء حاوية دوكر</span>
            </GlassCard>
            <GlassCard className="p-4 bg-[#0a1118]/90 border-purple-500/20 cursor-pointer hover:bg-[#0f172a] transition-colors flex flex-col items-center text-center">
              <Download className="h-8 w-8 text-purple-400 mb-2" />
              <span className="text-xs font-bold text-white">Export Source (ZIP)</span>
              <span dir="rtl" className="font-arabic text-[10px] text-purple-400/70 mt-1">تصدير المصدر</span>
            </GlassCard>
          </div>
        </div>

        {/* Right: Terminal Logs */}
        <GlassCard className="col-span-12 lg:col-span-7 flex flex-col bg-[#050a0f]/90 border-red-500/20 overflow-hidden" glowColor="rgba(239, 68, 68, 0.02)">
          <div className="p-3 border-b border-red-500/20 bg-[#0f0505]/80 flex items-center gap-2">
            <Terminal className="h-4 w-4 text-red-400" />
            <h3 className="text-xs font-bold text-red-100">Deployment Logs</h3>
            <span dir="rtl" className="font-arabic text-[10px] text-red-400/60 ml-auto">سجلات النشر</span>
          </div>
          <div className="flex-1 p-4 overflow-y-auto custom-scrollbar font-mono text-xs text-red-400/80 whitespace-pre-wrap">
            {logs.length === 0 ? (
              <span className="text-white/30">Waiting for deployment initiation...</span>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="mb-1 flex items-start gap-2">
                  <span className="text-white/30 shrink-0">{'>'}</span>
                  <span className={log.includes('successful') ? 'text-green-400 font-bold' : ''}>{log}</span>
                </div>
              ))
            )}
            <div ref={logEndRef} />
          </div>
        </GlassCard>

      </div>
    </div>
  );
}
