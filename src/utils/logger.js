import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import config from '../config/env.config.js';
import { getRequestId } from './requestContext.js';

const { combine, timestamp, colorize, errors, printf } = winston.format;

const customLevels = {
    levels: {
        fatal: 0,
        error: 1,
        warning: 2,
        info: 3,
        http: 4,
        debug: 5,
    },
    colors: {
        fatal: 'magenta',
        error: 'red',
        warning: 'yellow',
        info: 'green',
        http: 'cyan',
        debug: 'blue',
    },
};

winston.addColors(customLevels.colors);

const addRequestId = winston.format((info) => {
    const requestId = getRequestId();
    if (requestId && !info.requestId) {
        info.requestId = requestId;
    }
    return info;
});

const consoleFormat = printf(({ timestamp, level, message, requestId, stack, ...meta }) => {
    const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    const requestText = requestId ? ` [${requestId}]` : '';
    const stackText = stack ? `\n${stack}` : '';
    return `${timestamp} [${level}]${requestText}: ${message}${extra}${stackText}`;
});

const fileFormat = printf(({ timestamp, level, message, requestId, stack, ...meta }) => {
    const entry = {
        timestamp,
        level,
        message,
        ...(requestId ? { requestId } : {}),
        ...(Object.keys(meta).length ? meta : {}),
    };

    if (stack) {
        entry.stack = stack;
    }

    return JSON.stringify(entry);
});

const selectedLevel = config.logLevel && Object.prototype.hasOwnProperty.call(customLevels.levels, config.logLevel)
    ? config.logLevel
    : config.environment === 'production'
        ? 'info'
        : 'debug';

const logger = winston.createLogger({
    levels: customLevels.levels,
    level: selectedLevel,
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        addRequestId(),
        errors({ stack: true })
    ),
    transports: [
        new winston.transports.Console({
            format: combine(colorize({ all: true }), consoleFormat),
        }),
        new DailyRotateFile({
            filename: 'logs/error-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            level: 'error',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d',
            format: fileFormat,
        }),
        new DailyRotateFile({
            filename: 'logs/app-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            level: config.environment === 'production' ? 'info' : 'debug',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d',
            format: fileFormat,
        }),
    ],
});

export default logger;
