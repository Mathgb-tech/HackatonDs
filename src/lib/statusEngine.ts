import { Gestante, Status } from './types';
import { differenceInDays, parseISO, startOfDay } from 'date-fns';

/**
 * Pure rule-based status engine.
 *
 * Rules (highest priority first):
 * 1. No lastConsultationDate AND no nextExpectedConsultation → Sem vínculo
 * 2. missedAppointments > 0 OR pendingExams.length > 0 → Busca ativa
 * 3. nextExpectedConsultation is overdue (past) → Busca ativa
 * 4. Last consultation was > 60 days ago with no upcoming appointment → Busca ativa
 * 5. nextExpectedConsultation within the next 7 days → Atenção
 * 6. nextExpectedConsultation within 8–21 days → Atenção
 * 7. Otherwise → Em dia
 */
export function calculateStatus(gestante: Omit<Gestante, 'status' | 'statusOrigin'>): Status {
  const today = startOfDay(new Date());

  // Rule 1: No registration at all
  if (!gestante.lastConsultationDate && !gestante.nextExpectedConsultation) {
    return 'Sem vínculo';
  }

  // Rule 2: Active problems
  if (gestante.missedAppointments > 0 || gestante.pendingExams.length > 0) {
    return 'Busca ativa';
  }

  // Rule 3: Next consultation is past due
  if (gestante.nextExpectedConsultation) {
    const nextDate = startOfDay(parseISO(gestante.nextExpectedConsultation));
    const daysUntilNext = differenceInDays(nextDate, today);

    if (daysUntilNext < 0) {
      // Overdue
      return 'Busca ativa';
    }

    // Rule 5/6: Upcoming within 14 days → Atenção
    if (daysUntilNext <= 14) {
      return 'Atenção';
    }
  }

  // Rule 4: Last consultation too long ago (> 60 days) and no upcoming appointment
  if (gestante.lastConsultationDate) {
    const lastDate = startOfDay(parseISO(gestante.lastConsultationDate));
    const daysSinceLastConsult = differenceInDays(today, lastDate);

    if (daysSinceLastConsult > 60 && !gestante.nextExpectedConsultation) {
      return 'Busca ativa';
    }

    if (daysSinceLastConsult > 45 && !gestante.nextExpectedConsultation) {
      return 'Atenção';
    }
  }

  return 'Em dia';
}

export function evaluateGestanteStatus(gestante: Gestante): Gestante {
  // Manual overrides persist until data is updated
  if (gestante.statusOrigin === 'manual') {
    return gestante;
  }
  return {
    ...gestante,
    status: calculateStatus(gestante),
  };
}
