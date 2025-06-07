import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './EventList.css';

const EventList = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');
  const organizerId = localStorage.getItem('organizerId');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`http://localhost:8081/events/organizer/${organizerId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      setEvents(data);
    } catch (err) {
      setError('Failed to load events');
    }
  };

  const handleDelete = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        const response = await fetch(`http://localhost:8081/events/deleteEventById/${eventId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) throw new Error('Failed to delete event');
        fetchEvents(); // Refresh the list
      } catch (err) {
        setError('Failed to delete event');
      }
    }
  };

  const formatDateTime = (date, time) => {
    return new Date(`${date}T${time}`).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  return (
    <div className="event-list-container">
      <h2>My Events</h2>
      {error && <div className="error-message">{error}</div>}
      <div className="event-grid">
        {events.map(event => (
          <div key={event.eventId} className="event-card">
            <div className="event-header">
              <h3>{event.name}</h3>
              <span className="event-category">{event.category}</span>
            </div>
            <div className="event-details">
              <p><strong>Location:</strong> {event.location}</p>
              <p><strong>Start:</strong> {formatDateTime(event.startDate, event.startTime)}</p>
              <p><strong>End:</strong> {formatDateTime(event.endDate, event.endTime)}</p>
              <p><strong>Available Tickets:</strong> {event.ticketCount}</p>
              <p className="event-description">{event.description}</p>
              <p className="event-address">{event.address}</p>
            </div>
            <div className="event-actions">
              <button 
                onClick={() => navigate(`/organizer/update-event/${event.eventId}`)}
                className="edit-btn"
              >
                Edit
              </button>
              <button 
                onClick={() => handleDelete(event.eventId)}
                className="delete-btn"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventList;