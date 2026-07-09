const Event = require('../models/Event');
const User = require('../models/User');
const { sendInterestEmail } = require('../utils/emailService');

const getEvents = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 6, sortBy = 'upcoming' } = req.query;
    const query = { status: 'approved' }; // only show approved events publicly
    if (search) query.title = { $regex: search, $options: 'i' };
    if (category && category !== 'All') query.category = category;

    const sortMap = {
      upcoming: { date: 1 },
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
    };
    const skip = (Number(page) - 1) * Number(limit);

    const events = await Event.find(query)
      .populate('createdBy', 'name email')
      .sort(sortMap[sortBy] || { date: 1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Event.countDocuments(query);

    res.status(200).json({
      events, total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('createdBy', 'name email');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyEvents = async (req, res) => {
  try {
    // Creator sees all their events regardless of status
    const events = await Event.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createEvent = async (req, res) => {
  try {
    const { title, description, date, location, category } = req.body;
    const event = await Event.create({
      title, description, date, location, category,
      image: req.file ? `/uploads/${req.file.filename}` : '',
      createdBy: req.user.id,
      status: 'pending', // always starts as pending
    });
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.createdBy.toString() !== req.user.id)
      return res.status(401).json({ message: 'Not authorized' });

    const { title, description, date, location, category } = req.body;
    event.title = title || event.title;
    event.description = description || event.description;
    event.date = date || event.date;
    event.location = location || event.location;
    event.category = category || event.category;
    if (req.file) event.image = `/uploads/${req.file.filename}`;
    // editing resets to pending for re-approval
    event.status = 'pending';

    const updatedEvent = await event.save();
    res.status(200).json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.createdBy.toString() !== req.user.id)
      return res.status(401).json({ message: 'Not authorized' });
    await event.deleteOne();
    res.status(200).json({ message: 'Event removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleInterest = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('createdBy');
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const userId = req.user.id;
    const alreadyInterested = event.interestedUsers.some(id => id.toString() === userId);

    if (alreadyInterested) {
      event.interestedUsers = event.interestedUsers.filter(id => id.toString() !== userId);
    } else {
      event.interestedUsers.push(userId);
      // Send email to event creator (non-blocking)
      const interestedUser = await User.findById(userId);
      if (interestedUser && event.createdBy._id.toString() !== userId) {
        sendInterestEmail(event.createdBy, event, interestedUser);
      }
    }

    await event.save();
    res.status(200).json({
      interestedCount: event.interestedUsers.length,
      isInterested: !alreadyInterested,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getEvents, getEventById, getMyEvents, createEvent,
  updateEvent, deleteEvent, toggleInterest,
};