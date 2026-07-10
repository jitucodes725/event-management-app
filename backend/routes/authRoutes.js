const express = require('express');
const router = express.Router();
const {
  registerUser, loginUser, getProfile, updateProfile, changePassword
} = require('../controllers/authController');
const { forgotPassword, resetPassword } = require('../controllers/passwordResetController');
const protect = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, upload.single('profilePic'), updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;