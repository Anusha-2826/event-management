import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './EventList.css';

const EventList = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const organizerId = localStorage.getItem('organizerId');
  const [searchCriteria, setSearchCriteria] = useState({
    name: '',
    category: '',
    location: '',
    startDate: ''
  });

  useEffect(() => {
    fetchEvents();
    fetchUsers();
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

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:8089/users/getAllUsers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : [data]);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const sendNotification = async (userId, eventId, message) => {
    try {
      const response = await fetch('http://localhost:8084/notifications/sendNotification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId,
          eventId,
          message,
          timestamp: new Date().toISOString()
        })
      });
      if (!response.ok) throw new Error('Failed to send notification');
    } catch (err) {
      throw new Error('Failed to send notification');
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

  const handleDelete = async (event) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      });

      if (result.isConfirmed) {
        const { value: message } = await Swal.fire({
          title: 'Notification Message',
          input: 'textarea',
          inputLabel: 'Enter message for users',
          inputPlaceholder: 'Enter your message here...',
          inputValue: `Event "${event.name}" has been cancelled.`,
          showCancelButton: true,
          inputValidator: (value) => {
            if (!value) return 'You need to write something!';
          }
        });

        if (message) {
          const response = await fetch(`http://localhost:8081/events/deleteEventById/${event.eventId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });

          if (!response.ok) throw new Error('Failed to delete event');

          // Send notifications to all users
          await Promise.all(users.map(user => 
            sendNotification(user.userId, event.eventId, message)
          ));

          await Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Event deleted and notifications sent!',
            timer: 1500
          });

          fetchEvents();
        }
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete event or send notifications'
      });
    }
  };

  

  const handleViewFeedback = async (eventId) => {
    try {
      const response = await fetch(`http://localhost:8082/feedbacks/getAllFeedbacksByEvent/${eventId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch feedback');
      const feedbacks = await response.json();

      await Swal.fire({
        title: 'Event Feedback',
        html: `
          <div class="feedback-container">
            ${Array.isArray(feedbacks) ? feedbacks.map(feedback => `
              <div class="feedback-item">
                <div class="rating">
                  ${'⭐'.repeat(feedback.rating)}
                  <span class="rating-number">(${feedback.rating}/5)</span>
                </div>
                <p class="feedback-comment">${feedback.comments}</p>
              </div>
            `).join('') : `
              <div class="feedback-item">
                <div class="rating">
                  ${'⭐'.repeat(feedbacks.rating)}
                  <span class="rating-number">(${feedbacks.rating}/5)</span>
                </div>
                <p class="feedback-comment">${feedbacks.comments}</p>
              </div>
            `}
          </div>
        `,
        customClass: {
          popup: 'feedback-modal'
        },
        confirmButtonText: 'Close',
        confirmButtonColor: '#3085d6',
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load feedback',
        confirmButtonColor: '#d33',
      });
    }
  };

  const formatDateTime = (date, time) => {
    return new Date(`${date}T${time}`).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  return (
    <div className="event-list-container">
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
            />
          </div>
        </div>
      </div>

      <h2>My Events</h2>
      {error && <div className="error-message">{error}</div>}
      {filteredEvents.length === 0 && (
        <div className="no-events-message">No events found</div>
      )}
      <div className="event-grid">
        {filteredEvents.map(event => (
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
              <p><strong>Ticket Price:</strong> {formatPrice(event.ticketPrice)}</p>
              <p className="event-description">{event.description}</p>
              <p className="event-address">{event.address}</p>
            </div>
            <div className="event-actions">
              <button
                onClick={() => {
                  navigate(`/organizer/update-event/${event.eventId}`);
                }}
                className="edit-btn"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(event)}
                className="delete-btn"
              >
                Delete
              </button>
              {new Date(event.endDate) < new Date() && (
                <button
                  onClick={() => handleViewFeedback(event.eventId)}
                  className="feedback-view-btn"
                >
                  View Feedback
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventList;