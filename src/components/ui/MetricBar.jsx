import { useEffect, useState } from 'react'
import { getScoreColor } from '../../utils/helpers'

export default function MetricBar({ label, value, color }) {
  const [width, setWidth] = useState(0)
  const barColor = color || getScoreColor(value)

  useEffect(() => {
    const t = setTimeout(() => setWidth(value), 180)
    return () => clearTimeout(t)
  }, [value])

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-bg-secondary p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-brand/20">
      {/* Subtle background glow */}
      <div
        className="absolute top-0 right-0 w-24 h-24 blur-3xl opacity-5 transition-opacity duration-300 group-hover:opacity-10 pointer-events-none"
        style={{ background: barColor }}
      />

      <div className="relative z-10">
        {/* Label row */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-[0.68rem] uppercase tracking-widest text-txt-muted font-semibold">
            {label}
          </p>
          <span className="text-sm font-bold" style={{ color: barColor }}>
            {value}
            <span className="text-txt-muted text-xs font-normal ml-0.5">/100</span>
          </span>
        </div>

        {/* Progress bar */}
        <div className="relative h-2.5 rounded-full overflow-hidden bg-bg border border-border">
          {/* Glow layer */}
          <div
            className="absolute inset-y-0 left-0 blur-sm opacity-30"
            style={{
              width: `${width}%`,
              background: barColor,
              transition: 'width 1.1s cubic-bezier(0.22,1,0.36,1)',
            }}
          />
          {/* Fill layer */}
          <div
            className="relative h-full rounded-full"
            style={{
              width: `${width}%`,
              background: barColor,
              transition: 'width 1.1s cubic-bezier(0.22,1,0.36,1)',
            }}
          />
        </div>

        {/* Footer */}
        <div className="mt-3 flex items-center justify-between">
          <p className="text-[0.7rem] text-txt-muted font-medium">Evaluated metric</p>
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: barColor }}
          />
        </div>
      </div>
    </div>
  )
}