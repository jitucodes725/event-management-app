const express = require('express');
const router = express.Router();
const { bookTicket, getMyTickets, checkTicket } = require('../controllers/ticketController');
const protect = require('../middleware/authMiddleware');

router.post('/book/:eventId', protect, bookTicket);
router.get('/my-tickets', protect, getMyTickets);
router.get('/check/:eventId', protect, checkTicket);

module.exports = router;