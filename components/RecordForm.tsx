
import React, { useState } from 'react';
import { RainfallRecord, Gauge } from '../types';
import { Droplets, Calendar, Save, CheckCircle } from 'lucide-react';

interface Props {
  gauges: Gauge[];
  onAdd: (record: RainfallRecord) => void;
}

const RecordForm: React.FC<Props> = ({ gauges, onAdd }) => {
  const [gaugeId, setGaugeId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gaugeId || !amount || !date) return;

    onAdd({
      id: crypto.randomUUID(),
      gaugeId,
      amount: parseFloat(amount),
      date
    });

    setAmount('');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Lançar Chuva</h2>
        <p className="text-slate-500">Registre o volume medido em um pluviômetro.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 relative">
        {showSuccess && (
          <div className="absolute inset-0 bg-white/95 rounded-2xl flex flex-col items-center justify-center z-10 animate-fade-in">
            <CheckCircle className="w-16 h-16 text-emerald-500 mb-2" />
            <span className="text-emerald-800 font-bold text-xl">Lançado com Sucesso!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Droplets className="w-4 h-4 text-emerald-600" /> Selecionar Pluviômetro
            </label>
            <select 
              value={gaugeId} onChange={e => setGaugeId(e.target.value)} required
              className="w-full p-3 bg-white border border-black rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all appearance-none text-slate-900"
            >
              <option value="">Escolha um local...</option>
              {gauges.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" /> Data da Coleta
            </label>
            <input 
              type="date" value={date} onChange={e => setDate(e.target.value)} required
              className="w-full p-3 bg-white border border-black rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-900"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Droplets className="w-4 h-4 text-emerald-600" /> Quantidade (mm)
            </label>
            <div className="relative">
              <input 
                type="number" step="0.1" value={amount} onChange={e => setAmount(e.target.value)} required
                placeholder="0.0"
                className="w-full p-4 bg-white border border-black rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-2xl font-bold text-center text-slate-900 placeholder-slate-400"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">mm</span>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-xl font-bold text-lg shadow-emerald-200 shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <Save className="w-5 h-5" /> Salvar Lançamento
          </button>
        </form>
      </div>

      <div className="mt-8 p-4 bg-blue-50 text-blue-800 rounded-xl flex items-start gap-3">
        <Droplets className="w-5 h-5 shrink-0 mt-0.5 text-blue-500" />
        <p className="text-sm italic">Dica: Um milímetro de chuva corresponde a um litro de água por metro quadrado (1 L/m²).</p>
      </div>
    </div>
  );
};

export default RecordForm;
