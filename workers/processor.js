
require('dotenv').config();
const { Worker } = require('bullmq');
const IORedis = require('ioredis');
const db = require('../db');
const { sendSms } = require('../services/sms');

const connection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');
const worker = new Worker('reminders', async job => {
  const { sessionId } = job.data;
  const { rows } = await db.query('SELECT ps.id, ps.phone, ps.expiry_time, ps.reminder_sent, v.reg_number FROM parking_sessions ps JOIN vehicles v ON v.id = ps.vehicle_id WHERE ps.id=$1', [sessionId]);
  if (rows.length === 0) {
    return { ok: false, reason: 'no session' };
  }
  const s = rows[0];
  if (s.reminder_sent) return { ok: true, reason: 'already sent' };
  const expiry = new Date(s.expiry_time);
  const msg = "Reminder: Parking for " + s.reg_number + " expires at " + expiry.toLocaleString('en-KE') + ". Reply 1 to extend by 1 hour (Ksh 50).";
  try {
    await sendSms(s.phone, msg);
    await db.query('UPDATE parking_sessions SET reminder_sent=true WHERE id=$1', [sessionId]);
    console.log('Reminder sent for session', sessionId);
    return { ok: true };
  } catch (err) {
    console.error('Failed to send reminder', err);
    throw err;
  }
}, { connection });

worker.on('failed', (job, err) => {
  console.error('Job failed', job.id, err);
});

console.log('BullMQ worker started for reminders.');
