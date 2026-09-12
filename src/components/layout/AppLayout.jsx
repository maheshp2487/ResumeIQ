import { Outlet } from 'react-router-dom'
import Header from './Header'
import AnimatedBackground from '../ui/AnimatedBackground'

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-bg flex flex-col overflow-hidden transition-colors duration-300 relative">
      {/* Premium Background Animation */}
      <AnimatedBackground />

      {/* Top Navigation */}
      <Header />

      {/* Main Content — Scrollable */}
      <main className="flex-1 overflow-y-auto w-full relative z-10">
        <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}