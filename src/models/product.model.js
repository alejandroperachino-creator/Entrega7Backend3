import mongoose from 'mongoose';
import { PRODUCT_STATUS } from '../constants/index.js';

const productSchema = new mongoose.Schema(
    {
    name: {
        type: String,
        required: [true, 'El nombre del producto es obligatorio'],
        trim: true
    },
    description: {
        type: String,
        default: '',
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'El precio es obligatorio'],
        min: [0, 'El precio no puede ser negativo']
    },
    stock: {
        type: Number,
        default: 0,
        min: [0, 'El stock no puede ser negativo']
    },
    status: {
        type: String,
        enum: [PRODUCT_STATUS.AVAILABLE, PRODUCT_STATUS.OUT_OF_STOCK, PRODUCT_STATUS.INACTIVE],
        default: PRODUCT_STATUS.AVAILABLE
    }
    },
    {
    timestamps: true
    }
);

const Product = mongoose.model('Product', productSchema);

export default Product;