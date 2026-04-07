import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useCalendar } from '../../context/CalendarContext'
import { navigateWeek, navigateMonth, formatWeekHeader, formatMonthHeader } from '../../utils/dateUtils'

export default function Header() {
  const { state, dispatch } = useCalendar()
  const { view, currentDate } = state

  const title = view === 'week'
    ? formatWeekHeader(currentDate)
    : formatMonthHeader(currentDate)

  function navigate(dir: 1 | -1) {
    const next = view === 'week'
      ? navigateWeek(currentDate, dir)
      : navigateMonth(currentDate, dir)
    dispatch({ type: 'SET_DATE', date: next })
  }

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white shrink-0">
      {/* Left: nav */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => dispatch({ type: 'SET_DATE', date: new Date() })}
          className="px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          Aujourd'hui
        </button>
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-md hover:bg-gray-100 transition-colors">
          <ChevronLeft size={18} />
        </button>
        <button onClick={() => navigate(1)} className="p-1.5 rounded-md hover:bg-gray-100 transition-colors">
          <ChevronRight size={18} />
        </button>
        <h1 className="text-lg font-semibold text-gray-800 ml-1 capitalize">{title}</h1>
      </div>

      {/* Right: view toggle + add */}
      <div className="flex items-center gap-3">
        <div className="flex rounded-lg border border-gray-300 overflow-hidden">
          <button
            onClick={() => dispatch({ type: 'SET_VIEW', view: 'week' })}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              view === 'week' ? 'bg-violet-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Semaine
          </button>
          <button
            onClick={() => dispatch({ type: 'SET_VIEW', view: 'month' })}
            className={`px-3 py-1.5 text-sm font-medium border-l border-gray-300 transition-colors ${
              view === 'month' ? 'bg-violet-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Mois
          </button>
        </div>
        <button
          onClick={() => dispatch({ type: 'OPEN_MODAL' })}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition-colors"
        >
          <Plus size={16} />
          Ajouter
        </button>
      </div>
    </header>
  )
}
