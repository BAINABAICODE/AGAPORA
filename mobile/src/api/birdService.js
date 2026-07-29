import api from './axios';

export const birdService = {
  list: async (params = {}) => {
    const response = await api.get('/birds', { params });
    return response.data;
  },
  create: async (payload) => {
    const response = await api.post('/birds', payload);
    return response.data;
  },
  update: async (id, payload) => {
    const response = await api.put(`/birds/${id}`, payload);
    return response.data;
  },
  remove: async (id) => {
    const response = await api.delete(`/birds/${id}`);
    return response.data;
  },
};

export const birdToParentFields = (bird) => ({
  bird_id: bird.bird_id || '',
  name: bird.name || '',
  species: bird.species || '',
  sex: bird.sex || '',
  age: bird.age != null ? String(bird.age) : '',
  base_color: bird.base_color || '',
  visual_mutations: bird.visual_mutations || [],
  split_genes: bird.split_genes || [],
  genetic_data: bird.genetic_data || {},
  grandparent_data: bird.grandparent_data || {},
});

export const parentFieldsToBirdPayload = (form) => ({
  bird_id: form.bird_id || null,
  name: form.name || form.bird_id || null,
  species: form.species,
  sex: form.sex,
  age: form.age ? Number(form.age) : null,
  base_color: form.base_color,
  visual_mutations: form.visual_mutations || [],
  split_genes: form.split_genes || [],
  genetic_data: form.genetic_data || {},
  grandparent_data: form.grandparent_data || {},
  status: form.status || 'active',
});
