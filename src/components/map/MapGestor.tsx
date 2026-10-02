"use client";

import { useGestantes } from "@/context/GestanteContext";
import { MapContainer, TileLayer, Circle, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";

function fixLeafletIcons() {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

// Fixed centers in Salvador, BA
const MICRO_AREA_CENTERS: Record<string, [number, number]> = {
  'Comunidade Palafita': [-12.9720, -38.5020],
  'Área Ribeirinha':     [-12.9620, -38.4710],
  'Centro Histórico':    [-12.9830, -38.4900],
  'Vila Esperança':      [-12.9510, -38.4590],
};

function getRiskColor(riskRate: number) {
  if (riskRate > 60) return '#7A2E2E';
  if (riskRate > 35) return '#B23B3B';
  if (riskRate > 15) return '#B8790E';
  return '#1F8A57';
}

const SALVADOR_CENTER: [number, number] = [-12.9714, -38.5014];

export default function MapGestor() {
  const { aggregatedMetrics } = useGestantes();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    fixLeafletIcons();
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-100">
        <div className="flex flex-col items-center gap-2" style={{ color: '#64748b' }}>
          <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
               style={{ borderColor: '#1F3B57', borderTopColor: 'transparent' }} />
          <p className="text-sm">Carregando mapa gerencial...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative" style={{ zIndex: 0 }}>
      {/* LGPD note */}
      <div
        className="absolute top-4 right-4 z-[1000] rounded-xl p-3 shadow-lg border border-slate-200 max-w-xs"
        style={{ backgroundColor: 'white' }}
      >
        <p className="text-xs font-bold mb-1" style={{ color: '#334155' }}>🔒 Dados Agregados (LGPD)</p>
        <p className="text-xs" style={{ color: '#64748b' }}>
          Esta visão exibe somente contagens por microárea. Nenhum dado individual é acessível neste perfil.
        </p>
      </div>

      <MapContainer
        center={SALVADOR_CENTER}
        zoom={13}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {Object.entries(aggregatedMetrics.byMicroArea).map(([microArea, metrics]) => {
          const center = MICRO_AREA_CENTERS[microArea] || SALVADOR_CENTER;
          const riskCases = metrics.buscaAtiva + metrics.semVinculo;
          const riskRate = metrics.total > 0 ? (riskCases / metrics.total) * 100 : 0;
          const color = getRiskColor(riskRate);
          const radius = 400 + metrics.total * 25;

          return (
            <Circle
              key={microArea}
              center={center}
              radius={radius}
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: 0.45,
                weight: 2,
                opacity: 0.8,
              }}
            >
              <Tooltip sticky>
                <div style={{ fontFamily: 'inherit', minWidth: 200 }}>
                  <p style={{ fontWeight: 700, fontSize: '14px', color: '#1e293b', marginBottom: 8 }}>
                    {microArea}
                  </p>
                  <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.8 }}>
                    <p>Total de gestantes: <strong style={{ color: '#1e293b' }}>{metrics.total}</strong></p>
                    <p>Busca ativa: <strong style={{ color: '#B23B3B' }}>{metrics.buscaAtiva}</strong></p>
                    <p>Sem vínculo: <strong style={{ color: '#7A2E2E' }}>{metrics.semVinculo}</strong></p>
                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #e2e8f0' }}>
                      <p style={{ fontWeight: 700, color: color }}>
                        Taxa de risco: {riskRate.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              </Tooltip>
            </Circle>
          );
        })}
      </MapContainer>
    </div>
  );
}
