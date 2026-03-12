import { useState, useEffect, useCallback } from 'react';
import { FiDollarSign, FiEye, FiMousePointer, FiPercent, FiTarget, FiActivity } from 'react-icons/fi';
import KpiCard from '../../components/KpiCard';
import DateFilter from '../../components/DateFilter';
import { getXInsights, getXCampaigns } from '../../services/api';

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

function XAdsDashboard() {
    const [datePreset, setDatePreset] = useState('last_7d');
    const [insights, setInsights] = useState(null);
    const [campaignsCount, setCampaignsCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [insightsRes, campaignsRes] = await Promise.all([
                getXInsights({ date_preset: datePreset }),
                getXCampaigns()
            ]);

            setInsights(insightsRes.data.data?.[0] || null);
            setCampaignsCount(campaignsRes.data.data?.length || 0);

        } catch (err) {
            console.error('Error fetching X Ads data:', err);
            // Fallback to empty state on error so UI doesn't crash if keys are invalid
            setInsights({ spend: 0, impressions: 0, clicks: 0, cpc: 0, ctr: 0, actions: [] });
        } finally {
            setLoading(false);
        }
    }, [datePreset]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // KPI values
    const spend = Number(insights?.spend || 0);
    const impressions = Number(insights?.impressions || 0);
    const clicks = Number(insights?.clicks || 0);
    const ctr = Number(insights?.ctr || 0);
    const cpc = Number(insights?.cpc || 0);

    // Extract retweets/engagements from actions
    const engagements = insights?.actions?.find(a => a.action_type === 'post_engagement')?.value || 0;
    const retweets = insights?.actions?.find(a => a.action_type === 'retweet')?.value || 0;

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p className="loading-text">Conectando à API do X Ads...</p>
            </div>
        );
    }

    return (
        <>
            <div className="page-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '24px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: 12,
                        background: 'rgba(255,255,255,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 24, fontWeight: 'bold'
                    }}>
                        𝕏
                    </div>
                    <div>
                        <h2>Visão Geral X Ads</h2>
                        <p className="page-header-subtitle">Performance da sua conta de anúncios do X (Twitter)</p>
                    </div>
                </div>
                <DateFilter selected={datePreset} onChange={setDatePreset} />
            </div>

            <div id="x-dashboard-content">

                {/* Informational Banner if no spend/data */}
                {spend === 0 && (
                    <div style={{
                        background: 'rgba(255,255,255,0.03)',
                        borderLeft: '4px solid #1da1f2',
                        padding: '16px 20px',
                        borderRadius: '8px',
                        marginBottom: '24px'
                    }}>
                        <h4 style={{ margin: '0 0 8px 0', color: '#1da1f2' }}>Nenhum gasto detectado neste período</h4>
                        <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>
                            Verifique se a sua conta X Ads tem campanhas rodando. Se você acabou de configurar as chaves de API, aguarde algumas horas para os dados propagarem.
                        </p>
                    </div>
                )}

                {/* Global KPIs */}
                <div className="kpi-grid" style={{ marginBottom: '24px' }}>
                    <KpiCard label="Gasto Total (X)" value={formatCurrency(spend)} icon={<FiDollarSign />} color="blue" />
                    <KpiCard label="Impressões" value={formatNumber(impressions)} icon={<FiEye />} color="cyan" />
                    <KpiCard label="Cliques (Link)" value={formatNumber(clicks)} icon={<FiMousePointer />} color="green" />
                    <KpiCard label="CTR" value={ctr.toFixed(2) + '%'} icon={<FiPercent />} color="warm" />
                </div>

                <div className="kpi-grid">
                    <KpiCard label="CPC Médio" value={formatCurrency(cpc)} icon={<FiTarget />} color="red" />
                    <KpiCard label="Engajamentos" value={formatNumber(engagements)} icon={<FiActivity />} color="purple" />
                    <KpiCard label="Retweets" value={formatNumber(retweets)} icon={<FiActivity />} color="blue" />
                    <KpiCard label="Campanhas Ativas" value={formatNumber(campaignsCount)} icon={<FiTarget />} color="pink" />
                </div>

            </div>
        </>
    );
}

export default XAdsDashboard;
