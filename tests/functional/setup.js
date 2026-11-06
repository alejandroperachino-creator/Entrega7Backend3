import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../../src/models/user.model.js';
import Order from '../../src/models/order.model.js';
import Delivery from '../../src/models/delivery.model.js';

process.env.NODE_ENV = 'test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');

dotenv.config({ path: path.join(projectRoot, '.env.test') });
dotenv.config();

const mongoUri =
  process.env.MONGO_URI_TEST ||
  process.env.MONGODB_URI_TEST ||
  process.env.MONGODB_URI;

if (!mongoUri) {
  throw new Error('No se encontró URI de Mongo para testing. Configurá MONGO_URI_TEST o MONGODB_URI_TEST.');
}

before(async () => {
  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  await Promise.all([
    Delivery.deleteMany({}),
    Order.deleteMany({}),
    User.deleteMany({})
  ]);
});

after(async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.db.dropDatabase();
  }
  await mongoose.disconnect();
});
