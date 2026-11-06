import mongoose from 'mongoose';
import app from './app.js';
import config from './config/env.config.js';
import Logger from './utils/logger.js';

const gracefulExit = (code) => {
  Logger.on("finish", () => process.exit(code));
  Logger.end();
};


async function startServer() {
  try {
    await mongoose.connect(config.mongoUri);
    Logger.info('Conectado a la base de datos MongoDB');

    app.listen(config.port, () => {
      Logger.info(`Servidor iniciado en el puerto ${config.port}, { env: ${config.nodeEnv} }`);
      // No-op: startup logs removed to keep output clean in local/dev runs.
    });
  } catch (error) {
    Logger.error('Error al iniciar el servidor:', error.message);
    gracefulExit(1);
    return;
    
  }
}

startServer();


/** 
*
*fatal - 0
*error - 1
* warning -2
* info - 3
* http - 4
* debug - 5
*/

