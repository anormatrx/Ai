import React, { useState, useRef, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Terminal as TerminalIcon, History, Server, Settings, ChevronDown, Send, Activity, ChevronRight, Cpu } from "lucide-react";

export default function AdvancedTerminal() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<{ type: 'command' | 'output' | 'error' | 'info' | 'warn', text: string }[]>([
    { type: 'command', text: 'user@AI-Platform:~$ ./start_training.sh --model=GPT4-Turbo --batch_size=64' },
    { type: 'info', text: '[INFO] Initializing distributed training environment...' },
    { type: 'warn', text: '[WARN] Resource utilization spike detected on GPU 3.' },
    { type: 'output', text: 'Loading dataset... [Done]' },
    { type: 'output', text: 'Updating weights... Epoch 1/100, Loss: 0.4523' },
  ]);
  const [cwd, setCwd] = useState("~");
  const [isExecuting, setIsExecuting] = useState(false);
  const [shell, setShell] = useState("Linux (WSL)");
  const [isShellDropdownOpen, setIsShellDropdownOpen] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [output]);

  const handleCommand = async () => {
    if (!input.trim()) return;
    
    const cmd = input;
    setInput("");
    setOutput(prev => [...prev, { type: 'command', text: `user@AI-Platform:${cwd}$ ${cmd}` }]);
    setIsExecuting(true);

    try {
      const response = await fetch('/api/terminal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd, cwd: cwd === "~" ? "/app/applet" : cwd })
      });
      
      const data = await response.json();
      
      if (data.error) {
        setOutput(prev => [...prev, { type: 'error', text: data.error }]);
      } else {
        if (data.output) {
          setOutput(prev => [...prev, { type: 'output', text: data.output }]);
        }
        if (data.cwd) {
          setCwd(data.cwd === "/app/applet" ? "~" : data.cwd);
        }
      }
    } catch (error: any) {
      setOutput(prev => [...prev, { type: 'error', text: error.message }]);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-[#050a0f] text-white p-6 font-sans overflow-hidden relative" dir="ltr">
      {/* Background Grid */}
      <div className="absolute inset-0 pointer-events-none" 
           style={{
             backgroundImage: `linear-gradient(rgba(0, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.03) 1px, transparent 1px)`,
             backgroundSize: '40px 40px',
             transform: 'perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px)',
             transformOrigin: 'top center'
           }}
      />

      {/* Header */}
      <div className="flex items-center justify-center mb-6 relative z-10">
        <h1 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
          Advanced AI Multi-Shell Terminal <span className="text-cyan-400/50">/</span> <span dir="rtl" className="font-arabic text-cyan-100">محطة طرفية متعددة الصدف بالذكاء الاصطناعي المتقدم</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0 relative z-10">
        
        {/* Left Sidebar */}
        <GlassCard className="col-span-12 lg:col-span-2 flex flex-col bg-[#0a1118]/90 border-cyan-500/20 overflow-hidden" glowColor="rgba(0, 255, 255, 0.05)">
          <div className="flex flex-col h-full">
            <div className="flex flex-col gap-2 p-2 border-b border-cyan-500/20">
              <button className="p-2 rounded hover:bg-cyan-500/10 text-cyan-400/70 hover:text-cyan-400 transition-colors flex justify-center"><History className="h-5 w-5" /></button>
              <button className="p-2 rounded bg-cyan-500/20 text-cyan-400 border-r-2 border-cyan-400 flex justify-center"><TerminalIcon className="h-5 w-5" /></button>
              <button className="p-2 rounded hover:bg-cyan-500/10 text-cyan-400/70 hover:text-cyan-400 transition-colors flex justify-center"><Server className="h-5 w-5" /></button>
              <button className="p-2 rounded hover:bg-cyan-500/10 text-cyan-400/70 hover:text-cyan-400 transition-colors flex justify-center"><Settings className="h-5 w-5" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-6">
              <div>
                <h3 className="text-xs font-bold text-white mb-1 text-center">Command History / <span dir="rtl" className="font-arabic">سجل الأوامر</span></h3>
                <div className="space-y-2 mt-4 text-[10px] text-cyan-100/60 font-mono">
                  <p>10:45:12 - git status</p>
                  <p>10:45:12 - git status</p>
                  <p>10:45:12 - git status</p>
                  <p>10:45:30 - docker-compose up -d</p>
                  <p>10:45:30 - docker-compose up -d</p>
                  <p>10:45:30 - docker-compose -d</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-xs font-bold text-white mb-1 text-center">Session Management</h3>
                <h3 className="text-xs font-bold text-white mb-4 text-center" dir="rtl">إدارة الجلسات</h3>
                <div className="space-y-2 text-[10px] text-cyan-100/60 font-mono">
                  <p>10:45:30 - docker-compose up -d</p>
                  <p>10:45:30 - docker-compose -d</p>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-white mb-1 text-center">Remote SSH Connection</h3>
                <h3 className="text-xs font-bold text-white mb-4 text-center" dir="rtl">اتصال SSH عن بعد</h3>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Main Terminal */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-4">
          
          {/* Shell Selector */}
          <div className="flex justify-center relative z-20">
            <div className="bg-[#0f172a] border border-cyan-500/50 rounded-lg flex items-center px-4 py-2 cursor-pointer hover:bg-[#1a2235] transition-colors" onClick={() => setIsShellDropdownOpen(!isShellDropdownOpen)}>
              <TerminalIcon className="h-4 w-4 text-cyan-400 mr-2" />
              <span className="text-sm font-bold mr-2">Shell Selector</span>
              <div className="h-4 w-px bg-cyan-500/30 mx-2"></div>
              <span className="text-sm text-cyan-100 mr-2">{shell}</span>
              <span dir="rtl" className="font-arabic text-sm text-cyan-100 mr-2">/ لينكس</span>
              <ChevronDown className="h-4 w-4 text-cyan-400" />
            </div>
            
            {isShellDropdownOpen && (
              <div className="absolute top-full mt-2 w-64 bg-[#0f172a] border border-cyan-500/50 rounded-lg shadow-xl overflow-hidden z-30">
                {['PowerShell / باور شيل', 'CMD / سي ام دي', 'Linux (WSL) / لينكس (WSL)', 'SSH / إس إس إتش'].map((s, i) => (
                  <div key={i} className="px-4 py-2 hover:bg-cyan-500/20 cursor-pointer text-sm text-cyan-100 border-b border-cyan-500/10 last:border-0" onClick={() => { setShell(s.split(' / ')[0]); setIsShellDropdownOpen(false); }}>
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Terminal Window */}
          <GlassCard className="flex-1 flex flex-col bg-[#050a0f] border-cyan-500/30 overflow-hidden relative shadow-[0_0_20px_rgba(0,255,255,0.05)]">
            {/* Terminal Tabs */}
            <div className="flex border-b border-cyan-500/20 bg-[#0a1118]">
              <div className="px-4 py-2 border-r border-cyan-500/20 border-b-2 border-b-cyan-400 bg-[#0f172a] text-xs text-cyan-300 flex items-center gap-2">
                main-shell / <span dir="rtl" className="font-arabic">الصدفة الرئيسية</span>
              </div>
              <div className="px-4 py-2 border-r border-cyan-500/20 text-xs text-white/50 flex items-center gap-2 hover:bg-white/5 cursor-pointer">
                server-logs / <span dir="rtl" className="font-arabic">سجلات الخادم</span>
              </div>
              <div className="px-4 py-2 text-xs text-white/50 flex items-center gap-2 hover:bg-white/5 cursor-pointer">
                script / <span dir="rtl" className="font-arabic">نص النشر</span>
              </div>
              <div className="px-4 py-2 text-xs text-white/50 hover:text-white cursor-pointer ml-auto flex items-center">
                +
              </div>
            </div>

            {/* Terminal Output */}
            <div className="flex-1 p-4 overflow-y-auto font-mono text-sm flex flex-col gap-1 custom-scrollbar">
              {output.map((line, i) => (
                <div key={i} className={`whitespace-pre-wrap break-words ${
                  line.type === 'command' ? 'text-green-400' :
                  line.type === 'error' ? 'text-red-400' :
                  line.type === 'warn' ? 'text-yellow-400' :
                  line.type === 'info' ? 'text-blue-400' :
                  'text-gray-300'
                }`}>
                  {line.text}
                </div>
              ))}
              <div ref={terminalEndRef} />
              
              {/* Input Line */}
              <div className="flex items-center mt-2">
                <span className="text-green-400 mr-2">user@AI-Platform:{cwd}$</span>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCommand()}
                  className="flex-1 bg-transparent outline-none text-white font-mono"
                  autoFocus
                  disabled={isExecuting}
                />
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right Sidebar */}
        <GlassCard className="col-span-12 lg:col-span-3 flex flex-col bg-[#0a1118]/90 border-green-500/30 overflow-hidden" glowColor="rgba(34, 197, 94, 0.05)">
          <div className="p-4 border-b border-green-500/20 text-center">
            <h3 className="text-sm font-bold text-white">Terminal Agent / <span dir="rtl" className="font-arabic">وكيل المحطة الطرفية</span></h3>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto custom-scrollbar flex flex-col gap-4">
            
            {/* Agent Message 1 */}
            <div className="bg-[#0f172a] border border-green-500/30 rounded-lg p-3 relative">
              <div className="absolute -left-3 -top-3 h-8 w-8 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center">
                <Cpu className="h-4 w-4 text-green-400" />
              </div>
              <p className="text-xs text-white/80 ml-4 mb-2">AI Suggestion: Detected high memory usage. Consider increasing swap or optimizing data loading.</p>
              <p dir="rtl" className="font-arabic text-[10px] text-green-400/80 border-t border-green-500/20 pt-2">
                اقتراح الذكاء الاصطناعي: تم الكشف عن استخدام عالٍ للذاكرة. فكر في زيادة الذاكرة التبادلية أو تحسين تحميل البيانات.
              </p>
            </div>

            {/* Agent Message 2 */}
            <div className="bg-[#0f172a] border border-green-500/30 rounded-lg p-3 relative">
              <div className="absolute -left-3 -top-3 h-8 w-8 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center">
                <Cpu className="h-4 w-4 text-green-400" />
              </div>
              <p className="text-xs text-white/80 ml-4 mb-2">Auto-Correction: 'kebectl get pods' was corrected to 'kubectl get pods'.</p>
              <p dir="rtl" className="font-arabic text-[10px] text-green-400/80 border-t border-green-500/20 pt-2">
                التصحيح التلقائي: تم تصحيح 'kebectl get pods' إلى 'kubectl get pods'.
              </p>
            </div>

            {/* Agent Input */}
            <div className="mt-auto flex items-center gap-2 bg-[#050a0f] border border-green-500/30 rounded-full px-3 py-1.5">
              <input type="text" placeholder="Ask agent..." className="flex-1 bg-transparent text-xs text-white outline-none" />
              <Send className="h-3 w-3 text-green-400 cursor-pointer" />
            </div>

          </div>

          {/* Monitoring */}
          <div className="p-4 border-t border-green-500/20 bg-[#0f172a]/50">
            <h4 className="text-xs font-bold text-center mb-1 text-white">Real-time Execution Monitoring</h4>
            <h4 className="text-[10px] font-arabic text-center mb-4 text-white/70" dir="rtl">مراقبة التنفيذ في الوقت الفعلي</h4>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-white/70">CPU Usage: <span className="text-green-400">85%</span></span>
                  <span dir="rtl" className="font-arabic text-white/70">استخدام المعالج: <span className="text-green-400">85%</span></span>
                </div>
                {/* Fake Chart */}
                <svg viewBox="0 0 100 20" className="w-full h-8 overflow-visible">
                  <polyline points="0,15 10,5 20,18 30,8 40,12 50,2 60,15 70,5 80,10 90,2 100,12" fill="none" stroke="#4ade80" strokeWidth="1.5" />
                  <polygon points="0,20 0,15 10,5 20,18 30,8 40,12 50,2 60,15 70,5 80,10 90,2 100,12 100,20" fill="rgba(74, 222, 128, 0.1)" />
                </svg>
              </div>
              
              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-white/70">Memory Usage: <span className="text-green-400">92%</span></span>
                  <span dir="rtl" className="font-arabic text-white/70">استخدام الذاكرة: <span className="text-green-400">92%</span></span>
                </div>
                {/* Fake Chart */}
                <svg viewBox="0 0 100 20" className="w-full h-8 overflow-visible">
                  <polyline points="0,10 10,12 20,8 30,15 40,5 50,18 60,8 70,12 80,5 90,15 100,8" fill="none" stroke="#4ade80" strokeWidth="1.5" />
                  <polygon points="0,20 0,10 10,12 20,8 30,15 40,5 50,18 60,8 70,12 80,5 90,15 100,8 100,20" fill="rgba(74, 222, 128, 0.1)" />
                </svg>
              </div>
            </div>
          </div>
        </GlassCard>

      </div>
    </div>
  );
}
