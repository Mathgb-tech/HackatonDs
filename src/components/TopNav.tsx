"use client";

import { useGestantes } from "@/context/GestanteContext";
import { User, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TopNav() {
  const { role, setRole } = useGestantes();

  return (
    <header className="bg-primary text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Pré-Natal Ativo</h1>
        </div>

        <div className="flex items-center bg-white/10 p-1 rounded-lg">
          <button
            onClick={() => setRole('ACS')}
            className={cn(
              "px-4 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 transition-colors",
              role === 'ACS' ? "bg-white text-primary shadow" : "text-white/80 hover:text-white"
            )}
          >
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">ACS</span>
          </button>
          <button
            onClick={() => setRole('Enfermeiro')}
            className={cn(
              "px-4 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 transition-colors",
              role === 'Enfermeiro' ? "bg-white text-primary shadow" : "text-white/80 hover:text-white"
            )}
          >
            <Stethoscope className="w-4 h-4" />
            <span className="hidden sm:inline">Enfermeiro</span>
          </button>
        </div>
      </div>
    </header>
  );
}
