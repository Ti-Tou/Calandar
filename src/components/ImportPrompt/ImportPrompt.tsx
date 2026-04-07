import { Download, X } from 'lucide-react'
import type { CalendarEvent } from '../../types'
import { useCalendar } from '../../context/CalendarContext'

interface Props {
  events: CalendarEvent[]
  onDone: () => void
}

export default function ImportPrompt({ events, onDone }: Props) {
  const { dispatch } = useCalendar()

  function handleImport() {
    dispatch({ type: 'IMPORT_EVENTS', events })
    onDone()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">Calendrier reçu</h2>
          <button onClick={onDone} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          <div className="flex items-center gap-3 bg-violet-50 border border-violet-200 rounded-xl p-4">
            <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center shrink-0">
              <Download size={18} className="text-violet-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {events.length} événement{events.length > 1 ? 's' : ''} reçu{events.length > 1 ? 's' : ''}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Veux-tu les ajouter à ton calendrier ?
              </p>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={onDone}
              className="px-4 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Ignorer
            </button>
            <button
              onClick={handleImport}
              className="px-4 py-2 text-sm font-medium bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
            >
              Importer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
