"use client";

import * as React from "react";

declare global {
  interface Window {
    loadPyodide: () => Promise<any>;
  }
}

type Msg = {
  role: "user" | "assistant";
  content: string;
};

export default function Page() {
  const [pyodide, setPyodide] = React.useState<any>(null);
  const [pyodideReady, setPyodideReady] = React.useState(false);
  const [messages, setMessages] = React.useState<Msg[]>([
    { role: "assistant", content: "مرحباً! أنا البيئة المعزولة. اختر ملف من اليسار وابدأ البرمجة." },
  ]);
  const [execution, setExecution] = React.useState("");
  const [generatedCode, setGeneratedCode] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const [pyFiles, setPyFiles] = React.useState<Record<string, string>>({
    "main.py": `# تطبيق Python الرئيسي
print("مرحبا بك في بيئة التطوير المعزولة!")

def greet(name):
    return f"مرحبا {name}!"

if __name__ == "__main__":
    result = greet("أحمد")
    print(result)
`,
    "config.py": `# إعدادات التطبيق
APP_NAME = "ANOR-MATRX"
VERSION = "1.0.0"
DEBUG = True
`,
    "utils.py": `# دوال مساعدة
def calculate_sum(numbers):
    return sum(numbers)

def calculate_average(numbers):
    return sum(numbers) / len(numbers) if numbers else 0
`
  });

  const [currentPyFile, setCurrentPyFile] = React.useState("main.py");
  const [consoleOutput, setConsoleOutput] = React.useState<string[]>([
    "جاهز للتشغيل..."
  ]);
  const [variables, setVariables] = React.useState<Record<string, {value: string; type: string}>>({});

  const initPyodide = async () => {
    if (pyodide) return;
    setLoading(true);
    setConsoleOutput((prev) => [...prev, "جاري تحميل Python Runtime..."]);
    try {
      if (!window.loadPyodide) {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js";
        document.head.appendChild(script);
        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }
      const pyodideModule = await window.loadPyodide();
      setPyodide(pyodideModule);
      setPyodideReady(true);
      setConsoleOutput((prev) => [...prev, "✓ Python Runtime جاهز"]);
    } catch (error: any) {
      setConsoleOutput((prev) => [...prev, `❌ خطأ: ${error.message}`]);
    } finally {
      setLoading(false);
    }
  };

  const runPython = async () => {
    if (!pyodideReady) {
      await initPyodide();
    }

    const code = pyFiles[currentPyFile];
    setConsoleOutput((prev) => [...prev, "▶ تشغيل..."]);

    try {
      pyodide.runPython(`
import sys
from io import StringIO
_old_stdout = sys.stdout
sys.stdout = StringIO()
      `);

      pyodide.runPython(code);
      const output = pyodide.runPython("_old_stdout.getvalue()") || "تم التنفيذ";
      
      pyodide.runPython("sys.stdout = _old_stdout");

      setExecution(output);
      setConsoleOutput((prev) => [...prev, output.toString(), "✓ انتهى التشغيل"]);
      
      extractVariables();

      setMessages((prev) => [...prev, { 
        role: "assistant", 
        content: `تم تنفيذ ${currentPyFile} بنجاح` 
      }]);
    } catch (error: any) {
      const errMsg = error.message || "خطأ في التنفيذ";
      setExecution(errMsg);
      setConsoleOutput((prev) => [...prev, `❌ ${errMsg}`]);
    }
  };

  const extractVariables = () => {
    try {
      const varsJson = pyodide.runPython(`
import json
vars_dict = {}
for name, obj in list(globals().items())[:20]:
    if not name.startswith('_') and not callable(obj):
        try:
            vars_dict[name] = {'value': str(obj)[:50], 'type': type(obj).__name__}
        except:
            pass
json.dumps(vars_dict)
      `);
      setVariables(JSON.parse(varsJson));
    } catch {}
  };

  const updateLineNumbers = () => {
    const editor = document.getElementById("py-code-editor") as HTMLTextAreaElement;
    const lineNumbers = document.getElementById("py-line-numbers");
    if (!editor || !lineNumbers) return;
    
    const lines = editor.value.split("\n").length;
    lineNumbers.innerHTML = "";
    for (let i = 1; i <= lines; i++) {
      const div = document.createElement("div");
      div.textContent = String(i);
      lineNumbers.appendChild(div);
    }
  };

  const handleFileChange = (filename: string) => {
    setCurrentPyFile(filename);
    setTimeout(updateLineNumbers, 0);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newFiles = { ...pyFiles, [currentPyFile]: e.target.value };
    setPyFiles(newFiles);
    setTimeout(updateLineNumbers, 0);
  };

  const clearConsole = () => {
    setConsoleOutput(["جاهز للتشغيل..."]);
  };

  React.useEffect(() => {
    initPyodide();
    
    const starfield = document.getElementById("starfield");
    if (starfield) {
      for (let i = 0; i < 100; i++) {
        const star = document.createElement("div");
        star.style.width = Math.random() * 2 + 1 + "px";
        star.style.height = star.style.width;
        star.style.left = Math.random() * 100 + "%";
        star.style.top = Math.random() * 100 + "%";
        star.style.animationDelay = Math.random() * 3 + "s";
        star.style.position = "absolute";
        star.style.background = "white";
        star.style.borderRadius = "50%";
        star.style.animation = "twinkle 3s infinite";
        starfield.appendChild(star);
      }
    }
  }, []);

  React.useEffect(() => {
    if (pyodideReady) {
      setTimeout(updateLineNumbers, 100);
    }
  }, [pyodideReady, currentPyFile]);

  return (
    <div className="fixed inset-0 flex flex-col bg-[#060e20] text-[#dee5ff] overflow-hidden">
      {/* Starfield Background */}
      <div className="fixed inset-0 pointer-events-none -z-10" id="starfield" />

      {/* Header */}
      <header className="shrink-0 flex items-center justify-between px-6 h-16 bg-[#060e20]/80 backdrop-blur-xl border-b border-[#40485d]/10">
        <div className="flex items-center gap-8">
          <div className="text-2xl font-bold tracking-tighter text-[#ba9eff] font-headline">
            SYNTHETIX_CORE
          </div>
          <nav className="hidden md:flex gap-6 items-center">
            <button className="font-headline tracking-tight text-[#53ddfc] border-b-2 border-[#53ddfc] pb-1">
              Workspace
            </button>
            <button className="font-headline tracking-tight text-[#a3aac4] hover:text-[#53ddfc]">
              Python Dev
            </button>
            <button className="font-headline tracking-tight text-[#a3aac4] hover:text-[#53ddfc]">
              Datasets
            </button>
            <button className="font-headline tracking-tight text-[#a3aac4] hover:text-[#53ddfc]">
              Models
            </button>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={runPython}
            disabled={loading}
            className="bg-[#ba9eff] text-[#060e20] px-4 py-2 rounded-lg font-headline font-bold text-sm hover:brightness-110 transition-all"
          >
            Execute Lab
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Sidebar */}
        <aside className="w-20 flex flex-col items-center py-8 bg-[#091328] border-r border-[#ba9eff]/10">
          <div className="mb-8 flex flex-col items-center">
            <div className="w-10 h-10 bg-[#ba9eff]/20 rounded-full flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-[#ba9eff]">psychology</span>
            </div>
            <span className="text-[#ba9eff] text-[10px] tracking-tighter">NEURAL_OS</span>
          </div>
          <div className="flex-1 w-full flex flex-col items-center gap-2">
            <button className="w-full py-4 flex flex-col items-center text-[#ba9eff] bg-[#ba9eff]/10 border-r-2 border-[#ba9eff]">
              <span className="material-symbols-outlined">terminal</span>
              <span className="text-[9px] mt-1 uppercase tracking-widest">Workspace</span>
            </button>
            <button className="w-full py-4 flex flex-col items-center text-[#a3aac4] hover:text-[#53ddfc]">
              <span className="material-symbols-outlined">code</span>
              <span className="text-[9px] mt-1 uppercase tracking-widest">Python</span>
            </button>
            <button className="w-full py-4 flex flex-col items-center text-[#a3aac4] hover:text-[#53ddfc]">
              <span className="material-symbols-outlined">database</span>
              <span className="text-[9px] mt-1 uppercase tracking-widest">Datasets</span>
            </button>
            <button className="w-full py-4 flex flex-col items-center text-[#a3aac4] hover:text-[#53ddfc]">
              <span className="material-symbols-outlined">psychology</span>
              <span className="text-[9px] mt-1 uppercase tracking-widest">Models</span>
            </button>
          </div>
        </aside>

        {/* Main Area */}
        <main className="flex-1 flex gap-6 p-6 overflow-hidden">
          {/* Left: File Explorer */}
          <div className="w-64 flex flex-col gap-4">
            <div className="flex-1 flex flex-col border border-[#40485d]/20 bg-[#0f1930] rounded-xl overflow-hidden">
              <div className="h-10 flex items-center px-4 border-b border-[#40485d]/20 bg-[#141f38]">
                <span className="font-headline text-[11px] font-bold tracking-widest text-[#a3aac4] uppercase">📁 Files</span>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                {Object.keys(pyFiles).map((filename) => (
                  <div
                    key={filename}
                    onClick={() => handleFileChange(filename)}
                    className={`p-2 rounded-lg cursor-pointer transition-all ${
                      currentPyFile === filename
                        ? "bg-[#ba9eff]/20 text-[#ba9eff]"
                        : "text-[#a3aac4] hover:bg-[#ba9eff]/10"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px] align-middle mr-1">
                      description
                    </span>
                    {filename}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col border border-[#40485d]/20 bg-[#0f1930] rounded-xl overflow-hidden">
              <div className="h-10 flex items-center px-4 border-b border-[#40485d]/20 bg-[#141f38]">
                <span className="font-headline text-[11px] font-bold tracking-widest text-[#a3aac4] uppercase">📦 Packages</span>
              </div>
              <div className="p-3">
                <div className="text-[10px] space-y-1">
                  <div className="flex justify-between p-2 bg-[#141f38] rounded">
                    <span className="text-[#53ddfc]">numpy</span>
                    <span className="text-[#a3aac4] text-[9px]">✓</span>
                  </div>
                  <div className="flex justify-between p-2 bg-[#141f38] rounded">
                    <span className="text-[#53ddfc]">pandas</span>
                    <span className="text-[#a3aac4] text-[9px]">✓</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Center: Code Editor */}
          <div className="flex-1 flex flex-col border border-[#40485d]/20 bg-[#0f1930] rounded-xl overflow-hidden">
            <div className="h-10 flex items-center bg-[#000000] border-b border-[#40485d]/20 overflow-x-auto">
              {Object.keys(pyFiles).map((filename) => (
                <div
                  key={filename}
                  onClick={() => handleFileChange(filename)}
                  className={`px-4 py-2 border-b-2 cursor-pointer ${
                    currentPyFile === filename
                      ? "border-[#ba9eff] text-[#ba9eff]"
                      : "border-transparent text-[#a3aac4]"
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px] align-middle mr-1">
                    description
                  </span>
                  {filename}
                </div>
              ))}
            </div>

            <div className="flex-1 relative overflow-hidden font-mono text-[12px] flex">
              <div
                id="py-line-numbers"
                className="w-12 bg-[#000000] text-[#a3aac4]/40 flex flex-col items-center pt-4 select-none border-r border-[#40485d]/10 text-right pr-2 overflow-y-auto"
              />
              <textarea
                id="py-code-editor"
                value={pyFiles[currentPyFile] || ""}
                onChange={handleCodeChange}
                className="flex-1 bg-[#000000] pt-4 px-4 resize-none focus:ring-0 border-none text-[#dee5ff] font-mono"
                placeholder="# اكتب كود Python..."
              />
            </div>

            <div className="h-7 bg-[#141f38] border-t border-[#40485d]/20 px-4 flex items-center justify-between text-[10px] text-[#a3aac4]">
              <div className="flex gap-4">
                <span>Line: {(pyFiles[currentPyFile] || "").split('\n').length}</span>
                <span>Col: 1</span>
              </div>
              <div className="flex gap-2">
                <span className="text-[#53ddfc]">Python 3.11</span>
                <span>•</span>
                <span className="text-[#53ddfc]">UTF-8</span>
              </div>
            </div>
          </div>

          {/* Right: Output & Variables */}
          <div className="w-96 flex flex-col gap-4">
            <div className="flex-1 flex flex-col border border-[#40485d]/20 bg-[#0f1930] rounded-xl overflow-hidden">
              <div className="h-10 flex items-center px-4 border-b border-[#40485d]/20 bg-[#141f38]">
                <span className="font-headline text-[11px] font-bold tracking-widest text-[#a3aac4] uppercase">
                  🖥️ Console
                </span>
                <button 
                  onClick={clearConsole}
                  className="ml-auto p-1 hover:bg-[#ba9eff]/10 rounded"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 font-mono text-[11px] space-y-1">
                {consoleOutput.map((line, i) => (
                  <div
                    key={i}
                    className={`p-2 rounded ${
                      line.startsWith("❌")
                        ? "bg-[#ff6e84]/10 border-l-2 border-[#ff6e84]"
                        : line.startsWith("✓")
                        ? "bg-[#53ddfc]/10 border-l-2 border-[#53ddfc]"
                        : "bg-transparent"
                    }`}
                  >
                    {line}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col border border-[#40485d]/20 bg-[#0f1930] rounded-xl overflow-hidden">
              <div className="h-10 flex items-center px-4 border-b border-[#40485d]/20 bg-[#141f38]">
                <span className="font-headline text-[11px] font-bold tracking-widest text-[#a3aac4] uppercase">
                  🔍 Variables
                </span>
              </div>
              <div className="p-3 overflow-y-auto max-h-64">
                {Object.keys(variables).length === 0 ? (
                  <div className="text-[10px] text-[#a3aac4]">
                    لا توجد متغيرات
                  </div>
                ) : (
                  Object.entries(variables).map(([name, info]) => (
                    <div key={name} className="p-2 bg-[#ba9eff]/5 rounded mb-2">
                      <div className="text-[#ba9eff] font-semibold">{name}</div>
                      <div className="text-[#53ddfc] text-[10px]">{info.value}</div>
                      <div className="text-[#a3aac4] text-[9px]">{info.type}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Background Glow Effects */}
      <div className="fixed top-1/4 right-1/4 w-96 h-96 bg-[#ba9eff]/5 blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-1/4 left-1/4 w-96 h-96 bg-[#53ddfc]/5 blur-[120px] pointer-events-none -z-10" />
    </div>
  );
}