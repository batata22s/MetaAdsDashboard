import axios from 'axios';

const api = axios.create({
  baseURL: '/api/meta',
});

export const getCampaigns = () => api.get('/campaigns');
export const getAccountInsights = (params) => api.get('/account/insights', { params });
export const getCampaignInsights = (params) => api.get('/campaigns/insights', { params });
export const getCampaignInsightsById = (id, params) => api.get(`/campaigns/${id}/insights`, { params });
export const getAdSets = (params) => api.get('/adsets', { params });
export const getAdSetInsights = (id, params) => api.get(`/adsets/${id}/insights`, { params });
export const getAds = (params) => api.get('/ads', { params });
export const getAdInsights = (id, params) => api.get(`/ads/${id}/insights`, { params });

export default api;
