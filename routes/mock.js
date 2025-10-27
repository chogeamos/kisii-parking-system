
const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/mpesa-success', express.json(), async (req, res) => {
  const { CheckoutRequestID, Amount, PhoneNumber, MpesaReceiptNumber } = req.body;
  if (!CheckoutRequestID) return res.status(400).json({ error: 'missing' });
  const payload = {
    Body: {
      stkCallback: {
        CheckoutRequestID: CheckoutRequestID,
        ResultCode: 0,
        ResultDesc: 'The service request is processed successfully.',
        CallbackMetadata: {
          Item: [
            { Name: 'Amount', Value: Amount || 50 },
            { Name: 'MpesaReceiptNumber', Value: MpesaReceiptNumber || 'MOCK123' },
            { Name: 'PhoneNumber', Value: PhoneNumber || '+254700000000' }
          ]
        }
      }
    }
  };
  try {
    const internalUrl = (process.env.BASE_URL || 'http://localhost:3000') + '/api/mpesa/stk-callback';
    const r = await axios.post(internalUrl, payload);
    res.json({ forwarded: true, status: r.data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
