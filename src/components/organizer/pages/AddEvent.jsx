import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddEvent.css';

const AddEvent = () => {
    const navigate = useNavigate();
    const storedOrganizerId = localStorage.getItem('organizerId');
    const [error, setError] = useState('');
    //console.log('Stored Organizer ID:', storedOrganizerId); // Debug log
    // Remove organizerId from initial state since we'll add it in handleSubmit
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
      ticketCount: ''
    });
  
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
          const eventData = {
            ...formData,
            startDate: formData.startDate,
            endDate: formData.endDate,
            startTime: formData.startTime + ':00',
            endTime: formData.endTime + ':00',
            ticketCount: parseInt(formData.ticketCount),
            organizerId: storedOrganizerId // Add organizerId here only
          };
      
          console.log('Sending event data:', eventData); // Debug log
      
          const response = await fetch('http://localhost:8081/events/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(eventData)
          });
      
          if (!response.ok) {
            throw new Error('Failed to create event');
          }
      
          navigate('/organizer');
        } catch (err) {
          setError('Failed to create event. Please try again.');
        }
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
              <option value="MUSIC">Music</option>
              <option value="SPORTS">Sports</option>
              <option value="THEATRE">Theatre</option>
              <option value="CONFERENCE">Conference</option>
              <option value="WORKSHOP">Workshop</option>
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
        </div>

        <div className="form-group full-width">
          <label htmlFor="address">Address</label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
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