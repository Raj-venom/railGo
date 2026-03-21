
import pino, { Logger } from 'pino';
import { config } from './index';

interface LogMeta {
    service: string;
    [key: string]: any;
}

const logger: Logger & {
    info: (msg: string, meta?: Partial<LogMeta>) => void;
    error: (msg: string, meta?: Partial<LogMeta>) => void;
    warn: (msg: string, meta?: Partial<LogMeta>) => void;
    debug: (msg: string, meta?: Partial<LogMeta>) => void;
} = pino({
    level: config.LOG_LEVEL || 'info',
    base: { service: config.SERVICE_NAME },
    transport: config.NODE_ENV === 'development' ? {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname', // 
            messageFormat: `[${config.SERVICE_NAME}]: {msg}`,
        }
    } : undefined,
}) as any;

export default logger;