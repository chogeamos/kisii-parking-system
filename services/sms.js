const axios = require('axios');
require('dotenv').config();

const AT_API_KEY = process.env.AT_API_KEY;
const AT_USERNAME = process.env.AT_USERNAME;

async function sendSms(to, message) {
  const url = 'https://api.africastalking.com/version1/messaging';
  const params = new URLSearchParams();
  params.append('username', AT_USERNAME);
  params.append('to', to);
  params.append('message', message);
  params.append('from', process.env.SMS_SENDER || 'KISII');
  try {
    const res = await axios.post(url, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'apiKey': AT_API_KEY
      }
    });
    return res.data;
  } catch (err) {
    console.error('SMS send error', err.response?.data || err.message);
    throw err;
  }
}

module.exports = { sendSms };