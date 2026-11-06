import logger from '../utils/logger.js';
import {randomUUID} from 'crypto';
import { requestContext } from '../utils/requestContext.js';

export const httpLogger = (req, res, next) => {
    const start = Date.now();
    const requestId = randomUUID();
    req.requestId = requestId;
    res.setHeader('X-Request-Id', requestId);

    res.on('finish', () => {
        logger.http(`${req.method} ${req.originalUrl} ${res.statusCode}`, {
            ms: Date.now() - start,
            requestId: req.requestId,
            statusCode: res.statusCode,
        });
    });

    requestContext.run({ requestId: req.requestId }, () => {
        next();
    });
};