/**
 * ANOR-MATRX - Swarm Module Exports (v4)
 * 
 * Single Decision Authority Architecture
 */

export { SwarmOrchestrator, type AgentResult, type SwarmTask } from './SwarmOrchestrator';
export { SmartRouter, type RouteResult } from './SmartRouter';
export { TaskDecomposer, type DecomposedTask, type SubTask } from './TaskDecomposer';
export { SelfCorrection, type RetryConfig, type ExecutionResult } from './SelfCorrection';
export { AgentCollaboration, type AgentMessage, type CollaborationResult } from './AgentCollaboration';
export { SmartExecutor } from './SmartExecutor';
export { SwarmMemory, type MemoryEntry } from './SwarmMemory';