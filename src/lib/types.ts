export type Status = 'Em dia' | 'Atenção' | 'Busca ativa' | 'Sem vínculo';
export type StatusOrigin = 'auto' | 'manual';
export type AccessDifficulty = 'easy' | 'hard';
export type Role = 'ACS' | 'Enfermeiro' | 'Gestor';

export interface Observation {
  id: string;
  date: string;
  author: string;
  text: string;
}

export interface Gestante {
  id: string;
  name: string;
  gestationalAgeWeeks: number;
  lastConsultationDate: string | null;
  nextExpectedConsultation: string | null;
  pendingExams: string[];
  missedAppointments: number;
  accessDifficulty: AccessDifficulty;
  microArea: string;
  status: Status;
  statusOrigin: StatusOrigin;
  observations: Observation[];
  lat?: number;
  lng?: number;
}

export interface VisitFormData {
  outcome: 'Contato realizado' | 'Consulta agendada' | 'Recusou' | 'Não localizada';
  observationText: string;
  author: string;
}
