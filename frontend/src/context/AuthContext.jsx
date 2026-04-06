// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (token && storedUser) {
            setUser(JSON.parse(storedUser));
            // ✅ Set default Authorization header
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/login', { email, password });
            const { token, user } = response.data;
            
            // Store token and user
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            
            // ✅ Set default Authorization header for all future requests
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            setUser(user);
            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            const message = error.response?.data?.message || 'Login failed';
            return { success: false, error: message };
        }
    };

    const register = async (name, email, password) => {
        try {
            const response = await api.post('/register', { name, email, password });
            const { token, user } = response.data;
            
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            setUser(user);
            return { success: true };
        } catch (error) {
            console.error('Register error:', error);
            const message = error.response?.data?.message || 'Registration failed';
            return { success: false, error: message };
        }
    };

    const logout = async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error('Logout error:', error);
        }
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
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
        <AuthContext.Provider value={{ user, login, register, logout, forgotPassword, loading }}>
            {children}
        </AuthContext.Provider>
    );
};