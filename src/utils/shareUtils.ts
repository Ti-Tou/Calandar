import LZString from 'lz-string'
import type { CalendarEvent } from '../types'

const PENDING_SHARE_KEY = 'calandar_pending_share'

/**
 * Compact serialization with short keys to minimize payload size.
 * i=id, ti=title, ty=type, s=start (ISO), e=end (ISO), d=description, r=rooms
 */
type Compact = { i: string; ti: string; ty: string; s: string; e: string; d?: string; r?: string[] }

function toCompact(events: CalendarEvent[]): Compact[] {
  return events.map(ev => {
    const c: Compact = {
      i: ev.id,
      ti: ev.title,
      ty: ev.type,
      s: ev.start.toISOString(),
      e: ev.end.toISOString(),
    }
    if (ev.description) c.d = ev.description
    if (ev.rooms?.length) c.r = ev.rooms
    return c
  })
}

function fromCompact(raw: unknown): CalendarEvent[] | null {
  if (!Array.isArray(raw)) return null
  return (raw as Compact[]).map(c => ({
    id: c.i,
    title: c.ti,
    type: c.ty as CalendarEvent['type'],
    start: new Date(c.s),
    end: new Date(c.e),
    description: c.d,
    rooms: c.r,
  }))
}

/** Encode events → compressed URL-safe string (LZ-string) */
export function encodeEvents(events: CalendarEvent[]): string {
  const json = JSON.stringify(toCompact(events))
  return LZString.compressToEncodedURIComponent(json)
}

/** Decode compressed string → CalendarEvent[]. Returns null on error. */
export function decodeEvents(encoded: string): CalendarEvent[] | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(encoded)
    if (!json) return null
    const raw = JSON.parse(json)
    return fromCompact(raw)
  } catch {
    return null
  }
}

export function storePendingShare(encoded: string) {
  sessionStorage.setItem(PENDING_SHARE_KEY, encoded)
}

export function consumePendingShare(): string | null {
  const val = sessionStorage.getItem(PENDING_SHARE_KEY)
  if (val) sessionStorage.removeItem(PENDING_SHARE_KEY)
  return val
}
