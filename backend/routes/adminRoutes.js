const express = require('express');
const router = express.Router();
const {
  getStats, getAllEvents, approveEvent, rejectEvent,
  deleteEvent, getAllUsers, deleteUser,
} = require('../controllers/adminController');
const protect = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminMiddleware');

router.use(protect, adminOnly); // all admin routes need auth + admin check

router.get('/stats', getStats);
router.get('/events', getAllEvents);
router.put('/events/:id/approve', approveEvent);
router.put('/events/:id/reject', rejectEvent);
router.delete('/events/:id', deleteEvent);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);

module.exports = router;