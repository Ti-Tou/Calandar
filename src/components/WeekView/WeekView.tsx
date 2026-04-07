import React, { useRef } from 'react'
import { isSameDay } from 'date-fns'
import { getWeekDays, HOUR_START, HOUR_END, HOUR_HEIGHT, formatDayShort, formatDayNum } from '../../utils/dateUtils'
import { useCalendar } from '../../context/CalendarContext'
import EventBlock from './EventBlock'
import type { CalendarEvent } from '../../types'

const HOURS = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i)
const TOTAL_HEIGHT = HOURS.length * HOUR_HEIGHT

/** Detect overlapping events and assign column layout */
function layoutEvents(events: CalendarEvent[]): Array<{ event: CalendarEvent; col: number; cols: number }> {
  // Sort by start time
  const sorted = [...events].sort((a, b) => a.start.getTime() - b.start.getTime())
  const result: Array<{ event: CalendarEvent; col: number; cols: number }> = []
  const columns: CalendarEvent[][] = []

  for (const ev of sorted) {
    let placed = false
    for (let c = 0; c < columns.length; c++) {
      const last = columns[c][columns[c].length - 1]
      if (last.end.getTime() <= ev.start.getTime()) {
        columns[c].push(ev)
        result.push({ event: ev, col: c, cols: 0 })
        placed = true
        break
      }
    }
    if (!placed) {
      columns.push([ev])
      result.push({ event: ev, col: columns.length - 1, cols: 0 })
    }
  }

  // Set total cols for each event group (events that overlap)
  for (const item of result) {
    item.cols = columns.length
  }

  return result
}

export default function WeekView() {
  const { state, dispatch, filteredEvents } = useCalendar()
  const days = getWeekDays(state.currentDate)
  const today = new Date()
  const containerRef = useRef<HTMLDivElement>(null)

  function handleColumnClick(e: React.MouseEvent, day: Date) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const y = e.clientY - rect.top
    const hour = Math.floor(y / HOUR_HEIGHT) + HOUR_START
    const minutes = Math.round(((y % HOUR_HEIGHT) / HOUR_HEIGHT) * 60 / 15) * 15
    const defaultDate = new Date(day)
    defaultDate.setHours(hour, minutes, 0, 0)
    dispatch({ type: 'OPEN_MODAL', defaultDate })
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Day headers */}
      <div className="flex border-b border-gray-200 bg-white shrink-0 pl-14">
        {days.map((day) => {
          const isToday = isSameDay(day, today)
          return (
            <div key={day.toISOString()} className="flex-1 flex flex-col items-center py-2 border-r border-gray-100 last:border-r-0">
              <span className="text-xs font-medium text-gray-500 capitalize">{formatDayShort(day)}</span>
              <span className={`text-lg font-semibold mt-0.5 w-8 h-8 flex items-center justify-center rounded-full ${
                isToday ? 'bg-violet-600 text-white' : 'text-gray-800'
              }`}>
                {formatDayNum(day)}
              </span>
            </div>
          )
        })}
      </div>

      {/* Scrollable grid */}
      <div className="flex-1 overflow-y-auto" ref={containerRef}>
        <div className="flex" style={{ height: `${TOTAL_HEIGHT}px` }}>
          {/* Time gutter */}
          <div className="w-14 shrink-0 relative border-r border-gray-200">
            {HOURS.map(h => (
              <div key={h} className="absolute w-full" style={{ top: `${(h - HOUR_START) * HOUR_HEIGHT - 8}px` }}>
                <span className="text-[10px] text-gray-400 pl-1 leading-none">{h}:00</span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((day) => {
            const dayEvents = filteredEvents.filter(e => isSameDay(e.start, day))
            const laid = layoutEvents(dayEvents)
            const isToday = isSameDay(day, today)

            return (
              <div
                key={day.toISOString()}
                className={`flex-1 relative border-r border-gray-100 last:border-r-0 cursor-pointer ${isToday ? 'bg-violet-50/30' : ''}`}
                onClick={(e) => handleColumnClick(e, day)}
              >
                {/* Hour lines */}
                {HOURS.map(h => (
                  <div
                    key={h}
                    className="absolute w-full border-t border-gray-100"
                    style={{ top: `${(h - HOUR_START) * HOUR_HEIGHT}px` }}
                  />
                ))}

                {/* Events */}
                {laid.map(({ event, col, cols }) => {
                  const w = 100 / (cols || 1)
                  const l = col * w
                  return (
                    <EventBlock
                      key={event.id}
                      event={event}
                      leftPercent={l + 0.5}
                      widthPercent={w - 1}
                    />
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
