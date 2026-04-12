import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  Cpu, 
  Link2, 
  Database, 
  Github, 
  Cloud, 
  Eye, 
  EyeOff,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default function ConfigCenter() {
  const [showKeys, setShowKeys] = React.useState(false);

  const configSections = [
    {
      title: "مركز الاتصال",
      icon: Link2,
      items: [
        { label: "عنوان IP لاتصال Ollama", value: "192.168.1.100", type: "input" },
        { label: "المنفذ", value: "11434", type: "input" }
      ],
      action: "اختبار الاتصال"
    },
    {
      title: "خدمات API",
      icon: Shield,
      items: [
        { label: "مفتاح Gemini API", value: "••••••••••••••••", type: "password" },
        { label: "مفتاح OpenAI API", value: "••••••••••••••••", type: "password" }
      ],
      action: "تحقق"
    },
    {
      title: "تكامل Git",
      icon: Github,
      items: [
        { label: "رمز GitHub", value: "ghp_••••••••", type: "password" }
      ],
      action: "اتصال"
    },
    {
      title: "التخزين السحابي",
      icon: Cloud,
      items: [
        { label: "معرف عميل Google Drive", value: "••••••••", type: "input" }
      ],
      action: "تفويض"
    }
  ];

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto no-scrollbar pb-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold tracking-tighter neon-glow">مركز التكوين النهائي</h3>
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-3 py-1">
          <CheckCircle2 className="ml-2 h-3 w-3" /> حالة النظام: جميع الوحدات تعمل
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {configSections.map((section, idx) => (
          <GlassCard key={idx} className="p-4 flex flex-col gap-4" glowColor="rgba(0, 255, 255, 0.05)">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <section.icon className="h-4 w-4 text-cyan-400" />
              </div>
              <h4 className="font-bold text-sm tracking-tight">{section.title.toUpperCase()}</h4>
            </div>
            
            <div className="space-y-4 flex-1">
              {section.items.map((item, i) => (
                <div key={i} className="space-y-1.5">
                  <label className="text-[10px] font-mono text-white/40 uppercase">{item.label}</label>
                  <div className="relative">
                    <Input 
                      type={item.type === "password" && !showKeys ? "password" : "text"} 
                      defaultValue={item.value}
                      className="bg-white/5 border-white/10 h-8 text-xs focus:border-cyan-500/50"
                    />
                    {item.type === "password" && (
                      <button 
                        onClick={() => setShowKeys(!showKeys)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-white/20 hover:text-cyan-400"
                      >
                        {showKeys ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Button variant="outline" size="sm" className="w-full border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 mt-2">
              {section.action}
            </Button>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard className="p-5" glowColor="rgba(139, 92, 246, 0.1)">
          <div className="flex items-center gap-3 mb-4">
            <Cpu className="h-5 w-5 text-purple-400" />
            <h4 className="font-bold tracking-tight text-sm">تسريع الأجهزة</h4>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">تحسين وحدة الرسوميات (GPU)</p>
                <p className="text-xs text-white/40">اختر وحدة المعالجة الأساسية</p>
              </div>
              <Badge variant="outline" className="border-purple-500/30 text-purple-400">NVIDIA A100 (GPU)</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">استخدام أنوية CUDA</p>
                <p className="text-xs text-white/40">تخصيص ديناميكي بناءً على الحمل</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">وضع الأداء الأقصى</p>
                <p className="text-xs text-white/40">يتجاوز بروتوكولات توفير الطاقة</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5" glowColor="rgba(0, 255, 255, 0.1)">
          <div className="flex items-center gap-3 mb-4">
            <Database className="h-5 w-5 text-cyan-400" />
            <h4 className="font-bold tracking-tight text-sm">تحسين الذاكرة</h4>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">مسح تلقائي للتخزين المؤقت</p>
                <p className="text-xs text-white/40">مسح المسارات العصبية المؤقتة</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">التخصيص الديناميكي</p>
                <p className="text-xs text-white/40">إدارة الذاكرة في الوقت الفعلي</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">جمع المهملات</p>
                <p className="text-xs text-white/40">استعادة الموارد بشكل هجومي</p>
              </div>
              <Switch />
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="mt-auto flex justify-center">
        <Button className="bg-cyan-500 text-black hover:bg-cyan-400 px-10 h-11 text-sm font-bold tracking-widest shadow-[0_0_15px_rgba(0,255,255,0.3)]">
          FINAL DEPLOY | النشر النهائي
        </Button>
      </div>
    </div>
  );
}
