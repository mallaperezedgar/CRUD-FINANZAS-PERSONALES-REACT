import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell
} from 'recharts';
import './Statistics.css';

const API_URL = 'http://localhost:3001/api';

export default function Statistics() {
  const [data, setData] = useState([]);
  const [period, setPeriod] = useState('monthly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBalanceStats();
  }, [period]);

  const fetchBalanceStats = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/balance-stats?period=${period}`);
      const result = await res.json();
      if (result.success) {
        const processed = (result.data || []).map(item => ({
          periodo: formatPeriod(item.periodo, period),
          ingresos: item.total_ingresos || 0,
          gastos: item.total_gastos || 0,
          balance: (item.total_ingresos || 0) - (item.total_gastos || 0)
        })).reverse();
        setData(processed);
      }
    } catch (error) {
      console.error('Error fetching balance stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPeriod = (periodo, periodType) => {
    if (!periodo) return 'N/A';
    
    if (periodType === 'weekly') {
      return `Sem ${periodo.split('-W')[1]}`;
    } else if (periodType === 'yearly') {
      return periodo;
    } else {
      // Monthly
      const [year, month] = periodo.split('-');
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      return `${months[parseInt(month) - 1]} ${year}`;
    }
  };

  const getBarColor = (value) => {
    return value >= 0 ? '#66bb6a' : '#ef5350';
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip glass-panel">
          <p>{data.periodo}</p>
          <p style={{ color: 'var(--success)' }}>Ingresos: ${data.ingresos.toFixed(2)}</p>
          <p style={{ color: 'var(--danger)' }}>Gastos: ${data.gastos.toFixed(2)}</p>
          <p style={{ color: data.balance >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 'bold' }}>
            Balance: ${data.balance.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  const totalIngresos = data.reduce((sum, item) => sum + item.ingresos, 0);
  const totalGastos = data.reduce((sum, item) => sum + item.gastos, 0);
  const totalBalance = totalIngresos - totalGastos;

  return (
    <div className="statistics">
      <div className="stats-header">
        <div className="period-selector">
          <label>Período:</label>
          <div className="button-group">
            {['weekly', 'monthly', 'yearly'].map(p => (
              <button
                key={p}
                className={`period-btn ${period === p ? 'active' : ''}`}
                onClick={() => setPeriod(p)}
              >
                {p === 'weekly' ? 'Semanal' : p === 'monthly' ? 'Mensual' : 'Anual'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="stats-summary">
        <div className="stat-summary-card income">
          <div className="stat-label">Total Ingresos</div>
          <div className="stat-value">${totalIngresos.toFixed(2)}</div>
        </div>
        <div className="stat-summary-card expense">
          <div className="stat-label">Total Gastos</div>
          <div className="stat-value">${totalGastos.toFixed(2)}</div>
        </div>
        <div className={`stat-summary-card balance ${totalBalance >= 0 ? 'positive' : 'negative'}`}>
          <div className="stat-label">Balance Neto</div>
          <div className="stat-value">${totalBalance.toFixed(2)}</div>
        </div>
      </div>

      <div className="glass-panel">
        {loading ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
            Cargando estadísticas...
          </p>
        ) : data.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
            No hay datos disponibles para mostrar
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis 
                dataKey="periodo" 
                tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              />
              <YAxis 
                tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ color: 'var(--text-main)' }}
                formatter={(value) => {
                  const labels = { ingresos: 'Ingresos', gastos: 'Gastos' };
                  return labels[value] || value;
                }}
              />
              <Bar dataKey="ingresos" fill="var(--success)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="gastos" fill="var(--danger)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {data.length > 0 && (
        <div className="stats-table glass-panel">
          <h3 style={{ marginBottom: '1.5rem' }}>Detalle por Período</h3>
          <table>
            <thead>
              <tr>
                <th>Período</th>
                <th>Ingresos</th>
                <th>Gastos</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.periodo}</td>
                  <td className="amount-positive">${item.ingresos.toFixed(2)}</td>
                  <td className="amount-negative">${item.gastos.toFixed(2)}</td>
                  <td className={item.balance >= 0 ? 'amount-positive' : 'amount-negative'}>
                    ${item.balance.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
