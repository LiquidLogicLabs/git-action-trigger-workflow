import * as core from '@actions/core';

/**
 * Logger utility with verbose/debug support
 * Provides consistent logging across the action
 */
export class Logger {
  public readonly verbose: boolean;

  constructor(verbose: boolean = false) {
    this.verbose = verbose;
  }

  /**
   * Log an info message
   */
  info(message: string): void {
    core.info(message);
  }

  /**
   * Log a warning message
   */
  warning(message: string): void {
    core.warning(message);
  }

  /**
   * Log an error message
   */
  error(message: string): void {
    core.error(message);
  }

  /**
   * Log a debug message - uses core.info() when verbose is true so it always shows
   * Falls back to core.debug() when verbose is false (for when ACTIONS_STEP_DEBUG is set at workflow level)
   */
  debug(message: string): void {
    if (this.verbose) {
      core.info(`[DEBUG] ${message}`);
    } else {
      core.debug(message);
    }
  }
}

/**
 * @deprecated Use Logger class directly instead
 * Kept for backward compatibility
 */
export type LegacyLogger = {
  info: (msg: string) => void;
  warn: (msg: string) => void;
  error: (msg: string) => void;
  debug: (msg: string) => void;
};

/**
 * @deprecated Use `new Logger(verbose)` instead
 * Kept for backward compatibility
 */
export function createLogger(verbose: boolean): LegacyLogger {
  const logger = new Logger(verbose);
  return {
    info: (msg) => logger.info(msg),
    warn: (msg) => logger.warning(msg),
    error: (msg) => logger.error(msg),
    debug: (msg) => logger.debug(msg),
  };
}


