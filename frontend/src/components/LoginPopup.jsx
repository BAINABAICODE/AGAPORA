import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import './LoginPopup.css';

const LoginPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('login'); // login, signup, forgot
  const { login, register, forgotPassword } = useAuth();
  const { register: registerForm, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => {
    const handleOpenLogin = () => {
      setMode('login');
      setIsOpen(true);
    };
    
    const handleOpenSignup = () => {
      setMode('signup');
      setIsOpen(true);
    };

    window.addEventListener('openLogin', handleOpenLogin);
    window.addEventListener('openSignup', handleOpenSignup);

    return () => {
      window.removeEventListener('openLogin', handleOpenLogin);
      window.removeEventListener('openSignup', handleOpenSignup);
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    reset();
  };

  const onLogin = async (data) => {
    const result = await login(data.email, data.password);
    if (result.success) {
      handleClose();
    } else {
      alert(result.error);
    }
  };

  const onSignup = async (data) => {
    const result = await register(data.name, data.email, data.password);
    if (result.success) {
      handleClose();
    } else {
      alert(JSON.stringify(result.error));
    }
  };

  const onForgotPassword = async (data) => {
    const result = await forgotPassword(data.email);
    if (result.success) {
      alert(result.message);
      setMode('login');
    } else {
      alert(result.error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={handleClose}>×</button>
        
        {mode === 'login' && (
          <>
            <h2>Login</h2>
            <form onSubmit={handleSubmit(onLogin)}>
              <input
                type="email"
                placeholder="Email"
                {...registerForm('email', { required: 'Email is required' })}
              />
              {errors.email && <span className="error">{errors.email.message}</span>}
              
              <input
                type="password"
                placeholder="Password"
                {...registerForm('password', { required: 'Password is required' })}
              />
              {errors.password && <span className="error">{errors.password.message}</span>}
              
              <button type="submit" className="submit-btn">Login</button>
            </form>
            <p className="toggle-mode">
              Don't have an account?{' '}
              <button onClick={() => setMode('signup')}>Sign Up</button>
            </p>
            <p className="toggle-mode">
              <button onClick={() => setMode('forgot')}>Forgot Password?</button>
            </p>
          </>
        )}

        {mode === 'signup' && (
          <>
            <h2>Sign Up</h2>
            <form onSubmit={handleSubmit(onSignup)}>
              <input
                type="text"
                placeholder="Name"
                {...registerForm('name', { required: 'Name is required' })}
              />
              {errors.name && <span className="error">{errors.name.message}</span>}
              
              <input
                type="email"
                placeholder="Email"
                {...registerForm('email', { required: 'Email is required' })}
              />
              {errors.email && <span className="error">{errors.email.message}</span>}
              
              <input
                type="password"
                placeholder="Password"
                {...registerForm('password', { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })}
              />
              {errors.password && <span className="error">{errors.password.message}</span>}
              
              <button type="submit" className="submit-btn">Sign Up</button>
            </form>
            <p className="toggle-mode">
              Already have an account?{' '}
              <button onClick={() => setMode('login')}>Login</button>
            </p>
          </>
        )}

        {mode === 'forgot' && (
          <>
            <h2>Forgot Password</h2>
            <form onSubmit={handleSubmit(onForgotPassword)}>
              <input
                type="email"
                placeholder="Email"
                {...registerForm('email', { required: 'Email is required' })}
              />
              {errors.email && <span className="error">{errors.email.message}</span>}
              
              <button type="submit" className="submit-btn">Send Reset Link</button>
            </form>
            <p className="toggle-mode">
              <button onClick={() => setMode('login')}>Back to Login</button>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginPopup;