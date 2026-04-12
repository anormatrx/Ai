import React, { useState, useEffect } from "react";
import { Play, Save, Code2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CodeEditorProps {
  selectedFile: string | null;
  onRun: (code: string) => void;
}

export default function CodeEditor({ selectedFile, onRun }: CodeEditorProps) {
  const [code, setCode] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (selectedFile) {
      const fetchFileContent = async () => {
        try {
          const response = await fetch(`/api/files/read?path=${encodeURIComponent(selectedFile)}`);
          const data = await response.json();
          if (data.content !== undefined) {
            setCode(data.content);
          } else {
            setCode(`# Error: ${data.error || "Failed to load file"}`);
          }
        } catch (error) {
          console.error("Failed to load file:", error);
          setCode(`# Connection Error: Failed to load ${selectedFile}`);
        }
      };
      fetchFileContent();
    }
  }, [selectedFile]);

  const handleSave = async () => {
    if (!selectedFile) return;
    setIsSaving(true);
    try {
      await fetch("/api/files/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: selectedFile, content: code })
      });
    } catch (error) {
      console.error("Failed to save file:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black/40 rounded-xl border border-white/5 overflow-hidden">
      <div className="p-3 border-b border-white/5 flex items-center justify-between bg-white/2">
        <div className="flex items-center gap-2">
          <Code2 className="h-4 w-4 text-orange-400" />
          <span className="text-xs font-mono text-white/60">{selectedFile || "محرر الأكواد"}</span>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 text-[10px] uppercase tracking-widest text-white/40 hover:text-white"
            onClick={() => {
              navigator.clipboard.writeText(code);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
          >
            {copied ? <Check className="h-3 w-3 mr-2" /> : <Copy className="h-3 w-3 mr-2" />}
            نسخ
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 text-[10px] uppercase tracking-widest text-white/40 hover:text-white"
            onClick={handleSave}
            disabled={!selectedFile || isSaving}
          >
            <Save className="h-3 w-3 mr-2" />
            {isSaving ? "جاري الحفظ..." : "حفظ"}
          </Button>
          <Button 
            size="sm" 
            className="h-8 bg-orange-500 hover:bg-orange-400 text-black text-[10px] font-bold uppercase tracking-widest"
            onClick={() => onRun(code)}
          >
            <Play className="h-3 w-3 mr-2" />
            تشغيل
          </Button>
        </div>
      </div>
      
      <textarea 
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="flex-1 bg-transparent p-6 font-mono text-sm text-white/80 outline-none resize-none no-scrollbar"
        spellCheck={false}
      />
    </div>
  );
}
