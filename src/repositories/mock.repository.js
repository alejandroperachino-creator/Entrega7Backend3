import Delivery from '../models/delivery.model.js';
import Order from '../models/order.model.js';
import User from '../models/user.model.js';

class MockRepository {
    async insertUsers(users) {
    return User.insertMany(users, { ordered: false });
    }

    async findUsersByEmails(emails) {
    if (!Array.isArray(emails) || emails.length === 0) {
        return [];
    }

    return User.find({ email: { $in: emails } }).lean();
    }

    async insertOrders(orders) {
    return Order.insertMany(orders, { ordered: false });
    }

    async insertDeliveries(deliveries) {
    return Delivery.insertMany(deliveries, { ordered: false });
    }

    async findUsersByRole(role) {
    return User.find({ role }).lean();
    }

    async findAllOrders() {
    return Order.find().lean();
    }

    async updateOrderById(id, data) {
    return Order.findByIdAndUpdate(id, data, { new: true });
    }
}

export default MockRepository;