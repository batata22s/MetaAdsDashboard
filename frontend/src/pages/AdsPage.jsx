import { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiFilter, FiDollarSign, FiEye, FiMousePointer, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import DateFilter from '../components/DateFilter';
import { getAds, getCampaigns } from '../services/api';
import axios from 'axios';

const EVENT_NAMES = {
  'page_engagement': 'Engajamento na Pagina',
  'post_engagement': 'Engajamento no Post',
  'link_click': 'Cliques no Link',
  'post_reaction': 'Reacoes no Post',
  'landing_page_view': 'Views da Landing Page',
  'omni_landing_page_view': 'Views Landing (Omni)',
  'comment': 'Comentarios',
  'post': 'Publicacoes',
  'like': 'Curtidas',
  'offsite_conversion.fb_pixel_complete_registration': 'Registros Completos (Pixel)',
  'complete_registration': 'Registros Completos',
  'omni_complete_registration': 'Registros Completos (Omni)',
  'offsite_conversion.fb_pixel_initiate_checkout': 'Checkouts Iniciados (Pixel)',
  'initiate_checkout': 'Checkouts Iniciados',
  'omni_initiated_checkout': 'Checkouts Iniciados (Omni)',
  'offsite_conversion.fb_pixel_add_payment_info': 'Info Pagamento (Pixel)',
  'add_payment_info': 'Info Pagamento',
  'onsite_web_lead': 'Leads Web',
  'lead': 'Leads',
  'offsite_conversion.fb_pixel_lead': 'Leads (Pixel)',
  'purchase': 'Compras',
  'omni_purchase': 'Compras (Omni)',
  'onsite_web_purchase': 'Compras Web',
  'offsite_conversion.fb_pixel_purchase': 'Compras (Pixel)',
  'onsite_conversion.total_messaging_connection': 'Conexoes via Mensagem',
  'onsite_conversion.messaging_conversation_started_7d': 'Conversas Iniciadas (7d)',
  'onsite_conversion.messaging_first_reply': 'Primeiras Respostas',
};

function fmt(raw) {
  if (EVENT_NAMES[raw]) return EVENT_NAMES[raw];
  return raw.replace(/offsite_conversion\.fb_pixel_/g, '')
    .replace(/onsite_conversion\./g, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function formatNumber(num) {
  if (num === undefined || num === null) return '—';
  const n = Number(num);
  if (isNaN(n)) return '—';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toLocaleString('pt-BR');
}

function formatCurrency(num) {
  if (num === undefined || num === null) return '—';
  const n = Number(num);
  if (isNaN(n)) return '—';
  return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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

function AdDetailModal({ ad, onClose, datePreset }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInsights() {
      setLoading(true);
      try {
        const res = await axios.get(`/api/meta/ads/${ad.id}/insights`, { params: { date_preset: datePreset } });
        setInsights(res.data.data?.[0] || null);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchInsights();
  }, [ad.id, datePreset]);

  const actions = {};
  const costs = {};
  if (insights?.actions) {
    insights.actions.forEach(a => { actions[a.action_type] = Number(a.value || 0); });
  }
  if (insights?.cost_per_action_type) {
    insights.cost_per_action_type.forEach(a => { costs[a.action_type] = Number(a.value || 0); });
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }} onClick={onClose}>
      <div style={{
        background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
        borderRadius: 16, width: '90%', maxWidth: 800, maxHeight: '85vh',
        overflow: 'auto', padding: 32,
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{ad.name}</h2>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span className={`status-badge ${getStatusClass(ad.effective_status)}`}>
                <span className="status-dot"></span>
                {getStatusLabel(ad.effective_status)}
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>ID: {ad.id}</span>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-color)',
            color: 'var(--text-primary)', borderRadius: 8, padding: '8px 16px',
            cursor: 'pointer', fontSize: 14, fontFamily: 'var(--font)',
          }}>Fechar</button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
            <p style={{ marginTop: 12, color: 'var(--text-muted)' }}>Carregando metricas...</p>
          </div>
        ) : !insights ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>Sem dados no periodo selecionado</p>
        ) : (
          <>
            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
              {[
                { label: 'Gasto', value: formatCurrency(insights.spend), color: '#6366f1' },
                { label: 'Impressoes', value: formatNumber(insights.impressions), color: '#22d3ee' },
                { label: 'Cliques', value: formatNumber(insights.clicks), color: '#10b981' },
                { label: 'CTR', value: (Number(insights.ctr || 0)).toFixed(2) + '%', color: '#f59e0b' },
                { label: 'CPC', value: formatCurrency(insights.cpc), color: '#ef4444' },
                { label: 'CPM', value: formatCurrency(insights.cpm), color: '#a855f7' },
                { label: 'Alcance', value: formatNumber(insights.reach), color: '#ec4899' },
                { label: 'Frequencia', value: Number(insights.frequency || 0).toFixed(2), color: '#8b5cf6' },
              ].map(kpi => (
                <div key={kpi.label} style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                  borderRadius: 12, padding: '16px', borderTop: `3px solid ${kpi.color}`,
                }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.5px' }}>{kpi.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{kpi.value}</div>
                </div>
              ))}
            </div>

            {/* Events table */}
            {Object.keys(actions).length > 0 && (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600 }}>Eventos e Conversoes</h3>
                </div>
                <table className="campaign-table" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th>Evento</th>
                      <th>Qtd</th>
                      <th>Custo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(actions)
                      .sort((a, b) => b[1] - a[1])
                      .map(([name, value]) => (
                        <tr key={name} style={{ cursor: 'default' }}>
                          <td style={{ fontWeight: 500 }}>{fmt(name)}</td>
                          <td style={{ fontWeight: 700 }}>{formatNumber(value)}</td>
                          <td style={{ color: 'var(--text-secondary)' }}>{costs[name] ? formatCurrency(costs[name]) : '—'}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function AdsPage() {
  const [datePreset, setDatePreset] = useState('last_30d');
  const [ads, setAds] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedAd, setSelectedAd] = useState(null);
  const [adInsights, setAdInsights] = useState({});
  const [loadingInsights, setLoadingInsights] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [adsRes, campaignsRes] = await Promise.all([
        getAds(),
        getCampaigns(),
      ]);
      const adsData = adsRes.data.data || [];
      setCampaigns(campaignsRes.data.data || []);
      setAds(adsData);

      // Fetch insights for all ads in bulk
      setLoadingInsights(true);
      const insightsMap = {};
      const batchSize = 5;
      for (let i = 0; i < adsData.length; i += batchSize) {
        const batch = adsData.slice(i, i + batchSize);
        const results = await Promise.allSettled(
          batch.map(ad => axios.get(`/api/meta/ads/${ad.id}/insights`, { params: { date_preset: datePreset } }))
        );
        results.forEach((result, idx) => {
          if (result.status === 'fulfilled' && result.value.data.data?.[0]) {
            insightsMap[batch[idx].id] = result.value.data.data[0];
          }
        });
      }
      setAdInsights(insightsMap);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
      setLoadingInsights(false);
    }
  }, [datePreset]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Build campaign name map
  const campaignMap = {};
  campaigns.forEach(c => { campaignMap[c.id] = c.name; });

  // Filter ads
  const filtered = ads.filter(ad => {
    const matchesSearch = (ad.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || (ad.effective_status || '').toUpperCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Sort by spend
  filtered.sort((a, b) => {
    const spendA = Number(adInsights[a.id]?.spend || 0);
    const spendB = Number(adInsights[b.id]?.spend || 0);
    return spendB - spendA;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Carregando anuncios...</p>
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
          <h2>Anuncios</h2>
          <p className="page-header-subtitle">{ads.length} anuncios encontrados</p>
        </div>
        <DateFilter selected={datePreset} onChange={setDatePreset} />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
          <FiSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 16 }} />
          <input
            type="text"
            placeholder="Buscar anuncio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%', padding: '10px 14px 10px 40px', borderRadius: 10,
              border: '1px solid var(--border-color)', background: 'var(--bg-card)',
              color: 'var(--text-primary)', fontSize: 14, outline: 'none',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <FiFilter style={{ color: 'var(--text-muted)' }} />
          {['ALL', 'ACTIVE', 'PAUSED'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 600, transition: 'all 0.2s',
                background: statusFilter === s ? 'var(--accent-blue)' : 'var(--bg-card)',
                color: statusFilter === s ? '#fff' : 'var(--text-secondary)',
              }}
            >
              {s === 'ALL' ? 'Todos' : s === 'ACTIVE' ? 'Ativos' : 'Pausados'}
            </button>
          ))}
        </div>
      </div>

      {/* Ads table */}
      <div className="table-card">
        <div className="table-card-header">
          <h3 className="table-card-title">Anuncios ({filtered.length})</h3>
          {loadingInsights && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Carregando metricas...</span>}
        </div>
        <div className="table-container">
          <table className="campaign-table">
            <thead>
              <tr>
                <th>Anuncio</th>
                <th>Status</th>
                <th>Gasto</th>
                <th>Impressoes</th>
                <th>Cliques</th>
                <th>CTR</th>
                <th>CPC</th>
                <th>Conversoes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(ad => {
                const ins = adInsights[ad.id];
                const conversions = ins?.actions?.find(a =>
                  a.action_type === 'offsite_conversion.fb_pixel_purchase' ||
                  a.action_type === 'purchase' ||
                  a.action_type === 'complete_registration' ||
                  a.action_type === 'lead'
                );
                return (
                  <tr key={ad.id} onClick={() => setSelectedAd(ad)}>
                    <td className="campaign-name" title={ad.name}>{ad.name}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(ad.effective_status)}`}>
                        <span className="status-dot"></span>
                        {getStatusLabel(ad.effective_status)}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: '#6366f1' }}>{ins ? formatCurrency(ins.spend) : '—'}</td>
                    <td>{ins ? formatNumber(ins.impressions) : '—'}</td>
                    <td>{ins ? formatNumber(ins.clicks) : '—'}</td>
                    <td>{ins ? Number(ins.ctr || 0).toFixed(2) + '%' : '—'}</td>
                    <td>{ins ? formatCurrency(ins.cpc) : '—'}</td>
                    <td style={{ fontWeight: 600 }}>{conversions ? formatNumber(conversions.value) : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedAd && (
        <AdDetailModal ad={selectedAd} onClose={() => setSelectedAd(null)} datePreset={datePreset} />
      )}
    </>
  );
}

export default AdsPage;