/**
 * ANOR-MATRX - Swarm Orchestrator v4 (True Autonomous Loop)
 * 
 * Features:
 * - Task Decomposition
 * - AI Routing (LLM-based)
 * - Agent Collaboration
 * - Self-Correction Loop
 * - Memory Layer
 */

import { SmartRouter, RouteResult } from './SmartRouter';
import { SmartExecutor } from './SmartExecutor';
import { SwarmMemory } from './SwarmMemory';
import { TaskDecomposer } from './TaskDecomposer';
import { SelfCorrection } from './SelfCorrection';
import { AgentCollaboration } from './AgentCollaboration';

export type AgentResult = {
  agent: string;
  output: any;
  confidence: number;
  latencyMs?: number;
};

export type SwarmTask = {
  task: string;
  plan: RouteResult;
  route: string;
  result: AgentResult;
  memory?: any;
  decomposition?: {
    subtasks: number;
    complexity: number;
  };
  corrections?: number;
};

export class SwarmOrchestrator {
  private router = new SmartRouter();
  private executor = new SmartExecutor();
  private memory = new SwarmMemory();
  private decomposer = new TaskDecomposer();
  private selfCorrection = new SelfCorrection();
  private collaboration = new AgentCollaboration();

  constructor() {
    console.log('[Swarm v4] Autonomous Orchestrator initialized');
  }

  /**
   * Main execution with full autonomous loop
   */
  async run(task: string, context?: any): Promise<SwarmTask> {
    console.log(`[Swarm v4] Processing: ${task}`);

    // 1) Memory lookup
    const similar = await this.memory.retrieve(task, 3);
    const memoryContext = similar.length
      ? { similarTasks: similar.length, learnedFrom: similar.map((s: any) => s.intent) }
      : undefined;

    // 2) Task Decomposition (for complex tasks)
    const decomposition = await this.decomposer.decompose(task);
    console.log(`[Swarm v4] Decomposed into ${decomposition.subtasks.length} subtasks (complexity: ${decomposition.estimatedComplexity})`);

    // 3) AI Routing with retry
    let routeResult: RouteResult;
    let corrections = 0;
    
    const routeExecution = async (attempt: number) => {
      return await this.router.route(task, memoryContext);
    };

    const routeWithRetry = await this.selfCorrection.executeWithRetry(
      `Route task: ${task}`,
      routeExecution
    );

    routeResult = routeWithRetry.data!;
    corrections = routeWithRetry.attempts - 1;

    if (!routeWithRetry.success) {
      console.error('[Swarm v4] Routing failed after retries');
    }

    console.log(`[Swarm v4] Route: ${routeResult.intent} → ${routeResult.suggestedAgent} (${routeResult.source})`);

    // 4) Execute with self-correction
    const agent = routeResult.suggestedAgent || 'chat-agent';
    const subtasks = decomposition.subtasks.slice(1).map(s => s.description);

    let result: AgentResult;
    const execWithRetry = await this.selfCorrection.executeWithRetry(
      `Execute: ${task} with ${agent}`,
      async (attempt: number) => {
        // Use collaboration for complex tasks
        if (decomposition.needsMultiAgent) {
          const collab = await this.collaboration.execute(task, agent, subtasks);
          return {
            agent,
            output: collab.finalOutput,
            confidence: collab.success ? 0.85 : 0.3,
            latencyMs: 0,
          };
        }
        return await this.executor.execute(agent, task, context);
      },
      { maxRetries: 2 }
    );

    result = execWithRetry.data!;
    corrections += execWithRetry.attempts - 1;

    // 5) Self-evaluation
    const evaluation = await this.selfCorrection.evaluateAndCorrect(result.output, {
      minLength: 10,
      hasError: true,
    });

    if (evaluation.needsCorrection) {
      console.log(`[Swarm v4] Self-correction triggered: ${evaluation.reason}`);
      corrections++;
    }

    // 6) Store memory
    await this.memory.store({
      task,
      intent: routeResult.intent,
      agent,
      confidence: routeResult.confidence,
      result: result.output,
      success: result.confidence > 0.5,
    } as any);

    console.log(`[Swarm v4] Completed with ${corrections} corrections`);

    return {
      task,
      plan: routeResult,
      route: agent,
      result,
      memory: memoryContext,
      decomposition: {
        subtasks: decomposition.subtasks.length,
        complexity: decomposition.estimatedComplexity,
      },
      corrections,
    };
  }

  /**
   * Get status with all v4 features
   */
  async getStatus() {
    const models = await (this as any).executor?.getAvailableModels?.();
    const stats = await this.memory.getIntentStats();
    
    return {
      service: 'Swarm Orchestrator',
      version: '4.0.0',
      status: 'active',
      type: 'Autonomous',
      features: {
        taskDecomposition: true,
        aiRouting: true,
        agentCollaboration: true,
        selfCorrection: true,
        memory: true,
        llmExecution: true,
      },
      agents: [
        'code-agent',
        'python-agent',
        'terminal-agent',
        'tool-agent',
        'web-agent',
        'github-agent',
        'reasoning-agent',
        'chat-agent',
      ],
      stats,
      availableModels: models ?? [],
    };
  }

  /**
   * Add feedback for learning
   */
  async addFeedback(taskId: string, feedback: string) {
    // Future implementation
  }

  /**
   * Get recent tasks
   */
  async getRecentTasks(limit: number = 10) {
    return this.memory.getRecent(limit);
  }

  /**
   * Clear memory
   */
  async clearMemory() {
    return this.memory.clear();
  }
}

export default SwarmOrchestrator;