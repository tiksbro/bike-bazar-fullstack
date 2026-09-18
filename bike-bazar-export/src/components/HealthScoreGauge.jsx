import React from 'react'

const RADIUS = 52
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const scoreLabel = (score) => {
  if (score >= 85) return { label: 'Excellent', color: '#12805C' }
  if (score >= 70) return { label: 'Good Condition', color: '#12805C' }
  if (score >= 50) return { label: 'Fair Condition', color: '#8A5A12' }
  return { label: 'Needs Attention', color: '#A23A2C' }
}

function HealthScoreGauge({ score }) {
  const { label, color } = scoreLabel(score)
  const dashLength = (score / 100) * CIRCUMFERENCE

  return (
    <div className="flex items-center gap-4">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="#EFF2F8" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${dashLength} ${CIRCUMFERENCE}`}
          transform="rotate(-90 60 60)"
        />
        <text x="60" y="56" textAnchor="middle" className="font-display font-bold" style={{ fontSize: 26, fill: '#0E1116' }}>
          {score}
        </text>
        <text x="60" y="74" textAnchor="middle" style={{ fontSize: 11, fill: '#6B6F76' }}>
          / 100
        </text>
      </svg>
      <div>
        <p className="font-semibold" style={{ color }}>{label}</p>
        <p className="text-xs text-textfaint mt-0.5">Platform estimate based on listing details</p>
      </div>
    </div>
  )
}

export default HealthScoreGauge
