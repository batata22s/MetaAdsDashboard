const axios = require('axios');

const META_API_VERSION = 'v21.0';
const META_BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`;

class MetaApiService {
  constructor() {
    this.accessToken = process.env.META_ACCESS_TOKEN;
    this.adAccountId = process.env.META_AD_ACCOUNT_ID;
  }

  getDateRange(datePreset) {
    const now = new Date();
    const presets = {
      today: 1,
      last_3d: 3,
      last_7d: 7,
      last_14d: 14,
      last_28d: 28,
      last_30d: 30,
      last_90d: 90,
    };
    const days = presets[datePreset] || 7;
    const since = new Date(now);
    since.setDate(since.getDate() - days);
    return {
      since: since.toISOString().split('T')[0],
      until: now.toISOString().split('T')[0],
    };
  }

  get insightFields() {
    return [
      'campaign_name',
      'campaign_id',
      'adset_name',
      'adset_id',
      'ad_name',
      'ad_id',
      'impressions',
      'reach',
      'frequency',
      'clicks',
      'unique_clicks',
      'cpc',
      'cpm',
      'ctr',
      'cpp',
      'spend',
      'actions',
      'action_values',
      'conversions',
      'cost_per_action_type',
      'inline_link_clicks',
      'inline_link_click_ctr',
      'inline_post_engagement',
      'social_spend',
      'video_play_actions',
      'video_p25_watched_actions',
      'video_p50_watched_actions',
      'video_p75_watched_actions',
      'video_p100_watched_actions',
      'purchase_roas',
      'website_purchase_roas',
      'date_start',
      'date_stop',
      'objective',
      'optimization_goal',
    ].join(',');
  }

  get campaignFields() {
    return [
      'id',
      'name',
      'status',
      'objective',
      'daily_budget',
      'lifetime_budget',
      'budget_remaining',
      'created_time',
      'updated_time',
      'start_time',
      'stop_time',
      'effective_status',
      'buying_type',
      'special_ad_categories',
    ].join(',');
  }

  async getCampaigns() {
    try {
      const response = await axios.get(
        `${META_BASE_URL}/${this.adAccountId}/campaigns`,
        {
          params: {
            fields: this.campaignFields,
            access_token: this.accessToken,
            limit: 100,
          },
        }
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching campaigns:', error.response?.data || error.message);
      throw error;
    }
  }

  async getAccountInsights(datePreset = 'last_7d', since, until) {
    try {
      const params = {
        fields: this.insightFields,
        access_token: this.accessToken,
        level: 'account',
      };

      if (since && until) {
        params.time_range = JSON.stringify({ since, until });
      } else {
        const range = this.getDateRange(datePreset);
        params.time_range = JSON.stringify(range);
      }

      const response = await axios.get(
        `${META_BASE_URL}/${this.adAccountId}/insights`,
        { params }
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching account insights:', error.response?.data || error.message);
      throw error;
    }
  }

  async getCampaignInsights(datePreset = 'last_7d', since, until) {
    try {
      const params = {
        fields: this.insightFields,
        access_token: this.accessToken,
        level: 'campaign',
        time_increment: 1,
      };

      if (since && until) {
        params.time_range = JSON.stringify({ since, until });
      } else {
        const range = this.getDateRange(datePreset);
        params.time_range = JSON.stringify(range);
      }

      const response = await axios.get(
        `${META_BASE_URL}/${this.adAccountId}/insights`,
        { params }
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching campaign insights:', error.response?.data || error.message);
      throw error;
    }
  }

  async getCampaignInsightsById(campaignId, datePreset = 'last_7d', since, until) {
    try {
      const params = {
        fields: this.insightFields,
        access_token: this.accessToken,
        time_increment: 1,
      };

      if (since && until) {
        params.time_range = JSON.stringify({ since, until });
      } else {
        const range = this.getDateRange(datePreset);
        params.time_range = JSON.stringify(range);
      }

      const response = await axios.get(
        `${META_BASE_URL}/${campaignId}/insights`,
        { params }
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching campaign insights by ID:', error.response?.data || error.message);
      throw error;
    }
  }

  async getAdSets(campaignId) {
    try {
      const params = {
        fields: 'id,name,status,effective_status,daily_budget,lifetime_budget,optimization_goal,billing_event,targeting,created_time',
        access_token: this.accessToken,
        limit: 100,
      };

      const url = campaignId
        ? `${META_BASE_URL}/${campaignId}/adsets`
        : `${META_BASE_URL}/${this.adAccountId}/adsets`;

      const response = await axios.get(url, { params });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching ad sets:', error.response?.data || error.message);
      throw error;
    }
  }

  async getAdSetInsights(adsetId, datePreset = 'last_7d', since, until) {
    try {
      const params = {
        fields: this.insightFields,
        access_token: this.accessToken,
        time_increment: 1,
      };

      if (since && until) {
        params.time_range = JSON.stringify({ since, until });
      } else {
        const range = this.getDateRange(datePreset);
        params.time_range = JSON.stringify(range);
      }

      const response = await axios.get(
        `${META_BASE_URL}/${adsetId}/insights`,
        { params }
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching ad set insights:', error.response?.data || error.message);
      throw error;
    }
  }

  async getAds(adsetId) {
    try {
      const params = {
        fields: 'id,name,status,effective_status,creative,created_time',
        access_token: this.accessToken,
        limit: 100,
      };

      const url = adsetId
        ? `${META_BASE_URL}/${adsetId}/ads`
        : `${META_BASE_URL}/${this.adAccountId}/ads`;

      const response = await axios.get(url, { params });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching ads:', error.response?.data || error.message);
      throw error;
    }
  }

  async getAdInsights(adId, datePreset = 'last_7d', since, until) {
    try {
      const params = {
        fields: this.insightFields,
        access_token: this.accessToken,
        time_increment: 1,
      };

      if (since && until) {
        params.time_range = JSON.stringify({ since, until });
      } else {
        const range = this.getDateRange(datePreset);
        params.time_range = JSON.stringify(range);
      }

      const response = await axios.get(
        `${META_BASE_URL}/${adId}/insights`,
        { params }
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching ad insights:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = new MetaApiService();
