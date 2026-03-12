const axios = require('axios');
const crypto = require('crypto');
const OAuth = require('oauth-1.0a');

const X_API_VERSION = '12';
const X_BASE_URL = `https://ads-api.twitter.com/${X_API_VERSION}`;

class XAdsApiService {
    constructor() {
        this.adAccountId = process.env.X_AD_ACCOUNT_ID;

        this.oauth = OAuth({
            consumer: {
                key: process.env.X_API_KEY,
                secret: process.env.X_API_KEY_SECRET,
            },
            signature_method: 'HMAC-SHA1',
            hash_function(base_string, key) {
                return crypto
                    .createHmac('sha1', key)
                    .update(base_string)
                    .digest('base64');
            },
        });

        this.token = {
            key: process.env.X_ACCESS_TOKEN,
            secret: process.env.X_ACCESS_TOKEN_SECRET,
        };
    }

    async makeRequest(method, endpoint, params = {}) {
        // Return empty mock if no keys are yet configured
        if (!this.adAccountId || this.adAccountId === 'COLE_SEU_ACCOUNT_ID_AQUI') {
            console.warn("X_AD_ACCOUNT_ID is not configured yet.");
            return { data: [] };
        }

        const url = `${X_BASE_URL}${endpoint}`;

        // Construct query string for URL parameters
        const queryString = new URLSearchParams(params).toString();
        const fullUrl = queryString ? `${url}?${queryString}` : url;

        // For OAuth1.0a, the URL including query parameters MUST be used for the signature
        const request_for_sig = {
            url: fullUrl,
            method: method
        };

        const headers = this.oauth.toHeader(this.oauth.authorize(request_for_sig, this.token));

        try {
            const response = await axios({
                method: method,
                url: fullUrl,
                headers: headers
            });
            return response.data;
        } catch (error) {
            console.error('Error in X Ads API request:', error.response?.data?.errors || error.message);
            // Don't crash local dev if api fails, just return empty data array
            return { data: [] };
        }
    }

    // Get campaigns summary
    async getCampaigns() {
        // Twitter endpoint for campaigns: /accounts/:account_id/campaigns
        const endpoint = `/accounts/${this.adAccountId}/campaigns`;
        const response = await this.makeRequest('GET', endpoint, { count: 1000 });
        return response.data;
    }

    // Get aggregated account performance metrics
    async getAccountInsights(datePreset = 'last_7d', since, until) {
        // X Ads uses /stats/accounts/:account_id
        const endpoint = `/stats/accounts/${this.adAccountId}`;

        const params = {
            entity: 'ACCOUNT',
            metrics: 'billed_charge_local_micro,impressions,engagements,clicks,url_clicks,retweets',
            placement: 'ALL_ON_TWITTER',
        };

        if (since && until) {
            params.start_time = `${since}T00:00:00Z`;
            // X expects end_time but until is inclusive in our UI, so add a day or set to 23:59:59Z
            params.end_time = `${until}T23:59:59Z`;
        } else {
            // Very basic date logic for placeholders if preset used
            const now = new Date();
            const then = new Date();
            then.setDate(now.getDate() - 7);
            params.start_time = then.toISOString();
            params.end_time = now.toISOString();
        }

        const response = await this.makeRequest('GET', endpoint, params);
        return response.data;
    }
}

module.exports = new XAdsApiService();
