import { useState, useEffect } from 'react'
import { format, addHours } from 'date-fns'
import { X, Trash2, Lock } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { useCalendar } from '../../context/CalendarContext'
import type { EventType, CalendarEvent } from '../../types'
import { EVENT_TYPE_LABELS } from '../../types'

const TYPES: EventType[] = ['course', 'exam', 'appointment', 'task', 'other']

function toInputDateTime(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm")
}

function fromInputDateTime(value: string): Date {
  return new Date(value)
}

export default function EventModal() {
  const { state, dispatch } = useCalendar()
  const { open, event, defaultDate } = state.modalState

  const isEditing = !!event

  const defaultStart = defaultDate ?? new Date()
  const defaultEnd = addHours(defaultStart, 1)

  const [title, setTitle] = useState('')
  const [type, setType] = useState<EventType>('other')
  const [startStr, setStartStr] = useState(toInputDateTime(defaultStart))
  const [endStr, setEndStr] = useState(toInputDateTime(defaultEnd))
  const [description, setDescription] = useState('')
  const [roomsStr, setRoomsStr] = useState('')

  useEffect(() => {
    if (!open) return
    if (event) {
      setTitle(event.title)
      setType(event.type)
      setStartStr(toInputDateTime(event.start))
      setEndStr(toInputDateTime(event.end))
      setDescription(event.description ?? '')
      setRoomsStr(event.rooms?.join(', ') ?? '')
    } else {
      const s = defaultDate ?? new Date()
      const e2 = addHours(s, 1)
      setTitle('')
      setType('other')
      setStartStr(toInputDateTime(s))
      setEndStr(toInputDateTime(e2))
      setDescription('')
      setRoomsStr('')
    }
  }, [open, event, defaultDate])

  if (!open) return null

  function close() {
    dispatch({ type: 'CLOSE_MODAL' })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    const rooms = roomsStr.trim()
      ? roomsStr.split(',').map(s => s.trim()).filter(Boolean)
      : undefined

    const ev: CalendarEvent = {
      id: event?.id ?? uuidv4(),
      title: title.trim(),
      type,
      start: fromInputDateTime(startStr),
      end: fromInputDateTime(endStr),
      description: description.trim() || undefined,
      rooms,
    }

    dispatch({ type: isEditing ? 'UPDATE_EVENT' : 'ADD_EVENT', event: ev })
    close()
  }

  function handleDelete() {
    if (!event) return
    if (confirm('Supprimer cet événement ?')) {
      dispatch({ type: 'DELETE_EVENT', id: event.id })
      close()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={close}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">
            {isEditing ? "Modifier l'événement" : 'Nouvel événement'}
          </h2>
          <button onClick={close} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 flex flex-col gap-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Titre *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Nom de l'événement"
              required
              autoFocus
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
            <div className="flex gap-2 flex-wrap">
              {TYPES.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    type === t
                      ? 'bg-violet-600 text-white border-violet-600'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {EVENT_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          {/* Salles — only for exam (and course for single room) */}
          {(type === 'exam' || type === 'course') && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {type === 'exam' ? 'Salles (séparées par virgule)' : 'Salle'}
              </label>
              <input
                type="text"
                value={roomsStr}
                onChange={e => setRoomsStr(e.target.value)}
                placeholder={type === 'exam' ? 'Amphi A, Salle 203, Salle 104' : 'Amphi B'}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
              />
            </div>
          )}

          {/* Start / End */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Début</label>
              <input
                type="datetime-local"
                value={startStr}
                onChange={e => setStartStr(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Fin</label>
              <input
                type="datetime-local"
                value={endStr}
                onChange={e => setEndStr(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              placeholder="Optionnel…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-1">
            {isEditing && !event?.locked ? (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 size={14} />
                Supprimer
              </button>
            ) : isEditing && event?.locked ? (
              <span className="flex items-center gap-1.5 px-3 py-2 text-xs text-gray-400">
                <Lock size={12} />
                Importé — non supprimable
              </span>
            ) : <span />}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={close}
                className="px-4 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
              >
                {isEditing ? 'Enregistrer' : 'Créer'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
