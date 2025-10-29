const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

/* ===============================
   🔐 API ROUTES
=============================== */

app.get("/api/admin/sessions", (req, res) => {
  res.json([
    {
      id: 1,
      reg_number: "KAA 123A",
      phone: "0712345678",
      expiry_time: new Date(),
      payment_status: "Paid",
    },
    {
      id: 2,
      reg_number: "KBB 456B",
      phone: "0723456789",
      expiry_time: new Date(),
      payment_status: "Unpaid",
    },
  ]);
});

app.get("/api/user/sessions/:plate", (req, res) => {
  const { plate } = req.params;
  const sessions = [
    {
      id: 1,
      reg_number: "KAA 123A",
      phone: "0712345678",
      expiry_time: new Date(),
      payment_status: "Paid",
    },
    {
      id: 2,
      reg_number: "KBB 456B",
      phone: "0723456789",
      expiry_time: new Date(),
      payment_status: "Unpaid",
    },
  ];
  const found = sessions.find((s) => s.reg_number === plate.toUpperCase());
  if (found) res.json(found);
  else res.status(404).json({ error: "Not found" });
});

/* ===============================
   🖥️ FRONTEND ROUTES
=============================== */

// Serve admin build
app.use("/admin", express.static(path.join(__dirname, "admin-app/build")));
app.get("/admin/*", (req, res) => {
  res.sendFile(path.join(__dirname, "admin-app/build", "index.html"));
});

// Serve user build
app.use("/user", express.static(path.join(__dirname, "user-app/build")));
app.get("/user/*", (req, res) => {
  res.sendFile(path.join(__dirname, "user-app/build", "index.html"));
});

// Default: redirect root to /user
app.get("/", (req, res) => {
  res.redirect("/user");
});

app.listen(PORT, () => {
  console.log(`✅ Kisii Parking System running on port ${PORT}`);
});