import React, { useState, useEffect } from 'react';
import './TermsPopup.css';

const TermsPopup = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [accepted, setAccepted] = useState(false);

  const handleAccept = () => {
    setAccepted(true);
    setIsOpen(false);
    localStorage.setItem('termsAccepted', 'true');
  };

  useEffect(() => {
    const hasAccepted = localStorage.getItem('termsAccepted');
    if (hasAccepted) {
      setIsOpen(false);
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="terms-overlay">
      <div className="terms-content">
        <h2>Terms and Conditions</h2>
        <div className="terms-text">
          <p>Welcome to LoveBird Application!</p>
          <p>By using this application, you agree to the following terms:</p>
          <ul>
            <li>You must be at least 13 years old to use this service.</li>
            <li>You are responsible for maintaining the security of your account.</li>
            <li>You will not use the service for any illegal or unauthorized purpose.</li>
            <li>We reserve the right to terminate accounts for violation of these terms.</li>
          </ul>
          <p>Please read these terms carefully before using our service.</p>
        </div>
        <div className="terms-actions">
          <button onClick={handleAccept} className="accept-btn">
            I Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsPopup;