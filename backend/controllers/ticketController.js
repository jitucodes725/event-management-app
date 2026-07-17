const Ticket = require('../models/Ticket');
const Event = require('../models/Event');

// POST /api/tickets/book/:eventId
const bookTicket = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.status !== 'approved') {
      return res.status(400).json({ message: 'This event is not available for booking' });
    }

    // Check capacity
    const confirmedCount = await Ticket.countDocuments({
      event: req.params.eventId,
      status: 'CONFIRMED',
    });

    if (confirmedCount >= event.capacity) {
      return res.status(400).json({ message: 'Event is full. No seats available.' });
    }

    // Check duplicate booking
    const existingTicket = await Ticket.findOne({
      user: req.user.id,
      event: req.params.eventId,
      status: 'CONFIRMED',
    });

    if (existingTicket) {
      return res.status(400).json({ message: 'You have already booked a ticket for this event.' });
    }

    const ticket = await Ticket.create({
      user: req.user.id,
      event: req.params.eventId,
    });

    const populated = await ticket.populate([
      { path: 'user', select: 'name email phoneNumber profilePic' },
      { path: 'event', select: 'title description date location image category capacity' },
    ]);

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/tickets/my-tickets
const getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.user.id })
      .populate('event', 'title description date location image category capacity')
      .sort({ createdAt: -1 });
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/tickets/check/:eventId
const checkTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findOne({
      user: req.user.id,
      event: req.params.eventId,
      status: 'CONFIRMED',
    });
    res.status(200).json({ hasTicket: !!ticket, ticket });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { bookTicket, getMyTickets, checkTicket };