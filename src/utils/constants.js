export const TOOLS = [
  {
    id: 'ats-checker',
    name: 'ATS & Formatting Checker',
    shortName: 'ATS Checker',
    icon: '◉',
    iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    desc: 'Run a strict machine readability audit to ensure your resume passes applicant tracking systems flawlessly.',
    needsJD: false,
    path: '/ats-checker',
  },

  {
    id: 'resume-analyzer',
    name: 'Content Analyzer',
    shortName: 'Content Analyzer',
    icon: '◎',
    iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    desc: 'Evaluate your narrative storytelling, impact metrics, and action verbs to generate powerful bullet point rewrites.',
    needsJD: false,
    path: '/resume-analyzer',
  },

  {
    id: 'jd-match',
    name: 'Job Description Match',
    shortName: 'JD Match',
    icon: '⇄',
    iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    desc: 'Compare your resume against a specific target role to instantly identify missing skills and keyword gaps.',
    needsJD: true,
    path: '/jd-match',
  },
]

export const LOADING_STEPS_DEFAULT = [
  'Reading resume text...',
  'Validating input quality...',
  'Processing analysis...',
  'Structuring results...',
  'Almost done...',
]

export function getLoadingSteps(toolId) {
  const id = String(toolId || '')

  const base = [
    'Extracting text from your upload...',
    'Validating content...',
    'Running analysis...',
  ]

  if (id.includes('ats-checker')) {
    return [
      ...base,
      'Checking ATS parsing & formatting signals...',
      'Compiling ATS structural report...',
    ]
  }

  if (id.includes('resume-analyzer')) {
    return [
      ...base,
      'Reviewing impact, clarity, and metrics...',
      'Drafting rewrite-ready suggestions...',
    ]
  }

  if (id.includes('jd-match')) {
    return [
      ...base,
      'Comparing resume vs job description...',
      'Computing keyword gaps and alignment...',
    ]
  }

  return [...LOADING_STEPS_DEFAULT]
}