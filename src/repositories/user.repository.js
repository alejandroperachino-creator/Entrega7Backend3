import User from '../models/user.model.js';

function UserRepository() {
    if (!(this instanceof UserRepository)) {
        return new UserRepository();
    }
}

UserRepository.prototype.findAll = async function findAll(filter = {}) {
    return User.find(filter)
        .select('-password -__v')
        .sort({ createdAt: -1 });
};

UserRepository.prototype.findById = async function findById(id) {
    return User.findById(id).select('-password -__v');
};

UserRepository.prototype.findRawById = async function findRawById(id) {
    return User.findById(id);
};

UserRepository.prototype.findByEmail = async function findByEmail(email) {
    return User.findOne({ email: email?.toLowerCase().trim() });
};

UserRepository.prototype.create = async function create(userData) {
    const user = await User.create(userData);
    return User.findById(user._id).select('-password -__v');
};

UserRepository.prototype.updateById = async function updateById(id, updateData) {
    return User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).select(
        '-password -__v'
    );
};

UserRepository.prototype.deleteById = async function deleteById(id) {
    return User.findByIdAndDelete(id).select('-password -__v');
};

export { UserRepository };
export default UserRepository;