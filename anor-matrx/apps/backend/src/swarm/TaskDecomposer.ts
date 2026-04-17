/**
 * ANOR-MATRX - Task Decomposer v4
 * 
 * Breaks complex tasks into subtasks for multi-agent execution
 */

import axios from 'axios';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11435';
const PLANNING_MODEL = process.env.OLLAMA_PLANNING_MODEL || 'deepseek-r1:latest';

export interface SubTask {
  id: string;
  description: string;
  agent: string;
  dependencies: string[];
  priority: number;
}

export interface DecomposedTask {
  originalTask: string;
  subtasks: SubTask[];
  needsMultiAgent: boolean;
  estimatedComplexity: number;
}

export class TaskDecomposer {
  private ollamaUrl: string;

  constructor() {
    this.ollamaUrl = OLLAMA_BASE_URL;
  }

  /**
   * Decompose a complex task into subtasks
   */
  async decompose(task: string): Promise<DecomposedTask> {
    const prompt = `You are a task decomposition system. Break down this complex task into smaller subtasks.

Task: "${task}"

Instructions:
- If task is simple (one step), return single subtask
- If task is complex, break into 2-5 subtasks
- Each subtask needs: description, suitable agent type

Agent Types:
- python-agent: Python code, scripts
- code-agent: General code, algorithms
- terminal-agent: Shell commands
- web-agent: Web scraping, API calls
- reasoning-agent: Analysis, planning, explanations
- chat-agent: Simple responses

Return ONLY valid JSON:
{
  "subtasks": [
    {
      "id": "task_1",
      "description": "...",
      "agent": "python-agent",
      "dependencies": [],
      "priority": 1
    }
  ],
  "needsMultiAgent": true/false,
  "estimatedComplexity": 1-10
}`;

    try {
      const response = await axios.post(`${this.ollamaUrl}/api/chat`, {
        model: PLANNING_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are an expert task decomposer. Always return valid JSON.'
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
      const parsed = JSON.parse(content);

      return {
        originalTask: task,
        subtasks: parsed.subtasks || [],
        needsMultiAgent: parsed.needsMultiAgent || false,
        estimatedComplexity: parsed.estimatedComplexity || 1,
      };
    } catch (error) {
      // Fallback: single task
      return this.fallbackDecompose(task);
    }
  }

  /**
   * Fallback decomposition for simple tasks
   */
  private fallbackDecompose(task: string): DecomposedTask {
    const t = task.toLowerCase();
    let agent = 'chat-agent';
    
    if (t.includes('python') || t.includes('run python')) {
      agent = 'python-agent';
    } else if (t.includes('code') || t.includes('function') || t.includes('build')) {
      agent = 'code-agent';
    } else if (t.includes('terminal') || t.includes('command')) {
      agent = 'terminal-agent';
    } else if (t.includes('web') || t.includes('scrape')) {
      agent = 'web-agent';
    } else if (t.includes('explain') || t.includes('analyze')) {
      agent = 'reasoning-agent';
    }

    return {
      originalTask: task,
      subtasks: [
        {
          id: 'task_1',
          description: task,
          agent,
          dependencies: [],
          priority: 1,
        }
      ],
      needsMultiAgent: false,
      estimatedComplexity: 1,
    };
  }
}

export default TaskDecomposer;