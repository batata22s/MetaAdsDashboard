import { useNavigate } from 'react-router-dom';

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
    const labels = {
        ACTIVE: 'Ativo',
        ARCHIVED: 'Arquivado',
        DELETED: 'Deletado',
    };
    return labels[s] || status;
}

function AdTableDashboard({ ads, adsInsights }) {
    const navigate = useNavigate();

    // Merge ad data with performance
    const safePerfData = Array.isArray(adsInsights) ? adsInsights : [];
    const mergedData = ads
        .map(ad => {
            const adPerf = safePerfData.find(p => p.ad_id === ad.id);

            const spend = Number(adPerf?.spend || 0);
            const impressions = Number(adPerf?.impressions || 0);
            const clicks = Number(adPerf?.clicks || 0);

            let resultsCount = 0;
            if (adPerf?.actions) {
                const priorityActions = ['offsite_conversion.fb_pixel_purchase', 'omni_purchase', 'purchase', 'lead'];
                for (const act of priorityActions) {
                    const found = adPerf.actions.find(a => a.action_type === act);
                    if (found) {
                        resultsCount += Number(found.value || 0);
                    }
                }
                if (resultsCount === 0) {
                    const linkClicks = adPerf.actions.find(a => a.action_type === 'link_click');
                    if (linkClicks) resultsCount = Number(linkClicks.value || 0);
                }
            }

            const ctr = impressions > 0 ? (clicks / impressions * 100) : 0;
            const cpc = clicks > 0 ? (spend / clicks) : 0;
            const cpm = impressions > 0 ? (spend / impressions * 1000) : 0;
            const costPerResult = resultsCount > 0 ? (spend / resultsCount) : 0;

            return {
                ...ad,
                spend,
                impressions,
                clicks,
                ctr,
                cpc,
                cpm,
                results: resultsCount,
                costPerResult
            };
        })
        // Only show ads with some delivery or active status
        .filter(a => a.spend > 0 || a.impressions > 0 || getStatusClass(a.effective_status) === 'active')
        .sort((a, b) => {
            const isAActive = getStatusClass(a.effective_status) === 'active' ? 1 : 0;
            const isBActive = getStatusClass(b.effective_status) === 'active' ? 1 : 0;
            if (isAActive !== isBActive) {
                return isBActive - isAActive; // Active first
            }
            return b.spend - a.spend; // Then by spend descending
        });

    return (
        <div className="table-card">
            <div className="table-card-header">
                <h3 className="table-card-title">Anúncios ({mergedData.length})</h3>
            </div>
            <div className="table-container">
                <table className="campaign-table">
                    <thead>
                        <tr>
                            <th>Criativo</th>
                            <th style={{ minWidth: 200 }}>Anúncio</th>
                            <th>Status</th>
                            <th>Gasto</th>
                            <th>Impressões</th>
                            <th>Cliques</th>
                            <th>CTR</th>
                            <th>CPC</th>
                            <th>CPM</th>
                            <th>Resultados</th>
                            <th>Custo/Resultado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mergedData.length === 0 ? (
                            <tr>
                                <td colSpan="11" style={{ textAlign: 'center', padding: '24px' }}>Nenhum dado de anúncio encontrado no período.</td>
                            </tr>
                        ) : (
                            mergedData.map(c => (
                                <tr key={c.id} onClick={() => navigate(`/meta/ads?adId=${c.id}`)}>
                                    <td style={{ width: 64, padding: '12px 16px' }}>
                                        <div className="ad-image-container" style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                            {c.creative?.image_url || c.creative?.thumbnail_url ? (
                                                <img
                                                    src={c.creative?.image_url || c.creative?.thumbnail_url}
                                                    alt="Criativo"
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Sem Imagem</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="campaign-name" title={c.name}>{c.name}</td>
                                    <td>
                                        <span className={`status-badge ${getStatusClass(c.effective_status)}`}>
                                            <span className="status-dot"></span>
                                            {getStatusLabel(c.effective_status)}
                                        </span>
                                    </td>
                                    <td style={{ fontWeight: 600 }}>{formatCurrency(c.spend)}</td>
                                    <td>{formatNumber(c.impressions)}</td>
                                    <td>{formatNumber(c.clicks)}</td>
                                    <td>{formatPercent(c.ctr)}</td>
                                    <td>{formatCurrency(c.cpc)}</td>
                                    <td>{formatCurrency(c.cpm)}</td>
                                    <td style={{ fontWeight: 600 }}>{formatNumber(c.results)}</td>
                                    <td>{formatCurrency(c.costPerResult)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdTableDashboard;
