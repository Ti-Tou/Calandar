import { useCalendar } from '../../context/CalendarContext'
import { EVENT_TYPE_LABELS, EVENT_SOLID_COLORS } from '../../types'
import type { EventType } from '../../types'

const TYPES: EventType[] = ['course', 'exam', 'appointment', 'task', 'other']

export default function Legend() {
  const { state, dispatch } = useCalendar()

  return (
    <div className="px-3 py-2">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Filtres</p>
      <div className="flex flex-col gap-1.5">
        {TYPES.map(type => (
          <label key={type} className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={state.activeFilters[type]}
              onChange={() => dispatch({ type: 'TOGGLE_FILTER', eventType: type })}
              className="hidden"
            />
            <span className={`w-3 h-3 rounded-full shrink-0 ${EVENT_SOLID_COLORS[type]} ${!state.activeFilters[type] ? 'opacity-30' : ''}`} />
            <span className={`text-xs font-medium ${state.activeFilters[type] ? 'text-gray-700' : 'text-gray-400'}`}>
              {EVENT_TYPE_LABELS[type]}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}
