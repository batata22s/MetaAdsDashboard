import { useState, useEffect, useCallback } from 'react';
import { FiAward, FiTrendingDown, FiTrendingUp, FiDownload } from 'react-icons/fi';
import DateFilter from '../components/DateFilter';
import { getAds, getAdPerformance } from '../services/api';
import pdfService from '../services/pdfService';
import './Ranking.css';

function RankingCard({ ad, rank, isTop }) {
    if (!ad) return null;
    const isGold = rank === 1 && isTop;
    const isSilver = rank === 2 && isTop;
    const isBronze = rank === 3 && isTop;

    let medalColor = 'var(--text-muted)';
    if (isGold) medalColor = '#F59E0B'; // Gold
    else if (isSilver) medalColor = '#9CA3AF'; // Silver
    else if (isBronze) medalColor = '#D97706'; // Bronze

    const { creative } = ad;
    const spec = creative?.object_story_spec || {};
    let imageSrc =
        spec.video_data?.image_url ||
        creative?.image_url ||
        creative?.thumbnail_url || null;

    return (
        <div className={`ranking-card ${isTop ? 'top-card' : 'bottom-card'} ${isGold ? 'rank-1' : ''}`}>
            <div className="ranking-medal" style={{ color: medalColor }}>
                {isTop ? <FiAward size={isGold ? 32 : 24} /> : <FiTrendingDown size={24} />}
                <span className="ranking-number">#{rank}</span>
            </div>

            <div className="ranking-creative">
                {imageSrc ? (
                    <img src={imageSrc} alt="" />
                ) : (
                    <div className="no-image">Sem Img</div>
                )}
            </div>

            <div className="ranking-details">
                <h4 title={ad.name}>{ad.name}</h4>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
                    {ad.perf.label}
                </div>
                <div className="ranking-score">
                    <span className="score-value" style={{ color: ad.perf.color }}>{ad.perf.score}</span>
                    <span className="score-label">Score de Performance</span>
                </div>
                {ad.perf.reasoning && (
                    <div style={{ marginTop: 12, padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 8, fontSize: 12, color: 'var(--text-secondary)', fontStyle: 'italic', borderLeft: `3px solid ${ad.perf.color}` }}>
                        "{ad.perf.reasoning}"
                    </div>
                )}
            </div>

            {isGold && (
                <div className="gold-badge">🏆 Melhor Desempenho</div>
            )}
        </div>
    );
}

function Ranking() {
    const [datePreset, setDatePreset] = useState('last_30d');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rankedAds, setRankedAds] = useState([]);
    const [isExporting, setIsExporting] = useState(false);

    const handleExportPdf = async () => {
        setIsExporting(true);
        try {
            const fileName = `Triadmarkets Dashboard - Ranking - ${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`;
            await pdfService.generate('ranking-content', fileName);
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
            const perfRes = await getAdPerformance({ date_preset: datePreset });
            const adsRes = await getAds();

            const allAds = adsRes.data.data || [];
            const perfData = perfRes.data.data?.results || {};

            const adsWithScore = allAds
                .map(ad => ({ ...ad, perf: perfData[ad.id] }))
                .filter(ad => ad.perf && ad.perf.level !== 'no_data')
                .sort((a, b) => b.perf.score - a.perf.score);

            setRankedAds(adsWithScore);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [datePreset]);

    useEffect(() => { fetchData(); }, [fetchData]);

    if (loading) return <div className="loading-container"><div className="loading-spinner"></div><p className="loading-text">Analisando milhares de dados...</p></div>;
    if (error) return <div className="error-container"><h3>Erro ao carregar ranking</h3><p>{error}</p><button className="btn-retry" onClick={fetchData}>Tentar novamente</button></div>;

    const topAds = rankedAds.slice(0, 5);
    // Get the last 5 ads that have the worst score
    const bottomAds = [...rankedAds].filter(ad => ad.perf.score < 50).reverse().slice(0, 5);

    return (
        <div className="ranking-page">
            <div className="page-header">
                <div>
                    <h2>Ranking de Anuncios</h2>
                    <p className="page-header-subtitle">Os melhores e piores criativos baseados no Score de Performance</p>
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

            <div id="ranking-content">

                <div className="ranking-container">
                    <section className="ranking-section top-ranking">
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}><FiAward color="#10b981" /> Top 5 Anuncios (Campeoes)</h3>
                        <p className="section-desc" style={{ marginBottom: 24, color: 'var(--text-muted)' }}>Estes anuncios estao com a melhor eficiencia na conta atualmente.</p>

                        <div className="podium-grid">
                            {topAds.map((ad, idx) => (
                                <RankingCard key={ad.id} ad={ad} rank={idx + 1} isTop={true} />
                            ))}
                            {topAds.length === 0 && <p className="empty-state">Nenhum anuncio com dados suficientes neste periodo.</p>}
                        </div>
                    </section>

                    <section className="ranking-section bottom-ranking" style={{ marginTop: 40 }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}><FiTrendingDown color="#ef4444" /> Bottom 5 Anuncios (Atencao)</h3>
                        <p className="section-desc" style={{ marginBottom: 24, color: 'var(--text-muted)' }}>Anuncios que estao drenando orcamento ou com baixa performance (Score &lt; 50).</p>

                        <div className="list-grid">
                            {bottomAds.map((ad, idx) => (
                                <RankingCard key={ad.id} ad={ad} rank={idx + 1} isTop={false} />
                            ))}
                            {bottomAds.length === 0 && <p className="empty-state">Nenhum anuncio ruim (Score &lt; 50) encontrado neste periodo. Otimo trabalho!</p>}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

export default Ranking;
