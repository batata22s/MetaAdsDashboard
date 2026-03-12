import { useState, useEffect, useCallback } from 'react';
import { FiDollarSign, FiEye, FiMousePointer, FiPercent, FiTarget, FiTrendingUp, FiActivity, FiUsers, FiChevronDown, FiChevronUp, FiDownload, FiSettings } from 'react-icons/fi';
import KpiCard from '../components/KpiCard';
import DateFilter from '../components/DateFilter';
import AdTableDashboard from '../components/AdTableDashboard';
import { SpendLineChart, ImpressionsClicksChart, CampaignComparisonChart, ActionsDonutChart } from '../components/Charts';
import { getCampaigns, getAccountInsights, getAccountInsightsDaily, getCampaignInsights, getAccountInfo, getAds, getAdPerformance, getAdsInsightsBulk } from '../services/api';
import pdfService from '../services/pdfService';
import MetricsModal from '../components/MetricsModal';
import { AVAILABLE_METRICS, getDefaultMetrics } from '../utils/metricsDefinitions';

const EVENT_NAMES = {
  'page_engagement': 'Engajamento na Página',
  'post_engagement': 'Engajamento no Post',
  'link_click': 'Cliques no Link',
  'post_reaction': 'Reações no Post',
  'post_interaction_cross': 'Interações Cruzadas',
  'landing_page_view': 'Visualizações da Landing Page',
  'omni_landing_page_view': 'Visualizações da Landing (Omni)',
  'comment': 'Comentários',
  'post': 'Publicações',
  'like': 'Curtidas',
  'onsite_conversion.post_save': 'Salvamentos de Post',
  'onsite_conversion.post_net_like': 'Curtidas Líquidas',
  'onsite_conversion.post_net_save': 'Salvamentos Líquidos',
  'onsite_conversion.post_unlike': 'Descurtidas',
  'offsite_conversion.fb_pixel_complete_registration': 'Registros Completos (Pixel)',
  'complete_registration': 'Registros Completos',
  'omni_complete_registration': 'Registros Completos (Omni)',
  'offsite_conversion.fb_pixel_initiate_checkout': 'Checkouts Iniciados (Pixel)',
  'initiate_checkout': 'Checkouts Iniciados',
  'omni_initiated_checkout': 'Checkouts Iniciados (Omni)',
  'onsite_web_initiate_checkout': 'Checkouts Web',
  'offsite_conversion.fb_pixel_add_payment_info': 'Info Pagamento Adicionada (Pixel)',
  'add_payment_info': 'Info Pagamento Adicionada',
  'onsite_web_lead': 'Leads Web',
  'lead': 'Leads',
  'offsite_conversion.fb_pixel_lead': 'Leads (Pixel)',
  'purchase': 'Compras',
  'omni_purchase': 'Compras (Omni)',
  'onsite_web_purchase': 'Compras Web',
  'offsite_conversion.fb_pixel_purchase': 'Compras (Pixel)',
  'onsite_web_app_purchase': 'Compras via App',
  'web_app_in_store_purchase': 'Compras Loja via App',
  'web_in_store_purchase': 'Compras em Loja',
  'onsite_conversion.total_messaging_connection': 'Conexões via Mensagem',
  'onsite_conversion.messaging_conversation_started_7d': 'Conversas Iniciadas (7d)',
  'onsite_conversion.messaging_first_reply': 'Primeiras Respostas',
  'onsite_conversion.messaging_conversation_replied_7d': 'Conversas Respondidas (7d)',
  'onsite_conversion.messaging_user_depth_2_message_send': 'Mensagens Aprofundadas',
  'offsite_conversion.custom': 'Conversões Personalizadas',
  'social_spend': 'Gasto Social',
  'onsite_conversion.post_unsave': 'Posts Dessalvos',
  'onsite_conversion.messaging_conversation_replied_2d': 'Conversas Respondidas (2d)',
};

function getBaseActionType(action_type) {
  if (!action_type) return '';
  return action_type
    .replace(/^offsite_conversion\.fb_pixel_/, '')
    .replace(/^omni_/, '')
    .replace(/^onsite_web_/, '')
    .replace(/^onsite_conversion\./, '');
}

function formatEventName(raw) {
  if (EVENT_NAMES[raw]) return EVENT_NAMES[raw];
  return raw
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function formatCurrency(num) {
  const n = Number(num);
  if (isNaN(n)) return 'R$ 0,00';
  return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatNumber(num) {
  const n = Number(num);
  if (isNaN(n)) return '0';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toLocaleString('pt-BR');
}

function Dashboard() {
  const [datePreset, setDatePreset] = useState('last_7d');
  const [campaigns, setCampaigns] = useState([]);
  const [accountInsights, setAccountInsights] = useState(null);
  const [accountInsightsDaily, setAccountInsightsDaily] = useState([]);
  const [campaignInsights, setCampaignInsights] = useState([]);
  const [ads, setAds] = useState([]);
  const [adsPerformance, setAdsPerformance] = useState([]);
  const [adsInsights, setAdsInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [accountInfo, setAccountInfo] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isMetricsModalOpen, setIsMetricsModalOpen] = useState(false);
  const [selectedMetricIds, setSelectedMetricIds] = useState(() => {
    const saved = localStorage.getItem('triadmarkets_dashboard_metrics');
    return saved ? JSON.parse(saved) : getDefaultMetrics();
  });

  const handleSaveMetrics = (newMetrics) => {
    setSelectedMetricIds(newMetrics);
    localStorage.setItem('triadmarkets_dashboard_metrics', JSON.stringify(newMetrics));
  };

  const activeMetrics = selectedMetricIds
    .map(id => AVAILABLE_METRICS.find(m => m.id === id))
    .filter(Boolean);

  const METRIC_COLORS = ['blue', 'cyan', 'green', 'purple', 'warm', 'red', 'pink'];

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      const fileName = `Triadmarkets Dashboard - Visão Geral - ${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`;
      await pdfService.generate('dashboard-content', fileName);
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const presetValue = typeof datePreset === 'object' ? datePreset.preset : datePreset;
      const sinceValue = typeof datePreset === 'object' ? datePreset.since : undefined;
      const untilValue = typeof datePreset === 'object' ? datePreset.until : undefined;

      const [campaignsRes, accountRes, accountDailyRes, insightsRes, adsRes, adsPerfRes, adsInsightsBulkRes] = await Promise.all([
        getCampaigns(),
        getAccountInsights({ date_preset: presetValue, since: sinceValue, until: untilValue }),
        getAccountInsightsDaily({ date_preset: presetValue, since: sinceValue, until: untilValue }),
        getCampaignInsights({ date_preset: presetValue, since: sinceValue, until: untilValue }),
        getAds(),
        getAdPerformance({ date_preset: presetValue, since: sinceValue, until: untilValue }),
        getAdsInsightsBulk({ date_preset: presetValue, since: sinceValue, until: untilValue }),
      ]);

      setCampaigns(campaignsRes.data.data || []);
      setAccountInsights(accountRes.data.data?.[0] || null);
      setAccountInsightsDaily(accountDailyRes.data.data || []);
      setCampaignInsights(insightsRes.data.data || []);
      setAds(adsRes.data.data || []);
      setAdsPerformance(adsPerfRes.data.data || []);
      setAdsInsights(adsInsightsBulkRes.data.data || []);

      // Fetch account info (balance) separately to not block the main load
      try {
        const infoRes = await getAccountInfo();
        setAccountInfo(infoRes.data.data || null);
      } catch (e) {
        console.warn('Could not fetch account info:', e.message);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.error || err.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [datePreset]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Process daily data for charts
  const getDaysFromPreset = (preset) => {
    const map = { today: 1, yesterday: 1, last_3d: 3, last_7d: 7, last_14d: 14, last_15d: 15, last_28d: 28, last_30d: 30, last_90d: 90 };
    return map[preset] || 7;
  };

  const presetValue = typeof datePreset === 'object' ? datePreset.preset : datePreset;
  const sinceValue = typeof datePreset === 'object' ? datePreset.since : undefined;
  const untilValue = typeof datePreset === 'object' ? datePreset.until : undefined;

  const getRecentDates = (days, since, until) => {
    const dates = [];
    // Helper: format Date as MM-DD using local timezone (not UTC!)
    const fmtLocal = (d) => {
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${mm}-${dd}`;
    };

    if (since && until) {
      const start = new Date(since + 'T12:00:00');
      const end = new Date(until + 'T12:00:00');
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.push(fmtLocal(d));
      }
      return dates.length > 30 ? dates.slice(-30) : dates;
    }

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      if (presetValue === 'yesterday') d.setDate(d.getDate() - 1);
      else d.setDate(d.getDate() - i);
      dates.push(fmtLocal(d));
    }
    return dates;
  };

  const daysToRender = presetValue === 'maximum' ? 30 : getDaysFromPreset(presetValue);
  const expectedDates = getRecentDates(daysToRender, sinceValue, untilValue);

  // Pad missing dates with zero values
  const dailyChartData = expectedDates.map(dateStr => {
    const found = accountInsightsDaily.find(ins => (ins.date_start?.slice(5) || '') === dateStr);
    return {
      date: dateStr,
      spend: found ? Number(found.spend || 0) : 0,
      impressions: found ? Number(found.impressions || 0) : 0,
      clicks: found ? Number(found.clicks || 0) : 0,
    };
  });

  // Process campaign comparison data
  const campaignComparisonData = campaigns
    .map(c => {
      const totalSpend = campaignInsights
        .filter(i => i.campaign_id === c.id)
        .reduce((sum, i) => sum + Number(i.spend || 0), 0);
      return { name: c.name?.slice(0, 25) || 'N/A', spend: totalSpend };
    })
    .filter(c => c.spend > 0)
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 8);

  // Process actions/events (keep original keys for translation)
  const allActions = {};
  const allActionCosts = {};
  if (accountInsights?.actions) {
    accountInsights.actions.forEach(a => {
      const base = getBaseActionType(a.action_type);
      const val = Number(a.value || 0);
      allActions[base] = Math.max(allActions[base] || 0, val);
    });
  }
  if (accountInsights?.cost_per_action_type) {
    accountInsights.cost_per_action_type.forEach(a => {
      const base = getBaseActionType(a.action_type);
      const val = Number(a.value || 0);
      if (val > 0) {
        allActionCosts[base] = allActionCosts[base] ? Math.min(allActionCosts[base], val) : val;
      }
    });
  }

  const sortedActions = Object.entries(allActions)
    .sort((a, b) => b[1] - a[1]);

  const actionsDonutData = sortedActions
    .map(([name, value]) => ({ name: formatEventName(name), value }))
    .slice(0, 8);

  // KPI values are now calculated dynamically within activeMetrics.map

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Analisando milhares de dados do Meta Ads...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h3>Erro ao carregar dados</h3>
        <p>{error}</p>
        <button className="btn-retry" onClick={fetchData}>Tentar novamente</button>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Visão Geral</h2>
          <p className="page-header-subtitle">Métricas consolidadas de todas as campanhas</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            className="btn-export"
            onClick={handleExportPdf}
            disabled={isExporting}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '5px 10px',
              borderRadius: 6,
              background: 'transparent',
              border: '1px solid rgba(99,102,241,0.2)',
              color: 'var(--text-muted)',
              fontWeight: 500,
              fontSize: 11,
              cursor: isExporting ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <FiDownload size={12} />
            {isExporting ? '...' : 'PDF'}
          </button>
          <DateFilter selected={datePreset} onChange={setDatePreset} />
        </div>
      </div>

      <div id="dashboard-content">

        {/* Account Balance Card */}
        {accountInfo && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.10) 100%)',
            border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: 16,
            padding: '20px 28px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: '#818cf8' }}>
                <FiDollarSign />
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>Total Investido</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#818cf8' }}>
                  {formatCurrency(Number(accountInfo.amount_spent || 0) / 100)}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
              {accountInfo.funding_source_details?.display_string && (
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>Método de Pagamento</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
                    💳 {accountInfo.funding_source_details.display_string}
                  </div>
                </div>
              )}
              {accountInfo.spend_cap && accountInfo.spend_cap !== '0' && (
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>Limite de Gasto</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#f59e0b' }}>
                    {formatCurrency(Number(accountInfo.spend_cap) / 100)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <button
            onClick={() => setIsMetricsModalOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
              borderRadius: 6, background: 'transparent', border: '1px solid rgba(34,197,94,0.3)',
              color: '#34d399', fontWeight: 600, fontSize: 12, cursor: 'pointer', transition: 'all 0.2s'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(34,197,94,0.1)' }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'transparent' }}
          >
            <FiSettings size={14} /> Adicionar Métricas
          </button>
        </div>

        {/* KPI Cards */}
        <div className="kpi-grid">
          {activeMetrics.map((metric, index) => {
            const val = metric.getValue(accountInsights);
            let formattedValue = val;
            if (metric.format === 'currency') formattedValue = formatCurrency(val);
            else if (metric.format === 'number') formattedValue = formatNumber(val);
            else if (metric.format === 'percentage') formattedValue = val.toFixed(2) + '%';
            else if (metric.format === 'decimal') formattedValue = Number(val).toFixed(2);

            return (
              <KpiCard
                key={metric.id}
                label={metric.label}
                value={formattedValue}
                icon={<FiActivity />}
                color={METRIC_COLORS[index % METRIC_COLORS.length]}
              />
            );
          })}
        </div>

        {/* Charts */}
        <div className="charts-grid">
          <div className="chart-card">
            <div className="chart-card-header">
              <h3 className="chart-card-title">Gasto Diário</h3>
            </div>
            <SpendLineChart data={dailyChartData} />
          </div>
          <div className="chart-card">
            <div className="chart-card-header">
              <h3 className="chart-card-title">Cliques e Impressões</h3>
            </div>
            <ImpressionsClicksChart data={dailyChartData} />
          </div>
          <div className="chart-card">
            <div className="chart-card-header">
              <h3 className="chart-card-title">Gasto por Campanha</h3>
            </div>
            <CampaignComparisonChart data={campaignComparisonData} />
          </div>
          <div className="chart-card">
            <div className="chart-card-header">
              <h3 className="chart-card-title">Eventos / Ações</h3>
            </div>
            <ActionsDonutChart data={actionsDonutData} />
          </div>
        </div>

        {/* Events breakdown */}
        {sortedActions.length > 0 && (
          <div className="table-card">
            <div className="table-card-header">
              <h3 className="table-card-title"><FiActivity style={{ marginRight: 8, verticalAlign: 'middle' }} /> Eventos e Conversões ({sortedActions.length})</h3>
            </div>
            <div className="table-container">
              <table className="campaign-table">
                <thead>
                  <tr>
                    <th style={{ width: '50%' }}>Evento</th>
                    <th>Quantidade</th>
                    <th>Custo Unitário</th>
                  </tr>
                </thead>
                <tbody>
                  {(showAllEvents || isExporting ? sortedActions : sortedActions.slice(0, 8)).map(([name, value]) => (
                    <tr key={name} style={{ cursor: 'default' }}>
                      <td style={{ fontWeight: 500 }}>{formatEventName(name)}</td>
                      <td style={{ fontWeight: 700, fontSize: 15 }}>{formatNumber(value)}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{allActionCosts[name] ? formatCurrency(allActionCosts[name]) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {sortedActions.length > 8 && (
              <div style={{ padding: '12px 24px', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
                <button onClick={() => setShowAllEvents(!showAllEvents)} style={{ background: 'none', border: 'none', color: 'var(--accent-blue-light)', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  {showAllEvents ? <><FiChevronUp /> Mostrar menos</> : <><FiChevronDown /> Ver todos ({sortedActions.length})</>}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Ads Table */}
        <AdTableDashboard ads={ads} adsInsights={adsInsights} />
      </div>

      <MetricsModal
        isOpen={isMetricsModalOpen}
        onClose={() => setIsMetricsModalOpen(false)}
        selectedMetrics={selectedMetricIds}
        onSave={handleSaveMetrics}
      />
    </>
  );
}

export default Dashboard;
