import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { MODULES } from "@/constants";
import Sidebar from "@/components/layout/Sidebar";
import Dashboard from "@/components/dashboard/Dashboard";
import ChatInterface from "@/components/chat/ChatInterface";
import ConfigCenter from "@/components/config/ConfigCenter";
import IsolatedLab from "@/components/lab/IsolatedLab";
import OpenClawCore from "@/components/openclaw/OpenClawCore";
import Forge from "@/components/forge/Forge";
import SkillBuilder from "@/components/skills/SkillBuilder";
import SkillLibrary from "@/components/skills/SkillLibrary";
import SystemAutomation from "@/components/automation/SystemAutomation";
import AdvancedTerminal from "@/components/terminal/AdvancedTerminal";
import FxSetup from "@/components/config/FxSetup";
import SystemConfig from "@/components/config/SystemConfig";
import AdvancedEditor from "@/components/editor/AdvancedEditor";
import FileExplorer from "@/components/explorer/FileExplorer";
import Launchpad from "@/components/launchpad/Launchpad";
import Diagnostics from "@/components/diagnostics/Diagnostics";
import GithubHub from "@/components/github/GithubHub";
import MemoryVault from "@/components/memory/MemoryVault";
import PythonIDE from "@/components/editor/PythonIDE";
import { GlassCard } from "@/components/ui/GlassCard";
import { Rocket, LogIn, User as UserIcon, Settings, Bell, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";

export default function App() {
  const [user] = useState({
    displayName: "المدير النظامي",
    photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=system",
    email: "operator@nexus.ai"
  });
  const [loading, setLoading] = useState(false);
  const [activeModule, setActiveModule] = useState("chat");
  const [sysStats, setSysStats] = useState({ cpu: 12, gpu: 8, ping: 4 });

  useEffect(() => {
    const statInterval = setInterval(() => {
      setSysStats({
        cpu: Math.floor(Math.random() * 15) + 5,
        gpu: Math.floor(Math.random() * 10) + 2,
        ping: Math.floor(Math.random() * 8) + 2,
      });
    }, 2500);
    return () => clearInterval(statInterval);
  }, []);

  // Auth gate removed by User request
  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#05070a]">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-4"
        >
          <Rocket className="h-12 w-12 text-cyan-400" />
          <p className="font-mono text-cyan-400/70">جاري تهيئة النواة...</p>
        </motion.div>
      </div>
    );
  }


  return (
    <TooltipProvider>
      <div className="flex h-screen w-screen bg-[#05070a] text-white overflow-hidden">
        {/* Sidebar */}
        <Sidebar activeModule={activeModule} setActiveModule={setActiveModule} />

        {/* Main Content */}
        <main className="relative flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="flex h-14 items-center justify-between border-b border-white/5 bg-white/2 px-4 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <h2 className="text-base font-bold tracking-tight text-cyan-400 neon-glow">
                {activeModule === "dashboard" ? "المركز الموحد" : MODULES.find(m => m.id === activeModule)?.name.toUpperCase() || activeModule.toUpperCase()}
              </h2>
              <div className={`flex items-center gap-2 rounded-full px-3 py-1 border transition-colors ${sysStats.cpu > 15 ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-cyan-500/10 border-cyan-500/20'}`}>
                <div className={`h-2 w-2 rounded-full animate-pulse ${sysStats.cpu > 15 ? 'bg-yellow-400' : 'bg-cyan-400'}`} />
                <span className={`text-[10px] font-mono ${sysStats.cpu > 15 ? 'text-yellow-400/80' : 'text-cyan-400/80'}`}>حالة النظام: {sysStats.cpu > 15 ? 'مستقرة' : 'مثالية'}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-4 text-[9px] font-mono text-white/30 transition-all">
                <span className={sysStats.cpu > 15 ? 'text-yellow-400/60' : ''}>CPU: {sysStats.cpu}%</span>
                <span>GPU: {sysStats.gpu}%</span>
                <span className={sysStats.ping > 6 ? 'text-yellow-400/60' : ''}>PING: {sysStats.ping}ms</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-white/60 hover:text-cyan-400">
                  <Bell className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-white/60 hover:text-cyan-400" onClick={() => setActiveModule("model-connect")}>
                  <Settings className="h-4 w-4" />
                </Button>
                <div className="h-7 w-7 rounded-full border border-cyan-500/30 p-0.5 ml-1">
                  <img src={user.photoURL || ""} alt={user.displayName || ""} className="h-full w-full rounded-full object-cover" />
                </div>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden p-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeModule}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                {activeModule === "dashboard" && <Dashboard setActiveModule={setActiveModule} />}
                {activeModule === "chat" && <ChatInterface />}
                {activeModule === "model-connect" && <ConfigCenter />}
                {activeModule === "lab" && <IsolatedLab />}
                {activeModule === "openclaw" && <OpenClawCore />}
                {activeModule === "forge" && <Forge />}
                {activeModule === "skill-builder" && <SkillBuilder />}
                {activeModule === "skills" && <SkillLibrary />}
                {activeModule === "system-automation" && <SystemAutomation />}
                {activeModule === "terminal" && <AdvancedTerminal />}
                {activeModule === "fx-setup" && <FxSetup />}
                {activeModule === "cloud-sync" && <SystemConfig />}
                {activeModule === "editor" && <AdvancedEditor />}
                {activeModule === "explorer" && <FileExplorer />}
                {activeModule === "launchpad" && <Launchpad />}
                {activeModule === "diagnostics" && <Diagnostics />}
                {activeModule === "github" && <GithubHub />}
                {activeModule === "memory" && <MemoryVault />}
                {activeModule === "python-ide" && <PythonIDE />}
                {/* Placeholder for other modules */}
                {!["dashboard", "chat", "model-connect", "lab", "openclaw", "forge", "skill-builder", "skills", "system-automation", "terminal", "fx-setup", "cloud-sync", "editor", "explorer", "launchpad", "diagnostics", "github", "memory", "python-ide"].includes(activeModule) && (
                  <div className="flex h-full items-center justify-center">
                    <GlassCard className="p-12 text-center max-w-lg">
                      <Cpu className="mx-auto mb-4 h-12 w-12 text-cyan-400 opacity-50" />
                      <h3 className="text-xl font-bold mb-2">جاري تهيئة الوحدة</h3>
                      <p className="text-white/40 mb-6">يتم حالياً معايرة وحدة {activeModule} لرابطك العصبي.</p>
                      <Button onClick={() => setActiveModule("dashboard")} variant="outline" className="border-cyan-500/30 text-cyan-400">
                        العودة للمركز
                      </Button>
                    </GlassCard>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
