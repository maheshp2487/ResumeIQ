import { useNavigate } from 'react-router-dom'
import AnimatedBackground from '../components/ui/AnimatedBackground'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen bg-bg flex flex-col overflow-x-hidden font-sans">
      <AnimatedBackground />

      <main className="relative z-10 flex-1 w-full max-w-6xl mx-auto px-6 pt-20 pb-24">
        
        {/* HERO SECTION */}
        <section className="flex flex-col items-center text-center animate-fade-in-up">
          {/* Logo */}
          <div className="flex items-center gap-4 mb-8 hover:scale-105 transition-transform duration-300 cursor-default">
            <div className="flex items-center justify-center px-5 h-14 rounded-2xl bg-gradient-to-tr from-brand via-blue-600 to-indigo-500 shadow-xl shadow-brand/30 border border-white/20">
              <span className="text-white font-black text-2xl tracking-wider">RIQ</span>
            </div>
            <span className="text-txt font-extrabold text-4xl tracking-tight">
              ResumeIQ
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-txt via-txt to-txt-muted tracking-tight leading-[1.1] max-w-4xl mx-auto">
            Build a resume that <br className="hidden md:block" />
            <span className="text-brand">actually gets interviews.</span>
          </h1>

          <div className="text-brand text-lg font-bold tracking-wide uppercase mt-6 mb-6">
            The Smart Way to Get Hired
          </div>
          
          <p className="text-lg md:text-xl text-txt-muted max-w-2xl mx-auto leading-relaxed mb-10">
            Stop guessing what recruiters want. Use ResumeIQ to analyze your impact, bypass ATS filters, and build a world-class professional resume in minutes.
          </p>

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto px-12 py-5 rounded-full bg-brand hover:bg-brand-hover text-white text-xl font-black tracking-wide transition-all hover:scale-105 shadow-2xl shadow-brand/30 flex items-center justify-center gap-3 group mx-auto"
          >
            Get Started
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
          {/* Trust Badges */}
          <div className="mt-12 flex flex-col items-center gap-10">
            <p className="text-base font-semibold text-txt-muted">
              No sign up required. No credit card.
            </p>
            <div className="flex items-center justify-center gap-3 text-lg font-medium text-txt-muted opacity-90 hover:opacity-100 transition-opacity">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-border/50">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <span><strong className="text-txt">100% Private & Local.</strong> Your data never leaves your browser.</span>
            </div>
          </div>
        </section>

        {/* WORKFLOW ABSTRACT GRAPHIC */}
        <section className="mt-32 w-full max-w-5xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-txt tracking-tight mb-4">How ResumeIQ Works</h2>
            <p className="text-lg text-txt-muted max-w-xl mx-auto">A seamless, intelligent workflow designed to give you complete control over your career narrative.</p>
          </div>
          
          <div className="flex flex-col md:flex-row items-stretch justify-between gap-8 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-border via-brand/30 to-border -translate-y-1/2 z-0 rounded-full"></div>
            
            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center text-center bg-bg p-8 rounded-3xl border border-border shadow-xl backdrop-blur-md w-full md:w-1/3 hover:-translate-y-2 transition-transform duration-300 group">
              <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-6 border border-indigo-500/20 shadow-inner group-hover:scale-110 transition-transform">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
              </div>
              <h3 className="text-xl font-bold text-txt mb-3">1. Upload or Build</h3>
              <p className="text-base text-txt-muted">Import your existing resume or use our premium builder to start from scratch.</p>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center text-center bg-bg p-8 rounded-3xl border border-brand/40 shadow-2xl shadow-brand/10 backdrop-blur-md w-full md:w-1/3 md:scale-105 hover:-translate-y-2 transition-transform duration-300 group">
              <div className="w-24 h-24 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mb-6 border border-brand/30 shadow-inner relative group-hover:scale-110 transition-transform">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
              </div>
              <h3 className="text-xl font-bold text-txt mb-3">2. AI Analysis</h3>
              <p className="text-base text-txt-muted">Our local intelligence engine scans for ATS compatibility and content impact instantly.</p>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center text-center bg-bg p-8 rounded-3xl border border-border shadow-xl backdrop-blur-md w-full md:w-1/3 hover:-translate-y-2 transition-transform duration-300 group">
              <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6 border border-emerald-500/20 shadow-inner group-hover:scale-110 transition-transform">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <h3 className="text-xl font-bold text-txt mb-3">3. Land Interviews</h3>
              <p className="text-base text-txt-muted">Export a highly optimized, beautifully formatted PDF that bypasses recruiters' filters.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
