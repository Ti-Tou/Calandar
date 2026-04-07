import { useRef } from 'react'
import { Upload, Calendar, Wifi, Share2 } from 'lucide-react'
import MiniCalendar from './MiniCalendar'
import Legend from './Legend'
import { useCalendar } from '../../context/CalendarContext'
import { parseIcalFile } from '../../utils/icalParser'

interface Props {
  onShareClick: () => void
}

export default function Sidebar({ onShareClick }: Props) {
  const { dispatch } = useCalendar()
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFile(file: File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const events = parseIcalFile(text)
      if (events.length > 0) {
        dispatch({ type: 'IMPORT_EVENTS', events })
        alert(`${events.length} événement(s) importé(s) avec succès !`)
      } else {
        alert('Aucun événement trouvé dans ce fichier.')
      }
    }
    reader.readAsText(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  return (
    <aside className="w-56 shrink-0 border-r border-gray-200 bg-gray-50 flex flex-col overflow-y-auto">
      <MiniCalendar />
      <hr className="border-gray-200 mx-3" />
      <Legend />
      <hr className="border-gray-200 mx-3" />

      {/* iCal import */}
      <div className="px-3 py-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Importer</p>
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center cursor-pointer hover:border-violet-400 hover:bg-violet-50 transition-colors"
        >
          <Upload size={16} className="mx-auto mb-1 text-gray-400" />
          <p className="text-xs text-gray-500">Glisser un .ics ici</p>
          <p className="text-[10px] text-gray-400 mt-0.5">ou cliquer pour parcourir</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".ics,.ical"
          className="hidden"
          onChange={handleInputChange}
        />
      </div>

      {/* Share button */}
      <div className="px-3 py-2">
        <button
          onClick={onShareClick}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-violet-600 text-white text-xs font-medium hover:bg-violet-700 transition-colors shadow-sm"
        >
          <Share2 size={14} />
          Partager le calendrier
        </button>
      </div>

      {/* Google Calendar */}
      <div className="px-3 py-2">
        <button
          onClick={() => alert('Pour activer Google Calendar, configurez votre OAuth 2.0 Client ID dans src/config.ts')}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-gray-300 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <Calendar size={14} className="text-blue-500" />
          Google Calendar
        </button>
      </div>

      {/* Access URL */}
      <div className="px-3 py-2 mt-auto border-t border-gray-200">
        <div className="flex items-center gap-1.5 mb-1">
          <Wifi size={12} className="text-violet-500" />
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Lien d'accès</p>
        </div>
        <div
          className="bg-violet-50 border border-violet-200 rounded-lg px-2 py-1.5 text-center cursor-pointer hover:bg-violet-100 transition-colors"
          onClick={() => navigator.clipboard.writeText(window.location.origin)}
          title="Cliquer pour copier"
        >
          <p className="text-xs font-mono font-semibold text-violet-700 select-all break-all">
            {window.location.host}
          </p>
        </div>
        <p className="text-[10px] text-gray-400 mt-1 text-center">Cliquer pour copier</p>
      </div>
    </aside>
  )
}
