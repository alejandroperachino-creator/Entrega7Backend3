import Delivery from '../models/delivery.model.js';

class DeliveryRepository {
    async findAll(filter = {}) {
    return Delivery.find(filter)
        .populate('order')
        .populate('driver', 'firstName lastName email role');
    }

    async findById(id) {
    return Delivery.findById(id)
        .populate('order')
        .populate('driver', 'firstName lastName email role');
    }

    async create(deliveryData) {
    return Delivery.create(deliveryData);
    }

    async updateById(id, updateData) {
    return Delivery.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
        .populate('order')
        .populate('driver', 'firstName lastName email role');
    }

    async deleteById(id) {
    return Delivery.findByIdAndDelete(id);
    }
}

export default DeliveryRepository;