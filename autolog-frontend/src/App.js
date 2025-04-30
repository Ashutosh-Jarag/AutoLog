import logo from './logo.svg';
import './App.css';
import React from 'react';
import AutoLogAuth from './components/AutoLogAuth';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import VehicleLogPage from './components/VehicleLogPage';
import SettingsPage from './components/SettingsPage';
import ReportsAnalyticsPage from './components/ReportsAnalyticsPage';
import ManualEntryPage from './components/ManualEntry';
import HelpSupport from './components/HelpSupport';
import LandingPage from './components/LandingPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/autologauth" element={<AutoLogAuth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/vehicle-logs" element={<VehicleLogPage />} />
        <Route path="/manualentry" element={<ManualEntryPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/reports" element={<ReportsAnalyticsPage />} />
        <Route path="/helpsupport" element={<HelpSupport />} />
      </Routes>
    </Router>
  );
}

export default App;
