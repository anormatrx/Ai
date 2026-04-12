import React, { useState, useEffect } from "react";
import { MODULES } from "@/constants";
import { GlassCard } from "@/components/ui/GlassCard";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import ThreeScene from "@/components/ThreeScene";
import { useAudioFeedback } from "@/hooks/useAudioFeedback";
import { Activity, ShieldCheck, Zap, AlertTriangle, Play, RefreshCw } from "lucide-react";

interface DashboardProps {
  setActiveModule: (id: string) => void;
}

export default function Dashboard({ setActiveModule }: DashboardProps) {
  const { playSound } = useAudioFeedback();
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchProgress, setLaunchProgress] = useState(0);
  const [launchStep, setLaunchStep] = useState("");

  const fetchDiagnostics = async () => {
    try {
      const response = await fetch("/api/diagnostics");
      const data = await response.json();
      setSystemStatus(data);
    } catch (error) {
      console.error("Failed to fetch diagnostics:", error);
    }
  };

  useEffect(() => {
    fetchDiagnostics();
    const interval = setInterval(fetchDiagnostics, 5000);
    return () => clearInterval(interval);
  }, []);

  const startLaunchSequence = async () => {
    setIsLaunching(true);
    setLaunchProgress(0);
    playSound("click");

    const steps = [
      "Initializing Core Orchestrator...",
      "Loading AI Models (Gemma 3)...",
      "Securing Sandbox Environment...",
      "Connecting Terminal & File System...",
      "Syncing GitHub Repository...",
      "Verifying Web Automation Engine...",
      "System Ready | AI 3D NEXUS ACTIVE"
    ];

    for (let i = 0; i < steps.length; i++) {
      setLaunchStep(steps[i]);
      setLaunchProgress(((i + 1) / steps.length) * 100);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    setTimeout(() => {
      setIsLaunching(false);
      playSound("success");
    }, 1000);
  };

  return (
    <div className="grid h-full grid-cols-12 gap-4 overflow-y-auto no-scrollbar pb-6">
      {/* Left Column: Module Grid */}
      <div className="col-span-12 lg:col-span-4 grid grid-cols-2 gap-4">
        {MODULES.map((module, index) => {
          const Icon = module.icon;
          return (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
            >
              <GlassCard
                onClick={() => {
                  setActiveModule(module.id);
                  playSound("click");
                }}
                onMouseEnter={() => playSound("hover")}
                className="group flex h-32 cursor-pointer flex-col items-center justify-center gap-2 p-4 text-center transition-all hover:border-cyan-500/50"
                glowColor="rgba(0, 255, 255, 0.05)"
              >
                <div className="relative">
                  <div className="absolute inset-0 blur-lg bg-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Icon className="relative h-8 w-8 text-cyan-400 transition-transform group-hover:scale-110" />
                </div>
                <span className="text-[10px] font-bold tracking-widest text-white/60 group-hover:text-cyan-400">
                  {module.name.toUpperCase()}
                </span>
                <div className="h-0.5 w-0 bg-cyan-400 transition-all group-hover:w-8" />
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {/* Center/Right Column: Master Dashboard */}
      <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
        <GlassCard className="flex-1 relative overflow-hidden p-5" glowColor="rgba(139, 92, 246, 0.1)">
          <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
          </div>

          <div className="relative z-10 flex flex-col h-full">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold tracking-tighter text-white neon-glow">المركز الـ 16: لوحة التحكم الرئيسية</h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className={cn("h-2 w-2 rounded-full animate-pulse", systemStatus?.status === "Healthy" ? "bg-green-500" : "bg-yellow-500")} />
                  <p className="text-white/40 font-mono text-xs uppercase tracking-widest">
                    حالة النظام: <span className={systemStatus?.status === "Healthy" ? "text-green-400" : "text-yellow-400"}>
                      {systemStatus?.status || "جاري الفحص..."}
                    </span>
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="text-left">
                  <p className="text-[10px] font-mono text-white/40 uppercase tracking-tighter">Uptime</p>
                  <p className="text-cyan-400 font-bold">{systemStatus ? Math.floor(systemStatus.uptime / 60) + "m" : "--"}</p>
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-mono text-white/40 uppercase tracking-tighter">Memory</p>
                  <p className="text-cyan-400 font-bold">{systemStatus ? Math.round(systemStatus.memory.rss / 1024 / 1024) + "MB" : "--"}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center relative">
              <div className="w-full h-full max-h-[400px]">
                <ThreeScene />
              </div>
              
              {/* Floating Status Indicators */}
              <AnimatePresence>
                {systemStatus && (
                  <>
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="absolute top-1/4 left-0 bg-white/5 backdrop-blur-md border border-white/10 p-3 rounded-xl"
                    >
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-green-400" />
                        <div>
                          <p className="text-[8px] font-mono text-white/40 uppercase">Sandbox</p>
                          <p className="text-[10px] font-bold text-white">SECURE</p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="absolute top-1/3 right-0 bg-white/5 backdrop-blur-md border border-white/10 p-3 rounded-xl"
                    >
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-yellow-400" />
                        <div>
                          <p className="text-[8px] font-mono text-white/40 uppercase">AI Core</p>
                          <p className="text-[10px] font-bold text-white">GEMMA 3</p>
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-auto">
              {isLaunching ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <p className="text-xs font-mono text-cyan-400 animate-pulse">{launchStep}</p>
                    <p className="text-xs font-mono text-white/40">{Math.round(launchProgress)}%</p>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${launchProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Button 
                    onClick={startLaunchSequence}
                    className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black font-bold h-11 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.3)] text-sm"
                  >
                    <Play className="mr-2 h-4 w-4" /> تشغيل منصة الانطلاق | LAUNCH SYSTEM
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={fetchDiagnostics}
                    className="w-11 h-11 rounded-xl border-white/10 hover:bg-white/5"
                  >
                    <RefreshCw className="h-4 w-4 text-white/40" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function Button({ children, className, variant, onClick, size }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center transition-all active:scale-95 disabled:opacity-50",
        variant === "outline" ? "border bg-transparent" : "bg-primary text-primary-foreground",
        className
      )}
    >
      {children}
    </button>
  );
}
