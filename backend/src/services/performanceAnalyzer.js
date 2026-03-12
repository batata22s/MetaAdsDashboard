/**
 * Performance Analyzer Service
 * Analyzes ad metrics against account averages and generates scores + alerts
 */

class PerformanceAnalyzer {
  /**
   * Calculate averages from all ads insights
   */
  calculateAverages(allInsights) {
    const valid = allInsights.filter(i => i && Number(i.impressions) > 0);
    if (valid.length === 0) return null;

    const totals = valid.reduce((acc, ins) => {
      acc.ctr += Number(ins.ctr || 0);
      acc.cpc += Number(ins.cpc || 0);
      acc.cpm += Number(ins.cpm || 0);
      acc.frequency += Number(ins.frequency || 0);
      acc.spend += Number(ins.spend || 0);
      acc.impressions += Number(ins.impressions || 0);
      acc.clicks += Number(ins.clicks || 0);

      // Count conversions
      let conversions = 0;
      if (ins.actions) {
        ins.actions.forEach(a => {
          if (['purchase', 'complete_registration', 'lead', 'initiate_checkout',
            'offsite_conversion.fb_pixel_purchase', 'offsite_conversion.fb_pixel_complete_registration',
            'offsite_conversion.fb_pixel_lead'].includes(a.action_type)) {
            conversions += Number(a.value || 0);
          }
        });
      }
      acc.conversions += conversions;
      acc.conversionRate += (Number(ins.clicks || 0) > 0) ? (conversions / Number(ins.clicks)) * 100 : 0;
      return acc;
    }, { ctr: 0, cpc: 0, cpm: 0, frequency: 0, spend: 0, impressions: 0, clicks: 0, conversions: 0, conversionRate: 0 });

    const count = valid.length;
    return {
      ctr: totals.ctr / count,
      cpc: totals.cpc / count,
      cpm: totals.cpm / count,
      frequency: totals.frequency / count,
      conversionRate: totals.conversionRate / count,
      totalAds: count,
    };
  }

  /**
   * Score a single metric (0-100)
   * higherIsBetter: true for CTR, conversionRate; false for CPC, CPM
   */
  scoreMetric(value, average, higherIsBetter = true) {
    if (!average || average === 0) return 50; // neutral if no baseline

    const ratio = value / average;

    if (higherIsBetter) {
      if (ratio >= 1.5) return 100;
      if (ratio >= 1.2) return 85;
      if (ratio >= 1.0) return 70;
      if (ratio >= 0.8) return 50;
      if (ratio >= 0.5) return 30;
      return 15;
    } else {
      // Lower is better (CPC, CPM)
      if (ratio <= 0.5) return 100;
      if (ratio <= 0.8) return 85;
      if (ratio <= 1.0) return 70;
      if (ratio <= 1.2) return 50;
      if (ratio <= 1.5) return 30;
      return 15;
    }
  }

  /**
   * Score frequency (sweet spot: 1-3)
   */
  scoreFrequency(frequency) {
    if (frequency >= 1 && frequency <= 2) return 100;
    if (frequency <= 3) return 80;
    if (frequency <= 4) return 55;
    if (frequency <= 5) return 35;
    return 15;
  }

  /**
   * Generate alerts for an ad
   */
  generateAlerts(metrics, averages) {
    const alerts = [];

    if (metrics.frequency > 4) {
      alerts.push({
        type: 'warning',
        icon: '🔄',
        title: 'Frequencia muito alta',
        message: `Frequencia de ${metrics.frequency.toFixed(1)}. O publico pode estar saturado. Considere trocar o publico-alvo.`,
      });
    } else if (metrics.frequency > 3) {
      alerts.push({
        type: 'caution',
        icon: '⚠️',
        title: 'Frequencia elevada',
        message: `Frequencia de ${metrics.frequency.toFixed(1)}. Fique atento a possivel saturacao.`,
      });
    }

    if (metrics.ctr < 1) {
      alerts.push({
        type: 'warning',
        icon: '👆',
        title: 'CTR muito baixo',
        message: `CTR de ${metrics.ctr.toFixed(2)}%. O criativo pode nao estar atraindo cliques. Teste novos titulos ou imagens.`,
      });
    }

    if (averages && metrics.cpc > averages.cpc * 1.5) {
      alerts.push({
        type: 'warning',
        icon: '💰',
        title: 'CPC acima da media',
        message: `CPC de R$ ${metrics.cpc.toFixed(2)} vs media de R$ ${averages.cpc.toFixed(2)}. Revise segmentacao ou lance.`,
      });
    }

    if (metrics.clicks > 20 && metrics.conversions === 0) {
      alerts.push({
        type: 'warning',
        icon: '🎯',
        title: 'Sem conversoes',
        message: `${metrics.clicks} cliques sem conversoes registradas. Verifique o pixel ou a landing page.`,
      });
    }

    if (metrics.ctr > (averages?.ctr || 2) * 1.3) {
      alerts.push({
        type: 'success',
        icon: '🌟',
        title: 'CTR acima da media!',
        message: `CTR de ${metrics.ctr.toFixed(2)}% esta ${((metrics.ctr / (averages?.ctr || 1) - 1) * 100).toFixed(0)}% acima da media. Otimo criativo!`,
      });
    }

    if (averages && metrics.cpc < averages.cpc * 0.7 && metrics.cpc > 0) {
      alerts.push({
        type: 'success',
        icon: '💎',
        title: 'CPC muito bom!',
        message: `CPC de R$ ${metrics.cpc.toFixed(2)} esta ${((1 - metrics.cpc / averages.cpc) * 100).toFixed(0)}% abaixo da media. Excelente eficiencia!`,
      });
    }

    return alerts;
  }

  /**
   * Analyze a single ad
   */
  analyzeAd(adInsights, averages) {
    if (!adInsights || Number(adInsights.impressions || 0) === 0) {
      return {
        score: 0,
        level: 'no_data',
        label: 'Sem Dados',
        color: '#6B6D78',
        metrics: {},
        alerts: [{ type: 'info', icon: 'ℹ️', title: 'Sem dados', message: 'Este anuncio nao teve impressoes no periodo selecionado.' }],
        breakdown: {},
      };
    }

    const ctr = Number(adInsights.ctr || 0);
    const cpc = Number(adInsights.cpc || 0);
    const cpm = Number(adInsights.cpm || 0);
    const frequency = Number(adInsights.frequency || 0);
    const clicks = Number(adInsights.clicks || 0);
    const spend = Number(adInsights.spend || 0);

    let conversions = 0;
    if (adInsights.actions) {
      adInsights.actions.forEach(a => {
        if (['purchase', 'complete_registration', 'lead', 'initiate_checkout',
          'offsite_conversion.fb_pixel_purchase', 'offsite_conversion.fb_pixel_complete_registration',
          'offsite_conversion.fb_pixel_lead'].includes(a.action_type)) {
          conversions += Number(a.value || 0);
        }
      });
    }
    const conversionRate = clicks > 0 ? (conversions / clicks) * 100 : 0;

    const metrics = { ctr, cpc, cpm, frequency, conversions, conversionRate, clicks, spend };

    // Score each metric
    const ctrScore = this.scoreMetric(ctr, averages?.ctr, true);
    const cpcScore = this.scoreMetric(cpc, averages?.cpc, false);
    const convScore = this.scoreMetric(conversionRate, averages?.conversionRate, true);
    const freqScore = this.scoreFrequency(frequency);

    // Weighted average (CTR: 30%, CPC: 25%, Conversions: 30%, Frequency: 15%)
    const totalScore = Math.round(
      ctrScore * 0.30 +
      cpcScore * 0.25 +
      convScore * 0.30 +
      freqScore * 0.15
    );

    let level, label, color;
    if (totalScore >= 80) { level = 'excellent'; label = 'Excelente'; color = '#10b981'; }
    else if (totalScore >= 60) { level = 'good'; label = 'Bom'; color = '#3b82f6'; }
    else if (totalScore >= 40) { level = 'regular'; label = 'Regular'; color = '#f59e0b'; }
    else { level = 'poor'; label = 'Precisa Melhorar'; color = '#ef4444'; }

    const alerts = this.generateAlerts(metrics, averages);
    const breakdown = {
      ctr: { score: ctrScore, value: ctr, average: averages?.ctr || 0 },
      cpc: { score: cpcScore, value: cpc, average: averages?.cpc || 0 },
      conversions: { score: convScore, value: conversionRate, average: averages?.conversionRate || 0 },
      frequency: { score: freqScore, value: frequency, average: averages?.frequency || 0 },
    };

    let reasoning = 'Análise padrão finalizada sem anomalias detectadas.';
    if (alerts.length > 0) {
      const bestAlert = alerts.find(a => a.type === 'success') || alerts[0];
      reasoning = bestAlert.message;
    } else {
      if (totalScore >= 80) reasoning = 'Desempenho ótimo com métricas eficientes em CTR e conversão.';
      else if (totalScore >= 60) reasoning = 'Desempenho sólido dentro das médias históricas da conta.';
      else if (totalScore >= 40) reasoning = 'Desempenho morno. Os custos podem estar subindo.';
      else reasoning = 'Baixa eficiência na entrega. Avalie pausar ou testar outro criativo.';
    }

    return { score: totalScore, level, label, color, reasoning, metrics, alerts, breakdown };
  }

  /**
   * Analyze all ads
   */
  analyzeAll(adsInsightsMap) {
    const allInsights = Object.values(adsInsightsMap).filter(Boolean);
    const averages = this.calculateAverages(allInsights);

    const results = {};
    for (const [adId, insights] of Object.entries(adsInsightsMap)) {
      results[adId] = this.analyzeAd(insights, averages);
    }

    return { averages, results };
  }
}

module.exports = new PerformanceAnalyzer();