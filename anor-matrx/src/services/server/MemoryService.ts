import fs from "fs";
import path from "path";

export class MemoryService {
  private file: string = path.join(process.cwd(), ".app_memory.json");
  private memory: { 
    projects: any[]; 
    chatHistory: { role: string; content: string; timestamp: string }[];
    knowledgeBase: Record<string, any>;
    lastTask?: string;
  } = { projects: [], chatHistory: [], knowledgeBase: {} };

  constructor() {
    this.load();
  }

  private load() {
    if (fs.existsSync(this.file)) {
      try {
        const data = fs.readFileSync(this.file, "utf-8");
        this.memory = JSON.parse(data);
        if (!this.memory.projects) this.memory.projects = [];
        if (!this.memory.chatHistory) this.memory.chatHistory = [];
        if (!this.memory.knowledgeBase) this.memory.knowledgeBase = {};
      } catch (e) {
        this.memory = { projects: [], chatHistory: [], knowledgeBase: {} };
      }
    }
  }

  private save() {
    fs.writeFileSync(this.file, JSON.stringify(this.memory, null, 4), "utf-8");
  }

  public addMessage(role: string, content: string) {
    this.memory.chatHistory.push({
      role,
      content,
      timestamp: new Date().toISOString()
    });
    // Keep last 50 messages for context
    if (this.memory.chatHistory.length > 50) {
      this.memory.chatHistory.shift();
    }
    this.save();
  }

  public getChatHistory() {
    return this.memory.chatHistory;
  }

  public getRecentContext(limit: number = 10): string {
    return this.memory.chatHistory
      .slice(-limit)
      .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join("\n");
  }

  public add(key: string, value: any) {
    (this.memory as any)[key] = value;
    this.save();
  }

  public get(key: string): any {
    return (this.memory as any)[key] || null;
  }

  public addProject(name: string, info: any) {
    this.memory.projects.push({
      name,
      info,
      timestamp: new Date().toISOString()
    });
    this.save();
  }

  public getProjects() {
    return this.memory.projects;
  }

  public updateKnowledge(key: string, info: any) {
    this.memory.knowledgeBase[key] = {
      data: info,
      updatedAt: new Date().toISOString()
    };
    this.save();
  }
}
