"use client";

import { useGestantes } from "@/context/GestanteContext";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";
import Link from "next/link";
import { differenceInDays, parseISO, startOfDay } from "date-fns";

// Fix Leaflet's broken default icon in Next.js/Webpack
function fixLeafletIcons() {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

const STATUS_COLORS: Record<string, string> = {
  'Em dia':      '#1F8A57',
  'Atenção':     '#B8790E',
  'Busca ativa': '#B23B3B',
  'Sem vínculo': '#7A2E2E',
};

function createStatusIcon(color: string) {
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width: 22px; height: 22px;
        background-color: ${color};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.4);
      "></div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 22],
    popupAnchor: [0, -24],
  });
}

// Salvador, BA center
const SALVADOR_CENTER: [number, number] = [-12.9714, -38.5014];

export default function MapACS() {
  const { gestantes } = useGestantes();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    fixLeafletIcons();
    setMounted(true);
  }, []);

  const validGestantes = gestantes.filter(
    (g) => g.lat !== undefined && g.lng !== undefined
  );

  const today = startOfDay(new Date());

  if (!mounted) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-100">
        <div className="flex flex-col items-center gap-2" style={{ color: '#64748b' }}>
          <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#1F3B57', borderTopColor: 'transparent' }} />
          <p className="text-sm">Carregando mapa...</p>
        </div>
      </div>
    );
  }

  if (validGestantes.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-100">
        <p className="text-sm" style={{ color: '#64748b' }}>Nenhum dado geográfico disponível.</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative" style={{ zIndex: 0 }}>
      {/* Legend */}
      <div
        className="absolute bottom-6 left-4 z-[1000] rounded-xl p-3 shadow-lg border border-slate-200"
        style={{ backgroundColor: 'white' }}
      >
        <p className="text-xs font-bold mb-2" style={{ color: '#334155' }}>Legenda</p>
        <div className="flex flex-col gap-1.5">
          {Object.entries(STATUS_COLORS).map(([label, color]) => (
            <div key={label} className="flex items-center gap-2 text-xs" style={{ color: '#475569' }}>
              <div className="w-3 h-3 rounded-full border border-white shadow-sm shrink-0" style={{ backgroundColor: color }} />
              {label}
            </div>
          ))}
        </div>
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

        {validGestantes.map((gestante) => {
          const color = STATUS_COLORS[gestante.status] || '#64748b';
          const daysSince = gestante.lastConsultationDate
            ? differenceInDays(today, parseISO(gestante.lastConsultationDate))
            : null;

          return (
            <Marker
              key={gestante.id}
              position={[gestante.lat!, gestante.lng!]}
              icon={createStatusIcon(color)}
            >
              <Popup minWidth={200}>
                <div style={{ fontFamily: 'inherit', padding: '4px' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span style={{ fontWeight: 700, fontSize: '14px', color: '#1e293b' }}>
                      {gestante.name}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: color, fontWeight: 600, marginBottom: 4 }}>
                    {gestante.status}
                  </p>
                  <p style={{ fontSize: '12px', color: '#64748b', marginBottom: 4 }}>
                    {gestante.gestationalAgeWeeks} semanas · {gestante.microArea}
                  </p>
                  <p style={{ fontSize: '12px', color: '#64748b', marginBottom: 10 }}>
                    {daysSince !== null
                      ? `Último contato: ${daysSince} dia${daysSince !== 1 ? 's' : ''} atrás`
                      : 'Nunca contatada'}
                  </p>
                  <Link
                    href={`/gestante/${gestante.id}`}
                    style={{
                      display: 'block',
                      textAlign: 'center',
                      backgroundColor: '#1F3B57',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 700,
                      padding: '6px 12px',
                      borderRadius: '6px',
                      textDecoration: 'none',
                    }}
                  >
                    Ver Perfil
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
