import React from 'react';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Welcome to LoveBird</h1>
        <p>Your premier destination for lovebird information and community</p>
      </div>
      <div className="features-section">
        <div className="feature-card">
          <h3>Discover Birds</h3>
          <p>Learn about different lovebird species and their characteristics</p>
        </div>
        <div className="feature-card">
          <h3>Bird List</h3>
          <p>Browse our comprehensive collection of lovebird species</p>
        </div>
        <div className="feature-card">
          <h3>Community</h3>
          <p>Connect with other lovebird enthusiasts</p>
        </div>
      </div>
    </div>
  );
};

export default Home;