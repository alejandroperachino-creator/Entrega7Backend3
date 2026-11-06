import bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';
import { DELIVERY_STATUS, MOCK_SEED, ORDER_PRIORITY, ORDER_STATUS, USER_ROLES } from '../constants/index.js';
import { generatemockuser, generatemockusers } from '../mocks/generate.mock.user.js';
import UserRepository from '../repositories/user.repository.js';
import MockRepository from '../repositories/mock.repository.js';
import { createError, ErrorDictionary } from '../utils/errors.js';
import logger from '../utils/logger.js';

class MockService {
  constructor(userRepository = new UserRepository(), mockRepository = new MockRepository()) {
    this.userRepository = userRepository;
    this.mockRepository = mockRepository;
  }

  toOptionalSeed(value) {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      throw createError(
        ErrorDictionary.BAD_REQUEST_ERROR.name,
        'Seed invalido. Debe ser un numero.',
        ErrorDictionary.BAD_REQUEST_ERROR.status,
        ErrorDictionary.BAD_REQUEST_ERROR.code
      );
    }

    return Math.floor(parsed);
  }

  nextSeed(baseSeed, index) {
    if (baseSeed === undefined) {
      return undefined;
    }

    return baseSeed + index;
  }

  toSafeQty(value, fallback = 10, min = 1, max = MOCK_SEED.MAX) {
    if (value === undefined || value === null || value === '') {
      logger.info(`qty no informado, usando valor por defecto: ${fallback}`);
      return fallback;
    }

    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      logger.warning(`qty inválido recibido: ${value}`);
      throw createError(
        ErrorDictionary.INVALID_TYPE_ERROR.name,
        'La cantidad de mocks debe ser un numero entero positivo mayor a cero.',
        ErrorDictionary.INVALID_TYPE_ERROR.status,
        ErrorDictionary.INVALID_TYPE_ERROR.code
      );
    }

    const floored = Math.floor(parsed);
    if (floored < min) {
      logger.warning(`qty fuera de rango bajo: ${floored}`);
      throw createError(
        ErrorDictionary.INVALID_TYPE_ERROR.name,
        'La cantidad de mocks debe ser un numero entero positivo mayor a cero.',
        ErrorDictionary.INVALID_TYPE_ERROR.status,
        ErrorDictionary.INVALID_TYPE_ERROR.code
      );
    }

    if (floored > max) {
      logger.warning(`qty fuera de rango alto: ${floored}, máximo permitido: ${max}`);
      throw createError(
        ErrorDictionary.BAD_REQUEST_ERROR.name,
        `qty fuera de rango. Debe estar entre ${min} y ${max}.`,
        ErrorDictionary.BAD_REQUEST_ERROR.status,
        ErrorDictionary.BAD_REQUEST_ERROR.code
      );
    }

    logger.debug(`qty validado correctamente: ${floored}`);
    return floored;
  }

  assertValidRole(role) {
    if (!role) {
      return;
    }

    const allowedRoles = [USER_ROLES.USER, USER_ROLES.DRIVER, USER_ROLES.STORE];
    if (!allowedRoles.includes(String(role).toLowerCase())) {
      throw createError(
        ErrorDictionary.BAD_REQUEST_ERROR.name,
        'Role invalido. Valores permitidos: user, driver, store',
        ErrorDictionary.BAD_REQUEST_ERROR.status,
        ErrorDictionary.BAD_REQUEST_ERROR.code
      );
    }
  }

  async withHashedPassword(user) {
    const rawPassword = user.password || 'Coderhouse123';
    return {
      ...user,
      password: await bcrypt.hash(rawPassword, 10)
    };
  }

  buildUserPayload(roleInput, seed) {
    this.assertValidRole(roleInput);
    const safeSeed = this.toOptionalSeed(seed);
    const generated = generatemockuser(roleInput, safeSeed);

    return {
      firstName: generated.firstName,
      lastName: generated.lastName,
      email: generated.email,
      password: generated.password,
      role: generated.role,
      address: generated.address,
      ...(generated.role === USER_ROLES.DRIVER ? { isAvailable: generated.isAvailable } : {})
    };
  }

  async getUser(role, seed) {
    const payload = this.buildUserPayload(role, seed);
    return this.withHashedPassword(payload);
  }

  async getUsers(qty, role, seed) {
    const safeQty = this.toSafeQty(qty, 10, 1, MOCK_SEED.MAX);
    this.assertValidRole(role);
    const safeSeed = this.toOptionalSeed(seed);
    const generatedUsers = generatemockusers(safeQty, role, safeSeed);

    logger.info(`Generando ${generatedUsers.length} usuarios mock`, {
      role: role || 'all',
      seed: safeSeed,
    });

    return Promise.all(generatedUsers.map((user) => this.withHashedPassword({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: user.password,
      role: user.role,
      address: user.address,
      ...(user.role === USER_ROLES.DRIVER ? { isAvailable: user.isAvailable } : {})
    })));
  }

  buildMockOrder(index = 0) {
    const itemCount = faker.number.int({ min: 1, max: 3 });
    const items = Array.from({ length: itemCount }, () => ({
      name: faker.commerce.productName(),
      quantity: faker.number.int({ min: 1, max: 4 }),
      price: faker.number.int({ min: 500, max: 4000 })
    }));

    const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    return {
      id: `ord_mock_${index + 1}`,
      customer: `customer_${index + 1}`,
      items,
      deliveryAddress: faker.location.streetAddress(),
      total,
      status: Object.values(ORDER_STATUS)[index % Object.values(ORDER_STATUS).length],
      priority: Object.values(ORDER_PRIORITY)[index % Object.values(ORDER_PRIORITY).length]
    };
  }

  buildMockDelivery(index = 0) {
    return {
      id: `del_mock_${index + 1}`,
      order: `ord_mock_${index + 1}`,
      driver: `driver_${index + 1}`,
      status: Object.values(DELIVERY_STATUS)[index % Object.values(DELIVERY_STATUS).length],
      priority: Object.values(ORDER_PRIORITY)[index % Object.values(ORDER_PRIORITY).length],
      assignedAt: new Date().toISOString(),
      deliveredAt: index % 3 === 2 ? new Date().toISOString() : null
    };
  }

  async getOrders(qty, seed) {
    const safeQty = this.toSafeQty(qty, 5, 1, MOCK_SEED.MAX);
    const safeSeed = this.toOptionalSeed(seed);

    if (safeSeed !== undefined) {
      faker.seed(safeSeed);
    }

    return Array.from({ length: safeQty }, (_, index) => this.buildMockOrder(index));
  }

  async getDeliveries(qty, seed) {
    const safeQty = this.toSafeQty(qty, 5, 1, MOCK_SEED.MAX);
    const safeSeed = this.toOptionalSeed(seed);

    if (safeSeed !== undefined) {
      faker.seed(safeSeed);
    }

    return Array.from({ length: safeQty }, (_, index) => this.buildMockDelivery(index));
  }

  async getSnapshot({ users = 5, orders = 5, deliveries = 5, seed } = {}) {
    const safeUsersQty = this.toSafeQty(users, 5, 1, MOCK_SEED.MAX);
    const safeOrdersQty = this.toSafeQty(orders, 5, 1, MOCK_SEED.MAX);
    const safeDeliveriesQty = this.toSafeQty(deliveries, 5, 1, MOCK_SEED.MAX);
    const generatedUsers = await this.getUsers(safeUsersQty, undefined, seed);
    const generatedOrders = await this.getOrders(safeOrdersQty, seed);
    const generatedDeliveries = await this.getDeliveries(safeDeliveriesQty, seed);

    return {
      users: generatedUsers,
      orders: generatedOrders,
      deliveries: generatedDeliveries
    };
  }

  buildOrderPayload(customerId, seed = undefined) {
    if (seed !== undefined) {
      faker.seed(Number(seed));
    }

    const itemCount = faker.number.int({ min: 1, max: 3 });
    const items = Array.from({ length: itemCount }, () => ({
      name: faker.commerce.productName(),
      quantity: faker.number.int({ min: 1, max: 4 }),
      price: faker.number.int({ min: 500, max: 4000 })
    }));

    const declaredValue = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingCost = 10;

    return {
      customer: customerId,
      items,
      deliveryAddress: faker.location.streetAddress(),
      declaredValue,
      shippingCost,
      total: declaredValue + shippingCost,
      status: faker.helpers.arrayElement(Object.values(ORDER_STATUS)),
      priority: faker.helpers.arrayElement(Object.values(ORDER_PRIORITY))
    };
  }

  buildDeliveryPayload(orderId, driverId, seed = undefined) {
    if (seed !== undefined) {
      faker.seed(Number(seed));
    }

    const status = faker.helpers.arrayElement(Object.values(DELIVERY_STATUS));
    const assignedAt = new Date();
    const deliveredAt = status === DELIVERY_STATUS.DELIVERED ? new Date() : null;

    return {
      order: orderId,
      driver: driverId,
      status,
      priority: faker.helpers.arrayElement(Object.values(ORDER_PRIORITY)),
      assignedAt,
      deliveredAt
    };
  }

  async seedUsers(qty, seed) {
    const safeQty = this.toSafeQty(qty, 10, 1, MOCK_SEED.MAX);
    const generatedUsers = generatemockusers(safeQty, undefined, this.toOptionalSeed(seed));

    logger.info(`Iniciando inserción masiva de usuarios mock`, {
      qty: safeQty,
      seed: this.toOptionalSeed(seed),
    });

    const payloadUsers = await Promise.all(generatedUsers.map(async (user) => {
      const payload = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: await bcrypt.hash(user.password || 'Coderhouse123', 10),
        role: user.role,
        address: user.address,
        ...(user.role === USER_ROLES.DRIVER ? { isAvailable: user.isAvailable } : {})
      };

      return payload;
    }));

    const existingUsers = await this.mockRepository.findUsersByEmails(
      payloadUsers.map((user) => user.email)
    );
    const existingEmails = new Set(existingUsers.map((user) => user.email));
    const uniqueUsers = payloadUsers.filter((user) => !existingEmails.has(user.email));
    const skippedDuplicates = payloadUsers.length - uniqueUsers.length;

    if (uniqueUsers.length === 0) {
      return {
        insertedUsers: [],
        skippedDuplicates
      };
    }

    const insertedUsers = await this.mockRepository.insertUsers(uniqueUsers);

    logger.info(`Usuarios mock insertados correctamente`, {
      inserted: insertedUsers.length,
      skippedDuplicates,
    });

    return {
      insertedUsers,
      skippedDuplicates
    };
  }

  async seedOrders(qty, seed) {
    const safeQty = this.toSafeQty(qty, 10, 1, MOCK_SEED.MAX);
    const baseSeed = this.toOptionalSeed(seed);
    const customers = await this.mockRepository.findUsersByRole(USER_ROLES.USER);
    if (customers.length === 0) {
      logger.warning('No hay clientes para asociar pedidos mock');
      throw createError(
        ErrorDictionary.BAD_REQUEST_ERROR.name,
        'No hay clientes para asociar pedidos. Genera usuarios primero.',
        ErrorDictionary.BAD_REQUEST_ERROR.status,
        ErrorDictionary.BAD_REQUEST_ERROR.code
      );
    }

    logger.info(`Generando ${safeQty} pedidos mock`, { seed: baseSeed });

    const createdOrders = [];
    for (let index = 0; index < safeQty; index += 1) {
      const customer = customers[index % customers.length];
      const payload = this.buildOrderPayload(customer._id, this.nextSeed(baseSeed, index));
      const order = await this.mockRepository.insertOrders([payload]);
      const createdOrder = order[0];
      createdOrders.push(createdOrder);
    }

    logger.info(`Pedidos mock insertados correctamente`, { inserted: createdOrders.length });
    return createdOrders;
  }

  async seedDeliveries(qty, seed) {
    const safeQty = this.toSafeQty(qty, 10, 1, MOCK_SEED.MAX);
    const baseSeed = this.toOptionalSeed(seed);
    const orders = await this.mockRepository.findAllOrders();
    const drivers = await this.mockRepository.findUsersByRole(USER_ROLES.DRIVER);

    if (orders.length === 0) {
      throw createError(
        ErrorDictionary.BAD_REQUEST_ERROR.name,
        'No hay pedidos para asociar entregas. Genera pedidos primero.',
        ErrorDictionary.BAD_REQUEST_ERROR.status,
        ErrorDictionary.BAD_REQUEST_ERROR.code
      );
    }

    if (drivers.length === 0) {
      throw createError(
        ErrorDictionary.BAD_REQUEST_ERROR.name,
        'No hay repartidores para asociar entregas. Genera users con rol driver primero.',
        ErrorDictionary.BAD_REQUEST_ERROR.status,
        ErrorDictionary.BAD_REQUEST_ERROR.code
      );
    }

    const createdDeliveries = [];
    for (let index = 0; index < safeQty; index += 1) {
      const order = orders[index % orders.length];
      const driver = drivers[index % drivers.length];
      const payload = this.buildDeliveryPayload(order._id, driver._id, this.nextSeed(baseSeed, index));
      const deliveryResult = await this.mockRepository.insertDeliveries([payload]);
      const delivery = deliveryResult[0];
      await this.mockRepository.updateOrderById(order._id, {
        delivery: delivery._id,
        status: payload.status === DELIVERY_STATUS.DELIVERED ? ORDER_STATUS.DELIVERED : ORDER_STATUS.ASSIGNED
      });
      createdDeliveries.push(delivery);
    }

    logger.info(`Entregas mock insertadas correctamente`, { inserted: createdDeliveries.length });
    return createdDeliveries;
  }

  async seedDatabase({ qty = 10, collection = 'users', seed } = {}) {
    const safeQty = this.toSafeQty(qty, 10, 1, MOCK_SEED.MAX);
    const safeCollection = String(collection || 'users').toLowerCase();
    const validCollections = ['users', 'orders', 'deliveries', 'all'];

    if (!validCollections.includes(safeCollection)) {
      throw createError(
        ErrorDictionary.BAD_REQUEST_ERROR.name,
        'Coleccion invalida. Valores permitidos: users, orders, deliveries, all',
        ErrorDictionary.BAD_REQUEST_ERROR.status,
        ErrorDictionary.BAD_REQUEST_ERROR.code
      );
    }

    if (safeCollection === 'users') {
      const users = await this.seedUsers(safeQty, seed);
      return {
        insertados: users.insertedUsers.length,
        omitidosDuplicados: users.skippedDuplicates,
        coleccion: 'usuarios',
        ids: users.insertedUsers.slice(0, 5).map((user) => String(user._id))
      };
    }

    if (safeCollection === 'orders') {
      const orders = await this.seedOrders(safeQty, seed);
      return {
        insertados: orders.length,
        coleccion: 'pedidos',
        ids: orders.slice(0, 5).map((order) => String(order._id))
      };
    }

    if (safeCollection === 'deliveries') {
      const deliveries = await this.seedDeliveries(safeQty, seed);
      return {
        insertados: deliveries.length,
        coleccion: 'entregas',
        ids: deliveries.slice(0, 5).map((delivery) => String(delivery._id))
      };
    }

    const users = await this.seedUsers(safeQty, seed);
    const orders = await this.seedOrders(safeQty, seed);
    const deliveries = await this.seedDeliveries(Math.min(safeQty, orders.length), seed);

    return {
      insertados: users.insertedUsers.length + orders.length + deliveries.length,
      coleccion: 'all',
      detalle: {
        usuarios: users.insertedUsers.length,
        usuariosOmitidosDuplicados: users.skippedDuplicates,
        pedidos: orders.length,
        entregas: deliveries.length
      }
    };
  }
}

export default MockService;
