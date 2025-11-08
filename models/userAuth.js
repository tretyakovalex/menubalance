const mongoose = require('mongoose');

const UserAuthSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    hasPaid: { type: Boolean, required: true, default: false }
}, { timestamps: true });

module.exports = mongoose.model('UserAuth', UserAuthSchema);
