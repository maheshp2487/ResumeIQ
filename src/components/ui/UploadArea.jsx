import { useRef, useState } from 'react'
import { formatFileSize } from '../../utils/helpers'
import { useToast } from '../../context/ToastContext'

export default function UploadArea({
  file,
  onFile,
  onRemove,
  label = 'Resume PDF',
}) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const { push: toast } = useToast()

  const handleFile = f => {
    if (!f) return

    if (f.type !== 'application/pdf') {
      toast({
        message: 'Only PDF files are supported.',
        variant: 'error',
        duration: 4200,
      })
      return
    }

    onFile(f)

    toast({
      message: String(label).toLowerCase().includes('job')
        ? `Job description uploaded successfully`
        : `Resume uploaded successfully`,
      variant: 'success',
    })
  }

  const handleDrop = e => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  if (file) {
    return (
      <div className="group relative overflow-hidden rounded-2xl border border-brand/20 bg-brand-surface px-5 py-4 transition-all duration-300 hover:border-brand/40 hover:shadow-md">
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-bg border border-brand/20 flex items-center justify-center text-brand text-xl flex-shrink-0">
            📄
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-txt text-sm font-bold truncate">
              {file.name}
            </p>

            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-txt-muted font-medium">
                {formatFileSize(file.size)}
              </span>

              <span className="w-1 h-1 rounded-full bg-border" />

              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                Ready for analysis
              </span>
            </div>
          </div>

          <button
            onClick={onRemove}
            className="w-9 h-9 rounded-lg bg-bg hover:bg-red-500/10 text-txt-muted hover:text-red-500 transition-all duration-200 flex items-center justify-center border border-border hover:border-red-500/20"
            title="Remove file"
          >
            ✕
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div
        onDragOver={e => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          relative overflow-hidden
          border-2 border-dashed rounded-2xl
          px-8 py-12
          text-center cursor-pointer
          transition-all duration-300
          ${
            dragging
              ? 'border-brand bg-brand-surface shadow-md scale-[1.01]'
              : 'border-border bg-bg-secondary hover:border-brand/50 hover:bg-bg-tertiary'
          }
        `}
      >
        <div className="relative z-10 flex flex-col items-center">
          <div
            className={`
              w-16 h-16 rounded-xl mb-5
              flex items-center justify-center
              text-3xl transition-all duration-300
              ${
                dragging
                  ? 'bg-brand text-white scale-110 shadow-md'
                  : 'bg-bg border border-border text-txt-muted'
              }
            `}
          >
            ⬆
          </div>

          <h3 className="text-txt font-bold text-[1rem] mb-2 tracking-tight">
            Upload your {label}
          </h3>

          <p className="text-sm text-txt-muted mb-5 max-w-sm leading-relaxed">
            Drag and drop your PDF file here or browse from your device for analysis.
          </p>

          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-bg border border-border text-sm text-txt font-medium hover:border-brand/30 hover:bg-brand-surface hover:text-brand transition-all duration-200">
            Browse Files
          </div>

          <p className="text-xs text-txt-muted font-medium mt-5">
            PDF files only • Max quality extraction supported
          </p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={e => {
          if (e.target.files?.[0]) {
            handleFile(e.target.files[0])
          }
          e.target.value = ''
        }}
      />
    </div>
  )
}