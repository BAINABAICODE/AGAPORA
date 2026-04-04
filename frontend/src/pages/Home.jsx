import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SPECIES_SLIDES } from '../data/speciesData';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % SPECIES_SLIDES.length);
        setIsAnimating(false);
      }, 500);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const currentSpecies = SPECIES_SLIDES[currentSlide];

  const handlePrevSlide = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentSlide((prev) => (prev - 1 + SPECIES_SLIDES.length) % SPECIES_SLIDES.length);
      setIsAnimating(false);
    }, 500);
  };

  const handleNextSlide = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % SPECIES_SLIDES.length);
      setIsAnimating(false);
    }, 500);
  };

  const goToSlide = (index) => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentSlide(index);
      setIsAnimating(false);
    }, 500);
  };

  const handleStartBreeding = () => {
    navigate('/breed');
  };

  return (
    <div className="home">
      <div className="hero-container">
        <div className="hero-text-column">
          <h1 className="hero-title">Agapora</h1>
          <p className="hero-text">
            WELCOME TO AGAPORA - A CUTTING-EDGE PLATFORM DESIGNED TO
            HELP LOVEBIRD BREEDERS PREDICT PAIR COMPATIBILITY USING
            RULE-BASED GENETIC INHERITANCE.
          </p>
          <p className="hero-text">
            OUR ALGORITHM ANALYZES GENETIC DATA TO GUIDE BREEDERS IN
            SELECTING OPTIMAL PAIRS AND PROVIDES PREDICTIONS OF
            GENETIC INHERITANCE FOR SIX LOVEBIRD CHICKS, INCLUDING
            COLOR MUTATION PROBABILITIES.
          </p>
          <p className="hero-text highlight">
            BY REPLACING GUESSWORK WITH SCIENCE, AGAPORA ENSURES A
            RELIABLE AND CONSISTENT BREEDING PROCESS.
          </p>
          <button className="btn-start" onClick={handleStartBreeding}>
            START BREEDING
          </button>
        </div>

        <div className="hero-carousel-column">
          <div
            className="bird-card"
            style={{
              background: `linear-gradient(135deg, ${currentSpecies.gradientFrom}, ${currentSpecies.gradientTo})`
            }}
          >
            <div className={`bird-card-content ${isAnimating ? 'fade-out' : 'fade-in'}`}>
              <div className="bird-image">
                <img
                  src={currentSpecies.imageSrc}
                  alt={currentSpecies.name}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x300?text=Lovebird';
                  }}
                />
              </div>
              <div className="bird-details">
                <h2 className="bird-name">{currentSpecies.name}</h2>
                <p className="scientific-name">{currentSpecies.scientificName}</p>
                <p className="bird-description">{currentSpecies.description}</p>
                <button className="btn-about">ABOUT BIRDS</button>
              </div>
            </div>

            <button className="nav prev" onClick={handlePrevSlide}>❮</button>
            <button className="nav next" onClick={handleNextSlide}>❯</button>

            <div className="dots">
              {SPECIES_SLIDES.map((_, index) => (
                <button
                  key={index}
                  className={`dot ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => goToSlide(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;