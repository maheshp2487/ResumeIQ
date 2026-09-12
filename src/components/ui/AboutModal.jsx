import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export default function AboutModal({ isOpen, onClose }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen || !mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fade-in">
      {/* Dimmed Background Overlay */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-bg rounded-3xl shadow-2xl border border-border p-8 animate-modal-in">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-bg-secondary text-txt-muted hover:text-txt hover:bg-border transition-colors"
        >
          ✕
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center justify-center px-3.5 h-10 rounded-xl bg-gradient-to-tr from-brand via-blue-600 to-indigo-500 shadow-lg shadow-brand/20 border border-white/10">
            <span className="text-white font-black text-base tracking-wider">RIQ</span>
          </div>
          <h2 className="text-2xl font-bold text-txt">About ResumeIQ</h2>
        </div>

        <div className="space-y-5 text-txt-muted leading-relaxed">
          <p className="text-[15px]">
            ResumeIQ is an intelligent, privacy-first career platform designed to help professionals bypass applicant tracking systems (ATS) and land more interviews.
          </p>
          
          <div className="bg-bg-secondary/50 rounded-2xl p-4 border border-border/50 space-y-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 w-6 h-6 rounded-lg bg-brand/10 text-brand flex items-center justify-center flex-shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/><path d="M14 3v5h5"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-txt">Resume Builder</h4>
                <p className="text-xs mt-0.5">Create modern, ATS-friendly resumes from scratch.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-txt">ATS & Formatting Checker</h4>
                <p className="text-xs mt-0.5">Analyze impact, keyword density, and formatting flaws instantly.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 w-6 h-6 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center flex-shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-txt">Content Analyzer</h4>
                <p className="text-xs mt-0.5">Evaluate narrative storytelling and generate bullet point rewrites.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="mt-0.5 w-6 h-6 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-txt">Job Description Match</h4>
                <p className="text-xs mt-0.5">Compare your resume directly against specific job descriptions.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Separate Author Box */}
        <div className="mt-8 p-4 rounded-xl bg-bg-secondary border border-border flex items-center justify-between gap-4 flex-wrap">
          <p className="text-sm text-txt-muted">
            Built By: <span className="font-bold text-txt">Mahesh P</span>
          </p>
          <a 
            href="mailto:maheshp2487@gmail.com" 
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg border border-border text-xs font-semibold text-brand hover:bg-brand-surface hover:border-brand/30 transition-colors"
          >
            ✉ maheshp2487@gmail.com
          </a>
        </div>
      </div>
    </div>,
    document.body
  )
}
