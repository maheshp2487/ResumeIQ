import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { TOOLS } from '../../utils/constants'
import AboutModal from '../ui/AboutModal'

export default function Header() {
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isAboutOpen, setIsAboutOpen] = useState(false)

  const closeMenu = () => setMobileMenuOpen(false)

  return (
    <header className="sticky top-0 z-[100] w-full border-b border-border bg-bg-secondary/80 backdrop-blur-md shadow-sm transition-colors duration-300">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="flex items-center gap-3 group">
              <div className="flex items-center justify-center px-3.5 h-10 rounded-xl bg-gradient-to-tr from-brand via-blue-600 to-indigo-500 shadow-md shadow-brand/20 border border-white/10 group-hover:shadow-brand/40 group-hover:scale-105 transition-all duration-300">
                <span className="text-white font-black text-base tracking-wider">RIQ</span>
              </div>
              <span className="text-txt font-extrabold text-xl tracking-tight hidden sm:block">
                ResumeIQ
              </span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isActive ? 'bg-brand-surface text-brand' : 'text-txt-muted hover:text-txt hover:bg-bg'
                }`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/builder"
              className={({ isActive }) =>
                `px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isActive ? 'bg-brand-surface text-brand' : 'text-txt-muted hover:text-txt hover:bg-bg'
                }`
              }
            >
              Resume Builder
            </NavLink>
            {TOOLS.map(tool => (
              <NavLink
                key={tool.id}
                to={tool.path}
                className={({ isActive }) =>
                  `px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isActive ? 'bg-brand-surface text-brand' : 'text-txt-muted hover:text-txt hover:bg-bg'
                  }`
                }
              >
                {tool.shortName}
              </NavLink>
            ))}
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setIsAboutOpen(true)}
              className="text-sm font-bold text-txt-muted hover:text-brand px-4 py-2.5 rounded-xl hover:bg-brand/5 transition-all duration-200"
            >
              About ResumeIQ
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-txt hover:text-brand"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {mobileMenuOpen ? (
                  <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                ) : (
                  <><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></>
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-bg-secondary p-4 animate-fade-in absolute w-full shadow-2xl z-[150] left-0">
          <nav className="flex flex-col gap-2">
            <NavLink
              to="/dashboard"
              onClick={closeMenu}
              className={({ isActive }) => `px-4 py-3 rounded-xl text-sm font-medium ${isActive ? 'bg-brand-surface text-brand' : 'text-txt-muted hover:bg-bg hover:text-txt'}`}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/builder"
              onClick={closeMenu}
              className={({ isActive }) => `px-4 py-3 rounded-xl text-sm font-medium ${isActive ? 'bg-brand-surface text-brand' : 'text-txt-muted hover:bg-bg hover:text-txt'}`}
            >
              Resume Builder
            </NavLink>
            {TOOLS.map(tool => (
              <NavLink
                key={tool.id}
                to={tool.path}
                onClick={closeMenu}
                className={({ isActive }) => `px-4 py-3 rounded-xl text-sm font-medium ${isActive ? 'bg-brand-surface text-brand' : 'text-txt-muted hover:bg-bg hover:text-txt'}`}
              >
                {tool.name}
              </NavLink>
            ))}
            <div className="my-2 border-t border-border" />
            <button
              onClick={() => {
                setIsAboutOpen(true)
                closeMenu()
              }}
              className="px-4 py-3 text-left rounded-xl text-sm font-semibold text-brand hover:bg-brand/10 transition-colors"
            >
              About ResumeIQ
            </button>
          </nav>
        </div>
      )}

      {/* Portal-rendered About Modal */}
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </header>
  )
}
