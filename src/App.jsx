import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Lock } from 'lucide-react';

import { Overview } from './pages/Overview';
import { Objectives } from './pages/Objectives';
import { Employees } from './pages/Employees';
import { RegisterInitiative } from './pages/RegisterInitiative';
import { UpdateInitiatives } from './pages/UpdateInitiatives';
import { Dashboard } from './pages/Dashboard';
import { Archive } from './pages/Archive';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const authStatus = localStorage.getItem('okr_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    const correctPassword = import.meta.env.VITE_APP_PASSWORD || 'tvaksjonen';
    if (passwordInput === correctPassword) {
      localStorage.setItem('okr_auth', 'true');
      setIsAuthenticated(true);
      setErrorMsg('');
    } else {
      setErrorMsg('Feil passord. Prøv igjen.');
      setPasswordInput('');
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--background)' }}>
        <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', margin: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--primary)' }}>
            <Lock size={48} />
          </div>
          <h2>OKR Portal</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Vennligst oppgi passord for å få tilgang til verktøyet.</p>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              type="password"
              className="form-control"
              placeholder="Passord"
              value={passwordInput}
              onChange={e => setPasswordInput(e.target.value)}
              autoFocus
            />
            {errorMsg && <div style={{ color: 'var(--status-behind)', fontSize: '0.875rem' }}>{errorMsg}</div>}
            <button className="btn-primary" type="submit">Logg inn</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navigation />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/objectives" element={<Objectives />} />
          <Route path="/register" element={<RegisterInitiative />} />
          <Route path="/update" element={<UpdateInitiatives />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/archive" element={<Archive />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
