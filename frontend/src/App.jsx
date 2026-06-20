import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ExpensesSection from './components/ExpensesSection';
import FixedFinances from './components/FixedFinances';
import Statistics from './components/Statistics';
import StatsBar from './components/StatsBar';
import './index.css';

const API_URL = 'http://localhost:3001/api';

function App() {
  const [activeSection, setActiveSection] = useState('expenses');
  const [stats, setStats] = useState({ total: { total: 0 }, byCategory: [] });

  // Fetch stats para la StatsBar
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_URL}/stats`);
        const data = await res.json();
        if (data.success) setStats(data.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    
    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Refresh cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  const renderSection = () => {
    switch (activeSection) {
      case 'expenses':
        return <ExpensesSection />;
      case 'finances':
        return <FixedFinances />;
      case 'statistics':
        return <Statistics />;
      default:
        return <ExpensesSection />;
    }
  };

  return (
    <div className="app-container animate-fade-in">
      <header className="animate-slide-down">
        <h1>💰 Gestor de Finanzas Personales</h1>
      </header>
      
      <StatsBar stats={stats} />

      <div className="main-layout">
        <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        
        <main className="section-content">
          {renderSection()}
        </main>
      </div>
    </div>
  );
}

export default App;
