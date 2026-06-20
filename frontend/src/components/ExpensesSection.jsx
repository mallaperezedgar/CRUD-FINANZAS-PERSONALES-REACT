import { useState, useEffect } from 'react';
import ExpenseForm from './ExpenseForm';
import ExpenseTable from './ExpenseTable';

const API_URL = 'http://localhost:3001/api';

export default function ExpensesSection() {
  const [expenses, setExpenses] = useState([]);
  const [editingExpense, setEditingExpense] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch inicial
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/expenses`);
      const data = await res.json();
      if (data.success) setExpenses(data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (expenseData) => {
    try {
      const isEdit = !!editingExpense;
      const url = isEdit ? `${API_URL}/expenses/${editingExpense.id}` : `${API_URL}/expenses`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseData)
      });
      const data = await res.json();
      
      if (data.success) {
        setEditingExpense(null);
        fetchData();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este gasto?')) return;
    try {
      const res = await fetch(`${API_URL}/expenses/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '2rem', alignItems: 'start' }}>
      <aside>
        <div className="glass-panel" style={{ position: 'sticky', top: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>
            {editingExpense ? '✏️ Editar Gasto' : '✨ Nuevo Gasto'}
          </h2>
          <ExpenseForm 
            onSave={handleSave} 
            initialData={editingExpense} 
            onCancel={() => setEditingExpense(null)}
          />
        </div>
      </aside>

      <section>
        <div className="glass-panel">
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>📋 Historial de Movimientos</h2>
          {loading ? (
            <p style={{ color: 'var(--text-muted)' }}>Cargando gastos...</p>
          ) : (
            <ExpenseTable 
              expenses={expenses} 
              onEdit={handleEdit} 
              onDelete={handleDelete} 
            />
          )}
        </div>
      </section>
    </div>
  );
}
