import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const organizerId = localStorage.getItem('organizerId');

  if (!token || !organizerId) {
    return <Navigate to="/auth?role=organizer" />;
  }

  return children;
};

export default PrivateRoute;