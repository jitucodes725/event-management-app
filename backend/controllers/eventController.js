const Event = require('../models/Event');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const { sendInterestEmail } = require('../utils/emailService');

const attachBookedCount = async (eventDoc) => {
  if (!eventDoc) return null;
  const bookedCount = await Ticket.countDocuments({
    event: eventDoc._id,
    status: 'CONFIRMED',
  });
  const obj = eventDoc.toObject ? eventDoc.toObject() : eventDoc;
  obj.bookedCount = bookedCount;
  return obj;
};

const attachBookedCountToAll = async (eventDocs) => {
  return Promise.all(eventDocs.map(attachBookedCount));
};

const getEvents = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 6, sortBy = 'upcoming' } = req.query;
    const query = { status: 'approved' };
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
    const eventsWithCount = await attachBookedCountToAll(events);

    res.status(200).json({
      events: eventsWithCount,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllApprovedEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: 'approved' })
      .populate('createdBy', 'name')
      .sort({ date: 1 });
    const eventsWithCount = await attachBookedCountToAll(events);
    res.status(200).json(eventsWithCount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('createdBy', 'name email');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    const eventWithCount = await attachBookedCount(event);
    res.status(200).json(eventWithCount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    const eventsWithCount = await attachBookedCountToAll(events);
    res.status(200).json(eventsWithCount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createEvent = async (req, res) => {
  try {
    const { title, description, date, location, category, capacity } = req.body;

    if (!capacity || Number(capacity) < 1) {
      return res.status(400).json({ message: 'Capacity must be at least 1' });
    }

    const event = await Event.create({
      title,
      description,
      date,
      location,
      category,
      capacity: Number(capacity),
      image: req.file ? `/uploads/${req.file.filename}` : '',
      createdBy: req.user.id,
      status: 'pending',
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
    if (event.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { title, description, date, location, category, capacity } = req.body;

    if (capacity && Number(capacity) < 1) {
      return res.status(400).json({ message: 'Capacity must be at least 1' });
    }
    const bookedCount = await Ticket.countDocuments({ event: req.params.id, status: 'CONFIRMED' });
    if (capacity && Number(capacity) < bookedCount) {
      return res.status(400).json({
        message: `Capacity cannot be less than current booked tickets (${bookedCount})`,
      });
    }

    event.title = title || event.title;
    event.description = description || event.description;
    event.date = date || event.date;
    event.location = location || event.location;
    event.category = category || event.category;
    if (capacity) event.capacity = Number(capacity);
    if (req.file) event.image = `/uploads/${req.file.filename}`;
    event.status = 'pending';

    const updatedEvent = await event.save();
    const eventWithCount = await attachBookedCount(updatedEvent);
    res.status(200).json(eventWithCount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
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
    const alreadyInterested = event.interestedUsers.some(
      (id) => id.toString() === userId
    );

    if (!alreadyInterested && event.interestedUsers.length >= event.capacity) {
      return res.status(400).json({ message: 'Event is full' });
    }

    if (alreadyInterested) {
      event.interestedUsers = event.interestedUsers.filter(
        (id) => id.toString() !== userId
      );
    } else {
      event.interestedUsers.push(userId);
      const interestedUser = await User.findById(userId);
      if (interestedUser && event.createdBy._id.toString() !== userId) {
        sendInterestEmail(event.createdBy, event, interestedUser);
      }
    }

    await event.save();

    res.status(200).json({
      interestedCount: event.interestedUsers.length,
      isInterested: !alreadyInterested,
      isFull: event.interestedUsers.length >= event.capacity,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getNearbyEvents = async (req, res) => {
  try {
    const { lat, lng, radius = 50 } = req.query;
    if (!lat || !lng) return res.status(400).json({ message: 'lat and lng required' });

    const events = await Event.find({ status: 'approved' }).populate('createdBy', 'name');
    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    const toRad = (val) => (val * Math.PI) / 180;
    const haversine = (lat1, lng1, lat2, lng2) => {
      const R = 6371;
      const dLat = toRad(lat2 - lat1);
      const dLng = toRad(lng2 - lng1);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    const nearby = events
      .filter((ev) => {
        const parts = ev.location?.split(',').map(Number);
        if (parts?.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          const dist = haversine(userLat, userLng, parts[0], parts[1]);
          ev._doc.distance = Math.round(dist);
          return dist <= Number(radius);
        }
        return false;
      })
      .sort((a, b) => a._doc.distance - b._doc.distance);

    res.status(200).json(nearby);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getEvents,
  getAllApprovedEvents,
  getEventById,
  getMyEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  toggleInterest,
  getNearbyEvents,
};