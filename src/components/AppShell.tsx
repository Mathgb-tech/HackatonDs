"use client";

import { useGestantes } from "@/context/GestanteContext";
import { User, Stethoscope, BarChart3, LayoutDashboard, Map as MapIcon, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { role, setRole } = useGestantes();
  const pathname = usePathname();

  const navLinks = [
    { name: 'Kanban', href: '/', icon: LayoutDashboard, roles: ['ACS', 'Enfermeiro'] },
    { name: 'Mapa ACS', href: '/mapa', icon: MapIcon, roles: ['ACS', 'Enfermeiro'] },
    { name: 'Mapa Gestor', href: '/mapa-gestor', icon: MapIcon, roles: ['Gestor'] },
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3, roles: ['Enfermeiro', 'Gestor'] },
  ];

  const visibleLinks = navLinks.filter(link => link.roles.includes(role));

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <header className="bg-primary text-white shadow-md z-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight hidden sm:block">Pré-Natal Ativo</h1>
          </Link>

          <div className="flex items-center bg-white/10 p-1 rounded-lg text-sm font-medium">
            <button
              onClick={() => setRole('ACS')}
              className={cn("px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors", role === 'ACS' ? "bg-white text-primary shadow" : "text-white/80 hover:text-white")}
            >
              <User className="w-4 h-4" /> <span className="hidden sm:inline">ACS</span>
            </button>
            <button
              onClick={() => setRole('Enfermeiro')}
              className={cn("px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors", role === 'Enfermeiro' ? "bg-white text-primary shadow" : "text-white/80 hover:text-white")}
            >
              <Stethoscope className="w-4 h-4" /> <span className="hidden sm:inline">Enfermeiro</span>
            </button>
            <button
              onClick={() => setRole('Gestor')}
              className={cn("px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors", role === 'Gestor' ? "bg-white text-primary shadow" : "text-white/80 hover:text-white")}
            >
              <BarChart3 className="w-4 h-4" /> <span className="hidden sm:inline">Gestor</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-primary-dark border-t border-white/10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex overflow-x-auto hide-scrollbar">
            {visibleLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors",
                    isActive 
                      ? "border-white text-white" 
                      : "border-transparent text-white/70 hover:text-white hover:border-white/50"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-x-hidden relative">
        {children}
      </main>
    </div>
  );
}
