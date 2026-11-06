import { DELIVERY_STATUS, ORDER_PRIORITY, ORDER_STATUS, USER_ROLES } from '../constants/index.js';
import DeliveryRepository from '../repositories/delivery.repository.js';
import OrderRepository from '../repositories/order.repository.js';
import UserRepository from '../repositories/user.repository.js';
import { createError, ErrorDictionary } from '../utils/errors.js';
import logger from '../utils/logger.js';

class DeliveryService {
    constructor() {
    this.deliveryRepository = new DeliveryRepository();
    this.orderRepository = new OrderRepository();
    this.userRepository = new UserRepository();
    }

    async getAllDeliveries(filter = {}) {
    return this.deliveryRepository.findAll(filter);
    }

    async getDeliveryById(id) {
    const delivery = await this.deliveryRepository.findById(id);
    if (!delivery) {
        throw createError(
            ErrorDictionary.DELIVERY_NOT_FOUND_ERROR.name,
            ErrorDictionary.DELIVERY_NOT_FOUND_ERROR.message,
            ErrorDictionary.DELIVERY_NOT_FOUND_ERROR.status,
            ErrorDictionary.DELIVERY_NOT_FOUND_ERROR.code
        );
    }

    return delivery;
    }

    async createDelivery(deliveryData) {
    if (!deliveryData.order) {
        throw createError(
            ErrorDictionary.BAD_REQUEST_ERROR.name,
            ErrorDictionary.BAD_REQUEST_ERROR.message,
            ErrorDictionary.BAD_REQUEST_ERROR.status,
            ErrorDictionary.BAD_REQUEST_ERROR.code
        );
    }

    const order = await this.orderRepository.findById(deliveryData.order);
    if (!order) {
        throw createError(
            ErrorDictionary.ORDER_NOT_FOUND_ERROR.name,
            ErrorDictionary.ORDER_NOT_FOUND_ERROR.message,
            ErrorDictionary.ORDER_NOT_FOUND_ERROR.status,
            ErrorDictionary.ORDER_NOT_FOUND_ERROR.code
        );
    }

    if (deliveryData.driver) {
        const driver = await this.userRepository.findRawById(deliveryData.driver);
        if (!driver) {
        throw createError(
            ErrorDictionary.USER_NOT_FOUND_ERROR.name,
            ErrorDictionary.USER_NOT_FOUND_ERROR.message,
            ErrorDictionary.USER_NOT_FOUND_ERROR.status,
            ErrorDictionary.USER_NOT_FOUND_ERROR.code
        );
        }

        if (driver.role !== USER_ROLES.DRIVER) {
        throw createError(
            ErrorDictionary.BAD_REQUEST_ERROR.name,
            ErrorDictionary.BAD_REQUEST_ERROR.message,
            ErrorDictionary.BAD_REQUEST_ERROR.status,
            ErrorDictionary.BAD_REQUEST_ERROR.code
        );
        }
    }

    const hasDriver = Boolean(deliveryData.driver);
    const newDelivery = await this.deliveryRepository.create({
        order: deliveryData.order,
        driver: deliveryData.driver || null,
        status: hasDriver ? DELIVERY_STATUS.ASSIGNED : DELIVERY_STATUS.PENDING,
        priority: deliveryData.priority || ORDER_PRIORITY.NORMAL,
        assignedAt: hasDriver ? new Date() : null
    });

    await this.orderRepository.update(deliveryData.order, {
        status: ORDER_STATUS.ASSIGNED,
        delivery: newDelivery._id
    });

    return this.deliveryRepository.findById(newDelivery._id);
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

    const delivery = await this.deliveryRepository.findById(id);
    if (!delivery) {
        throw createError(
            ErrorDictionary.DELIVERY_NOT_FOUND_ERROR.name,
            ErrorDictionary.DELIVERY_NOT_FOUND_ERROR.message,
            ErrorDictionary.DELIVERY_NOT_FOUND_ERROR.status,
            ErrorDictionary.DELIVERY_NOT_FOUND_ERROR.code
        );
    }

    const proofs = Array.isArray(delivery.proofs) ? [...delivery.proofs] : [];
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

    const updatedDelivery = await this.deliveryRepository.updateById(id, { proofs });
    logger.info('Comprobante asociado a la entrega', { deliveryId: id, fileName: file.filename });
    return updatedDelivery;
    }

    async updateDelivery(id, deliveryData) {
    const updateData = { ...deliveryData };
    if (updateData.status === DELIVERY_STATUS.DELIVERED && !updateData.deliveredAt) {
        updateData.deliveredAt = new Date();
    }

    const updatedDelivery = await this.deliveryRepository.updateById(id, updateData);
    if (!updatedDelivery) {
        throw createError(
            ErrorDictionary.DELIVERY_NOT_FOUND_ERROR.name,
            ErrorDictionary.DELIVERY_NOT_FOUND_ERROR.message,
            ErrorDictionary.DELIVERY_NOT_FOUND_ERROR.status,
            ErrorDictionary.DELIVERY_NOT_FOUND_ERROR.code
        );
    }

    return updatedDelivery;
    }

    async deleteDelivery(id) {
    const deletedDelivery = await this.deliveryRepository.deleteById(id);
    if (!deletedDelivery) {
        throw createError(
            ErrorDictionary.DELIVERY_NOT_FOUND_ERROR.name,
            ErrorDictionary.DELIVERY_NOT_FOUND_ERROR.message,
            ErrorDictionary.DELIVERY_NOT_FOUND_ERROR.status,
            ErrorDictionary.DELIVERY_NOT_FOUND_ERROR.code
        );
    }

    return deletedDelivery;
    }
}

export default DeliveryService;