import { useNavigate } from 'react-router-dom'
import { useAnalysis } from '../hooks/useAnalysis'
import { TOOLS } from '../utils/constants'

export default function Dashboard() {
  const { count, lastAts } = useAnalysis()
  const navigate = useNavigate()

  return (
    <div className="w-full space-y-10 animate-fade-in">
      
      {/* Dashboard Overview Header */}
      <div>
        <h1 className="text-2xl font-bold text-txt tracking-tight mb-2">Overview</h1>
        <p className="text-sm text-txt-muted">Monitor your resume performance and access optimization tools.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label="Analyses Run"
          value={count}
          sub="Total evaluations completed"
          trend={count === 0 ? "Ready to start" : "+12% this week"}
          trendUp={count > 0}
        />

        <StatCard
          label="Latest ATS Match"
          value={lastAts ? lastAts : <span className="text-txt-muted/50 font-medium text-3xl">N/A</span>}
          sub="Most recent scan result"
          highlight
          trend={lastAts ? "Ready for review" : "No scans yet"}
        />

        <StatCard
          label="Active Tools"
          value="4"
          sub="Core features unlocked"
          trend="All systems operational"
        />
      </div>

      {/* Tools Section */}
      <div className="pt-4 border-t border-border/50">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-txt tracking-tight">
              Optimization Suite
            </h2>
            <p className="text-sm text-txt-muted mt-1">
              Select a tool to begin improving your resume's impact and ATS compatibility.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ToolCard
            tool={{
              id: 'builder',
              icon: '✎',
              iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
              name: 'Resume Builder',
              desc: 'Create a modern, ATS-friendly resume from scratch using our premium templates.',
            }}
            onClick={() => navigate('/builder')}
          />

          {TOOLS.map(tool => (
            <ToolCard
              key={tool.id}
              tool={tool}
              onClick={() => navigate(tool.path)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, highlight, trend, trendUp }) {
  return (
    <div
      className={`rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg backdrop-blur-md ${
        highlight
          ? 'bg-gradient-to-br from-brand-surface/80 to-bg/80 border-brand/20 shadow-brand/5'
          : 'bg-bg/80 border-border shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-bold uppercase tracking-wider text-txt-muted">
          {label}
        </p>
        {trend && (
          <span className={`text-[0.65rem] font-bold uppercase px-2 py-1 rounded-md ${
            trendUp ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-bg-secondary text-txt-muted'
          }`}>
            {trend}
          </span>
        )}
      </div>
      <p className="text-4xl font-black text-txt tracking-tight mb-2">
        {value}
      </p>
      <p className="text-sm font-medium text-txt-muted">
        {sub}
      </p>
    </div>
  )
}

function ToolCard({ tool, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl border border-border bg-bg/80 backdrop-blur-md p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-xl hover:shadow-brand/5 flex flex-col h-full min-h-[220px]"
    >
      <div
        className={`relative z-10 w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-6 shadow-sm flex-shrink-0 ${tool.iconBg}`}
      >
        {tool.icon}
      </div>

      <div className="relative z-10 flex-1">
        <h3 className="text-lg font-bold text-txt mb-2 tracking-tight group-hover:text-brand transition-colors">
          {tool.name}
        </h3>
        <p className="text-sm font-medium text-txt-muted leading-relaxed">
          {tool.desc}
        </p>
      </div>

      <div className="relative z-10 mt-6 pt-4 border-t border-border/50 w-full flex items-center justify-end flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-bg border border-border flex items-center justify-center text-txt-muted group-hover:bg-brand group-hover:border-brand group-hover:text-white transition-all duration-300 group-hover:translate-x-1 shadow-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>
        </div>
      </div>
    </button>
  )
}