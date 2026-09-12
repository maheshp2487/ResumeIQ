import { useNavigate } from 'react-router-dom'

export default function PageHeader({ title, subtitle, breadcrumb }) {
  const navigate = useNavigate()

  return (
    <div className="mb-8">
      {breadcrumb && (
        <div className="flex items-center gap-2 text-[0.78rem] text-txt-muted mb-3 font-medium">
          <button
            onClick={() => navigate('/dashboard')}
            className="hover:text-txt transition-colors duration-200"
          >
            Dashboard
          </button>

          <span className="text-border">/</span>

          <span className="text-txt">
            {breadcrumb}
          </span>
        </div>
      )}

      <div className="space-y-2">
        <h1 className="text-3xl md:text-[2rem] font-bold tracking-tight text-txt leading-tight">
          {title}
        </h1>

        {subtitle && (
          <p className="text-[0.95rem] text-txt-muted leading-relaxed max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}