import OrderService from '../services/order.service.js';

class OrderController {
    constructor(orderService = new OrderService()) {
    this.orderService = orderService;

    this.getAll = this.getAll.bind(this);
    this.getOrderById = this.getOrderById.bind(this);
    this.create = this.create.bind(this);
    this.uploadProof = this.uploadProof.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    }

    static handleSuccess(res, { code, message, payload }) {
    return res.status(code).json({
        status: 'success',
        message,
        payload
    });
    }

    async getAll(req, res, next) {
    try {
        const orders = await this.orderService.getAll(req.query || {});
        return OrderController.handleSuccess(res, {
        code: 200,
        message: 'Ordenes obtenidas exitosamente',
        payload: orders
        });
    } catch (error) {
        return next(error);
    }
    } 

    async getOrderById(req, res, next) {
    try {
        const order = await this.orderService.getOrderById(req.params.id);
        return OrderController.handleSuccess(res, {
        code: 200,
        message: 'Orden obtenida exitosamente',
        payload: order
        });
    } catch (error) {
        return next(error);
    }
    }

    async create(req, res, next) {
    try {
        const order = await this.orderService.create(req.body);
        return OrderController.handleSuccess(res, {
        code: 201,
        message: 'Orden creada exitosamente',
        payload: order
        });
    } catch (error) {
        return next(error);
    }
    }

    async uploadProof(req, res, next) {
    try {
        const order = await this.orderService.addProof(req.params.id, req.file);
        return OrderController.handleSuccess(res, {
        code: 200,
        message: 'Comprobante asociado a la orden exitosamente',
        payload: order
        });
    } catch (error) {
        return next(error);
    }
    }

    async update(req, res, next) {
    try {
        const order = await this.orderService.update(req.params.id, req.body);
        return OrderController.handleSuccess(res, {
        code: 200,
        message: 'Orden actualizada exitosamente',
        payload: order
        });
    } catch (error) {
        return next(error);
    }
    }

    async delete(req, res, next) {
    try {
        const order = await this.orderService.delete(req.params.id);
        return OrderController.handleSuccess(res, {
        code: 200,
        message: 'Orden borrada exitosamente',
        payload: order
        });
    } catch (error) {
        return next(error);
    }
    }
}

export default OrderController;
