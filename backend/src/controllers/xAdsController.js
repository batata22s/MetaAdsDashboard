const xAdsApi = require('../services/xAdsApi');

class XAdsController {
    async getInsights(req, res) {
        try {
            const { date_preset, since, until } = req.query;

            const rawData = await xAdsApi.getAccountInsights(date_preset, since, until);

            // Default structure matching Meta API expectations for frontend
            const transformed = [{
                spend: '0.00',
                impressions: '0',
                clicks: '0',
                cpc: '0.00',
                ctr: '0.00',
                date_start: since || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                date_stop: until || new Date().toISOString().split('T')[0],
                actions: []
            }];

            if (rawData && rawData.data && rawData.data[0] && rawData.data[0].id_data && rawData.data[0].id_data[0].metrics) {
                const stats = rawData.data[0].id_data[0].metrics;

                // Cost is in micros in X Ads (1.00 = 1000000)
                let spendInCash = 0;
                if (stats.billed_charge_local_micro && stats.billed_charge_local_micro[0]) {
                    spendInCash = stats.billed_charge_local_micro[0] / 1000000;
                }

                const impressions = (stats.impressions && stats.impressions[0]) ? stats.impressions[0] : 0;
                const clicks = (stats.clicks && stats.clicks[0]) ? stats.clicks[0] : 0;
                const engagements = (stats.engagements && stats.engagements[0]) ? stats.engagements[0] : 0;
                const retweets = (stats.retweets && stats.retweets[0]) ? stats.retweets[0] : 0;

                const cpc = clicks > 0 ? (spendInCash / clicks).toFixed(2) : '0.00';
                const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : '0.00';

                transformed[0] = {
                    spend: spendInCash.toFixed(2),
                    impressions: impressions.toString(),
                    clicks: clicks.toString(),
                    cpc: cpc,
                    ctr: ctr,
                    date_start: since || rawData.request.params.start_time.split('T')[0],
                    date_stop: until || rawData.request.params.end_time.split('T')[0],
                    actions: [
                        { action_type: 'post_engagement', value: engagements.toString() },
                        { action_type: 'retweet', value: retweets.toString() }
                    ]
                };
            }

            res.json({ data: transformed });
        } catch (error) {
            console.error('X Ads Controller Error (Insights):', error);
            res.status(500).json({ error: 'Failed to fetch X Ads insights' });
        }
    }

    async getCampaigns(req, res) {
        try {
            const rawCampaigns = await xAdsApi.getCampaigns();

            // Transform Twitter campaigns to look exactly like Facebook campaigns
            const transformed = (rawCampaigns.data || []).map(camp => ({
                id: camp.id,
                name: camp.name,
                status: camp.entity_status === 'PAUSED' ? 'PAUSED' : 'ACTIVE',
                daily_budget: camp.daily_budget_amount_local_micro ? (camp.daily_budget_amount_local_micro / 1000000).toString() : '0.00',
                objective: 'TWITTER_ADS',
                // Default nested values requested by frontend
                insights: {
                    data: [{
                        spend: '0.00',
                        impressions: '0',
                        clicks: '0'
                    }]
                }
            }));

            res.json({ data: transformed });
        } catch (error) {
            console.error('X Ads Controller Error (Campaigns):', error);
            res.status(500).json({ error: 'Failed to fetch X Campaigns' });
        }
    }

    // Similar endpoints for Ads and Ranking placeholders can go here...
}

module.exports = new XAdsController();
