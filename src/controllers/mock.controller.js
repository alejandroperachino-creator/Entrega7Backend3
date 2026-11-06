import MockService from '../services/mock.service.js';

class MockController {
  constructor() {
    this.mockService = new MockService();

    this.getUser = this.getUser.bind(this);
    this.getUsers = this.getUsers.bind(this);
    this.getOrders = this.getOrders.bind(this);
    this.getDeliveries = this.getDeliveries.bind(this);
    this.getSnapshot = this.getSnapshot.bind(this);
    this.seed = this.seed.bind(this);
    this.seedUsers = this.seedUsers.bind(this);
    this.seedOrders = this.seedOrders.bind(this);
    this.seedDeliveries = this.seedDeliveries.bind(this);
    this.seedAll = this.seedAll.bind(this);
  }

  success(res, code, message, payload) {
    return res.status(code).json({
      status: 'success',
      message,
      payload
    });
  }

  async getUser(req, res, next) {
    try {
      const payload = await this.mockService.getUser(req.query.role, req.query.seed);
      return this.success(res, 200, 'Usuario mock generado', payload);
    } catch (error) {
      return next(error);
    }
  }

  async getUsers(req, res, next) {
    try {
      const payload = await this.mockService.getUsers(req.query.qty, req.query.role, req.query.seed);
      return this.success(res, 200, 'Usuarios mock generados', payload);
    } catch (error) {
      return next(error);
    }
  }

  async getOrders(req, res, next) {
    try {
      const payload = await this.mockService.getOrders(req.query.qty, req.query.seed);
      return this.success(res, 200, 'Pedidos mock generados', payload);
    } catch (error) {
      return next(error);
    }
  }

  async getDeliveries(req, res, next) {
    try {
      const payload = await this.mockService.getDeliveries(req.query.qty, req.query.seed);
      return this.success(res, 200, 'Entregas mock generadas', payload);
    } catch (error) {
      return next(error);
    }
  }

  async getSnapshot(req, res, next) {
    try {
      const payload = await this.mockService.getSnapshot({
        users: req.query.users,
        orders: req.query.orders,
        deliveries: req.query.deliveries,
        seed: req.query.seed
      });

      return this.success(res, 200, 'Snapshot mock generado', payload);
    } catch (error) {
      return next(error);
    }
  }

  async seed(req, res, next) {
    try {
      const payload = await this.mockService.seedDatabase({
        qty: req.query.qty,
        collection: req.query.collection || req.query.type || 'users',
        seed: req.query.seed
      });

      return this.success(res, 201, 'Datos de prueba insertados', payload);
    } catch (error) {
      return next(error);
    }
  }

  async seedUsers(req, res, next) {
    try {
      const payload = await this.mockService.seedDatabase({
        qty: req.query.qty,
        collection: 'users',
        seed: req.query.seed
      });

      return this.success(res, 201, 'Usuarios de prueba insertados', payload);
    } catch (error) {
      return next(error);
    }
  }

  async seedOrders(req, res, next) {
    try {
      const payload = await this.mockService.seedDatabase({
        qty: req.query.qty,
        collection: 'orders',
        seed: req.query.seed
      });

      return this.success(res, 201, 'Pedidos de prueba insertados', payload);
    } catch (error) {
      return next(error);
    }
  }

  async seedDeliveries(req, res, next) {
    try {
      const payload = await this.mockService.seedDatabase({
        qty: req.query.qty,
        collection: 'deliveries',
        seed: req.query.seed
      });

      return this.success(res, 201, 'Entregas de prueba insertadas', payload);
    } catch (error) {
      return next(error);
    }
  }

  async seedAll(req, res, next) {
    try {
      const payload = await this.mockService.seedDatabase({
        qty: req.query.qty,
        collection: 'all',
        seed: req.query.seed
      });

      return this.success(res, 201, 'Seed integral ejecutado', payload);
    } catch (error) {
      return next(error);
    }
  }
}

export default MockController;
