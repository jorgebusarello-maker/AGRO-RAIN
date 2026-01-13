
import React, { useState } from 'react';
import { MapPin, Plus, Trash2, Crosshair } from 'lucide-react';
import { Gauge } from '../types';

interface Props {
  gauges: Gauge[];
  onAdd: (gauge: Gauge) => void;
  onDelete: (id: string) => void;
}

const GaugeManager: React.FC<Props> = ({ gauges, onAdd, onDelete }) => {
  const [name, setName] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [desc, setDesc] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !lat || !lng) return;

    onAdd({
      id: crypto.randomUUID(),
      name,
      latitude: parseFloat(lat),
      longitude: parseFloat(lng),
      description: desc
    });

    setName('');
    setLat('');
    setLng('');
    setDesc('');
  };

  const getMyLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLat(position.coords.latitude.toString());
        setLng(position.coords.longitude.toString());
      });
    } else {
      alert("Geolocalização não disponível no seu navegador.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-800">Gerenciar Pluviômetros</h2>
        <p className="text-slate-500">Cadastre os pontos de coleta de dados na sua propriedade.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-emerald-600" /> Novo Pluviômetro
        </h3>
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Identificação/Nome</label>
            <input 
              type="text" value={name} onChange={e => setName(e.target.value)} required
              placeholder="Ex: Talhão 04 Sul"
              className="w-full p-2 bg-white border border-black rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 placeholder-slate-400"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Descrição (Opcional)</label>
            <input 
              type="text" value={desc} onChange={e => setDesc(e.target.value)}
              placeholder="Ex: Próximo ao bebedouro"
              className="w-full p-2 bg-white border border-black rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 placeholder-slate-400"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Latitude</label>
            <input 
              type="number" step="any" value={lat} onChange={e => setLat(e.target.value)} required
              placeholder="-23.12345"
              className="w-full p-2 bg-white border border-black rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 placeholder-slate-400"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Longitude</label>
            <input 
              type="number" step="any" value={lng} onChange={e => setLng(e.target.value)} required
              placeholder="-48.67890"
              className="w-full p-2 bg-white border border-black rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 placeholder-slate-400"
            />
          </div>
          <div className="md:col-span-2 flex gap-4 mt-2">
            <button 
              type="button" 
              onClick={getMyLocation}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-lg transition-colors border border-slate-300"
            >
              <Crosshair className="w-4 h-4" /> Usar Minha Localização
            </button>
            <button 
              type="submit" 
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-lg transition-colors font-bold shadow-md"
            >
              Cadastrar Pluviômetro
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-4 border-b font-bold text-slate-600">Nome</th>
              <th className="p-4 border-b font-bold text-slate-600">Localização</th>
              <th className="p-4 border-b font-bold text-slate-600">Descrição</th>
              <th className="p-4 border-b font-bold text-slate-600">Ações</th>
            </tr>
          </thead>
          <tbody>
            {gauges.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-400 italic">Nenhum pluviômetro cadastrado.</td>
              </tr>
            ) : (
              gauges.map(g => (
                <tr key={g.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 border-b font-medium">{g.name}</td>
                  <td className="p-4 border-b text-sm text-slate-500 font-mono">
                    {Number(g.latitude).toFixed(5)}, {Number(g.longitude).toFixed(5)}
                  </td>
                  <td className="p-4 border-b text-sm text-slate-600">{g.description || '-'}</td>
                  <td className="p-4 border-b">
                    <button 
                      onClick={() => onDelete(g.id)}
                      className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                      title="Excluir Pluviômetro"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GaugeManager;
