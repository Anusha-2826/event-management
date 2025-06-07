import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import './EventList.css';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');
  const [searchCriteria, setSearchCriteria] = useState({
    name: '',
    category: '',
    location: '',
    startDate: ''
  });

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
      
      // Filter out past events and events with ticket count <= 1
      const currentDate = new Date().toISOString().split('T')[0];
      const upcomingEvents = data.filter(event => 
        event.startDate >= currentDate && event.ticketCount > 1
      ).map(event => ({
        ...event,
        displayTicketCount: event.ticketCount - 1 // Show one less ticket than actual
      }));
      
      setEvents(upcomingEvents);
    } catch (err) {
      setError('Failed to load events');
    }
  };

  const handleSearch = (e) => {
    const { name, value } = e.target;
    setSearchCriteria(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredEvents = events.filter(event => {
    return (
      event.name.toLowerCase().includes(searchCriteria.name.toLowerCase()) &&
      (searchCriteria.category === '' || 
       event.category.toLowerCase() === searchCriteria.category.toLowerCase()) &&
      event.location.toLowerCase().includes(searchCriteria.location.toLowerCase()) &&
      (searchCriteria.startDate === '' || event.startDate >= searchCriteria.startDate)
    );
  });

  const updateEventTicketCount = async (event, bookedCount) => {
    try {
      const newActualCount = event.ticketCount - bookedCount;
      const updatedEvent = {
        ...event,
        ticketCount: newActualCount
      };

      const response = await fetch(`http://localhost:8081/events/updateEventById/${event.eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updatedEvent)
      });

      if (!response.ok) {
        throw new Error('Failed to update ticket count');
      }

      // Update local state and remove event if actual count would be <= 1
      setEvents(prevEvents => 
        prevEvents.map(e => {
          if (e.eventId === event.eventId) {
            return newActualCount > 1 ? {
              ...updatedEvent,
              displayTicketCount: newActualCount - 1
            } : null;
          }
          return e;
        }).filter(Boolean) // Remove null values
      );
    } catch (err) {
      throw new Error('Failed to update ticket count');
    }
  };

  const handleBooking = async (event) => {
    try {
      const { value: ticketCount } = await Swal.fire({
        title: 'How many tickets?',
        input: 'number',
        inputLabel: 'Number of tickets',
        inputAttributes: {
          min: 1,
          max: event.displayTicketCount,
          step: 1
        },
        validationMessage: `Please enter a number between 1 and ${event.displayTicketCount}`,
        showCancelButton: true,
        inputValidator: (value) => {
          const numValue = parseInt(value);
          if (!numValue || numValue < 1) {
            return 'Please enter at least 1 ticket';
          }
          if (numValue > event.displayTicketCount) {
            return `Only ${event.displayTicketCount} tickets available`;
          }
        }
      });

      if (!ticketCount) return;

      const confirmResult = await Swal.fire({
        title: 'Confirm Booking',
        text: `Book ${ticketCount} ticket(s) for ${event.name}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, book now!',
        cancelButtonText: 'No, cancel'
      });

      if (!confirmResult.isConfirmed) return;

      const userId = localStorage.getItem('userId');
      const response = await fetch('http://localhost:8083/tickets/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          eventId: event.eventId,
          userId: parseInt(userId),
          ticketCount: parseInt(ticketCount),
          cancelingDate: null,
          status: 'BOOKED'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to book ticket');
      }

      await updateEventTicketCount(event, parseInt(ticketCount));

      await Swal.fire({
        icon: 'success',
        title: 'Booking Successful!',
        text: `Successfully booked ${ticketCount} ticket(s)!`,
        confirmButtonColor: '#3085d6',
      });

    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Booking Failed',
        text: err.message || 'Failed to book ticket. Please try again.',
        confirmButtonColor: '#d33',
      });
    }
  };

  return (
    <div className="events-container">
      <div className="search-card">
        <h3>Search Events</h3>
        <div className="search-form">
          <div className="search-group">
            <input
              type="text"
              name="name"
              placeholder="Search by event name"
              value={searchCriteria.name}
              onChange={handleSearch}
            />
          </div>
          <div className="search-group">
            <select
              name="category"
              value={searchCriteria.category}
              onChange={handleSearch}
            >
              <option value="">All Categories</option>
              <option value="TECHNOLOGY">Technology</option>
              <option value="MUSIC">Music</option>
              <option value="SPORTS">Sports</option>
              <option value="ARTS">Arts</option>
              <option value="BUSINESS">Business</option>
            </select>
          </div>
          <div className="search-group">
            <input
              type="text"
              name="location"
              placeholder="Search by location"
              value={searchCriteria.location}
              onChange={handleSearch}
            />
          </div>
          <div className="search-group">
            <input
              type="date"
              name="startDate"
              value={searchCriteria.startDate}
              onChange={handleSearch}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>
      </div>

      <h2>Available Events</h2>
      {error && <div className="error-message">{error}</div>}
      {filteredEvents.length === 0 && (
        <div className="no-events-message">No events found</div>
      )}
      <div className="events-grid">
        {filteredEvents.map(event => (
          <div key={event.eventId} className="event-card">
            <div className="event-header">
              <h3>{event.name}</h3>
              <span className="event-category">{event.category}</span>
            </div>
            <div className="event-details">
              <p><strong>Location:</strong> {event.location}</p>
              <p><strong>Date:</strong> {event.startDate} to {event.endDate}</p>
              <p><strong>Time:</strong> {event.startTime.substring(0, 5)} - {event.endTime.substring(0, 5)}</p>
              <p><strong>Available Tickets:</strong> {event.displayTicketCount}</p>
              <p className="event-description">{event.description}</p>
              <p className="event-address">{event.address}</p>
            </div>
            <button 
              onClick={() => handleBooking(event)}
              className="book-btn"
            >
              Book Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventList;