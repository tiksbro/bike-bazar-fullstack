// "Skeleton" placeholders: grey shapes shown while data is loading, in the
// same size and place as the real content. The page feels faster and
// doesn't jump around when the real content arrives.
//
// animate-pulse is a built-in Tailwind class that gently fades the grey
// in and out, so people can tell something is happening.

// One grey block. Give it a size with className, e.g. "h-4 w-32".
// The colour is bordercol, a bit darker than sunken: animate-pulse fades
// it to half strength, and sunken was so pale it looked plain white on
// phones.
export function Skeleton({ className = '' }) {
  return <div className={`bg-bordercol rounded-ctl animate-pulse ${className}`} />
}

// Looks like a VehicleCard: picture on top, then name, details and price.
export function VehicleCardSkeleton() {
  return (
    <div className="bg-white border border-bordersoft rounded-card overflow-hidden shadow-card">
      <div className="h-[170px] sm:h-[200px] bg-bordercol animate-pulse" />
      <div className="p-4 flex flex-col gap-2.5">
        <Skeleton className="h-5 w-3/5" />
        <Skeleton className="h-3.5 w-4/5" />
        <Skeleton className="h-3.5 w-2/5" />
        <Skeleton className="h-6 w-1/2 mt-2" />
        <Skeleton className="h-10 w-full mt-2 rounded-btn" />
      </div>
    </div>
  )
}

// A grid of card placeholders, laid out like the real results grid.
// screen readers hear "Loading vehicles" once, instead of the grey boxes.
export function VehicleGridSkeleton({ count = 6, className = 'grid sm:grid-cols-2 lg:grid-cols-3 gap-4' }) {
  return (
    <div className={className} role="status" aria-label="Loading vehicles">
      {Array.from({ length: count }, (_, index) => (
        <VehicleCardSkeleton key={index} />
      ))}
    </div>
  )
}

// Looks like one row in a list (Dashboard listings, offers, dealers...).
// thumbnail={false} leaves out the picture box, for rows that have no
// picture (offer cards).
export function ListRowSkeleton({ thumbnail = true }) {
  return (
    <div className="bg-white border border-bordersoft rounded-card shadow-card p-4 flex items-center gap-3">
      {thumbnail && <Skeleton className="w-20 h-16 shrink-0" />}
      <div className="flex-1 flex flex-col gap-2">
        <Skeleton className="h-4 w-2/5" />
        <Skeleton className="h-3.5 w-1/4" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    </div>
  )
}

// Several list rows stacked, with one "Loading..." label for screen readers.
export function ListSkeleton({ rows = 3, label = 'Loading', thumbnail = true }) {
  return (
    <div className="flex flex-col gap-3" role="status" aria-label={label}>
      {Array.from({ length: rows }, (_, index) => (
        <ListRowSkeleton key={index} thumbnail={thumbnail} />
      ))}
    </div>
  )
}
