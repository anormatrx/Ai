import React, { useState, useRef, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Play, Save, FolderTree, FileCode2, FileJson, FileText, Terminal, Bot, Send, Settings, Check, Copy } from "lucide-react";

const INITIAL_FILES: Record<string, string> = {
  "main.py": "import os\nimport sys\n\ndef initialize_nexus():\n    print('Initializing AI Nexus Core...')\n    # Load neural weights\n    weights = os.getenv('NEXUS_WEIGHTS', 'default')\n    print(f'Loaded weights: {weights}')\n    return True\n\nif __name__ == '__main__':\n    success = initialize_nexus()\n    if success:\n        print('System Ready.')\n",
  "config.json": "{\n  \"system\": \"Nexus-16\",\n  \"version\": \"1.0.4\",\n  \"environment\": \"production\",\n  \"features\": {\n    \"auto_heal\": true,\n    \"deep_learning\": true\n  }\n}",
  "utils.js": "export const encryptPayload = (data) => {\n  console.log('Encrypting data packet...');\n  return btoa(JSON.stringify(data));\n};\n\nexport const decryptPayload = (hash) => {\n  console.log('Decrypting data packet...');\n  return JSON.parse(atob(hash));\n};"
};

export default function AdvancedEditor() {
  const [files, setFiles] = useState<Record<string, string>>(INITIAL_FILES);
  const [activeFile, setActiveFile] = useState<string>("main.py");
  const [code, setCode] = useState<string>(INITIAL_FILES["main.py"]);
  const [output, setOutput] = useState<string>("System ready. Waiting for execution...\n");
  const [isExecuting, setIsExecuting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Copilot State
  const [copilotInput, setCopilotInput] = useState("");
  const [copilotMessages, setCopilotMessages] = useState([
    { id: 1, sender: 'agent', textEn: 'AI Copilot ready. How can I help you with this code?', textAr: 'المساعد الذكي جاهز. كيف يمكنني مساعدتك في هذا الكود؟' }
  ]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const lineNumbers = code.split('\n').map((_, i) => i + 1);

  useEffect(() => {
    setCode(files[activeFile] || "");
  }, [activeFile]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [copilotMessages]);

  const handleScroll = () => {
    if (textareaRef.current) {
      const lineNumbersEle = document.getElementById('editor-line-numbers');
      if (lineNumbersEle) {
        lineNumbersEle.scrollTop = textareaRef.current.scrollTop;
      }
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setCode(newCode);
    setFiles(prev => ({ ...prev, [activeFile]: newCode }));
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  const handleRun = () => {
    setIsExecuting(true);
    setOutput(`> Executing ${activeFile}...\n`);
    
    setTimeout(() => {
      if (activeFile.endsWith('.py')) {
        setOutput(prev => prev + `Initializing AI Nexus Core...\nLoaded weights: default\nSystem Ready.\n\n[Process completed with exit code 0]`);
      } else if (activeFile.endsWith('.js')) {
        setOutput(prev => prev + `[Node.js Execution]\nFunctions exported successfully.\n\n[Process completed with exit code 0]`);
      } else {
        setOutput(prev => prev + `Cannot execute file type: ${activeFile}\n`);
      }
      setIsExecuting(false);
    }, 1500);
  };

  const handleCopilotSend = () => {
    if (!copilotInput.trim()) return;
    
    setCopilotMessages(prev => [...prev, { id: Date.now(), sender: 'user', textEn: copilotInput, textAr: copilotInput }]);
    setCopilotInput("");
    
    setTimeout(() => {
      setCopilotMessages(prev => [...prev, { 
        id: Date.now(), 
        sender: 'agent', 
        textEn: `I analyzed ${activeFile}. The code looks solid, but you might want to add error handling.`, 
        textAr: `لقد قمت بتحليل ${activeFile}. الكود يبدو جيداً، لكن قد ترغب في إضافة معالجة للأخطاء.` 
      }]);
    }, 1500);
  };

  const getFileIcon = (filename: string) => {
    if (filename.endsWith('.py')) return <FileCode2 className="h-4 w-4 text-blue-400" />;
    if (filename.endsWith('.json')) return <FileJson className="h-4 w-4 text-yellow-400" />;
    if (filename.endsWith('.js')) return <FileCode2 className="h-4 w-4 text-yellow-300" />;
    return <FileText className="h-4 w-4 text-gray-400" />;
  };

  return (
    <div className="flex h-full flex-col bg-[#050a0f] text-white p-6 font-sans overflow-hidden relative" dir="ltr">
      {/* Background Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-50" 
           style={{
             backgroundImage: `linear-gradient(rgba(0, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.03) 1px, transparent 1px)`,
             backgroundSize: '30px 30px',
           }}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-[#0f172a] border border-cyan-500/30 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(0,255,255,0.2)]">
            <FileCode2 className="h-6 w-6 text-cyan-400" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
            Nexus Studio Editor <span className="text-cyan-400/50">|</span> <span dir="rtl" className="font-arabic text-cyan-100">استوديو محرر الأكواد</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-[#0f172a] border border-cyan-500/30 rounded-lg text-xs text-cyan-300 hover:bg-cyan-500/10 transition-colors"
          >
            {isSaving ? <Check className="h-4 w-4 text-green-400" /> : <Save className="h-4 w-4" />}
            <span dir="rtl" className="font-arabic">{isSaving ? 'تم الحفظ' : 'حفظ'}</span>
          </button>
          <button 
            onClick={handleRun}
            disabled={isExecuting}
            className="flex items-center gap-2 px-6 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-800 rounded-lg text-xs text-white font-bold transition-colors shadow-[0_0_15px_rgba(0,255,255,0.3)]"
          >
            <Play className="h-4 w-4" />
            <span dir="rtl" className="font-arabic">{isExecuting ? 'جاري التشغيل...' : 'تشغيل الكود'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0 relative z-10">
        
        {/* Left Sidebar: File Explorer */}
        <GlassCard className="col-span-12 lg:col-span-2 flex flex-col bg-[#0a1118]/90 border-cyan-500/20 overflow-hidden" glowColor="rgba(0, 255, 255, 0.05)">
          <div className="p-3 border-b border-cyan-500/20 bg-[#0f172a]/80 flex items-center gap-2">
            <FolderTree className="h-4 w-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-cyan-100">Project Files</h3>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {Object.keys(files).map(filename => (
              <div 
                key={filename}
                onClick={() => setActiveFile(filename)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer text-xs transition-colors ${activeFile === filename ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
              >
                {getFileIcon(filename)}
                <span>{filename}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Center: Code Editor & Terminal */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-4 h-full">
          
          {/* Editor Area */}
          <GlassCard className="flex-1 flex flex-col bg-[#111827]/90 border-cyan-500/20 overflow-hidden" glowColor="rgba(0, 255, 255, 0.02)">
            <div className="flex items-center border-b border-cyan-500/20 bg-[#0f172a]/80">
              <div className="px-4 py-2 border-r border-cyan-500/20 border-b-2 border-b-cyan-400 bg-[#1e293b]/50 text-xs text-cyan-300 flex items-center gap-2">
                {getFileIcon(activeFile)}
                {activeFile}
              </div>
            </div>
            
            <div className="flex-1 flex overflow-hidden relative bg-[#0d1117]">
              {/* Line Numbers */}
              <div 
                id="editor-line-numbers"
                className="w-12 bg-[#0d1117] border-r border-white/5 text-[#484f58] text-right pr-3 py-4 font-mono text-sm select-none overflow-hidden"
              >
                {lineNumbers.map(n => <div key={n}>{n}</div>)}
              </div>
              
              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={code}
                onChange={handleCodeChange}
                onScroll={handleScroll}
                spellCheck={false}
                className="flex-1 bg-transparent text-[#c9d1d9] font-mono text-sm p-4 outline-none resize-none whitespace-pre overflow-auto custom-scrollbar"
                style={{ lineHeight: '1.5rem', tabSize: 4 }}
              />
            </div>
          </GlassCard>

          {/* Terminal Output */}
          <GlassCard className="h-48 flex flex-col bg-[#0a1118]/90 border-cyan-500/20 overflow-hidden" glowColor="rgba(0, 255, 255, 0.02)">
            <div className="p-2 border-b border-cyan-500/20 bg-[#0f172a]/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-cyan-100">Output Console</h3>
              </div>
              <button onClick={() => setOutput("")} className="text-[10px] text-white/40 hover:text-white transition-colors">Clear</button>
            </div>
            <div className="flex-1 p-3 overflow-y-auto custom-scrollbar font-mono text-xs text-green-400 whitespace-pre-wrap">
              {output}
            </div>
          </GlassCard>

        </div>

        {/* Right Sidebar: AI Copilot */}
        <GlassCard className="col-span-12 lg:col-span-3 flex flex-col bg-[#0a1118]/90 border-purple-500/20 overflow-hidden" glowColor="rgba(168, 85, 247, 0.05)">
          <div className="p-3 border-b border-purple-500/20 bg-[#0f172a]/80 flex items-center gap-2">
            <Bot className="h-4 w-4 text-purple-400" />
            <h3 className="text-xs font-bold text-purple-100">AI Copilot <span className="text-white/30">|</span> <span dir="rtl" className="font-arabic">المساعد البرمجي</span></h3>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto custom-scrollbar flex flex-col gap-4">
            {copilotMessages.map(msg => (
              <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[90%] p-3 rounded-lg text-xs ${msg.sender === 'user' ? 'bg-cyan-900/40 border border-cyan-500/30 text-cyan-100 rounded-tr-none' : 'bg-purple-900/40 border border-purple-500/30 text-purple-100 rounded-tl-none'}`}>
                  <p className="mb-1">{msg.textEn}</p>
                  <p dir="rtl" className="font-arabic opacity-80 text-[10px] border-t border-white/10 pt-1 mt-1">{msg.textAr}</p>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="p-3 border-t border-purple-500/20 bg-[#0f172a]/50">
            <div className="flex items-center gap-2 bg-[#050a0f] border border-purple-500/30 rounded-lg px-3 py-2">
              <input 
                type="text" 
                value={copilotInput}
                onChange={e => setCopilotInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCopilotSend()}
                placeholder="Ask Copilot..."
                className="flex-1 bg-transparent text-xs text-white outline-none"
              />
              <button onClick={handleCopilotSend} className="text-purple-400 hover:text-purple-300 transition-colors">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </GlassCard>

      </div>
    </div>
  );
}
