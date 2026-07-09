const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePic: { type: String, default: '' },
  bio: { type: String, default: '' },
  isAdmin: { type: Boolean, default: false },
  pushSubscription: { type: Object, default: null }, // for browser notifications
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);