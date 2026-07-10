const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { sendEmail } = require('../utils/emailService');

// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists — security best practice
      return res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
    }

    // Generate secure random token
    const rawToken = crypto.randomBytes(32).toString('hex');

    // Hash the token before storing
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    // Send raw token in the email link (we hash it again when verifying)
    const resetUrl = `http://localhost:5173/reset-password/${rawToken}`;

    await sendEmail({
      to: user.email,
      subject: 'Reset your EventHub password',
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:32px;background:#f9f9f9;border-radius:16px;">
          <div style="text-align:center;margin-bottom:24px;">
            <h1 style="background:linear-gradient(to right,#7c3aed,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-size:28px;margin:0;">EventHub</h1>
          </div>
          <h2 style="color:#111;margin-bottom:8px;">Reset your password</h2>
          <p style="color:#555;margin-bottom:24px;">Hi ${user.name}, we received a request to reset your password. Click the button below to choose a new one.</p>
          <div style="text-align:center;margin-bottom:24px;">
            <a href="${resetUrl}" style="display:inline-block;padding:14px 32px;background:linear-gradient(to right,#7c3aed,#ec4899);color:white;border-radius:12px;text-decoration:none;font-weight:bold;font-size:16px;">
              Reset Password
            </a>
          </div>
          <p style="color:#888;font-size:13px;">This link expires in <strong>1 hour</strong>. If you didn't request this, you can safely ignore this email.</p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
          <p style="color:#aaa;font-size:12px;text-align:center;">EventHub Team</p>
        </div>
      `,
    });

    res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/reset-password/:token
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) return res.status(400).json({ message: 'Password is required' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

    // Hash the incoming token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset link. Please request a new one.' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Invalidate token — one time use
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Send confirmation email
    await sendEmail({
      to: user.email,
      subject: 'Your EventHub password has been reset',
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:32px;background:#f9f9f9;border-radius:16px;">
          <div style="text-align:center;margin-bottom:24px;">
            <h1 style="background:linear-gradient(to right,#7c3aed,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-size:28px;margin:0;">EventHub</h1>
          </div>
          <div style="text-align:center;margin-bottom:16px;">
            <span style="font-size:48px;">✅</span>
          </div>
          <h2 style="color:#111;text-align:center;margin-bottom:8px;">Password Reset Successful</h2>
          <p style="color:#555;text-align:center;margin-bottom:24px;">Hi ${user.name}, your password has been changed successfully. You can now log in with your new password.</p>
          <div style="text-align:center;margin-bottom:24px;">
            <a href="http://localhost:5173/login" style="display:inline-block;padding:14px 32px;background:linear-gradient(to right,#7c3aed,#ec4899);color:white;border-radius:12px;text-decoration:none;font-weight:bold;font-size:16px;">
              Log In Now
            </a>
          </div>
          <p style="color:#888;font-size:13px;text-align:center;">If you didn't make this change, contact us immediately.</p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
          <p style="color:#aaa;font-size:12px;text-align:center;">EventHub Team</p>
        </div>
      `,
    });

    res.status(200).json({ message: 'Password reset successful. You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { forgotPassword, resetPassword };