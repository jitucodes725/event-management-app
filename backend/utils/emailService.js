const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"EventHub" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Email error:', error.message);
  }
};

const sendWelcomeEmail = (user) => sendEmail({
  to: user.email,
  subject: 'Welcome to EventHub! 🎉',
  html: `
    <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:32px;background:#f9f9f9;border-radius:16px;">
      <div style="text-align:center;margin-bottom:24px;">
        <h1 style="background:linear-gradient(to right,#7c3aed,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-size:28px;margin:0;">EventHub</h1>
      </div>
      <h2 style="color:#111;">Welcome, ${user.name}! 🎉</h2>
      <p style="color:#555;">Your account has been created successfully. Start exploring events or create your own!</p>
      <div style="text-align:center;margin-top:24px;">
        <a href="http://localhost:5173/dashboard" style="display:inline-block;padding:14px 32px;background:linear-gradient(to right,#7c3aed,#ec4899);color:white;border-radius:12px;text-decoration:none;font-weight:bold;">
          Browse Events
        </a>
      </div>
      <p style="color:#aaa;font-size:12px;margin-top:24px;text-align:center;">EventHub Team</p>
    </div>
  `,
});

const sendInterestEmail = (creator, event, interestedUser) => sendEmail({
  to: creator.email,
  subject: `Someone is interested in "${event.title}"!`,
  html: `
    <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:32px;background:#f9f9f9;border-radius:16px;">
      <div style="text-align:center;margin-bottom:24px;">
        <h1 style="background:linear-gradient(to right,#7c3aed,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-size:28px;margin:0;">EventHub</h1>
      </div>
      <h2 style="color:#7c3aed;">New Interest in Your Event!</h2>
      <p style="color:#555;"><strong>${interestedUser.name}</strong> just marked interest in your event:</p>
      <div style="background:white;padding:16px;border-radius:12px;margin:16px 0;border:1px solid #e5e7eb;">
        <h3 style="color:#111;margin:0 0 8px;">${event.title}</h3>
        <p style="color:#888;margin:0;font-size:14px;">📅 ${new Date(event.date).toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
        <p style="color:#888;margin:4px 0 0;font-size:14px;">📍 ${event.location}</p>
      </div>
      <p style="color:#555;">Total interested: <strong>${event.interestedUsers.length}</strong></p>
      <div style="text-align:center;margin-top:16px;">
        <a href="http://localhost:5173/events/${event._id}" style="display:inline-block;padding:14px 32px;background:linear-gradient(to right,#7c3aed,#ec4899);color:white;border-radius:12px;text-decoration:none;font-weight:bold;">
          View Event
        </a>
      </div>
    </div>
  `,
});

const sendReminderEmail = (user, event) => sendEmail({
  to: user.email,
  subject: `Reminder: "${event.title}" is tomorrow! ⏰`,
  html: `
    <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:32px;background:#f9f9f9;border-radius:16px;">
      <div style="text-align:center;margin-bottom:24px;">
        <h1 style="background:linear-gradient(to right,#7c3aed,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-size:28px;margin:0;">EventHub</h1>
      </div>
      <h2 style="color:#7c3aed;">Your event is tomorrow! ⏰</h2>
      <div style="background:white;padding:16px;border-radius:12px;margin:16px 0;border:1px solid #e5e7eb;">
        <h3 style="color:#111;margin:0 0 8px;">${event.title}</h3>
        <p style="color:#888;margin:0;font-size:14px;">📅 ${new Date(event.date).toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
        <p style="color:#888;margin:4px 0 0;font-size:14px;">📍 ${event.location}</p>
      </div>
      <div style="text-align:center;margin-top:16px;">
        <a href="http://localhost:5173/events/${event._id}" style="display:inline-block;padding:14px 32px;background:linear-gradient(to right,#7c3aed,#ec4899);color:white;border-radius:12px;text-decoration:none;font-weight:bold;">
          View Event
        </a>
      </div>
    </div>
  `,
});

const sendStatusEmail = (user, event, status) => sendEmail({
  to: user.email,
  subject: `Your event "${event.title}" has been ${status}`,
  html: `
    <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:32px;background:#f9f9f9;border-radius:16px;">
      <div style="text-align:center;margin-bottom:24px;">
        <h1 style="background:linear-gradient(to right,#7c3aed,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-size:28px;margin:0;">EventHub</h1>
      </div>
      <h2 style="color:${status === 'approved' ? '#10b981' : '#ef4444'};">
        Event ${status === 'approved' ? 'Approved ✅' : 'Rejected ❌'}
      </h2>
      <p style="color:#555;">Your event <strong>${event.title}</strong> has been <strong>${status}</strong> by an admin.</p>
      ${status === 'approved'
        ? `<div style="text-align:center;margin-top:16px;"><a href="http://localhost:5173/events/${event._id}" style="display:inline-block;padding:14px 32px;background:linear-gradient(to right,#7c3aed,#ec4899);color:white;border-radius:12px;text-decoration:none;font-weight:bold;">View Event</a></div>`
        : `<p style="color:#888;font-size:14px;">Please review our community guidelines and try again.</p>`
      }
    </div>
  `,
});

module.exports = { sendEmail, sendWelcomeEmail, sendInterestEmail, sendReminderEmail, sendStatusEmail };