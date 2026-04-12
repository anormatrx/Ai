import React, { useState, useRef, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Bot, Mic, Send, Terminal, Wrench, ShieldAlert, MonitorPlay, Code2, ChevronDown, ChevronUp, Play } from "lucide-react";

const ChatMessage = ({ type, titleEn, titleAr, descEn, descAr, isUser = false }: any) => (
  <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
    <div className={`flex gap-3 max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className="mt-1 shrink-0">
        {isUser ? (
          <div className="h-8 w-8 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center">
            <span className="text-xs text-cyan-300">U</span>
          </div>
        ) : (
          <div className="h-8 w-8 rounded-full bg-purple-500/20 border border-purple-500/50 flex items-center justify-center">
            <CpuIcon />
          </div>
        )}
      </div>
      
      <div className={`p-3 rounded-xl border ${isUser ? 'bg-cyan-900/30 border-cyan-500/30 rounded-tr-none' : 'bg-purple-900/30 border-purple-500/30 rounded-tl-none'}`}>
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-bold ${isUser ? 'text-cyan-300' : 'text-purple-300'}`}>{titleEn}</span>
            <span className="text-white/30">/</span>
            <span dir="rtl" className={`text-xs font-arabic font-bold ${isUser ? 'text-cyan-300' : 'text-purple-300'}`}>{titleAr}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-white/70">{descEn}</span>
            <span dir="rtl" className="text-[10px] font-arabic text-white/70">{descAr}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const CpuIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
    <rect x="9" y="9" width="6" height="6" />
    <line x1="9" y1="1" x2="9" y2="4" />
    <line x1="15" y1="1" x2="15" y2="4" />
    <line x1="9" y1="20" x2="9" y2="23" />
    <line x1="15" y1="20" x2="15" y2="23" />
    <line x1="20" y1="9" x2="23" y2="9" />
    <line x1="20" y1="14" x2="23" y2="14" />
    <line x1="1" y1="9" x2="4" y2="9" />
    <line x1="1" y1="14" x2="4" y2="14" />
  </svg>
);

export default function SystemAutomation() {
  const [chatInput, setChatInput] = useState("");
  const [openSection, setOpenSection] = useState<string | null>("DIAGNOSTICS");

  const [messages, setMessages] = useState([
    { id: 1, isUser: true, titleEn: "ASK AI", titleAr: "اسأل الذكاء الاصطناعي", descEn: "Type a command or ask AI...", descAr: "اكتب أمراً أو اسأل الذكاء الاصطناعي..." },
    { id: 2, isUser: false, titleEn: "SYSTEM HEALTH CHECK", titleAr: "فحص صحة النظام", descEn: "Scan hardware and services to measure optimal performance.", descAr: "مسح الأجهزة والخدمات لقياس الأداء الأمثل." },
    { id: 3, isUser: false, titleEn: "MDR ANALYSIS", titleAr: "فحص صحة النظام", descEn: "Check on communication, network systems.", descAr: "مسح الأجهزة أو الذكاء الاصطناعي..." },
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!chatInput.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), isUser: true, titleEn: "USER COMMAND", titleAr: "أمر المستخدم", descEn: chatInput, descAr: chatInput }]);
    setChatInput("");
    
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now(), isUser: false, titleEn: "SYSTEM RESPONSE", titleAr: "استجابة النظام", descEn: "Processing command...", descAr: "جاري معالجة الأمر..." }]);
    }, 1000);
  };

  const handleExecute = (cmdEn: string, cmdAr: string) => {
    setMessages(prev => [...prev, { id: Date.now(), isUser: true, titleEn: "EXECUTE", titleAr: "تنفيذ", descEn: `Executing: ${cmdEn}`, descAr: `جاري تنفيذ: ${cmdAr}` }]);
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now(), isUser: false, titleEn: "RESULT", titleAr: "النتيجة", descEn: `${cmdEn} completed successfully.`, descAr: `تم الانتهاء من ${cmdAr} بنجاح.` }]);
    }, 1500);
  };

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <div className="flex h-full flex-col bg-[#0a0514] text-white p-6 font-sans overflow-hidden relative" dir="ltr">
      {/* Background Circuit Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-20" 
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 10h80v80h-80z' fill='none' stroke='%23a855f7' stroke-width='1'/%3E%3Cpath d='M30 30h40v40h-40z' fill='none' stroke='%2306b6d4' stroke-width='1'/%3E%3Cpath d='M10 50h20M70 50h20M50 10v20M50 70v20' stroke='%23a855f7' stroke-width='1'/%3E%3C/svg%3E")`,
             backgroundSize: '200px 200px',
           }}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 bg-[#1a0b2e] border border-purple-500/50 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <CpuIcon />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-cyan-400 tracking-wide">AI COMMAND HUB</h1>
            <span dir="rtl" className="font-arabic text-sm text-purple-300">مركز قيادة الذكاء الاصطناعي</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-6 text-xs font-bold tracking-widest">
            <div className="flex flex-col items-center text-cyan-500/50 hover:text-cyan-400 cursor-pointer transition-colors">
              <span>DASHBOARD</span>
              <span dir="rtl" className="font-arabic text-[10px]">لوحة التحكم</span>
            </div>
            <div className="flex flex-col items-center text-cyan-500/50 hover:text-cyan-400 cursor-pointer transition-colors">
              <span>DEVELOPER LAB</span>
              <span dir="rtl" className="font-arabic text-[10px]">مختبر المطور</span>
            </div>
            <div className="flex flex-col items-center text-cyan-400 border-b-2 border-cyan-400 pb-1 cursor-pointer">
              <span>SYSTEM AUTOMATION</span>
              <span dir="rtl" className="font-arabic text-[10px]">أتمتة النظام</span>
            </div>
          </div>
          <div className="h-10 w-10 rounded-full border-2 border-cyan-500/50 flex items-center justify-center bg-[#1a0b2e]">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0 relative z-10">
        
        {/* Left Column: Chat Interface */}
        <GlassCard className="col-span-12 lg:col-span-8 flex flex-col bg-[#110820]/90 border-purple-500/20 overflow-hidden" glowColor="rgba(168, 85, 247, 0.05)">
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar flex flex-col">
            {messages.map(msg => (
              <ChatMessage 
                key={msg.id}
                isUser={msg.isUser}
                titleEn={msg.titleEn} titleAr={msg.titleAr}
                descEn={msg.descEn} descAr={msg.descAr}
              />
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 border-t border-purple-500/20 bg-[#1a0b2e]/50">
            <div className="flex items-center gap-3 bg-[#0a0514] border border-cyan-500/30 rounded-full px-4 py-2">
              <button className="text-cyan-500/50 hover:text-cyan-400 transition-colors">
                <Mic className="h-5 w-5" />
              </button>
              <input 
                type="text" 
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a command or ask AI... | اكتب أمراً أو اسأل الذكاء الاصطناعي..."
                className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
              />
              <button onClick={handleSend} className="text-cyan-400 hover:text-cyan-300 transition-colors">
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </GlassCard>

        {/* Right Column: Command Agent */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 h-full">
          
          <GlassCard className="flex-1 flex flex-col bg-[#110820]/90 border-cyan-500/20 overflow-hidden p-4" glowColor="rgba(0, 255, 255, 0.05)">
            
            <div className="flex items-start gap-4 mb-6">
              <div className="h-16 w-16 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-2xl border border-cyan-500/30 flex items-center justify-center shrink-0">
                <Bot className="h-10 w-10 text-cyan-400" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
                  COMMAND AGENT <span className="text-white/30">/</span> <span dir="rtl" className="font-arabic">وكيل الأوامر</span>
                </h3>
                <p className="text-[10px] text-white/60 mt-1">Ready to execute commands. Select a category below.</p>
                <p dir="rtl" className="text-[10px] font-arabic text-white/60 mt-1">مستعد لتنفيذ الأوامر. اختر فئة أدناه.</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
              
              {/* MAINTENANCE */}
              <div className="border border-cyan-500/20 rounded-lg overflow-hidden">
                <button 
                  onClick={() => toggleSection('MAINTENANCE')}
                  className="w-full flex items-center justify-between p-3 bg-[#1a0b2e]/50 hover:bg-[#1a0b2e] transition-colors"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-white/80">
                    <Wrench className="h-4 w-4 text-cyan-500/50" /> MAINTENANCE
                  </div>
                  <div className="flex items-center gap-2">
                    <span dir="rtl" className="font-arabic text-xs text-white/80">الصيانة</span>
                    {openSection === 'MAINTENANCE' ? <ChevronUp className="h-4 w-4 text-cyan-500/50" /> : <ChevronDown className="h-4 w-4 text-cyan-500/50" />}
                  </div>
                </button>
              </div>

              {/* DIAGNOSTICS */}
              <div className="border border-cyan-500/50 rounded-lg overflow-hidden shadow-[0_0_10px_rgba(0,255,255,0.1)]">
                <button 
                  onClick={() => toggleSection('DIAGNOSTICS')}
                  className="w-full flex items-center justify-between p-3 bg-[#1a0b2e] transition-colors"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                    <ShieldAlert className="h-4 w-4" /> DIAGNOSTICS
                  </div>
                  <div className="flex items-center gap-2">
                    <span dir="rtl" className="font-arabic text-xs text-cyan-400">التشخيصات</span>
                    {openSection === 'DIAGNOSTICS' ? <ChevronUp className="h-4 w-4 text-cyan-400" /> : <ChevronDown className="h-4 w-4 text-cyan-400" />}
                  </div>
                </button>
                {openSection === 'DIAGNOSTICS' && (
                  <div className="p-3 bg-[#0a0514] border-t border-cyan-500/20">
                    <div className="border border-green-500/30 rounded-lg p-3 bg-green-500/5">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-white">SYSTEM HEALTH CHECK</span>
                          <span className="text-[10px] text-white/60">Scan hardware and services</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span dir="rtl" className="font-arabic text-xs font-bold text-white">فحص صحة النظام</span>
                          <span dir="rtl" className="font-arabic text-[10px] text-white/60">مسح الأجهزة والخدمات</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <button onClick={() => handleExecute("SYSTEM HEALTH CHECK", "فحص صحة النظام")} className="px-4 py-1.5 bg-purple-500/20 border border-purple-500/50 rounded-full text-[10px] font-bold text-purple-300 hover:bg-purple-500/30 transition-colors flex items-center gap-1">
                          EXECUTE <span className="text-white/30">|</span> <span dir="rtl" className="font-arabic">تنفيذ</span>
                        </button>
                        <span className="text-[10px] font-bold text-green-400 flex items-center gap-1">
                          READY <span className="text-white/30">/</span> <span dir="rtl" className="font-arabic">جاهز</span>
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* LINUX/WSL */}
              <div className="border border-cyan-500/50 rounded-lg overflow-hidden shadow-[0_0_10px_rgba(0,255,255,0.1)]">
                <button 
                  onClick={() => toggleSection('LINUX')}
                  className="w-full flex items-center justify-between p-3 bg-[#1a0b2e] transition-colors"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                    <Terminal className="h-4 w-4" /> LINUX/WSL
                  </div>
                  <div className="flex items-center gap-2">
                    <span dir="rtl" className="font-arabic text-xs text-cyan-400">لينكس/WSL</span>
                    {openSection === 'LINUX' ? <ChevronUp className="h-4 w-4 text-cyan-400" /> : <ChevronDown className="h-4 w-4 text-cyan-400" />}
                  </div>
                </button>
                {openSection === 'LINUX' && (
                  <div className="p-3 bg-[#0a0514] border-t border-cyan-500/20">
                    <div className="border border-yellow-500/30 rounded-lg p-3 bg-yellow-500/5">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-white">UPDATE PACKAGES</span>
                          <span className="text-[10px] text-white/60">Update packages</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span dir="rtl" className="font-arabic text-xs font-bold text-white">تحديث الحزم</span>
                          <span dir="rtl" className="font-arabic text-[10px] text-white/60">تحديث الحزم</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <button onClick={() => handleExecute("UPDATE PACKAGES", "تحديث الحزم")} className="px-4 py-1.5 bg-purple-500/20 border border-purple-500/50 rounded-full text-[10px] font-bold text-purple-300 hover:bg-purple-500/30 transition-colors flex items-center gap-1">
                          EXECUTE <span className="text-white/30">|</span> <span dir="rtl" className="font-arabic">تنفيذ</span>
                        </button>
                        <span className="text-[10px] font-bold text-red-400 flex items-center gap-1">
                          FAILED <span className="text-white/30">/</span> <span dir="rtl" className="font-arabic">فشل</span>
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* WEB AUTOMATION */}
              <div className="border border-cyan-500/20 rounded-lg overflow-hidden">
                <button 
                  onClick={() => toggleSection('WEB')}
                  className="w-full flex items-center justify-between p-3 bg-[#1a0b2e]/50 hover:bg-[#1a0b2e] transition-colors"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-white/80">
                    <MonitorPlay className="h-4 w-4 text-cyan-500/50" /> WEB AUTOMATION
                  </div>
                  <div className="flex items-center gap-2">
                    <span dir="rtl" className="font-arabic text-xs text-white/80">أتمتة الويب</span>
                    {openSection === 'WEB' ? <ChevronUp className="h-4 w-4 text-cyan-500/50" /> : <ChevronDown className="h-4 w-4 text-cyan-500/50" />}
                  </div>
                </button>
              </div>

              {/* DEV TOOLS */}
              <div className="border border-cyan-500/20 rounded-lg overflow-hidden">
                <button 
                  onClick={() => toggleSection('DEV')}
                  className="w-full flex items-center justify-between p-3 bg-[#1a0b2e]/50 hover:bg-[#1a0b2e] transition-colors"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-white/80">
                    <Code2 className="h-4 w-4 text-cyan-500/50" /> DEV TOOLS
                  </div>
                  <div className="flex items-center gap-2">
                    <span dir="rtl" className="font-arabic text-xs text-white/80">أدوات التطوير</span>
                    {openSection === 'DEV' ? <ChevronUp className="h-4 w-4 text-cyan-500/50" /> : <ChevronDown className="h-4 w-4 text-cyan-500/50" />}
                  </div>
                </button>
              </div>

            </div>
          </GlassCard>

          {/* Command Pulse */}
          <div className="flex justify-end pr-2 pb-2">
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-cyan-400 tracking-widest">COMMAND PULSE</span>
                <span dir="rtl" className="font-arabic text-[10px] text-cyan-400/70">نبض الأوامر</span>
              </div>
              <div className="h-14 w-14 rounded-full border-2 border-cyan-400 flex items-center justify-center bg-[#0a0514] shadow-[0_0_20px_rgba(0,255,255,0.3)] relative">
                <div className="absolute inset-0 rounded-full border border-cyan-400 animate-ping opacity-20"></div>
                <Terminal className="h-6 w-6 text-cyan-400" />
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
