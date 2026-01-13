
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { LayoutDashboard, Droplets, MapPin, List, PlusCircle, Menu, ChevronLeft, ChevronRight, X, CloudOff, Save } from 'lucide-react';
import Dashboard from './components/Dashboard';
import GaugeManager from './components/GaugeManager';
import RecordForm from './components/RecordForm';
import MapVisualization from './components/MapVisualization';
import { Gauge, RainfallRecord } from './types';
import { db } from './firebase';
import { collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';

const App: React.FC = () => {
  const [gauges, setGauges] = useState<Gauge[]>([]);
  const [records, setRecords] = useState<RainfallRecord[]>([]);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [usingLocalStorage, setUsingLocalStorage] = useState(false);

  // Inicialização de Dados (Híbrido: Firebase ou LocalStorage)
  useEffect(() => {
    // Caso 1: Firebase NÃO configurado ou nulo
    if (!db) {
      setUsingLocalStorage(true);
      const localGauges = JSON.parse(localStorage.getItem('agrorain_gauges') || '[]');
      const localRecords = JSON.parse(localStorage.getItem('agrorain_records') || '[]');
      setGauges(localGauges);
      setRecords(localRecords);
      return;
    }

    // Caso 2: Firebase Configurado - Tentar Conexão
    try {
      // Ouvinte para Pluviômetros
      const qGauges = query(collection(db, 'gauges'));
      const unsubscribeGauges = onSnapshot(qGauges, (snapshot) => {
        const gaugesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Gauge[];
        setGauges(gaugesData);
        setDbError(null);
      }, (error) => {
        console.error("Erro ao conectar pluviometros:", error);
        setDbError("Erro de conexão com o banco de dados. Verifique o console.");
      });

      // Ouvinte para Registros de Chuva
      const qRecords = query(collection(db, 'records'), orderBy('date', 'desc'));
      const unsubscribeRecords = onSnapshot(qRecords, (snapshot) => {
        const recordsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as RainfallRecord[];
        setRecords(recordsData);
      }, (error) => console.error("Erro ao conectar registros:", error));

      return () => {
        unsubscribeGauges();
        unsubscribeRecords();
      };
    } catch (err) {
      console.error("Falha crítica no Firebase:", err);
      setDbError("Erro ao inicializar conexão. Usando modo offline.");
      setUsingLocalStorage(true);
    }
  }, []);

  const addGauge = async (gauge: Gauge) => {
    if (db && !usingLocalStorage) {
      try {
        const { id, ...data } = gauge; 
        await addDoc(collection(db, 'gauges'), data);
      } catch (e) {
        alert("Erro ao salvar no Firebase: " + e);
      }
    } else {
      // Fallback LocalStorage
      const newGauges = [...gauges, gauge];
      setGauges(newGauges);
      localStorage.setItem('agrorain_gauges', JSON.stringify(newGauges));
    }
  };

  const deleteGauge = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este pluviômetro?")) return;

    if (db && !usingLocalStorage) {
      try {
        await deleteDoc(doc(db, 'gauges', id));
      } catch (e) {
        alert("Erro ao excluir do Firebase: " + e);
      }
    } else {
      // Fallback LocalStorage
      const newGauges = gauges.filter(g => g.id !== id);
      setGauges(newGauges);
      localStorage.setItem('agrorain_gauges', JSON.stringify(newGauges));
    }
  };

  const addRecord = async (record: RainfallRecord) => {
    if (db && !usingLocalStorage) {
      try {
        const { id, ...data } = record;
        await addDoc(collection(db, 'records'), data);
      } catch (e) {
        alert("Erro ao salvar no Firebase: " + e);
      }
    } else {
      // Fallback LocalStorage
      const newRecords = [record, ...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecords(newRecords);
      localStorage.setItem('agrorain_records', JSON.stringify(newRecords));
    }
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
            <div className={`flex items-center gap-2 ${isSidebarCollapsed ? 'md:hidden' : ''}`}>
              <Droplets className="w-8 h-8 text-emerald-300" />
              <h1 className="text-2xl font-bold tracking-tight">AgroRain</h1>
            </div>
            <div className={`hidden ${isSidebarCollapsed ? 'md:block' : ''}`}>
               <Droplets className="w-8 h-8 text-emerald-300" />
            </div>
            <button 
              onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 hover:bg-emerald-700 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

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
        <main className="flex-1 p-4 md:p-8 overflow-y-auto overflow-x-hidden relative">
          {usingLocalStorage && (
            <div className="mb-4 bg-amber-100 border-l-4 border-amber-500 text-amber-800 p-4 rounded flex items-center gap-3 shadow-sm">
              <Save className="w-5 h-5" />
              <div>
                <p className="font-bold text-sm">Modo Offline / Demonstração</p>
                <p className="text-xs">O Firebase não está configurado. Os dados estão sendo salvos apenas neste navegador.</p>
              </div>
            </div>
          )}
          
          {dbError && !usingLocalStorage && (
             <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded flex items-center gap-3">
               <CloudOff />
               <div>
                 <p className="font-bold">Erro de Conexão</p>
                 <p>{dbError}</p>
               </div>
             </div>
          )}

          <Routes>
            <Route path="/" element={<Dashboard records={records} gauges={gauges} />} />
            <Route path="/gauges" element={<GaugeManager gauges={gauges} onAdd={addGauge} onDelete={deleteGauge} />} />
            <Route path="/add-record" element={<RecordForm gauges={gauges} onAdd={addRecord} />} />
            <Route path="/map" element={<MapVisualization gauges={gauges} records={records} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
