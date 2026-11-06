import { Router } from 'express';
import MockController from '../controllers/mock.controller.js';

const router = Router();
const mockController = new MockController();

/**
 * @openapi
 * components:
 *   schemas:
 *     MockUser:
 *       type: object
 *       properties:
 *         firstName:
 *           type: string
 *           example: "Juan"
 *         lastName:
 *           type: string
 *           example: "Pérez"
 *         email:
 *           type: string
 *           example: "juan.perez@example.com"
 *         password:
 *           type: string
 *           example: "$2b$10$U2JQxG8WnT2P8mQ..."
 *         role:
 *           type: string
 *           example: "user"
 *         address:
 *           type: string
 *           example: "Av. Siempre Viva 742"
 *         isAvailable:
 *           type: boolean
 *           nullable: true
 *           example: true
 *     MockOrderItem:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Auriculares Bluetooth"
 *         quantity:
 *           type: number
 *           example: 2
 *         price:
 *           type: number
 *           example: 1500
 *     MockOrder:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "ord_mock_1"
 *         customer:
 *           type: string
 *           example: "customer_1"
 *         items:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/MockOrderItem"
 *         deliveryAddress:
 *           type: string
 *           example: "Calle Falsa 123"
 *         total:
 *           type: number
 *           example: 3000
 *         status:
 *           type: string
 *           example: "created"
 *         priority:
 *           type: string
 *           example: "normal"
 *     MockDelivery:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "del_mock_1"
 *         order:
 *           type: string
 *           example: "ord_mock_1"
 *         driver:
 *           type: string
 *           example: "driver_1"
 *         status:
 *           type: string
 *           example: "pending"
 *         priority:
 *           type: string
 *           example: "normal"
 *         assignedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-06-01T12:00:00Z"
 *         deliveredAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: null
 *     MockSnapshot:
 *       type: object
 *       properties:
 *         users:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/MockUser"
 *         orders:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/MockOrder"
 *         deliveries:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/MockDelivery"
 *     SeedResult:
 *       type: object
 *       properties:
 *         insertados:
 *           type: number
 *           example: 10
 *         omitidosDuplicados:
 *           type: number
 *           nullable: true
 *           example: 2
 *         coleccion:
 *           type: string
 *           example: "usuarios"
 *         ids:
 *           type: array
 *           nullable: true
 *           items:
 *             type: string
 *           example: ["6712f8fc85ce4df854f8a114"]
 *         detalle:
 *           type: object
 *           nullable: true
 *           properties:
 *             usuarios:
 *               type: number
 *               example: 10
 *             usuariosOmitidosDuplicados:
 *               type: number
 *               example: 2
 *             pedidos:
 *               type: number
 *               example: 10
 *             entregas:
 *               type: number
 *               example: 10
 *   responses:
 *     MockInvalidTypeQtyError:
 *       description: Cantidad inválida de mocks
 *       content:
 *         application/json:
 *           example:
 *             success: false
 *             status: "fail"
 *             error:
 *               id: 2
 *               code: "INVALID_TYPE_ERROR"
 *               message: "La cantidad de mocks debe ser un numero entero positivo mayor a cero."
 *     MockBadRequestError:
 *       description: Solicitud incorrecta
 *       content:
 *         application/json:
 *           examples:
 *             qtyOutOfRange:
 *               summary: BAD_REQUEST_ERROR por rango de qty
 *               value:
 *                 success: false
 *                 status: "fail"
 *                 error:
 *                   id: 5
 *                   code: "BAD_REQUEST_ERROR"
 *                   message: "qty fuera de rango. Debe estar entre 1 y 50."
 *             invalidCollection:
 *               summary: BAD_REQUEST_ERROR por colección inválida
 *               value:
 *                 success: false
 *                 status: "fail"
 *                 error:
 *                   id: 5
 *                   code: "BAD_REQUEST_ERROR"
 *                   message: "Coleccion invalida. Valores permitidos: users, orders, deliveries, all"
 *     MockInternalServerError:
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
 * /api/mocks/user:
 *   get:
 *     summary: Generar un usuario mock
 *     tags: ["Mocks"]
 *     parameters:
 *       - in: query
 *         name: role
 *         required: false
 *         schema:
 *           type: string
 *         description: Rol opcional (user, driver, store)
 *       - in: query
 *         name: seed
 *         required: false
 *         schema:
 *           type: number
 *         description: Seed opcional para resultados reproducibles
 *     responses:
 *       200:
 *         description: Usuario mock generado
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: "#/components/schemas/SuccessResponse"
 *                 - type: object
 *                   properties:
 *                     payload:
 *                       $ref: "#/components/schemas/MockUser"
 *       400:
 *         $ref: "#/components/responses/MockBadRequestError"
 *       500:
 *         $ref: "#/components/responses/MockInternalServerError"
 */
router.get('/user', mockController.getUser);

/**
 * @openapi
 * /api/mocks/users:
 *   get:
 *     summary: Generar múltiples usuarios mock
 *     tags: ["Mocks"]
 *     parameters:
 *       - in: query
 *         name: qty
 *         required: false
 *         schema:
 *           type: number
 *         description: Cantidad de usuarios (1-50). Default 10
 *       - in: query
 *         name: role
 *         required: false
 *         schema:
 *           type: string
 *         description: Rol opcional (user, driver, store)
 *       - in: query
 *         name: seed
 *         required: false
 *         schema:
 *           type: number
 *         description: Seed opcional para resultados reproducibles
 *     responses:
 *       200:
 *         description: Usuarios mock generados
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: "#/components/schemas/SuccessResponse"
 *                 - type: object
 *                   properties:
 *                     payload:
 *                       type: array
 *                       items:
 *                         $ref: "#/components/schemas/MockUser"
 *       400:
 *         description: Error de validación de cantidad o parámetros
 *         content:
 *           application/json:
 *             examples:
 *               invalidQty:
 *                 value:
 *                   success: false
 *                   status: "fail"
 *                   error:
 *                     id: 2
 *                     code: "INVALID_TYPE_ERROR"
 *                     message: "La cantidad de mocks debe ser un numero entero positivo mayor a cero."
 *               badRequest:
 *                 value:
 *                   success: false
 *                   status: "fail"
 *                   error:
 *                     id: 5
 *                     code: "BAD_REQUEST_ERROR"
 *                     message: "Role invalido. Valores permitidos: user, driver, store"
 *       500:
 *         $ref: "#/components/responses/MockInternalServerError"
 */
router.get('/users', mockController.getUsers);

/**
 * @openapi
 * /api/mocks/orders:
 *   get:
 *     summary: Generar pedidos mock (sin persistir)
 *     tags: ["Mocks"]
 *     parameters:
 *       - in: query
 *         name: qty
 *         required: false
 *         schema:
 *           type: number
 *         description: Cantidad de pedidos (1-50). Default 5
 *       - in: query
 *         name: seed
 *         required: false
 *         schema:
 *           type: number
 *         description: Seed opcional para resultados reproducibles
 *     responses:
 *       200:
 *         description: Pedidos mock generados
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: "#/components/schemas/SuccessResponse"
 *                 - type: object
 *                   properties:
 *                     payload:
 *                       type: array
 *                       items:
 *                         $ref: "#/components/schemas/MockOrder"
 *       400:
 *         description: Error de validación de cantidad
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               status: "fail"
 *               error:
 *                 id: 2
 *                 code: "INVALID_TYPE_ERROR"
 *                 message: "La cantidad de mocks debe ser un numero entero positivo mayor a cero."
 *       500:
 *         $ref: "#/components/responses/MockInternalServerError"
 */
router.get('/orders', mockController.getOrders);

/**
 * @openapi
 * /api/mocks/deliveries:
 *   get:
 *     summary: Generar entregas mock (sin persistir)
 *     tags: ["Mocks"]
 *     parameters:
 *       - in: query
 *         name: qty
 *         required: false
 *         schema:
 *           type: number
 *         description: Cantidad de entregas (1-50). Default 5
 *       - in: query
 *         name: seed
 *         required: false
 *         schema:
 *           type: number
 *         description: Seed opcional para resultados reproducibles
 *     responses:
 *       200:
 *         description: Entregas mock generadas
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: "#/components/schemas/SuccessResponse"
 *                 - type: object
 *                   properties:
 *                     payload:
 *                       type: array
 *                       items:
 *                         $ref: "#/components/schemas/MockDelivery"
 *       400:
 *         $ref: "#/components/responses/MockInvalidTypeQtyError"
 *       500:
 *         $ref: "#/components/responses/MockInternalServerError"
 */
router.get('/deliveries', mockController.getDeliveries);

/**
 * @openapi
 * /api/mocks/snapshot:
 *   get:
 *     summary: Generar snapshot completo de mocks
 *     tags: ["Mocks"]
 *     parameters:
 *       - in: query
 *         name: users
 *         required: false
 *         schema:
 *           type: number
 *         description: Cantidad de usuarios (1-50)
 *       - in: query
 *         name: orders
 *         required: false
 *         schema:
 *           type: number
 *         description: Cantidad de pedidos (1-50)
 *       - in: query
 *         name: deliveries
 *         required: false
 *         schema:
 *           type: number
 *         description: Cantidad de entregas (1-50)
 *       - in: query
 *         name: seed
 *         required: false
 *         schema:
 *           type: number
 *         description: Seed opcional para resultados reproducibles
 *     responses:
 *       200:
 *         description: Snapshot mock generado
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: "#/components/schemas/SuccessResponse"
 *                 - type: object
 *                   properties:
 *                     payload:
 *                       $ref: "#/components/schemas/MockSnapshot"
 *       400:
 *         description: Error de validación de cantidades
 *         content:
 *           application/json:
 *             examples:
 *               invalidType:
 *                 value:
 *                   success: false
 *                   status: "fail"
 *                   error:
 *                     id: 2
 *                     code: "INVALID_TYPE_ERROR"
 *                     message: "La cantidad de mocks debe ser un numero entero positivo mayor a cero."
 *               outOfRange:
 *                 value:
 *                   success: false
 *                   status: "fail"
 *                   error:
 *                     id: 5
 *                     code: "BAD_REQUEST_ERROR"
 *                     message: "qty fuera de rango. Debe estar entre 1 y 50."
 *       500:
 *         $ref: "#/components/responses/MockInternalServerError"
 */
router.get('/snapshot', mockController.getSnapshot);

/**
 * @openapi
 * /api/mocks/seed:
 *   post:
 *     summary: Insertar datos de prueba en base de datos
 *     tags: ["Mocks"]
 *     description: >
 *       Este endpoint no usa body. Recibe parámetros por query:
 *       qty, collection (o type) y seed.
 *     parameters:
 *       - in: query
 *         name: qty
 *         required: false
 *         schema:
 *           type: number
 *         description: Cantidad de registros (1-50). Default 10
 *       - in: query
 *         name: collection
 *         required: false
 *         schema:
 *           type: string
 *         description: users, orders, deliveries o all
 *       - in: query
 *         name: type
 *         required: false
 *         schema:
 *           type: string
 *         description: Alias de collection
 *       - in: query
 *         name: seed
 *         required: false
 *         schema:
 *           type: number
 *         description: Seed opcional para resultados reproducibles
 *     responses:
 *       201:
 *         description: Datos de prueba insertados
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: "#/components/schemas/SuccessResponse"
 *                 - type: object
 *                   properties:
 *                     payload:
 *                       $ref: "#/components/schemas/SeedResult"
 *       400:
 *         description: Errores de validación para seed
 *         content:
 *           application/json:
 *             examples:
 *               invalidQty:
 *                 value:
 *                   success: false
 *                   status: "fail"
 *                   error:
 *                     id: 2
 *                     code: "INVALID_TYPE_ERROR"
 *                     message: "La cantidad de mocks debe ser un numero entero positivo mayor a cero."
 *               invalidCollection:
 *                 value:
 *                   success: false
 *                   status: "fail"
 *                   error:
 *                     id: 5
 *                     code: "BAD_REQUEST_ERROR"
 *                     message: "Coleccion invalida. Valores permitidos: users, orders, deliveries, all"
 *       500:
 *         $ref: "#/components/responses/MockInternalServerError"
 */
router.post('/seed', mockController.seed);

/**
 * @openapi
 * /api/mocks/seed/users:
 *   post:
 *     summary: Insertar usuarios de prueba
 *     tags: ["Mocks"]
 *     description: No usa body. Usa query params qty y seed.
 *     parameters:
 *       - in: query
 *         name: qty
 *         required: false
 *         schema:
 *           type: number
 *       - in: query
 *         name: seed
 *         required: false
 *         schema:
 *           type: number
 *     responses:
 *       201:
 *         description: Usuarios de prueba insertados
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: "#/components/schemas/SuccessResponse"
 *                 - type: object
 *                   properties:
 *                     payload:
 *                       $ref: "#/components/schemas/SeedResult"
 *       400:
 *         $ref: "#/components/responses/MockInvalidTypeQtyError"
 *       500:
 *         $ref: "#/components/responses/MockInternalServerError"
 */
router.post('/seed/users', mockController.seedUsers);

/**
 * @openapi
 * /api/mocks/seed/orders:
 *   post:
 *     summary: Insertar pedidos de prueba
 *     tags: ["Mocks"]
 *     description: No usa body. Usa query params qty y seed.
 *     parameters:
 *       - in: query
 *         name: qty
 *         required: false
 *         schema:
 *           type: number
 *       - in: query
 *         name: seed
 *         required: false
 *         schema:
 *           type: number
 *     responses:
 *       201:
 *         description: Pedidos de prueba insertados
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: "#/components/schemas/SuccessResponse"
 *                 - type: object
 *                   properties:
 *                     payload:
 *                       $ref: "#/components/schemas/SeedResult"
 *       400:
 *         description: Errores de validación al insertar pedidos
 *         content:
 *           application/json:
 *             examples:
 *               invalidQty:
 *                 value:
 *                   success: false
 *                   status: "fail"
 *                   error:
 *                     id: 2
 *                     code: "INVALID_TYPE_ERROR"
 *                     message: "La cantidad de mocks debe ser un numero entero positivo mayor a cero."
 *               missingCustomers:
 *                 value:
 *                   success: false
 *                   status: "fail"
 *                   error:
 *                     id: 5
 *                     code: "BAD_REQUEST_ERROR"
 *                     message: "No hay clientes para asociar pedidos. Genera usuarios primero."
 *       500:
 *         $ref: "#/components/responses/MockInternalServerError"
 */
router.post('/seed/orders', mockController.seedOrders);

/**
 * @openapi
 * /api/mocks/seed/deliveries:
 *   post:
 *     summary: Insertar entregas de prueba
 *     tags: ["Mocks"]
 *     description: No usa body. Usa query params qty y seed.
 *     parameters:
 *       - in: query
 *         name: qty
 *         required: false
 *         schema:
 *           type: number
 *       - in: query
 *         name: seed
 *         required: false
 *         schema:
 *           type: number
 *     responses:
 *       201:
 *         description: Entregas de prueba insertadas
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: "#/components/schemas/SuccessResponse"
 *                 - type: object
 *                   properties:
 *                     payload:
 *                       $ref: "#/components/schemas/SeedResult"
 *       400:
 *         description: Errores de validación al insertar entregas
 *         content:
 *           application/json:
 *             examples:
 *               invalidQty:
 *                 value:
 *                   success: false
 *                   status: "fail"
 *                   error:
 *                     id: 2
 *                     code: "INVALID_TYPE_ERROR"
 *                     message: "La cantidad de mocks debe ser un numero entero positivo mayor a cero."
 *               missingOrders:
 *                 value:
 *                   success: false
 *                   status: "fail"
 *                   error:
 *                     id: 5
 *                     code: "BAD_REQUEST_ERROR"
 *                     message: "No hay pedidos para asociar entregas. Genera pedidos primero."
 *               missingDrivers:
 *                 value:
 *                   success: false
 *                   status: "fail"
 *                   error:
 *                     id: 5
 *                     code: "BAD_REQUEST_ERROR"
 *                     message: "No hay repartidores para asociar entregas. Genera users con rol driver primero."
 *       500:
 *         $ref: "#/components/responses/MockInternalServerError"
 */
router.post('/seed/deliveries', mockController.seedDeliveries);

/**
 * @openapi
 * /api/mocks/seed/all:
 *   post:
 *     summary: Ejecutar seed integral (users, orders y deliveries)
 *     tags: ["Mocks"]
 *     description: No usa body. Usa query params qty y seed.
 *     parameters:
 *       - in: query
 *         name: qty
 *         required: false
 *         schema:
 *           type: number
 *       - in: query
 *         name: seed
 *         required: false
 *         schema:
 *           type: number
 *     responses:
 *       201:
 *         description: Seed integral ejecutado
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: "#/components/schemas/SuccessResponse"
 *                 - type: object
 *                   properties:
 *                     payload:
 *                       $ref: "#/components/schemas/SeedResult"
 *       400:
 *         $ref: "#/components/responses/MockBadRequestError"
 *       500:
 *         $ref: "#/components/responses/MockInternalServerError"
 */
router.post('/seed/all', mockController.seedAll);

export default router;
