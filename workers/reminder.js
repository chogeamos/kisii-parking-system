
// workers/reminder.js
require('dotenv').config();
const db = require('../db');
const { sendSms } = require('../services/sms');
const cron = require('node-cron');

// Run every minute
cron.schedule('* * * * *', async () => {
  try {
    const { rows } = await db.query(`
      SELECT ps.id, ps.phone, ps.expiry_time, v.reg_number
      FROM parking_sessions ps
      JOIN vehicles v ON v.id = ps.vehicle_id
      WHERE ps.payment_status = 'success' AND ps.reminder_sent = false
        AND ps.expiry_time BETWEEN now() AND now() + interval '10 minutes'
    `);
    for (const r of rows) {
      const expiry = new Date(r.expiry_time);
      const msg = `Reminder: Parking for ${r.reg_number} expires at ${expiry.toLocaleString('en-KE')}. Reply 1 to extend by 1 hour (Ksh 50).`;
      try {
        await sendSms(r.phone, msg);
        await db.query('UPDATE parking_sessions SET reminder_sent = true WHERE id = $1', [r.id]);
        console.log('Reminder sent to', r.phone);
      } catch (err) {
        console.error('Failed to send reminder to', r.phone, err.message || err);
      }
    }
  } catch (err) {
    console.error('Reminder worker error', err.message || err);
  }
});

console.log('Reminder worker started (every minute).');
