import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './SignUp.css';

const SignUpForm = ({ role }) => {
  const navigate = useNavigate();
  const initialFormData = role === 'organizer' 
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
      };

  const [formData, setFormData] = useState(initialFormData);
  const [touched, setTouched] = useState({});
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const resetForm = () => {
    setFormData(initialFormData);
    setError('');
    setTouched({});
    setPasswordError('');
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setFormData({ ...formData, password: newPassword });
    
    if (touched.password && newPassword && !validatePassword(newPassword)) {
      setPasswordError('Password must contain at least 8 characters, including uppercase, lowercase, number and special character');
    } else {
      setPasswordError('');
    }
  };

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

      const data = await response.text();

      if (!response.ok) {
        throw new Error(data || 'Registration failed');
      }

      resetForm();

      await Swal.fire({
        icon: 'success',
        title: 'Registration Successful!',
        text: 'Please login to continue',
        confirmButtonColor: '#3085d6',
      });
      
      navigate(`/auth?role=${role}`);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: err.message || 'Please try again',
        confirmButtonColor: '#d33',
      });
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
          onBlur={() => handleBlur('name')}
          required
          minLength={3}
          pattern="[A-Za-z\s]+"
          title="Name should only contain letters and spaces"
          className={touched.name && !formData.name ? 'invalid' : ''}
        />
        {touched.name && !formData.name && 
          <div className="field-error">Name is required</div>}
      </div>

      <div className="form-group">
        <label>Email:</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          onBlur={() => handleBlur('email')}
          required
          pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
          title="Please enter a valid email address"
          className={touched.email && !formData.email ? 'invalid' : ''}
        />
        {touched.email && !formData.email && 
          <div className="field-error">Email is required</div>}
      </div>

      <div className="form-group">
        <label>Password:</label>
        <input
          type="password"
          value={formData.password}
          onChange={handlePasswordChange}
          onBlur={() => handleBlur('password')}
          required
          className={touched.password && passwordError ? 'invalid' : ''}
        />
        {touched.password && passwordError && 
          <div className="field-error">{passwordError}</div>}
      </div>

      <div className="form-group">
        <label>Contact:</label>
        <input
          type="tel"
          value={formData.contact}
          onChange={(e) => setFormData({...formData, contact: e.target.value})}
          onBlur={() => handleBlur('contact')}
          required
          pattern="[0-9]{10}"
          title="Please enter a valid 10-digit phone number"
          className={touched.contact && !formData.contact ? 'invalid' : ''}
        />
        {touched.contact && !formData.contact && 
          <div className="field-error">Contact number is required</div>}
      </div>

      {role === 'organizer' && (
        <>
          <div className="form-group">
            <label>Organization Name:</label>
            <input
              type="text"
              value={formData.organizationName}
              onChange={(e) => setFormData({...formData, organizationName: e.target.value})}
              onBlur={() => handleBlur('organizationName')}
              required
              minLength={3}
              className={touched.organizationName && !formData.organizationName ? 'invalid' : ''}
            />
            {touched.organizationName && !formData.organizationName && 
              <div className="field-error">Organization name is required</div>}
          </div>

          <div className="form-group">
            <label>Website:</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({...formData, website: e.target.value})}
              onBlur={() => handleBlur('website')}
              required
              pattern="https?://.+"
              title="Please enter a valid URL starting with http:// or https://"
              className={touched.website && !formData.website ? 'invalid' : ''}
            />
            {touched.website && !formData.website && 
              <div className="field-error">Website URL is required</div>}
          </div>

          <div className="form-group">
            <label>Contact Number:</label>
            <input
              type="tel"
              value={formData.contactNumber}
              onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
              onBlur={() => handleBlur('contactNumber')}
              required
              pattern="[0-9]{10}"
              title="Please enter a valid 10-digit phone number"
              className={touched.contactNumber && !formData.contactNumber ? 'invalid' : ''}
            />
            {touched.contactNumber && !formData.contactNumber && 
              <div className="field-error">Contact number is required</div>}
          </div>
        </>
      )}

      <button 
        type="submit" 
        className="submit-btn"
        disabled={!!passwordError}
      >
        Sign Up
      </button>
    </form>
  );
};

export default SignUpForm;