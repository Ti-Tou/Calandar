import { isSameDay, isSameMonth } from 'date-fns'
import { formatDayNum } from '../../utils/dateUtils'
import { EVENT_DOT_COLORS } from '../../types'
import type { CalendarEvent } from '../../types'
import { useCalendar } from '../../context/CalendarContext'

interface Props {
  day: Date
  monthDate: Date
  events: CalendarEvent[]
}

const MAX_VISIBLE = 3

export default function DayCell({ day, monthDate, events }: Props) {
  const { dispatch } = useCalendar()
  const today = new Date()
  const isToday = isSameDay(day, today)
  const inMonth = isSameMonth(day, monthDate)
  const visible = events.slice(0, MAX_VISIBLE)
  const overflow = events.length - MAX_VISIBLE

  function handleCellClick() {
    dispatch({ type: 'OPEN_MODAL', defaultDate: day })
  }

  function handleEventClick(e: React.MouseEvent, event: CalendarEvent) {
    e.stopPropagation()
    dispatch({ type: 'OPEN_MODAL', event })
  }

  return (
    <div
      onClick={handleCellClick}
      className={`
        border-r border-b border-gray-100 p-1 flex flex-col min-h-[90px] cursor-pointer
        hover:bg-gray-50 transition-colors
        ${!inMonth ? 'bg-gray-50' : 'bg-white'}
      `}
    >
      <span className={`
        text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1
        ${isToday ? 'bg-violet-600 text-white' : inMonth ? 'text-gray-800' : 'text-gray-400'}
      `}>
        {formatDayNum(day)}
      </span>
      <div className="flex flex-col gap-0.5 flex-1">
        {visible.map(ev => (
          <button
            key={ev.id}
            onClick={(e) => handleEventClick(e, ev)}
            className={`
              w-full text-left text-[11px] rounded px-1 py-0.5 flex items-center gap-1 truncate
              hover:brightness-95 transition-all
              ${EVENT_DOT_COLORS[ev.type].replace('bg-', 'bg-').replace('-500', '-100')}
            `}
          >
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${EVENT_DOT_COLORS[ev.type]}`} />
            <span className="truncate text-gray-700 font-medium">{ev.title}</span>
            {ev.type === 'exam' && ev.rooms && ev.rooms.length > 0 && (
              <span className="text-gray-400 truncate shrink-0 text-[10px]">({ev.rooms[0]})</span>
            )}
          </button>
        ))}
        {overflow > 0 && (
          <span className="text-[10px] text-gray-400 pl-1">+{overflow} autre{overflow > 1 ? 's' : ''}</span>
        )}
      </div>
    </div>
  )
}
