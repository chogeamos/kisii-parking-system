const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 10000;

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "admin-app/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "admin-app/build", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Kisii-parking backend listening on port ${PORT}`);
});