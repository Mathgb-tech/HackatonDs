"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Gestante, StatusOrigin, Status, Role } from '@/lib/types';
import { mockGestantes } from '@/lib/mockData';
import { evaluateGestanteStatus } from '@/lib/statusEngine';

// Bump this whenever mockData changes structure/coordinates
// to force-clear stale localStorage from previous sessions.
const DATA_VERSION = 'v3-salvador';

export interface AggregatedMetrics {
  total: number;
  byStatus: Record<Status, number>;
  byMicroArea: Record<string, { total: number; buscaAtiva: number; semVinculo: number }>;
}

interface GestanteContextType {
  gestantes: Gestante[]; // Empty for Gestor
  aggregatedMetrics: AggregatedMetrics;
  updateGestante: (id: string, updates: Partial<Gestante>) => void;
  updateStatus: (id: string, newStatus: Status, origin: StatusOrigin) => void;
  role: Role;
  setRole: (role: Role) => void;
}

const GestanteContext = createContext<GestanteContextType | undefined>(undefined);

export function GestanteProvider({ children }: { children: React.ReactNode }) {
  const [allGestantes, setAllGestantes] = useState<Gestante[]>([]);
  const [role, setRole] = useState<Role>('ACS');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    // Version guard: if stored version differs, reset to fresh mock data
    const storedVersion = localStorage.getItem('prenatal_data_version');
    if (storedVersion !== DATA_VERSION) {
      localStorage.removeItem('prenatal_gestantes');
      localStorage.setItem('prenatal_data_version', DATA_VERSION);
      setAllGestantes(mockGestantes);
    } else {
      const stored = localStorage.getItem('prenatal_gestantes');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setAllGestantes(parsed.map((g: Gestante) => evaluateGestanteStatus(g)));
        } catch (e) {
          setAllGestantes(mockGestantes);
        }
      } else {
        setAllGestantes(mockGestantes);
      }
    }

    const storedRole = localStorage.getItem('prenatal_role') as Role | null;
    if (storedRole === 'ACS' || storedRole === 'Enfermeiro' || storedRole === 'Gestor') {
      setRole(storedRole);
    }

    setIsLoaded(true);
  }, []);

  // Save to localStorage when changed
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('prenatal_gestantes', JSON.stringify(allGestantes));
      localStorage.setItem('prenatal_role', role);
    }
  }, [allGestantes, role, isLoaded]);

  const updateGestante = (id: string, updates: Partial<Gestante>) => {
    setAllGestantes(prev => prev.map(g => {
      if (g.id !== id) return g;
      const updated = { ...g, ...updates };
      
      if (updates.lastConsultationDate || updates.observations || updates.pendingExams || updates.missedAppointments !== undefined) {
        updated.statusOrigin = 'auto';
      }
      
      return evaluateGestanteStatus(updated as Gestante);
    }));
  };

  const updateStatus = (id: string, newStatus: Status, origin: StatusOrigin) => {
    setAllGestantes(prev => prev.map(g => {
      if (g.id !== id) return g;
      return {
        ...g,
        status: newStatus,
        statusOrigin: origin
      };
    }));
  };

  // LGPD filtering: Gestor never gets individual records
  const gestantes = useMemo(() => {
    if (role === 'Gestor') return [];
    return allGestantes;
  }, [allGestantes, role]);

  // Aggregated metrics accessible to everyone (especially Gestor)
  const aggregatedMetrics = useMemo(() => {
    const metrics: AggregatedMetrics = {
      total: allGestantes.length,
      byStatus: {
        'Em dia': 0,
        'Atenção': 0,
        'Busca ativa': 0,
        'Sem vínculo': 0
      },
      byMicroArea: {}
    };

    allGestantes.forEach(g => {
      metrics.byStatus[g.status]++;

      if (!metrics.byMicroArea[g.microArea]) {
        metrics.byMicroArea[g.microArea] = { total: 0, buscaAtiva: 0, semVinculo: 0 };
      }
      
      metrics.byMicroArea[g.microArea].total++;
      if (g.status === 'Busca ativa') metrics.byMicroArea[g.microArea].buscaAtiva++;
      if (g.status === 'Sem vínculo') metrics.byMicroArea[g.microArea].semVinculo++;
    });

    return metrics;
  }, [allGestantes]);

  if (!isLoaded) {
    return null;
  }

  return (
    <GestanteContext.Provider value={{ gestantes, aggregatedMetrics, updateGestante, updateStatus, role, setRole }}>
      {children}
    </GestanteContext.Provider>
  );
}

export function useGestantes() {
  const context = useContext(GestanteContext);
  if (context === undefined) {
    throw new Error('useGestantes must be used within a GestanteProvider');
  }
  return context;
}
