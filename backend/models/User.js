const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: {
    type: String,
    default: '',
    validate: {
      validator: function (v) {
        return v === '' || /^\d{10}$/.test(v);
      },
      message: 'Phone number must be exactly 10 digits',
    },
  },
  profilePic: { type: String, default: '' },
  bio: { type: String, default: '' },
  isAdmin: { type: Boolean, default: false },
  pushSubscription: { type: Object, default: null },
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);