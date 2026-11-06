import multer from 'multer';
import logger from '../utils/logger.js';
import { CustomError, ErrorDictionary, getErrorIdByCode } from '../utils/errors.js';

const normalizeError = (error) => {
    let formattedError = error;

    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            formattedError = new CustomError({
                id: ErrorDictionary.FILE_TOO_LARGE.id,
                name: ErrorDictionary.FILE_TOO_LARGE.name,
                message: ErrorDictionary.FILE_TOO_LARGE.message,
                code: ErrorDictionary.FILE_TOO_LARGE.code,
                statusCode: ErrorDictionary.FILE_TOO_LARGE.status,
                cause: error
            });
        } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            formattedError = new CustomError({
                id: ErrorDictionary.UNEXPECTED_FILE_FIELD.id,
                name: ErrorDictionary.UNEXPECTED_FILE_FIELD.name,
                message: ErrorDictionary.UNEXPECTED_FILE_FIELD.message,
                code: ErrorDictionary.UNEXPECTED_FILE_FIELD.code,
                statusCode: ErrorDictionary.UNEXPECTED_FILE_FIELD.status,
                cause: error
            });
        } else if (error.code === 'LIMIT_FILE_COUNT' || error.code === 'LIMIT_PART_COUNT') {
            formattedError = new CustomError({
                id: ErrorDictionary.BAD_REQUEST_ERROR.id,
                name: ErrorDictionary.BAD_REQUEST_ERROR.name,
                message: error.message || ErrorDictionary.BAD_REQUEST_ERROR.message,
                code: ErrorDictionary.BAD_REQUEST_ERROR.code,
                statusCode: ErrorDictionary.BAD_REQUEST_ERROR.status,
                cause: error
            });
        } else {
            formattedError = new CustomError({
                id: ErrorDictionary.BAD_REQUEST_ERROR.id,
                name: ErrorDictionary.BAD_REQUEST_ERROR.name,
                message: error.message || ErrorDictionary.BAD_REQUEST_ERROR.message,
                code: ErrorDictionary.BAD_REQUEST_ERROR.code,
                statusCode: ErrorDictionary.BAD_REQUEST_ERROR.status,
                cause: error
            });
        }
    }

    if (error?.name === 'CastError') {
        formattedError = new CustomError({
            id: ErrorDictionary.INVALID_ID_ERROR.id,
            name: ErrorDictionary.INVALID_ID_ERROR.name,
            message: ErrorDictionary.INVALID_ID_ERROR.message,
            code: ErrorDictionary.INVALID_ID_ERROR.code,
            statusCode: ErrorDictionary.INVALID_ID_ERROR.status,
            cause: error
        });
    }

    if (error?.type === 'entity.parse.failed' || error?.name === 'SyntaxError') {
        formattedError = new CustomError({
            id: ErrorDictionary.INVALID_JSON_ERROR.id,
            name: ErrorDictionary.INVALID_JSON_ERROR.name,
            message: ErrorDictionary.INVALID_JSON_ERROR.message,
            code: ErrorDictionary.INVALID_JSON_ERROR.code,
            statusCode: ErrorDictionary.INVALID_JSON_ERROR.status,
            cause: error
        });
    }

    if (error?.name === 'ValidationError') {
        formattedError = new CustomError({
            id: ErrorDictionary.VALIDATION_ERROR.id,
            name: ErrorDictionary.VALIDATION_ERROR.name,
            message: error.message || ErrorDictionary.VALIDATION_ERROR.message,
            code: ErrorDictionary.VALIDATION_ERROR.code,
            statusCode: ErrorDictionary.VALIDATION_ERROR.status,
            cause: error
        });
    }

    if (error?.name === 'JsonWebTokenError') {
        formattedError = new CustomError({
            id: ErrorDictionary.AUTHENTICATION_ERROR.id,
            name: ErrorDictionary.AUTHENTICATION_ERROR.name,
            message: 'Token inválido',
            code: ErrorDictionary.AUTHENTICATION_ERROR.code,
            statusCode: ErrorDictionary.AUTHENTICATION_ERROR.status,
            cause: error
        });
    }

    if (error?.name === 'TokenExpiredError') {
        formattedError = new CustomError({
            id: ErrorDictionary.TOKEN_EXPIRED_ERROR.id,
            name: ErrorDictionary.TOKEN_EXPIRED_ERROR.name,
            message: 'Token expirado',
            code: ErrorDictionary.TOKEN_EXPIRED_ERROR.code,
            statusCode: ErrorDictionary.TOKEN_EXPIRED_ERROR.status,
            cause: error
        });
    }

    if (error?.code === 11000) {
        formattedError = new CustomError({
            id: ErrorDictionary.RESOURCE_CONFLICT_ERROR.id,
            name: ErrorDictionary.RESOURCE_CONFLICT_ERROR.name,
            message: 'Registro duplicado',
            code: ErrorDictionary.RESOURCE_CONFLICT_ERROR.code,
            statusCode: 409,
            cause: error
        });
    }

    if (!(formattedError instanceof CustomError)) {
        const statusCodeFromError = error?.statusCode || error?.status || ErrorDictionary.INTERNAL_SERVER_ERROR.status;
        const codeFromError = error?.code || ErrorDictionary.INTERNAL_SERVER_ERROR.code;

        if (error?.statusCode || error?.code || error?.name) {
            formattedError = new CustomError({
                id: getErrorIdByCode(codeFromError),
                name: error?.name || ErrorDictionary.INTERNAL_SERVER_ERROR.name,
                message: error?.message || ErrorDictionary.INTERNAL_SERVER_ERROR.message,
                code: codeFromError,
                statusCode: statusCodeFromError,
                cause: error
            });
        } else {
            formattedError = new CustomError({
                id: ErrorDictionary.INTERNAL_SERVER_ERROR.id,
                name: ErrorDictionary.INTERNAL_SERVER_ERROR.name,
                message: error?.message || ErrorDictionary.INTERNAL_SERVER_ERROR.message,
                code: ErrorDictionary.INTERNAL_SERVER_ERROR.code,
                statusCode: ErrorDictionary.INTERNAL_SERVER_ERROR.status,
                cause: error
            });
        }
    }

    return formattedError;
};

export const errorHandler = (error, req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }

    const normalizedError = normalizeError(error);
    const statusCode = normalizedError?.statusCode || normalizedError?.status || ErrorDictionary.INTERNAL_SERVER_ERROR.status;
    const meta = {
        requestId: req?.requestId ?? '',
        method: req?.method ?? '',
        path: req?.originalUrl ?? '',
        code: normalizedError?.code ?? error?.code ?? '',
    };

    if (statusCode >= 500) {
        logger.error(`${normalizedError.name} - ${normalizedError.message}`, {
            ...meta,
            stack: normalizedError?.stack || error?.stack || ''
        });
    } else {
        logger.warning(`${normalizedError.name} - ${normalizedError.message}`, meta);
    }

    const payload = {
        success: false,
        status: statusCode >= 500 ? 'error' : 'fail',
        error: {
            id: normalizedError?.id || getErrorIdByCode(normalizedError?.code || ErrorDictionary.INTERNAL_SERVER_ERROR.code),
            code: normalizedError?.code || ErrorDictionary.INTERNAL_SERVER_ERROR.code,
            message: normalizedError?.message || ErrorDictionary.INTERNAL_SERVER_ERROR.message,
        },
        timestamp: new Date().toISOString()
    };

    if (normalizedError?.details) {
        payload.error.details = normalizedError.details;
    }

    if (process.env.NODE_ENV !== 'production' && normalizedError?.stack) {
        payload.stack = normalizedError.stack;
    }

    return res.status(statusCode).json(payload);
};
