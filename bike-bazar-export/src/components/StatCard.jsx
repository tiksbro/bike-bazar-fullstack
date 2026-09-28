import Card from './Card'

// A small number box, like "Active: 3".
// attention=true tints it amber, for numbers that need action
// (for example "Offers waiting: 2").
function StatCard({ label, value, hint, attention = false }) {
  return (
    <Card padding="sm" tone={attention ? 'attention' : 'default'}>
      <p className="text-xs font-semibold text-textmuted">{label}</p>
      <p className="font-display font-bold text-[28px] leading-tight mt-1">{value}</p>
      {hint && <p className="text-xs text-textfaint mt-1">{hint}</p>}
    </Card>
  )
}

export default StatCard