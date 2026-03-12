import { useState, useEffect } from 'react';
import { FiBarChart2, FiTrendingUp, FiMousePointer, FiTarget } from 'react-icons/fi';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import { getAccountInsights, getXInsights } from '../services/api';

const COLORS = ['#3b82f6', '#1da1f2']; // Meta Blue, X Light Blue/White

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip" style={{ backgroundColor: 'var(--bg-card)', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                <p className="label" style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>{label}</p>
                <p style={{ margin: 0, color: payload[0].color }}>
                    {payload[0].name}: {payload[0].name.includes('Gasto') ? 'R$ ' : ''}{payload[0].value.toLocaleString('pt-BR')}
                </p>
            </div>
        );
    }
    return null;
};

function HomePage() {
    const [loading, setLoading] = useState(true);
    const [globalStats, setGlobalStats] = useState({
        spend: 0,
        impressions: 0,
        clicks: 0,
        costPerResult: 0,
    });

    const [chartData, setChartData] = useState([]);

    const [dateRange] = useState('last_30d');

    useEffect(() => {
        fetchGlobalData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchGlobalData = async () => {
        try {
            setLoading(true);

            const [metaRes, xRes] = await Promise.all([
                getAccountInsights({ date_preset: dateRange }),
                getXInsights({ date_preset: dateRange }).catch(() => ({ data: { data: [] } }))
            ]);

            const metaData = metaRes.data.data?.[0] || {};
            const xData = xRes.data.data?.[0] || {};

            const metaSpend = parseFloat(metaData.spend || 0);
            const xSpend = parseFloat(xData.spend || 0);

            const metaCpc = parseFloat(metaData.cpc || 0);
            const xCpc = parseFloat(xData.cpc || 0);

            const totalSpend = metaSpend + xSpend;
            const totalImpressions = parseInt(metaData.impressions || 0) + parseInt(xData.impressions || 0);
            const totalClicks = parseInt(metaData.clicks || 0) + parseInt(xData.clicks || 0);

            const combinedCpc = totalClicks > 0 ? (totalSpend / totalClicks).toFixed(2) : '0.00';

            setGlobalStats({
                spend: totalSpend.toFixed(2),
                impressions: totalImpressions,
                clicks: totalClicks,
                costPerResult: combinedCpc,
            });

            setChartData([
                { platform: 'Meta Ads', gasto: metaSpend, cliques: parseInt(metaData.clicks || 0), cpc: metaCpc },
                { platform: 'X Ads', gasto: xSpend, cliques: parseInt(xData.clicks || 0), cpc: xCpc }
            ]);

        } catch (error) {
            console.error("Error fetching global stats:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading-container"><div className="loader"></div></div>;

    return (
        <div className="dashboard-container global-dashboard">
            <header className="page-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '24px', marginBottom: '24px' }}>
                <div>
                    <h1 className="page-title" style={{ background: 'linear-gradient(90deg, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Visão Global Omnichannel</h1>
                    <p className="page-subtitle">Soma total de resultados: Meta + X Ads (Últimos 30 dias)</p>
                </div>
            </header>

            <div className="kpi-grid" style={{ marginBottom: '24px' }}>
                <div className="kpi-card">
                    <div className="kpi-header">
                        <h3 className="kpi-title">Gasto Total (R$)</h3>
                        <div className="kpi-icon"><FiBarChart2 /></div>
                    </div>
                    <div className="kpi-value">R$ {parseFloat(globalStats.spend).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-header">
                        <h3 className="kpi-title">Impressões Totais</h3>
                        <div className="kpi-icon"><FiTarget /></div>
                    </div>
                    <div className="kpi-value">{globalStats.impressions.toLocaleString('pt-BR')}</div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-header">
                        <h3 className="kpi-title">Cliques Totais</h3>
                        <div className="kpi-icon"><FiMousePointer /></div>
                    </div>
                    <div className="kpi-value">{globalStats.clicks.toLocaleString('pt-BR')}</div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-header">
                        <h3 className="kpi-title">CPC Médio Combinado</h3>
                        <div className="kpi-icon"><FiTrendingUp /></div>
                    </div>
                    <div className="kpi-value">R$ {globalStats.costPerResult}</div>
                </div>
            </div>

            <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>

                <div className="chart-card">
                    <div className="chart-card-header">
                        <h3 className="chart-card-title">Divisão de Orçamento (Meta vs X)</h3>
                    </div>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={75}
                                    outerRadius={95}
                                    paddingAngle={8}
                                    dataKey="gasto"
                                    nameKey="platform"
                                    label={({ platform, percent }) => `${platform} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(255,255,255,0.1)" strokeWidth={2} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="chart-card">
                    <div className="chart-card-header">
                        <h3 className="chart-card-title">Eficiência (Custo por Clique)</h3>
                    </div>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barSize={40}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="platform" stroke="var(--text-muted)" tickLine={false} axisLine={false} />
                                <YAxis stroke="var(--text-muted)" tickFormatter={(val) => `R$${val}`} tickLine={false} axisLine={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                                <Bar dataKey="cpc" name="Custo Médio" radius={[6, 6, 0, 0]}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>

        </div>
    );
}

export default HomePage;
