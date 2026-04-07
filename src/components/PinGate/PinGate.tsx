import { useState, useEffect } from 'react'
import { Delete } from 'lucide-react'

const STORAGE_KEY = 'calandar_pin'
const DEFAULT_PIN = '1234'
const PIN_LENGTH = 4

export default function PinGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false)
  const [input, setInput] = useState('')
  const [shake, setShake] = useState(false)
  const [newPin, setNewPin] = useState('')
  const [step, setStep] = useState<'enter' | 'new1' | 'new2'>('enter')
  const [error, setError] = useState('')

  const storedPin = localStorage.getItem(STORAGE_KEY) ?? DEFAULT_PIN

  useEffect(() => {
    if (input.length === PIN_LENGTH) {
      if (step === 'enter') {
        if (input === storedPin) {
          setUnlocked(true)
        } else {
          setShake(true)
          setError('Code incorrect')
          setTimeout(() => { setShake(false); setInput(''); setError('') }, 600)
        }
      } else if (step === 'new1') {
        setNewPin(input)
        setInput('')
        setStep('new2')
        setError('')
      } else if (step === 'new2') {
        if (input === newPin) {
          localStorage.setItem(STORAGE_KEY, input)
          setStep('enter')
          setInput('')
          setError('Code modifié !')
          setTimeout(() => setError(''), 2000)
        } else {
          setShake(true)
          setError('Les codes ne correspondent pas')
          setTimeout(() => { setShake(false); setInput(''); setError('') }, 600)
          setStep('new1')
          setNewPin('')
        }
      }
    }
  }, [input])

  if (unlocked) return <>{children}</>

  function press(digit: string) {
    if (input.length < PIN_LENGTH) setInput(p => p + digit)
  }

  function del() {
    setInput(p => p.slice(0, -1))
  }

  const DIGITS = ['1','2','3','4','5','6','7','8','9','','0','⌫']

  const title = step === 'enter'
    ? 'Entrer le code'
    : step === 'new1'
    ? 'Nouveau code'
    : 'Confirmer le code'

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 to-indigo-700 flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-xs flex flex-col items-center gap-6">
        {/* Icon */}
        <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center">
          <span className="text-2xl">📅</span>
        </div>

        <h1 className="text-lg font-bold text-gray-800">{title}</h1>

        {/* Dots */}
        <div className={`flex gap-3 ${shake ? 'animate-bounce' : ''}`}>
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
                i < input.length
                  ? 'bg-violet-600 border-violet-600 scale-110'
                  : 'border-gray-300'
              }`}
            />
          ))}
        </div>

        {error && (
          <p className={`text-xs font-medium ${error.includes('modifié') ? 'text-emerald-600' : 'text-red-500'}`}>
            {error}
          </p>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {DIGITS.map((d, i) => {
            if (d === '') return <div key={i} />
            if (d === '⌫') return (
              <button
                key={i}
                onClick={del}
                className="h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 active:scale-95 transition-all"
              >
                <Delete size={18} />
              </button>
            )
            return (
              <button
                key={i}
                onClick={() => press(d)}
                className="h-14 rounded-2xl bg-gray-50 border border-gray-200 text-gray-800 text-xl font-semibold hover:bg-violet-50 hover:border-violet-300 active:scale-95 transition-all"
              >
                {d}
              </button>
            )
          })}
        </div>

        {/* Change PIN link */}
        {step === 'enter' && (
          <button
            onClick={() => { setStep('new1'); setInput(''); setError('') }}
            className="text-xs text-gray-400 hover:text-violet-600 transition-colors"
          >
            Modifier le code
          </button>
        )}
        {step !== 'enter' && (
          <button
            onClick={() => { setStep('enter'); setInput(''); setNewPin(''); setError('') }}
            className="text-xs text-gray-400 hover:text-violet-600 transition-colors"
          >
            Annuler
          </button>
        )}

        {step === 'enter' && (
          <p className="text-[10px] text-gray-300">Code par défaut : {DEFAULT_PIN}</p>
        )}
      </div>
    </div>
  )
}
