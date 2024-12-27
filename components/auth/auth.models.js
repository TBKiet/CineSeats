const mongoose = require('mongoose');
const crypto = require('crypto');
const userDBConnection = require('../../config/userDBConnection');
const schema = mongoose.Schema;

const userSchema = new schema({
    // Account
    username: String,
    email: String,
    password: String,
    role: {
        type: String,
        default: 'user'
    },
    isActive: { type: Boolean, default: true },
    activationToken: { type: String },
    activationExpires: { type: Date }, // Expiry time
    // accumulated_points: { type: Number, default: 0 },
    // level: { type: String, default: '' },
    // notifications: { type: Array, default: [] },
    // history: { type: Array, default: [] },
    // vouchers: { type: Array, default: [] },

    // // Profile
    // firstName: { type: String, default: '' },
    // lastName: { type: String, default: '' },
    // phone: { type: String, default: '' },
    // birthday: { type: Date, default: Date.now },
    // country: { type: String, default: '' },
    // address: { type: String, default: '' },
    // theater: { type: String, default: '' },
    // avatar_url: { type: String, default: '' },
});
userSchema.methods.getVerificationToken = function () {
    const token = crypto.randomBytes(32).toString('hex');
    this.activationToken = crypto.createHash('sha256').update(token).digest('hex');
    this.activationExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    return token;
}
const userModel = userDBConnection.model('user', userSchema);
module.exports = userModel;
