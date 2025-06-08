import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './AddEvent.css';

const AddEvent = () => {
    const navigate = useNavigate();
    const storedOrganizerId = localStorage.getItem('organizerId');
    const [error, setError] = useState('');
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({
      name: '',
      category: '',
      location: '',
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
      address: '',
      description: '',
      ticketCount: '',
      ticketPrice: ''
    });

    useEffect(() => {
      fetchUsers();
    }, []);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
          if (new Date(formData.endDate) < new Date(formData.startDate)) {
            throw new Error('End date cannot be before start date');
          }

          const eventData = {
            ...formData,
            startDate: formData.startDate,
            endDate: formData.endDate,
            startTime: formData.startTime + ':00',
            endTime: formData.endTime + ':00',
            ticketCount: parseInt(formData.ticketCount),
            ticketPrice: parseFloat(formData.ticketPrice),
            organizerId: storedOrganizerId
          };
      
          const response = await fetch('http://localhost:8081/events/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(eventData)
          });
      
          if (!response.ok) throw new Error('Failed to create event');
          
          const createdEvent = await response.json();

          // Prompt for notification message
          const { value: message } = await Swal.fire({
            title: 'Send Notification',
            input: 'textarea',
            inputLabel: 'Enter message for users',
            inputPlaceholder: 'Enter your message here...',
            inputValue: `New event "${formData.name}" has been added! Tickets available at ${formatPrice(formData.ticketPrice)} each.`,
            showCancelButton: true,
            confirmButtonText: 'Send',
            inputValidator: (value) => {
              if (!value) return 'You need to write something!';
            }
          });

          if (message) {
            // Send notifications to all users
            await Promise.all(users.map(user => 
              sendNotification(user.userId, createdEvent.eventId, message)
            ));

            await Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: 'Event created and notifications sent successfully',
              timer: 1500,
              showConfirmButton: false
            });
          }

          navigate('/organizer');
        } catch (err) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: err.message || 'Failed to create event. Please try again.'
          });
        }
    };

    const formatPrice = (price) => {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
      }).format(price);
    };

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };
  return (
    <div className="add-event-container">
      <h2>Create New Event</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit} className="event-form">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="name">Event Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              minLength={3}
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              <option value="TECHNOLOGY">Technology</option>
              <option value="MUSIC">Music</option>
              <option value="SPORTS">Sports</option>
              <option value="ARTS">Arts</option>
              <option value="BUSINESS">Business</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              minLength={2}
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label htmlFor="startDate">Start Date</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="endDate">End Date</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              min={formData.startDate}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="startTime">Start Time</label>
            <input
              type="time"
              id="startTime"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="endTime">End Time</label>
            <input
              type="time"
              id="endTime"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="ticketCount">Number of Tickets</label>
            <input
              type="number"
              id="ticketCount"
              name="ticketCount"
              value={formData.ticketCount}
              onChange={handleChange}
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="ticketPrice">Ticket Price (₹)</label>
            <input
              type="number"
              id="ticketPrice"
              name="ticketPrice"
              value={formData.ticketPrice}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
              placeholder="Enter price in ₹"
            />
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="address">Address</label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            minLength={10}
            maxLength={200}
          />
        </div>

        <div className="form-group full-width">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            minLength={20}
            maxLength={500}
          />
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={() => navigate('/organizer')}>
            Cancel
          </button>
          <button type="submit" className="submit-btn">
            Create Event
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEvent;