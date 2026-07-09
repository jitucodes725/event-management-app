const webpush = require('web-push');
const User = require('../models/User');

// POST /api/notifications/subscribe
const subscribe = async (req, res) => {
  try {
    const { subscription } = req.body;
    await User.findByIdAndUpdate(req.user.id, { pushSubscription: subscription });
    res.status(200).json({ message: 'Subscribed to push notifications' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/notifications/unsubscribe
const unsubscribe = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { pushSubscription: null });
    res.status(200).json({ message: 'Unsubscribed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { subscribe, unsubscribe };