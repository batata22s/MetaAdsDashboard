import { useState, useEffect, useCallback } from 'react';
import { FiTrendingUp } from 'react-icons/fi';
import { getXCampaigns } from '../../services/api';

function formatCurrency(num) {
    const n = Number(num);
    if (isNaN(n)) return 'R$ 0,00';
    return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function getStatusClass(status) {
    const s = (status || '').toUpperCase();
    if (s === 'ACTIVE') return 'active';
    if (s === 'PAUSED') return 'paused';
    return 'inactive';
}

function getStatusLabel(status) {
    const s = (status || '').toUpperCase();
    if (s === 'ACTIVE') return 'Ativo';
    if (s === 'PAUSED') return 'Pausado';
    return status;
}

function XAdsPage() {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getXCampaigns();
            setCampaigns(res.data.data || []);
        } catch (err) {
            console.error('Error fetching X Campaigns:', err);
            setError('Falha ao carregar campanhas do X');
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
                <p className="loading-text">Carregando seus anúncios do X...</p>
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
                        <FiTrendingUp color="#1da1f2" />
                    </div>
                    <div>
                        <h1 className="page-title">Anúncios (X Ads)</h1>
                        <p className="page-subtitle">Lista de Campanhas/Line Items rodando no Twitter</p>
                    </div>
                </div>
            </header>

            <div className="table-card">
                <div className="table-card-header">
                    <h3 className="table-card-title">Todas as Campanhas X Ads ({campaigns.length})</h3>
                </div>
                <div className="table-container">
                    <table className="campaign-table">
                        <thead>
                            <tr>
                                <th>ID da Campanha</th>
                                <th>Nome</th>
                                <th>Status</th>
                                <th>Objetivo</th>
                                <th>Orçamento Diário</th>
                            </tr>
                        </thead>
                        <tbody>
                            {campaigns.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                                        Nenhuma campanha encontrada ou dados de API inválidos.
                                    </td>
                                </tr>
                            ) : (
                                campaigns.map(c => (
                                    <tr key={c.id}>
                                        <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{c.id}</td>
                                        <td className="campaign-name">{c.name}</td>
                                        <td>
                                            <span className={`status-badge ${getStatusClass(c.status)}`}>
                                                <span className="status-dot"></span>
                                                {getStatusLabel(c.status)}
                                            </span>
                                        </td>
                                        <td><span style={{ fontSize: 11, background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: 4 }}>{c.objective}</span></td>
                                        <td style={{ fontWeight: 'bold' }}>{formatCurrency(c.daily_budget)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default XAdsPage;
