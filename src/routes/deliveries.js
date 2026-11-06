import { Router } from 'express';
import deliveryController from '../controllers/delivery.controller.js';
import { uploadProof } from '../middlewares/uploadMIddleware.js';

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Delivery:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "6712f8fc85ce4df854f8a441"
 *         order:
 *           type: string
 *           example: "6712f8fc85ce4df854f8a331"
 *         driver:
 *           type: string
 *           nullable: true
 *           example: "6712f8fc85ce4df854f8a555"
 *         status:
 *           type: string
 *           example: "pending"
 *         priority:
 *           type: string
 *           example: "normal"
 *         assignedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: "2024-06-01T12:10:00Z"
 *         deliveredAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: "2024-06-01T13:00:00Z"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-06-01T12:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-06-01T12:00:00Z"
 *     DeliveryCreateInput:
 *       type: object
 *       required:
 *         - order
 *       properties:
 *         order:
 *           type: string
 *           example: "6712f8fc85ce4df854f8a331"
 *         driver:
 *           type: string
 *           example: "6712f8fc85ce4df854f8a555"
 *         priority:
 *           type: string
 *           example: "normal"
 *     DeliveryUpdateInput:
 *       type: object
 *       properties:
 *         driver:
 *           type: string
 *           example: "6712f8fc85ce4df854f8a555"
 *         status:
 *           type: string
 *           example: "delivered"
 *         priority:
 *           type: string
 *           example: "high"
 *         assignedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-06-01T12:10:00Z"
 *         deliveredAt:
 *           type: string
 *           format: date-time
 *           example: "2024-06-01T13:00:00Z"
 *   responses:
 *     DeliveriesListOk:
 *       description: Entregas obtenidas exitosamente
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
 *                 example: "Entregas obtenidas exitosamente"
 *               payload:
 *                 type: array
 *                 items:
 *                   $ref: "#/components/schemas/Delivery"
 *     DeliveryOk:
 *       description: Entrega obtenida exitosamente
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
 *                 example: "Entrega obtenida exitosamente"
 *               payload:
 *                 $ref: "#/components/schemas/Delivery"
 *     DeliveryCreated:
 *       description: Entrega creada exitosamente
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
 *                 example: "Entrega creada exitosamente"
 *               payload:
 *                 $ref: "#/components/schemas/Delivery"
 *     DeliveryUpdated:
 *       description: Entrega actualizada exitosamente
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
 *                 example: "Entrega actualizada exitosamente"
 *               payload:
 *                 $ref: "#/components/schemas/Delivery"
 *     DeliveryDeleted:
 *       description: Entrega eliminada exitosamente
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
 *                 example: "Entrega eliminada exitosamente"
 *               payload:
 *                 $ref: "#/components/schemas/Delivery"
 *     DeliveryInvalidIdError:
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
 *     DeliveryNotFoundError:
 *       description: Entrega no encontrada
 *       content:
 *         application/json:
 *           example:
 *             success: false
 *             status: "fail"
 *             error:
 *               id: 23
 *               code: "DELIVERY_NOT_FOUND_ERROR"
 *               message: "Entrega no encontrada"
 *     DeliveryOrderNotFoundError:
 *       description: Orden no encontrada
 *       content:
 *         application/json:
 *           example:
 *             success: false
 *             status: "fail"
 *             error:
 *               id: 20
 *               code: "ORDER_NOT_FOUND_ERROR"
 *               message: "Orden no encontrada"
 *     DeliveryUserNotFoundError:
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
 *     DeliveryBadRequestError:
 *       description: Solicitud incorrecta
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
 *             invalidStatus:
 *               summary: VALIDATION_ERROR por estado inválido
 *               value:
 *                 success: false
 *                 status: "fail"
 *                 error:
 *                   id: 8
 *                   code: "VALIDATION_ERROR"
 *                   message: "Delivery validation failed: status: `invalid_status` is not a valid enum value for path `status`."
 *     DeliveryInternalServerError:
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
 */

/**
 * @openapi
 * /api/deliveries/{id}/proof:
 *   post:
 *     summary: Adjuntar comprobante a una entrega
 *     tags: ["Deliveries"]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la entrega
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - proof
 *             properties:
 *               proof:
 *                 type: string
 *                 format: binary
 *                 description: Archivo del comprobante (pdf, jpg, png)
 *     responses:
 *       200:
 *         description: Comprobante asociado exitosamente
 *       400:
 *         description: Archivo faltante, tipo no permitido o tamaño excedido
 *       404:
 *         description: Entrega no encontrada
 */
router.post(
  '/:id/proof',
  uploadProof.single('proof'),
  deliveryController.uploadProof
);

/**
 * @openapi
 * /api/deliveries:
 *   get:
 *     summary: Obtener todas las entregas
 *     tags: ["Deliveries"]
 *     responses:
 *       200:
 *         $ref: "#/components/responses/DeliveriesListOk"
 *       500:
 *         $ref: "#/components/responses/DeliveryInternalServerError"
 */
router.get('/', deliveryController.getAll);

/**
 * @openapi
 * /api/deliveries/{id}:
 *   get:
 *     summary: Obtener una entrega por ID
 *     tags: ["Deliveries"]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la entrega
 *     responses:
 *       200:
 *         $ref: "#/components/responses/DeliveryOk"
 *       400:
 *         $ref: "#/components/responses/DeliveryInvalidIdError"
 *       404:
 *         $ref: "#/components/responses/DeliveryNotFoundError"
 *       500:
 *         $ref: "#/components/responses/DeliveryInternalServerError"
 */
router.get('/:id', deliveryController.getById);

/**
 * @openapi
 * /api/deliveries:
 *   post:
 *     summary: Crear una nueva entrega
 *     tags: ["Deliveries"]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/DeliveryCreateInput"
 *     responses:
 *       201:
 *         $ref: "#/components/responses/DeliveryCreated"
 *       400:
 *         $ref: "#/components/responses/DeliveryBadRequestError"
 *       404:
 *         description: Recurso asociado no encontrado
 *         content:
 *           application/json:
 *             examples:
 *               orderNotFound:
 *                 summary: ORDER_NOT_FOUND_ERROR
 *                 value:
 *                   success: false
 *                   status: "fail"
 *                   error:
 *                     id: 20
 *                     code: "ORDER_NOT_FOUND_ERROR"
 *                     message: "Orden no encontrada"
 *               userNotFound:
 *                 summary: USER_NOT_FOUND_ERROR
 *                 value:
 *                   success: false
 *                   status: "fail"
 *                   error:
 *                     id: 19
 *                     code: "USER_NOT_FOUND_ERROR"
 *                     message: "Usuario no encontrado"
 *       500:
 *         $ref: "#/components/responses/DeliveryInternalServerError"
 */
router.post('/', deliveryController.create);

/**
 * @openapi
 * /api/deliveries/{id}:
 *   put:
 *     summary: Actualizar una entrega por ID
 *     tags: ["Deliveries"]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la entrega
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/DeliveryUpdateInput"
 *     responses:
 *       200:
 *         $ref: "#/components/responses/DeliveryUpdated"
 *       400:
 *         $ref: "#/components/responses/DeliveryInvalidIdError"
 *       404:
 *         $ref: "#/components/responses/DeliveryNotFoundError"
 *       500:
 *         $ref: "#/components/responses/DeliveryInternalServerError"
 */
router.put('/:id', deliveryController.update);

/**
 * @openapi
 * /api/deliveries/{id}:
 *   delete:
 *     summary: Eliminar una entrega por ID
 *     tags: ["Deliveries"]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la entrega
 *     responses:
 *       200:
 *         $ref: "#/components/responses/DeliveryDeleted"
 *       400:
 *         $ref: "#/components/responses/DeliveryInvalidIdError"
 *       404:
 *         $ref: "#/components/responses/DeliveryNotFoundError"
 *       500:
 *         $ref: "#/components/responses/DeliveryInternalServerError"
 */
router.delete('/:id', deliveryController.delete);

export default router;
