"use client";

import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Gestante } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Calendar, MapPin, AlertCircle, GripVertical } from "lucide-react";
import Link from "next/link";
import { format, parseISO } from "date-fns";

const STATUS_COLORS: Record<string, string> = {
  'Em dia':      '#1F8A57',
  'Atenção':     '#B8790E',
  'Busca ativa': '#B23B3B',
  'Sem vínculo': '#7A2E2E',
};

const STATUS_BG: Record<string, string> = {
  'Em dia':      'rgb(31 138 87 / 10%)',
  'Atenção':     'rgb(184 121 14 / 10%)',
  'Busca ativa': 'rgb(178 59 59 / 10%)',
  'Sem vínculo': 'rgb(122 46 46 / 10%)',
};

interface KanbanCardProps {
  gestante: Gestante;
  isOverlay?: boolean;
}

export default function KanbanCard({ gestante, isOverlay }: KanbanCardProps) {
  // Make the card DRAGGABLE
  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
    transform,
    isDragging,
  } = useDraggable({ id: gestante.id });

  // ALSO make the card DROPPABLE so that when another card is dropped
  // onto this card, dnd-kit has a valid droppable target (over.id = gestante.id).
  // handleDragEnd in KanbanBoard resolves the target column from this card's status.
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({ id: gestante.id });

  // Merge both refs onto the same DOM node
  const setNodeRef = (node: HTMLElement | null) => {
    setDraggableRef(node);
    setDroppableRef(node);
  };

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const formattedNextDate = gestante.nextExpectedConsultation
    ? format(parseISO(gestante.nextExpectedConsultation), 'dd/MM/yyyy')
    : 'Não agendada';

  const statusColor = STATUS_COLORS[gestante.status] || '#64748b';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-white rounded-lg border p-3 flex flex-col gap-2 relative transition-all duration-150",
        isDragging
          ? "opacity-30 shadow-none border-slate-200"
          : isOver
            ? "shadow-md border-primary ring-2 ring-blue-300"
            : "border-slate-200 shadow-sm hover:shadow-md",
        isOverlay ? "rotate-1 scale-105 shadow-xl cursor-grabbing" : ""
      )}
    >
      {/* Drag handle — only this area triggers the drag, NOT the card body */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2.5 right-2 p-1 rounded cursor-grab active:cursor-grabbing touch-none"
        style={{ color: '#cbd5e1' }}
        title="Arraste pelo alça para mover de coluna"
      >
        <GripVertical className="w-4 h-4" />
      </div>

      {/* Card body — links to profile without triggering drag */}
      <Link href={`/gestante/${gestante.id}`} className="block pr-6">
        <h3 className="font-bold text-slate-800 text-sm leading-tight mb-1 hover:underline">
          {gestante.name}
        </h3>
        <div className="flex items-center gap-1.5 mb-2">
          <span
            className="px-1.5 py-0.5 rounded text-xs font-bold uppercase"
            style={{ color: statusColor, backgroundColor: STATUS_BG[gestante.status] }}
          >
            {gestante.status}
          </span>
          {gestante.statusOrigin === 'manual' && (
            <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-500">
              Manual
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1 text-xs" style={{ color: '#64748b' }}>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 shrink-0" style={{ color: '#94a3b8' }} />
            <span>{gestante.gestationalAgeWeeks}sem · Próx: {formattedNextDate}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: '#94a3b8' }} />
            <span className="truncate">{gestante.microArea}</span>
          </div>
        </div>
      </Link>

      {(gestante.pendingExams.length > 0 || gestante.missedAppointments > 0) && (
        <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
          {gestante.pendingExams.length > 0 && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-50 text-red-700">
              <AlertCircle className="w-3 h-3" />
              {gestante.pendingExams.length} exame(s)
            </span>
          )}
          {gestante.missedAppointments > 0 && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-orange-50 text-orange-700">
              <AlertCircle className="w-3 h-3" />
              {gestante.missedAppointments} falta(s)
            </span>
          )}
        </div>
      )}
    </div>
  );
}
