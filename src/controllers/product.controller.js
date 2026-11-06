import ProductService from '../services/product.service.js';

class ProductController {
  constructor() {
    this.productService = new ProductService();

    this.getAll = this.getAll.bind(this);
    this.getById = this.getById.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
  }

  async getAll(req, res, next) {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const products = await this.productService.getAllProducts({ includeInactive });
      return res.status(200).json({
        status: 'success',
        message: 'Productos obtenidos exitosamente',
        payload: products
      });
    } catch (error) {
      return next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const product = await this.productService.getProductById(req.params.id);
      return res.status(200).json({
        status: 'success',
        message: 'Producto obtenido exitosamente',
        payload: product
      });
    } catch (error) {
      return next(error);
    }
  }

  async create(req, res, next) {
    try {
      const product = await this.productService.createProduct(req.body);
      return res.status(201).json({
        status: 'success',
        message: 'Producto creado exitosamente',
        payload: product
      });
    } catch (error) {
      return next(error);
    }
  }

  async update(req, res, next) {
    try {
      const product = await this.productService.updateProduct(req.params.id, req.body);
      return res.status(200).json({
        status: 'success',
        message: 'Producto actualizado exitosamente',
        payload: product
      });
    } catch (error) {
      return next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const product = await this.productService.deleteProduct(req.params.id);
      return res.status(200).json({
        status: 'success',
        message: 'Producto eliminado exitosamente',
        payload: product
      });
    } catch (error) {
      return next(error);
    }
  }
}

export default new ProductController();