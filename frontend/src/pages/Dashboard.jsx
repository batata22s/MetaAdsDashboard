import { useState, useEffect, useCallback } from 'react';
import { FiDollarSign, FiEye, FiMousePointer, FiPercent, FiTarget, FiTrendingUp, FiActivity, FiUsers, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import KpiCard from '../components/KpiCard';
import DateFilter from '../components/DateFilter';
import CampaignTable from '../components/CampaignTable';
import { SpendLineChart, ImpressionsClicksChart, CampaignComparisonChart, ActionsDonutChart } from '../components/Charts';
import { getCampaigns, getAccountInsights, getCampaignInsights } from '../services/api';

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
};

function formatEventName(raw) {
  if (EVENT_NAMES[raw]) return EVENT_NAMES[raw];
  return raw.replace(/offsite_conversion\.fb_pixel_/g, '')
    .replace(/onsite_conversion\./g, '')
    .replace(/onsite_web_/g, '')
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
  const [campaignInsights, setCampaignInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllEvents, setShowAllEvents] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [campaignsRes, accountRes, insightsRes] = await Promise.all([
        getCampaigns(),
        getAccountInsights({ date_preset: datePreset }),
        getCampaignInsights({ date_preset: datePreset }),
      ]);

      setCampaigns(campaignsRes.data.data || []);
      setAccountInsights(accountRes.data.data?.[0] || null);
      setCampaignInsights(insightsRes.data.data || []);
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
  const dailyChartData = campaignInsights
    .reduce((acc, ins) => {
      const date = ins.date_start?.slice(5) || 'N/A';
      const existing = acc.find(d => d.date === date);
      if (existing) {
        existing.spend += Number(ins.spend || 0);
        existing.impressions += Number(ins.impressions || 0);
        existing.clicks += Number(ins.clicks || 0);
      } else {
        acc.push({
          date,
          spend: Number(ins.spend || 0),
          impressions: Number(ins.impressions || 0),
          clicks: Number(ins.clicks || 0),
        });
      }
      return acc;
    }, [])
    .sort((a, b) => a.date.localeCompare(b.date));

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
      allActions[a.action_type] = (allActions[a.action_type] || 0) + Number(a.value || 0);
    });
  }
  if (accountInsights?.cost_per_action_type) {
    accountInsights.cost_per_action_type.forEach(a => {
      allActionCosts[a.action_type] = Number(a.value || 0);
    });
  }

  const sortedActions = Object.entries(allActions)
    .sort((a, b) => b[1] - a[1]);

  const actionsDonutData = sortedActions
    .map(([name, value]) => ({ name: formatEventName(name), value }))
    .slice(0, 8);

  // KPI values from account insights
  const spend = Number(accountInsights?.spend || 0);
  const impressions = Number(accountInsights?.impressions || 0);
  const clicks = Number(accountInsights?.clicks || 0);
  const reach = Number(accountInsights?.reach || 0);
  const ctr = impressions > 0 ? (clicks / impressions * 100) : 0;
  const cpc = clicks > 0 ? (spend / clicks) : 0;
  const cpm = impressions > 0 ? (spend / impressions * 1000) : 0;
  const frequency = Number(accountInsights?.frequency || 0);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Carregando dados do Meta Ads...</p>
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
        <DateFilter selected={datePreset} onChange={setDatePreset} />
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <KpiCard label="Gasto Total" value={formatCurrency(spend)} icon={<FiDollarSign />} color="blue" />
        <KpiCard label="Impressões" value={formatNumber(impressions)} icon={<FiEye />} color="cyan" />
        <KpiCard label="Cliques" value={formatNumber(clicks)} icon={<FiMousePointer />} color="green" />
        <KpiCard label="Alcance" value={formatNumber(reach)} icon={<FiUsers />} color="purple" />
        <KpiCard label="CTR" value={ctr.toFixed(2) + '%'} icon={<FiPercent />} color="warm" />
        <KpiCard label="CPC" value={formatCurrency(cpc)} icon={<FiTarget />} color="red" />
        <KpiCard label="CPM" value={formatCurrency(cpm)} icon={<FiTrendingUp />} color="pink" />
        <KpiCard label="Frequência" value={Number(frequency).toFixed(2)} icon={<FiActivity />} color="blue" />
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
                {(showAllEvents ? sortedActions : sortedActions.slice(0, 8)).map(([name, value]) => (
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

      {/* Campaign Table */}
      <CampaignTable campaigns={campaigns} insights={campaignInsights} />
    </>
  );
}

export default Dashboard;
