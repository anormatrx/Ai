import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Activity, Cpu, HardDrive, Network, AlertTriangle, CheckCircle } from "lucide-react";

const Gauge = ({ value, label, color, labelAr }: any) => {
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg className="transform -rotate-90 w-24 h-24">
          <circle cx="48" cy="48" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-white/10" />
          <circle 
            cx="48" cy="48" r={radius} stroke={color} strokeWidth="6" fill="transparent" 
            strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-lg font-bold text-white">{value}%</span>
        </div>
      </div>
      <span className="text-xs font-bold text-white mt-2">{label}</span>
      <span dir="rtl" className="font-arabic text-[10px] text-white/50">{labelAr}</span>
    </div>
  );
};

export default function Diagnostics() {
  const [metrics, setMetrics] = useState({ cpu: 12, ram: 45, net: 8, disk: 60 });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics({
        cpu: Math.floor(Math.random() * 30) + 10,
        ram: Math.floor(Math.random() * 10) + 40,
        net: Math.floor(Math.random() * 20) + 5,
        disk: 60
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-full flex-col bg-[#050a0f] text-white p-4 font-sans overflow-hidden relative" dir="ltr">
      <div className="absolute inset-0 pointer-events-none opacity-20" 
           style={{ backgroundImage: `radial-gradient(circle at 100% 0%, rgba(34, 197, 94, 0.1) 0%, transparent 50%)` }} />

      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-[#05140a] border border-green-500/30 rounded-lg flex items-center justify-center shadow-[0_0_10px_rgba(34,197,94,0.2)]">
            <Activity className="h-4 w-4 text-green-400" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-white tracking-wide">System Diagnostics</h1>
            <span dir="rtl" className="font-arabic text-[10px] text-green-400/80">تشخيصات ومراقبة النظام</span>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 px-2.5 py-1 rounded-full">
          <CheckCircle className="h-3.5 w-3.5 text-green-400" />
          <span className="text-[10px] text-green-400 font-bold uppercase">All Nominal</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0 relative z-10">
        
        {/* Top: Gauges */}
        <GlassCard className="col-span-12 p-4 bg-[#0a1118]/90 border-green-500/20 flex justify-around items-center" glowColor="rgba(34, 197, 94, 0.05)">
          <Gauge value={metrics.cpu} label="CPU USAGE" labelAr="المعالج" color="#4ade80" />
          <Gauge value={metrics.ram} label="MEMORY" labelAr="الذاكرة" color="#2dd4bf" />
          <Gauge value={metrics.net} label="NETWORK" labelAr="الشبكة" color="#38bdf8" />
          <Gauge value={metrics.disk} label="STORAGE" labelAr="التخزين" color="#a78bfa" />
        </GlassCard>

        {/* Bottom Left: Process List */}
        <GlassCard className="col-span-12 lg:col-span-8 flex flex-col bg-[#0a1118]/90 border-cyan-500/20 overflow-hidden">
          <div className="p-3 border-b border-cyan-500/20 bg-[#0f172a]/80 flex items-center justify-between">
            <h3 className="text-xs font-bold text-cyan-100">Active Processes</h3>
            <span dir="rtl" className="font-arabic text-[10px] text-cyan-400/60">العمليات النشطة</span>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 text-white/50 sticky top-0">
                <tr>
                  <th className="p-3 font-medium">PID</th>
                  <th className="p-3 font-medium">Process Name</th>
                  <th className="p-3 font-medium">CPU %</th>
                  <th className="p-3 font-medium">MEM (MB)</th>
                  <th className="p-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  { pid: 1024, name: 'nexus-core-daemon', cpu: 4.2, mem: 256, status: 'Running' },
                  { pid: 2048, name: 'vector-db-engine', cpu: 1.1, mem: 1024, status: 'Running' },
                  { pid: 3072, name: 'web-ui-server', cpu: 0.5, mem: 128, status: 'Running' },
                  { pid: 4096, name: 'background-worker', cpu: 0.1, mem: 64, status: 'Sleeping' },
                  { pid: 5120, name: 'telemetry-agent', cpu: 0.0, mem: 32, status: 'Running' },
                ].map((proc, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="p-3 text-white/50 font-mono">{proc.pid}</td>
                    <td className="p-3 text-cyan-300">{proc.name}</td>
                    <td className="p-3 text-white">{proc.cpu}</td>
                    <td className="p-3 text-white">{proc.mem}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${proc.status === 'Running' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                        {proc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* Bottom Right: Alerts */}
        <GlassCard className="col-span-12 lg:col-span-4 flex flex-col bg-[#0a1118]/90 border-yellow-500/20 overflow-hidden">
          <div className="p-3 border-b border-yellow-500/20 bg-[#17150f]/80 flex items-center justify-between">
            <h3 className="text-xs font-bold text-yellow-100 flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> System Alerts</h3>
            <span dir="rtl" className="font-arabic text-[10px] text-yellow-400/60">تنبيهات النظام</span>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2.5">
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-2.5">
              <h4 className="text-[11px] font-bold text-yellow-400 mb-0.5">High Memory Usage Detected</h4>
              <p className="text-[9px] text-white/70">Vector DB engine is consuming more memory than usual. Consider scaling.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-2.5">
              <h4 className="text-[11px] font-bold text-white/70 mb-0.5">Update Available</h4>
              <p className="text-[9px] text-white/50">Nexus Core v1.0.5 is ready to install.</p>
            </div>
          </div>
        </GlassCard>

      </div>
    </div>
  );
}
