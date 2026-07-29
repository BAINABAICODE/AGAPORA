// frontend/src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';
import logo from '../assets/birds/logo-lovebirds.png';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navRef = useRef(null);

  useEffect(() => {
    setMenuOpen(false);
    setShowUserMenu(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (
        menuOpen &&
        navRef.current &&
        !navRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setShowUserMenu(false);
    setMenuOpen(false);
  };

  const handleLoginClick = () => {
    setMenuOpen(false);
    window.dispatchEvent(new CustomEvent('openLogin'));
  };

  const handleSignupClick = () => {
    setMenuOpen(false);
    window.dispatchEvent(new CustomEvent('openSignup'));
  };

  const handleBreedClick = (e) => {
    if (!user) {
      e.preventDefault();
      setMenuOpen(false);
      window.dispatchEvent(new CustomEvent('openLogin'));
    } else {
      setMenuOpen(false);
      navigate('/breeding-form');
    }
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar" ref={navRef}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <img src={logo} alt="Agapora Logo" className="logo-image" />
          <span className="logo-text">Agapora</span>
        </Link>

        <button
          type="button"
          className={`nav-toggle${menuOpen ? ' is-open' : ''}`}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="nav-toggle-bar" />
          <span className="nav-toggle-bar" />
          <span className="nav-toggle-bar" />
        </button>

        <div className={`nav-drawer${menuOpen ? ' is-open' : ''}`}>
          <div className="nav-menu">
            <Link to="/" className="nav-link" onClick={closeMenu}>
              Home
            </Link>
            <Link to="/help" className="nav-link" onClick={closeMenu}>
              Help
            </Link>
            <Link
              to="/breeding-form"
              className="nav-link"
              onClick={handleBreedClick}
            >
              Breed
            </Link>
            <Link to="/about" className="nav-link" onClick={closeMenu}>
              About
            </Link>

            {user && (
              <>
                {user.role === 'admin' && (
                  <Link to="/admin" className="nav-link" onClick={closeMenu}>
                    Admin
                  </Link>
                )}
                <Link
                  to="/breeding-pairs"
                  className="nav-link"
                  onClick={closeMenu}
                >
                  My Pairs
                </Link>
              </>
            )}
          </div>

          <div className="nav-auth">
            {!user ? (
              <>
                <button
                  type="button"
                  className="auth-btn login-btn"
                  onClick={handleLoginClick}
                >
                  Login
                </button>
                <button
                  type="button"
                  className="auth-btn signup-btn"
                  onClick={handleSignupClick}
                >
                  Sign Up
                </button>
              </>
            ) : (
              <div className="user-menu-container" ref={dropdownRef}>
                <button
                  type="button"
                  className="user-menu-btn"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <div className="user-avatar">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="user-name">{user.name || 'User'}</span>
                </button>
                {showUserMenu && (
                  <div className="user-dropdown">
                    <Link
                      to="/breeding-pairs"
                      className="dropdown-item"
                      onClick={closeMenu}
                    >
                      My Breeding Pairs
                    </Link>
                    <Link
                      to="/breeding-form"
                      className="dropdown-item"
                      onClick={closeMenu}
                    >
                      New Breeding Pair
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="dropdown-item"
                        onClick={closeMenu}
                      >
                        Admin Panel
                      </Link>
                    )}
                    <hr className="dropdown-divider" />
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="dropdown-item logout-item"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {menuOpen && (
        <button
          type="button"
          className="nav-backdrop"
          aria-label="Close menu"
          onClick={closeMenu}
        />
      )}
    </nav>
  );
};

export default Navbar;
