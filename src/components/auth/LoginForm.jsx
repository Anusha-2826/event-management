import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

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
      const loginResponse = await fetch(`http://localhost:8089/${role}s/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
          
        },
        body: JSON.stringify(formData),
      });
      
      if (!loginResponse.ok) {
        throw new Error('Invalid credentials');
      }
  
      const loginData = await loginResponse.json();

      if (role === 'organizer') {
        const organizerResponse = await fetch(`http://localhost:8089/organizers/getByEmail/${formData.email}`, {
          headers: {
            'Authorization': `Bearer ${loginData.token}`
          }
        });
  
        if (!organizerResponse.ok) {
          throw new Error('Failed to get organizer details');
        }
  
        const organizerData = await organizerResponse.json();
  
        localStorage.setItem('token', loginData.token);
        localStorage.setItem('organizerId', organizerData.organizerId);
        localStorage.setItem('organizerName', organizerData.name);
        localStorage.setItem('userRole', 'organizer');
        
        await Swal.fire({
          icon: 'success',
          title: 'Login Successful!',
          text: `Welcome back, ${organizerData.name}!`,
          timer: 1500,
          showConfirmButton: false
        });
        
        navigate('/organizer/events');
      } else {
        const userResponse = await fetch(`http://localhost:8089/users/getUserByEmail/${formData.email}`, {
          headers: {
            'Authorization': `Bearer ${loginData.token}`
          }
        });

        if (!userResponse.ok) {
          throw new Error('Failed to get user details');
        }

        const userData = await userResponse.json();

        localStorage.setItem('token', loginData.token);
        localStorage.setItem('userId', userData.userId);
        localStorage.setItem('userName', userData.name);
        localStorage.setItem('userRole', 'user');
        
        await Swal.fire({
          icon: 'success',
          title: 'Login Successful!',
          text: `Welcome back, ${userData.name}!`,
          timer: 1500,
          showConfirmButton: false
        });
        
        navigate('/user/events');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid credentials');
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: err.message || 'Please check your credentials and try again',
      });
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
          placeholder="Enter your email"
        />
      </div>
      <div className="form-group">
        <label>Password:</label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          required
          placeholder="Enter your password"
        />
      </div>
      <button type="submit" className="submit-btn">Login</button>
    </form>
  );
};

export default LoginForm;