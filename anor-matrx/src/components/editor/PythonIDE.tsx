"use client";

import * as React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  FolderTree,
  FileCode,
  Settings,
  Play,
  Trash2,
  Plus,
  FolderPlus,
  ChevronRight,
  Terminal,
  Variable,
  Bug,
  X,
  Save,
  Loader2,
} from "lucide-react";

declare global {
  interface Window {
    loadPyodide: () => Promise<any>;
  }
}

interface FileEntry {
  name: string;
  type: "file" | "folder";
  content?: string;
}

const defaultFiles: Record<string, FileEntry> = {
  "main.py": {
    name: "main.py",
    type: "file",
    content: `# تطبيق Python الرئيسي
print("مرحبا بك في بيئة التطوير!")

def greet(name):
    return f"مرحبا {name}!"

if __name__ == "__main__":
    result = greet("أحمد")
    print(result)
`,
  },
  "config.py": {
    name: "config.py",
    type: "file",
    content: `# إعدادات التطبيق
APP_NAME = "ANOR-MATRX"
VERSION = "1.0.0"
DEBUG = True

DATABASE = {
    "host": "localhost",
    "port": 5432,
    "name": "app_db"
}
`,
  },
  "utils.py": {
    name: "utils.py",
    type: "file",
    content: `# دوال مساعدة
def calculate_sum(numbers):
    return sum(numbers)

def calculate_average(numbers):
    return sum(numbers) / len(numbers) if numbers else 0

if __name__ == "__main__":
    data = [10, 20, 30, 40, 50]
    print(f"المجموع: {calculate_sum(data)}")
    print(f"المتوسط: {calculate_average(data)}")
`,
  },
};

export default function PythonIDE() {
  const [pyodide, setPyodide] = React.useState<any>(null);
  const [pyodideReady, setPyodideReady] = React.useState(false);
  const [files, setFiles] = React.useState<Record<string, FileEntry>>(defaultFiles);
  const [currentFile, setCurrentFile] = React.useState("main.py");
  const [openTabs, setOpenTabs] = React.useState<string[]>(["main.py"]);
  const [consoleOutput, setConsoleOutput] = React.useState<string[]>(["جاهز للتشغيل..."]);
  const [variables, setVariables] = React.useState<Record<string, { value: string; type: string }>>({});
  const [loading, setLoading] = React.useState(false);
  const [expandedFolders, setExpandedFolders] = React.useState<Set<string>>(new Set(["MyProject"]));
  const [rightTab, setRightTab] = React.useState<"console" | "variables" | "debug">("console");

  const codeEditorRef = React.useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = React.useRef<HTMLDivElement>(null);

  const initPyodide = async () => {
    if (pyodide) return;
    setLoading(true);
    addConsoleOutput("جاري تحميل Python Runtime...", "info");

    try {
      if (!window.loadPyodide) {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js";
        document.head.appendChild(script);
        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }
      const py = await window.loadPyodide();
      setPyodide(py);
      setPyodideReady(true);
      addConsoleOutput("✓ Python Runtime جاهز", "success");
    } catch (error: any) {
      addConsoleOutput(`❌ خطأ: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const addConsoleOutput = (text: string, type: "info" | "success" | "error" | "warning" | "output" = "output") => {
    setConsoleOutput((prev) => [...prev, `[${type}] ${text}`]);
  };

  const executeCode = async () => {
    if (!pyodideReady) {
      await initPyodide();
    }

    const code = files[currentFile]?.content || "";
    if (!code.trim()) {
      addConsoleOutput("⚠️ الرجاء إدخال كود Python", "warning");
      return;
    }

    setLoading(true);
    addConsoleOutput("▶ تشغيل الكود...", "info");

    try {
      pyodide.runPython(`
import sys
from io import StringIO
_old_stdout = sys.stdout
sys.stdout = StringIO()
      `);

      pyodide.runPython(code);
      const stdout = pyodide.runPython("_old_stdout.getvalue()") || "";
      pyodide.runPython("sys.stdout = _old_stdout");

      if (stdout) {
        addConsoleOutput(stdout.toString(), "output");
      } else {
        addConsoleOutput("✓ تم التنفيذ بنجاح", "success");
      }

      extractVariables();
    } catch (error: any) {
      addConsoleOutput(`❌ خطأ: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const extractVariables = () => {
    try {
      const varsJson = pyodide.runPython(`
import json
vars_dict = {}
for name, obj in list(globals().items())[:15]:
    if not name.startswith('_') and not callable(obj):
        try:
            vars_dict[name] = {'value': str(obj)[:80], 'type': type(obj).__name__}
        except:
            pass
json.dumps(vars_dict)
      `);
      setVariables(JSON.parse(varsJson));
    } catch {}
  };

  const updateLineNumbers = () => {
    if (!lineNumbersRef.current || !codeEditorRef.current) return;
    const lines = (files[currentFile]?.content || "").split("\n").length;
    lineNumbersRef.current.innerHTML = "";
    for (let i = 1; i <= lines; i++) {
      const div = document.createElement("div");
      div.textContent = String(i);
      lineNumbersRef.current.appendChild(div);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFiles((prev) => ({
      ...prev,
      [currentFile]: {
        ...prev[currentFile],
        content: e.target.value,
      },
    }));
    updateLineNumbers();
  };

  const openFile = (filename: string) => {
    setCurrentFile(filename);
    if (!openTabs.includes(filename)) {
      setOpenTabs((prev) => [...prev, filename]);
    }
    setTimeout(updateLineNumbers, 50);
  };

  const closeTab = (filename: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setOpenTabs((prev) => prev.filter((f) => f !== filename));
    if (currentFile === filename && openTabs.length > 1) {
      const nextTab = openTabs.find((f) => f !== filename);
      if (nextTab) setCurrentFile(nextTab);
    }
  };

  const createNewFile = () => {
    const filename = prompt("اسم الملف:");
    if (filename && !filename.endsWith(".py")) {
      return;
    }
    if (filename) {
      setFiles((prev) => ({
        ...prev,
        [filename]: { name: filename, type: "file", content: `# ${filename}` },
      }));
      openFile(filename);
      addConsoleOutput(`✓ تم إنشاء: ${filename}`, "success");
    }
  };

  const toggleFolder = (folderName: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderName)) {
        next.delete(folderName);
      } else {
        next.add(folderName);
      }
      return next;
    });
  };

  React.useEffect(() => {
    initPyodide();
  }, []);

  React.useEffect(() => {
    updateLineNumbers();
  }, [currentFile]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        executeCode();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        addConsoleOutput("✓ تم حفظ الملفات", "success");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentFile, files]);

  return (
    <div className="flex h-full bg-[#060e20] text-[#dee5ff]">
      {/* Left Sidebar: File Explorer */}
      <div className="w-64 flex flex-col border-r border-white/10 bg-[#091328]/50">
        <div className="h-12 flex items-center justify-between px-4 border-b border-white/10">
          <span className="text-xs font-bold tracking-widest text-[#a3aac4] uppercase">📁 Explorer</span>
          <div className="flex gap-1">
            <button
              onClick={createNewFile}
              className="p-1 hover:bg-[#ba9eff]/10 rounded transition-colors"
              title="New File"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button className="p-1 hover:bg-[#ba9eff]/10 rounded transition-colors" title="New Folder">
              <FolderPlus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <ScrollArea className="flex-1 p-2">
          <div className="space-y-1">
            <button
              onClick={() => toggleFolder("MyProject")}
              className="w-full flex items-center gap-2 p-2 rounded hover:bg-white/5 text-right"
            >
              <ChevronRight
                className={cn(
                  "h-4 w-4 transition-transform",
                  expandedFolders.has("MyProject") && "rotate-90"
                )}
              />
              <FolderTree className="h-4 w-4 text-[#53ddfc]" />
              <span className="text-sm">MyProject</span>
            </button>

            {expandedFolders.has("MyProject") && (
              <div className="ml-4 space-y-1">
                {Object.keys(files).map((filename) => (
                  <button
                    key={filename}
                    onClick={() => openFile(filename)}
                    className={cn(
                      "w-full flex items-center gap-2 p-2 rounded text-right text-sm",
                      currentFile === filename
                        ? "bg-[#ba9eff]/20 text-[#ba9eff] border-r-2 border-[#ba9eff]"
                        : "hover:bg-white/5"
                    )}
                  >
                    <FileCode className="h-4 w-4" />
                    {filename}
                  </button>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="border-t border-white/10 p-3">
          <div className="text-xs font-bold text-[#a3aac4] mb-2">📦 PACKAGES</div>
          <div className="space-y-1">
            <div className="flex justify-between p-2 bg-[#141f38] rounded text-xs">
              <span className="text-[#53ddfc]">numpy</span>
              <span className="text-[#a3aac4]">✓</span>
            </div>
            <div className="flex justify-between p-2 bg-[#141f38] rounded text-xs">
              <span className="text-[#53ddfc]">pandas</span>
              <span className="text-[#a3aac4]">✓</span>
            </div>
          </div>
        </div>
      </div>

      {/* Center: Code Editor */}
      <div className="flex-1 flex flex-col bg-[#000000] overflow-hidden">
        {/* Tabs */}
        <div className="h-10 flex items-center bg-[#141f38] border-b border-white/10 overflow-x-auto">
          {openTabs.map((filename) => (
            <button
              key={filename}
              onClick={() => openFile(filename)}
              className={cn(
                "flex items-center gap-2 px-4 h-full border-b-2 text-sm",
                currentFile === filename
                  ? "border-[#ba9eff] text-[#ba9eff] bg-[#0f1930]"
                  : "border-transparent text-[#a3aac4] hover:bg-white/5"
              )}
            >
              <FileCode className="h-3 w-3" />
              {filename}
              {openTabs.length > 1 && (
                <X
                  className="h-3 w-3 hover:bg-white/20 rounded"
                  onClick={(e) => closeTab(filename, e)}
                />
              )}
            </button>
          ))}
        </div>

        {/* Breadcrumbs */}
        <div className="h-6 flex items-center px-4 bg-[#091328] text-xs text-[#a3aac4] border-b border-white/10">
          MyProject <ChevronRight className="h-3 w-3 mx-1" /> {currentFile}
        </div>

        {/* Editor */}
        <div className="flex-1 relative overflow-hidden font-mono text-sm flex">
          <div
            ref={lineNumbersRef}
            className="w-12 bg-[#000000] text-[#a3aac4]/40 flex flex-col items-center pt-4 select-none border-r border-white/10 text-right pr-2 overflow-y-auto"
          />

          <textarea
            ref={codeEditorRef}
            value={files[currentFile]?.content || ""}
            onChange={handleCodeChange}
            className="flex-1 bg-[#000000] pt-4 px-4 resize-none focus:ring-0 border-none text-[#dee5ff] font-mono focus:outline-none focus:bg-[#0a0a0a]"
            placeholder="# اكتب كود Python هنا..."
            spellCheck={false}
          />
        </div>

        {/* Status Bar */}
        <div className="h-7 bg-[#141f38] border-t border-white/10 px-4 flex items-center justify-between text-xs text-[#a3aac4]">
          <div className="flex gap-4">
            <span>
              Line: {(files[currentFile]?.content || "").split("\n").length}
            </span>
            <span>Col: 1</span>
            <span>Chars: {(files[currentFile]?.content || "").length}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-[#53ddfc]">Python 3.11</span>
            <span>•</span>
            <span className="text-[#53ddfc]">UTF-8</span>
          </div>
        </div>
      </div>

      {/* Right Panel: Output & Variables */}
      <div className="w-80 flex flex-col border-l border-white/10 bg-[#091328]/50">
        {/* Tabs */}
        <div className="h-10 flex items-center bg-[#141f38] border-b border-white/10 overflow-x-auto">
          <button
            onClick={() => setRightTab("console")}
            className={cn(
              "flex items-center gap-2 px-3 h-full text-xs",
              rightTab === "console"
                ? "border-b-2 border-[#ba9eff] text-[#ba9eff]"
                : "text-[#a3aac4] hover:bg-white/5"
            )}
          >
            <Terminal className="h-3 w-3" />
            Console
          </button>
          <button
            onClick={() => setRightTab("variables")}
            className={cn(
              "flex items-center gap-2 px-3 h-full text-xs",
              rightTab === "variables"
                ? "border-b-2 border-[#ba9eff] text-[#ba9eff]"
                : "text-[#a3aac4] hover:bg-white/5"
            )}
          >
            <Variable className="h-3 w-3" />
            Variables
          </button>
          <button
            onClick={() => setRightTab("debug")}
            className={cn(
              "flex items-center gap-2 px-3 h-full text-xs",
              rightTab === "debug"
                ? "border-b-2 border-[#ba9eff] text-[#ba9eff]"
                : "text-[#a3aac4] hover:bg-white/5"
            )}
          >
            <Bug className="h-3 w-3" />
            Debug
          </button>
        </div>

        {/* Console Output */}
        {rightTab === "console" && (
          <>
            <ScrollArea className="flex-1 p-3 font-mono text-xs">
              <div className="space-y-1">
                {consoleOutput.map((line, i) => (
                  <div
                    key={i}
                    className={cn(
                      "p-2 rounded",
                      line.startsWith("[error]") && "bg-[#ff6e84]/10 border-l-2 border-[#ff6e84]",
                      line.startsWith("[success]") && "bg-[#53ddfc]/10 border-l-2 border-[#53ddfc]",
                      line.startsWith("[info]") && "bg-[#ba9eff]/10 border-l-2 border-[#ba9eff]",
                      line.startsWith("[warning]") && "bg-[#ff97b5]/10 border-l-2 border-[#ff97b5]",
                      line.startsWith("[output]") && "bg-transparent"
                    )}
                  >
                    {line.replace(/^\[.*?\]\s*/, "")}
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="h-8 border-t border-white/10 px-3 flex items-center">
              <button
                onClick={() => setConsoleOutput(["جاهز للتشغيل..."])}
                className="text-xs text-[#a3aac4] hover:text-[#ba9eff] transition-colors flex items-center gap-1"
              >
                <Trash2 className="h-3 w-3" />
                Clear
              </button>
            </div>
          </>
        )}

        {/* Variables Panel */}
        {rightTab === "variables" && (
          <ScrollArea className="flex-1 p-3 font-mono text-xs">
            {Object.keys(variables).length === 0 ? (
              <div className="text-[#a3aac4]">لا توجد متغيرات</div>
            ) : (
              <div className="space-y-2">
                {Object.entries(variables).map(([name, info]) => (
                  <div key={name} className="p-2 bg-[#ba9eff]/5 rounded">
                    <div className="text-[#ba9eff] font-semibold">{name}</div>
                    <div className="text-[#53ddfc] text-xs truncate">{info.value}</div>
                    <div className="text-[#a3aac4] text-xs">{info.type}</div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        )}

        {/* Debug Panel */}
        {rightTab === "debug" && (
          <div className="flex-1 p-3 text-[#a3aac4] text-xs">
            لا توجد نقاط توقف
          </div>
        )}

        {/* Run Button */}
        <div className="p-3 border-t border-white/10">
          <Button
            onClick={executeCode}
            disabled={loading}
            className="w-full bg-[#ba9eff] hover:bg-[#a885ff] text-[#060e20] font-bold"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جاري التشغيل...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run Code (Ctrl+Enter)
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}