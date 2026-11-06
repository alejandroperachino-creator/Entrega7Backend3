import { Router } from 'express';
import OrderController from '../controllers/order.controller.js';
import { uploadProof } from '../middlewares/uploadMIddleware.js';

const router = Router();
const orderController = new OrderController();

/**
 * @openapi
 * components:
 *   schemas:
 *     OrderItem:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Auriculares"
 *         quantity:
 *           type: number
 *           example: 2
 *         price:
 *           type: number
 *           example: 80
 *     Order:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "6712f8fc85ce4df854f8a331"
 *         customer:
 *           type: string
 *           example: "6712f8fc85ce4df854f8a114"
 *         items:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/OrderItem"
 *         deliveryAddress:
 *           type: string
 *           example: "Calle 123, Buenos Aires"
 *         total:
 *           type: number
 *           example: 210
 *         shippingCost:
 *           type: number
 *           example: 10
 *         declaredValue:
 *           type: number
 *           example: 200
 *         status:
 *           type: string
 *           example: "created"
 *         priority:
 *           type: string
 *           example: "normal"
 *         delivery:
 *           type: string
 *           nullable: true
 *           example: null
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-06-01T12:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-06-01T12:00:00Z"
 *     OrderCreateInput:
 *       type: object
 *       required:
 *         - customer
 *         - deliveryAddress
 *         - items
 *       properties:
 *         customer:
 *           type: string
 *           example: "6712f8fc85ce4df854f8a114"
 *         deliveryAddress:
 *           type: string
 *           example: "Calle 123, Buenos Aires"
 *         items:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/OrderItem"
 *         priority:
 *           type: string
 *           example: "normal"
 *     OrderUpdateInput:
 *       type: object
 *       properties:
 *         deliveryAddress:
 *           type: string
 *           example: "Calle 456, Buenos Aires"
 *         items:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/OrderItem"
 *         status:
 *           type: string
 *           example: "assigned"
 *         priority:
 *           type: string
 *           example: "high"
 *   responses:
 *     OrdersListOk:
 *       description: Ordenes obtenidas exitosamente
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
 *                 example: "Ordenes obtenidas exitosamente"
 *               payload:
 *                 type: array
 *                 items:
 *                   $ref: "#/components/schemas/Order"
 *     OrderOk:
 *       description: Orden obtenida exitosamente
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
 *                 example: "Orden obtenida exitosamente"
 *               payload:
 *                 $ref: "#/components/schemas/Order"
 *     OrderCreated:
 *       description: Orden creada exitosamente
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
 *                 example: "Orden creada exitosamente"
 *               payload:
 *                 $ref: "#/components/schemas/Order"
 *     OrderUpdated:
 *       description: Orden actualizada exitosamente
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
 *                 example: "Orden actualizada exitosamente"
 *               payload:
 *                 $ref: "#/components/schemas/Order"
 *     OrderDeleted:
 *       description: Orden borrada exitosamente
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
 *                 example: "Orden borrada exitosamente"
 *               payload:
 *                 $ref: "#/components/schemas/Order"
 *     OrderInvalidIdError:
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
 *     OrderNotFoundError:
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
 *     OrderUserNotFoundError:
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
 *     OrderBadRequestError:
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
 *                   message: "Order validation failed: status: `invalid_status` is not a valid enum value for path `status`."
 *     OrderInternalServerError:
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
 * /api/orders/{id}/proof:
 *   post:
 *     summary: Adjuntar comprobante a una orden
 *     tags: ["Orders"]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la orden
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
 *         description: Orden no encontrada
 */
router.post(
  '/:id/proof',
  uploadProof.single('proof'),
  orderController.uploadProof
);

/**
 * @openapi
 * /api/orders:
 *   get:
 *     summary: Obtener todas las ordenes
 *     tags: ["Orders"]
 *     responses:
 *       200:
 *         $ref: "#/components/responses/OrdersListOk"
 *       500:
 *         $ref: "#/components/responses/OrderInternalServerError"
 */
router.get('/', orderController.getAll);

/**
 * @openapi
 * /api/orders/{id}:
 *   get:
 *     summary: Obtener una orden por ID
 *     tags: ["Orders"]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la orden
 *     responses:
 *       200:
 *         $ref: "#/components/responses/OrderOk"
 *       400:
 *         $ref: "#/components/responses/OrderInvalidIdError"
 *       404:
 *         $ref: "#/components/responses/OrderNotFoundError"
 *       500:
 *         $ref: "#/components/responses/OrderInternalServerError"
 */
router.get('/:id', orderController.getOrderById);

/**
 * @openapi
 * /api/orders:
 *   post:
 *     summary: Crear una nueva orden
 *     tags: ["Orders"]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/OrderCreateInput"
 *     responses:
 *       201:
 *         $ref: "#/components/responses/OrderCreated"
 *       400:
 *         $ref: "#/components/responses/OrderBadRequestError"
 *       404:
 *         $ref: "#/components/responses/OrderUserNotFoundError"
 *       500:
 *         $ref: "#/components/responses/OrderInternalServerError"
 */
router.post('/', orderController.create);

/**
 * @openapi
 * /api/orders/{id}:
 *   put:
 *     summary: Actualizar una orden por ID
 *     tags: ["Orders"]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la orden
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/OrderUpdateInput"
 *     responses:
 *       200:
 *         $ref: "#/components/responses/OrderUpdated"
 *       400:
 *         $ref: "#/components/responses/OrderInvalidIdError"
 *       404:
 *         $ref: "#/components/responses/OrderNotFoundError"
 *       500:
 *         $ref: "#/components/responses/OrderInternalServerError"
 */
router.put('/:id', orderController.update);

/**
 * @openapi
 * /api/orders/{id}:
 *   delete:
 *     summary: Eliminar una orden por ID
 *     tags: ["Orders"]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la orden
 *     responses:
 *       200:
 *         $ref: "#/components/responses/OrderDeleted"
 *       400:
 *         $ref: "#/components/responses/OrderInvalidIdError"
 *       404:
 *         $ref: "#/components/responses/OrderNotFoundError"
 *       500:
 *         $ref: "#/components/responses/OrderInternalServerError"
 */
router.delete('/:id', orderController.delete);

export default router;
