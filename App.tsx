
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Droplets, MapPin, List, PlusCircle, Menu, ChevronLeft, ChevronRight, X } from 'lucide-react';
import Dashboard from './components/Dashboard';
import GaugeManager from './components/GaugeManager';
import RecordForm from './components/RecordForm';
import MapVisualization from './components/MapVisualization';
import { Gauge, RainfallRecord } from './types';

const App: React.FC = () => {
  const [gauges, setGauges] = useState<Gauge[]>([]);
  const [records, setRecords] = useState<RainfallRecord[]>([]);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Persistence
  useEffect(() => {
    const savedGauges = localStorage.getItem('agrorain_gauges');
    const savedRecords = localStorage.getItem('agrorain_records');
    if (savedGauges) setGauges(JSON.parse(savedGauges));
    if (savedRecords) setRecords(JSON.parse(savedRecords));
  }, []);

  useEffect(() => {
    localStorage.setItem('agrorain_gauges', JSON.stringify(gauges));
  }, [gauges]);

  useEffect(() => {
    localStorage.setItem('agrorain_records', JSON.stringify(records));
  }, [records]);

  const addGauge = (gauge: Gauge) => {
    setGauges(prev => [...prev, gauge]);
  };

  const addRecord = (record: RainfallRecord) => {
    setRecords(prev => [...prev, record]);
  };

  // Close mobile menu when route changes
  const NavLink = ({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) => (
    <li>
      <Link 
        to={to} 
        onClick={() => setMobileMenuOpen(false)}
        className={`
          flex items-center gap-3 hover:bg-emerald-700/50 hover:text-emerald-300 transition-all p-3 rounded-lg
          ${isSidebarCollapsed ? 'md:justify-center' : ''}
        `}
        title={isSidebarCollapsed ? label : ''}
      >
        <div className="shrink-0">{icon}</div>
        <span className={`whitespace-nowrap transition-all duration-300 ${isSidebarCollapsed ? 'md:w-0 md:opacity-0 md:overflow-hidden' : 'md:w-auto md:opacity-100'}`}>
          {label}
        </span>
      </Link>
    </li>
  );

  return (
    <Router>
      <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
        {/* Navigation Sidebar */}
        <nav 
          className={`
            bg-emerald-800 text-white flex flex-col shrink-0 transition-all duration-300 ease-in-out relative z-40
            ${isSidebarCollapsed ? 'md:w-20' : 'md:w-64'}
            w-full
          `}
        >
          {/* Header & Logo */}
          <div className={`p-4 flex items-center justify-between ${isSidebarCollapsed ? 'md:justify-center' : ''}`}>
            {/* Mobile/Expanded Logo */}
            <div className={`flex items-center gap-2 ${isSidebarCollapsed ? 'md:hidden' : ''}`}>
              <Droplets className="w-8 h-8 text-emerald-300" />
              <h1 className="text-2xl font-bold tracking-tight">AgroRain</h1>
            </div>

            {/* Collapsed Desktop Logo */}
            <div className={`hidden ${isSidebarCollapsed ? 'md:block' : ''}`}>
               <Droplets className="w-8 h-8 text-emerald-300" />
            </div>

            {/* Mobile Toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 hover:bg-emerald-700 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Desktop Collapse Button */}
          <button 
            onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden md:flex absolute -right-3 top-20 bg-emerald-700 text-white rounded-full p-1 border border-emerald-600 shadow-md hover:bg-emerald-600 transition-colors z-50"
          >
            {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
          
          {/* Menu Items */}
          <div className={`
            flex-1 flex flex-col overflow-hidden transition-all duration-300
            ${isMobileMenuOpen ? 'max-h-[500px] opacity-100 border-t border-emerald-700 md:border-none' : 'max-h-0 opacity-0 md:max-h-full md:opacity-100'}
          `}>
            <ul className="space-y-2 p-4">
              <NavLink to="/" icon={<LayoutDashboard className="w-5 h-5" />} label="Painel Geral" />
              <NavLink to="/gauges" icon={<MapPin className="w-5 h-5" />} label="Pluviômetros" />
              <NavLink to="/add-record" icon={<PlusCircle className="w-5 h-5" />} label="Lançar Chuva" />
              <NavLink to="/map" icon={<List className="w-5 h-5" />} label="Mapa & KML" />
            </ul>

            <div className={`mt-auto p-6 text-emerald-400 text-xs border-t border-emerald-700 transition-opacity duration-300 ${isSidebarCollapsed ? 'md:opacity-0 md:hidden' : 'opacity-100'}`}>
              © 2024 Monitoramento Agrícola
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto overflow-x-hidden">
          <Routes>
            <Route path="/" element={<Dashboard records={records} gauges={gauges} />} />
            <Route path="/gauges" element={<GaugeManager gauges={gauges} onAdd={addGauge} />} />
            <Route path="/add-record" element={<RecordForm gauges={gauges} onAdd={addRecord} />} />
            <Route path="/map" element={<MapVisualization gauges={gauges} records={records} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
