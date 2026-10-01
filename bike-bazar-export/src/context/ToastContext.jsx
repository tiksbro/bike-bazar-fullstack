import { createContext, useContext, useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'


const ToastContext = createContext()

const TOAST_DURATION_MS = 3500
const MAX_TOASTS_ON_SCREEN = 3

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
 
  const nextIdRef = useRef(1)

  const dismissToast = useCallback((toastId) => {
    setToasts((current) => current.filter((toast) => toast.id !== toastId))
  }, [])
  const showToast = useCallback(
    (message, { tone = 'success', action } = {}) => {
      const id = nextIdRef.current++
      // Keep only the newest few, so the screen never fills up with toasts.
      setToasts((current) => [...current, { id, message, tone, action }].slice(-MAX_TOASTS_ON_SCREEN))
      setTimeout(() => dismissToast(id), TOAST_DURATION_MS)
    },
    [dismissToast]
  )

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastList toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}

const toneStyles = {
  success: { icon: 'bg-success', symbol: '✓' },
  info: { icon: 'bg-accent', symbol: 'i' },
  error: { icon: 'bg-danger', symbol: '!' },
}


function ToastList({ toasts, onDismiss }) {
  return (
    <div
      aria-live="polite"
      className="fixed top-20 inset-x-0 z-[70] flex flex-col items-center gap-2 px-4 pointer-events-none"
    >
      {toasts.map((toast) => {
        const style = toneStyles[toast.tone] ?? toneStyles.success
        return (
          <div
            key={toast.id}
            role={toast.tone === 'error' ? 'alert' : 'status'}
            className="pointer-events-auto flex items-center gap-3 w-full max-w-[400px] bg-ink text-white rounded-card shadow-pop pl-3 pr-2 py-2.5"
          >
            <span
              aria-hidden="true"
              className={`w-6 h-6 shrink-0 rounded-full ${style.icon} text-white text-xs font-bold flex items-center justify-center`}
            >
              {style.symbol}
            </span>
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            {toast.action && (
              <Link
                to={toast.action.to}
                onClick={() => onDismiss(toast.id)}
                className="shrink-0 text-sm font-semibold text-featured hover:underline px-1"
              >
                {toast.action.label}
              </Link>
            )}
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label="Close message"
              className="shrink-0 w-8 h-8 rounded-full text-white/70 hover:text-white hover:bg-white/10 flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        )
      })}
    </div>
  )
}
