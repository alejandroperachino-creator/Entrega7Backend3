import Product from '../models/product.model.js';
import { PRODUCT_STATUS } from '../constants/index.js';

class ProductRepository {
    async findAll({ includeInactive = false } = {}) {
    const filter = includeInactive
        ? {}
        : {
            status: PRODUCT_STATUS.AVAILABLE,
            stock: { $gt: 0 }
        };

    return Product.find(filter)
        .select('-__v')
        .sort({ createdAt: -1 });
    }

    async findById(id) {
    return Product.findById(id).select('-__v');
    }

    async create(productData) {
    return Product.create(productData);
    }

    async updateById(id, productData) {
    return Product.findByIdAndUpdate(id, productData, { new: true, runValidators: true }).select('-__v');
    }

    async deleteById(id) {
    return Product.findByIdAndDelete(id).select('-__v');
    }
}

export default ProductRepository;