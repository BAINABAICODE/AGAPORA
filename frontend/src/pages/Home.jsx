// frontend/src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { speciesService } from '../api/speciesService';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [species, setSpecies] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch species from API
  useEffect(() => {
    const fetchSpecies = async () => {
      try {
        setLoading(true);
        console.log('Fetching species from database...');
        
        const response = await speciesService.getAll();
        console.log('Full API Response:', response);
        
        if (response && response.success && response.data && response.data.length > 0) {
          setSpecies(response.data);
          setError(null);
          console.log('✅ Successfully loaded', response.data.length, 'species from database');
        } else {
          console.error('Invalid response format:', response);
          setError('Unable to load species data');
        }
      } catch (err) {
        console.error('Failed to fetch species:', err);
        setError('Failed to connect to database. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSpecies();
  }, []);

  // Auto-rotate slides
  useEffect(() => {
    if (species.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % species.length);
    }, 8000);
    
    return () => clearInterval(interval);
  }, [species.length]);

  const handlePrevSlide = () => {
    if (species.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + species.length) % species.length);
  };

  const handleNextSlide = () => {
    if (species.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % species.length);
  };

  const handleStartBreeding = () => {
    window.dispatchEvent(new CustomEvent('openLogin'));
  };

  const handleAboutBirds = () => {
    navigate('/about');
  };

  if (loading) {
    return (
      <div className="home loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading beautiful lovebirds...</p>
      </div>
    );
  }

  if (error || species.length === 0) {
    return (
      <div className="home error-container">
        <div className="error-card">
          <div className="error-icon">🐦</div>
          <h2>Unable to Load Data</h2>
          <p>{error || 'No species data available'}</p>
          <button className="retry-button" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const currentSpecies = species[currentSlide];
  if (!currentSpecies) return null;

  return (
    <div className="home">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          {/* Left Column - Text Content */}
          <div className="text-column">
            <h1 className="main-title">
              <span className="title-highlight">Agapora</span>
              <span className="title-sub">Scientific Lovebird Breeding Platform</span>
            </h1>
            
            <div className="info-box">
              <p className="info-text">
                Welcome to Agapora - A cutting-edge platform designed to help lovebird breeders 
                predict pair compatibility using rule-based genetic inheritance.
              </p>
              <p className="info-text">
                Our algorithm analyzes genetic data to guide breeders in selecting optimal pairs 
                and provides predictions of genetic inheritance for six lovebird chicks.
              </p>
              <p className="info-text highlight">
                By replacing guesswork with science, Agapora ensures a reliable and consistent breeding process.
              </p>
            </div>
            
            <button className="cta-button" onClick={handleStartBreeding}>
              Start Breeding Now
            </button>
          </div>

          {/* Right Column - Bird Card Carousel */}
          <div className="carousel-column">
            <div className="bird-card" style={{
              background: `linear-gradient(135deg, ${currentSpecies.gradient_from}, ${currentSpecies.gradient_to})`
            }}>
              <div className="bird-card-inner">
                <div className="bird-image-container">
                  <img 
                    src={currentSpecies.image_src} 
                    alt={currentSpecies.name}
                    className="bird-image"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x400?text=Lovebird';
                    }}
                  />
                </div>
                
                <div className="bird-info-container">
                  <h2 className="bird-name">{currentSpecies.name}</h2>
                  <p className="bird-scientific">{currentSpecies.scientific_name}</p>
                  <p className="bird-description">{currentSpecies.description}</p>
                  <button className="about-button" onClick={handleAboutBirds}>
                    Learn More About This Species
                  </button>
                </div>
              </div>

              {/* Navigation Arrows */}
              {species.length > 1 && (
                <>
                  <button className="nav-arrow prev" onClick={handlePrevSlide}>
                    ‹
                  </button>
                  <button className="nav-arrow next" onClick={handleNextSlide}>
                    ›
                  </button>
                </>
              )}

              {/* Dots Indicator */}
              {species.length > 1 && (
                <div className="dots-container">
                  {species.map((_, index) => (
                    <button
                      key={index}
                      className={`dot ${index === currentSlide ? 'active' : ''}`}
                      onClick={() => setCurrentSlide(index)}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <div className="features-container">
          <h2 className="features-title">Why Choose Agapora?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🧬</div>
              <h3>Genetic Prediction</h3>
              <p>Advanced algorithms predict offspring traits with high accuracy</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Science-Based</h3>
              <p>Rooted in proven genetic inheritance rules and principles</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Optimized Breeding</h3>
              <p>Maximize desired traits while minimizing genetic issues</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📚</div>
              <h3>Species Database</h3>
              <p>Comprehensive information on 9+ lovebird species</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;