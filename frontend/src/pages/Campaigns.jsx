import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiFilter, FiDownload } from 'react-icons/fi';
import DateFilter from '../components/DateFilter';
import { getCampaigns, getCampaignInsights } from '../services/api';
import pdfService from '../services/pdfService';

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

function formatPercent(num) {
  if (num === undefined || num === null) return '—';
  const n = Number(num);
  if (isNaN(n)) return '—';
  return n.toFixed(2) + '%';
}

function getStatusClass(status) {
  const s = (status || '').toUpperCase();
  if (s === 'ACTIVE') return 'active';
  if (s.includes('PAUSED')) return 'paused';
  return 'inactive';
}

function getStatusLabel(status) {
  const s = (status || '').toUpperCase();
  if (s.includes('PAUSED')) return 'Pausado';
  const labels = { ACTIVE: 'Ativo', ARCHIVED: 'Arquivado', DELETED: 'Deletado' };
  return labels[s] || status;
}

function Campaigns() {
  const navigate = useNavigate();
  const [datePreset, setDatePreset] = useState('last_7d');
  const [campaigns, setCampaigns] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      const fileName = `Triadmarkets Dashboard - Campanhas - ${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`;
      await pdfService.generate('campaigns-content', fileName);
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

      const [campaignsRes, insightsRes] = await Promise.all([
        getCampaigns(),
        getCampaignInsights({ date_preset: presetValue, since: sinceValue, until: untilValue }),
      ]);
      setCampaigns(campaignsRes.data.data || []);
      setInsights(insightsRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, [datePreset]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Merge campaigns with insights
  const mergedData = campaigns.map(campaign => {
    const campaignInsights = insights.filter(i => i.campaign_id === campaign.id);
    let aggregated = campaignInsights.reduce((acc, ins) => {
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
      return acc;
    }, { spend: 0, impressions: 0, clicks: 0, reach: 0, actions: {} });

    let isLifetime = false;

    // If no impressions in the selected period, fallback to lifetime if available
    if (aggregated.impressions === 0 && campaign.lifetime_insights) {
      isLifetime = true;
      const lt = campaign.lifetime_insights;
      aggregated = {
        spend: Number(lt.spend || 0),
        impressions: Number(lt.impressions || 0),
        clicks: Number(lt.clicks || 0),
        reach: Number(lt.reach || 0),
        actions: {}
      };
      if (lt.actions) {
        lt.actions.forEach(a => {
          aggregated.actions[a.action_type] = Number(a.value || 0);
        });
      }
    }

    const ctr = aggregated.impressions > 0 ? (aggregated.clicks / aggregated.impressions * 100) : 0;
    const cpc = aggregated.clicks > 0 ? (aggregated.spend / aggregated.clicks) : 0;
    const cpm = aggregated.impressions > 0 ? (aggregated.spend / aggregated.impressions * 1000) : 0;
    const results = aggregated.actions['link_click'] || aggregated.actions['landing_page_view'] || aggregated.actions['offsite_conversion.fb_pixel_purchase'] || aggregated.actions['purchase'] || aggregated.actions['lead'] || 0;
    const costPerResult = results > 0 ? aggregated.spend / results : 0;

    return { ...campaign, ...aggregated, ctr, cpc, cpm, results, costPerResult, isLifetime };
  });

  // Filter
  const filtered = mergedData.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || (c.effective_status || '').toUpperCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Sort by spend descending
  filtered.sort((a, b) => b.spend - a.spend);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Carregando campanhas...</p>
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
          <h2>Campanhas</h2>
          <p className="page-header-subtitle">{campaigns.length} campanhas encontradas</p>
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

      <div id="campaigns-content">

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
            <FiSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 16 }} />
            <input
              type="text"
              placeholder="Buscar campanha..."
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

        {/* Campaign Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(c => (
            <div
              key={c.id}
              onClick={() => navigate(`/meta/campaign/${c.id}`)}
              style={{
                background: 'var(--bg-card)', borderRadius: 14,
                border: '1px solid var(--border-color)', padding: '20px 24px',
                cursor: 'pointer', transition: 'all 0.25s ease',
                position: 'relative'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--border-glow)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {c.isLifetime && (
                <div style={{ position: 'absolute', top: 18, right: 24, fontSize: 11, background: 'rgba(99,102,241,0.15)', color: '#818cf8', padding: '4px 8px', borderRadius: 6, fontWeight: 600 }}>
                  Exibindo metricas totais (Lifetime)
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {c.name}
                  </h3>
                  <span className={`status-badge ${getStatusClass(c.effective_status)}`}>
                    <span className="status-dot"></span>
                    {getStatusLabel(c.effective_status)}
                  </span>
                </div>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>ID: {c.id}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4, letterSpacing: '0.5px' }}>Gasto</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#6366f1' }}>{formatCurrency(c.spend)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4, letterSpacing: '0.5px' }}>Impressoes</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{formatNumber(c.impressions)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4, letterSpacing: '0.5px' }}>Cliques</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#10b981' }}>{formatNumber(c.clicks)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4, letterSpacing: '0.5px' }}>CTR</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#f59e0b' }}>{formatPercent(c.ctr)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4, letterSpacing: '0.5px' }}>CPC</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#ef4444' }}>{formatCurrency(c.cpc)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4, letterSpacing: '0.5px' }}>Resultados</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#8b5cf6' }}>{formatNumber(c.results)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4, letterSpacing: '0.5px' }}>Custo/Res.</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#ec4899' }}>{formatCurrency(c.costPerResult)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Campaigns;