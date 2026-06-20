const CATEGORY_COLORS = {
  'Alimentación': 'rgba(239, 83, 80, 0.2)',
  'Transporte': 'rgba(66, 165, 245, 0.2)',
  'Ocio': 'rgba(171, 71, 188, 0.2)',
  'Salud': 'rgba(102, 187, 106, 0.2)',
  'Hogar': 'rgba(255, 167, 38, 0.2)',
  'Educación': 'rgba(38, 198, 218, 0.2)',
  'Otros': 'rgba(158, 158, 158, 0.2)'
};

const CATEGORY_TEXT = {
  'Alimentación': '#ff8a80',
  'Transporte': '#82b1ff',
  'Ocio': '#ea80fc',
  'Salud': '#b9f6ca',
  'Hogar': '#ffd180',
  'Educación': '#84ffff',
  'Otros': '#f5f5f5'
};

const CATEGORY_ICONS = {
  'Alimentación': '🍔',
  'Transporte': '🚌',
  'Ocio': '🍿',
  'Salud': '💊',
  'Hogar': '🏠',
  'Educación': '📚',
  'Otros': '📦'
};

export default function ExpenseTable({ expenses, onEdit, onDelete }) {
  if (expenses.length === 0) {
    return <p style={{ color: 'var(--text-muted)' }}>No hay gastos registrados aún.</p>;
  }

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Concepto</th>
            <th>Categoría</th>
            <th style={{ textAlign: 'right' }}>Importe</th>
            <th style={{ textAlign: 'center' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((exp) => (
            <tr key={exp.id}>
              <td style={{ color: 'var(--text-muted)' }}>
                {new Date(exp.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
              </td>
              <td style={{ fontWeight: 500 }}>{exp.concepto}</td>
              <td>
                <span 
                  className="badge" 
                  style={{ 
                    backgroundColor: CATEGORY_COLORS[exp.categoria] || CATEGORY_COLORS['Otros'],
                    color: CATEGORY_TEXT[exp.categoria] || CATEGORY_TEXT['Otros'],
                    border: `1px solid ${CATEGORY_COLORS[exp.categoria] || CATEGORY_COLORS['Otros']}`
                  }}
                >
                  <span style={{ marginRight: '6px' }}>{CATEGORY_ICONS[exp.categoria] || '📦'}</span>
                  {exp.categoria}
                </span>
              </td>
              <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--accent-secondary)' }}>
                {exp.importe.toFixed(2)} €
              </td>
              <td>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                  <button className="btn" onClick={() => onEdit(exp)} title="Editar" style={{ padding: '0.5rem' }}>
                    ✏️
                  </button>
                  <button className="btn btn-danger" onClick={() => onDelete(exp.id)} title="Eliminar" style={{ padding: '0.5rem' }}>
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
