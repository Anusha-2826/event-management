// filepath: c:\Users\2401182\Frontend_Event\event-management\src\components\home\HomePage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    try {
      console.log('Navigating to:', `/auth?role=${role}`);
      navigate(`/auth?role=${role}`);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  return (
    <div className="home-container">
      <div className="content-wrapper">
        <div className="hero-section">
          <h1>Welcome to Event Management System</h1>
          <p>Your one-stop solution for event planning and management</p>
        </div>

        <div className="role-section">
          <div className="role-buttons">
            <button 
              className="role-btn user-btn"
              onClick={() => handleRoleSelect('user')}
            >
              <i className="fas fa-user"></i>
              <span>User Portal</span>
              <p>Browse and book tickets for exciting events</p>
            </button>
            <button 
              className="role-btn organizer-btn"
              onClick={() => handleRoleSelect('organizer')}
            >
              <i className="fas fa-calendar-alt"></i>
              <span>Organizer Portal</span>
              <p>Create and manage your events</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;