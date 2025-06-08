import React, { useState, useEffect } from 'react';
import './Profile.css';

const Profile = () => {
  const userId = localStorage.getItem('userId');
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    contact: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`http://localhost:8089/users/getUserById/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      setUserData(data);
    } catch (err) {
      setError('Failed to fetch user data');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    fetchUserData();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:8089/users/update/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...userData,
          userId: parseInt(userId)
        })
      });

      if (response.ok) {
        setSuccess('Profile updated successfully');
        setIsEditing(false);
        fetchUserData();
      } else {
        setError('Failed to update profile');
      }
    } catch (err) {
      setError('Failed to update profile');
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8089/users/updatePassword/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      setSuccess('Password updated successfully');
      setShowPasswordForm(false);
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password');
    }
  };

  return (
    <div className="profile-container">
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="profile-form">
        <h2>Profile Details</h2>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={userData.name || ''}
              onChange={handleInputChange}
              readOnly={!isEditing}
            />
          </div>

          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={userData.email || ''}
              readOnly
            />
          </div>

          <div className="form-group">
            <label>Contact:</label>
            <input
              type="tel"
              name="contact"
              value={userData.contact || ''}
              onChange={handleInputChange}
              readOnly={!isEditing}
            />
          </div>

          <div className="button-group">
            {!isEditing ? (
              <button 
                type="button"
                onClick={handleEdit} 
                className="edit-btn"
              >
                Edit Profile
              </button>
            ) : (
              <div className="edit-actions">
                <button type="submit" className="save-btn">
                  Save Changes
                </button>
                <button 
                  type="button"
                  onClick={handleCancel} 
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </form>

        <div className="password-section">
          <button 
            type="button"
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="change-password-btn"
          >
            Change Password
          </button>

          {showPasswordForm && (
            <form onSubmit={handlePasswordUpdate} className="password-form">
              <h3>Change Password</h3>
              {passwordError && <div className="error-message">{passwordError}</div>}
              
              <div className="form-group">
                <label>Current Password:</label>
                <input
                  type="password"
                  value={passwordData.oldPassword}
                  onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>New Password:</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Confirm New Password:</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  required
                />
              </div>

              <div className="button-group">
                <button type="submit" className="save-btn">Update Password</button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordError('');
                    setPasswordData({
                      oldPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                  }} 
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;