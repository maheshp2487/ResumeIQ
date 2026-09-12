import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

const ToastContext = createContext(null)

let idSeq = 0
const AUTO_DISMISS_MS = 6000

const VARIANT_CONFIG = {
  success: {
    bar: 'bg-emerald-500',
    iconColor: 'text-emerald-500',
    titleColor: 'text-emerald-600 dark:text-emerald-400',
    title: 'Done',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6L9 17l-5-5"/>
      </svg>
    ),
    btn: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/15 border border-emerald-500/20',
  },
  error: {
    bar: 'bg-red-500',
    iconColor: 'text-red-500',
    titleColor: 'text-red-600 dark:text-red-400',
    title: 'Action Required',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
    btn: 'bg-red-500/10 text-red-700 dark:text-red-400 hover:bg-red-500/15 border border-red-500/20',
  },
  warning: {
    bar: 'bg-amber-400',
    iconColor: 'text-amber-500',
    titleColor: 'text-amber-600 dark:text-amber-400',
    title: 'Heads up',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
    btn: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/15 border border-amber-500/20',
  },
  info: {
    bar: 'bg-blue-500',
    iconColor: 'text-blue-500',
    titleColor: 'text-blue-600 dark:text-blue-400',
    title: 'Notice',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>
    ),
    btn: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 hover:bg-blue-500/15 border border-blue-500/20',
  },
}

function ToastCard({ t, dismiss }) {
  const [leaving, setLeaving] = useState(false)
  const conf = VARIANT_CONFIG[t.variant] || VARIANT_CONFIG.info

  const handleDismiss = useCallback(() => {
    setLeaving(true)
    setTimeout(() => dismiss(t.id), 250)
  }, [dismiss, t.id])

  useEffect(() => {
    const timer = setTimeout(handleDismiss, AUTO_DISMISS_MS)
    return () => clearTimeout(timer)
  }, [handleDismiss])

  return (
    <div
      className={`w-full bg-bg-secondary rounded-2xl border border-border shadow-xl shadow-black/10 overflow-hidden transition-all duration-[250ms] ${leaving ? 'opacity-0 scale-95 translate-y-1' : 'opacity-100 scale-100 translate-y-0'}`}
    >
      {/* Thin accent bar — the only color pop */}
      <div className={`h-[3px] w-full ${conf.bar}`} />

      <div className="p-5">
        <div className="flex items-start gap-3 mb-4">
          {/* Icon */}
          <div className={`flex-shrink-0 mt-0.5 ${conf.iconColor}`}>{conf.icon}</div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-bold mb-0.5 ${conf.titleColor}`}>
              {t.title || conf.title}
            </p>
            <p className="text-sm text-txt-muted leading-relaxed">{t.message}</p>
          </div>
        </div>

        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition-colors ${conf.btn}`}
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback(id => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const push = useCallback(({ message, variant = 'info', title } = {}) => {
    const id = ++idSeq
    // Keep at most 3 toasts to avoid overwhelming the user
    setToasts(prev => [...prev.slice(-2), { id, message, variant, title }])
  }, [])

  const value = useMemo(() => ({ push, dismiss }), [push, dismiss])

  return (
    <ToastContext.Provider value={value}>
      {children}

      {toasts.length > 0 && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 pointer-events-none animate-fade-in">
          {/* Subtle backdrop */}
          <div
            className="fixed inset-0 bg-black/25 backdrop-blur-[2px] pointer-events-auto"
            onClick={() => toasts.forEach(t => dismiss(t.id))}
          />
          {/* Toast stack */}
          <div className="relative z-10 flex flex-col gap-3 w-full max-w-sm pointer-events-auto">
            {toasts.map(t => (
              <ToastCard key={t.id} t={t} dismiss={dismiss} />
            ))}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}