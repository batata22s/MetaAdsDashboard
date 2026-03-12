import axios from 'axios';

const api = axios.create({
  baseURL: '/api/meta',
});

export const xApi = axios.create({
  baseURL: '/api/x',
});

// Meta Ads API Methods
export const getCampaigns = () => api.get('/campaigns');
export const getAccountInsights = (params) => api.get('/account/insights', { params });
export const getAccountInsightsDaily = (params) => api.get('/account/insights/daily', { params });
export const getCampaignInsights = (params) => api.get('/campaigns/insights', { params });
export const getCampaignInsightsById = (id, params) => api.get(`/campaigns/${id}/insights`, { params });
export const getAdSets = (params) => api.get('/adsets', { params });
export const getAdSetInsights = (id, params) => api.get(`/adsets/${id}/insights`, { params });
export const getAds = (params) => api.get('/ads', { params });
export const getAdsInsightsBulk = (params) => api.get('/ads/insights', { params });
export const getAdInsights = (id, params) => api.get(`/ads/${id}/insights`, { params });
export const getAdPerformance = (params) => api.get('/ads/performance', { params });
export const getAccountInfo = () => api.get('/account/info');

// X (Twitter) Ads API Methods
export const getXCampaigns = () => xApi.get('/campaigns');
export const getXInsights = (params) => xApi.get('/insights', { params });

export default api;
