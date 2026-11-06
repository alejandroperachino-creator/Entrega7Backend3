import mongoose from 'mongoose';
import { ORDER_PRIORITY, ORDER_STATUS } from '../constants/index.js';

const orderItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del item es obligatorio']
  },
  quantity: {
    type: Number,
    required: [true, 'La cantidad es obligatoria'],
    min: [1, 'La cantidad mínima es 1']
  },
  price: {
    type: Number,
    required: [true, 'El precio es obligatorio'],
    min: [0, 'El precio no puede ser negativo']
  }
}, { _id: false });

const proofSchema = new mongoose.Schema({
  name: { type: String, required: true },
  reference: { type: String, required: true },
  originalName: { type: String, required: true },
  fileName: { type: String, required: true },
  path: { type: String, required: true },
  mimetype: { type: String, required: true },
  size: { type: Number, required: true },
  type: { type: String, default: 'comprobante' },
  uploadedAt: { type: Date, default: Date.now }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El cliente es obligatorio']
  },
  items: {
    type: [orderItemSchema],
    validate: {
      validator: (v) => v.length > 0,
      message: 'El pedido debe tener al menos un item'
    }
  },
  deliveryAddress: {
    type: String,
    required: [true, 'La dirección de entrega es obligatoria']
  },
  total: {
    type: Number,
    default: 0
  },
  shippingCost: {
    type: Number,
    default: 0
  },
  declaredValue: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: Object.values(ORDER_STATUS),
    default: ORDER_STATUS.CREATED
  },
  priority: {
    type: String,
    enum: Object.values(ORDER_PRIORITY),
    default: ORDER_PRIORITY.NORMAL
  },
  delivery: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Delivery',
    default: null
  },
  proofs: {
    type: [proofSchema],
    default: []
  }
}, {
  timestamps: true
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
