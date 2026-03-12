export const METRIC_CATEGORIES = {
    STANDARD: 'PADRÃO',
    ENGAGEMENT: 'ENGAJAMENTO',
    CONVERSIONS: 'PIXEL / CONVERSÕES',
    VALUES_ROAS: 'VALORES/ROAS'
};

export function getBaseActionType(action_type) {
    if (!action_type) return '';
    return action_type
        .replace(/^offsite_conversion\.fb_pixel_/, '')
        .replace(/^omni_/, '')
        .replace(/^onsite_web_/, '')
        .replace(/^onsite_conversion\./, '');
}

export const getActionValue = (insights, baseType) => {
    if (!insights || !insights.actions) return 0;
    let maxVal = 0;
    insights.actions.forEach(a => {
        if (getBaseActionType(a.action_type) === baseType || a.action_type === baseType) {
            maxVal = Math.max(maxVal, Number(a.value || 0));
        }
    });
    return maxVal;
};

export const getActionCost = (insights, baseType) => {
    if (!insights || !insights.cost_per_action_type) return 0;
    let minCost = Infinity;
    insights.cost_per_action_type.forEach(a => {
        if (getBaseActionType(a.action_type) === baseType || a.action_type === baseType) {
            const val = Number(a.value || 0);
            if (val > 0) minCost = Math.min(minCost, val);
        }
    });
    return minCost === Infinity ? 0 : minCost;
};

export const getActionValueSum = (insights, baseType) => {
    if (!insights || !insights.action_values) return 0;
    let maxVal = 0;
    insights.action_values.forEach(a => {
        if (getBaseActionType(a.action_type) === baseType || a.action_type === baseType) {
            maxVal = Math.max(maxVal, Number(a.value || 0));
        }
    });
    return maxVal;
};

export const getOutboundClicks = (insights) => {
    if (!insights || !insights.outbound_clicks) return 0;
    let maxVal = 0;
    insights.outbound_clicks.forEach(a => {
        maxVal = Math.max(maxVal, Number(a.value || 0));
    });
    return maxVal;
}

export const AVAILABLE_METRICS = [
    // PADRÃO
    { id: 'spend', label: 'Investimento', category: METRIC_CATEGORIES.STANDARD, format: 'currency', defaultActive: true, getValue: (data) => Number(data?.spend || 0) },
    { id: 'impressions', label: 'Impressões', category: METRIC_CATEGORIES.STANDARD, format: 'number', defaultActive: true, getValue: (data) => Number(data?.impressions || 0) },
    { id: 'clicks', label: 'Cliques (Todos)', category: METRIC_CATEGORIES.STANDARD, format: 'number', defaultActive: true, getValue: (data) => Number(data?.clicks || 0) },
    { id: 'ctr', label: 'CTR (Todos)', category: METRIC_CATEGORIES.STANDARD, format: 'percentage', defaultActive: true, getValue: (data) => data?.impressions > 0 ? (Number(data.clicks || 0) / Number(data.impressions) * 100) : 0 },
    { id: 'cpc', label: 'CPC (Todos)', category: METRIC_CATEGORIES.STANDARD, format: 'currency', defaultActive: true, getValue: (data) => data?.clicks > 0 ? (Number(data.spend || 0) / Number(data.clicks)) : 0 },
    { id: 'cpm', label: 'CPM', category: METRIC_CATEGORIES.STANDARD, format: 'currency', defaultActive: true, getValue: (data) => data?.impressions > 0 ? (Number(data.spend || 0) / Number(data.impressions) * 1000) : 0 },
    { id: 'reach', label: 'Alcance', category: METRIC_CATEGORIES.STANDARD, format: 'number', defaultActive: true, getValue: (data) => Number(data?.reach || 0) },
    { id: 'frequency', label: 'Frequência', category: METRIC_CATEGORIES.STANDARD, format: 'decimal', defaultActive: true, getValue: (data) => Number(data?.frequency || 0) },

    // ENGAJAMENTO
    { id: 'link_clicks', label: 'Cliques no Link', category: METRIC_CATEGORIES.ENGAGEMENT, format: 'number', defaultActive: false, getValue: (data) => getActionValue(data, 'link_click') },
    { id: 'cpc_link', label: 'CPC no Link', category: METRIC_CATEGORIES.ENGAGEMENT, format: 'currency', defaultActive: false, getValue: (data) => getActionCost(data, 'link_click') },
    { id: 'ctr_link', label: 'CTR no Link', category: METRIC_CATEGORIES.ENGAGEMENT, format: 'percentage', defaultActive: false, getValue: (data) => data?.impressions > 0 ? (getActionValue(data, 'link_click') / Number(data.impressions) * 100) : 0 },
    { id: 'post_engagement', label: 'Engajamento no Post', category: METRIC_CATEGORIES.ENGAGEMENT, format: 'number', defaultActive: false, getValue: (data) => getActionValue(data, 'post_engagement') },
    { id: 'page_engagement', label: 'Engajamento na Página', category: METRIC_CATEGORIES.ENGAGEMENT, format: 'number', defaultActive: false, getValue: (data) => getActionValue(data, 'page_engagement') },
    { id: 'landing_page_view', label: 'Visitas pág. destino', category: METRIC_CATEGORIES.ENGAGEMENT, format: 'number', defaultActive: false, getValue: (data) => getActionValue(data, 'landing_page_view') },
    { id: 'outbound_clicks', label: 'Cliques de saída', category: METRIC_CATEGORIES.ENGAGEMENT, format: 'number', defaultActive: false, getValue: (data) => getOutboundClicks(data) },

    // PIXEL / CONVERSÕES
    { id: 'purchases', label: 'Compras', category: METRIC_CATEGORIES.CONVERSIONS, format: 'number', defaultActive: false, getValue: (data) => getActionValue(data, 'purchase') },
    { id: 'leads', label: 'Cadastros (Leads)', category: METRIC_CATEGORIES.CONVERSIONS, format: 'number', defaultActive: false, getValue: (data) => getActionValue(data, 'lead') },
    { id: 'initiate_checkout', label: 'Checkouts Iniciados', category: METRIC_CATEGORIES.CONVERSIONS, format: 'number', defaultActive: false, getValue: (data) => getActionValue(data, 'initiate_checkout') },
    { id: 'add_to_cart', label: 'Adições ao Carrinho', category: METRIC_CATEGORIES.CONVERSIONS, format: 'number', defaultActive: false, getValue: (data) => getActionValue(data, 'add_to_cart') },
    { id: 'add_payment_info', label: 'Info Pgto. Adicionada', category: METRIC_CATEGORIES.CONVERSIONS, format: 'number', defaultActive: false, getValue: (data) => getActionValue(data, 'add_payment_info') },
    { id: 'complete_registration', label: 'Registros Completos', category: METRIC_CATEGORIES.CONVERSIONS, format: 'number', defaultActive: false, getValue: (data) => getActionValue(data, 'complete_registration') },

    // VALORES/ROAS
    { id: 'purchase_value', label: 'Valor de Compras', category: METRIC_CATEGORIES.VALUES_ROAS, format: 'currency', defaultActive: false, getValue: (data) => getActionValueSum(data, 'purchase') },
    {
        id: 'roas', label: 'ROAS', category: METRIC_CATEGORIES.VALUES_ROAS, format: 'decimal', defaultActive: false, getValue: (data) => {
            const spend = Number(data?.spend || 0);
            const rev = getActionValueSum(data, 'purchase');
            return spend > 0 ? (rev / spend) : 0;
        }
    },
    { id: 'cpa_purchase', label: 'Custo por Compra', category: METRIC_CATEGORIES.VALUES_ROAS, format: 'currency', defaultActive: false, getValue: (data) => getActionCost(data, 'purchase') },
    { id: 'cpa_lead', label: 'Custo por Lead', category: METRIC_CATEGORIES.VALUES_ROAS, format: 'currency', defaultActive: false, getValue: (data) => getActionCost(data, 'lead') }
];

export const getDefaultMetrics = () => {
    // Retorna string baseada no array original pra n perder ordem
    return AVAILABLE_METRICS.filter(m => m.defaultActive).map(m => m.id);
}
