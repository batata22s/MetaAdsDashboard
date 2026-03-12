// Mock data for development and demo purposes
// This will be used when META_ACCESS_TOKEN is not configured

function generateDailyData(days) {
  const data = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const spend = (Math.random() * 200 + 50).toFixed(2);
    const impressions = Math.floor(Math.random() * 15000 + 3000);
    const reach = Math.floor(impressions * (0.6 + Math.random() * 0.3));
    const clicks = Math.floor(impressions * (0.01 + Math.random() * 0.04));
    const linkClicks = Math.floor(clicks * 0.7);
    const lpViews = Math.floor(linkClicks * 0.85);
    const purchases = Math.floor(Math.random() * 8 + 1);
    const leads = Math.floor(Math.random() * 12 + 2);

    data.push({
      date_start: dateStr,
      date_stop: dateStr,
      spend,
      impressions: String(impressions),
      reach: String(reach),
      clicks: String(clicks),
      unique_clicks: String(Math.floor(clicks * 0.85)),
      cpc: (Number(spend) / clicks).toFixed(2),
      cpm: (Number(spend) / impressions * 1000).toFixed(2),
      ctr: (clicks / impressions * 100).toFixed(2),
      cpp: (Number(spend) / reach * 1000).toFixed(2),
      frequency: (impressions / reach).toFixed(2),
      inline_link_clicks: String(linkClicks),
      inline_link_click_ctr: (linkClicks / impressions * 100).toFixed(2),
      inline_post_engagement: String(Math.floor(clicks * 1.3)),
      actions: [
        { action_type: 'link_click', value: String(linkClicks) },
        { action_type: 'landing_page_view', value: String(lpViews) },
        { action_type: 'page_engagement', value: String(Math.floor(clicks * 1.2)) },
        { action_type: 'post_engagement', value: String(Math.floor(clicks * 1.1)) },
        { action_type: 'offsite_conversion.fb_pixel_purchase', value: String(purchases) },
        { action_type: 'offsite_conversion.fb_pixel_lead', value: String(leads) },
        { action_type: 'offsite_conversion.fb_pixel_add_to_cart', value: String(Math.floor(purchases * 2.5)) },
        { action_type: 'offsite_conversion.fb_pixel_initiate_checkout', value: String(Math.floor(purchases * 1.8)) },
        { action_type: 'offsite_conversion.fb_pixel_complete_registration', value: String(Math.floor(leads * 0.6)) },
        { action_type: 'video_view', value: String(Math.floor(impressions * 0.15)) },
      ],
      cost_per_action_type: [
        { action_type: 'link_click', value: (Number(spend) / linkClicks).toFixed(2) },
        { action_type: 'landing_page_view', value: (Number(spend) / lpViews).toFixed(2) },
        { action_type: 'offsite_conversion.fb_pixel_purchase', value: (Number(spend) / purchases).toFixed(2) },
        { action_type: 'offsite_conversion.fb_pixel_lead', value: (Number(spend) / leads).toFixed(2) },
      ],
      purchase_roas: [{ action_type: 'omni_purchase', value: (purchases * 45 / Number(spend)).toFixed(2) }],
    });
  }
  return data;
}

const MOCK_CAMPAIGNS = [
  { id: '120201001', name: 'Campanha Principal - Conversões', status: 'ACTIVE', effective_status: 'ACTIVE', objective: 'OUTCOME_SALES', daily_budget: '5000', lifetime_budget: '0', budget_remaining: '3200', buying_type: 'AUCTION', created_time: '2025-12-01T10:00:00-0300', special_ad_categories: [] },
  { id: '120201002', name: 'Retargeting - Visitantes Site', status: 'ACTIVE', effective_status: 'ACTIVE', objective: 'OUTCOME_SALES', daily_budget: '3000', lifetime_budget: '0', budget_remaining: '1800', buying_type: 'AUCTION', created_time: '2025-12-15T14:30:00-0300', special_ad_categories: [] },
  { id: '120201003', name: 'Awareness - Novos Usuários', status: 'ACTIVE', effective_status: 'ACTIVE', objective: 'OUTCOME_AWARENESS', daily_budget: '8000', lifetime_budget: '0', budget_remaining: '5500', buying_type: 'AUCTION', created_time: '2026-01-10T09:00:00-0300', special_ad_categories: [] },
  { id: '120201004', name: 'Tráfego - Blog Posts', status: 'PAUSED', effective_status: 'PAUSED', objective: 'OUTCOME_TRAFFIC', daily_budget: '2000', lifetime_budget: '0', budget_remaining: '2000', buying_type: 'AUCTION', created_time: '2026-01-20T11:00:00-0300', special_ad_categories: [] },
  { id: '120201005', name: 'Leads - Formulário Cadastro', status: 'ACTIVE', effective_status: 'ACTIVE', objective: 'OUTCOME_LEADS', daily_budget: '4000', lifetime_budget: '0', budget_remaining: '2700', buying_type: 'AUCTION', created_time: '2026-02-01T08:00:00-0300', special_ad_categories: [] },
  { id: '120201006', name: 'App Install - Android', status: 'ACTIVE', effective_status: 'ACTIVE', objective: 'OUTCOME_APP_PROMOTION', daily_budget: '6000', lifetime_budget: '0', budget_remaining: '4100', buying_type: 'AUCTION', created_time: '2026-02-10T16:00:00-0300', special_ad_categories: [] },
];

const MOCK_AD_SETS = {
  '120201001': [
    { id: '230301001', name: 'Lookalike 1% - Compradores', status: 'ACTIVE', effective_status: 'ACTIVE', daily_budget: '2500', optimization_goal: 'OFFSITE_CONVERSIONS', billing_event: 'IMPRESSIONS', created_time: '2025-12-01T10:00:00-0300' },
    { id: '230301002', name: 'Interesse - Mercado Financeiro', status: 'ACTIVE', effective_status: 'ACTIVE', daily_budget: '2500', optimization_goal: 'OFFSITE_CONVERSIONS', billing_event: 'IMPRESSIONS', created_time: '2025-12-01T10:00:00-0300' },
  ],
  '120201002': [
    { id: '230302001', name: 'Visitantes 7 dias', status: 'ACTIVE', effective_status: 'ACTIVE', daily_budget: '1500', optimization_goal: 'OFFSITE_CONVERSIONS', billing_event: 'IMPRESSIONS', created_time: '2025-12-15T14:30:00-0300' },
    { id: '230302002', name: 'Visitantes 30 dias', status: 'ACTIVE', effective_status: 'ACTIVE', daily_budget: '1500', optimization_goal: 'OFFSITE_CONVERSIONS', billing_event: 'IMPRESSIONS', created_time: '2025-12-15T14:30:00-0300' },
  ],
  '120201003': [
    { id: '230303001', name: 'Broad - 18-45 Brasil', status: 'ACTIVE', effective_status: 'ACTIVE', daily_budget: '8000', optimization_goal: 'REACH', billing_event: 'IMPRESSIONS', created_time: '2026-01-10T09:00:00-0300' },
  ],
  '120201005': [
    { id: '230305001', name: 'Formulário - Desktop', status: 'ACTIVE', effective_status: 'ACTIVE', daily_budget: '2000', optimization_goal: 'LEAD_GENERATION', billing_event: 'IMPRESSIONS', created_time: '2026-02-01T08:00:00-0300' },
    { id: '230305002', name: 'Formulário - Mobile', status: 'ACTIVE', effective_status: 'ACTIVE', daily_budget: '2000', optimization_goal: 'LEAD_GENERATION', billing_event: 'IMPRESSIONS', created_time: '2026-02-01T08:00:00-0300' },
  ],
};

function getMockCampaignInsights(days) {
  const allInsights = [];
  MOCK_CAMPAIGNS.forEach(campaign => {
    const dailyData = generateDailyData(days);
    dailyData.forEach(day => {
      allInsights.push({
        ...day,
        campaign_id: campaign.id,
        campaign_name: campaign.name,
        objective: campaign.objective,
      });
    });
  });
  return allInsights;
}

function getMockAccountInsights(days) {
  const campaignInsights = getMockCampaignInsights(days);

  const aggregated = campaignInsights.reduce((acc, ins) => {
    acc.spend += Number(ins.spend);
    acc.impressions += Number(ins.impressions);
    acc.reach += Number(ins.reach);
    acc.clicks += Number(ins.clicks);

    ins.actions.forEach(a => {
      const existing = acc.actions.find(x => x.action_type === a.action_type);
      if (existing) existing.value = String(Number(existing.value) + Number(a.value));
      else acc.actions.push({ ...a });
    });

    ins.cost_per_action_type.forEach(a => {
      const existing = acc.cost_per_action_type.find(x => x.action_type === a.action_type);
      if (existing) existing.value = ((Number(existing.value) + Number(a.value)) / 2).toFixed(2);
      else acc.cost_per_action_type.push({ ...a });
    });

    return acc;
  }, { spend: 0, impressions: 0, reach: 0, clicks: 0, actions: [], cost_per_action_type: [] });

  return [{
    spend: aggregated.spend.toFixed(2),
    impressions: String(aggregated.impressions),
    reach: String(aggregated.reach),
    clicks: String(aggregated.clicks),
    unique_clicks: String(Math.floor(aggregated.clicks * 0.85)),
    cpc: (aggregated.spend / aggregated.clicks).toFixed(2),
    cpm: (aggregated.spend / aggregated.impressions * 1000).toFixed(2),
    ctr: (aggregated.clicks / aggregated.impressions * 100).toFixed(2),
    frequency: (aggregated.impressions / aggregated.reach).toFixed(2),
    actions: aggregated.actions,
    cost_per_action_type: aggregated.cost_per_action_type,
    purchase_roas: [{ action_type: 'omni_purchase', value: '2.85' }],
  }];
}

function getDaysFromPreset(preset) {
  const map = {
    today: 1,
    yesterday: 1,
    last_3d: 3,
    last_7d: 7,
    last_14d: 14,
    last_15d: 15,
    last_28d: 28,
    last_30d: 30,
    last_90d: 90
  };
  return map[preset] || 7;
}

module.exports = {
  MOCK_CAMPAIGNS,
  MOCK_AD_SETS,
  getMockCampaignInsights,
  getMockAccountInsights,
  getDaysFromPreset,
};
