import { useEffect, useState } from 'react'
import { getLoadingSteps, LOADING_STEPS_DEFAULT } from '../../utils/constants'
import Card from './Card'

export default function LoadingState({ toolId, toolLabel }) {
  const steps = toolId ? getLoadingSteps(toolId) : LOADING_STEPS_DEFAULT

  const [stepIndex, setStepIndex] = useState(0)

  const total = steps.length

  const progress =
    total > 0
      ? Math.min(100, Math.round(((stepIndex + 1) / total) * 100))
      : 0

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex(i => Math.min(i + 1, total - 1))
    }, 700)

    return () => clearInterval(interval)
  }, [total])

  return (
    <Card hover={false}>
      <div className="relative overflow-hidden py-10 px-6">
        <div className="relative z-10 flex flex-col items-center">
          {/* Animated Loader */}
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-full border border-border bg-bg-secondary flex items-center justify-center">
              <div className="w-12 h-12 border-[3px] border-brand/20 border-t-brand rounded-full animate-spin" />
            </div>
          </div>

          {/* Header */}
          <div className="text-center max-w-lg">
            <p className="text-[0.72rem] uppercase tracking-widest text-brand font-bold mb-3">
              {toolLabel ? `${toolLabel} Analysis` : 'Analysis'}
            </p>

            <h2 className="text-2xl font-bold tracking-tight text-txt mb-3">
              Processing your resume
            </h2>

            <p className="text-sm text-txt-muted leading-relaxed">
              Analyzing resume quality, ATS performance,
              keyword optimization, and technical alignment.
            </p>
          </div>

          {/* Progress Section */}
          <div className="w-full max-w-xl mt-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-txt-muted uppercase tracking-wider font-medium">
                Analysis Progress
              </span>
              <span className="text-sm font-bold text-brand">
                {progress}%
              </span>
            </div>

            <div className="h-2 rounded-full bg-bg border border-border overflow-hidden">
              <div
                className="h-full rounded-full bg-brand transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Steps */}
          <div className="w-full max-w-xl mt-8 flex flex-col gap-3">
            {steps.map((step, i) => {
              const active = i === stepIndex
              const completed = i < stepIndex

              return (
                <div
                  key={i}
                  className={`
                    flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300
                    ${
                      active
                        ? 'bg-brand-surface border border-brand/20'
                        : completed
                          ? 'bg-emerald-500/10 border border-emerald-500/20'
                          : 'bg-bg border border-border'
                    }
                  `}
                >
                  <div
                    className={`
                      w-2.5 h-2.5 rounded-full flex-shrink-0 transition-all duration-300
                      ${
                        completed
                          ? 'bg-emerald-500'
                          : active
                            ? 'bg-brand animate-pulse'
                            : 'bg-border'
                      }
                    `}
                  />

                  <p
                    className={`
                      text-sm font-medium transition-colors duration-300
                      ${
                        completed
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : active
                            ? 'text-txt'
                            : 'text-txt-muted'
                      }
                    `}
                  >
                    {step}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-txt-muted font-medium">
              This usually takes only a few seconds
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}