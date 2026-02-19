import pino, { Logger, LogDescriptor } from 'pino';
import { config } from './index';

// Define the structure of the log metadata
interface LogMeta {
    service: string;
    [key: string]: any; // for additional fields like userId, requestId etc.
}

// Create a typed logger
const logger: Logger & {
    info: (msg: string, meta?: Partial<LogMeta>) => void;
    error: (msg: string, meta?: Partial<LogMeta>) => void;
    warn: (msg: string, meta?: Partial<LogMeta>) => void;
    debug: (msg: string, meta?: Partial<LogMeta>) => void;
} = pino({
    level: config.LOG_LEVEL || 'info',
    base: { service: config.SERVICE_NAME },
    transport: process.env.NODE_ENV === 'development' ? {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'SYS:standard', // human-readable timestamp
            ignore: 'pid,hostname',
            messageFormat: (log: LogDescriptor, messageKey: string) => {
                // This mimics Winston printf style
                const levelName = log.level === 10 ? 'trace' :
                    log.level === 20 ? 'debug' :
                        log.level === 30 ? 'info' :
                            log.level === 40 ? 'warn' :
                                log.level === 50 ? 'error' :
                                    'fatal';
                return `[${new Date(log.time).toISOString()}] [${levelName}] [${log.service}]: ${log[messageKey]}`;
            }
        }
    } : undefined,
}) as any; // casting as any temporarily, since pino's types are generic

export default logger;
