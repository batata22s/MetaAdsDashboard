import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiFilter, FiChevronDown, FiChevronUp, FiAlertTriangle, FiCheckCircle, FiInfo, FiTrendingUp, FiTrendingDown, FiX } from 'react-icons/fi';
import DateFilter from '../components/DateFilter';
import { getAds, getCampaigns, getAdPerformance, getAdsInsightsBulk } from '../services/api';
import pdfService from '../services/pdfService';
import { FiDownload, FiImage } from 'react-icons/fi';
import axios from 'axios';

const EVENT_NAMES = {
  'page_engagement': 'Engajamento na Pagina', 'post_engagement': 'Engajamento no Post',
  'link_click': 'Cliques no Link', 'post_reaction': 'Reacoes no Post',
  'landing_page_view': 'Views da Landing Page', 'omni_landing_page_view': 'Views Landing (Omni)',
  'comment': 'Comentarios', 'post': 'Publicacoes', 'like': 'Curtidas',
  'offsite_conversion.fb_pixel_complete_registration': 'Registros Completos (Pixel)',
  'complete_registration': 'Registros Completos', 'omni_complete_registration': 'Registros (Omni)',
  'offsite_conversion.fb_pixel_initiate_checkout': 'Checkouts Iniciados (Pixel)',
  'initiate_checkout': 'Checkouts Iniciados', 'omni_initiated_checkout': 'Checkouts (Omni)',
  'offsite_conversion.fb_pixel_add_payment_info': 'Info Pagamento (Pixel)',
  'add_payment_info': 'Info Pagamento', 'onsite_web_lead': 'Leads Web', 'lead': 'Leads',
  'offsite_conversion.fb_pixel_lead': 'Leads (Pixel)', 'purchase': 'Compras',
  'omni_purchase': 'Compras (Omni)', 'onsite_web_purchase': 'Compras Web',
  'offsite_conversion.fb_pixel_purchase': 'Compras (Pixel)',
  'onsite_conversion.total_messaging_connection': 'Conexoes via Mensagem',
  'onsite_conversion.messaging_conversation_started_7d': 'Conversas Iniciadas (7d)',
  'onsite_conversion.messaging_first_reply': 'Primeiras Respostas',
};

function getBaseActionType(action_type) {
  if (!action_type) return '';
  return action_type
    .replace(/^offsite_conversion\.fb_pixel_/, '')
    .replace(/^omni_/, '')
    .replace(/^onsite_web_/, '')
    .replace(/^onsite_conversion\./, '');
}

function fmt(raw) {
  if (EVENT_NAMES[raw]) return EVENT_NAMES[raw];
  return raw.replace(/offsite_conversion\.fb_pixel_/g, '').replace(/onsite_conversion\./g, '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}
function formatNumber(num) { if (num == null) return '—'; const n = Number(num); if (isNaN(n)) return '—'; if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'; if (n >= 1000) return (n / 1000).toFixed(1) + 'K'; return n.toLocaleString('pt-BR'); }
function formatCurrency(num) { if (num == null) return '—'; const n = Number(num); if (isNaN(n)) return '—'; return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function getStatusClass(s) { const u = (s || '').toUpperCase(); if (u === 'ACTIVE') return 'active'; if (u.includes('PAUSED')) return 'paused'; return 'inactive'; }
function getStatusLabel(s) { const u = (s || '').toUpperCase(); if (u.includes('PAUSED')) return 'Pausado'; return { ACTIVE: 'Ativo', ARCHIVED: 'Arquivado', DELETED: 'Deletado' }[u] || s; }

function ScoreBadge({ score, label, color, size = 'small' }) {
  if (size === 'large') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', background: `${color}15`, border: `1px solid ${color}40`, borderRadius: 14 }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: `${color}20`, border: `3px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color }}>
          {score}
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color }}>{label}</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Score de Performance</div>
        </div>
        <div style={{ marginLeft: 'auto', width: 120, height: 8, borderRadius: 4, background: 'var(--bg-primary)' }}>
          <div style={{ width: `${score}%`, height: '100%', borderRadius: 4, background: color, transition: 'width 0.5s ease' }} />
        </div>
      </div>
    );
  }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: `${color}20`, color, border: `1px solid ${color}40` }}>
      {score} · {label}
    </span>
  );
}

function MetricComparison({ label, value, average, unit, higherIsBetter }) {
  const diff = average > 0 ? ((value - average) / average * 100) : 0;
  const isGood = higherIsBetter ? diff > 0 : diff < 0;
  const formatted = unit === 'currency' ? formatCurrency(value) : unit === 'percent' ? value.toFixed(2) + '%' : value.toFixed(2);
  const avgFormatted = unit === 'currency' ? formatCurrency(average) : unit === 'percent' ? average.toFixed(2) + '%' : average.toFixed(2);
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 10, padding: '12px 16px' }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.5px' }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{formatted}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
        <span style={{ color: 'var(--text-muted)' }}>Media: {avgFormatted}</span>
        {diff !== 0 && (
          <span style={{ color: isGood ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: 2 }}>
            {isGood ? <FiTrendingUp size={12} /> : <FiTrendingDown size={12} />}
            {Math.abs(diff).toFixed(0)}%
          </span>
        )}
      </div>
    </div>
  );
}

function AdDetailModal({ ad, onClose, datePreset, performance }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      const fileName = `Triadmarkets Dashboard - Anúncio ${ad.id} - ${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`;
      await pdfService.generate('ad-modal-content', fileName);
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      try {
        const presetValue = typeof datePreset === 'object' ? datePreset.preset : datePreset;
        const sinceValue = typeof datePreset === 'object' ? datePreset.since : undefined;
        const untilValue = typeof datePreset === 'object' ? datePreset.until : undefined;

        const res = await axios.get(`/api/meta/ads/${ad.id}/insights`, { params: { date_preset: presetValue, since: sinceValue, until: untilValue } });
        setInsights(res.data.data?.[0] || null);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    fetch();
  }, [ad.id, datePreset]);

  const actions = {}, costs = {};
  if (insights?.actions) {
    insights.actions.forEach(a => {
      const base = getBaseActionType(a.action_type);
      const val = Number(a.value || 0);
      actions[base] = Math.max(actions[base] || 0, val);
    });
  }
  if (insights?.cost_per_action_type) {
    insights.cost_per_action_type.forEach(a => {
      const base = getBaseActionType(a.action_type);
      const val = Number(a.value || 0);
      if (val > 0) {
        costs[base] = costs[base] ? Math.min(costs[base], val) : val;
      }
    });
  }

  const perf = performance;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" id="ad-modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-info">
            <h2>{ad.name}</h2>
            <div className="modal-header-meta">
              <span className={`status-badge ${getStatusClass(ad.effective_status)}`}><span className="status-dot"></span>{getStatusLabel(ad.effective_status)}</span>
              <span className="modal-id">ID: {ad.id}</span>
            </div>
          </div>
          <div className="modal-actions">
            <button
              className="btn-export-small"
              onClick={handleExportPdf}
              disabled={isExporting}
            >
              <FiDownload />
              {isExporting ? '...' : 'PDF'}
            </button>
            <button className="btn-close-modal" onClick={onClose}><FiX /></button>
          </div>
        </div>

        {/* Date Info */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16, padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 10, border: '1px solid var(--border-color)', fontSize: 12 }}>
          {ad.created_time && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: 'var(--text-muted)' }}>Criado em:</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                {new Date(ad.created_time).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}
          {!loading && insights?.date_start && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: 'var(--text-muted)' }}>Período de veiculação:</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                {new Date(insights.date_start + 'T12:00:00').toLocaleDateString('pt-BR')}
                {insights.date_stop && insights.date_stop !== insights.date_start && ` até ${new Date(insights.date_stop + 'T12:00:00').toLocaleDateString('pt-BR')}`}
              </span>
            </div>
          )}
        </div>

        {(() => {
          if (!ad.creative) return null;
          const { image_url, thumbnail_url, body, object_story_spec } = ad.creative;
          const spec = object_story_spec || {};
          const adText = body ||
            spec.link_data?.message ||
            spec.video_data?.message ||
            spec.text_data?.message;

          let imageSrc =
            spec.video_data?.image_url ||
            image_url ||
            thumbnail_url || null;

          if (!imageSrc && !adText) return null;

          return (
            <div style={{ display: 'flex', gap: 20, marginBottom: 24, padding: 16, background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
              {imageSrc && (
                <img src={imageSrc} alt="Criativo" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border-color)' }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8, letterSpacing: '0.5px', fontWeight: 600 }}>Texto do Anuncio</h4>
                <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.5, whiteSpace: 'pre-wrap', maxHeight: 85, overflowY: 'auto', paddingRight: 8 }}>
                  {adText || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Sem texto descritivo.</span>}
                </p>
              </div>
            </div>
          );
        })()}

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}><div className="loading-spinner" style={{ margin: '0 auto' }}></div><p style={{ marginTop: 12, color: 'var(--text-muted)' }}>Carregando...</p></div>
        ) : !insights ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>Sem dados no periodo selecionado</p>
        ) : (
          <>
            {/* Performance Score */}
            {perf && perf.level !== 'no_data' && (
              <div style={{ marginBottom: 20 }}>
                <ScoreBadge score={perf.score} label={perf.label} color={perf.color} size="large" />
                {perf.reasoning && (
                  <div style={{ marginTop: 12, padding: '12px 16px', background: 'var(--bg-card)', borderRadius: 8, fontSize: 13, color: 'var(--text-secondary)', borderLeft: `3px solid ${perf.color}` }}>
                    {perf.reasoning}
                  </div>
                )}
              </div>
            )}

            {/* Alerts */}
            {perf?.alerts?.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                {perf.alerts.map((alert, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', borderRadius: 10,
                    background: alert.type === 'success' ? 'rgba(16,185,129,0.08)' : alert.type === 'warning' ? 'rgba(239,68,68,0.08)' : alert.type === 'caution' ? 'rgba(245,158,11,0.08)' : 'rgba(99,102,241,0.08)',
                    border: `1px solid ${alert.type === 'success' ? 'rgba(16,185,129,0.2)' : alert.type === 'warning' ? 'rgba(239,68,68,0.2)' : alert.type === 'caution' ? 'rgba(245,158,11,0.2)' : 'rgba(99,102,241,0.2)'}`,
                  }}>
                    <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1 }}>{alert.icon}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{alert.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{alert.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Metric Comparisons */}
            {perf?.breakdown && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
                <MetricComparison label="CTR" value={perf.breakdown.ctr.value} average={perf.breakdown.ctr.average} unit="percent" higherIsBetter={true} />
                <MetricComparison label="CPC" value={perf.breakdown.cpc.value} average={perf.breakdown.cpc.average} unit="currency" higherIsBetter={false} />
                <MetricComparison label="Tx. Conversao" value={perf.breakdown.conversions.value} average={perf.breakdown.conversions.average} unit="percent" higherIsBetter={true} />
                <MetricComparison label="Frequencia" value={perf.breakdown.frequency.value} average={perf.breakdown.frequency.average} unit="number" higherIsBetter={false} />
              </div>
            )}

            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
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
                <div key={kpi.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 10, padding: 14, borderTop: `3px solid ${kpi.color}` }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4, letterSpacing: '0.5px' }}>{kpi.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{kpi.value}</div>
                </div>
              ))}
            </div>

            {/* Events */}
            {Object.keys(actions).length > 0 && (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-color)' }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600 }}>Eventos e Conversoes</h3>
                </div>
                <table className="campaign-table" style={{ width: '100%' }}>
                  <thead><tr><th>Evento</th><th>Qtd</th><th>Custo</th></tr></thead>
                  <tbody>
                    {Object.entries(actions).sort((a, b) => b[1] - a[1]).map(([name, value]) => (
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
  const [performanceData, setPerformanceData] = useState(null);
  const [loadingPerformance, setLoadingPerformance] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      const fileName = `Triadmarkets Dashboard - Anúncios - ${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`;
      await pdfService.generate('ads-page-content', fileName);
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

      const [adsRes, campaignsRes] = await Promise.all([getAds(), getCampaigns()]);
      const adsData = adsRes.data.data || [];
      setCampaigns(campaignsRes.data.data || []);
      setAds(adsData);

      // Fetch insights
      setLoadingInsights(true);
      const insightsMap = {};
      try {
        const insightsRes = await getAdsInsightsBulk({ date_preset: presetValue, since: sinceValue, until: untilValue });
        const allInsights = insightsRes.data.data || [];
        allInsights.forEach(ins => {
          insightsMap[ins.ad_id] = ins;
        });
      } catch (err) {
        console.error('Insights fetch error:', err);
      }
      setAdInsights(insightsMap);
      setLoadingInsights(false);

      // Fetch performance analysis
      setLoadingPerformance(true);
      try {
        const perfRes = await getAdPerformance({ date_preset: presetValue, since: sinceValue, until: untilValue });
        setPerformanceData(perfRes.data.data || null);
      } catch (e) { console.error('Performance fetch error:', e); }
      setLoadingPerformance(false);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, [datePreset]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Auto-open ad modal if adId query param is present (from Dashboard click)
  useEffect(() => {
    const adId = searchParams.get('adId');
    if (adId && ads.length > 0 && !selectedAd) {
      const found = ads.find(a => a.id === adId);
      if (found) {
        setSelectedAd(found);
        setSearchParams({}, { replace: true });
      }
    }
  }, [ads, searchParams, selectedAd, setSearchParams]);

  const filtered = ads.filter(ad => {
    const matchesSearch = (ad.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || (ad.effective_status || '').toUpperCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  filtered.sort((a, b) => {
    const spendA = Number(adInsights[a.id]?.spend || 0);
    const spendB = Number(adInsights[b.id]?.spend || 0);
    return spendB - spendA;
  });

  if (loading) {
    return (<div className="loading-container"><div className="loading-spinner"></div><p className="loading-text">Carregando anuncios...</p></div>);
  }
  if (error) {
    return (<div className="error-container"><h3>Erro ao carregar dados</h3><p>{error}</p><button className="btn-retry" onClick={fetchData}>Tentar novamente</button></div>);
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Anuncios</h2>
          <p className="page-header-subtitle">{ads.length} anuncios encontrados</p>
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

      <div id="ads-page-content">
        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
            <FiSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 16 }} />
            <input type="text" placeholder="Buscar anuncio..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '10px 14px 10px 40px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 14, outline: 'none' }} />
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <FiFilter style={{ color: 'var(--text-muted)' }} />
            {['ALL', 'ACTIVE', 'PAUSED'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.2s', background: statusFilter === s ? 'var(--accent-blue)' : 'var(--bg-card)', color: statusFilter === s ? '#fff' : 'var(--text-secondary)' }}>
                {s === 'ALL' ? 'Todos' : s === 'ACTIVE' ? 'Ativos' : 'Pausados'}
              </button>
            ))}
          </div>
        </div>

        {/* Ads table */}
        <div className="table-card">
          <div className="table-card-header">
            <h3 className="table-card-title">Anuncios ({filtered.length})</h3>
            {(loadingInsights || loadingPerformance) && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{loadingPerformance ? 'Analisando performance...' : 'Carregando metricas...'}</span>}
          </div>
          <div className="table-container">
            <table className="campaign-table">
              <thead>
                <tr>
                  <th>Anuncio</th>
                  <th>Status</th>
                  <th>Performance</th>
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
                  const perf = performanceData?.results?.[ad.id];
                  const conversions = ins?.actions?.find(a => ['offsite_conversion.fb_pixel_purchase', 'purchase', 'complete_registration', 'lead'].includes(a.action_type));
                  const creative = ad.creative;
                  const spec = creative?.object_story_spec || {};
                  let imageSrc =
                    spec.video_data?.image_url ||
                    creative?.image_url ||
                    creative?.thumbnail_url || null;

                  return (
                    <tr key={ad.id} onClick={() => setSelectedAd(ad)} style={{ cursor: 'pointer' }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          {imageSrc ? (
                            <img src={imageSrc} alt="" style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: 40, height: 40, borderRadius: 6, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <FiImage size={16} color="var(--text-muted)" />
                            </div>
                          )}
                          <div className="campaign-name">
                            <span title={ad.name}>{ad.name}</span>
                          </div>
                        </div>
                      </td>
                      <td><span className={`status-badge ${getStatusClass(ad.effective_status)}`}><span className="status-dot"></span>{getStatusLabel(ad.effective_status)}</span></td>
                      <td>{perf ? <ScoreBadge score={perf.score} label={perf.label} color={perf.color} /> : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>}</td>
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
      </div>
      {selectedAd && (
        <AdDetailModal ad={selectedAd} onClose={() => setSelectedAd(null)} datePreset={datePreset} performance={performanceData?.results?.[selectedAd.id]} />
      )}
    </>
  );
}

export default AdsPage;