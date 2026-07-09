const cron = require('node-cron');
const Event = require('../models/Event');
const User = require('../models/User');
const { sendReminderEmail } = require('./emailService');
const webpush = require('web-push');

// Runs every day at 9AM — sends reminder for events happening tomorrow
const startScheduler = () => {
  cron.schedule('0 9 * * *', async () => {
    console.log('Running daily reminder job...');
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const start = new Date(tomorrow.setHours(0, 0, 0, 0));
      const end = new Date(tomorrow.setHours(23, 59, 59, 999));

      const events = await Event.find({
        date: { $gte: start, $lte: end },
        status: 'approved',
        reminderSent: false,
      }).populate('interestedUsers');

      for (const event of events) {
        // Email interested users
        for (const user of event.interestedUsers) {
          await sendReminderEmail(user, event);

          // Browser push notification
          if (user.pushSubscription) {
            try {
              await webpush.sendNotification(
                user.pushSubscription,
                JSON.stringify({
                  title: 'EventHub Reminder ⏰',
                  body: `"${event.title}" is tomorrow at ${event.location}!`,
                  url: `/events/${event._id}`,
                })
              );
            } catch (e) {
              console.error('Push error:', e.message);
            }
          }
        }

        event.reminderSent = true;
        await event.save();
      }

      console.log(`Reminders sent for ${events.length} events`);
    } catch (error) {
      console.error('Scheduler error:', error.message);
    }
  });
};

module.exports = startScheduler;