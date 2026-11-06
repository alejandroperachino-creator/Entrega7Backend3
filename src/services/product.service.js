import ProductRepository from '../repositories/product.repository.js';
import { PRODUCT_STATUS } from '../constants/index.js';
import { createError, ErrorDictionary } from '../utils/errors.js';

class ProductService {
    constructor() {
    this.productRepository = new ProductRepository();
    }

    async getAllProducts({ includeInactive = false } = {}) {
    return this.productRepository.findAll({ includeInactive });
    }

    async getProductById(id) {
    const product = await this.productRepository.findById(id);
    if (!product) {
        throw createError(
            ErrorDictionary.PRODUCT_NOT_FOUND_ERROR.name,
            ErrorDictionary.PRODUCT_NOT_FOUND_ERROR.message,
            ErrorDictionary.PRODUCT_NOT_FOUND_ERROR.status,
            ErrorDictionary.PRODUCT_NOT_FOUND_ERROR.code
        );
    }

    return product;
    }

    async createProduct(productData) {
    const { name, price } = productData;
    if (!name || price === undefined) {
        throw createError(
            ErrorDictionary.BAD_REQUEST_ERROR.name,
            ErrorDictionary.BAD_REQUEST_ERROR.message,
            ErrorDictionary.BAD_REQUEST_ERROR.status,
            ErrorDictionary.BAD_REQUEST_ERROR.code
        );
    }

    if (price < 0) {
        throw createError(
            ErrorDictionary.BAD_REQUEST_ERROR.name,
            ErrorDictionary.BAD_REQUEST_ERROR.message,
            ErrorDictionary.BAD_REQUEST_ERROR.status,
            ErrorDictionary.BAD_REQUEST_ERROR.code
        );
    }

    return this.productRepository.create({
        ...productData,
        status: productData.status || PRODUCT_STATUS.AVAILABLE
    });
    }

    async updateProduct(id, productData) {
    if (productData.price !== undefined && productData.price < 0) {
        throw createError(
            ErrorDictionary.BAD_REQUEST_ERROR.name,
            ErrorDictionary.BAD_REQUEST_ERROR.message,
            ErrorDictionary.BAD_REQUEST_ERROR.status,
            ErrorDictionary.BAD_REQUEST_ERROR.code
        );
    }

    const updatedProduct = await this.productRepository.updateById(id, productData);
    if (!updatedProduct) {
        throw createError(
            ErrorDictionary.PRODUCT_NOT_FOUND_ERROR.name,
            ErrorDictionary.PRODUCT_NOT_FOUND_ERROR.message,
            ErrorDictionary.PRODUCT_NOT_FOUND_ERROR.status,
            ErrorDictionary.PRODUCT_NOT_FOUND_ERROR.code
        );
    }

    return updatedProduct;
    }

    async deleteProduct(id) {
    const deletedProduct = await this.productRepository.deleteById(id);
    if (!deletedProduct) {
        throw createError(
            ErrorDictionary.PRODUCT_NOT_FOUND_ERROR.name,
            ErrorDictionary.PRODUCT_NOT_FOUND_ERROR.message,
            ErrorDictionary.PRODUCT_NOT_FOUND_ERROR.status,
            ErrorDictionary.PRODUCT_NOT_FOUND_ERROR.code
        );
    }

    return deletedProduct;
    }
}

export default ProductService;