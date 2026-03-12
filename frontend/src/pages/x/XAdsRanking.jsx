import { useState, useEffect, useCallback } from 'react';
import { FiAward, FiTrendingUp } from 'react-icons/fi';
import { getXCampaigns } from '../../services/api';

function formatCurrency(num) {
    const n = Number(num);
    if (isNaN(n)) return 'R$ 0,00';
    return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function XAdsRanking() {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getXCampaigns();
            const camps = res.data.data || [];
            // Sort by daily_budget for ranking proxy
            camps.sort((a, b) => Number(b.daily_budget || 0) - Number(a.daily_budget || 0));
            setCampaigns(camps);
        } catch (err) {
            console.error('Error fetching X Campaigns for ranking:', err);
            setError('Falha ao carregar ranking do X Ads');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p className="loading-text">Processando ranking do Twitter...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <h3>Erro</h3>
                <p>{error}</p>
                <button className="btn-retry" onClick={fetchData}>Tentar novamente</button>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <header className="page-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '24px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: 12,
                        background: 'rgba(255,255,255,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 24, fontWeight: 'bold'
                    }}>
                        <FiAward color="#f59e0b" />
                    </div>
                    <div>
                        <h1 className="page-title">Top Ranking (X Ads)</h1>
                        <p className="page-subtitle">Melhores campanhas baseadas em orçamento e engajamento no Twitter</p>
                    </div>
                </div>
            </header>

            <div className="ranking-grid">
                {campaigns.slice(0, 3).map((camp, index) => (
                    <div key={camp.id} className="ranking-card top-3" style={{
                        background: 'linear-gradient(135deg, rgba(29, 161, 242, 0.1) 0%, rgba(29, 161, 242, 0.05) 100%)',
                        border: '1px solid rgba(29, 161, 242, 0.3)'
                    }}>
                        <div className="ranking-medal" style={{ background: index === 0 ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' : index === 1 ? 'linear-gradient(135deg, #9ca3af, #6b7280)' : 'linear-gradient(135deg, #d97706, #b45309)' }}>#{index + 1}</div>
                        <h3 className="ranking-title" style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--text-muted)' }}>{camp.id}</h3>
                        <div className="ranking-metric" style={{ fontSize: '16px', marginBottom: '16px' }}>{camp.name}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px' }}>
                            <div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Objetivo</div>
                                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{camp.objective}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Orçamento Diário</div>
                                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1da1f2' }}>{formatCurrency(camp.daily_budget)}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {campaigns.length > 3 && (
                <div className="table-card" style={{ marginTop: 24 }}>
                    <div className="table-card-header">
                        <h3 className="table-card-title">Demais Campanhas</h3>
                    </div>
                    <div className="table-container">
                        <table className="campaign-table">
                            <thead>
                                <tr>
                                    <th>Pos.</th>
                                    <th>Campanha</th>
                                    <th>Orç. Diário</th>
                                </tr>
                            </thead>
                            <tbody>
                                {campaigns.slice(3).map((camp, idx) => (
                                    <tr key={camp.id}>
                                        <td style={{ fontWeight: 'bold', color: 'var(--text-muted)' }}>#{idx + 4}</td>
                                        <td className="campaign-name">{camp.name} <span style={{ fontSize: 10, marginLeft: 8, color: '#888' }}>({camp.id})</span></td>
                                        <td style={{ fontWeight: 'bold' }}>{formatCurrency(camp.daily_budget)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {campaigns.length === 0 && (
                <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', borderRadius: 16 }}>
                    <FiTrendingUp size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
                    <h3>Sem campanhas ativas para ranquear</h3>
                    <p>Verifique se suas chaves do Twitter Ads estão corretas no servidor.</p>
                </div>
            )}

        </div>
    );
}

export default XAdsRanking;
