import { useState } from 'react'
import { X, Copy, Check, Link } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import type { CalendarEvent } from '../../types'
import { encodeEvents } from '../../utils/shareUtils'

// QR codes can hold ~2900 alphanumeric chars safely
const QR_MAX_URL_LENGTH = 2800

interface Props {
  events: CalendarEvent[]
  onClose: () => void
}

export default function ShareModal({ events, onClose }: Props) {
  const [copied, setCopied] = useState(false)

  const encoded = encodeEvents(events)
  const url = `${window.location.origin}${window.location.pathname}#share=${encoded}`
  const canQR = url.length <= QR_MAX_URL_LENGTH
  const tooLarge = encoded.length > 50_000

  function handleCopy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">Partager le calendrier</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col items-center gap-4">
          {tooLarge ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 w-full text-center">
              Trop d'événements. Supprime quelques-uns ou filtre avant de partager.
            </div>
          ) : canQR ? (
            <>
              <p className="text-sm text-gray-600 text-center">
                Scanne ce QR code avec ton téléphone (même Wi-Fi).
                <br />
                <span className="font-semibold">{events.length} événement{events.length > 1 ? 's' : ''}</span> seront proposés à l'import.
              </p>

              {/* QR Code */}
              <div className="border-4 border-violet-100 rounded-2xl p-3 bg-white">
                <QRCodeSVG
                  value={url}
                  size={200}
                  level="M"
                  fgColor="#4c1d95"
                />
              </div>

              <p className="text-[11px] text-gray-400 text-center">
                ou copie le lien manuellement
              </p>

              {/* URL + copy */}
              <div className="flex gap-2 w-full">
                <input
                  type="text"
                  readOnly
                  value={url}
                  className="flex-1 min-w-0 border border-gray-200 rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-gray-500 bg-gray-50 focus:outline-none"
                  onClick={e => (e.target as HTMLInputElement).select()}
                />
                <button
                  onClick={handleCopy}
                  className={`shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    copied ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? 'Copié' : 'Copier'}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Too long for QR → copy link only */}
              <div className="flex items-center gap-2 text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 w-full text-xs">
                <Link size={14} />
                Trop d'événements pour un QR code — copie le lien ci-dessous.
              </div>
              <p className="text-sm text-gray-600 text-center">
                <span className="font-semibold">{events.length} événements</span> encodés dans le lien.
              </p>
              <div className="flex gap-2 w-full">
                <input
                  type="text"
                  readOnly
                  value={url}
                  className="flex-1 min-w-0 border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono text-gray-700 bg-gray-50 focus:outline-none"
                  onClick={e => (e.target as HTMLInputElement).select()}
                />
                <button
                  onClick={handleCopy}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    copied ? 'bg-emerald-100 text-emerald-700' : 'bg-violet-600 text-white hover:bg-violet-700'
                  }`}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copié !' : 'Copier'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
