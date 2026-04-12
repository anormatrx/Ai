import fs from 'node:fs';
import path from 'node:path';

const LOG_DIR = path.join(process.cwd(), 'logs');
const ACTIVITY_LOG = path.join(LOG_DIR, 'activity.log');
const MAX_LINES = 500;

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

export type LogLevel = 'info' | 'warn' | 'error' | 'success';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  action: string;
  service?: string;
  message: string;
  details?: Record<string, unknown>;
}

function formatLogEntry(entry: LogEntry): string {
  const detailsStr = entry.details ? ` ${JSON.stringify(entry.details)}` : '';
  return `[${entry.timestamp}] [${entry.level.toUpperCase()}] [${entry.action}]${entry.service ? ` [${entry.service}]` : ''}: ${entry.message}${detailsStr}`;
}

export function activityLog(level: LogLevel, action: string, message: string, service?: string, details?: Record<string, unknown>) {
  ensureLogDir();
  
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    action,
    service,
    message,
    details,
  };
  
  const line = formatLogEntry(entry) + '\n';
  fs.appendFileSync(ACTIVITY_LOG, line, 'utf-8');
  
  rotateLogIfNeeded();
  
  return entry;
}

function rotateLogIfNeeded() {
  if (!fs.existsSync(ACTIVITY_LOG)) return;
  
  const content = fs.readFileSync(ACTIVITY_LOG, 'utf-8');
  const lines = content.split('\n').filter(l => l.trim());
  
  if (lines.length > MAX_LINES) {
    const rotated = lines.slice(-MAX_LINES);
    fs.writeFileSync(ACTIVITY_LOG, rotated.join('\n') + '\n', 'utf-8');
  }
}

export function getActivityLogs(limit = 50): LogEntry[] {
  if (!fs.existsSync(ACTIVITY_LOG)) return [];
  
  const content = fs.readFileSync(ACTIVITY_LOG, 'utf-8');
  const lines = content.split('\n').filter(l => l.trim()).slice(-limit);
  
  return lines.map(line => {
    const match = line.match(/^\[([^\]]+)\] \[([^\]]+)\] \[([^\]]+)\](?: \[([^\]]+)\])?: (.*)$/);
    if (!match) return null;
    
    const [, timestamp, level, action, service, rest] = match;
    let details: Record<string, unknown> | undefined;
    
    try {
      const detailStart = rest.indexOf(' {');
      if (detailStart > 0) {
        details = JSON.parse(rest.slice(detailStart));
      }
    } catch {}
    
    return {
      timestamp,
      level: level as LogLevel,
      action,
      service,
      message: rest,
      details,
    };
  }).filter(Boolean) as LogEntry[];
}

export function clearActivityLogs() {
  if (fs.existsSync(ACTIVITY_LOG)) {
    fs.unlinkSync(ACTIVITY_LOG);
  }
}