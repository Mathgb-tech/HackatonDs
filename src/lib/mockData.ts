import { addDays, subDays, format } from 'date-fns';
import { Gestante } from './types';
import { calculateStatus } from './statusEngine';

const today = new Date();
const formatDate = (date: Date) => format(date, 'yyyy-MM-dd');

// Salvador, Bahia — Centro/Liberdade/Boca do Rio area
// Base: Liberdade neighborhood ~-12.9714, -38.5014
// Each gestante gets a slightly offset coordinate around the Salvador metro
const GESTANTE_COORDS: [number, number][] = [
  [-12.9714, -38.5014], // Comunidade Palafita
  [-12.9612, -38.4701], // Área Ribeirinha
  [-12.9820, -38.4890], // Centro Histórico
  [-12.9700, -38.5020], // Comunidade Palafita
  [-12.9534, -38.4620], // Vila Esperança
  [-12.9640, -38.4730], // Área Ribeirinha
  [-12.9725, -38.5030], // Comunidade Palafita
  [-12.9840, -38.4910], // Centro Histórico
  [-12.9580, -38.4690], // Área Ribeirinha
  [-12.9510, -38.4600], // Vila Esperança
  [-12.9740, -38.5055], // Comunidade Palafita
  [-12.9660, -38.4750], // Área Ribeirinha
  [-12.9860, -38.4870], // Centro Histórico
  [-12.9490, -38.4580], // Vila Esperança
  [-12.9755, -38.5070], // Comunidade Palafita
  [-12.9620, -38.4715], // Área Ribeirinha
  [-12.9520, -38.4640], // Vila Esperança
];

const generateMockGestantes = (): Gestante[] => {
  const baseData: Omit<Gestante, 'status' | 'statusOrigin'>[] = [
    {
      id: '1', name: 'Maria Silva', gestationalAgeWeeks: 12,
      lastConsultationDate: formatDate(subDays(today, 30)),
      nextExpectedConsultation: formatDate(addDays(today, 10)),
      pendingExams: [], missedAppointments: 0, accessDifficulty: 'easy',
      microArea: 'Comunidade Palafita', observations: [],
      lat: GESTANTE_COORDS[0][0], lng: GESTANTE_COORDS[0][1]
    },
    {
      id: '2', name: 'Ana Souza', gestationalAgeWeeks: 24,
      lastConsultationDate: formatDate(subDays(today, 15)),
      nextExpectedConsultation: formatDate(addDays(today, 5)),
      pendingExams: [], missedAppointments: 0, accessDifficulty: 'hard',
      microArea: 'Área Ribeirinha', observations: [],
      lat: GESTANTE_COORDS[1][0], lng: GESTANTE_COORDS[1][1]
    },
    {
      id: '3', name: 'Juliana Costa', gestationalAgeWeeks: 32,
      lastConsultationDate: formatDate(subDays(today, 40)),
      nextExpectedConsultation: formatDate(subDays(today, 5)),
      pendingExams: ['Ultrassom Obstétrica'], missedAppointments: 1, accessDifficulty: 'hard',
      microArea: 'Centro Histórico', observations: [],
      lat: GESTANTE_COORDS[2][0], lng: GESTANTE_COORDS[2][1]
    },
    {
      id: '4', name: 'Fernanda Lima', gestationalAgeWeeks: 18,
      lastConsultationDate: null, nextExpectedConsultation: null,
      pendingExams: [], missedAppointments: 0, accessDifficulty: 'hard',
      microArea: 'Comunidade Palafita', observations: [],
      lat: GESTANTE_COORDS[3][0], lng: GESTANTE_COORDS[3][1]
    },
    {
      id: '5', name: 'Camila Santos', gestationalAgeWeeks: 28,
      lastConsultationDate: formatDate(subDays(today, 20)),
      nextExpectedConsultation: formatDate(addDays(today, 1)),
      pendingExams: [], missedAppointments: 0, accessDifficulty: 'easy',
      microArea: 'Vila Esperança', observations: [],
      lat: GESTANTE_COORDS[4][0], lng: GESTANTE_COORDS[4][1]
    },
    {
      id: '6', name: 'Beatriz Pereira', gestationalAgeWeeks: 8,
      lastConsultationDate: formatDate(subDays(today, 60)),
      nextExpectedConsultation: formatDate(subDays(today, 10)),
      pendingExams: ['Hemograma', 'Glicemia'], missedAppointments: 2, accessDifficulty: 'hard',
      microArea: 'Área Ribeirinha', observations: [],
      lat: GESTANTE_COORDS[5][0], lng: GESTANTE_COORDS[5][1]
    },
    {
      id: '7', name: 'Patricia Gomes', gestationalAgeWeeks: 36,
      lastConsultationDate: formatDate(subDays(today, 10)),
      nextExpectedConsultation: formatDate(addDays(today, 15)),
      pendingExams: [], missedAppointments: 0, accessDifficulty: 'easy',
      microArea: 'Comunidade Palafita', observations: [],
      lat: GESTANTE_COORDS[6][0], lng: GESTANTE_COORDS[6][1]
    },
    {
      id: '8', name: 'Letícia Rodrigues', gestationalAgeWeeks: 22,
      lastConsultationDate: formatDate(subDays(today, 25)),
      nextExpectedConsultation: formatDate(addDays(today, 4)),
      pendingExams: [], missedAppointments: 0, accessDifficulty: 'easy',
      microArea: 'Centro Histórico', observations: [],
      lat: GESTANTE_COORDS[7][0], lng: GESTANTE_COORDS[7][1]
    },
    {
      id: '9', name: 'Gabriela Almeida', gestationalAgeWeeks: 15,
      lastConsultationDate: null, nextExpectedConsultation: null,
      pendingExams: [], missedAppointments: 0, accessDifficulty: 'hard',
      microArea: 'Área Ribeirinha', observations: [],
      lat: GESTANTE_COORDS[8][0], lng: GESTANTE_COORDS[8][1]
    },
    {
      id: '10', name: 'Renata Castro', gestationalAgeWeeks: 30,
      lastConsultationDate: formatDate(subDays(today, 45)),
      nextExpectedConsultation: formatDate(addDays(today, 2)),
      pendingExams: ['Exame de Urina'], missedAppointments: 0, accessDifficulty: 'easy',
      microArea: 'Vila Esperança', observations: [],
      lat: GESTANTE_COORDS[9][0], lng: GESTANTE_COORDS[9][1]
    },
    {
      id: '11', name: 'Aline Moura', gestationalAgeWeeks: 10,
      lastConsultationDate: formatDate(subDays(today, 12)),
      nextExpectedConsultation: formatDate(addDays(today, 18)),
      pendingExams: [], missedAppointments: 0, accessDifficulty: 'hard',
      microArea: 'Comunidade Palafita', observations: [],
      lat: GESTANTE_COORDS[10][0], lng: GESTANTE_COORDS[10][1]
    },
    {
      id: '12', name: 'Bruna Mendes', gestationalAgeWeeks: 38,
      lastConsultationDate: formatDate(subDays(today, 7)),
      nextExpectedConsultation: formatDate(addDays(today, 7)),
      pendingExams: [], missedAppointments: 0, accessDifficulty: 'easy',
      microArea: 'Área Ribeirinha', observations: [],
      lat: GESTANTE_COORDS[11][0], lng: GESTANTE_COORDS[11][1]
    },
    {
      id: '13', name: 'Tatiane Barbosa', gestationalAgeWeeks: 20,
      lastConsultationDate: formatDate(subDays(today, 35)),
      nextExpectedConsultation: formatDate(subDays(today, 2)),
      pendingExams: [], missedAppointments: 1, accessDifficulty: 'hard',
      microArea: 'Centro Histórico', observations: [],
      lat: GESTANTE_COORDS[12][0], lng: GESTANTE_COORDS[12][1]
    },
    {
      id: '14', name: 'Luciana Carvalho', gestationalAgeWeeks: 26,
      lastConsultationDate: formatDate(subDays(today, 22)),
      nextExpectedConsultation: formatDate(addDays(today, 8)),
      pendingExams: [], missedAppointments: 0, accessDifficulty: 'easy',
      microArea: 'Vila Esperança', observations: [],
      lat: GESTANTE_COORDS[13][0], lng: GESTANTE_COORDS[13][1]
    },
    {
      id: '15', name: 'Simone Araújo', gestationalAgeWeeks: 14,
      lastConsultationDate: null, nextExpectedConsultation: null,
      pendingExams: [], missedAppointments: 0, accessDifficulty: 'hard',
      microArea: 'Comunidade Palafita', observations: [],
      lat: GESTANTE_COORDS[14][0], lng: GESTANTE_COORDS[14][1]
    },
    {
      id: '16', name: 'Cláudia Ribeiro', gestationalAgeWeeks: 34,
      lastConsultationDate: formatDate(subDays(today, 14)),
      nextExpectedConsultation: formatDate(addDays(today, 14)),
      pendingExams: ['Ecocardiograma Fetal'], missedAppointments: 0, accessDifficulty: 'easy',
      microArea: 'Área Ribeirinha', observations: [],
      lat: GESTANTE_COORDS[15][0], lng: GESTANTE_COORDS[15][1]
    },
    {
      id: '17', name: 'Jéssica Martins', gestationalAgeWeeks: 16,
      lastConsultationDate: formatDate(subDays(today, 28)),
      nextExpectedConsultation: formatDate(addDays(today, 3)),
      pendingExams: [], missedAppointments: 0, accessDifficulty: 'hard',
      microArea: 'Vila Esperança', observations: [],
      lat: GESTANTE_COORDS[16][0], lng: GESTANTE_COORDS[16][1]
    },
  ];

  return baseData.map(gestante => ({
    ...gestante,
    statusOrigin: 'auto' as const,
    status: calculateStatus(gestante)
  }));
};

export const mockGestantes = generateMockGestantes();
