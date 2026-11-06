import UserRepository from '../repositories/user.repository.js';
import { USER_ROLES, VALID_DOCUMENT_TYPES } from '../constants/index.js';
import { createError, ErrorDictionary } from '../utils/errors.js';
import logger from '../utils/logger.js';

class UserService {
    constructor() {
        this.userRepository = new UserRepository();
    }

    async addDocument(id, file, type) {
        if (!file) {
            throw createError(
                ErrorDictionary.MISSING_FILE.name,
                ErrorDictionary.MISSING_FILE.message,
                ErrorDictionary.MISSING_FILE.status,
                ErrorDictionary.MISSING_FILE.code
            );
        }

        const normalizedType = typeof type === 'string' ? type.trim().toLowerCase() : '';
        if (normalizedType && !VALID_DOCUMENT_TYPES.includes(normalizedType)) {
            logger.warning('Tipo de documento inválido para usuario', { userId: id, type, validTypes: VALID_DOCUMENT_TYPES });
            throw createError(
                ErrorDictionary.INVALID_DOCUMENT_TYPE.name,
                ErrorDictionary.INVALID_DOCUMENT_TYPE.message,
                ErrorDictionary.INVALID_DOCUMENT_TYPE.status,
                ErrorDictionary.INVALID_DOCUMENT_TYPE.code
            );
        }

        const user = await this.userRepository.findById(id);
        if (!user) {
            throw createError(
                ErrorDictionary.USER_NOT_FOUND_ERROR.name,
                ErrorDictionary.USER_NOT_FOUND_ERROR.message,
                ErrorDictionary.USER_NOT_FOUND_ERROR.status,
                ErrorDictionary.USER_NOT_FOUND_ERROR.code
            );
        }

        const documents = Array.isArray(user.documents) ? [...user.documents] : [];
        const documentType = normalizedType || 'document';
        documents.push({
            name: file.originalname,
            reference: file.filename,
            document: {
                originalName: file.originalname,
                fileName: file.filename,
                path: file.path,
                mimetype: file.mimetype,
                size: file.size,
                type: documentType,
                uploadedAt: new Date()
            }
        });

        const updatedUser = await this.userRepository.updateById(id, { documents });
        logger.info('Documento de usuario cargado correctamente', {
            userId: id,
            fileName: file.filename,
            documentType
        });

        return updatedUser;
    }

    async getAllUsers() {
    return this.userRepository.findAll();
    }

    async getUserById(id) {
        logger.debug(`buscando usuario por ID: ${id}`);
    const user = await this.userRepository.findById(id);
    if (!user) {
        throw createError(
            ErrorDictionary.USER_NOT_FOUND_ERROR.name,
            ErrorDictionary.USER_NOT_FOUND_ERROR.message,
            ErrorDictionary.USER_NOT_FOUND_ERROR.status,
            ErrorDictionary.USER_NOT_FOUND_ERROR.code
        );
    }
    return user;
    }

    async createUser(userData) {
    const { firstName, lastName, email, password } = userData;
    if (!firstName || !lastName || !email || !password) {
        throw createError(
            ErrorDictionary.BAD_REQUEST_ERROR.name,
            ErrorDictionary.BAD_REQUEST_ERROR.message,
            ErrorDictionary.BAD_REQUEST_ERROR.status,
            ErrorDictionary.BAD_REQUEST_ERROR.code
        );
    }

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
        throw createError(
            ErrorDictionary.RESOURCE_CONFLICT_ERROR.name,
            ErrorDictionary.RESOURCE_CONFLICT_ERROR.message,
            ErrorDictionary.RESOURCE_CONFLICT_ERROR.status,
            ErrorDictionary.RESOURCE_CONFLICT_ERROR.code
        );
    }

    if (userData.role === USER_ROLES.ADMIN) {
        throw createError(
            ErrorDictionary.PERMISSION_DENIED_ERROR.name,
            'No se puede crear un admin desde este endpoint',
            ErrorDictionary.PERMISSION_DENIED_ERROR.status,
            ErrorDictionary.PERMISSION_DENIED_ERROR.code
        );
    }

    return this.userRepository.create({
        ...userData,
        email: email.toLowerCase().trim(),
        role: userData.role || USER_ROLES.USER
    });
    }

    async updateUser(id, userData) {
    if (userData.role === USER_ROLES.ADMIN) {
        throw createError(
            ErrorDictionary.PERMISSION_DENIED_ERROR.name,
            ErrorDictionary.PERMISSION_DENIED_ERROR.message,
            ErrorDictionary.PERMISSION_DENIED_ERROR.status,
            ErrorDictionary.PERMISSION_DENIED_ERROR.code
        );
    }

    const updatedUser = await this.userRepository.updateById(id, userData);
    if (!updatedUser) {
        throw createError(
            ErrorDictionary.USER_NOT_FOUND_ERROR.name,
            ErrorDictionary.USER_NOT_FOUND_ERROR.message,
            ErrorDictionary.USER_NOT_FOUND_ERROR.status,
            ErrorDictionary.USER_NOT_FOUND_ERROR.code
        );
    }

    return updatedUser;
    }

    async deleteUser(id) {
    const deletedUser = await this.userRepository.deleteById(id);
    if (!deletedUser) {
        throw createError(
            ErrorDictionary.USER_NOT_FOUND_ERROR.name,
            ErrorDictionary.USER_NOT_FOUND_ERROR.message,
            ErrorDictionary.USER_NOT_FOUND_ERROR.status,
            ErrorDictionary.USER_NOT_FOUND_ERROR.code
        );
    }

    return deletedUser;
    }
}

export default UserService;