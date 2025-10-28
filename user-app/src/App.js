import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [plate, setPlate] = useState("");
  const [session, setSession] = useState(null);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    try {
      const res = await axios.get(`/api/user/sessions/${plate}`);
      setSession(res.data);
      setError("");
    } catch (err) {
      setSession(null);
      setError("No record found for that plate number.");
    }
  };

  const simulatePayment = () => {
    alert(`Simulating M-PESA payment for ${plate}`);
    setSession({ ...session, payment_status: "Paid" });
  };

  return (
    <div style={{ padding: 24, fontFamily: "Arial", textAlign: "center" }}>
      <h1>Kisii Parking — User Portal</h1>

      <div>
        <input
          type="text"
          placeholder="Enter Plate Number (e.g. KAA 123A)"
          value={plate}
          onChange={(e) => setPlate(e.target.value)}
          style={{ padding: 8, width: 250 }}
        />
        <button onClick={handleSearch} style={{ marginLeft: 8, padding: "8px 16px" }}>
          Search
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {session && (
        <div style={{ marginTop: 20 }}>
          <h3>Parking Details</h3>
          <p><b>Plate:</b> {session.reg_number}</p>
          <p><b>Phone:</b> {session.phone}</p>
          <p><b>Expiry:</b> {new Date(session.expiry_time).toLocaleString()}</p>
          <p><b>Status:</b> {session.payment_status}</p>

          {session.payment_status !== "Paid" && (
            <button
              onClick={simulatePayment}
              style={{
                backgroundColor: "green",
                color: "white",
                padding: "10px 20px",
                border: "none",
                borderRadius: 5,
                marginTop: 10,
              }}
            >
              Simulate M-PESA Payment
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default App;