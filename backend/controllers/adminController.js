const User = require('../models/User');
const Event = require('../models/Event');
const { sendStatusEmail } = require('../utils/emailService');

// GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ isAdmin: false });
    const totalEvents = await Event.countDocuments();
    const pendingEvents = await Event.countDocuments({ status: 'pending' });
    const approvedEvents = await Event.countDocuments({ status: 'approved' });
    const rejectedEvents = await Event.countDocuments({ status: 'rejected' });

    // Events per category
    const categoryStats = await Event.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Users registered per month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        count: { $sum: 1 },
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Events created per month (last 6 months)
    const eventGrowth = await Event.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        count: { $sum: 1 },
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.status(200).json({
      totalUsers, totalEvents, pendingEvents, approvedEvents, rejectedEvents,
      categoryStats, userGrowth, eventGrowth,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/events?status=pending
const getAllEvents = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status && status !== 'all' ? { status } : {};
    const events = await Event.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/admin/events/:id/approve
const approveEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('createdBy');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    event.status = 'approved';
    await event.save();
    await sendStatusEmail(event.createdBy, event, 'approved');
    res.status(200).json({ message: 'Event approved', event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/admin/events/:id/reject
const rejectEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('createdBy');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    event.status = 'rejected';
    await event.save();
    await sendStatusEmail(event.createdBy, event, 'rejected');
    res.status(200).json({ message: 'Event rejected', event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/admin/events/:id
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    await event.deleteOne();
    res.status(200).json({ message: 'Event deleted by admin' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ isAdmin: false })
      .select('-password')
      .sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isAdmin) return res.status(400).json({ message: 'Cannot delete admin' });
    await Event.deleteMany({ createdBy: user._id });
    await user.deleteOne();
    res.status(200).json({ message: 'User and their events deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getStats, getAllEvents, approveEvent, rejectEvent, deleteEvent, getAllUsers, deleteUser };