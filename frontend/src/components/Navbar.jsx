// frontend/src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';
import logo from '../assets/birds/logo-lovebirds.png';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setShowUserMenu(false);
  };

  const handleLoginClick = () => {
    window.dispatchEvent(new CustomEvent('openLogin'));
  };

  const handleSignupClick = () => {
    window.dispatchEvent(new CustomEvent('openSignup'));
  };

  const handleBreedClick = (e) => {
    if (!user) {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('openLogin'));
    } else {
      navigate('/breeding-form');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src={logo} alt="Agapora Logo" className="logo-image" />
          <span className="logo-text">Agapora</span>
        </Link>

        <div className="nav-menu">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/help" className="nav-link">Help</Link>
          <Link 
            to="/breeding-form" 
            className="nav-link"
            onClick={handleBreedClick}
          >
            Breed
          </Link>

          {user && (
            <>
              {user.role === 'admin' && (
                <Link to="/admin" className="nav-link">Admin</Link>
              )}
              <Link to="/bird-list" className="nav-link">My Birds</Link>
              <Link to="/breeding-pairs" className="nav-link">My Pairs</Link>
            </>
          )}
        </div>

        <div className="nav-auth">
          {!user ? (
            <>
              <button className="auth-btn login-btn" onClick={handleLoginClick}>
                Login
              </button>
              <button className="auth-btn signup-btn" onClick={handleSignupClick}>
                Sign Up
              </button>
            </>
          ) : (
            <div className="user-menu-container" ref={dropdownRef}>
              <button className="user-menu-btn" onClick={() => setShowUserMenu(!showUserMenu)}>
                <div className="user-avatar">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="user-name">{user.name || 'User'}</span>
              </button>
              {showUserMenu && (
                <div className="user-dropdown">
                  <Link to="/profile" className="dropdown-item">Profile</Link>
                  <Link to="/bird-list" className="dropdown-item">My Birds</Link>
                  <Link to="/breeding-pairs" className="dropdown-item">My Breeding Pairs</Link>
                  <Link to="/breeding-form" className="dropdown-item">New Breeding Pair</Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="dropdown-item">Admin Panel</Link>
                  )}
                  <hr className="dropdown-divider" />
                  <button onClick={handleLogout} className="dropdown-item logout-item">
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;