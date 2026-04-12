import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Settings2, Volume2, Type, Activity, Eye, Play } from "lucide-react";

export default function FxSetup() {
  const [theme, setTheme] = useState("Cyan");
  const [glowIntensity, setGlowIntensity] = useState(true);
  const [muteAll, setMuteAll] = useState(false);
  const [font, setFont] = useState("Modern Sans");
  const [smoothness, setSmoothness] = useState("High");
  const [quality, setQuality] = useState("Ultra");

  return (
    <div className="flex h-full flex-col bg-[#0f111a] text-white p-4 font-sans overflow-hidden relative" dir="ltr">
      {/* Background Gradient */}
      <div className="absolute inset-0 pointer-events-none" 
           style={{
             background: 'radial-gradient(circle at 50% 0%, rgba(0, 255, 255, 0.05) 0%, transparent 50%), radial-gradient(circle at 50% 100%, rgba(168, 85, 247, 0.05) 0%, transparent 50%)',
           }}
      />

      {/* Header */}
      <div className="flex flex-col items-center justify-center mb-6 relative z-10 text-center">
        <h1 className="text-lg font-bold text-white tracking-wide mb-1">
          FX & UI Customization Lab | <span dir="rtl" className="font-arabic">معمل تخصيص الواجهة والتأثيرات</span>
        </h1>
        <p className="text-xs text-white/50">
          Advanced UI/UX Customization Dashboard for an AI platform with live visual and audio effects tuning | <span dir="rtl" className="font-arabic">لوحة تحكم متقدمة لتخصيص واجهة المستخدم مع ضبط التأثيرات المرئية والصوتية</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0 relative z-10 max-w-5xl mx-auto w-full overflow-y-auto no-scrollbar pb-4">
        
        {/* Left Column */}
        <div className="flex flex-col gap-4">
          
          {/* Theme Controller */}
          <GlassCard className="p-4 bg-[#1a1d27]/80 border-cyan-500/20" glowColor="rgba(0, 255, 255, 0.05)">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">Theme Controller <span className="text-white/30">|</span> <span dir="rtl" className="font-arabic">متحكم السمة</span></h3>
            </div>
            
            <div className="text-center mb-4">
              <span className="text-xs text-white/70">Neon Accents | <span dir="rtl" className="font-arabic">لهجات النيون</span></span>
            </div>

            <div className="flex justify-center gap-6 mb-6">
              {/* Cyan */}
              <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => setTheme("Cyan")}>
                <div className={`w-14 h-14 rounded-full border-[3px] ${theme === 'Cyan' ? 'border-cyan-400' : 'border-[#2a2d37]'} flex items-center justify-center relative`}>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-300 to-cyan-700 shadow-[0_0_15px_rgba(0,255,255,0.5)]"></div>
                  {theme === 'Cyan' && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full border-2 border-cyan-400"></div>}
                </div>
                <span className="text-xs text-cyan-400">Cyan</span>
                <span dir="rtl" className="font-arabic text-[10px] text-cyan-400">سماوي</span>
              </div>
              
              {/* Magenta */}
              <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => setTheme("Magenta")}>
                <div className={`w-14 h-14 rounded-full border-[3px] ${theme === 'Magenta' ? 'border-fuchsia-400' : 'border-[#2a2d37]'} flex items-center justify-center relative`}>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fuchsia-300 to-fuchsia-700 shadow-[0_0_15px_rgba(217,70,239,0.5)]"></div>
                  {theme === 'Magenta' && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full border-2 border-fuchsia-400"></div>}
                </div>
                <span className="text-xs text-fuchsia-400">Magenta</span>
                <span dir="rtl" className="font-arabic text-[10px] text-fuchsia-400">قرمزي</span>
              </div>

              {/* Gold */}
              <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => setTheme("Gold")}>
                <div className={`w-14 h-14 rounded-full border-[3px] ${theme === 'Gold' ? 'border-yellow-400' : 'border-[#2a2d37]'} flex items-center justify-center relative`}>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-700 shadow-[0_0_15px_rgba(250,204,21,0.5)]"></div>
                  {theme === 'Gold' && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full border-2 border-yellow-400"></div>}
                </div>
                <span className="text-xs text-yellow-400">Gold</span>
                <span dir="rtl" className="font-arabic text-[10px] text-yellow-400">ذهبي</span>
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-white/10 pt-4">
              <span className="text-xs text-white/70">Glow Intensity | <span dir="rtl" className="font-arabic">كثافة التوهج</span></span>
              <div 
                className={`w-10 h-5 rounded-full p-0.5 cursor-pointer transition-colors ${glowIntensity ? 'bg-cyan-500' : 'bg-gray-600'}`}
                onClick={() => setGlowIntensity(!glowIntensity)}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${glowIntensity ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
            </div>
          </GlassCard>

          {/* Font Stylizer */}
          <GlassCard className="p-6 bg-[#1a1d27]/80 border-cyan-500/20 flex-1" glowColor="rgba(0, 255, 255, 0.05)">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">Font Stylizer <span className="text-white/30">|</span> <span dir="rtl" className="font-arabic">منسق الخطوط</span></h3>
            </div>
            
            <div className="space-y-3">
              {[
                { id: 'Modern Sans', ar: 'حديث' },
                { id: 'Arabic Calligraphy', ar: 'خط عربي' },
                { id: 'Geometric', ar: 'هندسي' },
                { id: 'Classic Serif', ar: 'سيريف كلاسيكي' }
              ].map(f => (
                <div key={f.id} className="flex items-center gap-3 cursor-pointer" onClick={() => setFont(f.id)}>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${font === f.id ? 'border-cyan-400' : 'border-white/30'}`}>
                    {font === f.id && <div className="w-2 h-2 rounded-full bg-cyan-400"></div>}
                  </div>
                  <span className={`text-sm ${font === f.id ? 'text-white' : 'text-white/70'}`}>{f.id} <span className="text-white/30">|</span> <span dir="rtl" className="font-arabic">{f.ar}</span></span>
                </div>
              ))}
            </div>
          </GlassCard>

        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          
          {/* Audio Mixer */}
          <GlassCard className="p-6 bg-[#1a1d27]/80 border-fuchsia-500/20" glowColor="rgba(217, 70, 239, 0.05)">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">Audio Mixer <span className="text-white/30">|</span> <span dir="rtl" className="font-arabic">خالط الصوت</span></h3>
            </div>
            
            <div className="text-center mb-6">
              <span className="text-xs text-white/70">UI Sound Effects | <span dir="rtl" className="font-arabic">مؤثرات واجهة المستخدم</span></span>
            </div>

            <div className="space-y-6 mb-8">
              {/* Sliders */}
              <div className="flex items-center gap-4">
                <span className="text-xs w-16">Click</span>
                <div className="flex-1 h-1.5 bg-white/10 rounded-full relative">
                  <div className="absolute left-0 top-0 h-full bg-cyan-400 rounded-full" style={{ width: '40%' }}></div>
                  <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_rgba(0,255,255,0.8)]" style={{ left: '40%' }}></div>
                </div>
                <span dir="rtl" className="font-arabic text-xs w-16 text-right">نقرة</span>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-xs w-16">Hover</span>
                <div className="flex-1 h-1.5 bg-white/10 rounded-full relative">
                  <div className="absolute left-0 top-0 h-full bg-fuchsia-400 rounded-full" style={{ width: '60%' }}></div>
                  <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_rgba(217,70,239,0.8)]" style={{ left: '60%' }}></div>
                </div>
                <span dir="rtl" className="font-arabic text-xs w-16 text-right">تحويم</span>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-xs w-16">Transition</span>
                <div className="flex-1 h-1.5 bg-white/10 rounded-full relative">
                  <div className="absolute left-0 top-0 h-full bg-fuchsia-400 rounded-full" style={{ width: '80%' }}></div>
                  <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_rgba(217,70,239,0.8)]" style={{ left: '80%' }}></div>
                </div>
                <span dir="rtl" className="font-arabic text-xs w-16 text-right">انتقال</span>
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-white/10 pt-4">
              <span className="text-xs text-white/70">Mute All | <span dir="rtl" className="font-arabic">كتم الكل</span></span>
              <div 
                className={`w-10 h-5 rounded-full p-0.5 cursor-pointer transition-colors ${muteAll ? 'bg-cyan-500' : 'bg-gray-600'}`}
                onClick={() => setMuteAll(!muteAll)}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${muteAll ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
            </div>
          </GlassCard>

          {/* Performance Settings */}
          <GlassCard className="p-6 bg-[#1a1d27]/80 border-white/10" glowColor="rgba(255, 255, 255, 0.02)">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">Performance Settings <span className="text-white/30">|</span> <span dir="rtl" className="font-arabic">إعدادات الأداء</span></h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs text-white/70 mb-3">
                  <span>Animation Smoothness</span>
                  <span dir="rtl" className="font-arabic">سلاسة الحركة</span>
                </div>
                <div className="flex bg-[#0f111a] rounded-full p-1 border border-white/10">
                  {['Low', 'Medium', 'High'].map(s => (
                    <button 
                      key={s}
                      onClick={() => setSmoothness(s)}
                      className={`flex-1 py-1 text-xs rounded-full transition-colors ${smoothness === s ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/80'}`}
                    >
                      {s} | <span dir="rtl" className="font-arabic">{s === 'Low' ? 'منخفض' : s === 'Medium' ? 'متوسط' : 'مرتفع'}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-white/70 mb-3">
                  <span>3D Rendering Quality</span>
                  <span dir="rtl" className="font-arabic">جودة العرض ثلاثي الأبعاد</span>
                </div>
                <div className="flex bg-[#0f111a] rounded-full p-1 border border-white/10">
                  {['Basic', 'Standard', 'Ultra'].map(q => (
                    <button 
                      key={q}
                      onClick={() => setQuality(q)}
                      className={`flex-1 py-1 text-xs rounded-full transition-colors ${quality === q ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/80'}`}
                    >
                      {q} | <span dir="rtl" className="font-arabic">{q === 'Basic' ? 'أساسي' : q === 'Standard' ? 'قياسي' : 'فائق'}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Real-time Preview */}
          <GlassCard className="p-6 bg-[#1a1d27]/80 border-fuchsia-500/20 flex-1 flex flex-col" glowColor="rgba(217, 70, 239, 0.05)">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">Real-time Preview <span className="text-white/30">|</span> <span dir="rtl" className="font-arabic">معاينة مباشرة</span></h3>
            </div>
            
            <div className="flex-1 flex items-center justify-between px-4">
              <button className="px-6 py-2 bg-transparent border border-cyan-400 rounded-lg text-cyan-400 text-sm hover:bg-cyan-400/10 transition-colors shadow-[0_0_15px_rgba(0,255,255,0.2)]">
                Test Button | <span dir="rtl" className="font-arabic">زر الاختبار</span>
              </button>
              
              <div className="flex flex-col gap-4 items-end">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-2 bg-cyan-400/30 rounded-full relative">
                    <div className="absolute left-0 top-0 h-full w-1/2 bg-cyan-400 rounded-full"></div>
                  </div>
                  <div className="w-10 h-5 rounded-full bg-cyan-500 p-0.5">
                    <div className="w-4 h-4 rounded-full bg-white translate-x-5" />
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400/20 to-fuchsia-400/20 border border-cyan-400/50"></div>
                </div>
                <div className="w-24 h-2 bg-fuchsia-400/30 rounded-full relative">
                  <div className="absolute left-0 top-0 h-full w-3/4 bg-fuchsia-400 rounded-full"></div>
                  <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_rgba(217,70,239,0.8)]" style={{ left: '75%' }}></div>
                </div>
              </div>
            </div>
          </GlassCard>

        </div>
      </div>
    </div>
  );
}
