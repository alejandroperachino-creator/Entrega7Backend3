import DeliveryService from '../services/delivery.service.js';

class DeliveryController {
  constructor() {
    this.deliveryService = new DeliveryService();

    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.create = this.create.bind(this);
    this.uploadProof = this.uploadProof.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  async getAll(req, res, next) {
    try {
      const deliveries = await this.deliveryService.getAllDeliveries(req.query || {});
      return res.status(200).json({
        status: 'success',
        message: 'Entregas obtenidas exitosamente',
        payload: deliveries
      });
    } catch (error) {
      return next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const delivery = await this.deliveryService.getDeliveryById(req.params.id);
      return res.status(200).json({
        status: 'success',
        message: 'Entrega obtenida exitosamente',
        payload: delivery
      });
    } catch (error) {
      return next(error);
    }
  }

  async create(req, res, next) {
    try {
      const delivery = await this.deliveryService.createDelivery(req.body);
      return res.status(201).json({
        status: 'success',
        message: 'Entrega creada exitosamente',
        payload: delivery
      });
    } catch (error) {
      return next(error);
    }
  }

  async uploadProof(req, res, next) {
    try {
      const delivery = await this.deliveryService.addProof(req.params.id, req.file);
      return res.status(200).json({
        status: 'success',
        message: 'Comprobante asociado a la entrega exitosamente',
        payload: delivery
      });
    } catch (error) {
      return next(error);
    }
  }

  async update(req, res, next) {
    try {
      const delivery = await this.deliveryService.updateDelivery(req.params.id, req.body);
      return res.status(200).json({
        status: 'success',
        message: 'Entrega actualizada exitosamente',
        payload: delivery
      });
    } catch (error) {
      return next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const delivery = await this.deliveryService.deleteDelivery(req.params.id);
      return res.status(200).json({
        status: 'success',
        message: 'Entrega eliminada exitosamente',
        payload: delivery
      });
    } catch (error) {
      return next(error);
    }
  }
}

export default new DeliveryController();