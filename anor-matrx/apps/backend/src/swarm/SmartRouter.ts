/**
 * ANOR-MATRX - Smart AI Router v3
 * 
 * Uses LLM for intelligent routing (primary)
 * Falls back to keywords only when LLM unavailable
 */

import axios from 'axios';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11435';
const ROUTING_MODEL = process.env.OLLAMA_ROUTING_MODEL || 'qwen2.5-coder:3b';

export interface RouteResult {
  intent: string;
  confidence: number;
  reasoning?: string;
  suggestedAgent?: string;
  source: 'ai' | 'keyword' | 'memory';
}

export class SmartRouter {
  private ollamaUrl: string;
  private model: string;
  
  // Agent mapping (clean and simple)
  private agentMap: Record<string, string> = {
    python: 'python-agent',
    code: 'code-agent',
    fix: 'code-agent',
    terminal: 'terminal-agent',
    web: 'web-agent',
    github: 'github-agent',
    analysis: 'reasoning-agent',
    plan: 'reasoning-agent',
    chat: 'chat-agent',
  };

  constructor() {
    this.ollamaUrl = OLLAMA_BASE_URL;
    this.model = ROUTING_MODEL;
  }

  /**
   * Main routing method - Hybrid approach
   * 1. Try AI first (primary)
   * 2. Fallback to keywords (backup)
   * 3. Memory bias (if applicable)
   */
  async route(task: string, memoryContext?: { similarTasks: number; learnedFrom: string[] }): Promise<RouteResult> {
    console.log(`[SmartRouter] Processing: ${task}`);

    // 1. Try AI routing first
    const aiResult = await this.aiRoute(task);
    
    // 2. Get keyword fallback (backup)
    const keywordResult = this.keywordRoute(task);
    
    // 3. Determine final route
    let final: RouteResult;
    
    if (aiResult && aiResult.confidence >= 0.5) {
      // AI routing successful - add memory bias if available
      final = this.applyMemoryBias(aiResult, memoryContext);
      console.log(`[SmartRouter] Using AI route: ${final.intent} (${final.confidence})`);
    } else {
      // Fallback to keywords
      final = { 
        ...keywordResult, 
        source: 'keyword',
        reasoning: 'LLM unavailable or low confidence, using keyword fallback'
      };
      console.log(`[SmartRouter] Using keyword fallback: ${final.intent}`);
    }

    // Map to agent
    final.suggestedAgent = this.mapAgent(final.intent);
    
    return final;
  }

  /**
   * AI-based routing using LLM
   */
  private async aiRoute(task: string): Promise<RouteResult | null> {
    const prompt = `You are an AI routing system. Classify this task into ONE intent only.

INTENTS:
- python: Python code, run python, execute python, python decorators, any Python
- code: Writing code in any language, create function, implement algorithm
- fix: Fix bugs, fix errors, fix issues, repair
- terminal: Shell commands, command line, bash, exec
- web: Web scraping, fetch URL, HTTP requests
- github: Git operations, commit, push, pull
- analysis: Explain, analyze, review, understand code
- plan: Build project, create app, develop
- chat: General conversation

TASK: "${task}"

Return ONLY valid JSON (no text before or after):
{"intent":"python|code|fix|terminal|web|github|analysis|plan|chat","confidence":0.0-1.0}`;

    try {
      const response = await axios.post(`${this.ollamaUrl}/api/chat`, {
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert task classifier. Always return valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        stream: false,
      }, {
        timeout: 15000,
      });

      const content = response.data.message?.content || '';
      const parsed = JSON.parse(content);
      
      return {
        intent: parsed.intent || 'chat',
        confidence: Math.min(Math.max(parsed.confidence || 0.5, 0), 1),
        source: 'ai',
        reasoning: 'LLM decision',
      };
    } catch (error) {
      console.log('[SmartRouter] AI routing failed, using keyword fallback');
      return null;
    }
  }

  /**
   * Keyword-based routing (FALLBACK ONLY)
   */
  private keywordRoute(task: string): RouteResult {
    const t = task.toLowerCase();
    
    // Priority order: python first, then others
    const keywords: Record<string, { intent: string; keywords: string[]; priority: number }> = {
      python: { 
        intent: 'python', 
        keywords: ['python', 'run python', 'execute python', 'script', 'py file', 'pip', 'decorator', 'def ', 'class ', 'import '],
        priority: 1 
      },
      code: { 
        intent: 'code', 
        keywords: ['code', 'function', 'class', 'implement', 'write code', 'algorithm', 'create function', 'syntax'],
        priority: 2 
      },
      fix: { 
        intent: 'fix', 
        keywords: ['fix', 'bug', 'error', 'repair', 'debug', 'issue'],
        priority: 3 
      },
      terminal: { 
        intent: 'terminal', 
        keywords: ['terminal', 'command', 'shell', 'exec', 'bash', 'cmd'],
        priority: 4 
      },
      web: { 
        intent: 'web', 
        keywords: ['web', 'scrape', 'fetch', 'http', 'site', 'url'],
        priority: 5 
      },
      github: { 
        intent: 'github', 
        keywords: ['git', 'github', 'commit', 'push', 'pull', 'branch'],
        priority: 6 
      },
      analysis: { 
        intent: 'analysis', 
        keywords: ['analyze', 'explain', 'review', 'understand', 'describe'],
        priority: 7 
      },
      plan: { 
        intent: 'plan', 
        keywords: ['build', 'create', 'project', 'develop', 'architect', 'design'],
        priority: 8 
      },
    };

    let bestMatch = { intent: 'chat', priority: 999, confidence: 0.3 };

    for (const [key, data] of Object.entries(keywords)) {
      for (const kw of data.keywords) {
        if (t.includes(kw)) {
          if (data.priority < bestMatch.priority || 
              (data.priority === bestMatch.priority && kw.length / t.length > bestMatch.confidence)) {
            bestMatch = { 
              intent: data.intent, 
              priority: data.priority,
              confidence: Math.min(kw.length / t.length * 1.5, 0.8)
            };
          }
        }
      }
    }

    return {
      intent: bestMatch.intent,
      confidence: bestMatch.confidence,
      source: 'keyword',
      reasoning: 'Keyword match (fallback)',
    };
  }

  /**
   * Apply memory bias - boost confidence if learned from past
   */
  private applyMemoryBias(aiResult: RouteResult, memoryContext?: { similarTasks: number; learnedFrom: string[] }): RouteResult {
    if (!memoryContext || memoryContext.similarTasks === 0) {
      return aiResult;
    }

    // Boost confidence based on memory
    const memoryBoost = Math.min(memoryContext.similarTasks * 0.05, 0.15);
    const boostedConfidence = Math.min(aiResult.confidence + memoryBoost, 0.99);

    return {
      ...aiResult,
      confidence: boostedConfidence,
      reasoning: `${aiResult.reasoning} (memory boost: +${memoryBoost.toFixed(2)})`,
    };
  }

  /**
   * Map intent to agent
   */
  mapAgent(intent: string): string {
    const normalized = intent?.toLowerCase().trim() || 'chat';
    return this.agentMap[normalized] || 'chat-agent';
  }

  /**
   * Get available intents
   */
  getIntents(): string[] {
    return Object.keys(this.agentMap);
  }
}

export default SmartRouter;