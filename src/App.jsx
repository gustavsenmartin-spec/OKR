import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';

import { Overview } from './pages/Overview';
import { Employees } from './pages/Employees';
import { RegisterInitiative } from './pages/RegisterInitiative';
import { UpdateInitiatives } from './pages/UpdateInitiatives';
import { Dashboard } from './pages/Dashboard';

function App() {
  return (
    <div className="app-container">
      <Navigation />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/register" element={<RegisterInitiative />} />
          <Route path="/update" element={<UpdateInitiatives />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/employees" element={<Employees />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
