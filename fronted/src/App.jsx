import { useState } from 'react';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';

export default function App() {
  const [email, setEmail] = useState('');
  const [verified, setVerified] = useState(false);

  const API = 'http://localhost:3000';

  const register = async () => {
    const opts = await fetch(`${API}/register/options`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }).then((r) => r.json());

    const attResp = await startRegistration(opts);
    const res = await fetch(`${API}/register/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, attResp }),
    }).then((r) => r.json());

    alert(res.verified ? '✅ Registered with biometrics' : '❌ Failed registration');
  };

  const login = async () => {
    const opts = await fetch(`${API}/login/options`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }).then((r) => r.json());

    const authResp = await startAuthentication(opts);
    const res = await fetch(`${API}/login/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, authResp }),
    }).then((r) => r.json());

    setVerified(res.verified);
  };

  return (
    <div style={{ padding: 50, fontFamily: 'sans-serif' }}>
      <h2>🔒 Biometric Login Demo</h2>
      <input
        placeholder="Enter email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ padding: 8, marginRight: 10 }}
      />
      <button onClick={register}>Register Biometrics</button>
      <button onClick={login}>Login Biometrics</button>
      {verified && <p style={{ color: 'green' }}>✅ Biometric login success</p>}
    </div>
  );
}
