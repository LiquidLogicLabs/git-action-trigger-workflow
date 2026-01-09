/**
 * Logger utility with verbose/debug support
 * Provides consistent logging across the action
 */
export declare class Logger {
    readonly verbose: boolean;
    constructor(verbose?: boolean);
    /**
     * Log an info message
     */
    info(message: string): void;
    /**
     * Log a warning message
     */
    warning(message: string): void;
    /**
     * Log an error message
     */
    error(message: string): void;
    /**
     * Log a debug message - uses core.info() when verbose is true so it always shows
     * Falls back to core.debug() when verbose is false (for when ACTIONS_STEP_DEBUG is set at workflow level)
     */
    debug(message: string): void;
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
export declare function createLogger(verbose: boolean): LegacyLogger;
