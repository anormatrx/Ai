import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { motion } from "framer-motion";
import { 
  Bot, 
  Folder, 
  User, 
  Send,
  ChevronDown,
  ChevronUp
} from "lucide-react";

export default function Forge() {
  const [agentName, setAgentName] = useState("");
  const [baseModel, setBaseModel] = useState("llama3");
  const [systemIdentity, setSystemIdentity] = useState("");
  const [instructionSet, setInstructionSet] = useState("");
  const [chatInput, setChatInput] = useState("");

  return (
    <div className="flex h-full flex-col bg-[#050a0f] text-white p-6 font-sans overflow-hidden relative" dir="ltr">
      
      {/* Background Grid */}
      <div className="absolute inset-0 pointer-events-none" 
           style={{
             backgroundImage: `linear-gradient(rgba(34, 211, 238, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 211, 238, 0.05) 1px, transparent 1px)`,
             backgroundSize: '40px 40px',
             transform: 'perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px)',
             transformOrigin: 'top center'
           }}
      />

      {/* Header */}
      <div className="text-center mb-6 relative z-10">
        <h1 className="text-3xl font-bold text-cyan-400 tracking-wide drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">
          Unified Agent Forge & Marketplace | <span dir="rtl" className="font-arabic">معمل تشكيل الوكيل الموحد والسوق</span>
        </h1>
        <p className="text-xs text-white/70 mt-2">
          Advanced AI Agent creation and testing environment within the 'Dark Room' ecosystem. | <span dir="rtl" className="font-arabic">بيئة متقدمة لإنشاء واختبار وكلاء الذكاء الاصطناعي داخل نظام "الغرفة المظلمة".</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0 relative z-10">
        
        {/* Left Column: Agent Configuration */}
        <div className="lg:col-span-4 flex flex-col h-full">
          <GlassCard className="flex-1 p-4 border-cyan-500/30 flex flex-col gap-4 bg-black/40" glowColor="rgba(0, 255, 255, 0.05)">
            <h3 className="text-sm font-bold text-white border-b border-cyan-500/20 pb-2">
              Agent Configuration | <span dir="rtl" className="font-arabic text-cyan-400">تكوين الوكيل</span>
            </h3>
            
            <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <div className="space-y-1">
                <label className="text-xs text-white/80">Agent Name | <span dir="rtl" className="font-arabic">اسم الوكيل</span></label>
                <input 
                  type="text" 
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  className="w-full bg-cyan-950/30 border border-cyan-500/30 rounded p-2 text-sm text-cyan-100 outline-none focus:border-cyan-400 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-white/80">Base Model | <span dir="rtl" className="font-arabic">النموذج الأساسي</span></label>
                <div className="relative">
                  <select 
                    value={baseModel}
                    onChange={(e) => setBaseModel(e.target.value)}
                    className="w-full bg-cyan-950/30 border border-cyan-500/30 rounded p-2 text-sm text-cyan-100 outline-none focus:border-cyan-400 appearance-none cursor-pointer"
                  >
                    <option value="llama3">llama3</option>
                    <option value="gemini">gemini-pro</option>
                    <option value="gpt4">gpt-4</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-500 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1 flex-1 flex flex-col min-h-[100px]">
                <label className="text-xs text-white/80">System Identity | <span dir="rtl" className="font-arabic">هوية النظام</span></label>
                <textarea 
                  value={systemIdentity}
                  onChange={(e) => setSystemIdentity(e.target.value)}
                  className="w-full flex-1 bg-cyan-950/30 border border-cyan-500/30 rounded p-2 text-sm text-cyan-100 outline-none focus:border-cyan-400 resize-none"
                />
              </div>

              <div className="space-y-1 flex-1 flex flex-col min-h-[100px]">
                <label className="text-xs text-white/80">Instruction Set | <span dir="rtl" className="font-arabic">مجموعة التعليمات</span></label>
                <textarea 
                  value={instructionSet}
                  onChange={(e) => setInstructionSet(e.target.value)}
                  className="w-full flex-1 bg-cyan-950/30 border border-cyan-500/30 rounded p-2 text-sm text-cyan-100 outline-none focus:border-cyan-400 resize-none"
                />
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Middle Column: Data Connection */}
        <div className="lg:col-span-4 flex flex-col h-full">
          <GlassCard className="flex-1 p-4 border-cyan-500/30 flex flex-col bg-black/40" glowColor="rgba(0, 255, 255, 0.05)">
            <h3 className="text-sm font-bold text-white border-b border-cyan-500/20 pb-2 mb-4 text-center">
              Data Connection | <span dir="rtl" className="font-arabic text-cyan-400">اتصال البيانات</span>
            </h3>
            
            <div className="flex-1 relative flex items-center justify-center">
              {/* Connection Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <path d="M 30% 50% L 50% 50% L 50% 30% L 70% 30%" fill="none" stroke="rgba(34,211,238,0.5)" strokeWidth="2" />
                <path d="M 30% 50% L 50% 50% L 50% 70% L 70% 70%" fill="none" stroke="rgba(34,211,238,0.5)" strokeWidth="2" />
                
                {/* Glowing dots on lines */}
                <circle cx="50%" cy="50%" r="3" fill="#22d3ee" className="animate-pulse" />
              </svg>

              {/* Agent Node */}
              <div className="absolute left-[15%] top-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="h-16 w-16 bg-cyan-900/40 border-2 border-cyan-400 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                  <User className="h-8 w-8 text-cyan-400" />
                </div>
                <span className="mt-2 text-xs text-white">New Agent</span>
                <span className="text-[10px] text-cyan-400 font-arabic" dir="rtl">الوكيل الجديد</span>
              </div>

              {/* Data Nodes */}
              <div className="absolute right-[15%] top-[30%] -translate-y-1/2 flex flex-col items-center">
                <Folder className="h-12 w-12 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                <span className="mt-1 text-xs text-white">Project Files</span>
                <span className="text-[10px] text-cyan-400 font-arabic" dir="rtl">ملفات المشروع</span>
              </div>

              <div className="absolute right-[15%] top-[70%] -translate-y-1/2 flex flex-col items-center">
                <Folder className="h-12 w-12 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                <span className="mt-1 text-xs text-white">Database Folders</span>
                <span className="text-[10px] text-cyan-400 font-arabic" dir="rtl">مجلدات قاعدة البيانات</span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Forge Test & Community */}
        <div className="lg:col-span-4 flex flex-col gap-4 h-full">
          
          {/* Forge Test */}
          <GlassCard className="flex-1 p-4 border-cyan-500/30 flex flex-col bg-black/40" glowColor="rgba(0, 255, 255, 0.05)">
            <h3 className="text-sm font-bold text-white border-b border-cyan-500/20 pb-2 mb-4">
              Forge Test (Live Prototype) | <span dir="rtl" className="font-arabic text-cyan-400">اختبار التشكيل (نموذج حي)</span>
            </h3>
            
            <div className="flex-1 flex flex-col justify-center gap-4">
              <div className="flex items-start gap-3">
                <Bot className="h-6 w-6 text-cyan-400 shrink-0 mt-1" />
                <div className="bg-cyan-950/40 border border-cyan-500/20 rounded-lg p-3 text-sm text-cyan-100">
                  <p className="font-bold mb-1">Agent | <span dir="rtl" className="font-arabic">الوكيل</span></p>
                  <p>Agent initialized. Ready for instructions.</p>
                  <p dir="rtl" className="font-arabic mt-1">الوكيل جاهز. في انتظار التعليمات.</p>
                </div>
              </div>
            </div>

            <div className="mt-4 relative">
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="دردش مع الوكيل... | Chat with agent..."
                className="w-full bg-cyan-950/30 border border-cyan-500/30 rounded-full py-2 px-4 pr-10 text-sm text-cyan-100 outline-none focus:border-cyan-400"
                dir="rtl"
              />
              <button className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-cyan-900/50 rounded-full hover:bg-cyan-800 transition-colors">
                <Send className="h-4 w-4 text-cyan-400" />
              </button>
            </div>
          </GlassCard>

          {/* Community & Export */}
          <GlassCard className="h-1/3 p-4 border-cyan-500/30 flex flex-col bg-black/40" glowColor="rgba(0, 255, 255, 0.05)">
            <div className="flex justify-between items-center border-b border-cyan-500/20 pb-2 mb-3">
              <div className="text-center">
                <button className="text-xs text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 rounded px-2 py-1 bg-cyan-950/30">
                  Export Agent (Encrypted File)<br/>
                  <span dir="rtl" className="font-arabic">تصدير الوكيل (ملف مشفر)</span>
                </button>
              </div>
              <h3 className="text-sm font-bold text-white text-center">
                Agent Community & Export | <span dir="rtl" className="font-arabic text-cyan-400">مجتمع الوكلاء والتصدير</span>
              </h3>
              <div className="text-center">
                <button className="text-xs text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 rounded px-2 py-1 bg-cyan-950/30 flex items-center gap-1">
                  Import Agent Template<br/>
                  <span dir="rtl" className="font-arabic">استيراد قالب الوكيل</span>
                  <ChevronUp className="h-3 w-3" />
                </button>
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {/* Template 1 */}
              <div className="min-w-[140px] flex-1 bg-cyan-950/20 border border-cyan-500/20 rounded p-2 flex items-center gap-2">
                <div className="h-10 w-10 bg-blue-900/50 rounded flex items-center justify-center shrink-0">
                  <Bot className="h-6 w-6 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-white truncate">Data Analyst | <span dir="rtl" className="font-arabic">محلل بيانات</span></p>
                  <p className="text-[8px] text-white/50 truncate">Trending Community Agents</p>
                  <div className="flex gap-1 mt-1">
                    <button className="text-[8px] text-cyan-400 hover:underline">Preview | معاينة</button>
                    <span className="text-white/30">|</span>
                    <button className="text-[8px] text-cyan-400 hover:underline">Clone | استنساخ</button>
                  </div>
                </div>
              </div>

              {/* Template 2 */}
              <div className="min-w-[140px] flex-1 bg-cyan-950/20 border border-cyan-500/20 rounded p-2 flex items-center gap-2">
                <div className="h-10 w-10 bg-purple-900/50 rounded flex items-center justify-center shrink-0">
                  <Bot className="h-6 w-6 text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-white truncate">Creative Writer | <span dir="rtl" className="font-arabic">كاتب إبداعي</span></p>
                  <p className="text-[8px] text-white/50 truncate">Trending Community Agents</p>
                  <div className="flex gap-1 mt-1">
                    <button className="text-[8px] text-cyan-400 hover:underline">Preview | معاينة</button>
                    <span className="text-white/30">|</span>
                    <button className="text-[8px] text-cyan-400 hover:underline">Clone | استنساخ</button>
                  </div>
                </div>
              </div>

              {/* Template 3 */}
              <div className="min-w-[140px] flex-1 bg-cyan-950/20 border border-cyan-500/20 rounded p-2 flex items-center gap-2">
                <div className="h-10 w-10 bg-green-900/50 rounded flex items-center justify-center shrink-0">
                  <Bot className="h-6 w-6 text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-white truncate">Code Assistant | <span dir="rtl" className="font-arabic">مساعد برمجة</span></p>
                  <p className="text-[8px] text-white/50 truncate">Trending Community Agents</p>
                  <div className="flex gap-1 mt-1">
                    <button className="text-[8px] text-cyan-400 hover:underline">Preview | معاينة</button>
                    <span className="text-white/30">|</span>
                    <button className="text-[8px] text-cyan-400 hover:underline">Clone | استنساخ</button>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

      </div>

      {/* Bottom Status Bar */}
      <div className="mt-4 pt-2 border-t border-cyan-500/20 flex items-center justify-between text-[10px] text-white/60 relative z-10">
        <div>
          Status: <span className="text-green-400">Ready</span> | <span dir="rtl" className="font-arabic">الحالة: <span className="text-green-400">جاهز</span></span>
        </div>
        <div className="flex items-center gap-4">
          <span>CPU: 5%</span>
          <span>Memory: 300MB</span>
          <span>Network: 5Kbps</span>
        </div>
      </div>

    </div>
  );
}
