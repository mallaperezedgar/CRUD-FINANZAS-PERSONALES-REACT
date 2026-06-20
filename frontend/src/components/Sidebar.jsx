import './Sidebar.css';

export default function Sidebar({ activeSection, onSectionChange }) {
  const sections = [
    { id: 'expenses', label: '💰 Gastos', icon: '📋' },
    { id: 'finances', label: '💳 Finanzas Personales', icon: '💵' },
    { id: 'statistics', label: '📊 Estadísticas', icon: '📈' }
  ];

  return (
    <nav className="sidebar glass-panel">
      <div className="sidebar-header">
        <h2>Gestor Financiero</h2>
      </div>
      
      <div className="sidebar-menu">
        {sections.map(section => (
          <button
            key={section.id}
            className={`sidebar-item ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => onSectionChange(section.id)}
            title={section.label}
          >
            <span className="sidebar-icon">{section.icon}</span>
            <span className="sidebar-label">{section.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
