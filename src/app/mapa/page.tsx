"use client";

import dynamic from "next/dynamic";
import { useGestantes } from "@/context/GestanteContext";

const MapACS = dynamic(() => import("@/components/map/MapACS"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-slate-100">
      <div className="flex flex-col items-center gap-2 text-slate-500">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p>Carregando mapa...</p>
      </div>
    </div>
  ),
});

export default function MapaPage() {
  const { role } = useGestantes();

  if (role === 'Gestor') {
    return (
      <div className="p-8 text-center text-slate-600">
        Acesso restrito. Este mapa exibe dados individuais que não estão disponíveis para Gestores.
        <br/><br/>
        Por favor, utilize o "Mapa Gestor" para visualização agregada.
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-112px)] w-full">
      <MapACS />
    </div>
  );
}
