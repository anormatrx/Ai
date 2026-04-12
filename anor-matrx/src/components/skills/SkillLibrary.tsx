import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Search, Globe, FileText, Code2, Database, FileSearch, Github, Cloud, Brain, Puzzle } from "lucide-react";

const SkillCard = ({ titleEn, titleAr, icon: Icon, active, level, levelAr, percentage }: any) => (
  <div className="border border-cyan-500/30 rounded-lg p-4 bg-[#0f172a]/60 flex flex-col items-center gap-3 relative overflow-hidden">
    <div className="flex items-center justify-between w-full">
      <Icon className="h-6 w-6 text-cyan-400" />
      <div className="flex flex-col items-end">
        <span dir="rtl" className="font-arabic text-sm text-white font-bold">{titleAr}</span>
        <span className="text-xs text-cyan-100/70">{titleEn}</span>
      </div>
    </div>
    
    <div className="flex items-center gap-2 mt-2">
      <span dir="rtl" className="font-arabic text-xs text-cyan-300">{active ? 'مفعل' : 'غير مفعل'}</span>
      <div className={`w-8 h-4 rounded-full p-0.5 ${active ? 'bg-cyan-500/50' : 'bg-gray-600'}`}>
        <div className={`w-3 h-3 rounded-full bg-white transition-all ${active ? 'ml-auto' : ''}`} />
      </div>
    </div>

    <div className="w-full mt-2">
      <div className="flex justify-between text-[10px] text-cyan-200 mb-1">
        <span dir="rtl" className="font-arabic">{levelAr}</span>
        <span>{level} ({percentage}%)</span>
      </div>
      <div className="h-1.5 w-full bg-[#050a0f] rounded-full overflow-hidden">
        <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${percentage}%` }} />
      </div>
    </div>

    <button className="mt-2 text-[10px] text-cyan-400 border border-cyan-500/50 rounded-full px-4 py-1 hover:bg-cyan-500/10 transition-colors">
      التفاصيل - Details
    </button>
  </div>
);

export default function SkillLibrary() {
  const [searchQuery, setSearchQuery] = useState("");

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

      {/* Header & Search */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 bg-[#0f172a] border border-cyan-500/30 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(0,255,255,0.2)]">
            <svg viewBox="0 0 24 24" className="h-8 w-8 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 9.79086 12 9.79086C9.79086 9.79086 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 2V6" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 18V22" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4.92993 4.92993L7.75993 7.75993" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16.24 16.24L19.07 19.07" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12H6" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18 12H22" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4.92993 19.07L7.75993 16.24" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16.24 7.75993L19.07 4.92993" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-white tracking-wide">OpenClaw</h1>
            <div className="flex items-center gap-2 text-sm text-cyan-400/80">
              <span dir="rtl" className="font-arabic">مكتبة المهارات والقدرات</span>
              <span>Skills & Capabilities Library</span>
            </div>
          </div>
        </div>

        <div className="relative w-96">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث عن المهارات... / Search Skills..."
            className="w-full bg-[#0f172a]/80 border border-cyan-500/50 rounded-full py-2 px-4 pr-10 text-sm text-white outline-none focus:border-cyan-400"
            dir="rtl"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0 relative z-10 overflow-y-auto custom-scrollbar pb-4">
        
        {/* Left Area: Skill Categories */}
        <div className="col-span-12 lg:col-span-9 flex flex-col gap-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Linguistic Skills */}
            <GlassCard className="p-4 bg-[#0a1118]/90 border-cyan-500/20" glowColor="rgba(0, 255, 255, 0.05)">
              <div className="border-b border-cyan-500/20 pb-2 mb-4 text-center">
                <h3 className="text-sm font-bold text-cyan-300">
                  Linguistic Skills - <span dir="rtl" className="font-arabic">المهارات اللغوية</span>
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <SkillCard titleEn="Translation" titleAr="الترجمة" icon={Globe} active={true} level="Advanced" levelAr="متقدم" percentage={90} />
                <SkillCard titleEn="Summarization" titleAr="التلخيص" icon={FileText} active={true} level="Intermediate" levelAr="متوسط" percentage={75} />
              </div>
            </GlassCard>

            {/* Technical Skills */}
            <GlassCard className="p-4 bg-[#0a1118]/90 border-cyan-500/20" glowColor="rgba(0, 255, 255, 0.05)">
              <div className="border-b border-cyan-500/20 pb-2 mb-4 text-center">
                <h3 className="text-sm font-bold text-cyan-300">
                  Technical Skills - <span dir="rtl" className="font-arabic">المهارات التقنية</span>
                </h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <SkillCard titleEn="Code Execution" titleAr="تنفيذ الكود" icon={Code2} active={true} level="High" levelAr="عالي" percentage={88} />
                <SkillCard titleEn="SQL Querying" titleAr="استعلام SQL" icon={Database} active={true} level="Advanced" levelAr="متقدم" percentage={92} />
                <SkillCard titleEn="File Analysis" titleAr="تحليل الملفات" icon={FileSearch} active={true} level="Good" levelAr="جيد" percentage={70} />
              </div>
            </GlassCard>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* External Integrations */}
            <GlassCard className="p-4 bg-[#0a1118]/90 border-cyan-500/20" glowColor="rgba(0, 255, 255, 0.05)">
              <div className="border-b border-cyan-500/20 pb-2 mb-4 text-center">
                <h3 className="text-sm font-bold text-cyan-300">
                  External Integrations - <span dir="rtl" className="font-arabic">التكاملات الخارجية</span>
                </h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <SkillCard titleEn="Web Search" titleAr="بحث الويب" icon={Globe} active={true} level="Connected" levelAr="مستمر" percentage={100} />
                <SkillCard titleEn="GitHub Sync" titleAr="مزامنة GitHub" icon={Github} active={true} level="Active" levelAr="نشط" percentage={100} />
                <SkillCard titleEn="API Calling" titleAr="استدعاء API" icon={Cloud} active={false} level="Disabled" levelAr="معطل" percentage={0} />
              </div>
            </GlassCard>

            {/* Cognitive Skills */}
            <GlassCard className="p-4 bg-[#0a1118]/90 border-cyan-500/20" glowColor="rgba(0, 255, 255, 0.05)">
              <div className="border-b border-cyan-500/20 pb-2 mb-4 text-center">
                <h3 className="text-sm font-bold text-cyan-300">
                  Cognitive Skills - <span dir="rtl" className="font-arabic">المهارات المعرفية</span>
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <SkillCard titleEn="Long-term Memory" titleAr="الذاكرة طويلة الأمد" icon={Brain} active={true} level="High" levelAr="عالي" percentage={85} />
                <SkillCard titleEn="Logical Reasoning" titleAr="الاستدلال المنطقي" icon={Puzzle} active={true} level="Advanced" levelAr="متقدم" percentage={94} />
              </div>
            </GlassCard>
          </div>

        </div>

        {/* Right Area: Radar Chart */}
        <div className="col-span-12 lg:col-span-3">
          <GlassCard className="h-full p-4 bg-[#0a1118]/90 border-cyan-500/20 flex flex-col items-center" glowColor="rgba(0, 255, 255, 0.05)">
            <div className="border-b border-cyan-500/20 pb-2 mb-8 w-full text-center">
              <h3 className="text-sm font-bold text-cyan-300">
                Skill Distribution - <span dir="rtl" className="font-arabic">توزيع المهارات</span>
              </h3>
            </div>
            
            {/* Simple CSS Radar Chart representation */}
            <div className="relative w-48 h-48 mt-4">
              {/* Hexagon background */}
              <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0">
                <polygon points="50 5, 90 25, 90 75, 50 95, 10 75, 10 25" fill="none" stroke="rgba(0, 255, 255, 0.2)" strokeWidth="1" />
                <polygon points="50 20, 76 33, 76 66, 50 80, 24 66, 24 33" fill="none" stroke="rgba(0, 255, 255, 0.2)" strokeWidth="1" />
                <polygon points="50 35, 63 41, 63 58, 50 65, 37 58, 37 41" fill="none" stroke="rgba(0, 255, 255, 0.2)" strokeWidth="1" />
                
                {/* Axes */}
                <line x1="50" y1="50" x2="50" y2="5" stroke="rgba(0, 255, 255, 0.2)" strokeWidth="1" />
                <line x1="50" y1="50" x2="90" y2="25" stroke="rgba(0, 255, 255, 0.2)" strokeWidth="1" />
                <line x1="50" y1="50" x2="90" y2="75" stroke="rgba(0, 255, 255, 0.2)" strokeWidth="1" />
                <line x1="50" y1="50" x2="50" y2="95" stroke="rgba(0, 255, 255, 0.2)" strokeWidth="1" />
                <line x1="50" y1="50" x2="10" y2="75" stroke="rgba(0, 255, 255, 0.2)" strokeWidth="1" />
                <line x1="50" y1="50" x2="10" y2="25" stroke="rgba(0, 255, 255, 0.2)" strokeWidth="1" />

                {/* Data Polygon */}
                <polygon points="50 15, 85 30, 80 70, 50 85, 20 60, 25 20" fill="rgba(0, 255, 255, 0.2)" stroke="rgba(0, 255, 255, 0.8)" strokeWidth="2" />
                
                {/* Data Points */}
                <circle cx="50" cy="15" r="2" fill="#fff" />
                <circle cx="85" cy="30" r="2" fill="#fff" />
                <circle cx="80" cy="70" r="2" fill="#fff" />
                <circle cx="50" cy="85" r="2" fill="#fff" />
                <circle cx="20" cy="60" r="2" fill="#fff" />
                <circle cx="25" cy="20" r="2" fill="#fff" />
              </svg>
              
              {/* Labels */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-cyan-200 text-center">
                <span dir="rtl" className="font-arabic block">العمل</span>
                Linguistic
              </div>
              <div className="absolute top-4 -right-8 text-[10px] text-cyan-200 text-center">
                Technical
              </div>
              <div className="absolute bottom-4 -right-10 text-[10px] text-cyan-200 text-center">
                Integrations
              </div>
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] text-cyan-200 text-center">
                <span dir="rtl" className="font-arabic block">العمل</span>
                Technical
              </div>
              <div className="absolute bottom-4 -left-10 text-[10px] text-cyan-200 text-center">
                Integrations
              </div>
              <div className="absolute top-4 -left-8 text-[10px] text-cyan-200 text-center">
                Cognitive
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
