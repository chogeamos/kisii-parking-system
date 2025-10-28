
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminApp() {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    async function fetchSessions() {
      try {
        const res = await axios.get('/api/admin/sessions');
        setSessions(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchSessions();
  }, []);

  return (
    <div style={{ padding: 24, fontFamily: 'Arial' }}>
      <h1>Kisii Parking — Admin</h1>
      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr><th>ID</th><th>Plate</th><th>Phone</th><th>Expiry</th><th>Status</th></tr>
        </thead>
        <tbody>
          {sessions.map(s => (
            <tr key={s.id}>
              <td>{s.id}</td>
              <td>{s.reg_number}</td>
              <td>{s.phone}</td>
              <td>{new Date(s.expiry_time).toLocaleString()}</td>
              <td>{s.payment_status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
