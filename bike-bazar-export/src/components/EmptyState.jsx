import Button from './Button'

// A friendly "nothing here yet" box: an icon, a short title, one line of
// help, and (optionally) a button to do the next useful thing.
//   actionTo="/sell"  -> button that goes to a page
//   onAction={fn}     -> button that runs a function (like "Try again")
function EmptyState({ title, message, actionLabel, actionTo, onAction, icon }) {
  return (
    <div className="bg-white border border-dashed border-bordercol rounded-card px-6 py-10 text-center">
      <div className="mx-auto w-12 h-12 rounded-full bg-accentsoftbg text-accent flex items-center justify-center">
        {icon ?? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M22 12h-6l-2 3h-4l-2-3H2" />
            <path d="M5.5 5.1L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.7 4H7.3a2 2 0 0 0-1.8 1.1z" />
          </svg>
        )}
      </div>
      <p className="font-display font-bold text-lg mt-4">{title}</p>
      {message && <p className="text-sm text-textmuted mt-1 max-w-sm mx-auto">{message}</p>}
      {actionLabel && (actionTo || onAction) && (
        <div className="mt-5">
          <Button to={actionTo} onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  )
}

export default EmptyState
