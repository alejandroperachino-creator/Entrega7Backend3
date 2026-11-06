import { Router } from 'express';
import userController from '../controllers/user.controller.js';
import { uploadDocument } from '../middlewares/uploadMIddleware.js';


const router = Router();

router.post(
    '/:id/documents',
    uploadDocument.single('document'),
    userController.uploadDocument
);

/**
 * @openapi
 * /api/users/{id}/documents:
 *   post:
 *     summary: Subir documento del usuario
 *     tags: ["Users"]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - document
 *               - type
 *             properties:
 *               document:
 *                 type: string
 *                 format: binary
 *                 description: Documento del usuario (pdf, jpg, png)
 *               type:
 *                 type: string
 *                 enum: [dni, cuit, pasaporte, licencia, driver_license, cedula, comprobante, factura, recibo]
 *                 description: Tipo de documento válido
 *     responses:
 *       200:
 *         description: Documento cargado exitosamente
 *       400:
 *         description: Archivo faltante, tipo inválido, tipo de documento inválido o tamaño excedido
 *       404:
 *         description: Usuario no encontrado
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "6712f8fc85ce4df854f8a114"
 *         firstName:
 *           type: string
 *           example: "Juan"
 *         lastName:
 *           type: string
 *           example: "Perez"
 *         email:
 *           type: string
 *           example: "juan.perez@gmail.com"
 *         role:
 *           type: string
 *           example: "user"
 *         address:
 *           type: string
 *           nullable: true
 *           example: "Av. Siempre Viva 742"
 *         documents:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "DNI"
 *               reference:
 *                 type: string
 *                 example: "12345678"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-06-01T12:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-06-01T12:00:00Z"
 *     UserCreateInput:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - password
 *       properties:
 *         firstName:
 *           type: string
 *           example: "Juan"
 *         lastName:
 *           type: string
 *           example: "Perez"
 *         email:
 *           type: string
 *           example: "juan.perez@gmail.com"
 *         password:
 *           type: string
 *           example: "password123"
 *     UserUpdateInput:
 *       type: object
 *       properties:
 *         firstName:
 *           type: string
 *           example: "Juan"
 *         lastName:
 *           type: string
 *           example: "Perez"
 *         email:
 *           type: string
 *           example: "juan.perez@gmail.com"
 *         password:
 *           type: string
 *           example: "password123"
 *         role:
 *           type: string
 *           example: "user"
 *   responses:
 *     UsersListOk:
 *       description: Usuarios obtenidos exitosamente
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: "success"
 *               message:
 *                 type: string
 *                 example: "Usuarios obtenidos exitosamente"
 *               payload:
 *                 type: array
 *                 items:
 *                   $ref: "#/components/schemas/User"
 *     UserOk:
 *       description: Usuario obtenido exitosamente
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: "success"
 *               message:
 *                 type: string
 *                 example: "Usuario obtenido exitosamente"
 *               payload:
 *                 $ref: "#/components/schemas/User"
 *     UserCreated:
 *       description: Usuario creado exitosamente
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: "success"
 *               message:
 *                 type: string
 *                 example: "Usuario creado exitosamente"
 *               payload:
 *                 $ref: "#/components/schemas/User"
 *     UserUpdated:
 *       description: Usuario actualizado exitosamente
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: "success"
 *               message:
 *                 type: string
 *                 example: "Usuario actualizado exitosamente"
 *               payload:
 *                 $ref: "#/components/schemas/User"
 *     UserDeleted:
 *       description: Usuario eliminado exitosamente
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: "success"
 *               message:
 *                 type: string
 *                 example: "Usuario eliminado exitosamente"
 *               payload:
 *                 $ref: "#/components/schemas/User"
 *     InvalidIdError:
 *       description: Id inválido
 *       content:
 *         application/json:
 *           example:
 *             success: false
 *             status: "fail"
 *             error:
 *               id: 12
 *               code: "INVALID_ID_ERROR"
 *               message: "Id inválido"
 *     UserNotFoundError:
 *       description: Usuario no encontrado
 *       content:
 *         application/json:
 *           example:
 *             success: false
 *             status: "fail"
 *             error:
 *               id: 19
 *               code: "USER_NOT_FOUND_ERROR"
 *               message: "Usuario no encontrado"
 *     PermissionDeniedError:
 *       description: Permiso denegado
 *       content:
 *         application/json:
 *           example:
 *             success: false
 *             status: "fail"
 *             error:
 *               id: 15
 *               code: "PERMISSION_DENIED_ERROR"
 *               message: "Permiso denegado"
 *     ResourceConflictError:
 *       description: Conflicto de recurso
 *       content:
 *         application/json:
 *           example:
 *             success: false
 *             status: "fail"
 *             error:
 *               id: 16
 *               code: "RESOURCE_CONFLICT_ERROR"
 *               message: "Conflicto de recurso"
 *     InternalServerError:
 *       description: Error interno del servidor
 *       content:
 *         application/json:
 *           example:
 *             success: false
 *             status: "error"
 *             error:
 *               id: 10
 *               code: "INTERNAL_SERVER_ERROR"
 *               message: "Error interno del servidor"
 *     UserCreateBadRequest:
 *       description: Solicitud incorrecta o datos inválidos
 *       content:
 *         application/json:
 *           examples:
 *             badRequest:
 *               summary: BAD_REQUEST_ERROR
 *               value:
 *                 success: false
 *                 status: "fail"
 *                 error:
 *                   id: 5
 *                   code: "BAD_REQUEST_ERROR"
 *                   message: "Solicitud incorrecta"
 *             validationError:
 *               summary: VALIDATION_ERROR
 *               value:
 *                 success: false
 *                 status: "fail"
 *                 error:
 *                   id: 8
 *                   code: "VALIDATION_ERROR"
 *                   message: "Error de validación"
 *             invalidJson:
 *               summary: INVALID_JSON_ERROR
 *               value:
 *                 success: false
 *                 status: "fail"
 *                 error:
 *                   id: 13
 *                   code: "INVALID_JSON_ERROR"
 *                   message: "JSON inválido"
 *     UserUpdateBadRequest:
 *       description: Id inválido o datos inválidos
 *       content:
 *         application/json:
 *           examples:
 *             invalidId:
 *               summary: INVALID_ID_ERROR
 *               value:
 *                 success: false
 *                 status: "fail"
 *                 error:
 *                   id: 12
 *                   code: "INVALID_ID_ERROR"
 *                   message: "Id inválido"
 *             validationError:
 *               summary: VALIDATION_ERROR
 *               value:
 *                 success: false
 *                 status: "fail"
 *                 error:
 *                   id: 8
 *                   code: "VALIDATION_ERROR"
 *                   message: "Error de validación"
 */

/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: Obtener todos los usuarios
 *     tags: ["Users"]
 *     responses:
 *       200:
 *         $ref: "#/components/responses/UsersListOk"
 *       500:
 *         $ref: "#/components/responses/InternalServerError"
 */
router.get('/', userController.getAll);

/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     summary: Obtener un usuario por ID
 *     tags: ["Users"]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         $ref: "#/components/responses/UserOk"
 *       400:
 *         $ref: "#/components/responses/InvalidIdError"
 *       404:
 *         $ref: "#/components/responses/UserNotFoundError"
 *       500:
 *         $ref: "#/components/responses/InternalServerError"
 */
router.get('/:id', userController.getById);

/**
 * @openapi
 * /api/users:
 *   post:
 *     summary: Crear un nuevo usuario
 *     tags: ["Users"]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/UserCreateInput"
 *     responses:
 *       201:
 *         $ref: "#/components/responses/UserCreated"
 *       400:
 *         $ref: "#/components/responses/UserCreateBadRequest"
 *       403:
 *         $ref: "#/components/responses/PermissionDeniedError"
 *       409:
 *         $ref: "#/components/responses/ResourceConflictError"
 *       500:
 *         $ref: "#/components/responses/InternalServerError"
 */
router.post('/', userController.create);

/**
 * @openapi
 * /api/users/{id}:
 *   put:
 *     summary: Actualizar un usuario por ID
 *     tags: ["Users"]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/UserUpdateInput"
 *     responses:
 *       200:
 *         $ref: "#/components/responses/UserUpdated"
 *       400:
 *         $ref: "#/components/responses/UserUpdateBadRequest"
 *       403:
 *         $ref: "#/components/responses/PermissionDeniedError"
 *       404:
 *         $ref: "#/components/responses/UserNotFoundError"
 *       500:
 *         $ref: "#/components/responses/InternalServerError"
 */
router.put('/:id', userController.update);

/**
 * @openapi
 * /api/users/{id}:
 *   delete:
 *     summary: Eliminar un usuario por ID
 *     tags: ["Users"]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         $ref: "#/components/responses/UserDeleted"
 *       400:
 *         $ref: "#/components/responses/InvalidIdError"
 *       404:
 *         $ref: "#/components/responses/UserNotFoundError"
 *       500:
 *         $ref: "#/components/responses/InternalServerError"
 */
router.delete('/:id', userController.delete);

export default router;
