import React, { createContext, useContext, useReducer, useEffect, useRef, useCallback } from 'react'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import type { CalendarEvent, EventType, ViewType } from '../types'
import { supabase } from '../lib/supabase'
import { fetchEvents, insertEvent, updateEvent, deleteEvent, insertEvents, rowPayloadToEvent } from '../lib/eventStorage'

// ── State ─────────────────────────────────────────────────────────────────────

interface State {
  events: CalendarEvent[]
  view: ViewType
  currentDate: Date
  activeFilters: Record<EventType, boolean>
  modalState: { open: boolean; event: CalendarEvent | null; defaultDate?: Date }
  loading: boolean
  error: string | null
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
  loading: true,
  error: null,
}

// ── Actions ───────────────────────────────────────────────────────────────────

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
  | { type: 'LOAD_SUCCESS'; events: CalendarEvent[] }
  | { type: 'LOAD_ERROR'; error: string }
  | { type: 'ROLLBACK_EVENTS'; events: CalendarEvent[] }
  | { type: 'RT_UPSERT'; event: CalendarEvent }
  | { type: 'RT_DELETE'; id: string }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOAD_SUCCESS':
      return { ...state, events: action.events, loading: false, error: null }
    case 'LOAD_ERROR':
      return { ...state, loading: false, error: action.error }
    case 'ROLLBACK_EVENTS':
      return { ...state, events: action.events }

    case 'ADD_EVENT':
      return { ...state, events: [...state.events, action.event] }
    case 'UPDATE_EVENT':
      return { ...state, events: state.events.map(e => e.id === action.event.id ? action.event : e) }
    case 'DELETE_EVENT':
      return { ...state, events: state.events.filter(e => e.id !== action.id || !!e.locked) }
    case 'IMPORT_EVENTS': {
      const existingIds = new Set(state.events.map(e => e.id))
      const newEvents = action.events.filter(e => !existingIds.has(e.id))
      return { ...state, events: [...state.events, ...newEvents] }
    }

    case 'RT_UPSERT': {
      const exists = state.events.some(e => e.id === action.event.id)
      return {
        ...state,
        events: exists
          ? state.events.map(e => e.id === action.event.id ? action.event : e)
          : [...state.events, action.event],
      }
    }
    case 'RT_DELETE':
      return { ...state, events: state.events.filter(e => e.id !== action.id) }

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

// ── Context ───────────────────────────────────────────────────────────────────

interface CalendarContextValue {
  state: State
  dispatch: React.Dispatch<Action>
  filteredEvents: CalendarEvent[]
}

const CalendarContext = createContext<CalendarContextValue | null>(null)

export function CalendarProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, defaultState)
  const eventsRef = useRef<CalendarEvent[]>([])
  eventsRef.current = state.events

  // ── Initial load ───────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    fetchEvents()
      .then(events => { if (!cancelled) dispatch({ type: 'LOAD_SUCCESS', events }) })
      .catch(err => { if (!cancelled) dispatch({ type: 'LOAD_ERROR', error: String(err?.message ?? err) }) })
    return () => { cancelled = true }
  }, [])

  // ── Realtime subscription ──────────────────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel('events-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events' },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          if (payload.eventType === 'DELETE') {
            const id = (payload.old as { id?: string }).id
            if (id) dispatch({ type: 'RT_DELETE', id })
            return
          }
          if (payload.new && (payload.new as Record<string, unknown>).id) {
            dispatch({ type: 'RT_UPSERT', event: rowPayloadToEvent(payload.new as Record<string, unknown>) })
          }
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  // ── Dispatch with Supabase sync ────────────────────────────────────────────
  const dispatchWithSync = useCallback(async (action: Action) => {
    const snapshot = eventsRef.current
    dispatch(action)
    try {
      if (action.type === 'ADD_EVENT') await insertEvent(action.event)
      else if (action.type === 'UPDATE_EVENT') await updateEvent(action.event)
      else if (action.type === 'DELETE_EVENT') await deleteEvent(action.id)
      else if (action.type === 'IMPORT_EVENTS') await insertEvents(action.events)
    } catch (err) {
      console.error('[CalendarContext] Sync failed, rolling back:', err)
      dispatch({ type: 'ROLLBACK_EVENTS', events: snapshot })
    }
  }, [])

  const filteredEvents = state.events.filter(e => state.activeFilters[e.type])

  return (
    <CalendarContext.Provider value={{ state, dispatch: dispatchWithSync as React.Dispatch<Action>, filteredEvents }}>
      {children}
    </CalendarContext.Provider>
  )
}

export function useCalendar() {
  const ctx = useContext(CalendarContext)
  if (!ctx) throw new Error('useCalendar must be inside CalendarProvider')
  return ctx
}
