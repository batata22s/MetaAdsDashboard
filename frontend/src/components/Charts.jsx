import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#6366f1', '#22d3ee', '#10b981', '#f59e0b', '#ef4444', '#a855f7', '#ec4899', '#3b82f6'];

const tooltipStyle = {
  backgroundColor: '#1a1f35',
  border: '1px solid rgba(99, 102, 241, 0.3)',
  borderRadius: '8px',
  color: '#f1f5f9',
  fontSize: '12px',
};

export function SpendLineChart({ data }) {
  if (!data || data.length === 0) return <div className="loading-text">Sem dados</div>;
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
        <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
        <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Line type="monotone" dataKey="spend" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3, fill: '#6366f1' }} activeDot={{ r: 6 }} name="Gasto (R$)" />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function ImpressionsClicksChart({ data }) {
  if (!data || data.length === 0) return <div className="loading-text">Sem dados</div>;
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
        <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
        <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="clicks" fill="#6366f1" radius={[4, 4, 0, 0]} name="Cliques" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CampaignComparisonChart({ data }) {
  if (!data || data.length === 0) return <div className="loading-text">Sem dados</div>;
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 100, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
        <XAxis type="number" stroke="#64748b" fontSize={11} tickLine={false} />
        <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} width={90} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="spend" fill="#6366f1" radius={[0, 4, 4, 0]} name="Gasto (R$)" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ActionsDonutChart({ data }) {
  if (!data || data.length === 0) return <div className="loading-text">Sem dados</div>;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ flex: '0 0 220px' }}>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" nameKey="name">
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.map((item, i) => (
          <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              width: 10, height: 10, borderRadius: '50%',
              background: COLORS[i % COLORS.length], flexShrink: 0,
            }} />
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', flex: 1, lineHeight: 1.3 }}>
              {item.name}
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
              {item.value.toLocaleString('pt-BR')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}