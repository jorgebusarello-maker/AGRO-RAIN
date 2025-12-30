
import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Gauge, RainfallRecord } from '../types';
import { Download, Map as MapIcon } from 'lucide-react';

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
  map.setView(center, zoom);
  return null;
};

const MapVisualization: React.FC<Props> = ({ gauges, records }) => {
  const defaultCenter: [number, number] = gauges.length > 0 
    ? [gauges[0].latitude, gauges[0].longitude] 
    : [-15.7801, -47.9292]; // Brasilia

  const gaugeSummaries = useMemo(() => {
    return gauges.map(g => {
      const gaugeRecords = records.filter(r => r.gaugeId === g.id);
      const total = gaugeRecords.reduce((acc, r) => acc + r.amount, 0);
      const lastRecord = gaugeRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      return { ...g, total, lastAmount: lastRecord?.amount || 0, lastDate: lastRecord?.date };
    });
  }, [gauges, records]);

  const generateKML = () => {
    const kmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>AgroRain - Mapa de Chuva</name>
    <description>Dados de pluviometria gerados em AgroRain</description>
    ${gaugeSummaries.map(g => `
    <Placemark>
      <name>${g.name}: ${g.total.toFixed(1)}mm</name>
      <description>Total safra: ${g.total.toFixed(1)}mm. Última chuva: ${g.lastAmount}mm em ${g.lastDate}</description>
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
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Mapa de Precipitação</h2>
          <p className="text-slate-500">Visualização geográfica dos totais acumulados.</p>
        </div>
        <button 
          onClick={generateKML}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-xl transition-all shadow-lg active:scale-95"
        >
          <Download className="w-5 h-5" /> Exportar Arquivo KML
        </button>
      </header>

      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px] relative">
        <MapContainer center={defaultCenter} zoom={13} className="h-full w-full z-0">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {gaugeSummaries.map(g => (
            <Marker key={g.id} position={[g.latitude, g.longitude]}>
              <Popup>
                <div className="p-1">
                  <h4 className="font-bold text-lg text-emerald-800 mb-1">{g.name}</h4>
                  <p className="text-sm text-slate-600 mb-2">{g.description}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-100 p-2 rounded">
                      <p className="font-semibold">Total Safra</p>
                      <p className="text-lg font-bold text-emerald-600">{g.total.toFixed(1)} mm</p>
                    </div>
                    <div className="bg-slate-100 p-2 rounded">
                      <p className="font-semibold">Última Chuva</p>
                      <p className="text-lg font-bold text-blue-600">{g.lastAmount} mm</p>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
          {gauges.length > 0 && <ChangeView center={defaultCenter} zoom={12} />}
        </MapContainer>

        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg z-[1000] max-w-[200px] border border-slate-200 pointer-events-none">
          <h5 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
            <MapIcon className="w-4 h-4" /> Legenda
          </h5>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Marcador: Local do Pluviômetro</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapVisualization;
