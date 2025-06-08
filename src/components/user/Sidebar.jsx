import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';
import { FaCalendarAlt, FaTicketAlt, FaUser, FaBell, FaSignOutAlt } from 'react-icons/fa';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const [notificationCount, setNotificationCount] = useState(0);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    fetchNotificationCount();
    // Set up polling for notifications
    const interval = setInterval(fetchNotificationCount, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchNotificationCount = async () => {
    try {
      const response = await fetch(`http://localhost:8084/notifications/getAllNotificationsByUserId/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch notifications');
      const data = await response.json();
      const notifications = Array.isArray(data) ? data : data ? [data] : [];
      setNotificationCount(notifications.length);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const handleNavigation = (path, tab) => {
    setActiveTab(tab);
    navigate(`/user${path}`);
    if (tab === 'notifications') {
      setNotificationCount(0); // Reset count when visiting notifications
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Event Booking</h2>
      </div>
      <nav className="sidebar-nav">
        <button 
          className={`nav-item ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => handleNavigation('/events', 'events')}
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
          <div className="notification-icon-container">
            {notificationCount > 0 && (
              <span className="notification-badge">{notificationCount}</span>
            )}
            <FaBell />
          </div>
          <span>Notifications</span>
        </button>
      </nav>
      <button className="logout-btn" onClick={handleLogout}>
        <FaSignOutAlt /> Logout
      </button>
    </div>
  );
};

export default Sidebar;