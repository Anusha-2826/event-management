import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignUp.css';

const SignUpForm = ({ role }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(
    role === 'organizer' 
      ? {
          name: '',
          email: '',
          password: '',
          contact: '',
          organizationName: '',
          website: '',
          contactNumber: ''
        }
      : {
          name: '',
          email: '',
          password: '',
          contact: ''
        }
  );
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:8089/${role}s/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      // Navigate to login after successful registration
      navigate(`/auth?role=${role}`);
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <form className="signup-form" onSubmit={handleSubmit}>
      {error && <div className="error-message">{error}</div>}
      <div className="form-group">
        <label>Name:</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
        />
      </div>
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
      <div className="form-group">
        <label>Contact:</label>
        <input
          type="tel"
          value={formData.contact}
          onChange={(e) => setFormData({...formData, contact: e.target.value})}
          required
        />
      </div>
      {role === 'organizer' && (
        <>
          <div className="form-group">
            <label>Organization Name:</label>
            <input
              type="text"
              value={formData.organizationName}
              onChange={(e) => setFormData({...formData, organizationName: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Website:</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({...formData, website: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Contact Number:</label>
            <input
              type="tel"
              value={formData.contactNumber}
              onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
              required
            />
          </div>
        </>
      )}
      <button type="submit" className="submit-btn">Sign Up</button>
    </form>
  );
};

export default SignUpForm;