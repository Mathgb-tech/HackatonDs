"use client";

import { useGestantes } from "@/context/GestanteContext";
import { useParams, useRouter } from "next/navigation";
import { useState, useMemo, useRef } from "react";
import { format, parseISO, differenceInDays, startOfDay } from "date-fns";
import { ArrowLeft, Plus, Mic, MicOff, Calendar, User, FileText, AlertCircle, MapPin } from "lucide-react";
import Link from "next/link";
import { Observation } from "@/lib/types";

const STATUS_COLORS: Record<string, string> = {
  'Em dia':      '#1F8A57',
  'Atenção':     '#B8790E',
  'Busca ativa': '#B23B3B',
  'Sem vínculo': '#7A2E2E',
};
const STATUS_BG: Record<string, string> = {
  'Em dia':      'rgb(31 138 87 / 12%)',
  'Atenção':     'rgb(184 121 14 / 12%)',
  'Busca ativa': 'rgb(178 59 59 / 12%)',
  'Sem vínculo': 'rgb(122 46 46 / 12%)',
};

export default function GestanteProfile() {
  const { id } = useParams();
  const router = useRouter();
  const { gestantes, updateGestante, role } = useGestantes();
  const [obsText, setObsText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const recognitionRef = useRef<any>(null);

  const gestante = useMemo(() => gestantes.find((g) => g.id === id), [gestantes, id]);

  if (!gestante) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl" style={{ color: '#64748b' }}>Gestante não encontrada.</h2>
        <button onClick={() => router.push('/')} className="mt-4 hover:underline" style={{ color: '#1F3B57' }}>
          Voltar para o Kanban
        </button>
      </div>
    );
  }

  const today = startOfDay(new Date());
  const daysSinceLastConsult = gestante.lastConsultationDate
    ? differenceInDays(today, parseISO(gestante.lastConsultationDate))
    : null;

  const handleMicClick = () => {
    const SpeechRecognitionAPI =
      (typeof window !== 'undefined') &&
      ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

    if (!SpeechRecognitionAPI) {
      setVoiceError('Navegador não suporta voz. Use Chrome ou Edge.');
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.abort();
      setIsListening(false);
      return;
    }

    setVoiceError('');
    const recognition = new SpeechRecognitionAPI();
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;
    recognition.continuous = false;
    recognitionRef.current = recognition;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (e: any) => {
      setIsListening(false);
      if (e.error === 'aborted') return;
      if (e.error === 'network') {
        setVoiceError('Erro de rede. Use Chrome ou Edge — o Brave bloqueia este recurso por padrão.');
      } else if (e.error === 'not-allowed') {
        setVoiceError('Permissão de microfone negada. Clique no ícone 🔒 na barra de endereço e permita o microfone.');
      } else if (e.error === 'no-speech') {
        setVoiceError('Nenhuma fala detectada. Tente novamente.');
      } else {
        setVoiceError(`Erro no microfone: ${e.error}`);
      }
    };
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setObsText((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };

    recognition.start();
  };

  const handleSaveObservation = () => {
    if (!obsText.trim()) return;

    const newObs: Observation = {
      id: Math.random().toString(36).substring(7),
      date: new Date().toISOString(),
      author: role,
      text: obsText.trim(),
    };

    updateGestante(gestante.id, {
      observations: [newObs, ...gestante.observations],
    });
    setObsText("");
  };

  const statusColor = STATUS_COLORS[gestante.status] || '#64748b';
  const statusBg = STATUS_BG[gestante.status] || 'rgb(100 116 139 / 10%)';

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <button
        onClick={() => router.push('/')}
        className="flex items-center gap-2 mb-6 font-medium hover:opacity-70 transition-opacity"
        style={{ color: '#64748b' }}
      >
        <ArrowLeft className="w-4 h-4" /> Voltar ao Painel
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="md:col-span-1 space-y-4">
          {/* Identity card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgb(31 59 87 / 10%)', color: '#1F3B57' }}
              >
                <User className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800">{gestante.name}</h1>
                <span
                  className="px-2 py-0.5 rounded text-xs font-bold uppercase"
                  style={{ color: statusColor, backgroundColor: statusBg }}
                >
                  {gestante.status}
                  {gestante.statusOrigin === 'manual' && ' (manual)'}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-sm" style={{ color: '#64748b' }}>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" style={{ color: '#94a3b8' }} />
                <span><strong style={{ color: '#1e293b' }}>{gestante.gestationalAgeWeeks} semanas</strong> de gestação</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" style={{ color: '#94a3b8' }} />
                <span style={{ color: '#1e293b' }}>{gestante.microArea}</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" style={{ color: '#94a3b8' }} />
                <span>
                  Acesso:{' '}
                  <strong style={{ color: '#1e293b' }}>
                    {gestante.accessDifficulty === 'hard' ? 'Difícil' : 'Fácil'}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* Consultation summary */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" style={{ color: '#1F3B57' }} /> Consultas
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p style={{ color: '#64748b' }} className="mb-1">Última consulta</p>
                <p className="font-semibold text-slate-800">
                  {gestante.lastConsultationDate
                    ? `${format(parseISO(gestante.lastConsultationDate), 'dd/MM/yyyy')} (${daysSinceLastConsult} dias atrás)`
                    : 'Não registrada'}
                </p>
              </div>
              <div>
                <p style={{ color: '#64748b' }} className="mb-1">Próxima consulta</p>
                <p className="font-semibold text-slate-800">
                  {gestante.nextExpectedConsultation
                    ? format(parseISO(gestante.nextExpectedConsultation), 'dd/MM/yyyy')
                    : 'Não agendada'}
                </p>
              </div>
              {gestante.missedAppointments > 0 && (
                <div className="p-2 rounded flex items-start gap-2 bg-orange-50 text-orange-700">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{gestante.missedAppointments} falta(s) registrada(s)</span>
                </div>
              )}
              {gestante.pendingExams.length > 0 && (
                <div>
                  <p style={{ color: '#64748b' }} className="mb-1">Exames pendentes</p>
                  <ul className="list-disc list-inside space-y-1">
                    {gestante.pendingExams.map((exam, i) => (
                      <li key={i} className="text-xs text-red-700">{exam}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <Link
            href={`/gestante/${gestante.id}/visit`}
            className="block w-full py-3 px-4 text-white text-center rounded-lg font-bold transition-opacity hover:opacity-90 shadow-sm"
            style={{ backgroundColor: '#1F3B57' }}
          >
            Registrar Visita
          </Link>
        </div>

        {/* Right column: Observations */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" style={{ color: '#1F3B57' }} /> Diário e Observações
            </h3>

            {/* Text input */}
            <div className="mb-6">
              <div className="relative">
                <textarea
                  value={obsText}
                  onChange={(e) => setObsText(e.target.value)}
                  placeholder="Adicionar nova observação..."
                  rows={4}
                  style={{
                    color: '#0f172a',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '12px',
                    paddingRight: '48px',
                    width: '100%',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={handleMicClick}
                  title={isListening ? "Parar ditado" : "Ditar observação por voz"}
                  className="absolute top-3 right-3 p-2 rounded-full transition-colors"
                  style={{
                    backgroundColor: isListening ? 'rgb(178 59 59 / 15%)' : '#f1f5f9',
                    color: isListening ? '#B23B3B' : '#64748b',
                  }}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              </div>
              {isListening && (
                <p className="text-xs mt-1 animate-pulse" style={{ color: '#B23B3B' }}>
                  🔴 Ouvindo... Fale agora e clique novamente para parar.
                </p>
              )}
              {voiceError && (
                <div className="mt-2 flex items-start gap-2 p-2 rounded-lg text-xs border"
                     style={{ backgroundColor: '#fff7ed', color: '#c2410c', borderColor: '#fed7aa' }}>
                  <span>⚠️</span>
                  <span className="flex-1">{voiceError}</span>
                  <button type="button" onClick={() => setVoiceError('')} style={{ color: '#c2410c' }}>✕</button>
                </div>
              )}
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={handleSaveObservation}
                  disabled={!obsText.trim()}
                  className="px-4 py-2 text-white text-sm font-bold rounded-lg transition-opacity flex items-center gap-2 disabled:opacity-40"
                  style={{ backgroundColor: '#1F3B57' }}
                >
                  <Plus className="w-4 h-4" /> Salvar Observação
                </button>
              </div>
            </div>

            {/* Timeline */}
            <div className="flex-1 space-y-4">
              {gestante.observations.length === 0 ? (
                <p className="text-center py-8 text-sm" style={{ color: '#94a3b8' }}>
                  Nenhuma observação registrada ainda.
                </p>
              ) : (
                gestante.observations.map((obs) => (
                  <div
                    key={obs.id}
                    className="flex gap-4 pl-4 py-1 relative"
                    style={{ borderLeft: '2px solid #e2e8f0' }}
                  >
                    <div
                      className="absolute w-3 h-3 rounded-full -left-[7px] top-2 border-2 border-white"
                      style={{ backgroundColor: '#1F3B57' }}
                    />
                    <div className="flex-1 rounded-lg p-3 border" style={{ backgroundColor: '#f8fafc', borderColor: '#f1f5f9' }}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold" style={{ color: '#64748b' }}>{obs.author}</span>
                        <span className="text-xs" style={{ color: '#94a3b8' }}>
                          {format(parseISO(obs.date), 'dd/MM/yyyy HH:mm')}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap" style={{ color: '#334155' }}>{obs.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
