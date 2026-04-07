import type { CalendarEvent } from '../../types'
import { EVENT_COLORS } from '../../types'
import { formatTime, timeToTopPx, durationToPx } from '../../utils/dateUtils'
import { useCalendar } from '../../context/CalendarContext'

interface Props {
  event: CalendarEvent
  leftPercent: number
  widthPercent: number
}

export default function EventBlock({ event, leftPercent, widthPercent }: Props) {
  const { dispatch } = useCalendar()
  const colors = EVENT_COLORS[event.type]
  const top = timeToTopPx(event.start)
  const height = durationToPx(event.start, event.end)

  const roomsLabel = event.rooms?.join(', ')

  return (
    <div
      onClick={(e) => { e.stopPropagation(); dispatch({ type: 'OPEN_MODAL', event }) }}
      className={`
        absolute rounded-md border-l-4 px-1.5 py-0.5 cursor-pointer overflow-hidden
        ${colors.bg} ${colors.text} ${colors.border}
        hover:brightness-95 transition-all select-none
      `}
      style={{
        top: `${top}px`,
        height: `${height}px`,
        left: `${leftPercent}%`,
        width: `${widthPercent}%`,
        minHeight: '18px',
      }}
    >
      <p className="text-xs font-semibold leading-tight truncate flex items-center gap-1">
        {event.locked && <span className="opacity-50 shrink-0">🔒</span>}
        <span className="truncate">{event.title}</span>
      </p>
      {height > 30 && (
        <p className="text-[10px] opacity-75 leading-tight">
          {formatTime(event.start)} – {formatTime(event.end)}
        </p>
      )}
      {height > 48 && roomsLabel && (
        <p className="text-[10px] opacity-70 leading-tight truncate mt-0.5">
          {event.rooms!.length > 1 ? '🏛 ' : '📍 '}{roomsLabel}
        </p>
      )}
    </div>
  )
}
