import React, { useState, useEffect } from 'react';
import './TicketHistory.css';

const TicketHistory = () => {
  const [events, setEvents] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchEventId, setSearchEventId] = useState('');
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
      
      // Fetch tickets for all events
      const ticketPromises = data.map(event => fetchTicketsForEvent(event.eventId));
      const ticketsData = await Promise.all(ticketPromises);
      setTickets(ticketsData.flat());
      setLoading(false);
    } catch (err) {
      setError('Failed to load events');
      setLoading(false);
    }
  };

  const fetchTicketsForEvent = async (eventId) => {
    try {
      const response = await fetch(`http://localhost:8083/tickets/getTicketByEventId/${eventId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch tickets');
      const data = await response.json();
      return Array.isArray(data) ? data : [data];
    } catch (err) {
      return [];
    }
  };

  const formatDateTime = (dateTimeStr) => {
    return new Date(dateTimeStr).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  const getEventName = (eventId) => {
    const event = events.find(e => e.eventId === eventId);
    return event ? event.name : 'Unknown Event';
  };

  const filteredTickets = tickets.filter(ticket => 
    searchEventId === '' || ticket.eventId.toString() === searchEventId
  );

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="ticket-history-container">
      <div className="search-card">
        <h3>Search Tickets</h3>
        <div className="search-form">
          <div className="search-group">
            <input
              type="text"
              placeholder="Search by Event ID"
              value={searchEventId}
              onChange={(e) => setSearchEventId(e.target.value)}
            />
          </div>
        </div>
      </div>

      <h2>Ticket History</h2>
      
      <div className="tickets-grid">
        {filteredTickets.map(ticket => {
          const event = events.find(e => e.eventId === ticket.eventId);
          const totalAmount = event ? event.ticketPrice * ticket.ticketCount : 0;

          return (
            <div key={ticket.ticketId} className="ticket-card">
              <div className="ticket-header">
                <h3>{getEventName(ticket.eventId)}</h3>
                <span className={`ticket-status ${ticket.status.toLowerCase()}`}>
                  {ticket.status}
                </span>
              </div>
              <div className="ticket-details">
                <p><strong>Event ID:</strong> {ticket.eventId}</p>
                <p><strong>User ID:</strong> {ticket.userId}</p>
                <p><strong>Tickets Booked:</strong> {ticket.ticketCount}</p>
                <p><strong>Total Amount:</strong> ₹{totalAmount}</p>
                <p><strong>Booking Date:</strong> {formatDateTime(ticket.bookingDate)}</p>
                {ticket.cancelingDate && (
                  <p><strong>Cancellation Date:</strong> {formatDateTime(ticket.cancelingDate)}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredTickets.length === 0 && (
        <div className="no-tickets-message">No tickets found</div>
      )}
    </div>
  );
};

export default TicketHistory;