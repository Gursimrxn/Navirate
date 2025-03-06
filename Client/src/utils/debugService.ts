/**
 * A simple debug service to track and log events through the app
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class DebugService {
  private enabled: boolean;
  private eventHistory: {timestamp: number, level: LogLevel, message: string, data?: any}[] = [];
  private maxHistory = 100;
  
  constructor() {
    // Enable in development or when debug param is in URL
    this.enabled = 
      process.env.NODE_ENV === 'development' || 
      new URLSearchParams(window.location.search).has('debug');
  }
  
  log(level: LogLevel, message: string, data?: any) {
    if (!this.enabled) return;
    
    const entry = {
      timestamp: Date.now(),
      level,
      message,
      data
    };
    
    this.eventHistory.push(entry);
    if (this.eventHistory.length > this.maxHistory) {
      this.eventHistory.shift();
    }
    
    // Log to console
    switch (level) {
      case 'debug': console.debug(`[DEBUG] ${message}`, data); break;
      case 'info': console.info(`[INFO] ${message}`, data); break;
      case 'warn': console.warn(`[WARN] ${message}`, data); break;
      case 'error': console.error(`[ERROR] ${message}`, data); break;
    }
  }
  
  debug(message: string, data?: any) {
    this.log('debug', message, data);
  }
  
  info(message: string, data?: any) {
    this.log('info', message, data);
  }
  
  warn(message: string, data?: any) {
    this.log('warn', message, data);
  }
  
  error(message: string, data?: any) {
    this.log('error', message, data);
  }
  
  getHistory() {
    return [...this.eventHistory];
  }
  
  clearHistory() {
    this.eventHistory = [];
  }
}

export const debugService = new DebugService();
