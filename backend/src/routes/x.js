const express = require('express');
const router = express.Router();
const xAdsController = require('../controllers/xAdsController');

// X Ads Insights Endpoint
router.get('/insights', async (req, res) => {
    await xAdsController.getInsights(req, res);
});

// X Ads Campaigns Endpoint
router.get('/campaigns', async (req, res) => {
    await xAdsController.getCampaigns(req, res);
});

module.exports = router;
