import { isSameDay } from 'date-fns'
import { getMonthGrid } from '../../utils/dateUtils'
import { useCalendar } from '../../context/CalendarContext'
import DayCell from './DayCell'

const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

export default function MonthView() {
  const { state, filteredEvents } = useCalendar()
  const days = getMonthGrid(state.currentDate)

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Day labels */}
      <div className="grid grid-cols-7 border-b border-gray-200 bg-white shrink-0">
        {DAY_LABELS.map(d => (
          <div key={d} className="py-2 text-center text-xs font-semibold text-gray-500 border-r border-gray-100 last:border-r-0">
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 flex-1 overflow-y-auto" style={{ gridTemplateRows: `repeat(${Math.ceil(days.length / 7)}, minmax(90px, 1fr))` }}>
        {days.map(day => {
          const dayEvents = filteredEvents.filter(e => isSameDay(e.start, day))
          return (
            <DayCell
              key={day.toISOString()}
              day={day}
              monthDate={state.currentDate}
              events={dayEvents}
            />
          )
        })}
      </div>
    </div>
  )
}
