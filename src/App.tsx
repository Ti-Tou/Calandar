import { useState, useEffect } from 'react'
import { CalendarProvider, useCalendar } from './context/CalendarContext'
import Header from './components/Header/Header'
import Sidebar from './components/Sidebar/Sidebar'
import WeekView from './components/WeekView/WeekView'
import MonthView from './components/MonthView/MonthView'
import EventModal from './components/EventModal/EventModal'
import PinGate from './components/PinGate/PinGate'
import ShareModal from './components/ShareModal/ShareModal'
import ImportPrompt from './components/ImportPrompt/ImportPrompt'
import { storePendingShare, consumePendingShare, decodeEvents } from './utils/shareUtils'
import type { CalendarEvent } from './types'

// Detect share hash immediately on load, before PIN gate renders
function detectShareHash() {
  const hash = window.location.hash
  if (hash.startsWith('#share=')) {
    const encoded = hash.slice('#share='.length)
    storePendingShare(encoded)
    // Clean the URL so the hash doesn't persist
    history.replaceState(null, '', window.location.pathname)
  }
}
detectShareHash()

function CalendarApp() {
  const { state } = useCalendar()
  const [shareOpen, setShareOpen] = useState(false)
  const [pendingEvents, setPendingEvents] = useState<CalendarEvent[] | null>(null)

  // After PIN unlock, check for pending share
  useEffect(() => {
    const encoded = consumePendingShare()
    if (!encoded) return
    const events = decodeEvents(encoded)
    if (events && events.length > 0) {
      setPendingEvents(events)
    }
  }, [])

  return (
    <div className="flex flex-col h-screen bg-white">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar onShareClick={() => setShareOpen(true)} />
        <main className="flex-1 flex flex-col overflow-hidden">
          {state.view === 'week' ? <WeekView /> : <MonthView />}
        </main>
      </div>
      <EventModal />
      {shareOpen && (
        <ShareModal events={state.events} onClose={() => setShareOpen(false)} />
      )}
      {pendingEvents && (
        <ImportPrompt events={pendingEvents} onDone={() => setPendingEvents(null)} />
      )}
    </div>
  )
}

export default function App() {
  return (
    <PinGate>
      <CalendarProvider>
        <CalendarApp />
      </CalendarProvider>
    </PinGate>
  )
}
