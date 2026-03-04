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
  if (s === 'PAUSED') return 'paused';
  return 'inactive';
}

function getStatusLabel(status) {
  const labels = {
    ACTIVE: 'Ativo',
    PAUSED: 'Pausado',
    ARCHIVED: 'Arquivado',
    DELETED: 'Deletado',
  };
  return labels[(status || '').toUpperCase()] || status;
}

function CampaignTable({ campaigns, insights }) {
  const navigate = useNavigate();

  // Merge campaign data with insights
  const mergedData = campaigns.map(campaign => {
    const campaignInsights = insights.filter(i => i.campaign_id === campaign.id);
    const aggregated = campaignInsights.reduce((acc, ins) => {
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

    const ctr = aggregated.impressions > 0 ? (aggregated.clicks / aggregated.impressions * 100) : 0;
    const cpc = aggregated.clicks > 0 ? (aggregated.spend / aggregated.clicks) : 0;
    const cpm = aggregated.impressions > 0 ? (aggregated.spend / aggregated.impressions * 1000) : 0;
    const results = aggregated.actions['link_click'] || aggregated.actions['landing_page_view'] || aggregated.actions['offsite_conversion.fb_pixel_purchase'] || 0;
    const costPerResult = results > 0 ? aggregated.spend / results : 0;

    return {
      ...campaign,
      ...aggregated,
      ctr,
      cpc,
      cpm,
      results,
      costPerResult,
    };
  });

  return (
    <div className="table-card">
      <div className="table-card-header">
        <h3 className="table-card-title">Campanhas ({campaigns.length})</h3>
      </div>
      <div className="table-container">
        <table className="campaign-table">
          <thead>
            <tr>
              <th>Campanha</th>
              <th>Status</th>
              <th>Gasto</th>
              <th>Impressões</th>
              <th>Alcance</th>
              <th>Cliques</th>
              <th>CTR</th>
              <th>CPC</th>
              <th>CPM</th>
              <th>Resultados</th>
              <th>Custo/Resultado</th>
            </tr>
          </thead>
          <tbody>
            {mergedData.map(c => (
              <tr key={c.id} onClick={() => navigate(`/campaign/${c.id}`)}>
                <td className="campaign-name" title={c.name}>{c.name}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(c.effective_status)}`}>
                    <span className="status-dot"></span>
                    {getStatusLabel(c.effective_status)}
                  </span>
                </td>
                <td>{formatCurrency(c.spend)}</td>
                <td>{formatNumber(c.impressions)}</td>
                <td>{formatNumber(c.reach)}</td>
                <td>{formatNumber(c.clicks)}</td>
                <td>{formatPercent(c.ctr)}</td>
                <td>{formatCurrency(c.cpc)}</td>
                <td>{formatCurrency(c.cpm)}</td>
                <td>{formatNumber(c.results)}</td>
                <td>{formatCurrency(c.costPerResult)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CampaignTable;
