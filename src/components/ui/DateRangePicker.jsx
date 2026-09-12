import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 50 }, (_, i) => CURRENT_YEAR - i)

export default function DateRangePicker({ value, onChange, label = 'Dates' }) {
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef(null)
  const [isMobile, setIsMobile] = useState(false)
  const [popupStyle, setPopupStyle] = useState({})
  const [validationError, setValidationError] = useState('')

  const parseDateStr = useCallback((str) => {
    if (!str || str === 'Present' || str === 'End' || str === '...') return { month: '', year: '' }
    const parts = str.trim().split(' ')
    if (parts.length === 1) {
      if (MONTHS.includes(parts[0])) return { month: parts[0], year: '' }
      return { month: '', year: parts[0] }
    }
    if (parts.length >= 2) return { month: parts[0], year: parts[1] }
    return { month: '', year: '' }
  }, [])

  const [startParts, setStartParts] = useState({ month: '', year: '' })
  const [endParts, setEndParts] = useState({ month: '', year: '' })
  const [isPresent, setIsPresent] = useState(false)

  // Re-sync local state from prop
  const syncFromValue = useCallback((val) => {
    if (!val) {
      setStartParts({ month: '', year: '' })
      setEndParts({ month: '', year: '' })
      setIsPresent(false)
      return
    }
    const dashIdx = val.indexOf(' - ')
    if (dashIdx === -1) {
      setStartParts(parseDateStr(val))
      setEndParts({ month: '', year: '' })
      setIsPresent(false)
      return
    }
    const s = val.slice(0, dashIdx).trim()
    const e = val.slice(dashIdx + 3).trim()
    setStartParts(parseDateStr(s))
    if (e === 'Present') {
      setIsPresent(true)
      setEndParts({ month: '', year: '' })
    } else {
      setIsPresent(false)
      setEndParts(parseDateStr(e))
    }
  }, [parseDateStr])

  // Sync on initial mount
  useEffect(() => {
    syncFromValue(value)
  }, [value, syncFromValue])

  // Responsive check
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Body scroll lock and Escape key listener when open
  useEffect(() => {
    if (!isOpen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const openPicker = () => {
    syncFromValue(value)
    setValidationError('')

    if (window.innerWidth < 640) {
      setIsMobile(true)
      setPopupStyle({})
    } else if (triggerRef.current) {
      setIsMobile(false)
      const rect = triggerRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const popupH = 340
      const popupW = Math.max(rect.width, 320)
      const left = Math.max(16, Math.min(rect.left, window.innerWidth - popupW - 16))
      const top = spaceBelow >= popupH ? rect.bottom + 8 : Math.max(16, rect.top - popupH - 8)

      setPopupStyle({
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        width: `${popupW}px`,
        zIndex: 10001,
      })
    }
    setIsOpen(true)
  }

  const handleApply = () => {
    // 1. Start year is required
    if (!startParts.year) {
      setValidationError('Start year is required.')
      return
    }

    // 2. End year is required if not Present
    if (!isPresent && !endParts.year) {
      setValidationError('Select an end year or check Present / Ongoing.')
      return
    }

    // 3. Chronological order validation
    if (!isPresent && startParts.year && endParts.year) {
      const sY = parseInt(startParts.year, 10)
      const eY = parseInt(endParts.year, 10)

      if (eY < sY) {
        setValidationError('End year cannot be earlier than start year.')
        return
      }

      if (eY === sY && startParts.month && endParts.month) {
        const sM = MONTHS.indexOf(startParts.month)
        const eM = MONTHS.indexOf(endParts.month)
        if (eM < sM) {
          setValidationError('End month cannot be earlier than start month.')
          return
        }
      }
    }

    // Passed validation — format and emit
    const sStr = startParts.month ? `${startParts.month} ${startParts.year}` : startParts.year
    const eStr = isPresent ? 'Present' : (endParts.month ? `${endParts.month} ${endParts.year}` : endParts.year)
    
    onChange(`${sStr} - ${eStr}`)
    setValidationError('')
    setIsOpen(false)
  }

  const handleClear = () => {
    onChange('')
    setValidationError('')
    setIsOpen(false)
  }

  const popupContent = isOpen ? createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Backdrop — dims background */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      {/* Picker Panel */}
      <div
        style={!isMobile ? popupStyle : {}}
        className={`relative z-[10001] bg-bg-secondary border border-border rounded-2xl shadow-2xl flex flex-col gap-4 p-5 ${
          isMobile ? 'w-full max-w-sm animate-fade-in-up' : 'animate-fade-in'
        }`}
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <span className="text-sm font-bold text-txt">Select Date Range</span>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-txt-muted hover:text-txt p-1.5 rounded-lg hover:bg-bg transition-colors"
            title="Close"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Validation error notification */}
        {validationError && (
          <div className="flex items-center gap-2 px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs sm:text-sm text-red-500 font-medium animate-shake">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span>{validationError}</span>
          </div>
        )}

        {/* Start Date Selection */}
        <div>
          <label className="text-xs font-bold text-txt-muted uppercase tracking-wider mb-2 block">
            Start Date <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <select
              className="flex-1 bg-bg border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand text-txt cursor-pointer transition-colors"
              value={startParts.month}
              onChange={e => { setValidationError(''); setStartParts(p => ({ ...p, month: e.target.value })) }}
            >
              <option value="">Month (opt)</option>
              {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select
              className={`flex-1 bg-bg border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand text-txt cursor-pointer transition-colors ${validationError && !startParts.year ? 'border-red-500 ring-2 ring-red-500/20' : 'border-border'}`}
              value={startParts.year}
              onChange={e => { setValidationError(''); setStartParts(p => ({ ...p, year: e.target.value })) }}
            >
              <option value="">Year *</option>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {/* End Date Selection */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-txt-muted uppercase tracking-wider">
              End Date <span className="text-red-500">*</span>
            </label>
            <label className="flex items-center gap-1.5 text-xs text-txt cursor-pointer select-none font-medium hover:text-brand transition-colors">
              <input
                type="checkbox"
                className="accent-brand w-3.5 h-3.5 cursor-pointer rounded"
                checked={isPresent}
                onChange={e => { setValidationError(''); setIsPresent(e.target.checked) }}
              />
              Present / Ongoing
            </label>
          </div>

          {!isPresent ? (
            <div className="flex gap-2">
              <select
                className="flex-1 bg-bg border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand text-txt cursor-pointer transition-colors"
                value={endParts.month}
                onChange={e => { setValidationError(''); setEndParts(p => ({ ...p, month: e.target.value })) }}
              >
                <option value="">Month (opt)</option>
                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <select
                className={`flex-1 bg-bg border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand text-txt cursor-pointer transition-colors ${validationError && !endParts.year ? 'border-red-500 ring-2 ring-red-500/20' : 'border-border'}`}
                value={endParts.year}
                onChange={e => { setValidationError(''); setEndParts(p => ({ ...p, year: e.target.value })) }}
              >
                <option value="">Year *</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          ) : (
            <div className="px-3 py-2.5 bg-brand-surface border border-brand/20 rounded-xl text-xs text-brand font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
              Marked as currently ongoing (Present)
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 border-t border-border mt-1">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-2.5 bg-bg hover:bg-bg-tertiary border border-border text-txt-muted hover:text-txt text-xs font-bold rounded-xl transition-colors"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={handleApply}
            className="flex-1 py-2.5 bg-brand text-white text-sm font-bold rounded-xl hover:bg-brand-hover transition-all shadow-md shadow-brand/20 active:scale-[0.98]"
          >
            Apply Date Range
          </button>
        </div>
      </div>
    </div>,
    document.body
  ) : null

  return (
    <div className="relative">
      <label className="block text-sm font-semibold text-txt mb-2">{label}</label>
      <button
        ref={triggerRef}
        type="button"
        onClick={openPicker}
        className={`w-full px-4 py-3 bg-bg border rounded-xl text-sm outline-none transition-all flex justify-between items-center text-left ${
          isOpen ? 'border-brand ring-4 ring-brand-surface' : 'border-border hover:border-brand/50'
        } ${!value ? 'text-txt-muted' : 'text-txt font-medium'}`}
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
