export type EventType = 'course' | 'appointment' | 'task' | 'exam' | 'other'
export type ViewType = 'week' | 'month'

export interface CalendarEvent {
  id: string
  title: string
  type: EventType
  start: Date
  end: Date
  description?: string
  rooms?: string[]
  locked?: boolean  // true = imported from .ics, cannot be deleted
}

export const EVENT_COLORS: Record<EventType, { bg: string; text: string; border: string }> = {
  course:      { bg: 'bg-violet-100', text: 'text-violet-800', border: 'border-violet-400' },
  appointment: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-400' },
  task:        { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-400' },
  exam:        { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-400' },
  other:       { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-400' },
}

export const EVENT_DOT_COLORS: Record<EventType, string> = {
  course:      'bg-violet-500',
  appointment: 'bg-emerald-500',
  task:        'bg-orange-500',
  exam:        'bg-red-500',
  other:       'bg-pink-500',
}

export const EVENT_SOLID_COLORS: Record<EventType, string> = {
  course:      'bg-violet-500',
  appointment: 'bg-emerald-500',
  task:        'bg-orange-500',
  exam:        'bg-red-500',
  other:       'bg-pink-500',
}

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  course:      'Cours',
  appointment: 'Rendez-vous',
  task:        'Tâche',
  exam:        'Examen',
  other:       'Autre',
}
