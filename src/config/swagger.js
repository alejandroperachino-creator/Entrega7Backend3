import swaggerJsdoc from 'swagger-jsdoc';
import config from './env.config.js';


const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title : "ShipNow API",
            version: "1.0.0",
            description: "API de logística para gestión de usuarios, pedidos, entregas, utilidades mock y validación de logger."

        },
        servers: [
            {
                url: `http://localhost:${config.port}`,
                description: "Local server"
            }
        ],
        tags: [
            { name: 'Users', description: 'Gestión de usuarios' },
            { name: 'Products', description: 'Gestión de productos' },
            { name: 'Orders', description: 'Gestión de pedidos' },
            { name: 'Deliveries', description: 'Gestión de entregas' },
            { name: 'Mocks', description: 'Generación e inserción de datos de prueba' },
            { name: 'Logger', description: 'Herramientas de validación del sistema de logs (no negocio)' }
        ],
        components: {
            schemas: {
                SuccessResponse: {
                    type: 'object',
                    properties: {
                        status: { type: 'string', example: 'success' },
                        message: { type: 'string', example: 'Operación ejecutada correctamente' },
                        payload: { type: 'object', nullable: true }
                    }
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        status: { type: 'string', example: 'fail' },
                        error: {
                            type: 'object',
                            properties: {
                                id: { type: 'number', example: 12 },
                                code: { type: 'string', example: 'INVALID_ID_ERROR' },
                                message: { type: 'string', example: 'Id inválido' },
                                details: { type: 'object', nullable: true }
                            }
                        },
                        timestamp: { type: 'string', format: 'date-time' }
                    }
                }
            }
        }

    },
    apis: ["./src/routes/*.js"]
    
};

export default swaggerJsdoc(options);