import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './LoginReminder.css';

const LoginReminder = () => {
  const { user } = useAuth();
  const [showReminder, setShowReminder] = useState(false);

  useEffect(() => {
    if (!user) {
      const interval = setInterval(() => {
        setShowReminder(true);
      }, 20000); // 20 seconds

      return () => clearInterval(interval);
    }
  }, [user]);

  const handleClose = () => {
    setShowReminder(false);
  };

  const handleLogin = () => {
    window.dispatchEvent(new CustomEvent('openLogin'));
    setShowReminder(false);
  };

  const handleSignup = () => {
    window.dispatchEvent(new CustomEvent('openSignup'));
    setShowReminder(false);
  };

  if (user || !showReminder) return null;

  return (
    <div className="reminder-overlay">
      <div className="reminder-card">
        <button className="reminder-close" onClick={handleClose}>×</button>
        <h3>Login Required</h3>
        <p>Please login or sign up to access all features.</p>
        <div className="reminder-buttons">
          <button className="reminder-login" onClick={handleLogin}>Login</button>
          <button className="reminder-signup" onClick={handleSignup}>Sign Up</button>
        </div>
      </div>
    </div>
  );
};

export default LoginReminder;