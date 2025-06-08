import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import './OrganizerDashboard.css';
import AddEvent from './pages/AddEvent';  
import Profile from './pages/Profile';
import EventList from './pages/EventList';
import UpdateEvent from './pages/UpdateEvent';
import TicketHistory from './pages/TicketHistory';
const OrganizerDashboard = () => {
  const [activeTab, setActiveTab] = useState('events');
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="dashboard-content">
        <Routes>
         <Route path="/events" element={<EventList />} /> 
          <Route path="add-event" element={<AddEvent />} />
          <Route path="update-event/:eventId" element={<UpdateEvent />} />
         <Route path="profile" element={<Profile />} />
           <Route path="tickets" element={<TicketHistory/>} />
        </Routes>
      </div>
    </div>
  );
};

export default OrganizerDashboard;