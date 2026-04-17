import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMic, FiUpload, FiRepeat, FiSend, FiCpu, FiActivity, FiSettings } from 'react-icons/fi';
import ReactMarkdown from "react-markdown";
import { routerService } from "@/services/RouterService";
import { clientRuntime } from "@/config/client-runtime";
import { swarmExecute, getSwarmStatus } from "@/lib/systemApi";

const API_BASE = `http://${clientRuntime.ollama.host.split(':')[0]}:${clientRuntime.ports.backend}/api`;

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ThemeSettings {
  fontFamily: string;
  fontSize: number;
  textColor: string;
  bgColor: string;
  chatBgColor: string;
  userBubbleColor: string;
  assistantBubbleColor: string;
  theme: 'dark' | 'light';
}

const DEFAULT_THEME: ThemeSettings = {
  fontFamily: 'Cairo, sans-serif',
  fontSize: 16,
  textColor: '#f5f5f5',
  bgColor: '#050505',
  chatBgColor: '#0a0a0a',
  userBubbleColor: '#1d4ed8',
  assistantBubbleColor: '#111827',
  theme: 'dark',
};

const FONT_OPTIONS = [
  { value: 'Cairo, sans-serif', label: 'Cairo' },
  { value: 'Tajawal, sans-serif', label: 'Tajawal' },
  { value: 'Inter, sans-serif', label: 'Inter' },
  { value: 'IBM Plex Sans Arabic, sans-serif', label: 'IBM Plex Arabic' },
  { value: 'Noto Sans Arabic, sans-serif', label: 'Noto Arabic' },
  { value: 'system-ui, sans-serif', label: 'System UI' },
];

const FONT_SIZE_OPTIONS = [14, 16, 18, 20];

function loadTheme(): ThemeSettings {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  const saved = localStorage.getItem('chat-theme');
  if (saved) {
    try {
      return { ...DEFAULT_THEME, ...JSON.parse(saved) };
    } catch {
      return DEFAULT_THEME;
    }
  }
  return DEFAULT_THEME;
}

export default function ChatInterface() {
  const [isVoiceResponse, setIsVoiceResponse] = useState(false);
  const [selectedModel, setSelectedModel] = useState('auto');
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "مرحباً، أنا نظام **OpenClaw Core** (الإصدار 9.0).\n\nأنا لست مجرد واجهة دردشة، بل أنا **نظام تشغيل متكامل** قادر على:\n- إدارة الملفات والأوامر (Terminal).\n- تحليل المشاريع البرمجية وبنائها.\n- استخراج البيانات بصمت (WORM-AI).\n- التبديل الذكي بين النماذج السحابية والمحلية.\n\nكيف يمكنني مساعدتك اليوم؟" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [liveLog, setLiveLog] = useState<string | null>(null);
  const [systemStatus, setSystemStatus] = useState<{ text: string, color: string }>({ text: "IDLE", color: "gray" });
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isIdle, setIsIdle] = useState(true);
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setTheme] = useState<ThemeSettings>(loadTheme);
  const [cursorVisible, setCursorVisible] = useState(true);

  const resetIdleTimer = () => {
    setIsIdle(false);
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current);
    }
    idleTimeoutRef.current = setTimeout(() => {
      setIsIdle(true);
    }, 60000); // 60 seconds
  };

  useEffect(() => {
    resetIdleTimer();
    const events = ['mousemove', 'keydown', 'click', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetIdleTimer));
    
    return () => {
      events.forEach(event => window.removeEventListener(event, resetIdleTimer));
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, liveLog]);

  // Apply CSS variables when theme changes
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--chat-font-family', theme.fontFamily);
    root.style.setProperty('--chat-font-size', `${theme.fontSize}px`);
    root.style.setProperty('--chat-text-color', theme.textColor);
    root.style.setProperty('--chat-bg-color', theme.bgColor);
    root.style.setProperty('--chat-chat-bg', theme.chatBgColor);
    root.style.setProperty('--chat-user-bubble', theme.userBubbleColor);
    root.style.setProperty('--chat-assistant-bubble', theme.assistantBubbleColor);
    localStorage.setItem('chat-theme', JSON.stringify(theme));
  }, [theme]);

  // Cursor blink effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  const updateTheme = (updates: Partial<ThemeSettings>) => {
    setTheme((prev) => ({ ...prev, ...updates }));
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessageText = input;
    const userMessage: Message = { role: "user", content: userMessageText };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    
    // 1. إظهار رسالة "جاري التفكير..." في الواجهة
    setLiveLog("Thinking...");
    setIsTyping(true);
    setSystemStatus({ text: "PROCESSING", color: "orange" });

    try {
      setLiveLog("Sending to Swarm v4...");
      
      // Use Swarm v4 for intelligent orchestration
      const result = await swarmExecute(userMessageText, { model: selectedModel });
      
      // Extract response from Swarm result
      const assistantMessage = result?.result?.output?.response || 
                                result?.result?.output?.code ||
                                result?.result?.output ||
                                "Swarm executed successfully";
      
      // Show Swarm intelligence info
      const planInfo = result?.plan;
      if (planInfo) {
        const swarmInfo = `🧠 **Swarm v4 Intelligence**
- **Intent**: ${planInfo.intent}
- **Agent**: ${result.route}
- **Confidence**: ${(planInfo.confidence * 100).toFixed(0)}%
- **Source**: ${planInfo.source}
${result.decomposition ? `- **Subtasks**: ${result.decomposition.subtasks} (complexity: ${result.decomposition.complexity})` : ''}
${result.corrections > 0 ? `- **Self-corrections**: ${result.corrections}` : ''}`;
        
        setMessages((prev) => [...prev, { role: "system", content: swarmInfo }]);
      }
      
      // Initialize empty assistant message
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
      setIsTyping(false);
      setLiveLog("Typing...");
      
      // Typewriter effect
      const streamTextToUI = async (text: string) => {
        let current = "";
        const speed = 12; // ms per character
        
        for (const char of text) {
          current += char;
          setMessages((prev) => {
            const copy = [...prev];
            if (copy.length > 0) {
              copy[copy.length - 1] = {
                ...copy[copy.length - 1],
                content: current,
              };
            }
            return copy;
          });
          await new Promise((resolve) => setTimeout(resolve, speed));
        }
      };
      
      await streamTextToUI(assistantMessage);
      setLiveLog(null);
      setSystemStatus({ text: "ONLINE", color: "#0ea5e9" }); // cyan-500
    } catch (error: any) {
      setMessages((prev) => [...prev, { role: "assistant", content: error.message || "عذراً، حدث خطأ أثناء معالجة طلبك." }]);
      setSystemStatus({ text: "OFFLINE - Error", color: "red" });
    } finally {
      setIsTyping(false);
      setLiveLog(null);
    }
  };

  const panelVariants = {
    hidden: { opacity: 0, x: 50, rotateY: 15 },
    visible: { opacity: 1, x: 0, rotateY: 0, transition: { duration: 0.5, ease: "easeOut" as const } }
  };

  return (
    <div 
      className="h-full text-white selection:bg-cyan-500/30 overflow-hidden flex flex-col items-center justify-between p-4 relative chat-container" 
      dir="rtl"
      style={{ backgroundColor: 'var(--chat-bg-color)' }}
    >
      
      {/* 2. Main Chat Area - منطقة المحادثة */}
      <main className="flex-1 w-full max-w-4xl flex flex-col overflow-hidden py-4 relative z-10">
        <div 
          className="flex-1 overflow-y-auto pr-3 space-y-3 no-scrollbar chat-messages" 
          ref={scrollRef}
          style={{ backgroundColor: 'var(--chat-chat-bg)' }}
        >
          {messages.map((msg, idx) => (
            msg.role === "user" ? (
              <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex w-full justify-start">
                <div className="text-right text-slate-200 text-sm leading-relaxed max-w-2xl">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key={idx}
                initial="hidden" animate="visible" variants={panelVariants}
                className="flex w-full justify-end" dir="ltr"
              >
                <div className="text-left text-cyan-300 text-sm leading-relaxed prose prose-invert prose-sm max-w-3xl">
                  <ReactMarkdown>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </motion.div>
            )
          ))}
          
          {isTyping && (
            <motion.div 
              initial="hidden" animate="visible" variants={panelVariants}
              className="flex w-full justify-end" dir="ltr"
            >
              <div className="flex items-center h-10">
                <span className="animate-pulse text-cyan-400 text-2xl tracking-widest leading-none">...</span>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* 4. Controls - لوحة التحكم السفلى */}
      <footer className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-4 items-end pb-2 shrink-0 relative z-10">
        
        {/* Sidebar Actions */}
        <AnimatePresence>
          {isIdle && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="hidden lg:flex col-span-2 flex-col space-y-4"
            >
              {[
                { icon: <FiMic />, label: 'Voice / صوت' },
                { icon: <FiUpload />, label: 'Upload / رفع' },
                { icon: <FiSettings />, label: 'Settings / إعدادات', onClick: () => setShowSettings(!showSettings) }
              ].map((item, idx) => (
                <button 
                  key={idx} 
                  onClick={item.onClick}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-slate-800 hover:border-cyan-500/50 transition-all group"
                >
                  <span className="text-base text-slate-400 group-hover:text-cyan-400">{item.icon}</span>
                  <span className="text-[9px] text-slate-500 group-hover:text-slate-200">{item.label}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Bar */}
        <div className={`col-span-1 relative transition-all duration-500 ${isIdle ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
          <AnimatePresence>
            {liveLog && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 w-max"
              >
                <span className={`text-xs font-mono text-cyan-300 ${liveLog === 'Typing...' ? 'cursor-visible' : ''}`}>
                  {liveLog}
                  {liveLog === 'Typing...' && <span className="animate-pulse">|</span>}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="bg-black/60 border border-slate-700 rounded-2xl p-2 flex items-center shadow-inner group focus-within:border-cyan-500/50 transition-all gap-2">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-slate-900/80 border border-slate-700 text-cyan-400 text-[10px] font-mono rounded-xl px-2 py-2 outline-none focus:border-cyan-500/50 appearance-none cursor-pointer shrink-0"
              dir="ltr"
            >
              <option value="auto">🧠 Auto</option>
              <option value="gemini-3.1-pro-preview">✨ Gemini Pro</option>
              <option value="gemini-3-flash-preview">✨ Gemini Flash</option>
              <option value="gemma3">⚡ جيما لوكال</option>
              <option value="llama3">🦙 Llama 3</option>
              <option value="gpt-4">☁️ GPT-4</option>
            </select>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="اكتب رسالتك... / Type your message..." 
              className="bg-transparent flex-1 outline-none text-sm placeholder:text-slate-600 px-2"
            />
            <button 
              onClick={handleSend}
              className="p-2.5 bg-cyan-600/20 border border-cyan-500/30 rounded-xl text-cyan-400 hover:bg-cyan-500 hover:text-white transition-all shadow-[0_0_8px_rgba(6,182,212,0.2)] shrink-0"
            >
              <FiSend className="rotate-180 h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Metrics - المقاييس */}
        <AnimatePresence>
          {isIdle && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              className="hidden lg:block col-span-2 p-3 bg-black/60 border border-slate-800 rounded-xl font-mono text-[10px] space-y-1" dir="ltr"
            >
              <div className="flex justify-between text-yellow-500/80">
                <span>Latency:</span>
                <span>120ms</span>
              </div>
              <div className="flex justify-between text-green-500/80 border-t border-slate-800 pt-1">
                <span>Tokens/sec:</span>
                <span>45</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </footer>

      {/* Background Decor - زخرفة الخلفية */}
      <AnimatePresence>
        {isIdle && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none z-0"
          >
            <div className="absolute top-1/4 left-10 w-[1px] h-64 bg-gradient-to-b from-transparent via-cyan-500 to-transparent"></div>
            <div className="absolute bottom-1/4 right-20 w-96 h-96 bg-cyan-500/5 rounded-full blur-[100px]"></div>
          </motion.div>
        )}
      </AnimatePresence>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="fixed left-0 top-0 h-full w-80 bg-slate-900 border-l border-slate-700 z-50 overflow-y-auto p-4"
              dir="rtl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">إعدادات الواجهة</h2>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              {/* Font Family */}
              <div className="mb-4">
                <label className="block text-sm text-slate-400 mb-2">نوع الخط</label>
                <select
                  value={theme.fontFamily}
                  onChange={(e) => updateTheme({ fontFamily: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                >
                  {FONT_OPTIONS.map((font) => (
                    <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                      {font.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Font Size */}
              <div className="mb-4">
                <label className="block text-sm text-slate-400 mb-2">حجم الخط: {theme.fontSize}px</label>
                <input
                  type="range"
                  min="12"
                  max="24"
                  value={theme.fontSize}
                  onChange={(e) => updateTheme({ fontSize: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
              
              {/* Text Color */}
              <div className="mb-4">
                <label className="block text-sm text-slate-400 mb-2">لون الخط</label>
                <input
                  type="color"
                  value={theme.textColor}
                  onChange={(e) => updateTheme({ textColor: e.target.value })}
                  className="w-full h-10 rounded-lg cursor-pointer"
                />
              </div>
              
              {/* Background Color */}
              <div className="mb-4">
                <label className="block text-sm text-slate-400 mb-2">لون الخلفية</label>
                <input
                  type="color"
                  value={theme.bgColor}
                  onChange={(e) => updateTheme({ bgColor: e.target.value })}
                  className="w-full h-10 rounded-lg cursor-pointer"
                />
              </div>
              
              {/* Chat Background */}
              <div className="mb-4">
                <label className="block text-sm text-slate-400 mb-2">خلفية الشات</label>
                <input
                  type="color"
                  value={theme.chatBgColor}
                  onChange={(e) => updateTheme({ chatBgColor: e.target.value })}
                  className="w-full h-10 rounded-lg cursor-pointer"
                />
              </div>
              
              {/* User Bubble */}
              <div className="mb-4">
                <label className="block text-sm text-slate-400 mb-2">لون رسائل المستخدم</label>
                <input
                  type="color"
                  value={theme.userBubbleColor}
                  onChange={(e) => updateTheme({ userBubbleColor: e.target.value })}
                  className="w-full h-10 rounded-lg cursor-pointer"
                />
              </div>
              
              {/* Assistant Bubble */}
              <div className="mb-4">
                <label className="block text-sm text-slate-400 mb-2">لون رسائل المساعد</label>
                <input
                  type="color"
                  value={theme.assistantBubbleColor}
                  onChange={(e) => updateTheme({ assistantBubbleColor: e.target.value })}
                  className="w-full h-10 rounded-lg cursor-pointer"
                />
              </div>
              
              {/* Theme Toggle */}
              <div className="mb-4">
                <label className="block text-sm text-slate-400 mb-2">الوضع</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateTheme({ theme: 'dark', bgColor: '#050505', textColor: '#f5f5f5' })}
                    className={`flex-1 py-2 rounded-lg ${theme.theme === 'dark' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                  >
                    🌙 داكن
                  </button>
                  <button
                    onClick={() => updateTheme({ theme: 'light', bgColor: '#ffffff', textColor: '#1f2937' })}
                    className={`flex-1 py-2 rounded-lg ${theme.theme === 'light' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                  >
                    ☀️ فاتح
                  </button>
                </div>
              </div>
              
              {/* Reset Button */}
              <button
                onClick={() => setTheme(DEFAULT_THEME)}
                className="w-full py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white mt-4"
              >
                إعادة تعيين
              </button>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  );
}
