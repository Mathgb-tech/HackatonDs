"use client";

import { useGestantes } from "@/context/GestanteContext";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";
import { AlertCircle, CheckCircle, Activity, UserMinus, ChevronRight } from "lucide-react";
import { useMemo } from "react";

// Mock historical data for the trend chart
const mockHistoricalData = [
  { month: 'Abr', buscaAtiva: 45, emDia: 120 },
  { month: 'Mai', buscaAtiva: 38, emDia: 130 },
  { month: 'Jun', buscaAtiva: 42, emDia: 135 },
  { month: 'Jul', buscaAtiva: 30, emDia: 150 },
  { month: 'Ago', buscaAtiva: 25, emDia: 160 },
  { month: 'Set', buscaAtiva: 18, emDia: 175 }, // Trend goes down showing improvement
];

export default function DashboardPage() {
  const { aggregatedMetrics, role } = useGestantes();

  if (role === 'ACS') {
    return (
      <div className="p-8 text-center text-slate-600">
        Acesso restrito a Enfermeiros e Gestores.
      </div>
    );
  }

  // Calculate micro-area ranking
  const microAreaRanking = useMemo(() => {
    return Object.entries(aggregatedMetrics.byMicroArea)
      .map(([name, data]) => {
        const rate = data.total > 0 ? (data.buscaAtiva / data.total) * 100 : 0;
        return { name, ...data, rate };
      })
      .sort((a, b) => b.rate - a.rate);
  }, [aggregatedMetrics]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Visão Geral da Rede</h1>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Em Dia</p>
            <p className="text-3xl font-bold text-status-em-dia">{aggregatedMetrics.byStatus['Em dia']}</p>
          </div>
          <div className="w-12 h-12 bg-status-em-dia/10 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-status-em-dia" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Atenção</p>
            <p className="text-3xl font-bold text-status-atencao">{aggregatedMetrics.byStatus['Atenção']}</p>
          </div>
          <div className="w-12 h-12 bg-status-atencao/10 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-status-atencao" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Busca Ativa</p>
            <p className="text-3xl font-bold text-status-busca">{aggregatedMetrics.byStatus['Busca ativa']}</p>
          </div>
          <div className="w-12 h-12 bg-status-busca/10 rounded-full flex items-center justify-center">
            <Activity className="w-6 h-6 text-status-busca" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Sem Vínculo</p>
            <p className="text-3xl font-bold text-status-sem-vinculo">{aggregatedMetrics.byStatus['Sem vínculo']}</p>
          </div>
          <div className="w-12 h-12 bg-status-sem-vinculo/10 rounded-full flex items-center justify-center">
            <UserMinus className="w-6 h-6 text-status-sem-vinculo" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Tendência Histórica</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockHistoricalData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }} />
                <Line type="monotone" name="Em Dia" dataKey="emDia" stroke="#1F8A57" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" name="Busca Ativa" dataKey="buscaAtiva" stroke="#B23B3B" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ranking */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Ranking de Microáreas</h2>
          <p className="text-sm text-slate-500 mb-4">Ordenado por maior taxa de Busca Ativa.</p>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {microAreaRanking.map((ma, index) => (
              <div key={ma.name} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{ma.name}</p>
                    <p className="text-xs text-slate-500">{ma.buscaAtiva} casos de {ma.total} total</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-status-busca">{ma.rate.toFixed(1)}%</p>
                </div>
              </div>
            ))}
            {microAreaRanking.length === 0 && (
              <div className="text-center py-6 text-slate-500 text-sm">
                Nenhum dado disponível.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
