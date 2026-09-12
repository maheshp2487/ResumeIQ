export default function Card({
  children,
  className = '',
  padding = true,
  hover = true,
}) {
  return (
    <div
      className={`
        relative overflow-hidden
        bg-bg-secondary
        border border-border
        rounded-2xl
        ${padding ? 'p-6' : ''}
        ${
          hover
            ? 'transition-all duration-300 hover:border-brand/30 hover:shadow-md'
            : ''
        }
        ${className}
      `}
    >
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

export function CardTitle({ children, className = '' }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h3
        className={`
          text-[1rem]
          font-semibold
          tracking-tight
          text-txt
          ${className}
        `}
      >
        {children}
      </h3>
    </div>
  )
}