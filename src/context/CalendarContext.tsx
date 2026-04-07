import React, { createContext, useContext, useReducer, useEffect } from 'react'
import type { CalendarEvent, EventType, ViewType } from '../types'

// ── State ────────────────────────────────────────────────────────────────────

interface State {
  events: CalendarEvent[]
  view: ViewType
  currentDate: Date
  activeFilters: Record<EventType, boolean>
  modalState: { open: boolean; event: CalendarEvent | null; defaultDate?: Date }
}

const ALL_FILTERS: Record<EventType, boolean> = {
  course: true, appointment: true, task: true, exam: true, other: true,
}

const defaultState: State = {
  events: [],
  view: 'week',
  currentDate: new Date(),
  activeFilters: ALL_FILTERS,
  modalState: { open: false, event: null },
}

// ── Actions ──────────────────────────────────────────────────────────────────

type Action =
  | { type: 'ADD_EVENT'; event: CalendarEvent }
  | { type: 'UPDATE_EVENT'; event: CalendarEvent }
  | { type: 'DELETE_EVENT'; id: string }
  | { type: 'IMPORT_EVENTS'; events: CalendarEvent[] }
  | { type: 'SET_VIEW'; view: ViewType }
  | { type: 'SET_DATE'; date: Date }
  | { type: 'TOGGLE_FILTER'; eventType: EventType }
  | { type: 'OPEN_MODAL'; event?: CalendarEvent; defaultDate?: Date }
  | { type: 'CLOSE_MODAL' }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_EVENT':
      return { ...state, events: [...state.events, action.event] }
    case 'UPDATE_EVENT':
      return { ...state, events: state.events.map(e => e.id === action.event.id ? action.event : e) }
    case 'DELETE_EVENT':
      return { ...state, events: state.events.filter(e => e.id !== action.id || e.locked) }
    case 'IMPORT_EVENTS': {
      // Merge: skip duplicates by id
      const existingIds = new Set(state.events.map(e => e.id))
      const newEvents = action.events.filter(e => !existingIds.has(e.id))
      return { ...state, events: [...state.events, ...newEvents] }
    }
    case 'SET_VIEW':
      return { ...state, view: action.view }
    case 'SET_DATE':
      return { ...state, currentDate: action.date }
    case 'TOGGLE_FILTER':
      return { ...state, activeFilters: { ...state.activeFilters, [action.eventType]: !state.activeFilters[action.eventType] } }
    case 'OPEN_MODAL':
      return { ...state, modalState: { open: true, event: action.event ?? null, defaultDate: action.defaultDate } }
    case 'CLOSE_MODAL':
      return { ...state, modalState: { open: false, event: null } }
    default:
      return state
  }
}

// ── Persistence ───────────────────────────────────────────────────────────────

const STORAGE_KEY = 'calandar_events'

function loadEvents(): CalendarEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Array<Omit<CalendarEvent, 'start' | 'end'> & { start: string; end: string }>
    return parsed.map(e => ({ ...e, start: new Date(e.start), end: new Date(e.end) }))
  } catch {
    return []
  }
}

// ── Context ───────────────────────────────────────────────────────────────────

interface CalendarContextValue {
  state: State
  dispatch: React.Dispatch<Action>
  filteredEvents: CalendarEvent[]
}

const CalendarContext = createContext<CalendarContextValue | null>(null)

export function CalendarProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { ...defaultState, events: loadEvents() })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.events))
  }, [state.events])

  const filteredEvents = state.events.filter(e => state.activeFilters[e.type])

  return (
    <CalendarContext.Provider value={{ state, dispatch, filteredEvents }}>
      {children}
    </CalendarContext.Provider>
  )
}

export function useCalendar() {
  const ctx = useContext(CalendarContext)
  if (!ctx) throw new Error('useCalendar must be inside CalendarProvider')
  return ctx
}
