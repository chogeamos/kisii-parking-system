const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

// ==================== ADMIN ROUTE ====================
app.get("/api/admin/sessions", (req, res) => {
  res.json([
    { id: 1, reg_number: "KAA 123A", phone: "0712345678", expiry_time: new Date(), payment_status: "Paid" },
    { id: 2, reg_number: "KBB 456B", phone: "0723456789", expiry_time: new Date(), payment_status: "Unpaid" },
  ]);
});

// ==================== USER ROUTE ====================
// Example: /api/user/sessions/KAA%20123A
app.get("/api/user/sessions/:plate", (req, res) => {
  const { plate } = req.params;
  const sessions = [
    { id: 1, reg_number: "KAA 123A", phone: "0712345678", expiry_time: new Date(), payment_status: "Paid" },
    { id: 2, reg_number: "KBB 456B", phone: "0723456789", expiry_time: new Date(), payment_status: "Unpaid" },
  ];
  const found = sessions.find((s) => s.reg_number === plate.toUpperCase());
  if (found) res.json(found);
  else res.status(404).json({ error: "Not found" });
});

// ==================== FRONTEND SERVING ====================
// Admin frontend
app.use(express.static(path.join(__dirname, "admin-app/build")));

// User frontend
app.use("/user", express.static(path.join(__dirname, "user-app/build")));

// Catch-all for admin (root)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "admin-app/build", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Kisii-parking backend listening on port ${PORT}`);
});