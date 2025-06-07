import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';
import { FaCalendarAlt, FaTicketAlt, FaUser, FaBell } from 'react-icons/fa';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();

  const handleNavigation = (path, tab) => {
    setActiveTab(tab);
    navigate(`/user${path}`);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Event Booking</h2>
      </div>
      <nav className="sidebar-nav">
        <button 
          className={`nav-item ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => handleNavigation('/', 'events')}
        >
          <FaCalendarAlt /> Events
        </button>
        <button 
          className={`nav-item ${activeTab === 'booked' ? 'active' : ''}`}
          onClick={() => handleNavigation('/booked-events', 'booked')}
        >
          <FaTicketAlt /> Booked Events
        </button>
        <button 
          className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => handleNavigation('/profile', 'profile')}
        >
          <FaUser /> Profile
        </button>
        <button 
          className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => handleNavigation('/notifications', 'notifications')}
        >
          <FaBell /> Notifications
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;