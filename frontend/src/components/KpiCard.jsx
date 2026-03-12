function KpiCard({ label, value, icon, color = 'blue' }) {
  return (
    <div className={`kpi-card glass-glow-${color}`}>
      <div className="kpi-card-header">
        <span className="kpi-card-label">{label}</span>
        <div className={`kpi-card-icon ${color}`}>
          {icon}
        </div>
      </div>
      <div className="kpi-card-value">{value}</div>
    </div>
  );
}

export default KpiCard;
