import React, { useState, useEffect } from 'react';
import './Notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`http://localhost:8084/notifications/getAllNotificationsByUserId/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch notifications');
      const data = await response.json();
      setNotifications(Array.isArray(data) ? data : [data]);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      const response = await fetch(`http://localhost:8084/notifications/deleteNotificationById/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to delete notification');
      
      setNotifications(prev => 
        prev.filter(notification => notification.notificationId !== notificationId)
      );
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const formatDateTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  return (
    <div className="notifications-container">
      <h2>Notifications</h2>
      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="no-notifications">No notifications found</div>
        ) : (
          notifications.map(notification => (
            <div key={notification.notificationId} className="notification-item">
              <div className="notification-content">
                <p className="notification-message">{notification.message}</p>
                <span className="notification-time">
                  {formatDateTime(notification.timestamp)}
                </span>
              </div>
              <button 
                onClick={() => handleDelete(notification.notificationId)}
                className="delete-btn"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;