import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiDollarSign, FiEye, FiMousePointer, FiPercent, FiTarget, FiTrendingUp, FiChevronRight } from 'react-icons/fi';
import KpiCard from '../components/KpiCard';
import DateFilter from '../components/DateFilter';
import { SpendLineChart, ImpressionsClicksChart } from '../components/Charts';
import { getCampaignInsightsById, getAdSets, getAdSetInsights } from '../services/api';

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
  'offsite_conversion.fb_pixel_complete_registration': 'Registros Completos (Pixel)',
  'complete_registration': 'Registros Completos',
  'omni_complete_registration': 'Registros Completos (Omni)',
  'offsite_conversion.fb_pixel_initiate_checkout': 'Checkouts Iniciados (Pixel)',
  'initiate_checkout': 'Checkouts Iniciados',
  'omni_initiated_checkout': 'Checkouts Iniciados (Omni)',
  'offsite_conversion.fb_pixel_add_payment_info': 'Info Pagamento (Pixel)',
  'add_payment_info': 'Info Pagamento Adicionada',
  'onsite_web_lead': 'Leads Web',
  'lead': 'Leads',
  'offsite_conversion.fb_pixel_lead': 'Leads (Pixel)',
  'purchase': 'Compras',
  'omni_purchase': 'Compras (Omni)',
  'onsite_web_purchase': 'Compras Web',
  'offsite_conversion.fb_pixel_purchase': 'Compras (Pixel)',
  'onsite_conversion.total_messaging_connection': 'Conexões via Mensagem',
  'onsite_conversion.messaging_conversation_started_7d': 'Conversas Iniciadas (7d)',
  'onsite_conversion.messaging_first_reply': 'Primeiras Respostas',
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

function getStatusClass(status) {
  const s = (status || '').toUpperCase();
  if (s === 'ACTIVE') return 'active';
  if (s === 'PAUSED') return 'paused';
  return 'inactive';
}

function getStatusLabel(status) {
  const labels = { ACTIVE: 'Ativo', PAUSED: 'Pausado', ARCHIVED: 'Arquivado', DELETED: 'Deletado' };
  return labels[(status || '').toUpperCase()] || status;
}

function CampaignDetail() {
  const { id } = useParams();
  const [datePreset, setDatePreset] = useState('last_7d');
  const [insights, setInsights] = useState([]);
  const [adSets, setAdSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [insightsRes, adSetsRes] = await Promise.all([
        getCampaignInsightsById(id, { date_preset: datePreset }),
        getAdSets({ campaign_id: id }),
      ]);
      setInsights(insightsRes.data.data || []);
      setAdSets(adSetsRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, [id, datePreset]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Aggregate insights
  const totals = insights.reduce((acc, ins) => {
    acc.spend += Number(ins.spend || 0);
    acc.impressions += Number(ins.impressions || 0);
    acc.clicks += Number(ins.clicks || 0);
    acc.reach += Number(ins.reach || 0);
    if (ins.actions) {
      ins.actions.forEach(a => {
        if (!acc.actions[a.action_type]) acc.actions[a.action_type] = 0;
        acc.actions[a.action_type] += Number(a.value || 0);
      });
    }
    if (ins.cost_per_action_type) {
      ins.cost_per_action_type.forEach(a => {
        acc.costs[a.action_type] = Number(a.value || 0);
      });
    }
    return acc;
  }, { spend: 0, impressions: 0, clicks: 0, reach: 0, actions: {}, costs: {} });

  const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions * 100) : 0;
  const cpc = totals.clicks > 0 ? (totals.spend / totals.clicks) : 0;
  const cpm = totals.impressions > 0 ? (totals.spend / totals.impressions * 1000) : 0;

  const dailyData = insights
    .map(ins => ({
      date: ins.date_start?.slice(5) || 'N/A',
      spend: Number(ins.spend || 0),
      impressions: Number(ins.impressions || 0),
      clicks: Number(ins.clicks || 0),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const campaignName = insights[0]?.campaign_name || `Campanha ${id}`;

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Carregando detalhes da campanha...</p>
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
      <div className="breadcrumb">
        <Link to="/campaigns">Campanhas</Link>
        <FiChevronRight />
        <span>{campaignName}</span>
      </div>

      <div className="page-header">
        <div>
          <h2>{campaignName}</h2>
          <p className="page-header-subtitle">Detalhes da campanha</p>
        </div>
        <DateFilter selected={datePreset} onChange={setDatePreset} />
      </div>

      <div className="kpi-grid">
        <KpiCard label="Gasto" value={formatCurrency(totals.spend)} icon={<FiDollarSign />} color="blue" />
        <KpiCard label="Impressões" value={formatNumber(totals.impressions)} icon={<FiEye />} color="cyan" />
        <KpiCard label="Cliques" value={formatNumber(totals.clicks)} icon={<FiMousePointer />} color="green" />
        <KpiCard label="CTR" value={ctr.toFixed(2) + '%'} icon={<FiPercent />} color="warm" />
        <KpiCard label="CPC" value={formatCurrency(cpc)} icon={<FiTarget />} color="red" />
        <KpiCard label="CPM" value={formatCurrency(cpm)} icon={<FiTrendingUp />} color="purple" />
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-card-header">
            <h3 className="chart-card-title">Gasto Diário</h3>
          </div>
          <SpendLineChart data={dailyData} />
        </div>
        <div className="chart-card">
          <div className="chart-card-header">
            <h3 className="chart-card-title">Cliques e Impressões</h3>
          </div>
          <ImpressionsClicksChart data={dailyData} />
        </div>
      </div>

      {/* Events */}
      {Object.keys(totals.actions).length > 0 && (
        <div className="table-card">
          <div className="table-card-header">
            <h3 className="table-card-title">Eventos e Conversões ({Object.keys(totals.actions).length})</h3>
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
                {Object.entries(totals.actions)
                  .sort((a, b) => b[1] - a[1])
                  .map(([name, value]) => (
                    <tr key={name} style={{ cursor: 'default' }}>
                      <td style={{ fontWeight: 500 }}>{formatEventName(name)}</td>
                      <td style={{ fontWeight: 700, fontSize: 15 }}>{formatNumber(value)}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{totals.costs[name] ? formatCurrency(totals.costs[name]) : '—'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ad Sets Table */}
      {adSets.length > 0 && (
        <div className="table-card">
          <div className="table-card-header">
            <h3 className="table-card-title">Conjuntos de Anúncios ({adSets.length})</h3>
          </div>
          <div className="table-container">
            <table className="campaign-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Status</th>
                  <th>Objetivo</th>
                  <th>Orçamento Diário</th>
                </tr>
              </thead>
              <tbody>
                {adSets.map(adset => (
                  <tr key={adset.id}>
                    <td className="campaign-name">{adset.name}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(adset.effective_status)}`}>
                        <span className="status-dot"></span>
                        {getStatusLabel(adset.effective_status)}
                      </span>
                    </td>
                    <td>{adset.optimization_goal || '—'}</td>
                    <td>{adset.daily_budget ? formatCurrency(adset.daily_budget / 100) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

export default CampaignDetail;
