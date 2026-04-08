import { supabase } from './supabase'
import type { CalendarEvent, EventType } from '../types'

interface EventRow {
  id: string
  title: string
  type: EventType
  start: string
  end: string
  description: string | null
  rooms: string[] | null
  locked: boolean
}

function rowToEvent(row: EventRow): CalendarEvent {
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    start: new Date(row.start),
    end: new Date(row.end),
    description: row.description ?? undefined,
    rooms: row.rooms?.length ? row.rooms : undefined,
    locked: row.locked || undefined,
  }
}

function eventToRow(event: CalendarEvent): Omit<EventRow, never> {
  return {
    id: event.id,
    title: event.title,
    type: event.type,
    start: event.start.toISOString(),
    end: event.end.toISOString(),
    description: event.description ?? null,
    rooms: event.rooms ?? null,
    locked: event.locked ?? false,
  }
}

export async function fetchEvents(): Promise<CalendarEvent[]> {
  const { data, error } = await supabase
    .from('events')
    .select('id, title, type, start, end, description, rooms, locked')
    .order('start', { ascending: true })
  if (error) throw error
  return (data as EventRow[]).map(rowToEvent)
}

export async function insertEvent(event: CalendarEvent): Promise<void> {
  const { error } = await supabase.from('events').insert(eventToRow(event))
  if (error) throw error
}

export async function updateEvent(event: CalendarEvent): Promise<void> {
  const { error } = await supabase.from('events').update(eventToRow(event)).eq('id', event.id)
  if (error) throw error
}

export async function deleteEvent(id: string): Promise<void> {
  const { error } = await supabase.from('events').delete().eq('id', id)
  if (error) throw error
}

export async function insertEvents(events: CalendarEvent[]): Promise<void> {
  if (events.length === 0) return
  const { error } = await supabase
    .from('events')
    .upsert(events.map(eventToRow), { onConflict: 'id' })
  if (error) throw error
}

/** Convert a raw realtime payload row to CalendarEvent */
export function rowPayloadToEvent(row: Record<string, unknown>): CalendarEvent {
  return rowToEvent(row as unknown as EventRow)
}
