import Button from './Button'
import ScoreRing from './ScoreRing'
import MetricBar from './MetricBar'

export default function JdMatchResults({ data, onReset }) {
  return (
    <div className="space-y-6 animate-fade-in relative z-10">
      <div className="rounded-2xl border border-border bg-bg-secondary p-8 shadow-sm flex flex-col md:flex-row items-center gap-8">
        <ScoreRing score={data.matchScore} label="JD Match" />
        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-surface border border-brand/20 text-[0.72rem] uppercase tracking-wider text-brand font-bold mb-4">
            Alignment Complete
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-txt mb-2">
            Job Description Alignment
          </h2>
          <p className="text-txt-muted text-sm leading-relaxed max-w-xl">
            {data.summary || 'We compared your resume line-by-line against the job description to find missing skills and gaps.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-2xl border border-border bg-bg p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-txt font-bold tracking-tight">Your Profile</h3>
            <span className="text-xs font-bold px-2 py-1 bg-brand-surface text-brand rounded-md">Matched</span>
          </div>
          <ul className="space-y-3 flex-1">
            {data.strengths?.map((s, i) => (
              <li key={i} className="text-sm text-txt flex gap-3 items-start">
                <span className="text-emerald-500 font-black mt-0.5">✓</span>
                <span className="leading-relaxed">{s}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-red-700 dark:text-red-400 font-bold tracking-tight">Missing Requirements</h3>
            <span className="text-xs font-bold px-2 py-1 bg-red-500/10 text-red-600 rounded-md">Gap</span>
          </div>
          <ul className="space-y-3 flex-1">
            {data.missingSkills?.map((m, i) => (
              <li key={i} className="text-sm text-red-800 dark:text-red-300 flex gap-3 items-start">
                <span className="text-red-500 font-black mt-0.5">✕</span>
                <span className="leading-relaxed font-medium">{m}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-bg-secondary p-6 shadow-sm">
        <h3 className="text-txt font-bold tracking-tight mb-5">Technical Overlap</h3>
        <MetricBar label="Tech Stack Match" value={data.techSkillMatch} color="#3b82f6" />
        
        {data.keywords?.length > 0 && (
          <div className="mt-6 pt-6 border-t border-border">
            <h4 className="text-xs font-bold uppercase tracking-wider text-txt-muted mb-3">High-Value Missing Keywords</h4>
            <div className="flex flex-wrap gap-2">
              {data.keywords.map((k, i) => (
                <span key={i} className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                  {k}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-4 pt-4">
        <Button onClick={onReset} variant="outline">
          + Run New Analysis
        </Button>
      </div>
    </div>
  )
}
