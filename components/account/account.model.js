const mongoose = require('mongoose');
const userDBConnection = require('../../config/userDBConnection');

const userSchema = new mongoose.Schema({
    // Profile
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    birthday: Date,
    country: String,
    address: String,
    theater: String,
    avatar_url: String,

    // Account
    // id: String,
    username: String,
    password: String,
    accumulated_points: Number,
    level: String,
    notifications: Array,
    history: Array,
    vouchers: Array,
    role: {
        type: String,
        default: 'user'
    },
    isActive: {
        type: Boolean,
        default: true
    },
});

const User = userDBConnection.model('User', userSchema);

const getUserData = async (userId) => {
    try {
        const filter = { _id: new mongoose.Types.ObjectId(userId) }; // Use 'new'
        const user = await User.findOne(filter);
        return user;
    } catch (error) {
        console.error('Error fetching user data:', error);
        throw error;
    }
};

// Update user data
const updateUserData = async (userId, updatedData) => {
    return await User.findByIdAndUpdate(userId, updatedData, { new: true });
}

module.exports = { getUserData, User, updateUserData };
