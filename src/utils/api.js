/**
 * Calls the secure Vercel Serverless backend to analyze a resume.
 */
export async function analyzeResume({ toolId, toolName, resumeContent, jdContent = '' }) {
  let response
  try {
    response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      body: JSON.stringify({ toolId, toolName, resumeContent, jdContent }),
    })
  } catch {
    // Network error — server not reachable
    throw new Error('Unable to connect to the analysis service. Please check your connection and try again.')
  }

  if (!response.ok) {
    let userMessage = 'Something went wrong. Please try again in a moment.'
    try {
      const errJson = await response.json()
      // Use backend's user-friendly error if available, but never expose raw codes
      if (errJson?.error && !errJson.error.toLowerCase().includes('api')) {
        userMessage = errJson.error
      }
    } catch {
      // ignore parse errors
    }
    throw new Error(userMessage)
  }

  return response.json()
}
export function getFallbackResult() {
  return {
    atsScore: 72,
    matchScore: 68,
    strengths: [
      'Clear work history with progression',
      'Strong technical keywords present',
      'Well-structured sections',
      'Relevant certifications listed',
    ],
    missingSkills: [
      'Docker & containerization',
      'System design fundamentals',
      'CI/CD pipeline experience',
      'Cloud architecture knowledge',
    ],
    techSkillMatch: 74,
    weakAreas: [
      'No quantified achievements',
      'Summary section too generic',
      'Missing impact metrics',
    ],
    suggestions: [
      'Add measurable impact to each role (e.g. "increased performance by 30%")',
      'Include 8–12 keywords from the target job posting',
      'Rewrite your summary to mention your specialization clearly',
      'Add a Projects section to showcase hands-on work',
      'Use active verbs — "Built", "Led", "Improved" instead of passive phrasing',
    ],
    keywords: ['Python', 'REST APIs', 'Agile', 'SQL', 'Cloud', 'Microservices', 'React'],
    hiringConfidence: 'Medium',
    summary:
      'The resume demonstrates solid technical foundations and relevant experience. With improved quantification of achievements and stronger keyword alignment to the target role, ATS pass rate and recruiter interest would increase significantly. Focus on impact over responsibility.',
  }
}
