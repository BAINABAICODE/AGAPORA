import api from './axios';

export const speciesService = {
  getAll: async () => {
    try {
      const response = await api.get('/species');
      return response.data;
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.message,
      };
    }
  },

  getByKey: async (key) => {
    try {
      const response = await api.get(`/species/${key}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message,
      };
    }
  },
};
