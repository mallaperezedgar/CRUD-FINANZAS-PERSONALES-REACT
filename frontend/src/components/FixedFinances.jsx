import { useState, useEffect } from 'react';
import './FixedFinances.css';

const API_URL = 'http://localhost:3001/api';

export default function FixedFinances() {
  const [finances, setFinances] = useState([]);
  const [formData, setFormData] = useState({
    concepto: '',
    importe: '',
    tipo: 'ingreso_fijo',
    frecuencia: 'mensual'
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch inicial
  useEffect(() => {
    fetchFinances();
  }, []);

  const fetchFinances = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/recurring-finances`);
      const data = await res.json();
      if (data.success) setFinances(data.data);
    } catch (error) {
      console.error('Error fetching finances:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const isEdit = editingId !== null;
      const url = isEdit ? `${API_URL}/recurring-finances/${editingId}` : `${API_URL}/recurring-finances`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (data.success) {
        setFormData({ concepto: '', importe: '', tipo: 'ingreso_fijo', frecuencia: 'mensual' });
        setEditingId(null);
        fetchFinances();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      concepto: item.concepto,
      importe: item.importe,
      tipo: item.tipo,
      frecuencia: item.frecuencia
    });
    setEditingId(item.id);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este registro?')) return;
    try {
      const res = await fetch(`${API_URL}/recurring-finances/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchFinances();
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleCancel = () => {
    setFormData({ concepto: '', importe: '', tipo: 'ingreso_fijo', frecuencia: 'mensual' });
    setEditingId(null);
  };

  // Separar ingresos y gastos fijos
  const ingresos = finances.filter(f => f.tipo === 'ingreso_fijo');
  const gastos = finances.filter(f => f.tipo === 'gasto_fijo');
  const totalIngresos = ingresos.reduce((sum, f) => sum + f.importe, 0);
  const totalGastos = gastos.reduce((sum, f) => sum + f.importe, 0);
  const balance = totalIngresos - totalGastos;

  return (
    <div className="fixed-finances">
      <div className="summary-cards">
        <div className="summary-card income">
          <div className="summary-label">Ingresos Fijos</div>
          <div className="summary-value">${totalIngresos.toFixed(2)}</div>
        </div>
        <div className="summary-card expense">
          <div className="summary-label">Gastos Fijos</div>
          <div className="summary-value">${totalGastos.toFixed(2)}</div>
        </div>
        <div className={`summary-card balance ${balance >= 0 ? 'positive' : 'negative'}`}>
          <div className="summary-label">Balance</div>
          <div className="summary-value">${balance.toFixed(2)}</div>
        </div>
      </div>

      <div className="finances-grid">
        <aside className="glass-panel">
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>
            {editingId ? '✏️ Editar' : '✨ Nuevo Ingreso/Gasto Fijo'}
          </h3>
          <form onSubmit={handleSubmit} className="animate-fade-in">
            <div className="input-group">
              <label>Concepto</label>
              <input 
                type="text" 
                name="concepto" 
                value={formData.concepto} 
                onChange={handleChange} 
                placeholder="Ej. Nómina, Netflix, etc."
                required 
              />
            </div>

            <div className="input-group">
              <label>Importe (€)</label>
              <input 
                type="number" 
                name="importe" 
                step="0.01" 
                min="0.01"
                value={formData.importe} 
                onChange={handleChange} 
                placeholder="0.00"
                required 
              />
            </div>

            <div className="input-group">
              <label>Tipo</label>
              <select name="tipo" value={formData.tipo} onChange={handleChange} required>
                <option value="ingreso_fijo">Ingreso Fijo</option>
                <option value="gasto_fijo">Gasto Fijo</option>
              </select>
            </div>

            <div className="input-group">
              <label>Frecuencia</label>
              <select name="frecuencia" value={formData.frecuencia} onChange={handleChange} required>
                <option value="mensual">Mensual</option>
                <option value="semanal">Semanal</option>
                <option value="anual">Anual</option>
              </select>
            </div>

            <div className="form-buttons">
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Actualizar' : 'Guardar'}
              </button>
              {editingId && (
                <button type="button" className="btn" onClick={handleCancel}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </aside>

        <section>
          {loading ? (
            <p style={{ color: 'var(--text-muted)' }}>Cargando finanzas...</p>
          ) : (
            <>
              {ingresos.length > 0 && (
                <div className="glass-panel" style={{ marginBottom: '2rem' }}>
                  <h3 style={{ marginBottom: '1rem', color: 'var(--success)' }}>💵 Ingresos Fijos ({ingresos.length})</h3>
                  <div className="finances-list">
                    {ingresos.map(item => (
                      <div key={item.id} className="finance-item income">
                        <div className="finance-info">
                          <div className="finance-concept">{item.concepto}</div>
                          <div className="finance-meta">
                            <span className="badge">{item.frecuencia}</span>
                            <span className="finance-amount">${item.importe.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="finance-actions">
                          <button 
                            className="btn-icon edit"
                            onClick={() => handleEdit(item)}
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button 
                            className="btn-icon delete"
                            onClick={() => handleDelete(item.id)}
                            title="Eliminar"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {gastos.length > 0 && (
                <div className="glass-panel">
                  <h3 style={{ marginBottom: '1rem', color: 'var(--danger)' }}>💳 Gastos Fijos ({gastos.length})</h3>
                  <div className="finances-list">
                    {gastos.map(item => (
                      <div key={item.id} className="finance-item expense">
                        <div className="finance-info">
                          <div className="finance-concept">{item.concepto}</div>
                          <div className="finance-meta">
                            <span className="badge">{item.frecuencia}</span>
                            <span className="finance-amount">${item.importe.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="finance-actions">
                          <button 
                            className="btn-icon edit"
                            onClick={() => handleEdit(item)}
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button 
                            className="btn-icon delete"
                            onClick={() => handleDelete(item.id)}
                            title="Eliminar"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {finances.length === 0 && (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '2rem' }}>
                  <p style={{ color: 'var(--text-muted)' }}>No hay ingresos ni gastos fijos registrados</p>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
