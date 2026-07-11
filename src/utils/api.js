/**
 * Calls the Groq API (OpenAI-compatible) to analyze a resume.
 */
export async function analyzeResume({ toolId, toolName, resumeContent, jdContent = '' }) {
  const prompt = buildPrompt(toolId || toolName, resumeContent, jdContent)
  const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY

  if (!GROQ_KEY) {
    throw new Error('Missing API key. Set VITE_GROQ_API_KEY in your .env file.')
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_KEY}`,
    },
    body: JSON.stringify({
      model: 'openai/gpt-oss-120b',
      temperature: 0.2,
      max_completion_tokens: 1200,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You are a strict JSON generator. Output must be a single valid JSON object with no markdown, no backticks, and no extra text. Follow the user instructions exactly; never use generic template phrases—every bullet must be tied to the provided resume/JD content.',
        },
        { role: 'user', content: prompt },
      ],
    }),
  })

  if (!response.ok) {
    let details = ''
    try {
      const errJson = await response.json()
      details = errJson?.error?.message || errJson?.message || ''
    } catch {
      // ignore
    }
    throw new Error(`API error (${response.status})${details ? `: ${details}` : ''}`)
  }

  const data = await response.json()

  const raw = data.choices?.[0]?.message?.content || ''
  if (!raw.trim()) {
    const finishReason = data.choices?.[0]?.finish_reason
    throw new Error(`AI returned an empty response${finishReason ? ` (${finishReason})` : ''}. Please try again.`)
  }

  const cleaned = raw.replace(/```json|```/g, '').trim()

  try {
    return JSON.parse(cleaned)
  } catch (e) {
    const extracted = extractFirstJsonObject(cleaned)
    if (extracted) {
      try {
        return JSON.parse(extracted)
      } catch {
        // fallthrough to repair
      }
    }

    // One repair attempt: ask the model to output ONLY valid JSON.
    const repaired = await repairJsonWithGroq({
      apiKey: GROQ_KEY,
      model: 'openai/gpt-oss-120b',
      schemaHint: getSchemaHint(),
      badOutput: cleaned,
    })
    if (!repaired) throw new Error('AI returned an invalid response. Please try again.')
    try {
      return JSON.parse(repaired)
    } catch {
      throw new Error('AI returned an invalid response. Please try again.')
    }
  }
}

function extractFirstJsonObject(text) {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) return null
  return text.slice(start, end + 1)
}

function getSchemaHint() {
  return `{
  "atsScore": 0-100,
  "matchScore": 0-100,
  "strengths": string[],
  "missingSkills": string[],
  "techSkillMatch": 0-100,
  "weakAreas": string[],
  "suggestions": string[],
  "keywords": string[],
  "hiringConfidence": "High" | "Medium" | "Low",
  "summary": string
}`
}

async function repairJsonWithGroq({ apiKey, model, schemaHint, badOutput }) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      max_completion_tokens: 900,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'Fix the user-provided content into one valid JSON object. Output JSON only. No markdown, no backticks, no extra text.',
        },
        {
          role: 'user',
          content: `Return a valid JSON object matching this schema:\n${schemaHint}\n\nInvalid content:\n${badOutput}`,
        },
      ],
    }),
  })

  if (!response.ok) return null
  const data = await response.json()
  const raw = data.choices?.[0]?.message?.content || ''
  const cleaned = raw.replace(/```json|```/g, '').trim()
  return extractFirstJsonObject(cleaned) || cleaned
}

function buildPrompt(toolId, resume, jd) {
  const schema = `{
  "atsScore": <integer 0-100>,
  "matchScore": <integer 0-100>,
  "strengths": [<3-5 short strings>],
  "missingSkills": [<3-8 short strings>],
  "techSkillMatch": <integer 0-100>,
  "weakAreas": [<2-5 short strings>],
  "suggestions": [<4-7 concise action strings>],
  "keywords": [<6-12 keyword strings>],
  "hiringConfidence": "High" | "Medium" | "Low",
  "summary": "<2-4 sentence professional assessment>"
}`

  const antiGeneric = `CRITICAL — realism rules:
- Quote or paraphrase specifics from the resume/JD (technologies, role titles, project names if present). Never invent employers, degrees, or years not in the text.
- Weak, thin, or student resumes MUST yield LOW atsScore/techSkillMatch (typically 25–55) and MORE items in weakAreas; do NOT praise thin content.
- Strong, experienced resumes with metrics may score HIGH (75–92).
- If the resume claims cloud/DevOps but JD or context expects AWS/K8s and those are absent, lower techSkillMatch and list them in missingSkills.
- If React/Tailwind (or similar) appear in JD but not resume, lower matchScore and mention explicitly.
- Each tool must produce DISTINCT strengths, weakAreas, and suggestions — do not reuse the same phrases across tools.
- hiringConfidence must align with scores (High only if evidence is strong).

Schema for THIS tool (same JSON keys for all tools, but INTERPRET scores per tool instructions below):
${schema}`

  const context = `Resume content:
${resume}
${jd ? `\nJob Description:\n${jd}` : ''}`

  const tool = String(toolId || '').toLowerCase()

  if (tool.includes('ats-checker')) {
    return `${antiGeneric}

TOOL: ATS Resume Checker ONLY.
- atsScore = ATS compatibility / machine readability (sections, plain bullets, keyword spread, likely parsing issues). NOT overall writing quality.
- techSkillMatch = how well role-relevant keywords appear in parseable form (density + placement), not personality.
- matchScore: if no JD, set matchScore close to atsScore OR a neutral 45–60; if JD present, align keyword overlap.
- strengths: ATS positives (clear headings, standard section names, keyword coverage, simple layout).
- weakAreas: parsing risks (tables, multi-column, icons, dense headers, tiny fonts implied by structure, missing standard sections).
- suggestions: concrete ATS fixes (single column, standard headings, paste-friendly bullets, keyword clusters).
- keywords: missing ATS-relevant tokens inferred from resume+JD (skills/tools).
- summary: focus on ATS pass probability, not storytelling.

${context}`
  }

  if (tool.includes('resume-analyzer')) {
    return `${antiGeneric}

TOOL: Resume Analyzer ONLY (quality of content & story).
- atsScore = overall resume quality / impact (use this as the main quality score for this tool).
- techSkillMatch = strength of technical proof (projects, tools, measurable outcomes).
- matchScore: without JD estimate market readiness from resume alone (40–85); with JD use overlap.
- strengths: impact statements, clarity, project depth, metrics, progression (only if supported by text).
- weakAreas: vague bullets, no metrics, weak verbs, thin projects, formatting of content (not ATS parsing).
- suggestions: rewrite bullets, quantify, reorder sections, strengthen projects.
- keywords: skills that should appear or are under-emphasized based on resume target.

${context}`
  }

  if (tool.includes('jd-match')) {
    return `${antiGeneric}

TOOL: JD Match ONLY (alignment resume vs JD).
- matchScore = percentage fit with JD (must-haves, tools, domain). Primary score for evaluation.
- atsScore = supporting signal: resume strength as presented (can diverge from matchScore).
- techSkillMatch = overlap on technical stack between resume and JD.
- strengths: matched requirements, tools, and themes with evidence.
- missingSkills: JD requirements NOT clearly demonstrated in resume (be explicit: e.g. "AWS (mentioned in JD, not in resume)").
- weakAreas: gaps in responsibilities, domain, seniority mismatch.
- suggestions: targeted edits to mirror JD language (without fabrication).
- keywords: high-value JD terms absent or weak in resume.

${context}`
  }

  if (tool.includes('skill-gap')) {
    return `${antiGeneric}

TOOL: Skill Gap ONLY (learning path toward the role in JD).
- missingSkills: prioritized list (must-learn vs should-learn) from JD vs resume.
- techSkillMatch = how much of the required stack is already demonstrated.
- matchScore = role readiness estimate from gap size (lower = more gaps).
- atsScore = optional baseline resume strength; keep lower if resume is thin.
- strengths: skills already evidenced.
- weakAreas: missing evidence for critical JD skills; interview risk areas.
- suggestions: learning roadmap (courses/projects) + how to add proof to resume.
- summary: readiness narrative and fastest path to credible proof.

${context}`
  }

  if (tool.includes('improvements')) {
    return `${antiGeneric}

TOOL: Resume Improvements ONLY (actionable edits).
- suggestions: numbered-quality rewrites — each must reference something in the resume (section/bullet/skills).
- weakAreas: editorial problems (passive voice, redundancy, weak hooks).
- strengths: what to keep while editing.
- atsScore = potential uplift after fixes (honest: weak resume → low 30s–50s until rewritten).
- techSkillMatch = how compelling tech proof is today.
- matchScore: if no JD, omit alignment focus; mirror atsScore or set 50–70 neutral band.

${context}`
  }

  if (tool.includes('score-checker')) {
    return `${antiGeneric}

TOOL: Resume Score Checker ONLY (weighted rubric).
- Treat atsScore as FINAL weighted overall employability score (clarity 20%, impact 25%, skills evidence 25%, structure 15%, credibility 15% — approximate mentally).
- In summary, briefly justify the weighting in plain language (no tables).
- techSkillMatch = technical evidence sub-score feel converted to 0–100.
- matchScore: without JD mirror overall; with JD add alignment component.
- weakAreas: category-specific misses.
- strengths: category-specific wins.
- suggestions: what moves the score most per category.

${context}`
  }

  return `${antiGeneric}

${context}`
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
