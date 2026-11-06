import mongoose from 'mongoose';
import { DELIVERY_STATUS, ORDER_PRIORITY } from '../constants/index.js';

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

const deliverySchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: [true, 'El pedido es obligatorio']
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  status: {
    type: String,
    enum: Object.values(DELIVERY_STATUS),
    default: DELIVERY_STATUS.PENDING
  },
  priority: {
    type: String,
    enum: Object.values(ORDER_PRIORITY),
    default: ORDER_PRIORITY.NORMAL
  },
  assignedAt: {
    type: Date,
    default: null
  },
  deliveredAt: {
    type: Date,
    default: null
  },
  proofs: {
    type: [proofSchema],
    default: []
  }
}, {
  timestamps: true
});

const Delivery = mongoose.model('Delivery', deliverySchema);

export default Delivery;
