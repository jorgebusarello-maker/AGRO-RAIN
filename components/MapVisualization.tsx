
import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { Gauge, RainfallRecord } from '../types';
import { Download, Map as MapIcon, Droplets, Calendar } from 'lucide-react';

interface Props {
  gauges: Gauge[];
  records: RainfallRecord[];
}

// Fix for default marker icon in React-Leaflet
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const ChangeView = ({ center, zoom }: { center: [number, number], zoom: number }) => {
  const map = useMap();
  // Ensure center is valid before setting view
  if (typeof center[0] === 'number' && typeof center[1] === 'number') {
    map.setView(center, zoom);
  }
  return null;
};

type ViewMode = 'total' | 'last';

const MapVisualization: React.FC<Props> = ({ gauges, records }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('last');

  // Find the first gauge with VALID coordinates
  const validGauge = gauges.find(g => 
    g.latitude !== undefined && 
    g.longitude !== undefined && 
    !isNaN(Number(g.latitude)) && 
    !isNaN(Number(g.longitude))
  );

  const defaultCenter: [number, number] = validGauge 
    ? [Number(validGauge.latitude), Number(validGauge.longitude)] 
    : [-15.7801, -47.9292]; // Brasilia

  const gaugeSummaries = useMemo(() => {
    return gauges
      .filter(g => 
        g.latitude !== undefined && 
        g.longitude !== undefined && 
        !isNaN(Number(g.latitude)) && 
        !isNaN(Number(g.longitude))
      )
      .map(g => {
        const gaugeRecords = records.filter(r => r.gaugeId === g.id);
        const total = gaugeRecords.reduce((acc, r) => acc + r.amount, 0);
        const lastRecord = gaugeRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
        return { ...g, total, lastAmount: lastRecord?.amount || 0, lastDate: lastRecord?.date };
      });
  }, [gauges, records]);

  // Calcular raio dinâmico baseado no valor máximo para normalizar o tamanho das bolhas
  const maxVal = useMemo(() => {
    const values = gaugeSummaries.map(g => viewMode === 'total' ? g.total : g.lastAmount);
    return Math.max(...values, 1); // Evita divisão por zero
  }, [gaugeSummaries, viewMode]);

  const getRadius = (value: number) => {
    if (value === 0) return 5;
    // Escala: Mínimo 10px, Máximo 50px
    return 10 + ((value / maxVal) * 40);
  };

  const generateKML = () => {
    const kmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>AgroRain - Mapa de Chuva</name>
    <description>Dados de pluviometria gerados em AgroRain</description>
    ${gaugeSummaries.map(g => `
    <Placemark>
      <name>${g.name}: ${(g.total || 0).toFixed(1)}mm</name>
      <description>Total safra: ${(g.total || 0).toFixed(1)}mm. Última chuva: ${g.lastAmount}mm em ${g.lastDate}</description>
      <Point>
        <coordinates>${g.longitude},${g.latitude},0</coordinates>
      </Point>
    </Placemark>`).join('')}
  </Document>
</kml>`;

    const blob = new Blob([kmlContent], { type: 'application/vnd.google-earth.kml+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `agrorain_mapa_${new Date().toISOString().split('T')[0]}.kml`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Mapa de Precipitação</h2>
          <p className="text-slate-500">Visualização geográfica dos pontos de chuva.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-white p-1 rounded-lg border border-slate-300 flex items-center shadow-sm">
            <button
              onClick={() => setViewMode('last')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'last' 
                  ? 'bg-blue-100 text-blue-700 shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Droplets className="w-4 h-4" /> Última Chuva
            </button>
            <div className="w-px h-6 bg-slate-200 mx-1"></div>
            <button
              onClick={() => setViewMode('total')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === 'total' 
                  ? 'bg-emerald-100 text-emerald-700 shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Calendar className="w-4 h-4" /> Total Safra
            </button>
          </div>

          <button 
            onClick={generateKML}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95 text-sm font-bold"
          >
            <Download className="w-4 h-4" /> KML
          </button>
        </div>
      </header>

      {/* Map Wrapper: Added explicit styles and absolute positioning to ensure visibility on mobile */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[60vh] md:min-h-[500px] relative z-0">
        <MapContainer 
          center={defaultCenter} 
          zoom={13} 
          className="absolute inset-0 w-full h-full z-0"
          style={{ height: '100%', width: '100%' }} // Force inline style override
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {gaugeSummaries.map(g => {
            const value = viewMode === 'total' ? g.total : g.lastAmount;
            const color = viewMode === 'total' ? '#059669' : '#2563eb'; // Emerald vs Blue
            
            return (
              <React.Fragment key={g.id}>
                {/* Visualização de Intensidade (Bolha) */}
                <CircleMarker 
                  center={[g.latitude, g.longitude]}
                  radius={getRadius(value)}
                  pathOptions={{ 
                    color: color, 
                    fillColor: color, 
                    fillOpacity: 0.5, 
                    weight: 1,
                    opacity: 0.8
                  }}
                >
                  <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                    <span className="font-bold text-sm">
                      {viewMode === 'total' ? 'Total: ' : 'Última: '}
                      {(value || 0).toFixed(1)} mm
                    </span>
                  </Tooltip>
                </CircleMarker>

                {/* Marcador Fixo (Pino) */}
                <Marker position={[g.latitude, g.longitude]}>
                  <Popup>
                    <div className="p-1 min-w-[150px]">
                      <h4 className="font-bold text-lg text-emerald-800 mb-1">{g.name}</h4>
                      <p className="text-sm text-slate-600 mb-2">{g.description}</p>
                      <div className="grid grid-cols-2 gap-2 text-xs border-t pt-2 border-slate-100">
                        <div className="bg-emerald-50 p-2 rounded text-center">
                          <p className="font-semibold text-emerald-800">Total</p>
                          <p className="text-lg font-bold text-emerald-600">{(g.total || 0).toFixed(1)}</p>
                        </div>
                        <div className="bg-blue-50 p-2 rounded text-center">
                          <p className="font-semibold text-blue-800">Última</p>
                          <p className="text-lg font-bold text-blue-600">{g.lastAmount}</p>
                        </div>
                      </div>
                      <div className="mt-2 text-[10px] text-slate-400 text-center">
                        {g.lastDate ? `Data: ${new Date(g.lastDate).toLocaleDateString('pt-BR')}` : 'Sem registros'}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            );
          })}
          
          {validGauge && <ChangeView center={defaultCenter} zoom={13} />}
        </MapContainer>

        {/* Legenda Flutuante */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-lg z-[1000] border border-slate-200 pointer-events-none">
          <h5 className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
            <MapIcon className="w-3 h-3" /> Legenda
          </h5>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-700">
              <div className={`w-4 h-4 rounded-full opacity-50 border ${viewMode === 'total' ? 'bg-emerald-600 border-emerald-600' : 'bg-blue-600 border-blue-600'}`}></div>
              <span>Intensidade ({viewMode === 'total' ? 'Acumulado' : 'Recente'})</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-700">
              <img src="https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png" className="h-4 w-auto" alt="pin" />
              <span>Local do Pluviômetro</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapVisualization;
