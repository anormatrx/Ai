/**
 * ANOR-MATRX - Swarm Memory Layer
 * 
 * Stores Swarm decisions and learning for better routing
 */

import fs from 'fs';
import path from 'path';

export interface MemoryEntry {
  id: string;
  timestamp: string;
  task: string;
  intent: string;
  agent: string;
  confidence: number;
  result?: any;
  success: boolean;
  feedback?: 'positive' | 'negative' | 'neutral';
}

export class SwarmMemory {
  private memoryPath: string;
  private memory: MemoryEntry[];
  private maxEntries: number;

  constructor(dataDir?: string) {
    this.memoryPath = path.join(dataDir || process.env.APP_DATA_DIR || '.', 'swarm-memory.json');
    this.memory = [];
    this.maxEntries = 100;
    this.load();
  }

  /**
   * Store a decision in memory
   */
  async store(entry: Omit<MemoryEntry, 'id' | 'timestamp'>): Promise<MemoryEntry> {
    const fullEntry: MemoryEntry = {
      ...entry,
      id: this.generateId(),
      timestamp: new Date().toISOString(),
    };

    this.memory.push(fullEntry);

    // Keep only recent entries
    if (this.memory.length > this.maxEntries) {
      this.memory = this.memory.slice(-this.maxEntries);
    }

    this.save();
    console.log(`[SwarmMemory] Stored: ${fullEntry.id}`);

    return fullEntry;
  }

  /**
   * Retrieve similar past decisions
   */
  async retrieve(task: string, limit: number = 5): Promise<MemoryEntry[]> {
    const taskLower = task.toLowerCase();
    const keywords = taskLower.split(' ').filter(w => w.length > 3);

    const scored = this.memory.map(entry => {
      let score = 0;
      const entryLower = entry.task.toLowerCase();
      
      for (const kw of keywords) {
        if (entryLower.includes(kw)) score += 1;
      }
      if (entry.intent === this.detectSimpleIntent(taskLower)) score += 2;
      if (entry.success) score += 1;

      return { entry, score };
    });

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(s => s.entry);
  }

  /**
   * Get most common intents for learning
   */
  async getIntentStats(): Promise<Record<string, { count: number; successRate: number }>> {
    const stats: Record<string, { count: number; success: number }> = {};

    for (const entry of this.memory) {
      if (!stats[entry.intent]) {
        stats[entry.intent] = { count: 0, success: 0 };
      }
      stats[entry.intent].count++;
      if (entry.success) stats[entry.intent].success++;
    }

    return Object.fromEntries(
      Object.entries(stats).map(([intent, data]) => [
        intent,
        {
          count: data.count,
          successRate: data.count > 0 ? data.success / data.count : 0,
        },
      ])
    );
  }

  /**
   * Add feedback to a decision
   */
  async addFeedback(id: string, feedback: 'positive' | 'negative' | 'neutral'): Promise<void> {
    const entry = this.memory.find(e => e.id === id);
    if (entry) {
      entry.feedback = feedback;
      this.save();
      console.log(`[SwarmMemory] Feedback added: ${id} = ${feedback}`);
    }
  }

  /**
   * Get recent decisions
   */
  async getRecent(limit: number = 10): Promise<MemoryEntry[]> {
    return this.memory.slice(-limit);
  }

  /**
   * Clear all memory
   */
  async clear(): Promise<void> {
    this.memory = [];
    this.save();
    console.log('[SwarmMemory] Cleared');
  }

  private detectSimpleIntent(task: string): string {
    const keywords: Record<string, string[]> = {
      fix: ['fix', 'bug', 'error'],
      code: ['code', 'function', 'class'],
      python: ['python', 'script'],
      terminal: ['terminal', 'command', 'shell'],
      file: ['file', 'folder'],
      web: ['web', 'scrape'],
      github: ['git', 'github'],
      analysis: ['analyze', 'explain'],
      plan: ['build', 'create', 'project'],
    };

    for (const [intent, kws] of Object.entries(keywords)) {
      if (kws.some(k => task.includes(k))) return intent;
    }
    return 'chat';
  }

  private generateId(): string {
    return `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private load(): void {
    try {
      if (fs.existsSync(this.memoryPath)) {
        const data = fs.readFileSync(this.memoryPath, 'utf-8');
        this.memory = JSON.parse(data);
        console.log(`[SwarmMemory] Loaded ${this.memory.length} entries`);
      }
    } catch (error) {
      console.log('[SwarmMemory] No existing memory found');
      this.memory = [];
    }
  }

  private save(): void {
    try {
      const dir = path.dirname(this.memoryPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.memoryPath, JSON.stringify(this.memory, null, 2));
    } catch (error) {
      console.error('[SwarmMemory] Save error:', error);
    }
  }
}

export default SwarmMemory;
