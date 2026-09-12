import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'

const ToastContext = createContext(null)

let idSeq = 0

export function ToastProvider({
  children,
}) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback(id => {
    setToasts(prev =>
      prev.filter(t => t.id !== id)
    )
  }, [])

  const push = useCallback(
    ({
      message,
      variant = 'info',
    }) => {
      const id = ++idSeq

      setToasts(prev => [
        ...prev,
        {
          id,
          message,
          variant,
        },
      ])
    },
    []
  )

  const value = useMemo(
    () => ({
      push,
      dismiss,
    }),
    [push, dismiss]
  )

  return (
    <ToastContext.Provider
      value={value}
    >
      {children}

      {toasts.length > 0 && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="flex flex-col gap-4 w-full max-w-md">
            {toasts.map(t => (
              <div
                key={t.id}
                className="bg-bg-secondary rounded-3xl p-6 shadow-2xl border border-border animate-fade-in-up"
              >
                <div className="flex items-start gap-4 mb-6">
                  {/* Icon */}
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 border shadow-inner
                      ${
                        t.variant === 'success'
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : t.variant === 'error'
                            ? 'bg-red-500/10 text-red-500 border-red-500/20'
                            : 'bg-brand/10 text-brand border-brand/20'
                      }`}
                  >
                    {t.variant === 'success' ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                    ) : t.variant === 'error' ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                    )}
                  </div>

                  {/* Message */}
                  <div className="flex-1 min-w-0 pt-1">
                    <h3 className={`text-lg font-bold mb-1 ${
                        t.variant === 'success' ? 'text-emerald-500' : t.variant === 'error' ? 'text-red-500' : 'text-brand'
                    }`}>
                      {t.variant === 'success' ? 'Success' : t.variant === 'error' ? 'Attention Required' : 'Notice'}
                    </h3>
                    <p className="text-base text-txt-muted leading-relaxed font-medium">
                      {t.message}
                    </p>
                  </div>
                </div>

                {/* Single Dismiss Button */}
                <button
                  onClick={() => dismiss(t.id)}
                  className={`w-full py-3.5 rounded-xl text-white font-bold tracking-wide transition-all shadow-md hover:-translate-y-0.5 
                    ${
                      t.variant === 'success'
                        ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'
                        : t.variant === 'error'
                          ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
                          : 'bg-brand hover:bg-brand-hover shadow-brand/20'
                    }`}
                >
                  Got it
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)

  if (!ctx) {
    throw new Error(
      'useToast must be used within ToastProvider'
    )
  }

  return ctx
}