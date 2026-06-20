import { useState, useEffect } from 'react';

const CATEGORIES = [
  'Alimentación', 'Transporte', 'Ocio', 
  'Salud', 'Hogar', 'Educación', 'Otros'
];

export default function ExpenseForm({ onSave, initialData, onCancel }) {
  const [formData, setFormData] = useState({
    concepto: '',
    importe: '',
    categoria: CATEGORIES[0],
    fecha: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        concepto: initialData.concepto,
        importe: initialData.importe,
        categoria: initialData.categoria,
        fecha: initialData.fecha
      });
    } else {
      setFormData(prev => ({ ...prev, concepto: '', importe: '' }));
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    if (!initialData) {
      setFormData(prev => ({ ...prev, concepto: '', importe: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="animate-fade-in">
      <div className="input-group">
        <label>Concepto</label>
        <input 
          type="text" 
          name="concepto" 
          value={formData.concepto} 
          onChange={handleChange} 
          placeholder="Ej. Compra supermercado"
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
        <label>Categoría</label>
        <select name="categoria" value={formData.categoria} onChange={handleChange} required>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="input-group">
        <label>Fecha</label>
        <input 
          type="date" 
          name="fecha" 
          value={formData.fecha} 
          onChange={handleChange} 
          required 
        />
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
          {initialData ? 'Guardar Cambios' : 'Añadir Gasto'}
        </button>
        {initialData && (
          <button type="button" className="btn btn-danger" onClick={onCancel}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
