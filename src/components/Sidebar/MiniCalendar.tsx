import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format, isSameDay, isSameMonth } from 'date-fns'
import { fr } from 'date-fns/locale'
import { getMiniCalendarDays, navigateMonth } from '../../utils/dateUtils'
import { useCalendar } from '../../context/CalendarContext'

const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

export default function MiniCalendar() {
  const { state, dispatch } = useCalendar()
  const [miniDate, setMiniDate] = useState(new Date())

  const days = getMiniCalendarDays(miniDate)
  const today = new Date()

  function selectDay(day: Date) {
    dispatch({ type: 'SET_DATE', date: day })
    dispatch({ type: 'SET_VIEW', view: 'week' })
  }

  return (
    <div className="p-3">
      {/* Mini header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-700 capitalize">
          {format(miniDate, 'MMMM yyyy', { locale: fr })}
        </span>
        <div className="flex gap-1">
          <button onClick={() => setMiniDate(d => navigateMonth(d, -1))} className="p-0.5 rounded hover:bg-gray-100">
            <ChevronLeft size={14} />
          </button>
          <button onClick={() => setMiniDate(d => navigateMonth(d, 1))} className="p-0.5 rounded hover:bg-gray-100">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map((d, i) => (
          <span key={i} className="text-center text-[10px] font-medium text-gray-400">{d}</span>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {days.map((day, i) => {
          const isToday = isSameDay(day, today)
          const isSelected = isSameDay(day, state.currentDate)
          const inMonth = isSameMonth(day, miniDate)
          return (
            <button
              key={i}
              onClick={() => selectDay(day)}
              className={`
                text-[11px] h-6 w-6 mx-auto rounded-full flex items-center justify-center transition-colors
                ${isToday ? 'bg-violet-600 text-white font-bold' : ''}
                ${isSelected && !isToday ? 'bg-violet-100 text-violet-700 font-semibold' : ''}
                ${!isToday && !isSelected ? (inMonth ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-300 hover:bg-gray-50') : ''}
              `}
            >
              {format(day, 'd')}
            </button>
          )
        })}
      </div>
    </div>
  )
}
