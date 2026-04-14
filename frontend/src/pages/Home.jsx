// frontend/src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { speciesService } from '../api/speciesService';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [species, setSpecies] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSpecies = async () => {
      try {
        setLoading(true);
        const response = await speciesService.getAll();
        if (response && response.success && response.data && response.data.length > 0) {
          setSpecies(response.data);
          setError(null);
        } else {
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
    if (user) {
      navigate('/breeding-form');
    } else {
      window.dispatchEvent(new CustomEvent('openLogin'));
    }
  };

  const handleLearnMore = () => {
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

  const cardGradient = `linear-gradient(135deg, ${currentSpecies.gradient_from}, ${currentSpecies.gradient_to})`;

  return (
    <div className="home">
      <div className="hero-section">
        <div className="hero-content">
          {/* Left Column - Text Content */}
          <div className="text-column">
            <h1 className="main-title">
              <span className="title-highlight">Agapora</span>
              <span className="title-sub">Scientific Lovebird Breeding Platform</span>
            </h1>
            
            <div className="info-text-wrapper">
              <p className="info-text">
                Welcome to Agapora – a cutting‑edge platform designed to help lovebird breeders 
                predict pair compatibility using rule‑based genetic inheritance.
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
            <div 
              className="bird-card"
              style={{ background: cardGradient }}
            >
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
              </div>

              {/* Navigation Arrows */}
              {species.length > 1 && (
                <>
                  <button className="nav-arrow prev" onClick={handlePrevSlide}>‹</button>
                  <button className="nav-arrow next" onClick={handleNextSlide}>›</button>
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
            
            {/* Learn More Button – outside the card, border adapts to current species gradient */}
            <div className="learn-more-wrapper">
              <button 
                className="learn-more-button"
                style={{
                  borderColor: currentSpecies.gradient_from,
                  color: currentSpecies.gradient_from
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = currentSpecies.gradient_from;
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = currentSpecies.gradient_from;
                }}
                onClick={handleLearnMore}
              >
                Learn about lovebirds →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;