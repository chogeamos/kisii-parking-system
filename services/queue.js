
const { Queue } = require('bullmq');
const IORedis = require('ioredis');
require('dotenv').config();
const connection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');
const reminderQueue = new Queue('reminders', { connection });

async function enqueueReminder(sessionId, runAtISO) {
  const delay = Math.max(new Date(runAtISO).getTime() - Date.now(), 0);
  await reminderQueue.add('send-reminder', { sessionId }, { delay });
}

module.exports = { enqueueReminder, reminderQueue };
