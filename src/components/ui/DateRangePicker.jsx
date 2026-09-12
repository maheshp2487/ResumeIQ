import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const YEARS = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i)

export default function DateRangePicker({ value, onChange, label = 'Dates' }) {
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef(null)
  const isMounted = useRef(false)
  const [popupStyle, setPopupStyle] = useState({})
  const [validationError, setValidationError] = useState('')

  const parseDateStr = (str) => {
    if (!str || str === 'Present' || str === 'End' || str === '...') return { month: '', year: '' }
    const parts = str.trim().split(' ')
    if (parts.length === 1) {
      if (MONTHS.includes(parts[0])) return { month: parts[0], year: '' }
      return { month: '', year: parts[0] }
    }
    if (parts.length >= 2) return { month: parts[0], year: parts[1] }
    return { month: '', year: '' }
  }

  const [startParts, setStartParts] = useState({ month: '', year: '' })
  const [endParts, setEndParts] = useState({ month: '', year: '' })
  const [isPresent, setIsPresent] = useState(false)

  // Parse initial value once on mount
  useEffect(() => {
    if (!value) return
    const dashIdx = value.indexOf(' - ')
    if (dashIdx === -1) return
    const s = value.slice(0, dashIdx).trim()
    const e = value.slice(dashIdx + 3).trim()
    setStartParts(parseDateStr(s))
    if (e === 'Present') {
      setIsPresent(true)
      setEndParts({ month: '', year: '' })
    } else {
      setIsPresent(false)
      setEndParts(parseDateStr(e))
    }
  }, [])

  // Emit onChange — skip on very first render
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true
      return
    }
    if (!startParts.year && !endParts.year && !isPresent) return

    const sStr = startParts.month && startParts.year
      ? `${startParts.month} ${startParts.year}`
      : startParts.year
    const eStr = isPresent
      ? 'Present'
      : (endParts.month && endParts.year ? `${endParts.month} ${endParts.year}` : endParts.year)

    if (sStr || eStr) {
      onChange(`${sStr || '...'} - ${eStr || '...'}`)
    }
  }, [startParts, endParts, isPresent])

  const openPicker = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const popupH = 300

      setPopupStyle({
        position: 'fixed',
        top: spaceBelow >= popupH ? rect.bottom + 8 : rect.top - popupH - 8,
        left: Math.min(rect.left, window.innerWidth - 320),
        width: Math.max(rect.width, 300),
        zIndex: 10001,
      })
    }
    setValidationError('')
    setIsOpen(true)
  }

  const handleDone = () => {
    // Validate: start year is required
    if (!startParts.year) {
      setValidationError('Start year is required to continue.')
      return
    }
    if (!isPresent && !endParts.year) {
      setValidationError('Select an end year, or check Present if you are still here.')
      return
    }
    setValidationError('')
    setIsOpen(false)
  }

  const popupContent = isOpen ? createPortal(
    <>
      {/* Backdrop — dims everything. Click does NOT close; user must use Done or ✕ */}
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)' }}
        onClick={() => setValidationError('Please fill in the required fields and click Apply.')}
      />

      {/* Picker panel — above backdrop */}
      <div
        style={popupStyle}
        className="bg-bg-secondary border border-border rounded-2xl shadow-2xl flex flex-col gap-4 p-5"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-txt">Select Date Range</span>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-txt-muted hover:text-txt p-1 rounded-lg hover:bg-bg transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Validation error */}
        {validationError && (
          <div className="flex items-center gap-2 px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-500 font-medium">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            {validationError}
          </div>
        )}

        {/* Start Date */}
        <div>
          <label className="text-xs font-bold text-txt-muted uppercase tracking-wider mb-2 block">
            Start Date <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <select
              className="flex-1 bg-bg border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-brand text-txt cursor-pointer"
              value={startParts.month}
              onChange={e => { setValidationError(''); setStartParts(p => ({ ...p, month: e.target.value })) }}
            >
              <option value="">Month (opt)</option>
              {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select
              className={`flex-1 bg-bg border rounded-lg px-3 py-2 text-sm outline-none focus:border-brand text-txt cursor-pointer ${validationError && !startParts.year ? 'border-red-500' : 'border-border'}`}
              value={startParts.year}
              onChange={e => { setValidationError(''); setStartParts(p => ({ ...p, year: e.target.value })) }}
            >
              <option value="">Year *</option>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {/* End Date */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-txt-muted uppercase tracking-wider">
              End Date <span className="text-red-500">*</span>
            </label>
            <label className="flex items-center gap-1.5 text-xs text-txt cursor-pointer select-none">
              <input
                type="checkbox"
                className="accent-brand w-3.5 h-3.5 cursor-pointer"
                checked={isPresent}
                onChange={e => { setValidationError(''); setIsPresent(e.target.checked) }}
              />
              Present / Ongoing
            </label>
          </div>
          {!isPresent && (
            <div className="flex gap-2">
              <select
                className="flex-1 bg-bg border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-brand text-txt cursor-pointer"
                value={endParts.month}
                onChange={e => { setValidationError(''); setEndParts(p => ({ ...p, month: e.target.value })) }}
              >
                <option value="">Month (opt)</option>
                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <select
                className={`flex-1 bg-bg border rounded-lg px-3 py-2 text-sm outline-none focus:border-brand text-txt cursor-pointer ${validationError && !endParts.year ? 'border-red-500' : 'border-border'}`}
                value={endParts.year}
                onChange={e => { setValidationError(''); setEndParts(p => ({ ...p, year: e.target.value })) }}
              >
                <option value="">Year *</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleDone}
          className="w-full py-2.5 bg-brand text-white text-sm font-bold rounded-xl hover:bg-brand-hover transition-colors shadow-md shadow-brand/20"
        >
          Apply Date Range
        </button>
      </div>
    </>,
    document.body
  ) : null

  return (
    <div className="relative">
      <label className="block text-sm font-semibold text-txt mb-2">{label}</label>
      <button
        ref={triggerRef}
        type="button"
        onClick={openPicker}
        className={`w-full px-4 py-3 bg-bg border rounded-xl text-sm outline-none transition-all flex justify-between items-center text-left ${isOpen ? 'border-brand ring-4 ring-brand-surface' : 'border-border hover:border-brand/50'} ${!value ? 'text-txt-muted' : 'text-txt'}`}
      >
        <span>{value || 'Select date range…'}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isOpen ? 'text-brand' : 'text-txt-muted'}>
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      </button>

      {popupContent}
    </div>
  )
}
