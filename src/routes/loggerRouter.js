import { Router } from 'express';
import logger from '../utils/logger.js';

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     LoggerSuccessResponse:
 *       type: object
 *       required: [ok, message, requestId]
 *       properties:
 *         ok:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "logger route ok"
 *         requestId:
 *           type: string
 *           example: "d9f8e780-ae63-4123-b61d-f0db6d6a9f6e"
 *   responses:
 *     LoggerTestErrorResponse:
 *       description: Error de prueba del logger
 *       content:
 *         application/json:
 *           example:
 *             success: false
 *             status: "fail"
 *             error:
 *               id: 11
 *               code: "TEST_LOGGER_ERROR"
 *               message: "logger test error"
 */

/**
 * @openapi
 * /api/logger:
 *   get:
 *     summary: Verificar endpoint base de logger
 *     tags: ["Logger"]
 *     description: >
 *       Endpoint de validación técnica para comprobar que la ruta de logger responde.
 *       No representa una funcionalidad de negocio.
 *     responses:
 *       200:
 *         description: Ruta de logger operativa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/LoggerSuccessResponse"
 */
router.get('/', (req, res) => {
    logger.info('logger route ok', {
        requestId: req.requestId,
        method: req.method,
        path: req.originalUrl,
    });

    res.json({
        ok: true,
        requestId: req.requestId,
        message: 'logger route ok',
    });
});

/**
 * @openapi
 * /api/logger/test:
 *   get:
 *     summary: Generar logs en todos los niveles
 *     tags: ["Logger"]
 *     description: >
 *       Endpoint de validación técnica. Genera logs debug/http/info/warning/error/fatal
 *       para verificar observabilidad. No representa una funcionalidad de negocio.
 *     responses:
 *       200:
 *         description: Logs generados correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/LoggerSuccessResponse"
 *             example:
 *               ok: true
 *               message: "se generaron logs en todos los niveles"
 *               requestId: "d9f8e780-ae63-4123-b61d-f0db6d6a9f6e"
 */
router.get('/test', (req, res) => {
    logger.debug('prueba de nivel debug', {
        requestId: req.requestId,
        method: req.method,
        path: req.originalUrl,
    });

    logger.http('prueba de nivel http', {
        requestId: req.requestId,
        method: req.method,
        path: req.originalUrl,
    });

    logger.info('prueba de nivel info', {
        requestId: req.requestId,
        method: req.method,
        path: req.originalUrl,
    });

    logger.warning('prueba de nivel warning', {
        requestId: req.requestId,
        method: req.method,
        path: req.originalUrl,
    });

    logger.error('prueba de nivel error', {
        requestId: req.requestId,
        method: req.method,
        path: req.originalUrl,
        stack: new Error('error de prueba del logger').stack,
    });

    logger.fatal('prueba de nivel fatal', {
        requestId: req.requestId,
        method: req.method,
        path: req.originalUrl,
    });

    res.json({
        ok: true,
        message: 'se generaron logs en todos los niveles',
        requestId: req.requestId,
    });
});

/**
 * @openapi
 * /api/logger/error:
 *   get:
 *     summary: Provocar error controlado para validar middleware de errores
 *     tags: ["Logger"]
 *     description: >
 *       Endpoint técnico para probar el flujo centralizado de errores.
 *       No representa una funcionalidad de negocio.
 *     responses:
 *       400:
 *         $ref: "#/components/responses/LoggerTestErrorResponse"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               status: "error"
 *               error:
 *                 id: 10
 *                 code: "INTERNAL_SERVER_ERROR"
 *                 message: "Error interno del servidor"
 */
router.get('/error', (req, res, next) => {
    logger.warning('logger test error', {
        requestId: req.requestId,
        method: req.method,
        path: req.originalUrl,
    });

    const error = new Error('logger test error');
    error.statusCode = 400;
    error.code = 'TEST_LOGGER_ERROR';
    next(error);
});

export default router;
