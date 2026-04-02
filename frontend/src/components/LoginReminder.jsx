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
        setTimeout(() => {
          setShowReminder(false);
        }, 5000);
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [user]);

  if (user || !showReminder) return null;

  return (
    <div className="reminder-popup animate-slide-in">
      <div className="reminder-content">
        <p>⚠️ Please login to access all features!</p>
      </div>
    </div>
  );
};

export default LoginReminder;