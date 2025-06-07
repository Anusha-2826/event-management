import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginForm.css';

const LoginForm = ({ role }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // First login request
      const loginResponse = await fetch(`http://localhost:8089/${role}s/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!loginResponse.ok) {
        throw new Error('Login failed');
      }
  
      const loginData = await loginResponse.json();
      console.log('Login response:', loginData);
  
      if (role === 'organizer') {
        // Get organizer details using email
        const organizerResponse = await fetch(`http://localhost:8089/organizers/getByEmail/${formData.email}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${loginData.token}`
          }
        });
  
        if (!organizerResponse.ok) {
          throw new Error('Failed to get organizer details');
        }
  
        const organizerData = await organizerResponse.json();
        console.log('Organizer data:', organizerData);
  
        localStorage.setItem('token', loginData.token);
        localStorage.setItem('organizerId', organizerData.organizerId); // Store the actual organizer ID
        localStorage.setItem('organizerName', organizerData.name);
        
        navigate('/organizer');
      } else {
        localStorage.setItem('userId', loginData.userId);
        navigate('/user/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid credentials');
    }
  };
  return (
    <form className="login-form" onSubmit={handleSubmit}>
      {error && <div className="error-message">{error}</div>}
      <div className="form-group">
        <label>Email:</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
        />
      </div>
      <div className="form-group">
        <label>Password:</label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          required
        />
      </div>
      <button type="submit" className="submit-btn">Login</button>
    </form>
  );
};

export default LoginForm;