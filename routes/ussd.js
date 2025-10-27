
const express = require('express');
const router = express.Router();
const db = require('../db');
const { stkPush } = require('../services/mpesa');
const { sendSms } = require('../services/sms');

const sessions = new Map();

function calculatePricing(option) {
  if(option === '1') return { duration_minutes: 60, amount_ksh: 50 };
  if(option === '2') return { duration_minutes: 120, amount_ksh: 80 };
  if(option === '3') return { duration_minutes: 60, amount_ksh: 50 };
  return null;
}

router.post('/', async (req, res) => {
  const { sessionId, serviceCode, phoneNumber, text } = req.body;
  const parts = text.split('*').filter(Boolean);
  const level = parts.length;
  let response;

  if (text === '') {
    response = `CON Welcome to KISII Smart Parking\n1. Park 1 Hour - Ksh 50\n2. Park 2 Hours - Ksh 80\n3. Extend Parking - Ksh 50\n4. Check Parking Status`;
    return res.send(response);
  }

  const option = parts[0];

  if (['1','2'].includes(option) && level === 1) {
    response = 'CON Enter vehicle registration number (e.g., KBA123A):';
    return res.send(response);
  }

  if (['1','2'].includes(option) && level === 2) {
    const plate = parts[1].toUpperCase();
    const pricing = calculatePricing(option);
    sessions.set(sessionId, { option, plate, phoneNumber, pricing });
    response = `CON Parking for ${plate}\nDuration: ${pricing.duration_minutes/60} Hour(s)\nAmount: Ksh ${pricing.amount_ksh}\n1. Confirm\n2. Cancel`;
    return res.send(response);
  }

  if ((parts[0] === '1' || parts[0] === '2') && level === 3) {
    const choice = parts[2];
    const session = sessions.get(sessionId);
    if (!session) return res.send('END Session expired. Try again.');

    if (choice === '1') {
      try {
        const amount = session.pricing.amount_ksh;
        const accountRef = session.plate;
        const callbackUrl = `${process.env.BASE_URL}/api/mpesa/stk-callback`;
        const mpesaResp = await stkPush(phoneNumber, amount, accountRef, callbackUrl);
        // persist mpesa request mapping to plate
        const checkoutId = mpesaResp.CheckoutRequestID || mpesaResp.checkoutRequestID || null;
        await db.query(`INSERT INTO stk_requests (phone, amount_cents, mpesa_checkout_request_id, plate_reg_number, account_ref, status) VALUES ($1,$2,$3,$4,$5,$6)`,
          [phoneNumber, amount*100, checkoutId, session.plate, session.plate, 'initiated']);

        response = `END We have sent a payment prompt to ${phoneNumber}. Complete payment on your phone.`;
        return res.send(response);
      } catch (err) {
        console.error('STK error', err.message || err);
        return res.send('END Failed to initiate payment. Try again later.');
      }
    } else {
      return res.send('END Transaction cancelled.');
    }
  }

  if (option === '3') {
    if (level === 1) return res.send('CON Enter registered plate to extend:');
    if (level === 2) {
      const plate = parts[1].toUpperCase();
      sessions.set(sessionId, { action: 'extend', plate, phoneNumber });
      return res.send(`CON Extend parking for ${plate} by 1 hour (Ksh 50)?\n1. Confirm\n2. Cancel`);
    }
    if (level === 3) {
      const session = sessions.get(sessionId);
      const choice = parts[2];
      if (choice === '1') {
        try {
          const mpesaResp = await stkPush(phoneNumber, 50, session.plate, `${process.env.BASE_URL}/api/mpesa/stk-callback`);
          const checkoutId = mpesaResp.CheckoutRequestID || mpesaResp.checkoutRequestID || null;
          await db.query(`INSERT INTO stk_requests (phone, amount_cents, mpesa_checkout_request_id, plate_reg_number, account_ref, status) VALUES ($1,$2,$3,$4,$5,$6)`,
            [phoneNumber, 50*100, checkoutId, session.plate, session.plate, 'initiated']);
          return res.send('END Payment prompt sent for extension. Complete on phone.');
        } catch (err) {
          console.error(err);
          return res.send('END Failed to initiate extension payment.');
        }
      } else {
        return res.send('END Cancelled.');
      }
    }
  }

  if (option === '4' && level === 1) {
    return res.send('CON Enter vehicle plate to check:');
  }
  if (option === '4' && level === 2) {
    const plate = parts[1].toUpperCase();
    try {
      const { rows } = await db.query(
        `SELECT expiry_time FROM parking_sessions ps
         JOIN vehicles v ON v.id = ps.vehicle_id
         WHERE v.reg_number = $1 AND ps.payment_status = 'success'
         ORDER BY expiry_time DESC LIMIT 1`, [plate]);
      if (rows.length === 0) {
        return res.send('END No active parking found for ' + plate);
      }
      const expiry = new Date(rows[0].expiry_time);
      const now = new Date();
      if (expiry > now) {
        return res.send(`END Active: Valid until ${expiry.toLocaleString('en-KE')}`);
      } else {
        return res.send(`END Expired: Expired at ${expiry.toLocaleString('en-KE')} – Fine applicable`);
      }
    } catch (err) {
      console.error('DB error', err);
      return res.send('END Error checking status. Try later.');
    }
  }

  return res.send('END Invalid choice. Try again.');
});

module.exports = router;
