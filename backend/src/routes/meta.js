const express = require('express');
const metaApi = require('../services/metaApi');
const { MOCK_CAMPAIGNS, MOCK_AD_SETS, getMockCampaignInsights, getMockAccountInsights, getDaysFromPreset } = require('../services/mockData');

const router = express.Router();

const isUsingMock = () => !process.env.META_ACCESS_TOKEN || process.env.META_ACCESS_TOKEN === 'your_access_token_here';

// Get all campaigns
router.get('/campaigns', async (req, res) => {
  try {
    if (isUsingMock()) {
      return res.json({ success: true, data: MOCK_CAMPAIGNS, mock: true });
    }
    const campaigns = await metaApi.getCampaigns();
    res.json({ success: true, data: campaigns });
  } catch (error) {
    res.status(500).json({ success: false, error: error.response?.data?.error?.message || error.message });
  }
});

// Get account-level insights
router.get('/account/insights', async (req, res) => {
  try {
    const { date_preset, since, until } = req.query;
    if (isUsingMock()) {
      const days = getDaysFromPreset(date_preset);
      return res.json({ success: true, data: getMockAccountInsights(days), mock: true });
    }
    const insights = await metaApi.getAccountInsights(date_preset, since, until);
    res.json({ success: true, data: insights });
  } catch (error) {
    res.status(500).json({ success: false, error: error.response?.data?.error?.message || error.message });
  }
});

// Get campaign-level insights (all campaigns, daily breakdown)
router.get('/campaigns/insights', async (req, res) => {
  try {
    const { date_preset, since, until } = req.query;
    if (isUsingMock()) {
      const days = getDaysFromPreset(date_preset);
      return res.json({ success: true, data: getMockCampaignInsights(days), mock: true });
    }
    const insights = await metaApi.getCampaignInsights(date_preset, since, until);
    res.json({ success: true, data: insights });
  } catch (error) {
    res.status(500).json({ success: false, error: error.response?.data?.error?.message || error.message });
  }
});

// Get insights for a specific campaign
router.get('/campaigns/:id/insights', async (req, res) => {
  try {
    const { date_preset, since, until } = req.query;
    if (isUsingMock()) {
      const days = getDaysFromPreset(date_preset);
      const allInsights = getMockCampaignInsights(days);
      const filtered = allInsights.filter(i => i.campaign_id === req.params.id);
      return res.json({ success: true, data: filtered, mock: true });
    }
    const insights = await metaApi.getCampaignInsightsById(req.params.id, date_preset, since, until);
    res.json({ success: true, data: insights });
  } catch (error) {
    res.status(500).json({ success: false, error: error.response?.data?.error?.message || error.message });
  }
});

// Get ad sets
router.get('/adsets', async (req, res) => {
  try {
    const { campaign_id } = req.query;
    if (isUsingMock()) {
      const adsets = campaign_id ? (MOCK_AD_SETS[campaign_id] || []) : Object.values(MOCK_AD_SETS).flat();
      return res.json({ success: true, data: adsets, mock: true });
    }
    const adsets = await metaApi.getAdSets(campaign_id);
    res.json({ success: true, data: adsets });
  } catch (error) {
    res.status(500).json({ success: false, error: error.response?.data?.error?.message || error.message });
  }
});

// Get ad set insights
router.get('/adsets/:id/insights', async (req, res) => {
  try {
    const { date_preset, since, until } = req.query;
    if (isUsingMock()) {
      return res.json({ success: true, data: [], mock: true });
    }
    const insights = await metaApi.getAdSetInsights(req.params.id, date_preset, since, until);
    res.json({ success: true, data: insights });
  } catch (error) {
    res.status(500).json({ success: false, error: error.response?.data?.error?.message || error.message });
  }
});

// Get ads
router.get('/ads', async (req, res) => {
  try {
    const { adset_id } = req.query;
    if (isUsingMock()) {
      return res.json({ success: true, data: [], mock: true });
    }
    const ads = await metaApi.getAds(adset_id);
    res.json({ success: true, data: ads });
  } catch (error) {
    res.status(500).json({ success: false, error: error.response?.data?.error?.message || error.message });
  }
});

// Get ad insights
router.get('/ads/:id/insights', async (req, res) => {
  try {
    const { date_preset, since, until } = req.query;
    if (isUsingMock()) {
      return res.json({ success: true, data: [], mock: true });
    }
    const insights = await metaApi.getAdInsights(req.params.id, date_preset, since, until);
    res.json({ success: true, data: insights });
  } catch (error) {
    res.status(500).json({ success: false, error: error.response?.data?.error?.message || error.message });
  }
});

module.exports = router;
