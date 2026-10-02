"use client";

import { useGestantes } from "@/context/GestanteContext";
import { useParams, useRouter } from "next/navigation";
import { useState, useMemo, useRef } from "react";
import { ArrowLeft, Mic, MicOff, CheckCircle2, WifiOff, Save } from "lucide-react";
import { Observation } from "@/lib/types";
import { format } from "date-fns";

const OUTCOMES = [
  { label: 'Contato realizado',   value: 'Contato realizado' },
  { label: 'Consulta agendada',   value: 'Consulta agendada' },
  { label: 'Recusou atendimento', value: 'Recusou' },
  { label: 'Não localizada',      value: 'Não localizada' },
] as const;

type OutcomeValue = typeof OUTCOMES[number]['value'];

export default function VisitRegistration() {
  const { id } = useParams();
  const router = useRouter();
  const { gestantes, updateGestante, role } = useGestantes();

  const [outcome, setOutcome] = useState<OutcomeValue | ''>('');
  const [obsText, setObsText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const gestante = useMemo(() => gestantes.find((g) => g.id === id), [gestantes, id]);

  if (!gestante) {
    return (
      <div className="p-8 text-center" style={{ color: '#64748b' }}>
        Gestante não encontrada.
      </div>
    );
  }

  const handleMicClick = () => {
    const SpeechRecognitionAPI =
      (typeof window !== 'undefined') &&
      ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

    if (!SpeechRecognitionAPI) {
      alert("Este navegador não suporta reconhecimento de voz. Use Chrome ou Edge.");
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;
    recognition.continuous = false;
    recognitionRef.current = recognition;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (e: any) => {
      setIsListening(false);
      if (e.error !== 'aborted') alert(`Erro no reconhecimento: ${e.error}`);
    };
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setObsText((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };

    recognition.start();
  };

  const handleSave = () => {
    if (!outcome) return;
    setIsSaving(true);

    // Simulate offline queue → sync after delay
    setTimeout(() => {
      const now = new Date().toISOString();
      const noteText = `[${outcome}]${obsText.trim() ? ` — ${obsText.trim()}` : ''}`;

      const newObs: Observation = {
        id: Math.random().toString(36).substring(7),
        date: now,
        author: role,
        text: noteText,
      };

      const updates: Partial<typeof gestante> = {
        observations: [newObs, ...gestante.observations],
      };

      if (outcome === 'Contato realizado' || outcome === 'Consulta agendada') {
        updates.lastConsultationDate = format(new Date(), 'yyyy-MM-dd');
        // If consulta agendada, set next expected +30 days
        if (outcome === 'Consulta agendada') {
          const nextDate = new Date();
          nextDate.setDate(nextDate.getDate() + 30);
          updates.nextExpectedConsultation = format(nextDate, 'yyyy-MM-dd');
        }
      } else if (outcome === 'Não localizada') {
        updates.missedAppointments = gestante.missedAppointments + 1;
      }

      updateGestante(gestante.id, updates);
      router.push(`/gestante/${gestante.id}`);
    }, 1500);
  };

  return (
    <div
      className="max-w-md mx-auto flex flex-col overflow-hidden"
      style={{ minHeight: 'calc(100vh - 112px)', backgroundColor: '#ffffff' }}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between text-white" style={{ backgroundColor: '#1F3B57' }}>
        <button type="button" onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-white/10">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="font-bold text-lg">Registrar Visita</h2>
        <div className="w-9" />
      </div>

      {/* Offline badge */}
      <div className="p-3 flex items-center justify-center gap-2 text-sm font-medium border-b"
           style={{ backgroundColor: '#fff7ed', color: '#c2410c', borderColor: '#fed7aa' }}>
        <WifiOff className="w-4 h-4" />
        Offline — sincroniza depois
      </div>

      <div className="p-5 flex-1 flex flex-col gap-6">
        {/* Gestante name */}
        <div>
          <p className="text-sm mb-1" style={{ color: '#64748b' }}>Gestante</p>
          <p className="font-bold text-slate-800 text-lg">{gestante.name}</p>
        </div>

        {/* Outcome selection */}
        <div>
          <p className="text-sm font-bold mb-3" style={{ color: '#334155' }}>Resultado da Visita *</p>
          <div className="flex flex-col gap-3">
            {OUTCOMES.map((opt) => {
              const selected = outcome === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setOutcome(opt.value)}
                  className="p-4 rounded-xl text-left font-medium transition-all flex justify-between items-center"
                  style={{
                    border: `2px solid ${selected ? '#1F3B57' : '#e2e8f0'}`,
                    backgroundColor: selected ? 'rgb(31 59 87 / 5%)' : '#ffffff',
                    color: selected ? '#1F3B57' : '#475569',
                  }}
                >
                  <span>{opt.label}</span>
                  {selected && <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: '#1F3B57' }} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Observations */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-bold" style={{ color: '#334155' }}>Observações</p>
            <button
              type="button"
              onClick={handleMicClick}
              title={isListening ? "Parar ditado" : "Ditar observação"}
              className="p-1.5 rounded-full transition-colors"
              style={{
                backgroundColor: isListening ? 'rgb(178 59 59 / 12%)' : '#f1f5f9',
                color: isListening ? '#B23B3B' : '#64748b',
              }}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>
          <textarea
            value={obsText}
            onChange={(e) => setObsText(e.target.value)}
            placeholder="Detalhes da visita, condições encontradas, referências de localização..."
            rows={4}
            style={{
              color: '#0f172a',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '12px',
              padding: '16px',
              width: '100%',
              resize: 'vertical',
              fontFamily: 'inherit',
              fontSize: '14px',
              lineHeight: '1.6',
              outline: 'none',
            }}
          />
          {isListening && (
            <p className="text-xs mt-1 animate-pulse" style={{ color: '#B23B3B' }}>
              🔴 Ouvindo... Fale agora e clique no ícone para parar.
            </p>
          )}
        </div>

        {/* Save button */}
        <button
          type="button"
          onClick={handleSave}
          disabled={!outcome || isSaving}
          className="w-full py-4 text-white text-lg font-bold rounded-xl transition-opacity disabled:opacity-40 flex items-center justify-center gap-2 shadow-sm"
          style={{ backgroundColor: '#1F3B57' }}
        >
          {isSaving ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Sincronizando...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" /> Salvar Visita
            </>
          )}
        </button>
      </div>
    </div>
  );
}
