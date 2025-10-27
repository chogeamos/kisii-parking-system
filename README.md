# Kisii parkig sysytem (Minimal runnable skeleton)

This is a minimal Node.js + Express skeleton for the Kisii Smart Parking System.
It includes USSD webhook, M-PESA STK push helper, MPESA callback endpoint, and SMS wrapper.
Replace environment variables in `.env` and run `npm install` then `npm start`.

## Quick start (local)
1. Copy `.env.example` to `.env` and fill credentials.
2. `npm install`
3. `npm start`
4. Expose port 3000 to the internet (ngrok/tunnel) and configure USSD/STK callbacks to point to the public URL:
   - USSD webhook: `POST /api/ussd`
   - M-PESA STK callback: `POST /api/mpesa/stk-callback`
   - SMS webhook (if used): implement as needed

## Redis & BullMQ
Install Redis on Ubuntu and run worker: `npm run worker`.

## Mock Daraja
Use POST /api/mock/mpesa-success to simulate STK success.

Admin default: admin@kisii.go.ke / Admin@123
