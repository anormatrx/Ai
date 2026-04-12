import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Cloud, Github, Server, Terminal, Database, Settings, Link as LinkIcon, Edit2, Plus } from "lucide-react";

export default function SystemConfig() {
  const [driveSync, setDriveSync] = useState(true);
  const [kaliEnv, setKaliEnv] = useState(false);

  return (
    <div className="flex h-full flex-col bg-[#0f172a] text-white p-4 font-sans overflow-hidden relative" dir="ltr">
      {/* Background Network Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-30" 
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='20' r='2' fill='%2306b6d4'/%3E%3Ccircle cx='80' cy='30' r='2' fill='%2306b6d4'/%3E%3Ccircle cx='40' cy='80' r='2' fill='%2306b6d4'/%3E%3Ccircle cx='70' cy='70' r='2' fill='%2306b6d4'/%3E%3Cpath d='M20 20L80 30L70 70L40 80Z' fill='none' stroke='%2306b6d4' stroke-width='0.5' opacity='0.5'/%3E%3Cpath d='M20 20L40 80' fill='none' stroke='%2306b6d4' stroke-width='0.5' opacity='0.5'/%3E%3Cpath d='M80 30L70 70' fill='none' stroke='%2306b6d4' stroke-width='0.5' opacity='0.5'/%3E%3C/svg%3E")`,
             backgroundSize: '150px 150px',
           }}
      />

      {/* Header */}
      <div className="flex flex-col items-center justify-center mb-6 relative z-10 text-center">
        <h1 className="text-lg font-bold text-white tracking-wide mb-1 flex items-center gap-2">
          Connectivity & System Config <span className="text-white/30">|</span> <span dir="rtl" className="font-arabic">إعدادات الاتصال والنظام</span>
        </h1>
        <p className="text-xs text-white/50">
          إعدادات اتصال النظام وتكامل السحابة لمنصة الذكاء الاصطناعي
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0 relative z-10 max-w-5xl mx-auto w-full overflow-y-auto no-scrollbar pb-4">
        
        {/* Left Column */}
        <div className="flex flex-col gap-4">
          
          {/* Cloud & Version Control */}
          <GlassCard className="p-4 bg-[#1e293b]/80 border-cyan-500/20" glowColor="rgba(0, 255, 255, 0.05)">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">Cloud & Version Control <span className="text-white/30">|</span> <span dir="rtl" className="font-arabic">التحكم في الإصدار والسحابة</span></h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-[#0f172a] p-3 rounded-lg border border-white/5">
                <div 
                  className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${driveSync ? 'bg-cyan-500' : 'bg-gray-600'}`}
                  onClick={() => setDriveSync(!driveSync)}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform flex items-center justify-center text-[8px] font-bold text-cyan-500 ${driveSync ? 'translate-x-6' : 'translate-x-0'}`}>
                    {driveSync ? 'On' : 'Off'}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span dir="rtl" className="font-arabic text-sm font-bold">مزامنة Google Drive</span>
                  <span className="text-xs text-white/50">Google Drive Sync</span>
                </div>
              </div>

              <div className="flex items-center justify-between bg-[#0f172a] p-3 rounded-lg border border-white/5">
                <button className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-lg text-xs transition-colors">
                  <span dir="rtl" className="font-arabic">ربط الحساب</span>
                  <LinkIcon className="h-3.5 w-3.5" />
                </button>
                <div className="flex flex-col items-end">
                  <span dir="rtl" className="font-arabic text-sm font-bold flex items-center gap-2">
                    رابط حساب GitHub <Github className="h-4 w-4" />
                  </span>
                  <span className="text-xs text-white/50">GitHub Account Link</span>
                  <span dir="rtl" className="font-arabic text-[10px] text-cyan-400 mt-1">متصل كـ 'user-ai-dev'</span>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Environment Setup */}
          <GlassCard className="p-6 bg-[#1e293b]/80 border-cyan-500/20 flex-1" glowColor="rgba(0, 255, 255, 0.05)">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">Environment Setup <span className="text-white/30">|</span> <span dir="rtl" className="font-arabic">إعداد البيئة</span></h3>
            </div>
            
            <div className="flex items-center justify-between bg-[#0f172a] p-4 rounded-lg border border-white/5 mb-4">
              <div 
                className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${kaliEnv ? 'bg-cyan-500' : 'bg-gray-600'}`}
                onClick={() => setKaliEnv(!kaliEnv)}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform flex items-center justify-center text-[8px] font-bold text-gray-600 ${kaliEnv ? 'translate-x-6' : 'translate-x-0'}`}>
                  {kaliEnv ? 'On' : 'Off'}
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span dir="rtl" className="font-arabic text-sm font-bold">تفعيل بيئة Linux/Kali</span>
                <span className="text-xs text-white/50">Enable Linux/Kali Environment</span>
              </div>
            </div>
            <p dir="rtl" className="font-arabic text-xs text-white/60 text-center">
              يمكنك تشغيل أدوات الأمان واختبار الاختراق مباشرة من النظام الأساسي.
              <br/>
              <span className="font-sans text-[10px]">Run security and penetration testing tools directly from the platform.</span>
            </p>
          </GlassCard>

        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-4">
          
          {/* Remote Servers */}
          <GlassCard className="p-4 bg-[#1e293b]/80 border-cyan-500/20" glowColor="rgba(0, 255, 255, 0.05)">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">Remote Servers <span className="text-white/30">|</span> <span dir="rtl" className="font-arabic">الخوادم عن بعد</span></h3>
            </div>
            
            <div className="text-center mb-4">
              <span dir="rtl" className="font-arabic text-sm font-bold">إضافة نقاط نهاية SSH/خادم النموذج</span>
            </div>

            <div className="space-y-3 mb-6">
              {/* Server 1 */}
              <div className="flex items-center justify-between bg-[#0f172a] p-3 rounded-lg border border-white/5">
                <div className="flex items-center gap-3">
                  <Server className="h-5 w-5 text-cyan-400" />
                  <div className="flex flex-col">
                    <span dir="rtl" className="font-arabic text-sm font-bold">خادم المعالجة الرئيسي</span>
                    <span className="text-[10px] text-white/50">Primary Compute Server (ssh://192.168.1.55)</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span dir="rtl" className="font-arabic text-[10px] bg-green-500/20 text-green-400 px-2 py-1 rounded">نشط</span>
                  <button className="text-white/50 hover:text-white transition-colors flex items-center gap-1 text-[10px] bg-white/5 px-2 py-1 rounded">
                    <Edit2 className="h-3 w-3" /> <span dir="rtl" className="font-arabic">تعديل</span>
                  </button>
                </div>
              </div>

              {/* Server 2 */}
              <div className="flex items-center justify-between bg-[#0f172a] p-3 rounded-lg border border-white/5">
                <div className="flex items-center gap-3">
                  <Server className="h-5 w-5 text-white/50" />
                  <div className="flex flex-col">
                    <span dir="rtl" className="font-arabic text-sm font-bold text-white/70">خادم الاستدلال السريع</span>
                    <span className="text-[10px] text-white/40">Fast Inference Server (model://api.ai-platform.com)</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span dir="rtl" className="font-arabic text-[10px] bg-red-500/20 text-red-400 px-2 py-1 rounded">غير نشط</span>
                  <button className="text-white/50 hover:text-white transition-colors flex items-center gap-1 text-[10px] bg-white/5 px-2 py-1 rounded">
                    <Edit2 className="h-3 w-3" /> <span dir="rtl" className="font-arabic">تعديل</span>
                  </button>
                </div>
              </div>
            </div>

            <button className="w-full py-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400 text-sm hover:bg-cyan-500/20 transition-colors flex items-center justify-center gap-2">
              <Plus className="h-4 w-4" /> <span dir="rtl" className="font-arabic">إضافة نقطة نهاية جديدة</span>
            </button>
          </GlassCard>

          {/* Long-Term Memory */}
          <GlassCard className="p-6 bg-[#1e293b]/80 border-cyan-500/20 flex-1 flex flex-col" glowColor="rgba(0, 255, 255, 0.05)">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">Long-Term Memory <span className="text-white/30">|</span> <span dir="rtl" className="font-arabic">الذاكرة طويلة المدى</span></h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-4 flex-1">
              <div className="bg-[#0f172a] rounded-lg border border-white/5 p-3 flex flex-col items-center justify-center gap-1.5">
                <span className="text-xl font-bold text-cyan-400">1245</span>
                <span dir="rtl" className="font-arabic text-[10px] text-white/70 text-center">الإجراءات: 1245<br/><span className="font-sans text-[8px]">Actions: 1245</span></span>
                <Database className="h-5 w-5 text-cyan-400/50 mt-1" />
              </div>
              <div className="bg-[#0f172a] rounded-lg border border-white/5 p-3 flex flex-col items-center justify-center gap-1.5">
                <span className="text-xl font-bold text-white">89</span>
                <span dir="rtl" className="font-arabic text-[10px] text-white/70 text-center">التفضيلات: 89<br/><span className="font-sans text-[8px]">Prefs: 89</span></span>
                <Settings className="h-5 w-5 text-white/50 mt-1" />
              </div>
            </div>

            <button className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-white text-sm transition-colors">
              <span dir="rtl" className="font-arabic">عرض وإدارة الذاكرة</span>
            </button>
          </GlassCard>

        </div>
      </div>

      {/* Bottom Actions */}
      <div className="mt-6 flex justify-center gap-4 relative z-10">
        <button className="px-8 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-white text-sm transition-colors">
          <span dir="rtl" className="font-arabic">حفظ التغييرات</span>
        </button>
        <button className="px-8 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors">
          <span dir="rtl" className="font-arabic">إلغاء</span>
        </button>
      </div>

    </div>
  );
}
