function HealthScoreBreakdown({ items }) {
  return (
    <div className="flex flex-col gap-2.5 flex-1">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="text-xs text-textmuted w-20 shrink-0">{item.label}</span>
          <div className="flex-1 h-2 rounded-full bg-sunken overflow-hidden">
            <div className="h-full rounded-full bg-accent" style={{ width: `${item.score}%` }} />
          </div>
          <span className="text-xs font-semibold w-7 text-right shrink-0">{item.score}</span>
        </div>
      ))}
    </div>
  )
}

export default HealthScoreBreakdown
