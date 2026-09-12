export default function Input({
  label,
  error,
  className = '',
  ...props
}) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-[0.82rem] font-medium tracking-wide text-txt-muted">
          {label}
        </label>
      )}

      <div className="relative group">
        <input
          className={`
            relative z-10
            w-full
            px-4 py-3
            rounded-xl
            bg-bg
            border
            text-txt
            text-sm
            outline-none
            transition-all duration-300
            placeholder:text-txt-muted
            ${
              error
                ? 'border-red-500/50 focus:border-red-500'
                : 'border-border focus:border-brand focus:ring-4 focus:ring-brand-surface'
            }
            ${className}
          `}
          {...props}
        />
      </div>

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 font-medium leading-relaxed px-1">
          {error}
        </p>
      )}
    </div>
  )
}