const express = require('express');
const router = express.Router();
const { getComments, addComment, deleteComment } = require('../controllers/commentController');
const protect = require('../middleware/authMiddleware');
const User = require('../models/User');

// Middleware to attach full user doc (for admin check in delete)
const attachUserDoc = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    req.userDoc = user;
    next();
  } catch (err) {
    next(err);
  }
};

router.get('/:eventId', getComments);
router.post('/:eventId', protect, addComment);
router.delete('/:commentId', protect, attachUserDoc, deleteComment);

module.exports = router;