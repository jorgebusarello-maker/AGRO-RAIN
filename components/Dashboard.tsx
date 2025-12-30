
import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { RainfallRecord, Gauge, DashboardStats } from '../types';
import { format, subDays, startOfWeek, startOfMonth, startOfYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CloudRain, TrendingUp, Calendar, Droplets } from 'lucide-react';

interface Props {
  records: RainfallRecord[];
  gauges: Gauge[];
}

const Dashboard: React.FC<Props> = ({ records, gauges }) => {
  const stats: DashboardStats = useMemo(() => {
    if (records.length === 0) {
      return { dailyAverage: 0, maxRainfall: 0, weeklyTotal: 0, monthlyTotal: 0, seasonTotal: 0 };
    }

    const now = new Date();
    const oneWeekAgo = startOfWeek(now);
    const oneMonthAgo = startOfMonth(now);
    const seasonStart = startOfYear(now);

    const weekly = records.filter(r => new Date(r.date) >= oneWeekAgo).reduce((acc, r) => acc + r.amount, 0);
    const monthly = records.filter(r => new Date(r.date) >= oneMonthAgo).reduce((acc, r) => acc + r.amount, 0);
    const season = records.filter(r => new Date(r.date) >= seasonStart).reduce((acc, r) => acc + r.amount, 0);
    
    const amounts = records.map(r => r.amount);
    const max = Math.max(...amounts);
    const avg = season / (records.length || 1);

    return {
      dailyAverage: avg,
      maxRainfall: max,
      weeklyTotal: weekly,
      monthlyTotal: monthly,
      seasonTotal: season
    };
  }, [records]);

  const chartData = useMemo(() => {
    const days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayRecords = records.filter(r => r.date === dateStr);
      const total = dayRecords.reduce((acc, r) => acc + r.amount, 0);
      return {
        date: format(date, 'dd/MM', { locale: ptBR }),
        amount: total
      };
    }).reverse();
    return days;
  }, [records]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Painel Geral</h2>
          <p className="text-slate-500">Acompanhamento climático da sua propriedade</p>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Média Diária" value={`${stats.dailyAverage.toFixed(1)} mm`} icon={<CloudRain className="w-6 h-6 text-blue-500" />} />
        <StatCard title="Máxima Lançada" value={`${stats.maxRainfall.toFixed(1)} mm`} icon={<TrendingUp className="w-6 h-6 text-red-500" />} />
        <StatCard title="Total Semanal" value={`${stats.weeklyTotal.toFixed(1)} mm`} icon={<Calendar className="w-6 h-6 text-emerald-500" />} />
        <StatCard title="Total Mensal" value={`${stats.monthlyTotal.toFixed(1)} mm`} icon={<Calendar className="w-6 h-6 text-emerald-500" />} />
        <StatCard title="Total Safra" value={`${stats.seasonTotal.toFixed(1)} mm`} icon={<Droplets className="w-6 h-6 text-emerald-600" />} />
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold mb-4 text-slate-700">Precipitação - Últimos 30 Dias</h3>
        <div className="h-[300px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" />
              <YAxis label={{ value: 'mm', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} name="Chuva (mm)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string, value: string, icon: React.ReactNode }> = ({ title, value, icon }) => (
  <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
    <div className="mb-2">{icon}</div>
    <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">{title}</span>
    <span className="text-xl font-bold text-slate-800">{value}</span>
  </div>
);

export default Dashboard;
