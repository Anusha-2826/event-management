import React, { useState, useEffect } from 'react';
import './EventList.css';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('http://localhost:8081/events/getAllEvents', {
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

  return (
    <div className="events-container">
      <h2>Available Events</h2>
      {error && <div className="error-message">{error}</div>}
      <div className="events-grid">
        {events.map(event => (
          <div key={event.eventId} className="event-card">
            {/* Event card content */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventList;