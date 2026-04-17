/**
 * ANOR-MATRX - Smart Planner with LLM
 * 
 * Uses Ollama for intelligent task planning and intent detection
 */

import axios from 'axios';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11435';
const PLANNING_MODEL = process.env.OLLAMA_PLANNING_MODEL || 'qwen2.5-coder:3b';

interface PlanningResult {
  intent: string;
  confidence: number;
  reasoning: string;
  suggestedAgent: string;
  steps: string[];
}

export class SmartPlanner {
  private ollamaUrl: string;

  constructor() {
    this.ollamaUrl = OLLAMA_BASE_URL;
  }

  /**
   * Analyze task with LLM for intelligent intent detection
   * @param task - The user task to analyze
   * @param _context - Optional context (for future use - memory context)
   */
  async analyze(task: string, _context?: any): Promise<PlanningResult> {
    const prompt = `You are an AI task classifier. Classify this task into ONE of these intents ONLY:
- python: Python code, run python, execute python, python decorators, python functions, any python-related
- code: Writing code in any language, fix code, create function, implement algorithm
- terminal: Shell commands, command line, bash, exec
- web: Web scraping, fetch URL, HTTP requests
- github: Git operations, commit, push, pull
- analysis: Explain, analyze, review, understand
- plan: Build project, create app, develop
- chat: General conversation only

Task: "${task}"

Return ONLY valid JSON (no other text):
{
  "intent": "python|code|terminal|web|github|analysis|plan|chat",
  "confidence": 0.0-1.0,
  "suggestedAgent": "python-agent|code-agent|terminal-agent|web-agent|github-agent|reasoning-agent|chat-agent",
  "steps": ["step1", "step2"]
}`;

    try {
      const response = await axios.post(`${this.ollamaUrl}/api/chat`, {
        model: PLANNING_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are an expert task classifier. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        stream: false,
      }, {
        timeout: 30000,
      });

      const content = response.data.message?.content || '';
      
      try {
        const parsed = JSON.parse(content);
        return {
          intent: parsed.intent || 'chat',
          confidence: Math.min(Math.max(parsed.confidence || 0.5, 0), 1),
          reasoning: parsed.reasoning || 'LLM decision',
          suggestedAgent: parsed.suggestedAgent || this.fallbackAgent(parsed.intent),
          steps: parsed.steps || this.defaultSteps(parsed.intent),
        };
      } catch {
        return this.fallbackParse(content, task);
      }
    } catch (error) {
      console.log('[SmartPlanner] LLM unavailable, using fallback');
      return this.keywordBasedPlanning(task);
    }
  }

  /**
   * Fallback: Keyword-based planning when LLM is unavailable
   */
  private keywordBasedPlanning(task: string): PlanningResult {
    const t = task.toLowerCase();
    // Priority order: python first, then code, then others
    const keywords: Record<string, { intent: string; agent: string; keywords: string[]; priority: number }> = {
      python: { 
        intent: 'python', 
        agent: 'python-agent', 
        keywords: ['python', 'run python', 'execute python', 'script', 'py file', 'pip', 'decorator', 'function', 'class', 'def ', 'import '],
        priority: 1 
      },
      code: { 
        intent: 'code', 
        agent: 'code-agent', 
        keywords: ['code', 'function', 'class', 'implement', 'write code', 'algorithm', 'create function', 'syntax'],
        priority: 2 
      },
      fix: { 
        intent: 'fix', 
        agent: 'code-agent', 
        keywords: ['fix', 'bug', 'error', 'repair', 'debug', 'issue'],
        priority: 3 
      },
      terminal: { 
        intent: 'terminal', 
        agent: 'terminal-agent', 
        keywords: ['terminal', 'command', 'shell', 'exec', 'bash', 'cmd'],
        priority: 4 
      },
      web: { 
        intent: 'web', 
        agent: 'web-agent', 
        keywords: ['web', 'scrape', 'fetch', 'http', 'site', 'url'],
        priority: 5 
      },
      github: { 
        intent: 'github', 
        agent: 'github-agent', 
        keywords: ['git', 'github', 'commit', 'push', 'pull', 'branch'],
        priority: 6 
      },
      analysis: { 
        intent: 'analysis', 
        agent: 'reasoning-agent', 
        keywords: ['analyze', 'explain', 'review', 'understand', 'describe'],
        priority: 7 
      },
      plan: { 
        intent: 'plan', 
        agent: 'reasoning-agent', 
        keywords: ['build', 'create', 'project', 'develop', 'architect', 'design'],
        priority: 8 
      },
    };

    let bestMatch = { intent: 'chat', agent: 'chat-agent', confidence: 0.3, priority: 999, keywords: [] as string[] };

    for (const [key, data] of Object.entries(keywords)) {
      for (const kw of data.keywords) {
        if (t.includes(kw)) {
          // Higher priority (lower number) = better match
          if (data.priority < bestMatch.priority || 
              (data.priority === bestMatch.priority && kw.length / t.length > bestMatch.confidence)) {
            bestMatch = { 
              intent: data.intent, 
              agent: data.agent, 
              confidence: kw.length / t.length, 
              priority: data.priority,
              keywords: data.keywords 
            };
          }
        }
      }
    }

    return {
      intent: bestMatch.intent,
      confidence: Math.min(bestMatch.confidence * 1.5, 0.95),
      reasoning: `Keyword match: ${bestMatch.keywords.slice(0,3).join(', ')}`,
      suggestedAgent: bestMatch.agent,
      steps: this.defaultSteps(bestMatch.intent),
    };
  }

  private fallbackAgent(intent: string): string {
    const map: Record<string, string> = {
      fix: 'code-agent',
      code: 'code-agent',
      python: 'python-agent',
      terminal: 'terminal-agent',
      file: 'tool-agent',
      web: 'web-agent',
      github: 'github-agent',
      analysis: 'reasoning-agent',
      plan: 'reasoning-agent',
      chat: 'chat-agent',
    };
    return map[intent] || 'chat-agent';
  }

  private defaultSteps(intent: string): string[] {
    const steps: Record<string, string[]> = {
      fix: ['Analyze error', 'Identify root cause', 'Generate fix', 'Validate'],
      code: ['Parse requirements', 'Generate code', 'Review', 'Return'],
      python: ['Parse Python code', 'Execute in environment', 'Return results'],
      terminal: ['Parse command', 'Execute in shell', 'Return output'],
      file: ['Check file operation', 'Execute', 'Confirm success'],
      web: ['Fetch content', 'Parse HTML', 'Extract data'],
      github: ['Authenticate', 'Execute Git operation', 'Return status'],
      analysis: ['Analyze content', 'Generate insights', 'Format response'],
      plan: ['Understand requirements', 'Create plan', 'Structure response'],
      chat: ['Generate response', 'Return to user'],
    };
    return steps[intent] || steps.chat;
  }

  private fallbackParse(content: string, task: string): PlanningResult {
    // Simple extraction from LLM response
    const intentMatch = content.match(/"intent"\s*:\s*"(\w+)"/);
    const intent = intentMatch ? intentMatch[1] : 'chat';
    
    return {
      intent,
      confidence: 0.6,
      reasoning: 'Parsed from LLM response',
      suggestedAgent: this.fallbackAgent(intent),
      steps: this.defaultSteps(intent),
    };
  }
}

export default SmartPlanner;
