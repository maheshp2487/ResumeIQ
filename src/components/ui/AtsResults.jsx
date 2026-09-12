import Button from './Button'
import ScoreRing from './ScoreRing'

export default function AtsResults({ data, onReset }) {
  const isPass = data.atsScore >= 75

  return (
    <div className="space-y-6 animate-fade-in relative z-10">
      <div className="rounded-2xl border border-border bg-bg-secondary p-8 shadow-sm flex flex-col md:flex-row items-center gap-8">
        <ScoreRing score={data.atsScore} label="Format Score" />
        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-surface border border-brand/20 text-[0.72rem] uppercase tracking-wider text-brand font-bold mb-4">
            ATS Parsing Complete
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-txt mb-2">
            Machine Readability Audit
          </h2>
          <p className="text-txt-muted text-sm leading-relaxed max-w-xl">
            {data.summary || 'Your resume has been evaluated against strict ATS parsing rules to ensure recruiters can extract your information correctly.'}
          </p>
        </div>
        <div className={`px-6 py-4 rounded-xl border ${isPass ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' : 'bg-red-500/10 border-red-500/20 text-red-600'} text-center hidden lg:block`}>
          <p className="text-xs font-bold uppercase tracking-wider mb-1">Status</p>
          <p className="text-xl font-black">{isPass ? 'PASS' : 'FAIL'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-2xl border border-border bg-bg-secondary p-6 shadow-sm">
          <h3 className="text-txt font-bold tracking-tight flex items-center gap-2 mb-5">
            <span className="text-emerald-500">✓</span> Structural Integrity Passes
          </h3>
          {data.strengths?.length > 0 ? (
            <ul className="space-y-3">
              {data.strengths.map((s, i) => (
                <li key={i} className="text-sm text-txt-muted flex gap-2">
                  <span className="text-emerald-500 opacity-50">●</span> {s}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-txt-muted">No structural strengths detected.</p>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-bg-secondary p-6 shadow-sm">
          <h3 className="text-txt font-bold tracking-tight flex items-center gap-2 mb-5">
            <span className="text-red-500">⚠</span> Parsing Risks Detected
          </h3>
          {data.weakAreas?.length > 0 ? (
            <ul className="space-y-3">
              {data.weakAreas.map((w, i) => (
                <li key={i} className="text-sm text-txt-muted flex gap-2">
                  <span className="text-red-500 opacity-50">●</span> {w}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-txt-muted">No major parsing risks found.</p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-bg-secondary p-6 shadow-sm">
        <h3 className="text-txt font-bold tracking-tight mb-5">Formatting Fixes</h3>
        {data.suggestions?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.suggestions.map((s, i) => (
              <div key={i} className="p-4 rounded-xl bg-bg border border-border flex gap-3 text-sm text-txt leading-relaxed">
                <span className="text-brand font-black">→</span > {s}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-txt-muted">Your layout looks completely clean for ATS.</p>
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
