import React, { useState, useEffect } from "react";
import { Folder, File, RefreshCw, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FileItem {
  name: string;
  isDirectory: boolean;
}

interface FileExplorerProps {
  onFileSelect: (path: string) => void;
}

export default function FileExplorer({ onFileSelect }: FileExplorerProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentPath, setCurrentPath] = useState(".");
  const [isLoading, setIsLoading] = useState(false);

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/files?path=${currentPath}`);
      const data = await response.json();
      setFiles(data.files);
    } catch (error) {
      console.error("Failed to fetch files:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [currentPath]);

  return (
    <div className="flex flex-col h-full bg-black/20 rounded-xl border border-white/5 overflow-hidden">
      <div className="p-3 border-b border-white/5 flex items-center justify-between bg-white/5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">مستكشف الملفات</span>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={fetchFiles}>
            <RefreshCw className={isLoading ? "animate-spin h-3 w-3" : "h-3 w-3"} />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-1">
          {files.map((file) => (
            <div 
              key={file.name}
              onClick={() => !file.isDirectory && onFileSelect(file.name)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group"
            >
              {file.isDirectory ? (
                <Folder className="h-4 w-4 text-cyan-400" />
              ) : (
                <File className="h-4 w-4 text-white/40" />
              )}
              <span className="text-xs text-white/80 truncate flex-1">{file.name}</span>
              <Trash2 className="h-3 w-3 text-white/0 group-hover:text-red-400/50 transition-colors" />
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
