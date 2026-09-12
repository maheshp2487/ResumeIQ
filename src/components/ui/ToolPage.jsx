import { useState } from 'react'
import Card, { CardTitle } from './Card'
import Button from './Button'
import UploadArea from './UploadArea'
import LoadingState from './LoadingState'
import AtsResults from './AtsResults'
import AnalyzerResults from './AnalyzerResults'
import JdMatchResults from './JdMatchResults'
import PageHeader from './PageHeader'
import { analyzeResume } from '../../utils/api'
import { useAnalysis } from '../../hooks/useAnalysis'
import { extractPdfText } from '../../utils/pdfText'
import { validateAnalysisInputs } from '../../utils/validation'
import { useToast } from '../../context/ToastContext'

export default function ToolPage({ tool }) {
  const { recordAnalysis } = useAnalysis()
  const { push: toast } = useToast()

  const [resumeFile, setResumeFile] = useState(null)
  const [jdText, setJdText] = useState('')

  const [state, setState] = useState('idle')
  const [results, setResults] = useState(null)

  const showError = (message, title) => {
    toast({ message, variant: 'error', title })
  }

  const showSuccess = (message) => {
    toast({ message, variant: 'success', title: 'Analysis Complete' })
  }

  const handleAnalyze = async () => {
    if (!resumeFile) {
      showError('Please upload your resume to continue.', 'Upload Required')
      return
    }

    if (tool.needsJD && !jdText.trim()) {
      showError('Please paste the job description to continue.', 'Input Required')
      return
    }

    setState('loading')

    try {
      const { text: resumeContent } = await extractPdfText(resumeFile)
      
      if (!resumeContent.trim()) {
        throw new Error('Could not extract text from the provided resume.')
      }

      const jdContent = tool.needsJD ? jdText.trim() : ''

      const validation = validateAnalysisInputs({
        resumeText: resumeContent,
        jdText: jdContent,
        needsJD: tool.needsJD,
      })

      if (!validation.ok) {
        setState('idle')
        showError(validation.message, 'Validation Failed')
        return
      }

      const data = await analyzeResume({
        toolId: tool.id,
        toolName: tool.name,
        resumeContent,
        jdContent,
      })

      setResults(data)
      recordAnalysis(data.atsScore)
      setState('results')
      showSuccess('Your resume has been successfully evaluated.')
    } catch (err) {
      console.error('[ToolPage] Analysis error:', err)
      setResults(null)
      setState('idle')

      // Parse AI-specific error types for actionable messages
      const msg = err?.message || ''
      if (msg.includes('quota') || msg.includes('429') || msg.includes('rate')) {
        showError('The AI service is currently at capacity. Please wait a moment and try again.', 'Rate Limit')
      } else if (msg.includes('safety') || msg.includes('SAFETY') || msg.includes('content policy')) {
        showError('The content could not be processed due to a safety filter. Please check your resume content.', 'Content Policy')
      } else if (msg.includes('JSON') || msg.includes('parse') || msg.includes('Unexpected token')) {
        showError('The AI returned an unexpected response. Please try again.', 'Parse Error')
      } else if (msg.includes('fetch') || msg.includes('network') || msg.includes('Failed to fetch')) {
        showError('A network error occurred. Please check your connection and try again.', 'Connection Error')
      } else if (msg.includes('extract') || msg.includes('text')) {
        showError(msg, 'Resume Unreadable')
      } else {
        showError(msg || 'Something went wrong while communicating with the AI. Please try again.', 'Analysis Failed')
      }
    }
  }

  const handleReset = () => {
    setState('idle')
    setResults(null)
    setResumeFile(null)
    setJdText('')
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fade-in relative">
      <PageHeader
        title={tool.name}
        subtitle={tool.desc}
        breadcrumb={tool.shortName}
      />

      {state === 'idle' && (
        <div className="space-y-6">
          <Card className="rounded-2xl border border-border bg-bg shadow-sm transition-all duration-300">
            <div className="flex items-center justify-between mb-5">
              <div>
                <CardTitle>Resume Input</CardTitle>
                <p className="text-sm text-txt-muted mt-1">
                  Upload your resume as a PDF file.
                </p>
              </div>
            </div>

            <UploadArea
              file={resumeFile}
              onFile={setResumeFile}
              onRemove={() => setResumeFile(null)}
              label="resume"
            />
          </Card>

          {tool.needsJD && (
            <Card className="rounded-2xl border border-border bg-bg shadow-sm transition-all duration-300">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <CardTitle>Job Description</CardTitle>
                  <p className="text-sm text-txt-muted mt-1">
                    Paste the job description to match your resume against role requirements.
                  </p>
                </div>
              </div>

              <textarea
                value={jdText}
                onChange={e => setJdText(e.target.value)}
                placeholder="Paste the job description here..."
                className="w-full px-5 py-4 bg-bg-secondary border border-border rounded-xl text-sm text-txt placeholder-txt-muted outline-none focus:border-brand focus:ring-4 focus:ring-brand-surface resize-y leading-relaxed transition-all duration-300 min-h-[180px]"
                rows={8}
              />
            </Card>
          )}

          <div className="flex justify-end pt-2">
            <Button onClick={handleAnalyze} size="lg" className="w-full sm:w-auto">
              Run Analysis
            </Button>
          </div>
        </div>
      )}

      {state === 'loading' && (
        <LoadingState
          toolId={tool.id}
          toolLabel={tool.shortName}
        />
      )}

      {state === 'results' && results && (
        <div className="mt-8">
          {tool.id === 'ats-checker' && <AtsResults data={results} onReset={handleReset} />}
          {tool.id === 'resume-analyzer' && <AnalyzerResults data={results} onReset={handleReset} />}
          {tool.id === 'jd-match' && <JdMatchResults data={results} onReset={handleReset} />}
        </div>
      )}
    </div>
  )
}