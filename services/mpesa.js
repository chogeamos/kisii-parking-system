const axios = require('axios');
require('dotenv').config();

const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET;
const SHORTCODE = process.env.MPESA_SHORTCODE;
const PASSKEY = process.env.MPESA_PASSKEY;
const ENV = process.env.MPESA_ENV || 'sandbox';

const darajaBase = ENV === 'sandbox' ? 'https://sandbox.safaricom.co.ke' : 'https://api.safaricom.co.ke';

async function getAccessToken() {
  const credentials = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
  const url = `${darajaBase}/oauth/v1/generate?grant_type=client_credentials`;
  const res = await axios.get(url, { headers: { Authorization: `Basic ${credentials}` }});
  return res.data.access_token;
}

function getTimestamp() {
  const d = new Date();
  return d.toISOString().replace(/[^0-9]/g, '').slice(0,14);
}

function getPassword() {
  const timestamp = getTimestamp();
  return Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString('base64');
}

async function stkPush(phone, amount, accountRef, callbackUrl) {
  const token = await getAccessToken();
  const url = `${darajaBase}/mpesa/stkpush/v1/processrequest`;
  const body = {
    BusinessShortCode: SHORTCODE,
    Password: getPassword(),
    Timestamp: getTimestamp(),
    TransactionType: "CustomerPayBillOnline",
    Amount: amount,
    PartyA: phone.replace(/\+/g,''),
    PartyB: SHORTCODE,
    PhoneNumber: phone.replace(/\+/g,''),
    CallBackURL: callbackUrl,
    AccountReference: accountRef,
    TransactionDesc: `Kisii parking payment for ${accountRef}`
  };
  const res = await axios.post(url, body, { headers: { Authorization: `Bearer ${token}` }});
  return res.data;
}

module.exports = { stkPush, getAccessToken };