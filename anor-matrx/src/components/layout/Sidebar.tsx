import React from "react";
import { MODULES } from "@/constants";
import { cn } from "@/lib/utils";
import { LayoutDashboard } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAudioFeedback } from "@/hooks/useAudioFeedback";

interface SidebarProps {
  activeModule: string;
  setActiveModule: (id: string) => void;
}

export default function Sidebar({ activeModule, setActiveModule }: SidebarProps) {
  const { playSound } = useAudioFeedback();

  return (
    <aside className="flex w-16 flex-col items-center border-r border-white/5 bg-white/2 py-4 backdrop-blur-sm">
      <div 
        className="mb-8 cursor-pointer transition-transform hover:scale-110"
        onClick={() => {
          setActiveModule("dashboard");
          playSound("open");
        }}
        onMouseEnter={() => playSound("hover")}
      >
        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-white/10 shadow-[0_0_10px_rgba(0,255,255,0.15)]">
          <LayoutDashboard className="h-5 w-5 text-cyan-400" />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto no-scrollbar">
        {MODULES.map((module) => {
          const Icon = module.icon;
          const isActive = activeModule === module.id;
          
          return (
            <Tooltip key={module.id}>
              <TooltipTrigger render={
                <button
                  onClick={() => {
                    setActiveModule(module.id);
                    playSound("click");
                  }}
                  onMouseEnter={() => playSound("hover")}
                  className={cn(
                    "group relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300",
                    isActive 
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_8px_rgba(0,255,255,0.15)]" 
                      : "text-white/40 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", isActive && "neon-glow")} />
                  {isActive && (
                    <div className="absolute -left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-cyan-400 shadow-[0_0_6px_rgba(0,255,255,0.8)]" />
                  )}
                </button>
              } />
              <TooltipContent side="right" className="bg-[#0a0c10] border-white/10 text-cyan-400">
                <p className="font-bold">{module.name}</p>
                <p className="text-[10px] text-white/60">{module.description}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>

      <div className="mt-auto pt-4 opacity-20 pointer-events-none">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl text-white/40">
           <div className="h-1 w-1 rounded-full bg-cyan-400 animate-pulse" />
        </div>
      </div>
    </aside>
  );
}
