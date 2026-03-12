const axios = require('axios');

const META_API_VERSION = 'v21.0';
const META_BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`;

class MetaApiService {
  constructor() {
    this.accessToken = process.env.META_ACCESS_TOKEN;
    this.adAccountId = process.env.META_AD_ACCOUNT_ID;
  }

  getDateRange(datePreset) {
    if (!datePreset || datePreset === 'maximum') return null;

    const fmt = (d) => new Intl.DateTimeFormat('fr-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);

    // today/yesterday: use Meta's native presets (respects the ad account timezone)
    // This matches exactly how the Meta Ads Manager works
    if (datePreset === 'today' || datePreset === 'yesterday') {
      return null;
    }

    // Para todos os outros presets "last_Xd", calculamos manualmente 
    // para garantir que a Meta considere o dia de hoje também.
    if (datePreset.startsWith('last_') && datePreset.endsWith('d')) {
      let days = parseInt(datePreset.replace('last_', '').replace('d', ''), 10);
      days = days - 1;

      const now = new Date();
      const untilDate = fmt(now);

      now.setDate(now.getDate() - days);
      const sinceDate = fmt(now);

      return { since: sinceDate, until: untilDate };
    }

    return null;
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
            limit: 1000,
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
        limit: 1000,
      };

      if (since && until) {
        params.time_range = JSON.stringify({ since, until });
      } else {
        const range = this.getDateRange(datePreset);
        if (range) {
          params.time_range = JSON.stringify(range);
        } else {
          params.date_preset = datePreset;
        }
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

  async getAccountInsightsDaily(datePreset = 'last_7d', since, until) {
    try {
      const params = {
        fields: this.insightFields,
        access_token: this.accessToken,
        level: 'account',
        time_increment: 1,
        limit: 1000,
      };

      if (since && until) {
        params.time_range = JSON.stringify({ since, until });
      } else {
        const range = this.getDateRange(datePreset);
        if (range) {
          params.time_range = JSON.stringify(range);
        } else {
          params.date_preset = datePreset;
        }
      }

      const response = await axios.get(
        `${META_BASE_URL}/${this.adAccountId}/insights`,
        { params }
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching daily account insights:', error.response?.data || error.message);
      throw error;
    }
  }

  async getCampaignInsights(datePreset = 'last_7d', since, until) {
    try {
      const params = {
        fields: this.insightFields,
        access_token: this.accessToken,
        level: 'campaign',
        limit: 1000,
      };

      if (since && until) {
        params.time_range = JSON.stringify({ since, until });
      } else {
        const range = this.getDateRange(datePreset);
        if (range) {
          params.time_range = JSON.stringify(range);
        } else {
          params.date_preset = datePreset;
        }
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
        limit: 1000,
      };

      if (since && until) {
        params.time_range = JSON.stringify({ since, until });
      } else {
        const range = this.getDateRange(datePreset);
        if (range) {
          params.time_range = JSON.stringify(range);
        } else {
          params.date_preset = datePreset;
        }
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
        limit: 1000,
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
        limit: 1000,
      };

      if (since && until) {
        params.time_range = JSON.stringify({ since, until });
      } else {
        const range = this.getDateRange(datePreset);
        if (range) {
          params.time_range = JSON.stringify(range);
        } else {
          params.date_preset = datePreset;
        }
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
        fields: 'id,name,status,effective_status,creative{name,body,image_url,thumbnail_url,video_id},created_time',
        access_token: this.accessToken,
        limit: 1000,
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

  async getAllAdInsights(datePreset = 'last_7d', since, until) {
    try {
      const params = {
        fields: this.insightFields,
        access_token: this.accessToken,
        level: 'ad',
        limit: 1000,
      };

      if (since && until) {
        params.time_range = JSON.stringify({ since, until });
      } else {
        const range = this.getDateRange(datePreset);
        if (range) {
          params.time_range = JSON.stringify(range);
        } else {
          params.date_preset = datePreset;
        }
      }

      const response = await axios.get(
        `${META_BASE_URL}/${this.adAccountId}/insights`,
        { params }
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching all ad insights:', error.response?.data || error.message);
      throw error;
    }
  }

  async getAdInsights(adId, datePreset = 'last_7d', since, until) {
    try {
      const params = {
        fields: this.insightFields,
        access_token: this.accessToken,
        time_increment: 1,
        limit: 1000,
      };

      if (since && until) {
        params.time_range = JSON.stringify({ since, until });
      } else {
        const range = this.getDateRange(datePreset);
        if (range) {
          params.time_range = JSON.stringify(range);
        } else {
          params.date_preset = datePreset;
        }
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

  async getAccountInfo() {
    try {
      const response = await axios.get(
        `${META_BASE_URL}/${this.adAccountId}`,
        {
          params: {
            fields: 'name,account_id,balance,amount_spent,currency,account_status,spend_cap,funding_source_details',
            access_token: this.accessToken,
          },
        }
      );

      const data = response.data;

      // Also try to get the prepaid fund amount from the fund endpoint
      try {
        const fundRes = await axios.get(
          `${META_BASE_URL}/${this.adAccountId}/adfunds`,
          {
            params: {
              fields: 'amount,funding_type',
              access_token: this.accessToken,
            },
          }
        );
        data.funds = fundRes.data?.data || [];
      } catch (e) {
        // funds endpoint may not be available for all account types
        data.funds = [];
      }

      return data;
    } catch (error) {
      console.error('Error fetching account info:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = new MetaApiService();
