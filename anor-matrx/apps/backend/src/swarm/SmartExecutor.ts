/**
 * ANOR-MATRX - Smart Executor
 * 
 * Uses actual LLM models for real agent execution
 */

import axios from 'axios';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11435';

interface ExecutionResult {
  agent: string;
  output: any;
  intent: string;
  confidence: number;
  model: string;
  latencyMs: number;
}

// Model selection based on agent type
const AGENT_MODELS: Record<string, string> = {
  'code-agent': process.env.OLLAMA_CODE_MODEL || 'qwen2.5-coder:3b',
  'python-agent': process.env.OLLAMA_PYTHON_MODEL || 'deepseek-coder:latest',
  'terminal-agent': process.env.OLLAMA_CODE_MODEL || 'qwen2.5-coder:3b',
  'tool-agent': process.env.OLLAMA_MODEL || 'gemma3:latest',
  'web-agent': process.env.OLLAMA_MODEL || 'gemma3:latest',
  'github-agent': process.env.OLLAMA_MODEL || 'gemma3:latest',
  'reasoning-agent': process.env.OLLAMA_REASONING_MODEL || 'deepseek-r1:latest',
  'chat-agent': process.env.OLLAMA_CHAT_MODEL || 'gemma3:latest',
};

// System prompts for each agent
const AGENT_PROMPTS: Record<string, string> = {
  'code-agent': `You are an expert code assistant. Help with writing, fixing, and reviewing code. Provide clean, well-documented code.`,
  'python-agent': `You are a Python expert. Execute Python code, explain errors, and help with scripting.`,
  'terminal-agent': `You are a shell command expert. Generate and explain terminal commands.`,
  'tool-agent': `You are a file operations expert. Help with reading, writing, and managing files.`,
  'web-agent': `You are a web scraping expert. Help fetch and parse web content.`,
  'github-agent': `You are a Git/GitHub expert. Help with commits, branches, and pull requests.`,
  'reasoning-agent': `You are an expert analyst. Provide deep analysis, explanations, and reasoning.`,
  'chat-agent': `You are a helpful AI assistant.`,
};

export class SmartExecutor {
  private ollamaUrl: string;

  constructor() {
    this.ollamaUrl = OLLAMA_BASE_URL;
  }

  /**
   * Execute task with the appropriate agent using LLM
   */
  async execute(agent: string, task: string, context?: any): Promise<ExecutionResult> {
    const model = AGENT_MODELS[agent] || AGENT_MODELS['chat-agent'];
    const systemPrompt = AGENT_PROMPTS[agent] || AGENT_PROMPTS['chat-agent'];
    const startTime = Date.now();

    console.log(`[SmartExecutor] Using model: ${model} for agent: ${agent}`);

    try {
      // Build messages
      const messages = [
        { role: 'system', content: systemPrompt },
      ];

      // Add context if available
      if (context?.history?.length) {
        messages.push(...context.history.slice(-5).map((msg: any) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })));
      }

      // Add current task
      messages.push({ role: 'user', content: task });

      const response = await axios.post(`${this.ollamaUrl}/api/chat`, {
        model,
        messages,
        stream: false,
      }, {
        timeout: 60000,
      });

      const latencyMs = Date.now() - startTime;
      const output = response.data.message?.content || 'No response';

      return {
        agent,
        output: this.formatOutput(agent, output),
        intent: this.agentToIntent(agent),
        confidence: 0.85,
        model,
        latencyMs,
      };
    } catch (error: any) {
      const latencyMs = Date.now() - startTime;
      console.error(`[SmartExecutor] Error:`, error.message);

      return {
        agent,
        output: { error: error.message, fallback: true },
        intent: this.agentToIntent(agent),
        confidence: 0.3,
        model,
        latencyMs,
      };
    }
  }

  /**
   * Execute code with code-agent
   */
  async executeCode(task: string, language: string = 'typescript'): Promise<ExecutionResult> {
    const model = AGENT_MODELS['code-agent'];
    const prompt = `Write ${language} code for: ${task}\n\nProvide only the code, no explanations.`;

    const startTime = Date.now();

    try {
      const response = await axios.post(`${this.ollamaUrl}/api/chat`, {
        model,
        messages: [
          { role: 'system', content: 'You are an expert programmer. Write clean, working code.' },
          { role: 'user', content: prompt },
        ],
        stream: false,
      });

      return {
        agent: 'code-agent',
        output: {
          language,
          code: response.data.message?.content || '',
        },
        intent: 'code',
        confidence: 0.9,
        model,
        latencyMs: Date.now() - startTime,
      };
    } catch (error: any) {
      return {
        agent: 'code-agent',
        output: { error: error.message },
        intent: 'code',
        confidence: 0.3,
        model,
        latencyMs: Date.now() - startTime,
      };
    }
  }

  /**
   * Execute with reasoning model for complex tasks
   */
  async executeWithReasoning(task: string): Promise<ExecutionResult> {
    const model = AGENT_MODELS['reasoning-agent'];
    const startTime = Date.now();

    try {
      const response = await axios.post(`${this.ollamaUrl}/api/chat`, {
        model,
        messages: [
          { role: 'system', content: 'You are an expert analyst. Think step by step and provide detailed analysis.' },
          { role: 'user', content: task },
        ],
        stream: false,
      });

      return {
        agent: 'reasoning-agent',
        output: {
          analysis: response.data.message?.content || '',
        },
        intent: 'analysis',
        confidence: 0.9,
        model,
        latencyMs: Date.now() - startTime,
      };
    } catch (error: any) {
      return {
        agent: 'reasoning-agent',
        output: { error: error.message },
        intent: 'analysis',
        confidence: 0.3,
        model,
        latencyMs: Date.now() - startTime,
      };
    }
  }

  private formatOutput(agent: string, output: string): any {
    switch (agent) {
      case 'code-agent':
        return { response: output };
      case 'python-agent':
        return { python: output };
      case 'terminal-agent':
        return { command: output };
      default:
        return { response: output };
    }
  }

  private agentToIntent(agent: string): string {
    return agent.replace('-agent', '');
  }

  /**
   * Check available models
   */
  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await axios.get(`${this.ollamaUrl}/api/tags`);
      return response.data.models?.map((m: any) => m.name) || [];
    } catch {
      return [];
    }
  }
}

export default SmartExecutor;
