
const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/sessions', async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT ps.id, v.reg_number, ps.phone, ps.start_time, ps.expiry_time, ps.payment_status, ps.amount_cents
      FROM parking_sessions ps
      JOIN vehicles v ON v.id = ps.vehicle_id
      ORDER BY ps.start_time DESC LIMIT 200
    `);
    res.json(rows);
  } catch (err) {
    console.error('admin sessions error', err);
    res.status(500).json({ error: 'internal' });
  }
});

module.exports = router;
