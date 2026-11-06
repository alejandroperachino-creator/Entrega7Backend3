import { Router } from 'express';
import productController from '../controllers/product.controller.js';

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "6712f8fc85ce4df854f8a221"
 *         name:
 *           type: string
 *           example: "Laptop Gamer"
 *         description:
 *           type: string
 *           example: "RTX 4060, 16GB RAM"
 *         price:
 *           type: number
 *           example: 1200
 *         stock:
 *           type: number
 *           example: 5
 *         status:
 *           type: string
 *           example: "available"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-06-01T12:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-06-01T12:00:00Z"
 *     ProductCreateInput:
 *       type: object
 *       required:
 *         - name
 *         - price
 *       properties:
 *         name:
 *           type: string
 *           example: "Laptop Gamer"
 *         description:
 *           type: string
 *           example: "RTX 4060, 16GB RAM"
 *         price:
 *           type: number
 *           example: 1200
 *         stock:
 *           type: number
 *           example: 5
 *         status:
 *           type: string
 *           example: "available"
 *     ProductUpdateInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Laptop Gamer V2"
 *         description:
 *           type: string
 *           example: "RTX 4070, 32GB RAM"
 *         price:
 *           type: number
 *           example: 1499
 *         stock:
 *           type: number
 *           example: 8
 *         status:
 *           type: string
 *           example: "out_of_stock"
 *   responses:
 *     ProductsListOk:
 *       description: Productos obtenidos exitosamente
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
 *                 example: "Productos obtenidos exitosamente"
 *               payload:
 *                 type: array
 *                 items:
 *                   $ref: "#/components/schemas/Product"
 *     ProductOk:
 *       description: Producto obtenido exitosamente
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
 *                 example: "Producto obtenido exitosamente"
 *               payload:
 *                 $ref: "#/components/schemas/Product"
 *     ProductCreated:
 *       description: Producto creado exitosamente
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
 *                 example: "Producto creado exitosamente"
 *               payload:
 *                 $ref: "#/components/schemas/Product"
 *     ProductUpdated:
 *       description: Producto actualizado exitosamente
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
 *                 example: "Producto actualizado exitosamente"
 *               payload:
 *                 $ref: "#/components/schemas/Product"
 *     ProductDeleted:
 *       description: Producto eliminado exitosamente
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
 *                 example: "Producto eliminado exitosamente"
 *               payload:
 *                 $ref: "#/components/schemas/Product"
 *     ProductInvalidIdError:
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
 *     ProductNotFoundError:
 *       description: Producto no encontrado
 *       content:
 *         application/json:
 *           example:
 *             success: false
 *             status: "fail"
 *             error:
 *               id: 21
 *               code: "PRODUCT_NOT_FOUND_ERROR"
 *               message: "Producto no encontrado"
 *     ProductBadRequestError:
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
 *     ProductInternalServerError:
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
 * /api/products:
 *   get:
 *     summary: Obtener todos los productos
 *     tags: ["Products"]
 *     parameters:
 *       - in: query
 *         name: includeInactive
 *         required: false
 *         schema:
 *           type: boolean
 *         description: Incluir productos inactivos
 *     responses:
 *       200:
 *         $ref: "#/components/responses/ProductsListOk"
 *       500:
 *         $ref: "#/components/responses/ProductInternalServerError"
 */
router.get('/', productController.getAll);

/**
 * @openapi
 * /api/products/{id}:
 *   get:
 *     summary: Obtener un producto por ID
 *     tags: ["Products"]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del producto
 *     responses:
 *       200:
 *         $ref: "#/components/responses/ProductOk"
 *       400:
 *         $ref: "#/components/responses/ProductInvalidIdError"
 *       404:
 *         $ref: "#/components/responses/ProductNotFoundError"
 *       500:
 *         $ref: "#/components/responses/ProductInternalServerError"
 */
router.get('/:id', productController.getById);

/**
 * @openapi
 * /api/products:
 *   post:
 *     summary: Crear un nuevo producto
 *     tags: ["Products"]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/ProductCreateInput"
 *     responses:
 *       201:
 *         $ref: "#/components/responses/ProductCreated"
 *       400:
 *         $ref: "#/components/responses/ProductBadRequestError"
 *       500:
 *         $ref: "#/components/responses/ProductInternalServerError"
 */
router.post('/', productController.create);

/**
 * @openapi
 * /api/products/{id}:
 *   put:
 *     summary: Actualizar un producto por ID
 *     tags: ["Products"]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del producto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/ProductUpdateInput"
 *     responses:
 *       200:
 *         $ref: "#/components/responses/ProductUpdated"
 *       400:
 *         $ref: "#/components/responses/ProductBadRequestError"
 *       404:
 *         $ref: "#/components/responses/ProductNotFoundError"
 *       500:
 *         $ref: "#/components/responses/ProductInternalServerError"
 */
router.put('/:id', productController.update);

/**
 * @openapi
 * /api/products/{id}:
 *   delete:
 *     summary: Eliminar un producto por ID
 *     tags: ["Products"]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del producto
 *     responses:
 *       200:
 *         $ref: "#/components/responses/ProductDeleted"
 *       400:
 *         $ref: "#/components/responses/ProductInvalidIdError"
 *       404:
 *         $ref: "#/components/responses/ProductNotFoundError"
 *       500:
 *         $ref: "#/components/responses/ProductInternalServerError"
 */
router.delete('/:id', productController.delete);

export default router;
