import React, { useState } from 'react';
import { FaHome } from 'react-icons/fa';
import { useLocation , useNavigate} from 'react-router-dom';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';
import './AuthPage.css';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const location = useLocation();
  const role = new URLSearchParams(location.search).get('role') || 'user';
  const navigate = useNavigate();
  return (
    <div className="auth-container">
      <button 
        className="home-btn"
        onClick={() => navigate('/')}
      >
        <FaHome /> Home
      </button>
      <div className="auth-box">
        <div className="auth-header">
          <h2>{role.charAt(0).toUpperCase() + role.slice(1)} Portal</h2>
          <div className="auth-toggle">
            <button 
              className={isLogin ? 'active' : ''} 
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button 
              className={!isLogin ? 'active' : ''} 
              onClick={() => setIsLogin(false)}
            >
              Sign Up
            </button>
          </div>
        </div>
        {isLogin ? (
          <LoginForm role={role} />
        ) : (
          <SignUpForm role={role} />
        )}
      </div>
    </div>
  );
};

export default AuthPage;