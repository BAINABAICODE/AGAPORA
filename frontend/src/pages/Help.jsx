import React from 'react';
import './Help.css';

const Help = () => {
  return (
    <div className="help-container">
      <div className="help-content">
        <h1>Help & Support</h1>
        <div className="faq-section">
          <h3>How to use this app?</h3>
          <p>Simply login or sign up to access bird information and features.</p>
          
          <h3>What species are available?</h3>
          <p>We have information on various lovebird species including Peach-faced, Masked, Fischer's, and more.</p>
          
          <h3>Contact Support</h3>
          <p>Email: support@lovebird.com</p>
        </div>
      </div>
    </div>
  );
};

export default Help;