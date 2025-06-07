import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './AddEvent.css'; // We can reuse the AddEvent styles

const UpdateEvent = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
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

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      const response = await fetch(`http://localhost:8081/events/getEventById/${eventId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch event details');
      const data = await response.json();
      
      // Format the time strings (remove seconds)
      const startTime = data.startTime?.substring(0, 5) || '';
      const endTime = data.endTime?.substring(0, 5) || '';

      setFormData({
        ...data,
        startTime,
        endTime
      });
    } catch (err) {
      setError('Failed to load event details');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const eventData = {
        ...formData,
        startTime: formData.startTime + ':00',
        endTime: formData.endTime + ':00',
        ticketCount: parseInt(formData.ticketCount),
        organizerId: localStorage.getItem('organizerId')
      };

      const response = await fetch(`http://localhost:8081/events/updateEventById/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(eventData)
      });

      if (!response.ok) throw new Error('Failed to update event');
      navigate('/organizer');
    } catch (err) {
      setError('Failed to update event. Please try again.');
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
      <h2>Update Event</h2>
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
            Update Event
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateEvent;