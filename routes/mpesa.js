
const express = require('express');
const router = express.Router();
const db = require('../db');
const { sendSms } = require('../services/sms');
const { enqueueReminder } = require('../services/queue');

router.post('/stk-callback', express.json(), async (req, res) => {
  const body = req.body;
  console.log('STK callback received', JSON.stringify(body).slice(0,400));
  try {
    const stkCallback = body.Body?.stkCallback;
    if (!stkCallback) {
      res.status(400).send('No callback body');
      return;
    }
    const checkoutRequestID = stkCallback.CheckoutRequestID;
    const resultCode = stkCallback.ResultCode;
    const resultDesc = stkCallback.ResultDesc;

    if (resultCode === 0) {
      const callbackMetadata = stkCallback.CallbackMetadata?.Item || [];
      const mpesaReceipt = callbackMetadata.find(i => i.Name === 'MpesaReceiptNumber')?.Value;
      const amount = callbackMetadata.find(i => i.Name === 'Amount')?.Value;
      const phone = callbackMetadata.find(i => i.Name === 'PhoneNumber')?.Value;

      console.log('STK success', { checkoutRequestID, mpesaReceipt, amount, phone });

      // lookup stk_requests row
      const { rows } = await db.query('SELECT * FROM stk_requests WHERE mpesa_checkout_request_id = $1 LIMIT 1', [checkoutRequestID]);
      if (rows.length === 0) {
        console.warn('No matching stk_request for', checkoutRequestID);
        await db.query('INSERT INTO stk_requests (phone, amount_cents, mpesa_checkout_request_id, status) VALUES ($1,$2,$3,$4)',
          [phone, Math.round(amount*100), checkoutRequestID, 'success']);
        res.json({ status: 'received' });
        return;
      }
      const reqRow = rows[0];
      await db.query('UPDATE stk_requests SET status=$1 WHERE id=$2', ['success', reqRow.id]);

      // create or find vehicle
      const plate = reqRow.plate_reg_number || reqRow.account_ref || 'UNKNOWN';
      const vres = await db.query('SELECT id FROM vehicles WHERE reg_number=$1 LIMIT 1', [plate]);
      let vehicleId;
      if (vres.rows.length === 0) {
        const iv = await db.query('INSERT INTO vehicles (reg_number) VALUES ($1) RETURNING id', [plate]);
        vehicleId = iv.rows[0].id;
      } else {
        vehicleId = vres.rows[0].id;
      }

      const amountKsh = reqRow.amount_cents / 100.0;
      let duration_minutes = 60;
      if (amountKsh >= 80) duration_minutes = 120;
      const start = new Date();
      const expiry = new Date(start.getTime() + duration_minutes*60000);

      const insert = await db.query(`INSERT INTO parking_sessions (vehicle_id, phone, start_time, expiry_time, duration_minutes, amount_cents, payment_ref, payment_status)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`, [vehicleId, phone, start.toISOString(), expiry.toISOString(), duration_minutes, Math.round(amount*100), mpesaReceipt, 'success']);

      const sessionId = insert.rows[0].id;
      const expiryStr = expiry.toLocaleString('en-KE');
      try {
        await sendSms(phone, 'Parking confirmed for ' + plate + '. Duration: ' + (duration_minutes/60) + ' Hour(s). Expiry: ' + expiryStr + '. Reply 1 to extend before expiry.');
      } catch (err) {
        console.error('SMS send failed', err);
      }

      // enqueue reminder 10 minutes before expiry
      const reminderTime = new Date(expiry.getTime() - 10*60000).toISOString();
      await enqueueReminder(sessionId, reminderTime);

      res.json({ status: 'received' });
      return;
    } else {
      console.warn('STK failed', resultDesc);
      await db.query('UPDATE stk_requests SET status=$1 WHERE mpesa_checkout_request_id=$2', ['failed', checkoutRequestID]);
      res.json({ status: 'received' });
      return;
    }
  } catch (err) {
    console.error('stk-callback error', err);
    res.status(500).send('error');
  }
});

module.exports = router;
