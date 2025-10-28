const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware to parse JSON
app.use(express.json());

// Example API route
app.get("/api/admin/sessions", (req, res) => {
  // Replace with real data from your database
  res.json([
    { id: 1, reg_number: "KAA 123A", phone: "0712345678", expiry_time: new Date(), payment_status: "Paid" },
    { id: 2, reg_number: "KBB 456B", phone: "0723456789", expiry_time: new Date(), payment_status: "Unpaid" },
  ]);
});

// Serve React frontend
app.use(express.static(path.join(__dirname, "admin-app/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "admin-app/build", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Kisii-parking backend listening on port ${PORT}`);
});
