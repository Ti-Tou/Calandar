import {
  startOfWeek, endOfWeek, startOfMonth, endOfMonth,
  eachDayOfInterval, addWeeks, subWeeks, addMonths, subMonths,
  format, isSameDay, isSameMonth, startOfDay, getHours, getMinutes,
} from 'date-fns'
import { fr } from 'date-fns/locale'

export const HOUR_START = 7
export const HOUR_END = 23
export const HOUR_HEIGHT = 64 // px per hour

export function getWeekDays(date: Date): Date[] {
  const start = startOfWeek(date, { weekStartsOn: 1 })
  const end = endOfWeek(date, { weekStartsOn: 1 })
  return eachDayOfInterval({ start, end })
}

export function getMonthGrid(date: Date): Date[] {
  const monthStart = startOfMonth(date)
  const monthEnd = endOfMonth(date)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  return eachDayOfInterval({ start: gridStart, end: gridEnd })
}

export function getMiniCalendarDays(date: Date): Date[] {
  return getMonthGrid(date)
}

export function navigateWeek(date: Date, direction: 1 | -1): Date {
  return direction === 1 ? addWeeks(date, 1) : subWeeks(date, 1)
}

export function navigateMonth(date: Date, direction: 1 | -1): Date {
  return direction === 1 ? addMonths(date, 1) : subMonths(date, 1)
}

export function formatWeekHeader(date: Date): string {
  const start = startOfWeek(date, { weekStartsOn: 1 })
  const end = endOfWeek(date, { weekStartsOn: 1 })
  if (isSameMonth(start, end)) {
    return format(start, 'MMMM yyyy', { locale: fr })
  }
  return `${format(start, 'MMM', { locale: fr })} – ${format(end, 'MMM yyyy', { locale: fr })}`
}

export function formatMonthHeader(date: Date): string {
  return format(date, 'MMMM yyyy', { locale: fr })
}

/** Top offset in px for an event starting at `time` within the grid */
export function timeToTopPx(time: Date): number {
  const hours = getHours(time) - HOUR_START
  const minutes = getMinutes(time)
  return (hours + minutes / 60) * HOUR_HEIGHT
}

/** Height in px for an event spanning start → end */
export function durationToPx(start: Date, end: Date): number {
  const diffMs = end.getTime() - start.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)
  return Math.max(diffHours * HOUR_HEIGHT, 18)
}

export function formatTime(date: Date): string {
  return format(date, 'HH:mm')
}

export function formatDayShort(date: Date): string {
  return format(date, 'EEE', { locale: fr })
}

export function formatDayNum(date: Date): string {
  return format(date, 'd')
}

export { isSameDay, isSameMonth, startOfDay, format }
