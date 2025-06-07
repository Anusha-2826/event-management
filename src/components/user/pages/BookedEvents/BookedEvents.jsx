import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import './BookedEvents.css';

const BookedEvents = () => {
  const [bookedEvents, setBookedEvents] = useState([]);
  const [error, setError] = useState('');
  const userId = localStorage.getItem('userId');
  const [searchCriteria, setSearchCriteria] = useState({
    date: '',
    eventId: '',
    filter: 'all'
  });

  useEffect(() => {
    fetchBookedEvents();
  }, []);

  const fetchBookedEvents = async () => {
    try {
      const response = await fetch(`http://localhost:8083/tickets/getTicketByUserId/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch booked events');
      const tickets = await response.json();

      const eventsDetails = await Promise.all(
        tickets.map(async ticket => {
          const eventResponse = await fetch(`http://localhost:8081/events/getEventById/${ticket.eventId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          if (!eventResponse.ok) throw new Error('Failed to fetch event details');
          const eventData = await eventResponse.json();
          return {
            ...ticket,
            eventDetails: eventData
          };
        })
      );

      setBookedEvents(eventsDetails);
    } catch (err) {
      setError('Failed to load booked events');
    }
  };

  const updateEventTicketCount = async (booking) => {
    try {
      const updatedEvent = {
        ...booking.eventDetails,
        ticketCount: booking.eventDetails.ticketCount + booking.ticketCount
      };

      const response = await fetch(`http://localhost:8081/events/updateEventById/${booking.eventDetails.eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updatedEvent)
      });

      if (!response.ok) throw new Error('Failed to update event ticket count');
    } catch (err) {
      throw new Error('Failed to update event ticket count');
    }
  };

  const handleCancelTicket = async (booking) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, cancel it!'
      });

      if (result.isConfirmed) {
        // First cancel the ticket
        const response = await fetch(`http://localhost:8083/tickets/cancel/${booking.ticketId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) throw new Error('Failed to cancel ticket');

        // Then update the event ticket count
        await updateEventTicketCount(booking);

        // Update local state
        setBookedEvents(prev => 
          prev.map(b => 
            b.ticketId === booking.ticketId 
              ? { ...b, status: 'CANCELLED' } 
              : b
          )
        );

        await Swal.fire(
          'Cancelled!',
          'Your ticket has been cancelled.',
          'success'
        );
      }
    } catch (err) {
      Swal.fire('Error', 'Failed to cancel ticket', 'error');
    }
  };

  const handleFeedback = async (booking) => {
    try {
      const { value: formValues } = await Swal.fire({
        title: 'Event Feedback',
        html:
          '<textarea id="comments" class="swal2-textarea" placeholder="Enter your feedback here..."></textarea>' +
          '<select id="rating" class="swal2-select">' +
          '<option value="">Select Rating</option>' +
          '<option value="5">5 - Excellent</option>' +
          '<option value="4">4 - Good</option>' +
          '<option value="3">3 - Average</option>' +
          '<option value="2">2 - Poor</option>' +
          '<option value="1">1 - Very Poor</option>' +
          '</select>',
        focusConfirm: false,
        showCancelButton: true,
        preConfirm: () => {
          const comments = document.getElementById('comments').value;
          const rating = document.getElementById('rating').value;
          if (!comments || !rating) {
            Swal.showValidationMessage('Please provide both feedback and rating');
            return false;
          }
          return { comments, rating };
        }
      });

      if (formValues) {
        const response = await fetch('http://localhost:8082/feedbacks/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            userId: parseInt(userId),
            eventId: booking.eventId,
            comments: formValues.comments,
            rating: parseFloat(formValues.rating)
          })
        });

        if (!response.ok) throw new Error('Failed to submit feedback');

        await Swal.fire(
          'Thank you!',
          'Your feedback has been submitted.',
          'success'
        );
      }
    } catch (err) {
      Swal.fire('Error', 'Failed to submit feedback', 'error');
    }
  };

  const filterBookings = (bookings) => {
    const currentDate = new Date().toISOString().split('T')[0];
    
    return bookings.filter(booking => {
      const eventDate = booking.eventDetails.startDate;
      const matchesDate = !searchCriteria.date || eventDate === searchCriteria.date;
      const matchesEventId = !searchCriteria.eventId || 
                            booking.eventId.toString() === searchCriteria.eventId;

      if (searchCriteria.filter === 'upcoming') {
        return eventDate >= currentDate && matchesDate && matchesEventId;
      } else if (searchCriteria.filter === 'past') {
        return eventDate < currentDate && matchesDate && matchesEventId;
      }
      
      return matchesDate && matchesEventId;
    });
  };

  const filteredBookings = filterBookings(bookedEvents);

  return (
    <div className="booked-events-container">
      <div className="search-card">
        <h3>Search Bookings</h3>
        <div className="search-form">
          <div className="search-group">
            <input
              type="date"
              value={searchCriteria.date}
              onChange={(e) => setSearchCriteria(prev => ({...prev, date: e.target.value}))}
              placeholder="Filter by date"
            />
          </div>
          <div className="search-group">
            <input
              type="text"
              value={searchCriteria.eventId}
              onChange={(e) => setSearchCriteria(prev => ({...prev, eventId: e.target.value}))}
              placeholder="Search by Event ID"
            />
          </div>
          <div className="search-group">
            <select
              value={searchCriteria.filter}
              onChange={(e) => setSearchCriteria(prev => ({...prev, filter: e.target.value}))}
            >
              <option value="all">All Events</option>
              <option value="upcoming">Upcoming Events</option>
              <option value="past">Past Events</option>
            </select>
          </div>
        </div>
      </div>

      <h2>My Booked Events</h2>
      {error && <div className="error-message">{error}</div>}
      {filteredBookings.length === 0 && (
        <div className="no-bookings-message">No bookings found</div>
      )}
      <div className="booked-events-grid">
        {filteredBookings.map(booking => {
          const isEventCompleted = new Date(booking.eventDetails.startDate) < new Date();
          
          return (
            <div key={booking.ticketId} className="booking-card">
              <div className="booking-header">
                <h3>{booking.eventDetails.name}</h3>
                <span className={`booking-status ${booking.status.toLowerCase()}`}>
                  {booking.status}
                </span>
              </div>
              <div className="booking-details">
                <p><strong>Event Date:</strong> {booking.eventDetails.startDate}</p>
                <p><strong>Location:</strong> {booking.eventDetails.location}</p>
                <p><strong>Tickets:</strong> {booking.ticketCount}</p>
                <p><strong>Booking Date:</strong> {new Date(booking.bookingDate).toLocaleDateString()}</p>
                <p><strong>Category:</strong> {booking.eventDetails.category}</p>
                <p><strong>Time:</strong> {booking.eventDetails.startTime} - {booking.eventDetails.endTime}</p>
                <p><strong>Address:</strong> {booking.eventDetails.address}</p>
              </div>
              {!isEventCompleted && booking.status !== 'CANCELLED' ? (
                <button 
                  onClick={() => handleCancelTicket(booking)}
                  className="cancel-btn"
                >
                  Cancel Booking
                </button>
              ) : isEventCompleted && booking.status !== 'CANCELLED' ? (
                <button 
                  onClick={() => handleFeedback(booking)}
                  className="feedback-btn"
                >
                  Provide Feedback
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BookedEvents; 