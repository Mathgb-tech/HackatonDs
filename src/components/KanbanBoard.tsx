"use client";

import { useGestantes } from "@/context/GestanteContext";
import { Status } from "@/lib/types";
import { useState, useMemo, useRef, useCallback } from "react";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverlay,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import KanbanColumn from "./KanbanColumn";
import KanbanCard from "./KanbanCard";
import { Mic, MicOff, Search, Filter, X } from "lucide-react";

const COLUMNS: { id: Status; title: string; colorHex: string }[] = [
  { id: 'Em dia',      title: 'Em Dia',      colorHex: '#1F8A57' },
  { id: 'Atenção',     title: 'Atenção',     colorHex: '#B8790E' },
  { id: 'Busca ativa', title: 'Busca Ativa', colorHex: '#B23B3B' },
  { id: 'Sem vínculo', title: 'Sem Vínculo', colorHex: '#7A2E2E' },
];

const COLUMN_IDS = new Set(COLUMNS.map(c => c.id));
const ACS_MICRO_AREA = 'Comunidade Palafita';

type VoiceState = 'idle' | 'listening' | 'error';

export default function KanbanBoard() {
  const { gestantes, updateStatus, role } = useGestantes();
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [voiceError, setVoiceError] = useState<string>('');
  const recognitionRef = useRef<any>(null);

  const filteredGestantes = useMemo(() => {
    return gestantes.filter((g) => {
      if (role === 'ACS' && g.microArea !== ACS_MICRO_AREA) return false;
      if (search && !g.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [gestantes, role, search]);

  // Require 8px of movement before treating a pointer event as a drag.
  // This prevents accidental drags when clicking links.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const draggedId = active.id as string;
    const overId = over.id as string;

    // Resolve target status:
    // Case 1 — dropped directly on a column droppable
    // Case 2 — dropped on a card (also droppable); resolve column via that card's status
    let targetStatus: Status | null = null;

    if (COLUMN_IDS.has(overId as Status)) {
      targetStatus = overId as Status;
    } else {
      // Dropped on another card — find its current status (= its column)
      const overGestante = gestantes.find(g => g.id === overId);
      if (overGestante) {
        targetStatus = overGestante.status;
      }
    }

    if (!targetStatus) return;

    const draggedGestante = gestantes.find(g => g.id === draggedId);
    if (draggedGestante && draggedGestante.status !== targetStatus) {
      updateStatus(draggedId, targetStatus, 'manual');
    }
  };

  const activeGestante = useMemo(
    () => gestantes.find((g) => g.id === activeId),
    [activeId, gestantes]
  );

  const stopVoice = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    setVoiceState('idle');
  }, []);

  const handleMicClick = useCallback(() => {
    if (voiceState === 'listening') {
      stopVoice();
      return;
    }

    const SpeechRecognitionAPI =
      typeof window !== 'undefined' &&
      ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

    if (!SpeechRecognitionAPI) {
      setVoiceError('Reconhecimento de voz não suportado. Use Google Chrome ou Microsoft Edge.');
      setVoiceState('error');
      return;
    }

    setVoiceError('');
    setVoiceState('listening');

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = 'pt-BR';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;
    recognitionRef.current = recognition;

    recognition.onend = () => setVoiceState('idle');

    recognition.onerror = (e: any) => {
      recognitionRef.current = null;
      if (e.error === 'not-allowed') {
        setVoiceError('Permissão de microfone negada. Clique no ícone de cadeado na barra de endereço e permita o microfone.');
      } else if (e.error === 'network') {
        setVoiceError('Erro de rede. O reconhecimento de voz requer Google Chrome ou Edge (o Brave bloqueia este recurso por padrão).');
      } else if (e.error === 'no-speech') {
        setVoiceError('Nenhuma fala detectada. Tente novamente.');
      } else {
        setVoiceError(`Erro: ${e.error}`);
      }
      setVoiceState('error');
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results as SpeechRecognitionResultList)
        .map((r) => r[0].transcript)
        .join('');
      setSearch(transcript);
    };

    recognition.start();
  }, [voiceState, stopVoice]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full flex flex-col max-w-7xl mx-auto">
      {/* Search bar */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5" style={{ color: '#94a3b8' }} />
          </div>
          <input
            type="text"
            style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
            className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg sm:text-sm shadow-sm"
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setVoiceState('idle'); }}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute inset-y-0 right-8 flex items-center px-1"
              style={{ color: '#94a3b8' }}
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={handleMicClick}
            title={voiceState === 'listening' ? 'Parar escuta' : 'Busca por voz (requer Chrome/Edge)'}
            className="absolute inset-y-0 right-0 pr-3 flex items-center transition-colors"
            style={{ color: voiceState === 'listening' ? '#B23B3B' : '#94a3b8' }}
          >
            {voiceState === 'listening'
              ? <MicOff className="h-5 w-5 animate-pulse" />
              : <Mic className="h-5 w-5" />
            }
          </button>
        </div>

        <div className="flex items-center gap-2 text-sm font-medium">
          {role === 'ACS' && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                 style={{ color: '#1F3B57', backgroundColor: 'rgb(31 59 87 / 10%)' }}>
              <Filter className="h-4 w-4" />
              <span>Microárea: {ACS_MICRO_AREA}</span>
            </div>
          )}
          {role === 'Enfermeiro' && (
            <div className="flex items-center gap-2" style={{ color: '#64748b' }}>
              <Filter className="h-4 w-4" />
              <span>Todas as microáreas</span>
            </div>
          )}
        </div>
      </div>

      {/* Voice feedback banners */}
      {voiceState === 'listening' && (
        <div className="mb-3 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
             style={{ backgroundColor: 'rgb(178 59 59 / 8%)', color: '#B23B3B' }}>
          <MicOff className="w-4 h-4 animate-pulse" />
          Ouvindo... Fale o nome da gestante e clique novamente para parar.
        </div>
      )}
      {voiceState === 'error' && (
        <div className="mb-3 flex items-start gap-3 px-4 py-3 rounded-lg text-sm border"
             style={{ backgroundColor: '#fff7ed', color: '#c2410c', borderColor: '#fed7aa' }}>
          <span className="text-base mt-0.5">⚠️</span>
          <div className="flex-1">
            <strong>Voz indisponível:</strong> {voiceError}
          </div>
          <button type="button" onClick={() => setVoiceState('idle')} style={{ color: '#c2410c' }}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Drag-and-drop hint */}
      <p className="text-xs mb-3" style={{ color: '#94a3b8' }}>
        💡 Arraste pelo ícone <strong>⠿</strong> no canto do card para mover entre colunas manualmente.
      </p>

      {/* Kanban */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-4 flex-1 min-h-0">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              column={col}
              gestantes={filteredGestantes.filter((g) => g.status === col.id)}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={{ duration: 150, easing: 'ease' }}>
          {activeGestante ? <KanbanCard gestante={activeGestante} isOverlay /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
