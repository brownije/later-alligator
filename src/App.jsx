import { useState, useCallback } from 'react'
import './App.css'

const UNITS = ['minutes', 'hours', 'days', 'weeks', 'months', 'years']

function nowDate() {
  return new Date()
}

function toDateValue(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function toTimeValue(date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function applyInterval(date, amount, unit) {
  const d = new Date(date)
  const n = Number(amount)
  switch (unit) {
    case 'minutes': d.setMinutes(d.getMinutes() + n); break
    case 'hours':   d.setHours(d.getHours() + n); break
    case 'days':    d.setDate(d.getDate() + n); break
    case 'weeks':   d.setDate(d.getDate() + n * 7); break
    case 'months':  d.setMonth(d.getMonth() + n); break
    case 'years':   d.setFullYear(d.getFullYear() + n); break
  }
  return d
}

function formatResult(date) {
  return date.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

let nextId = 1

export default function App() {
  const [startDate, setStartDate] = useState(nowDate)
  const [intervals, setIntervals] = useState([])
  const [newAmount, setNewAmount] = useState('')
  const [newUnit, setNewUnit] = useState('hours')
  const [copied, setCopied] = useState(false)

  const handleDateChange = useCallback((e) => {
    if (!e.target.value) return
    const [year, month, day] = e.target.value.split('-').map(Number)
    setStartDate(prev => {
      const d = new Date(prev)
      d.setFullYear(year, month - 1, day)
      return d
    })
  }, [])

  const handleTimeChange = useCallback((e) => {
    if (!e.target.value) return
    const [hours, minutes] = e.target.value.split(':').map(Number)
    setStartDate(prev => {
      const d = new Date(prev)
      d.setHours(hours, minutes, 0, 0)
      return d
    })
  }, [])

  const addInterval = useCallback(() => {
    const n = parseFloat(newAmount)
    if (!newAmount || isNaN(n)) return
    setIntervals(prev => [{ id: nextId++, amount: n, unit: newUnit }, ...prev])
    setNewAmount('')
  }, [newAmount, newUnit])

  const removeInterval = useCallback((id) => {
    setIntervals(prev => prev.filter(i => i.id !== id))
  }, [])

  const resetToNow = useCallback(() => setStartDate(new Date()), [])

  const resultDate = intervals.reduce(
    (d, { amount, unit }) => applyInterval(d, amount, unit),
    startDate
  )
  const hasIntervals = intervals.length > 0

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(formatResult(resultDate))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback for browsers that block clipboard without interaction
    }
  }, [resultDate])

  return (
    <div className="app">
      <header className="app-header">
        <h1>🐊 Later Alligator</h1>
        <p className="subtitle">Calculate a future or past time</p>
      </header>

      <main className="app-main">

        {/* ── Starting Time ── */}
        <section className="card">
          <div className="section-header">
            <h2>Starting Time</h2>
            <button className="btn-ghost" onClick={resetToNow}>Reset to Now</button>
          </div>
          <div className="start-pickers">
            <input
              type="date"
              className="picker-input"
              value={toDateValue(startDate)}
              onChange={handleDateChange}
            />
            <input
              type="time"
              className="picker-input"
              value={toTimeValue(startDate)}
              onChange={handleTimeChange}
            />
          </div>
          <div className="start-preview">{formatResult(startDate)}</div>
        </section>

        {/* ── Add Interval ── */}
        <section className="card">
          <h2>Add Interval</h2>
          <p className="hint">
            Positive = forward · Negative = backward &nbsp;(e.g. <code>-35</code> minutes)
          </p>
          <div className="interval-input-row">
            <input
              type="number"
              className="amount-input"
              placeholder="Amount  (e.g. 10 or -35)"
              value={newAmount}
              onChange={e => setNewAmount(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addInterval()}
            />
            <select value={newUnit} onChange={e => setNewUnit(e.target.value)}>
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            <button className="btn-primary" onClick={addInterval}>Add</button>
          </div>

          {hasIntervals && (
            <ul className="chips">
              {intervals.map(({ id, amount, unit }) => (
                <li key={id} className={`chip ${amount < 0 ? 'neg' : 'pos'}`}>
                  <span>{amount > 0 ? `+${amount}` : amount} {unit}</span>
                  <button className="chip-remove" onClick={() => removeInterval(id)} aria-label="Remove">✕</button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ── Result ── */}
        <section className="card result-card">
          <div className="result-label">{hasIntervals ? 'Result' : 'Starting Time'}</div>
          <div className="result-row">
            <div className="result-time">{formatResult(resultDate)}</div>
            <button
              className={`btn-copy ${copied ? 'copied' : ''}`}
              onClick={copyToClipboard}
              title="Copy to clipboard"
            >
              {copied ? '✓ Copied!' : '📋 Copy'}
            </button>
          </div>
          {hasIntervals && (
            <div className="result-from">from {formatResult(startDate)}</div>
          )}
        </section>

      </main>
    </div>
  )
}


