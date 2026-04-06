// frontend/src/api/speciesService.js
import axios from './axios';

export const speciesService = {
    getAll: async () => {
        try {
            const response = await axios.get('/species');
            console.log('API Response:', response.data);
            return response.data;
        } catch (error) {
            console.error('API Error:', error);
            return {
                success: false,
                data: [],
                message: error.message
            };
        }
    },
    
    getByKey: async (key) => {
        try {
            const response = await axios.get(`/species/${key}`);
            return response.data;
        } catch (error) {
            console.error('API Error:', error);
            return {
                success: false,
                data: null,
                message: error.message
            };
        }
    }
};