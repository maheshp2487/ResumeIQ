import { useEffect, useState } from 'react'
import { getScoreColor } from '../../utils/helpers'

export default function ScoreRing({
  score,
  size = 125,
  strokeWidth = 10,
  label = 'Score',
}) {
  const [animated, setAnimated] = useState(0)

  const radius = (size - strokeWidth * 2) / 2

  const circumference = 2 * Math.PI * radius

  const offset = circumference * (1 - animated / 100)

  const color = getScoreColor(score)

  useEffect(() => {
    const t = setTimeout(() => setAnimated(score), 120)

    return () => clearTimeout(t)
  }, [score])

  return (
    <div className="flex flex-col items-center justify-center gap-4 flex-shrink-0">
      <div
        className="relative"
        style={{
          width: size,
          height: size,
        }}
      >
        {/* Glow */}
        <div
          className="absolute inset-0 rounded-full blur-2xl opacity-20"
          style={{
            background: color,
          }}
        />

        {/* Ring */}
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{
            transform: 'rotate(-90deg)',
          }}
          className="relative z-10"
        >
          {/* Background Tech Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth={strokeWidth - 2}
            strokeDasharray="4 6"
            className="opacity-40"
          />

          {/* Progress Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 1.2s cubic-bezier(0.22,1,0.36,1)',
              filter: `drop-shadow(0 0 10px ${color}60)`,
            }}
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
          <span
            className="text-4xl font-black tracking-tighter"
            style={{ color }}
          >
            {score}
            <span className="text-xl opacity-50 ml-0.5">%</span>
          </span>
        </div>
      </div>

      {/* Label outside the ring */}
      <span className="text-xs font-bold uppercase tracking-[0.2em] text-txt-muted text-center max-w-[140px] leading-tight">
        {label}
      </span>
    </div>
  )
}