import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar';
import EventList from './pages/EventList';
import BookedEvents from './pages/BookedEvents/BookedEvents';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications/Notifications';
import './UserDashboard.css';

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('events');

  return (
    <div className="dashboard-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="dashboard-content">
        <Routes>
          <Route path="/" element={<EventList />} />
          <Route path="booked-events" element={<BookedEvents />} />
          <Route path="profile" element={<Profile />} />
          <Route path="notifications" element={<Notifications />} />
        </Routes>
      </div>
    </div>
  );
};

export default UserDashboard;