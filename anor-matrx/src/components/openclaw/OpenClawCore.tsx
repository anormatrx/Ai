import React, { useState, useEffect, useCallback } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { motion } from "framer-motion";
import { 
  Activity, 
  Cloud, 
  Settings, 
  Server, 
  Terminal as TerminalIcon,
  CheckCircle2,
  BrainCircuit,
  Wrench,
  Zap,
  AlertCircle,
  Loader2
} from "lucide-react";
import { getSystemStatus, getActivityLogs } from "@/lib/systemApi";
import { openclawService, type EngineStatus, type ModelRegistration, type ThoughtStep, type LiveLog, type ModelFilter } from "@/lib/openclawIntegrationService";

type ServiceStatus = {
  ok: boolean;
  message: string;
  latencyMs?: number;
  models?: string[];
};

interface LoadingState {
  engine: boolean;
  models: boolean;
  logs: boolean;
  thoughts: boolean;
}

export default function OpenClawCore() {
  const [loading, setLoading] = useState<LoadingState>({
    engine: true,
    models: true,
    logs: true,
    thoughts: true
  });
  
  const [error, setError] = useState<string | null>(null);
  
  const [engineStatus, setEngineStatus] = useState<EngineStatus | null>(null);
  const [models, setModels] = useState<ModelRegistration[]>([]);
  const [logs, setLogs] = useState<LiveLog[]>([]);
  const [thoughts, setThoughts] = useState<ThoughtStep[]>([]);
  
  const [deployingModel, setDeployingModel] = useState<string | null>(null);
  const [modelFilter, setModelFilter] = useState<ModelFilter>('all');

  const loadEngineStatus = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, engine: true }));
      const status = await openclawService.getEngineStatus();
      setEngineStatus(status);
    } catch (e) {
      setError('Failed to connect to OpenClaw');
    } finally {
      setLoading(prev => ({ ...prev, engine: false }));
    }
  }, []);

  const loadModels = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, models: true }));
      console.log('[UI] Active filter:', modelFilter);
      const registeredModels = await openclawService.getRegisteredModels(modelFilter);
      console.log('[UI] Loaded models count:', registeredModels.length);
      setModels(registeredModels);
    } catch (e) {
      console.error('Failed to load models:', e);
    } finally {
      setLoading(prev => ({ ...prev, models: false }));
    }
  }, [modelFilter]);

  const loadLogs = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, logs: true }));
      const liveLogs = await openclawService.getLiveLogs();
      setLogs(liveLogs);
    } catch (e) {
      console.error('Failed to load logs:', e);
    } finally {
      setLoading(prev => ({ ...prev, logs: false }));
    }
  }, []);

  const loadThoughts = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, thoughts: true }));
      const thoughtSteps = await openclawService.getThoughtProcess();
      setThoughts(thoughtSteps);
    } catch (e) {
      console.error('Failed to load thoughts:', e);
    } finally {
      setLoading(prev => ({ ...prev, thoughts: false }));
    }
  }, []);

  const loadAllData = useCallback(async () => {
    await Promise.all([
      loadEngineStatus(),
      loadModels(),
      loadLogs(),
      loadThoughts()
    ]);
  }, [loadEngineStatus, loadModels, loadLogs, loadThoughts]);

  useEffect(() => {
    loadAllData();
    
    const interval = setInterval(loadAllData, 15000);
    return () => {
      clearInterval(interval);
      openclawService.stopPolling();
    };
  }, [loadAllData]);

  const handleDeploy = async (modelName: string) => {
    setDeployingModel(modelName);
    try {
      const result = await openclawService.deployModel(modelName);
      if (result.success) {
        await loadLogs();
        await loadThoughts();
      } else {
        setError(result.message);
      }
    } catch (e) {
      setError('Deployment failed');
    } finally {
      setDeployingModel(null);
    }
  };

  const formatTimestamp = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleTimeString('en-US', { hour12: false });
  };

  const formatSize = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    if (gb >= 1) return `${gb.toFixed(1)} GB`;
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(0)} MB`;
  };

  const isOllamaConnected = engineStatus?.services?.ollama?.ok || false;

  return (
    <div className="flex h-full flex-col gap-6 bg-[#050a0f] text-white p-6 font-sans overflow-y-auto no-scrollbar" dir="ltr">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center">
            <BrainCircuit className="h-5 w-5 text-cyan-400" />
          </div>
          <h2 className="text-2xl font-bold text-cyan-400 tracking-wide neon-glow">
            OpenClaw Agent Core Integration <span className="text-white/50 mx-2">/</span> <span dir="rtl">تكامل نواة وكيل أوبن كلاو</span>
          </h2>
        </div>
        <div className="flex items-center gap-6 text-sm text-cyan-400/70">
          <span className="hover:text-cyan-400 cursor-pointer transition-colors">Dashboard <span dir="rtl" className="ml-1">لوحة التحكم</span></span>
          <span className="hover:text-cyan-400 cursor-pointer transition-colors">Settings <span dir="rtl" className="ml-1">الإعدادات</span></span>
          <span className="hover:text-cyan-400 cursor-pointer transition-colors">Logs <span dir="rtl" className="ml-1">السجلات</span></span>
          <span className="hover:text-cyan-400 cursor-pointer transition-colors">Profile <span dir="rtl" className="ml-1">الملف الشخصي</span></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Engine Status */}
          <div>
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              Engine Status <span className="text-white/50">/</span> <span dir="rtl">حالة المحرك</span>
            </h3>
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-green-900/40 to-cyan-900/40 border border-green-500/50 p-4 flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.15)]">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay"></div>
              <div className="flex items-center gap-4 z-10">
                {loading.engine ? (
                  <div className="flex items-center gap-2 text-cyan-400">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Connecting...</span>
                  </div>
                ) : isOllamaConnected ? (
                  <>
                    <h2 className="text-3xl font-bold text-green-400 tracking-wider drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]">
                      OpenClaw Active <span className="text-white/50 mx-2">/</span> <span dir="rtl">أوبن كلاو نشط</span>
                    </h2>
                    <div className="flex items-center gap-1 h-12 ml-8">
                      {[...Array(20)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-1.5 bg-green-400 rounded-full"
                          animate={{ height: ["20%", "100%", "20%"] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1, ease: "easeInOut" }}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-red-400 tracking-wider">
                      OpenClaw Inactive <span className="text-white/50 mx-2">/</span> <span dir="rtl">غير نشط</span>
                    </h2>
                    <AlertCircle className="h-6 w-6 text-red-400" />
                  </>
                )}
              </div>
              {engineStatus?.lastConnection && (
                <div className="absolute bottom-2 left-4 text-[10px] text-white/50">
                  Last connection: {formatTimestamp(engineStatus.lastConnection)}
                </div>
              )}
            </div>
            {error && (
              <div className="mt-2 flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
          </div>

          {/* Model Bridge */}
          <div>
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              Model Bridge <span className="text-white/50">/</span> <span dir="rtl">جسر النموذج</span>
            </h3>
            <GlassCard className="p-8 border-cyan-500/20 relative min-h-[300px] flex items-center" glowColor="rgba(0, 255, 255, 0.05)">
              
              {/* Core Node */}
              <div className="absolute left-8 top-1/2 -translate-y-1/2 z-10">
                <div className="bg-[#0a1520] border border-cyan-500/50 rounded-xl p-4 flex items-center gap-3 shadow-[0_0_20px_rgba(0,255,255,0.2)]">
                  <BrainCircuit className="h-8 w-8 text-cyan-400" />
                  <div>
                    <h4 className="font-bold text-white">OpenClaw Core</h4>
                    <p className="text-xs text-cyan-400/80" dir="rtl">نواة أوبن كلاو {engineStatus?.version}</p>
                  </div>
                </div>
              </div>

              {/* Connection Lines (SVG) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                <path d="M 200 150 C 300 150, 300 60, 400 60" fill="none" stroke="rgba(34,197,94,0.5)" strokeWidth="3" className="animate-pulse" />
                <path d="M 200 150 C 300 150, 300 150, 400 150" fill="none" stroke="rgba(168,85,247,0.5)" strokeWidth="3" className="animate-pulse" />
                <path d="M 200 150 C 300 150, 300 240, 400 240" fill="none" stroke="rgba(34,197,94,0.5)" strokeWidth="3" className="animate-pulse" />
                
                {/* Animated dots on lines */}
                <circle r="3" fill="#4ade80">
                  <animateMotion dur="2s" repeatCount="indefinite" path="M 200 150 C 300 150, 300 60, 400 60" />
                </circle>
                <circle r="3" fill="#c084fc">
                  <animateMotion dur="2.5s" repeatCount="indefinite" path="M 200 150 C 300 150, 300 150, 400 150" />
                </circle>
                <circle r="3" fill="#4ade80">
                  <animateMotion dur="1.8s" repeatCount="indefinite" path="M 200 150 C 300 150, 300 240, 400 240" />
                </circle>
              </svg>

              {/* Target Nodes */}
              <div className="absolute right-8 top-0 bottom-0 flex flex-col justify-between py-6 z-10 w-[280px]">
                
                {/* HuggingFace */}
                <div className="bg-[#0a1520] border border-green-500/30 rounded-xl p-3 flex items-center gap-3">
                  <div className="h-10 w-10 bg-yellow-400/20 rounded-lg flex items-center justify-center text-2xl">🤗</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm text-white flex justify-between">
                      HuggingFace (Cloud) <span className="text-xs text-white/50" dir="rtl">(سحابي)</span>
                    </h4>
                    <p className={`text-[10px] flex items-center gap-1 mt-1 ${engineStatus?.services?.openai?.ok ? 'text-green-400' : 'text-yellow-400'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${engineStatus?.services?.openai?.ok ? 'bg-green-400' : 'bg-yellow-400'}`}></span> 
                      {engineStatus?.services?.openai?.ok ? 'Connected / متصل' : 'Not configured'}
                    </p>
                  </div>
                  <Cloud className={`h-5 w-5 ${engineStatus?.services?.openai?.ok ? 'text-green-400/50' : 'text-yellow-400/50'}`} />
                </div>

                {/* Custom API */}
                <div className="bg-[#0a1520] border border-purple-500/30 rounded-xl p-3 flex items-center gap-3">
                  <div className="h-10 w-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Settings className="h-6 w-6 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm text-white flex justify-between">
                      Custom API Endpoints
                    </h4>
                    <p className="text-[10px] text-white/50" dir="rtl">نقاط نهاية API مخصصة</p>
                    <p className={`text-[10px] flex items-center gap-1 mt-1 ${engineStatus?.services?.gemini?.ok ? 'text-purple-400' : 'text-white/50'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${engineStatus?.services?.gemini?.ok ? 'bg-purple-400' : 'bg-white/50'}`}></span> 
                      {engineStatus?.services?.gemini?.ok ? 'Configured / مكون' : 'Not configured'}
                    </p>
                  </div>
                </div>

                {/* Ollama */}
                <div className="bg-[#0a1520] border border-green-500/30 rounded-xl p-3 flex items-center gap-3">
                  <div className="h-10 w-10 bg-white/10 rounded-lg flex items-center justify-center">
                    <Server className={`h-6 w-6 ${isOllamaConnected ? 'text-green-400' : 'text-red-400'}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm text-white flex justify-between">
                      Ollama (Local) <span className="text-xs text-white/50" dir="rtl">(محلي)</span>
                    </h4>
                    <p className={`text-[10px] flex items-center gap-1 mt-1 ${isOllamaConnected ? 'text-green-400' : 'text-red-400'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${isOllamaConnected ? 'bg-green-400' : 'bg-red-400'}`}></span> 
                      {isOllamaConnected ? 'Online / متصل' : (engineStatus?.services?.ollama?.message || 'Offline')}
                    </p>
                    {isOllamaConnected && engineStatus?.services?.ollama && (
                      <>
                        <div className="mt-2 flex items-center justify-between text-[8px] text-white/40">
                          <span>Latency: {engineStatus.services.ollama.latencyMs || 0}ms</span>
                        </div>
                        <div className="h-1 w-full bg-white/10 rounded-full mt-1 overflow-hidden">
                          <div className="h-full bg-green-400 w-full"></div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

              </div>
            </GlassCard>
          </div>

          {/* Automatic Registration */}
          <div>
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              Automatic Registration <span className="text-white/50">/</span> <span dir="rtl">التسجيل التلقائي</span>
            </h3>
            <p className="text-xs text-white/50 mb-4">Detected models from the Ollama IP</p>
            
            {/* Filter Buttons */}
            <div className="flex gap-2 mb-4">
              {[
                { key: 'all', label: 'All', labelAr: 'الكل' },
                { key: 'compatible', label: '✅ Compatible', labelAr: 'متوافق' },
                { key: 'recommended', label: '⭐ Recommended', labelAr: 'موصى' },
                { key: 'coding', label: '💻 Coding', labelAr: 'كود' },
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setModelFilter(filter.key as ModelFilter)}
                  className={`px-3 py-1 rounded text-xs transition-colors ${
                    modelFilter === filter.key 
                      ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-400' 
                      : 'bg-white/5 border border-white/10 text-white/50 hover:text-white'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            
            <div className="bg-[#0a1520] border border-cyan-500/20 rounded-xl overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-cyan-900/20 text-cyan-400 text-xs uppercase border-b border-cyan-500/20">
                  <tr>
                    <th className="px-3 py-3">Model</th>
                    <th className="px-3 py-3">Provider</th>
                    <th className="px-3 py-3">Version</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Compatibility</th>
                    <th className="px-3 py-3">Recommended</th>
                    <th className="px-3 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyan-500/10">
                  {loading.models ? (
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="px-3 py-3 font-medium text-white/50" colSpan={7}>
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading models...
                        </div>
                      </td>
                    </tr>
                  ) : models.length === 0 ? (
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="px-3 py-3 font-medium text-white/50" colSpan={7}>
                        {isOllamaConnected ? 'No models found' : 'Ollama not connected'}
                      </td>
                    </tr>
                  ) : (
                    models.map((model, idx) => (
                      <tr key={idx} className="hover:bg-white/5 transition-colors">
                        <td className="px-3 py-3 font-medium">{model.name}</td>
                        <td className="px-3 py-3 text-white/70">{model.provider}</td>
                        <td className="px-3 py-3 text-white/70">{model.version}</td>
                        <td className="px-3 py-3 text-green-400">{model.status}</td>
                        <td className="px-3 py-3">
                          {model.compatibility === 'compatible' && (
                            <span className="text-green-400 text-xs">✅ متوافق</span>
                          )}
                          {model.compatibility === 'limited' && (
                            <span className="text-yellow-400 text-xs">⚠️ محدود</span>
                          )}
                          {model.compatibility === 'unsupported' && (
                            <span className="text-red-400 text-xs">❌ غير مدعوم</span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          {model.recommendedUse === 'general' && (
                            <span className="text-cyan-400 text-xs">عام</span>
                          )}
                          {model.recommendedUse === 'code' && (
                            <span className="text-purple-400 text-xs">💻 كود</span>
                          )}
                          {model.recommendedUse === 'cleanup' && (
                            <span className="text-orange-400 text-xs">🧹 تنظيف</span>
                          )}
                          {model.recommendedUse === 'none' && (
                            <span className="text-white/30 text-xs">-</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-right">
                          <button 
                            onClick={() => handleDeploy(model.name)}
                            disabled={deployingModel === model.name || model.compatibility !== 'compatible'}
                            className={`px-3 py-1 rounded border text-xs transition-colors ${
                              model.compatibility === 'compatible'
                                ? 'border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20'
                                : 'border-white/10 text-white/30 cursor-not-allowed'
                            } disabled:opacity-50`}
                          >
                            {deployingModel === model.name ? (
                              <span className="flex items-center gap-1">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Deploying...
                              </span>
                            ) : (
                              'Deploy'
                            )}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Terminal */}
          <div className="bg-[#02060a] border border-cyan-900 rounded-xl overflow-hidden flex flex-col h-[200px]">
            <div className="bg-cyan-950/50 px-4 py-2 flex items-center justify-between border-b border-cyan-900">
              <span className="text-xs text-cyan-400 font-mono flex items-center gap-2">
                <TerminalIcon className="h-3 w-3" /> Terminal
              </span>
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-cyan-700"></div>
                <div className="h-2.5 w-2.5 rounded-full bg-cyan-700"></div>
                <div className="h-2.5 w-2.5 rounded-full bg-cyan-700"></div>
              </div>
            </div>
            <div className="p-4 font-mono text-[10px] text-green-400/80 space-y-1 overflow-y-auto flex-1">
              {loading.logs ? (
                <div className="flex items-center gap-2 text-cyan-400">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Loading logs...
                </div>
              ) : logs.length > 0 ? (
                logs.map((log, i) => (
                  <div key={i}>
                    [{formatTimestamp(log.timestamp)}] {log.action} {log.service ? `[${log.service}]` : ''}: {log.message}
                  </div>
                ))
              ) : (
                <div className="text-white/50">No logs available</div>
              )}
              <div className="animate-pulse">_</div>
            </div>
          </div>

          {/* Thought Process */}
          <GlassCard className="p-6 border-cyan-500/20 flex-1 flex flex-col" glowColor="rgba(0, 255, 255, 0.05)">
            <h3 className="text-lg font-bold mb-1 flex items-center justify-between">
              Thought Process <span dir="rtl">عملية التفكير</span>
            </h3>
            <p className="text-[10px] text-white/50 mb-6">OpenClaw's internal chain-of-thought in real-time</p>
            
            <div className="relative flex-1">
              {/* Vertical Line */}
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-cyan-900/50"></div>

              {loading.thoughts ? (
                <div className="flex items-center gap-2 text-cyan-400 py-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading thoughts...
                </div>
              ) : thoughts.length > 0 ? (
                <div className="space-y-6 relative z-10">
                  {thoughts.map((step) => (
                    <div key={step.id} className="flex gap-4">
                      <div className={`mt-1 h-6 w-6 rounded-full bg-[#0a1520] border-2 flex items-center justify-center shrink-0 ${
                        step.status === 'completed' ? 'border-green-500' : step.status === 'in_progress' ? 'border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]' : 'border-cyan-900'
                      }`}>
                        {step.status === 'completed' ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : step.status === 'in_progress' ? (
                          <div className="h-2 w-2 rounded-full bg-cyan-400"></div>
                        ) : (
                          <div className="h-2 w-2 rounded-full bg-cyan-900"></div>
                        )}
                      </div>
                      <div>
                        <h4 className={`text-sm font-bold flex items-center gap-2 ${
                          step.status === 'completed' ? 'text-green-400' : step.status === 'in_progress' ? 'text-cyan-400' : 'text-white/60'
                        }`}>
                          {step.title} <span className="text-white/40">/</span> <span dir="rtl">{step.titleAr}</span>
                          {step.type === 'reasoning' && <BrainCircuit className="h-3 w-3" />}
                          {step.type === 'action' && <Zap className="h-3 w-3" />}
                        </h4>
                        <p className="text-[10px] text-white/70 mt-1">{step.description}</p>
                        <p className="text-[10px] text-white/50 mt-0.5" dir="rtl">{step.descriptionAr}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-white/50 text-sm py-4">No thought process data available</div>
              )}
            </div>

            {/* Live Log */}
            <div className="mt-6 bg-[#0a1520] border border-cyan-500/20 rounded-xl p-4">
              <h4 className="text-sm font-bold mb-2 flex items-center justify-between">
                Live Log <span dir="rtl">سجل مباشر</span>
              </h4>
              {logs.length > 0 ? (
                <div className="font-mono text-[10px] text-white/70 space-y-1 max-h-[100px] overflow-y-auto">
                  {logs.slice(0, 3).map((log, i) => (
                    <div key={i}>
                      <p>{log.message || log.action}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="font-mono text-[10px] text-white/50">
                  Waiting for events...
                </div>
              )}
            </div>

          </GlassCard>

        </div>
      </div>
    </div>
  );
}
