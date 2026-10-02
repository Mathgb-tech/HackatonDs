"use client";

import { useDroppable } from "@dnd-kit/core";
import { Gestante, Status } from "@/lib/types";
import KanbanCard from "./KanbanCard";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  column: { id: Status; title: string; colorHex: string };
  gestantes: Gestante[];
}

export default function KanbanColumn({ column, gestantes }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div className="flex flex-col bg-slate-100 rounded-xl overflow-hidden shadow-sm border border-slate-200 min-h-[200px]">
      {/* Column header */}
      <div
        className="p-4 text-white font-semibold flex justify-between items-center shrink-0"
        style={{ backgroundColor: column.colorHex }}
      >
        <h2 className="text-sm uppercase tracking-wider">{column.title}</h2>
        <span className="bg-white/25 text-white px-2 py-0.5 rounded-full text-xs font-bold">
          {gestantes.length}
        </span>
      </div>

      {/* Droppable area */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 p-3 flex flex-col gap-3 overflow-y-auto transition-colors",
          isOver ? "bg-slate-200" : "bg-slate-100"
        )}
        style={{ minHeight: 120 }}
      >
        {gestantes.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-xs text-slate-400 italic py-4">
            Sem gestantes
          </div>
        )}
        {gestantes.map((g) => (
          <KanbanCard key={g.id} gestante={g} />
        ))}
      </div>
    </div>
  );
}
