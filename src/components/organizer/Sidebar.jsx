import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();

  const handleNavigation = (path, tab) => {
    setActiveTab(tab);
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Organizer Portal</h2>
      </div>
      <nav className="sidebar-nav">
        <button 
          className={`nav-item ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => handleNavigation('/organizer/events', 'events')}
        >
          <i className="fas fa-calendar-alt"></i>
          My Events
        </button>
        <button 
          className={`nav-item ${activeTab === 'add-event' ? 'active' : ''}`}
          onClick={() => handleNavigation('/organizer/add-event', 'add-event')}
        >
          <i className="fas fa-plus-circle"></i>
          Add Event
        </button>
        <button 
          className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => handleNavigation('/organizer/profile', 'profile')}
        >
          <i className="fas fa-user"></i>
          Profile
        </button>
        <button 
          className={`nav-item ${activeTab === 'tickets' ? 'active' : ''}`}
          onClick={() => handleNavigation('/organizer/tickets', 'tickets')}
        >
          <i className="fas fa-ticket-alt"></i>
          Ticket History
        </button>
      </nav>
      <button className="logout-btn" onClick={handleLogout}>
        <i className="fas fa-sign-out-alt"></i>
        Logout
      </button>
    </div>
  );
};

export default Sidebar;