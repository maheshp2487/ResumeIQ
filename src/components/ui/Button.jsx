export default function Button({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  loading = false,
}) {
  const base =
    'inline-flex items-center justify-center gap-2 font-medium rounded-2xl transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.985]'

  const variants = {
    primary:
      'bg-brand hover:bg-brand-hover text-white shadow-sm hover:shadow-md hover:-translate-y-0.5',

    outline:
      'border border-border bg-bg text-txt hover:bg-bg-tertiary',

    ghost:
      'bg-transparent text-txt-muted hover:bg-bg hover:text-txt',

    danger:
      'bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/20',
  }

  const sizes = {
    sm: 'px-3.5 py-2 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-[0.92rem]',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}

      <span className="tracking-tight">
        {children}
      </span>
    </button>
  )
}