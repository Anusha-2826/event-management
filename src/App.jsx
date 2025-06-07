import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/home/HomePage';
import AuthPage from './components/auth/AuthPage';
import OrganizerDashboard from './components/organizer/OrganizerDashboard';
import UserDashboard from './components/user/UserDashboard';
import PrivateRoute from './components/auth/PrivateRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/organizer/*" element={
          <PrivateRoute>
            <OrganizerDashboard />
          </PrivateRoute>
        } />
        <Route path="/user/*" element={
          <PrivateRoute>
            <UserDashboard />
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;