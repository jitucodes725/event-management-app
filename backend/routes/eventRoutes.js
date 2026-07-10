const express = require('express');
const router = express.Router();
const {
  getEvents,
  getAllApprovedEvents,
  getEventById,
  getMyEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  toggleInterest,
} = require('../controllers/eventController');
const protect = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/my-events', protect, getMyEvents);
router.get('/all', getAllApprovedEvents);
router.get('/', getEvents);
router.get('/:id', getEventById);
router.post('/', protect, upload.single('image'), createEvent);
router.put('/:id', protect, upload.single('image'), updateEvent);
router.delete('/:id', protect, deleteEvent);
router.put('/:id/interest', protect, toggleInterest);

module.exports = router;