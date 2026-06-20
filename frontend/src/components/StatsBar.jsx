export default function StatsBar({ stats }) {
  const totalAmount = stats?.total?.total || 0;
  const count = stats?.total?.count || 0;
  
  // Encontrar la categoría con más gastos
  let topCategory = { categoria: 'N/A', total: 0 };
  if (stats?.byCategory?.length > 0) {
    topCategory = stats.byCategory[0];
  }

  const avg = count > 0 ? (totalAmount / count).toFixed(2) : '0.00';

  return (
    <div className="stats-grid animate-slide-down" style={{ animationDelay: '0.1s' }}>
      <div className="glass-panel stat-card">
        <span className="title">Gasto Total Acumulado</span>
        <span className="value" style={{ color: 'var(--accent-primary)' }}>
          {totalAmount.toFixed(2)} €
        </span>
      </div>
      
      <div className="glass-panel stat-card">
        <span className="title">Gasto Promedio / Movimiento</span>
        <span className="value" style={{ color: 'var(--accent-secondary)' }}>
          {avg} €
        </span>
      </div>

      <div className="glass-panel stat-card">
        <span className="title">Categoría Principal</span>
        <span className="value" style={{ color: 'var(--text-main)', fontSize: '1.5rem', marginTop: '0.5rem' }}>
          {topCategory.categoria} 
          <span style={{ fontSize: '1rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
            ({topCategory.total.toFixed(2)} €)
          </span>
        </span>
      </div>
    </div>
  );
}
