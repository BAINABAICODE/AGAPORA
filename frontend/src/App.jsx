// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Help from './pages/Help';
import AdminDashboard from './pages/AdminDashboard';
import BreedingForm from './pages/BreedingForm';
import BreedingPairsList from './pages/BreedingPairsList';
import ComputationResult from './pages/ComputationResult';
import LoginPopup from './components/LoginPopup';
import TermsPopup from './components/TermsPopup';
import LoginReminder from './components/LoginReminder';
import './App.css';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="app-loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return children;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <div className="app">
      <LoginReminder />
      {user && <TermsPopup />}
      <Navbar />
      <div className="page-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/help" element={<Help />} />
          <Route
            path="/breeding-form"
            element={
              <ProtectedRoute>
                <BreedingForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/breeding-pairs"
            element={
              <ProtectedRoute>
                <BreedingPairsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/computation-result/:id"
            element={
              <ProtectedRoute>
                <ComputationResult />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
      <LoginPopup />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;