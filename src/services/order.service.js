import OrderRepository from '../repositories/order.repository.js';
import UserRepository from '../repositories/user.repository.js';
import config from '../config/env.config.js';
import { ORDER_STATUS, ORDER_PRIORITY } from '../constants/index.js';
import { createError, ErrorDictionary } from '../utils/errors.js';
import logger from '../utils/logger.js';

class OrderService {
  constructor() {
    this.orderRepository = new OrderRepository();
    this.userRepository = new UserRepository();
  }

  async getAll(filter) {
    return this.orderRepository.findAll(filter);
  }

  async getOrderById(id) {
    const order = await this.orderRepository.findById(id);

    if (!order) {
      logger.warning(`Pedido no encontrado: ${id}`);
      throw createError(
          ErrorDictionary.ORDER_NOT_FOUND_ERROR.name,
          ErrorDictionary.ORDER_NOT_FOUND_ERROR.message,
          ErrorDictionary.ORDER_NOT_FOUND_ERROR.status,
          ErrorDictionary.ORDER_NOT_FOUND_ERROR.code
      );
    }

    logger.info(`Pedido consultado correctamente`, { orderId: id });
    return order;
  }

  async create(orderData) {
    const { customer, deliveryAddress, items } = orderData;

    if (!customer || !deliveryAddress || !items || items.length < 1) {
      logger.warning('Intento de creación de pedido con datos incompletos', { orderData });
      throw createError(
          ErrorDictionary.BAD_REQUEST_ERROR.name,
          ErrorDictionary.BAD_REQUEST_ERROR.message,
          ErrorDictionary.BAD_REQUEST_ERROR.status,
          ErrorDictionary.BAD_REQUEST_ERROR.code
      );
    }

    const existingCustomer = await this.userRepository.findRawById(customer);
    if (!existingCustomer) {
      logger.warning(`Pedido no creado: cliente inexistente ${customer}`);
      throw createError(
          ErrorDictionary.USER_NOT_FOUND_ERROR.name,
          ErrorDictionary.USER_NOT_FOUND_ERROR.message,
          ErrorDictionary.USER_NOT_FOUND_ERROR.status,
          ErrorDictionary.USER_NOT_FOUND_ERROR.code
      );
    }

    const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const shippingCost = this.calculateShippingCost({
      isProduction: config.environment === 'production',
      shipmentValue: total
    });

    const createdOrder = await this.orderRepository.create({
      ...orderData,
      declaredValue: total,
      shippingCost,
      total: total + shippingCost,
      status: ORDER_STATUS.CREATED,
      priority: orderData.priority || ORDER_PRIORITY.NORMAL
    });

    logger.info('Pedido creado correctamente', {
      orderId: createdOrder?._id?.toString?.() || createdOrder?.id,
      customer,
      total: total + shippingCost,
    });

    return createdOrder;
  }

  async addProof(id, file) {
    if (!file) {
      throw createError(
        ErrorDictionary.MISSING_FILE.name,
        ErrorDictionary.MISSING_FILE.message,
        ErrorDictionary.MISSING_FILE.status,
        ErrorDictionary.MISSING_FILE.code
      );
    }

    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw createError(
        ErrorDictionary.ORDER_NOT_FOUND_ERROR.name,
        ErrorDictionary.ORDER_NOT_FOUND_ERROR.message,
        ErrorDictionary.ORDER_NOT_FOUND_ERROR.status,
        ErrorDictionary.ORDER_NOT_FOUND_ERROR.code
      );
    }

    const proofs = Array.isArray(order.proofs) ? [...order.proofs] : [];
    proofs.push({
      name: file.originalname,
      reference: file.filename,
      originalName: file.originalname,
      fileName: file.filename,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size,
      type: 'comprobante',
      uploadedAt: new Date()
    });

    const updatedOrder = await this.orderRepository.update(id, { proofs });
    logger.info('Comprobante asociado a la orden', { orderId: id, fileName: file.filename });
    return updatedOrder;
  }

  async update(id, orderData) {
    const updatedOrder = await this.orderRepository.update(id, orderData);
    if (!updatedOrder) {
      throw createError(
          ErrorDictionary.ORDER_NOT_FOUND_ERROR.name,
          ErrorDictionary.ORDER_NOT_FOUND_ERROR.message,
          ErrorDictionary.ORDER_NOT_FOUND_ERROR.status,
          ErrorDictionary.ORDER_NOT_FOUND_ERROR.code
      );
    }
    return updatedOrder;
  }

  async delete(id) {
    const deletedOrder = await this.orderRepository.delete(id);
    if (!deletedOrder) {
      throw createError(
          ErrorDictionary.ORDER_NOT_FOUND_ERROR.name,
          ErrorDictionary.ORDER_NOT_FOUND_ERROR.message,
          ErrorDictionary.ORDER_NOT_FOUND_ERROR.status,
          ErrorDictionary.ORDER_NOT_FOUND_ERROR.code
      );
    }
    return deletedOrder;
  }

  calculateShippingCost({ isProduction, shipmentValue }) {
    if (isProduction) {
      return 50 + shipmentValue * 0.01;
    }

    return 10;
  }
}

export default OrderService;