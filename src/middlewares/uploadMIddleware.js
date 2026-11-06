import fs from 'fs';
import path from 'path';
import multer from 'multer';
import logger from '../utils/logger.js';
import { createError, ErrorDictionary } from '../utils/errors.js';
import {
    UPLOAD_LIMITS,
    ALLOWED_MIME_TYPES,
    ALLOWED_EXTENSIONS,
    VALID_DOCUMENT_TYPES,
    UPLOAD_SETTINGS
} from '../constants/index.js';

const UPLOAD_PATHS = Object.freeze({
    documents: path.resolve(process.cwd(), 'uploads', 'documents'),
    receipts: path.resolve(process.cwd(), 'uploads', 'receipts'),
    proofs: path.resolve(process.cwd(), 'uploads', 'proofs')
});

const ensureFolder = (dir) => {
    fs.mkdirSync(dir, { recursive: true });
};

const buildStorage = (folder) => {
    ensureFolder(folder);
    return multer.diskStorage({
        destination: (_req, _file, cb) => cb(null, folder),
        filename: (_req, file, cb) => {
            const extension = path.extname(file.originalname || '').toLowerCase();
            const baseName = (file.originalname || 'upload')
                .replace(/\.[^/.]+$/, '')
                .replace(/[^a-zA-Z0-9_-]/g, '_')
                .substring(0, 30) || 'upload';
            const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${baseName}${extension || '.bin'}`;
            cb(null, safeName);
        }
    });
};

const normalizeDocumentType = (value) => {
    if (typeof value !== 'string') return '';
    return value.trim().toLowerCase();
};

const isInAllowedList = (value, list) => list.includes(value);

const buildMissingFileError = () => createError(
    ErrorDictionary.MISSING_FILE.name,
    ErrorDictionary.MISSING_FILE.message,
    ErrorDictionary.MISSING_FILE.status,
    ErrorDictionary.MISSING_FILE.code
);

const buildUnexpectedFieldError = (expected, received) => createError(
    ErrorDictionary.UNEXPECTED_FILE_FIELD.name,
    `Campo de archivo inesperado: se esperaba '${expected}' pero se recibió '${received ?? 'ninguno'}'`,
    ErrorDictionary.UNEXPECTED_FILE_FIELD.status,
    ErrorDictionary.UNEXPECTED_FILE_FIELD.code
);

const createFileFilter = ({ fieldName, allowedMimeTypes, allowedExtensions, validDocumentTypes, requireDocumentType }) => (req, file, cb) => {
    if (!file) {
        logger.warning('Intento de carga sin archivo', { fieldName });
        return cb(buildMissingFileError());
    }

    const documentType = normalizeDocumentType(req.body?.type ?? req.body?.documentType ?? req.body?.document_type ?? '');
    const extension = path.extname(file.originalname || '').toLowerCase();
    const mimeType = file.mimetype || '';

    if (file.fieldname !== fieldName) {
        logger.warning('Campo de archivo inesperado', { expected: fieldName, received: file.fieldname });
        return cb(buildUnexpectedFieldError(fieldName, file.fieldname));
    }

    if (!isInAllowedList(mimeType, allowedMimeTypes) || !isInAllowedList(extension, allowedExtensions)) {
        logger.warning('Tipo de archivo no permitido', {
            fieldName,
            originalName: file.originalname,
            mimeType,
            extension
        });
        return cb(createError(
            ErrorDictionary.INVALID_FILE_TYPE.name,
            ErrorDictionary.INVALID_FILE_TYPE.message,
            ErrorDictionary.INVALID_FILE_TYPE.status,
            ErrorDictionary.INVALID_FILE_TYPE.code
        ));
    }

    if (requireDocumentType && (!documentType || !validDocumentTypes.includes(documentType))) {
        logger.warning('Tipo de documento inválido', {
            fieldName,
            originalName: file.originalname,
            documentType: req.body?.type ?? req.body?.documentType ?? req.body?.document_type
        });
        return cb(createError(
            ErrorDictionary.INVALID_DOCUMENT_TYPE.name,
            ErrorDictionary.INVALID_DOCUMENT_TYPE.message,
            ErrorDictionary.INVALID_DOCUMENT_TYPE.status,
            ErrorDictionary.INVALID_DOCUMENT_TYPE.code
        ));
    }

    if (!requireDocumentType && documentType && !validDocumentTypes.includes(documentType)) {
        logger.warning('Tipo de documento inválido', { fieldName, documentType });
        return cb(createError(
            ErrorDictionary.INVALID_DOCUMENT_TYPE.name,
            ErrorDictionary.INVALID_DOCUMENT_TYPE.message,
            ErrorDictionary.INVALID_DOCUMENT_TYPE.status,
            ErrorDictionary.INVALID_DOCUMENT_TYPE.code
        ));
    }

    return cb(null, true);
};

export const createUploadMiddleware = ({
    folder,
    fieldName = UPLOAD_SETTINGS.DEFAULT_FIELD_NAME,
    allowedMimeTypes = UPLOAD_SETTINGS.DEFAULT_ALLOWED_MIME_TYPES,
    allowedExtensions = UPLOAD_SETTINGS.DEFAULT_ALLOWED_EXTENSIONS,
    maxSize = UPLOAD_SETTINGS.DEFAULT_MAX_SIZE,
    requireDocumentType = false,
    validDocumentTypes = UPLOAD_SETTINGS.DEFAULT_VALID_DOCUMENT_TYPES
}) => multer({
    storage: buildStorage(folder),
    limits: { fileSize: maxSize },
    fileFilter: createFileFilter({
        fieldName,
        allowedMimeTypes,
        allowedExtensions,
        requireDocumentType,
        validDocumentTypes
    })
});

export const uploadDocument = createUploadMiddleware({
    folder: UPLOAD_PATHS.documents,
    fieldName: 'document',
    validDocumentTypes: VALID_DOCUMENT_TYPES,
    requireDocumentType: true,
    maxSize: UPLOAD_LIMITS.DOCUMENT
});

export const uploadReceipt = createUploadMiddleware({
    folder: UPLOAD_PATHS.receipts,
    fieldName: 'receipt',
    validDocumentTypes: VALID_DOCUMENT_TYPES,
    requireDocumentType: false,
    maxSize: UPLOAD_LIMITS.RECEIPT
});

export const uploadProof = createUploadMiddleware({
    folder: UPLOAD_PATHS.proofs,
    fieldName: 'proof',
    validDocumentTypes: ['comprobante', 'recibo', 'factura'],
    requireDocumentType: false,
    maxSize: UPLOAD_LIMITS.PROOF
});

export const uploadPaths = UPLOAD_PATHS;
export { VALID_DOCUMENT_TYPES, ALLOWED_MIME_TYPES, ALLOWED_EXTENSIONS, UPLOAD_LIMITS };