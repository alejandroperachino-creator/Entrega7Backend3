import dotenv from 'dotenv';

dotenv.config();

const FIXED_PORT = 3003;

const DEFAULT_ENV = {
  MONGODB_URI: 'mongodb://localhost:27017/shipnow',
  MONGODB_URI_TEST: 'mongodb://localhost:27017/shipnow_test',
  NODE_ENV: 'development',
  LOG_LEVEL: 'info'
};

const env = {
  PORT: process.env.PORT ?? String(FIXED_PORT),
  MONGODB_URI: process.env.MONGODB_URI ?? DEFAULT_ENV.MONGODB_URI,
  MONGODB_URI_TEST: process.env.MONGO_URI_TEST ?? process.env.MONGODB_URI_TEST ?? DEFAULT_ENV.MONGODB_URI_TEST,
  NODE_ENV: process.env.NODE_ENV ?? DEFAULT_ENV.NODE_ENV,
  LOG_LEVEL: process.env.LOG_LEVEL ?? DEFAULT_ENV.LOG_LEVEL
};

const parsedPort = Number(env.PORT);
if (Number.isNaN(parsedPort) || parsedPort <= 0) {
  throw new Error('PORT debe ser un numero positivo.');
}

const allowedNodeEnvs = ['development', 'test', 'production'];
if (!allowedNodeEnvs.includes(env.NODE_ENV)) {
  throw new Error(`NODE_ENV invalido. Valores permitidos: ${allowedNodeEnvs.join(', ')}.`);
}

const config = Object.freeze({
  port: parsedPort,
  mongoUri: env.NODE_ENV === 'test' ? env.MONGODB_URI_TEST : env.MONGODB_URI,
  environment: env.NODE_ENV,
  nodeEnv: env.NODE_ENV,
  logLevel: env.LOG_LEVEL,
  jwtSecret: process.env.JWT_SECRET || ''
});

export default config;