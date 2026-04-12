/**
 * 🛡️ SecurityService - Command Whitelisting & Execution Validation
 * Inspired by OpenClaw Real Mode V3
 */

export const COMMAND_WHITELIST = [
  'cleanmgr', 
  'sfc', 
  'tasklist', 
  'fsutil', 
  'npm', 
  'git', 
  'ls', 
  'dir', 
  'pwd', 
  'cd', 
  'echo', 
  'type', 
  'cat', 
  'mkdir',
  'node',
  'tsx',
  'vite'
];

export class SecurityService {
  /**
   * Checks if a command is allowed to run.
   */
  public isCommandWhitelisted(command: string): boolean {
    const baseCommand = command.trim().split(/\s+/)[0].toLowerCase();
    
    // Remove .exe extension if present for check
    const cleanCommand = baseCommand.endsWith('.exe') ? baseCommand.slice(0, -4) : baseCommand;
    
    return COMMAND_WHITELIST.includes(cleanCommand);
  }

  /**
   * Validates a path to ensure it's within the project directory.
   */
  public isPathSafe(filePath: string, workspaceRoot: string): boolean {
    const path = require('path');
    const resolvedPath = path.resolve(workspaceRoot, filePath);
    return resolvedPath.startsWith(workspaceRoot);
  }
}
