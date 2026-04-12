import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Folder, File, ChevronRight, ChevronDown, Upload, Plus, Trash2, Search, FileJson, FileCode2, Image as ImageIcon } from "lucide-react";

const FileNode = ({ name, type, children, level = 0 }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const paddingLeft = `${level * 1.5 + 0.5}rem`;

  const getIcon = () => {
    if (type === 'folder') return <Folder className="h-4 w-4 text-cyan-400" />;
    if (name.endsWith('.json')) return <FileJson className="h-4 w-4 text-yellow-400" />;
    if (name.endsWith('.tsx') || name.endsWith('.ts')) return <FileCode2 className="h-4 w-4 text-blue-400" />;
    if (name.endsWith('.png') || name.endsWith('.svg')) return <ImageIcon className="h-4 w-4 text-purple-400" />;
    return <File className="h-4 w-4 text-gray-400" />;
  };

  return (
    <div>
      <div 
        className={`flex items-center gap-2 py-1.5 px-2 hover:bg-cyan-500/10 cursor-pointer text-sm transition-colors ${isOpen ? 'bg-white/5' : ''}`}
        style={{ paddingLeft }}
        onClick={() => type === 'folder' && setIsOpen(!isOpen)}
      >
        <div className="w-4 h-4 flex items-center justify-center">
          {type === 'folder' && (isOpen ? <ChevronDown className="h-3 w-3 text-white/50" /> : <ChevronRight className="h-3 w-3 text-white/50" />)}
        </div>
        {getIcon()}
        <span className="text-white/80">{name}</span>
      </div>
      {isOpen && children && (
        <div className="flex flex-col">
          {children.map((child: any, idx: number) => (
            <FileNode key={idx} {...child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function FileExplorer() {
  const [searchQuery, setSearchQuery] = useState("");

  const fileTree = [
    { name: "src", type: "folder", children: [
      { name: "components", type: "folder", children: [
        { name: "ui", type: "folder", children: [
          { name: "GlassCard.tsx", type: "file" },
          { name: "Button.tsx", type: "file" }
        ]},
        { name: "explorer", type: "folder", children: [
          { name: "FileExplorer.tsx", type: "file" }
        ]}
      ]},
      { name: "App.tsx", type: "file" },
      { name: "main.tsx", type: "file" },
      { name: "index.css", type: "file" }
    ]},
    { name: "public", type: "folder", children: [
      { name: "vite.svg", type: "file" },
      { name: "logo.png", type: "file" }
    ]},
    { name: "package.json", type: "file" },
    { name: "tsconfig.json", type: "file" },
    { name: "vite.config.ts", type: "file" }
  ];

  return (
    <div className="flex h-full flex-col bg-[#050a0f] text-white p-6 font-sans overflow-hidden relative" dir="ltr">
      <div className="absolute inset-0 pointer-events-none opacity-30" 
           style={{ backgroundImage: `radial-gradient(circle at 10% 10%, rgba(0, 255, 255, 0.05) 0%, transparent 50%)` }} />

      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-[#0f172a] border border-cyan-500/30 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(0,255,255,0.2)]">
            <Folder className="h-5 w-5 text-cyan-400" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-white tracking-wide">System Explorer</h1>
            <span dir="rtl" className="font-arabic text-xs text-cyan-400/80">مستكشف ملفات النظام</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files..."
              className="w-full bg-[#0f172a]/80 border border-cyan-500/50 rounded-full py-1.5 px-4 pl-9 text-sm text-white outline-none focus:border-cyan-400"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400" />
          </div>
          <button className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-300 hover:bg-cyan-500/20 transition-colors">
            <Plus className="h-4 w-4" />
          </button>
          <button className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-300 hover:bg-cyan-500/20 transition-colors">
            <Upload className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0 relative z-10">
        <GlassCard className="col-span-12 lg:col-span-4 flex flex-col bg-[#0a1118]/90 border-cyan-500/20 overflow-hidden" glowColor="rgba(0, 255, 255, 0.05)">
          <div className="p-3 border-b border-cyan-500/20 bg-[#0f172a]/80 flex items-center justify-between">
            <h3 className="text-xs font-bold text-cyan-100 uppercase tracking-wider">Workspace</h3>
            <span dir="rtl" className="font-arabic text-[10px] text-cyan-400/60">مساحة العمل</span>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
            {fileTree.map((node, idx) => (
              <FileNode key={idx} {...node} />
            ))}
          </div>
        </GlassCard>

        <GlassCard className="col-span-12 lg:col-span-8 flex flex-col bg-[#111827]/90 border-cyan-500/20 overflow-hidden items-center justify-center" glowColor="rgba(0, 255, 255, 0.02)">
          <Folder className="h-24 w-24 text-cyan-500/10 mb-4" />
          <p className="text-white/40 text-sm">Select a file to view its details</p>
          <p dir="rtl" className="font-arabic text-xs text-white/30 mt-2">حدد ملفاً لعرض تفاصيله</p>
        </GlassCard>
      </div>
    </div>
  );
}
