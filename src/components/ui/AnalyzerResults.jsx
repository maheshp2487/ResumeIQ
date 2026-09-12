import Button from './Button'
import ScoreRing from './ScoreRing'
import MetricBar from './MetricBar'

export default function AnalyzerResults({ data, onReset }) {
  return (
    <div className="space-y-6 animate-fade-in relative z-10">
      <div className="rounded-2xl border border-border bg-bg-secondary p-8 shadow-sm flex flex-col lg:flex-row gap-8 items-center lg:items-start">
        <div className="flex-shrink-0">
          <ScoreRing score={data.atsScore} label="Impact Score" />
        </div>
        
        <div className="flex-1 w-full space-y-5">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-txt mb-2 text-center lg:text-left">
              Content & Storytelling Analysis
            </h2>
            <p className="text-txt-muted text-sm leading-relaxed text-center lg:text-left max-w-2xl">
              {data.summary || 'We evaluated your phrasing, use of metrics, and narrative strength. This tells us how a human hiring manager perceives your resume.'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MetricBar label="Action Verbs" value={data.atsScore + 5 > 100 ? 100 : data.atsScore + 5} color="#8b5cf6" />
            <MetricBar label="Metrics Density" value={data.techSkillMatch || 65} color="#ec4899" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-bg-secondary p-6 shadow-sm">
        <h3 className="text-txt font-bold tracking-tight flex items-center gap-2 mb-6">
          <span className="w-6 h-6 rounded-md bg-brand-surface text-brand flex items-center justify-center text-xs font-bold">✎</span> 
          Actionable Rewrites
        </h3>
        
        {data.suggestions?.length > 0 ? (
          <div className="space-y-4">
            {data.suggestions.map((suggestion, i) => (
              <div key={i} className="flex flex-col sm:flex-row gap-3">
                <div className="sm:w-16 flex-shrink-0 pt-3 flex justify-center sm:block">
                  <span className="text-[0.65rem] uppercase font-black tracking-widest text-brand px-2 py-1 bg-brand-surface rounded-md">Edit {i+1}</span>
                </div>
                <div className="flex-1 p-4 rounded-xl bg-bg border border-border border-l-4 border-l-brand">
                  <p className="text-sm text-txt leading-relaxed">{suggestion}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-txt-muted">Your bullet points are already highly optimized!</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
         <div className="rounded-2xl border border-border bg-bg-secondary p-6 shadow-sm">
          <h3 className="text-txt font-bold tracking-tight mb-4 text-emerald-500">Narrative Strengths</h3>
          <ul className="space-y-2">
            {data.strengths?.map((s, i) => <li key={i} className="text-sm text-txt-muted list-disc list-inside">{s}</li>)}
          </ul>
        </div>
        <div className="rounded-2xl border border-border bg-bg-secondary p-6 shadow-sm">
          <h3 className="text-txt font-bold tracking-tight mb-4 text-amber-500">Editorial Weaknesses</h3>
          <ul className="space-y-2">
            {data.weakAreas?.map((w, i) => <li key={i} className="text-sm text-txt-muted list-disc list-inside">{w}</li>)}
          </ul>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 pt-4">
        <Button onClick={onReset} variant="outline">
          + Run New Analysis
        </Button>
      </div>
    </div>
  )
}
