/**
 * ANOR-MATRX - Agent Collaboration v4
 * 
 * Enables agents to communicate and collaborate on complex tasks
 */

import { SmartExecutor } from './SmartExecutor';

export interface AgentMessage {
  from: string;
  to: string;
  content: string;
  type: 'request' | 'response' | 'error';
  timestamp: string;
}

export interface CollaborationResult {
  primaryAgent: string;
  contributions: Map<string, any>;
  finalOutput: any;
  success: boolean;
}

export class AgentCollaboration {
  private executor: SmartExecutor;
  private messageHistory: AgentMessage[] = [];

  constructor() {
    this.executor = new SmartExecutor();
  }

  /**
   * Execute task with agent collaboration if needed
   */
  async execute(task: string, agent: string, subtasks?: string[]): Promise<CollaborationResult> {
    const contributions = new Map<string, any>();
    
    console.log(`[AgentCollaboration] Starting with agent: ${agent}`);

    // Execute primary task
    try {
      const primaryResult = await this.executor.execute(agent, task);
      contributions.set(agent, primaryResult.output);

      // If subtasks exist, execute them in parallel
      if (subtasks && subtasks.length > 0) {
        console.log(`[AgentCollaboration] Executing ${subtasks.length} subtasks in parallel`);
        
        const subtaskResults = await Promise.all(
          subtasks.map(async (subtask, index) => {
            const subtaskAgent = this.getSubtaskAgent(index);
            try {
              const result = await this.executor.execute(subtaskAgent, subtask);
              return { agent: subtaskAgent, output: result.output, success: true };
            } catch (error: any) {
              return { agent: subtaskAgent, output: error.message, success: false };
            }
          })
        );

        // Add subtask contributions
        subtaskResults.forEach(result => {
          contributions.set(result.agent, result.output);
        });
      }

      return {
        primaryAgent: agent,
        contributions,
        finalOutput: contributions.get(agent),
        success: true,
      };
    } catch (error: any) {
      return {
        primaryAgent: agent,
        contributions,
        finalOutput: null,
        success: false,
      };
    }
  }

  /**
   * Get appropriate agent for subtask based on index
   */
  private getSubtaskAgent(index: number): string {
    const agents = ['python-agent', 'code-agent', 'reasoning-agent', 'terminal-agent'];
    return agents[index % agents.length];
  }

  /**
   * Send message between agents
   */
  sendMessage(from: string, to: string, content: string, type: 'request' | 'response' | 'error' = 'request'): void {
    const message: AgentMessage = {
      from,
      to,
      content,
      type,
      timestamp: new Date().toISOString(),
    };
    this.messageHistory.push(message);
    console.log(`[AgentCollaboration] ${from} → ${to}: ${content.substring(0, 50)}...`);
  }

  /**
   * Get message history
   */
  getHistory(): AgentMessage[] {
    return this.messageHistory;
  }

  /**
   * Clear message history
   */
  clearHistory(): void {
    this.messageHistory = [];
  }
}

export default AgentCollaboration;