const express = require('express');
const metaApi = require('../services/metaApi');
const performanceAnalyzer = require('../services/performanceAnalyzer');
const { getCache, setCache } = require('../services/cache');
const { MOCK_CAMPAIGNS, MOCK_AD_SETS, getMockCampaignInsights, getMockAccountInsights, getDaysFromPreset } = require('../services/mockData');

const router = express.Router();

const isUsingMock = () => !process.env.META_ACCESS_TOKEN || process.env.META_ACCESS_TOKEN === 'your_access_token_here';

// Get all campaigns
router.get('/campaigns', async (req, res) => {
  try {
    if (isUsingMock()) {
      return res.json({ success: true, data: MOCK_CAMPAIGNS, mock: true });
    }

    const cacheKey = 'campaigns_all';
    const cachedData = getCache(cacheKey);
    if (cachedData) {
      return res.json({ success: true, data: cachedData, cached: true });
    }

    const campaigns = await metaApi.getCampaigns();

    // Also fetch lifetime insights for these campaigns so the frontend can use them as a fallback
    // when the current date preset has no data for paused/old campaigns
    const lifetimeInsights = await metaApi.getCampaignInsights('maximum');

    // Attach lifetime stats to campaigns
    const enriched = campaigns.map(c => {
      const lifetime = lifetimeInsights.find(i => i.campaign_id === c.id);
      return { ...c, lifetime_insights: lifetime || null };
    });

    setCache(cacheKey, enriched, 5); // 5 minutes cache
    res.json({ success: true, data: enriched });
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

    const cacheKey = `account_insights_${date_preset}_${since || ''}_${until || ''}`;
    const cachedData = getCache(cacheKey);
    if (cachedData) {
      return res.json({ success: true, data: cachedData, cached: true });
    }

    const insights = await metaApi.getAccountInsights(date_preset, since, until);
    setCache(cacheKey, insights, 5);
    res.json({ success: true, data: insights });
  } catch (error) {
    res.status(500).json({ success: false, error: error.response?.data?.error?.message || error.message });
  }
});

// Get daily account-level insights
router.get('/account/insights/daily', async (req, res) => {
  try {
    const { date_preset, since, until } = req.query;
    if (isUsingMock()) {
      const days = getDaysFromPreset(date_preset);
      return res.json({ success: true, data: getMockAccountInsights(days), mock: true });
    }

    const cacheKey = `account_daily_${date_preset}_${since || ''}_${until || ''}`;
    const cachedData = getCache(cacheKey);
    if (cachedData) {
      return res.json({ success: true, data: cachedData, cached: true });
    }

    const insights = await metaApi.getAccountInsightsDaily(date_preset, since, until);
    setCache(cacheKey, insights, 5);
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

    const cacheKey = `campaign_insights_${date_preset}_${since || ''}_${until || ''}`;
    const cachedData = getCache(cacheKey);
    if (cachedData) {
      return res.json({ success: true, data: cachedData, cached: true });
    }

    const insights = await metaApi.getCampaignInsights(date_preset, since, until);
    setCache(cacheKey, insights, 5);
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

// Get all ad insights bulk
router.get('/ads/insights', async (req, res) => {
  try {
    const { date_preset, since, until } = req.query;
    if (isUsingMock()) {
      return res.json({ success: true, data: [], mock: true });
    }

    const cacheKey = `ads_insights_bulk_${date_preset}_${since || ''}_${until || ''}`;
    const cachedData = getCache(cacheKey);
    if (cachedData) {
      return res.json({ success: true, data: cachedData, cached: true });
    }

    const insights = await metaApi.getAllAdInsights(date_preset, since, until);
    setCache(cacheKey, insights, 5);
    res.json({ success: true, data: insights });
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

// Get ad performance analysis
router.get('/ads/performance', async (req, res) => {
  try {
    const { date_preset = 'last_30d', since, until } = req.query;

    if (isUsingMock()) {
      return res.json({ success: true, data: { averages: null, results: {} }, mock: true });
    }

    const cacheKey = `ads_performance_${date_preset}_${since || ''}_${until || ''}`;
    const cachedData = getCache(cacheKey);
    if (cachedData) {
      return res.json({ success: true, data: cachedData, cached: true });
    }

    // Fetch insights for all ads with a single bulk request
    const allInsights = await metaApi.getAllAdInsights(date_preset, since, until);

    // Group them into the insightsMap
    const insightsMap = {};
    allInsights.forEach(ins => {
      insightsMap[ins.ad_id] = ins;
    });

    // Run analysis
    const analysis = performanceAnalyzer.analyzeAll(insightsMap);

    // Cache for 60 minutes
    setCache(cacheKey, analysis, 60);

    res.json({ success: true, data: analysis });
  } catch (error) {
    console.error('Error analyzing performance:', error.response?.data || error.message);
    res.status(500).json({ success: false, error: error.response?.data?.error?.message || error.message });
  }
});

// Get account info (balance, spend, etc.)
router.get('/account/info', async (req, res) => {
  try {
    if (isUsingMock()) {
      return res.json({ success: true, data: { name: 'Conta Demo', balance: '0', amount_spent: '0', currency: 'BRL' }, mock: true });
    }

    const cacheKey = 'account_info';
    const cachedData = getCache(cacheKey);
    if (cachedData) {
      return res.json({ success: true, data: cachedData, cached: true });
    }

    const info = await metaApi.getAccountInfo();
    setCache(cacheKey, info, 30);
    res.json({ success: true, data: info });
  } catch (error) {
    res.status(500).json({ success: false, error: error.response?.data?.error?.message || error.message });
  }
});

module.exports = router;
