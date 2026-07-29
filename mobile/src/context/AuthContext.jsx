import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { setUnauthorizedHandler } from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');

  const openLogin = useCallback(() => {
    setAuthModalMode('login');
    setAuthModalVisible(true);
  }, []);

  const openSignup = useCallback(() => {
    setAuthModalMode('signup');
    setAuthModalVisible(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalVisible(false);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      openLogin();
    });

    const restore = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const storedUser = await AsyncStorage.getItem('user');
        if (token && storedUser) {
          setUser(JSON.parse(storedUser));
          api.defaults.headers.common.Authorization = `Bearer ${token}`;
        }
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, [openLogin]);

  const login = async (email, password) => {
    try {
      const response = await api.post('/login', { email, password });
      const { token, user: nextUser } = response.data;
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(nextUser));
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      setUser(nextUser);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      return { success: false, error: message };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await api.post('/register', { name, email, password });
      const { token, user: nextUser } = response.data;
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(nextUser));
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      setUser(nextUser);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (_) {
      // ignore
    }
    await AsyncStorage.multiRemove(['token', 'user']);
    delete api.defaults.headers.common.Authorization;
    setUser(null);
  };

  const forgotPassword = async (email) => {
    try {
      await api.post('/forgot-password', { email });
      return { success: true, message: 'Reset link sent to your email' };
    } catch (error) {
      const message = error.response?.data?.message || 'Request failed';
      return { success: false, error: message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        forgotPassword,
        authModalVisible,
        authModalMode,
        setAuthModalMode,
        openLogin,
        openSignup,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
