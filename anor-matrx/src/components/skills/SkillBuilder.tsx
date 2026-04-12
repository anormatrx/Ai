import React, { useState, useRef, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { motion } from "framer-motion";
import { Cpu, Send, Save, X, Download, Upload, Play, CheckSquare, Square } from "lucide-react";

export default function SkillBuilder() {
  const [activeTab, setActiveTab] = useState<"prompts" | "code">("prompts");
  const [skillName, setSkillName] = useState("");
  const [description, setDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [chatInput, setChatInput] = useState("");
  
  const [tools, setTools] = useState({
    webSearch: true,
    sql: false,
    fileAnalysis: false,
    connected: false
  });

  const [permissions, setPermissions] = useState({
    read: true,
    write: false,
    execute: false
  });

  const [testMessages, setTestMessages] = useState([
    { id: 1, sender: 'agent', textEn: 'Agent: Ready to test.', textAr: 'الوكيل: مستعد للاختبار.' }
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [testMessages]);

  const handleSendTest = () => {
    if (!chatInput.trim()) return;
    setTestMessages(prev => [...prev, { id: Date.now(), sender: 'user', textEn: `User: ${chatInput}`, textAr: `المستخدم: ${chatInput}` }]);
    setChatInput("");
    setTimeout(() => {
      setTestMessages(prev => [...prev, { id: Date.now(), sender: 'agent', textEn: 'Agent: Processing...', textAr: 'الوكيل: جاري المعالجة...' }]);
    }, 1000);
  };

  const handleClearTest = () => {
    setTestMessages([{ id: 1, sender: 'agent', textEn: 'Agent: Ready to test.', textAr: 'الوكيل: مستعد للاختبار.' }]);
  };

  const handleCancel = () => {
    setSkillName("");
    setDescription("");
    setSystemPrompt("");
    setTools({ webSearch: false, sql: false, fileAnalysis: false, connected: false });
    setPermissions({ read: false, write: false, execute: false });
  };

  return (
    <div className="flex h-full flex-col bg-[#050a0f] text-white p-6 font-sans overflow-hidden relative" dir="ltr">
      {/* Background Grid */}
      <div className="absolute inset-0 pointer-events-none" 
           style={{
             backgroundImage: `linear-gradient(rgba(0, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.05) 1px, transparent 1px)`,
             backgroundSize: '40px 40px',
             transform: 'perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px)',
             transformOrigin: 'top center'
           }}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-[#0f172a] border border-cyan-500/30 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(0,255,255,0.2)]">
            <Cpu className="h-6 w-6 text-cyan-400" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
            OpenClaw <span className="text-cyan-400/50 text-xl font-light">|</span> 
            <span className="text-lg">Unified Skill Builder & Testing Lab</span>
            <span className="text-cyan-400/50 text-xl font-light">|</span> 
            <span dir="rtl" className="font-arabic text-lg text-cyan-100">موحد بناء المهارات ومختبر الاختبار</span>
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0 relative z-10">
        
        {/* Left Column: Skill Builder */}
        <GlassCard className="col-span-12 lg:col-span-7 flex flex-col bg-[#0a1118]/90 border-cyan-500/20 overflow-hidden" glowColor="rgba(0, 255, 255, 0.05)">
          <div className="border-b border-cyan-500/20 p-3 bg-[#0f172a]/80 text-center">
            <h3 className="text-sm font-bold text-cyan-300 tracking-widest">
              Skill Builder & Management - <span dir="rtl" className="font-arabic">منشئ وإدارة المهارات</span>
            </h3>
          </div>
          
          <div className="p-6 flex-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
            <div className="border border-cyan-500/20 rounded-lg p-4 bg-[#0f172a]/40 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0a1118] px-2 text-xs text-cyan-400">
                Custom Skill Builder - <span dir="rtl" className="font-arabic">منشئ المهارات المخصص</span>
              </div>
              
              <div className="space-y-4 mt-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-cyan-200 flex justify-between">
                    <span>Skill Name</span>
                    <span dir="rtl" className="font-arabic">اسم المهارة</span>
                  </label>
                  <input 
                    type="text" 
                    value={skillName}
                    onChange={e => setSkillName(e.target.value)}
                    className="bg-[#0f172a] border border-cyan-500/30 rounded px-3 py-2 text-sm text-white focus:border-cyan-400 outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-cyan-200 flex justify-between">
                    <span>Description</span>
                    <span dir="rtl" className="font-arabic">الوصف</span>
                  </label>
                  <input 
                    type="text" 
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="bg-[#0f172a] border border-cyan-500/30 rounded px-3 py-2 text-sm text-white focus:border-cyan-400 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  {/* Tabs Area */}
                  <div className="flex flex-col border border-cyan-500/30 rounded-lg overflow-hidden h-48">
                    <div className="flex border-b border-cyan-500/30 bg-[#0f172a]">
                      <button 
                        onClick={() => setActiveTab("prompts")}
                        className={`flex-1 py-2 text-xs transition-colors ${activeTab === 'prompts' ? 'bg-cyan-500/20 text-cyan-300 border-b-2 border-cyan-400' : 'text-cyan-500/50 hover:text-cyan-300'}`}
                      >
                        System Prompts - <span dir="rtl" className="font-arabic">موجهات النظام</span>
                      </button>
                      <button 
                        onClick={() => setActiveTab("code")}
                        className={`flex-1 py-2 text-xs transition-colors ${activeTab === 'code' ? 'bg-cyan-500/20 text-cyan-300 border-b-2 border-cyan-400' : 'text-cyan-500/50 hover:text-cyan-300'}`}
                      >
                        Code Snippets - <span dir="rtl" className="font-arabic">قصاصات برمجية</span>
                      </button>
                    </div>
                    <textarea 
                      value={systemPrompt}
                      onChange={e => setSystemPrompt(e.target.value)}
                      className="flex-1 bg-[#050a0f] p-3 text-sm text-cyan-100 outline-none resize-none custom-scrollbar"
                      placeholder="|"
                    />
                  </div>

                  {/* Tools & Permissions */}
                  <div className="flex flex-col gap-4">
                    <div className="border border-cyan-500/30 rounded-lg p-3 relative">
                      <div className="absolute -top-3 right-4 bg-[#0a1118] px-2 text-xs text-cyan-400">
                        Required Tools - <span dir="rtl" className="font-arabic">الأدوات المطلوبة</span>
                      </div>
                      <div className="mt-2 space-y-2 bg-[#0f172a]/50 p-2 rounded border border-cyan-500/20 h-24 overflow-y-auto custom-scrollbar">
                        {Object.entries(tools).map(([key, val]) => (
                          <div key={key} className="flex items-center justify-between text-xs text-cyan-100 cursor-pointer" onClick={() => setTools({...tools, [key]: !val})}>
                            <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                            {val ? <CheckSquare className="h-4 w-4 text-cyan-400" /> : <Square className="h-4 w-4 text-cyan-500/30" />}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border border-cyan-500/30 rounded-lg p-3 relative flex-1 flex flex-col justify-center">
                      <div className="absolute -top-3 right-4 bg-[#0a1118] px-2 text-xs text-cyan-400">
                        Access Permissions - <span dir="rtl" className="font-arabic">أذونات الوصول</span>
                      </div>
                      <div className="flex justify-between items-center mt-2 px-2">
                        {Object.entries(permissions).map(([key, val]) => (
                          <div key={key} className="flex items-center gap-2 text-xs text-cyan-100 cursor-pointer" onClick={() => setPermissions({...permissions, [key]: !val})}>
                            <span className="capitalize">{key}</span>
                            <span dir="rtl" className="font-arabic text-[10px] text-cyan-400/70">
                              {key === 'read' ? 'قراءة' : key === 'write' ? 'كتابة' : 'تنفيذ'}
                            </span>
                            {val ? <CheckSquare className="h-3 w-3 text-cyan-400" /> : <Square className="h-3 w-3 text-cyan-500/30" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-4 pt-4">
                  <button className="px-6 py-2 bg-cyan-500/10 border border-cyan-500/50 rounded-full text-xs text-cyan-300 hover:bg-cyan-500/20 transition-colors flex items-center gap-2">
                    <Save className="h-4 w-4" /> Save Skill - <span dir="rtl" className="font-arabic">حفظ المهارة</span>
                  </button>
                  <button onClick={handleCancel} className="px-6 py-2 bg-red-500/10 border border-red-500/50 rounded-full text-xs text-red-300 hover:bg-red-500/20 transition-colors flex items-center gap-2">
                    <X className="h-4 w-4" /> Cancel - <span dir="rtl" className="font-arabic">إلغاء</span>
                  </button>
                  <button className="px-6 py-2 bg-blue-500/10 border border-blue-500/50 rounded-full text-xs text-blue-300 hover:bg-blue-500/20 transition-colors flex items-center gap-2">
                    <Upload className="h-4 w-4" /> Load Existing Skill - <span dir="rtl" className="font-arabic">تحميل مهارة موجودة</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Right Column: Testing & Debug */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-6 h-full">
          
          {/* Live Testing Lab */}
          <GlassCard className="flex-1 flex flex-col bg-[#0a1118]/90 border-cyan-500/20 overflow-hidden" glowColor="rgba(0, 255, 255, 0.05)">
            <div className="border-b border-cyan-500/20 p-3 bg-[#0f172a]/80 text-center">
              <h3 className="text-sm font-bold text-cyan-300 tracking-widest">
                Live Testing Lab - <span dir="rtl" className="font-arabic">مختبر الاختبار المباشر</span>
              </h3>
            </div>
            
            <div className="p-4 flex-1 flex flex-col">
              <div className="border border-cyan-500/30 rounded-lg flex-1 flex flex-col overflow-hidden relative">
                <div className="bg-[#0f172a]/80 p-2 border-b border-cyan-500/30 text-center text-xs text-cyan-400">
                  Mini-Chat Console - <span dir="rtl" className="font-arabic">وحدة تحكم الدردشة المصغرة</span>
                </div>
                <div className="flex-1 p-4 overflow-y-auto custom-scrollbar flex flex-col gap-2">
                  {testMessages.map(msg => (
                    <div key={msg.id} className={`flex justify-between items-start text-xs ${msg.sender === 'user' ? 'text-cyan-300' : 'text-green-400'}`}>
                      <span>{msg.textEn}</span>
                      <span dir="rtl" className="font-arabic opacity-80">{msg.textAr}</span>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <div className="p-3 border-t border-cyan-500/30 bg-[#0f172a]/50 flex gap-2">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendTest()}
                    placeholder="Enter Prompt to Test Skill... | أدخل مطالبة لاختبار المهارة..."
                    className="flex-1 bg-[#050a0f] border border-cyan-500/30 rounded-full px-4 py-2 text-xs text-white outline-none focus:border-cyan-400"
                  />
                  <button onClick={handleSendTest} className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded-full text-xs text-cyan-300 hover:bg-cyan-500/30 transition-colors flex items-center gap-2">
                    Send - <span dir="rtl" className="font-arabic">إرسال</span> <Send className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Debug Console */}
          <GlassCard className="flex-1 flex flex-col bg-[#0a1118]/90 border-cyan-500/20 overflow-hidden" glowColor="rgba(0, 255, 255, 0.05)">
            <div className="border-b border-cyan-500/20 p-3 bg-[#0f172a]/80 text-center">
              <h3 className="text-sm font-bold text-cyan-300 tracking-widest">
                Debug Console - <span dir="rtl" className="font-arabic">وحدة تحكم التصحيح</span>
              </h3>
            </div>
            
            <div className="p-4 flex-1 flex flex-col">
              <div className="border border-cyan-500/30 rounded-lg flex-1 p-4 overflow-y-auto custom-scrollbar bg-[#050a0f]">
                <div className="space-y-4 text-xs">
                  <div>
                    <h4 className="text-cyan-400 font-bold mb-1">Tools Used - <span dir="rtl" className="font-arabic">الأدوات المستخدمة</span></h4>
                    <p className="text-cyan-100/60">Agent Ready to test...</p>
                  </div>
                  <div>
                    <h4 className="text-cyan-400 font-bold mb-1">Reasoning - <span dir="rtl" className="font-arabic">الاستنتاج</span></h4>
                    <p className="text-cyan-100/60">Reasoning - pending...</p>
                  </div>
                  <div>
                    <h4 className="text-red-400 font-bold mb-1">Errors - <span dir="rtl" className="font-arabic">الأخطاء</span></h4>
                    <p className="text-red-400/60">Errors log - clear...</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center gap-4 pt-4">
                <button className="px-6 py-2 bg-cyan-500/10 border border-cyan-500/50 rounded-full text-xs text-cyan-300 hover:bg-cyan-500/20 transition-colors">
                  Save & Deploy - <span dir="rtl" className="font-arabic">حفظ ونشر</span>
                </button>
                <button onClick={handleClearTest} className="px-6 py-2 bg-white/5 border border-white/20 rounded-full text-xs text-white/70 hover:bg-white/10 transition-colors">
                  Clear Test - <span dir="rtl" className="font-arabic">مسح الاختبار</span>
                </button>
              </div>
            </div>
          </GlassCard>

        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="mt-4 pt-2 border-t border-cyan-500/20 flex items-center justify-between text-[10px] text-cyan-500/60 relative z-10">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          Agent Status: <span className="text-cyan-400">Active</span> | <span dir="rtl" className="font-arabic">حالة العميل: <span className="text-cyan-400">نشط</span></span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-cyan-400/50" />
          System Load: 15% - <span dir="rtl" className="font-arabic">حمل النظام: 15%</span>
        </div>
      </div>

    </div>
  );
}
