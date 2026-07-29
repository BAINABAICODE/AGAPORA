import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Expo web runs in the PC browser → use localhost.
// Expo Go on a phone → use LAN IP from EXPO_PUBLIC_API_URL.
const API_BASE_URL =
  Platform.OS === 'web'
    ? 'http://127.0.0.1:8000/api'
    : process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.110:8000/api';

let onUnauthorized = null;

export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(['token', 'user']);
      onUnauthorized?.();
    }
    return Promise.reject(error);
  }
);

export default api;
