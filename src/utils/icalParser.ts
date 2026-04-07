import ICAL from 'ical.js'
import { v4 as uuidv4 } from 'uuid'
import type { CalendarEvent, EventType } from '../types'

export function parseIcalFile(text: string): CalendarEvent[] {
  try {
    const jcal = ICAL.parse(text)
    const comp = new ICAL.Component(jcal)
    const vevents = comp.getAllSubcomponents('vevent')

    return vevents.map((vevent): CalendarEvent => {
      const ev = new ICAL.Event(vevent)
      const start = ev.startDate.toJSDate()
      const end = ev.endDate?.toJSDate() ?? new Date(start.getTime() + 60 * 60 * 1000)
      const summary = ev.summary ?? 'Sans titre'
      const description = ev.description ?? ''
      const locationRaw = String(vevent.getFirstPropertyValue('location') ?? '')

      const type: EventType = guessType(summary, description, vevent)

      // Rooms: check description "Salles:" block first, fallback to LOCATION field
      const rooms = parseRooms(description, locationRaw, type)

      return {
        id: uuidv4(),
        title: summary,
        type,
        start,
        end,
        description: description || undefined,
        rooms: rooms.length > 0 ? rooms : undefined,
        locked: true,
      }
    })
  } catch (e) {
    console.error('iCal parse error:', e)
    return []
  }
}

/**
 * Extract room list from:
 * 1. ADE "Salles:" block in description (one room per line)
 * 2. Fallback: LOCATION field (comma/semicolon separated)
 */
function parseRooms(description: string, location: string, type: EventType): string[] {
  if (type !== 'course' && type !== 'exam') return []

  // Try "Salles:\nRoom1\nRoom2\n..." block in description
  if (description) {
    const sallesMatch = description.match(/Salles?\s*:\s*\n([\s\S]*?)(?:\n[A-Z]|\n*$)/i)
    if (sallesMatch) {
      const rooms = sallesMatch[1]
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean)
      if (rooms.length > 0) return type === 'course' ? [rooms[0]] : rooms
    }
  }

  // Fallback: LOCATION field
  const loc = location.trim()
  if (!loc) return []
  if (type === 'exam') return loc.split(/[,;]/).map(s => s.trim()).filter(Boolean)
  return [loc]
}

// ── ADE activity code → event type ───────────────────────────────────────────
// Exact codes seen in EFREI ADE exports + common French university systems.

const COURSE_ACTIVITIES = new Set([
  // Standard
  'CM', 'TD', 'TP', 'CTD', 'CTP', 'CCTD', 'CCTP',
  'BE', 'TME', 'CI', 'CIE',
  'COURS', 'LECTURE', 'AMPHI',
  // EFREI specific
  'PRJ',            // Projet = cours suivi
  'TAL', 'TAN',     // Travaux dirigés langue
])

const EXAM_ACTIVITIES = new Set([
  // Standard
  'DS', 'CC', 'CT', 'CF', 'QCM',
  'EXAM', 'EXAMEN', 'PARTIEL', 'PARTIELLE',
  'RATTRAPAGE', 'INTERRO', 'EVALUATION',
  'CONTROLE', 'CONTRÔLE', 'DEVOIR',
  // EFREI specific
  'DE',             // Devoir sur table
  'TAI',            // Test/Approfondissement individuel = contrôle
  'EXARAT',         // Examen rattrapage
  'RATT',           // Rattrapage
])

const TASK_ACTIVITIES = new Set([
  'SOUTENANCE', 'RENDU', 'LIVRABLE',
])

const APPOINTMENT_ACTIVITIES = new Set([
  'REUNION', 'RÉUNION', 'MEETING', 'RDV', 'RENDEZ-VOUS',
  'ENTRETIEN', 'CONFERENCE', 'CONFÉRENCE',
])

/** Extract the value of a labelled field from ADE description text.
 *  e.g. "Activité : CTD" or "Activite: DE" */
function extractField(description: string, fieldNamePattern: string): string {
  const re = new RegExp(`(?:${fieldNamePattern})\\s*:\\s*(.+)`, 'im')
  const match = description.match(re)
  return match?.[1]?.trim() ?? ''
}

// ── Fallback regex (when no Activité field) ───────────────────────────────────
const RE_EXAM = /\b(exam|examen|partiel|partielle|contrôle|controle|épreuve|epreuve|rattrapage|interro|interrogation)\b/i
const RE_EXAM_ABBR = /(?:^|[\s\-_/|])(DS|CC|CT|CF|QCM|DE)(?:$|[\s\-_/|0-9])/i
const RE_COURSE = /\b(cours|amphi|amphithéâtre|séminaire|enseignement)\b/i
const RE_COURSE_ABBR = /(?:^|[\s\-_/|])(CM|TD|TP|BE|TME|CTD|CTP|PRJ)(?:$|[\s\-_/|0-9:])/i
const RE_APPOINTMENT = /\b(rendez-vous|rdv|meeting|réunion|reunion|entretien|conférence)\b/i
const RE_TASK = /\b(tâche|tache|todo|to-do|soutenance|livrable)\b/i

function guessType(
  summary: string,
  description: string,
  vevent: ICAL.Component,
): EventType {
  // ── Priority 1: ADE "Activité:" field (most reliable) ────────────────────────
  if (description) {
    const raw = extractField(description, 'Activit[eé]')
    if (raw) {
      const activite = raw.toUpperCase()

      // Exact match first
      if (COURSE_ACTIVITIES.has(activite)) return 'course'
      if (EXAM_ACTIVITIES.has(activite)) return 'exam'
      if (TASK_ACTIVITIES.has(activite)) return 'task'
      if (APPOINTMENT_ACTIVITIES.has(activite)) return 'appointment'

      // Prefix match for compound codes (e.g. COURS.COMM, COURS.LANGUE, EXARAT...)
      if (/^COURS[.\-_]?/i.test(activite)) return 'course'
      if (/^(CM|TD|TP|CTD|CTP|BE|TME)/i.test(activite)) return 'course'
      if (/^(EXAR|RATT|PARTI|CONTR|EVAL|INTER|EXAM|DEVO)/i.test(activite)) return 'exam'
      if (/^(DS|CC|CT|CF|QCM|DE|TAI)[^A-Z]/i.test(activite + ' ')) return 'exam'
    }
  }

  // ── Priority 2: iCal CATEGORIES property ─────────────────────────────────────
  const catsRaw = vevent.getFirstPropertyValue('categories')
  if (catsRaw) {
    const cats = String(catsRaw).toUpperCase().trim()
    if (EXAM_ACTIVITIES.has(cats) || RE_EXAM.test(cats)) return 'exam'
    if (COURSE_ACTIVITIES.has(cats) || RE_COURSE.test(cats)) return 'course'
  }

  // ── Priority 3: SUMMARY keyword matching ─────────────────────────────────────
  if (RE_EXAM.test(summary) || RE_EXAM_ABBR.test(summary)) return 'exam'
  if (RE_COURSE.test(summary) || RE_COURSE_ABBR.test(summary)) return 'course'
  if (RE_APPOINTMENT.test(summary)) return 'appointment'
  if (RE_TASK.test(summary)) return 'task'

  return 'other'
}
