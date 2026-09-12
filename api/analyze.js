export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { toolId, toolName, resumeContent, jdContent } = req.body

  if (!resumeContent) {
    return res.status(400).json({ error: 'Missing resume content' })
  }

  const prompt = buildPrompt(toolId || toolName, resumeContent, jdContent || '')
  
  const GROQ_KEY = process.env.GROQ_API_KEY
  if (!GROQ_KEY) {
    return res.status(500).json({ error: 'Server configuration error: Missing API key.' })
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_KEY}`,
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        temperature: 0.4,
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
      console.error(`Groq API Error: ${response.status}`)
      return res.status(response.status).json({ 
        error: 'The analysis service is currently unavailable. Please try again in a moment.' 
      })
    }

    const data = await response.json()
    const raw = data.choices?.[0]?.message?.content || ''
    
    if (!raw.trim()) {
      return res.status(500).json({ error: 'AI returned an empty response. Please try again.' })
    }

    const cleaned = raw.replace(/```json|```/g, '').trim()

    let parsedResult
    try {
      parsedResult = JSON.parse(cleaned)
    } catch (e) {
      const extracted = extractFirstJsonObject(cleaned)
      if (extracted) {
        try {
          parsedResult = JSON.parse(extracted)
        } catch {
          // fallthrough to repair
        }
      }

      if (!parsedResult) {
        const repaired = await repairJsonWithGroq({
          apiKey: GROQ_KEY,
          model: 'openai/gpt-oss-120b',
          schemaHint: getSchemaHint(),
          badOutput: cleaned,
        })
        if (!repaired) {
           return res.status(500).json({ error: 'AI returned an invalid response. Please try again.' })
        }
        try {
          parsedResult = JSON.parse(repaired)
        } catch {
          return res.status(500).json({ error: 'AI returned an invalid response. Please try again.' })
        }
      }
    }

    return res.status(200).json(parsedResult)
  } catch (error) {
    console.error('Groq API Error:', error)
    return res.status(500).json({ error: 'Internal server error while calling Groq API.' })
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

  const context = `Resume content:
${resume}
${jd ? `\nJob Description:\n${jd}` : ''}

Analysis Request ID: ${Date.now()}-${Math.floor(Math.random() * 1000)}

CRITICAL: You must output ONLY a single, valid JSON object matching the requested schema. Do NOT include markdown formatting or backticks.`

  const tool = String(toolId || '').toLowerCase()

  if (tool.includes('ats-checker')) {
    return `CRITICAL RULES FOR ATS CHECKER:
- This tool ONLY evaluates machine readability, layout, and formatting. Do NOT critique storytelling or content depth.
- atsScore = Overall ATS structural score (deduct for likely parsing issues).
- techSkillMatch = Formatting and placement of keywords (are they extractable?).
- matchScore = 0 (Not applicable for this tool).
- strengths = Structural positives (e.g., "Standard headings used", "Clear chronological format").
- weakAreas = Parsing risks (e.g., "Multi-column layout detected", "Icons used instead of bullet points").
- missingSkills = Empty array [].
- suggestions = Explicit formatting fixes (e.g., "Change 'Work History' to 'Experience'", "Remove tables").
- keywords = Extracted technical terms that ATS parsers will easily find.
- summary = Focus entirely on how easily a machine can parse this document.

Schema:
${schema}

${context}`
  }

  if (tool.includes('resume-analyzer')) {
    return `CRITICAL RULES FOR CONTENT & IMPACT ANALYZER:
- This tool ONLY evaluates storytelling, impact metrics, and action verbs. Do NOT mention ATS parsing, multi-columns, or layouts.
- atsScore = Overall Content Quality score.
- techSkillMatch = Strength of technical proof (e.g., "Used React to build X" vs just "React").
- matchScore = 0 (Not applicable without JD).
- strengths = Narrative strengths (e.g., "Strong use of metrics", "Clear progression").
- weakAreas = Editorial problems (e.g., "Passive voice in Experience", "Missing quantifiable results").
- missingSkills = Empty array [].
- suggestions = Specific, rewrite-ready bullet points (e.g., "Rewrite 'Helped with sales' to 'Increased sales by 15% via...'").
- keywords = Power verbs and industry terms used well.
- summary = Focus entirely on how compelling the resume reads to a human hiring manager.

Schema:
${schema}

${context}`
  }

  if (tool.includes('jd-match')) {
    return `CRITICAL RULES FOR JOB DESCRIPTION MATCH:
- This tool ONLY evaluates alignment between the resume and the provided Job Description.
- matchScore = Percentage fit with JD (overall alignment).
- atsScore = 0 (Not applicable here).
- techSkillMatch = Overlap on technical stack specifically requested in JD.
- strengths = JD requirements that are clearly met in the resume.
- weakAreas = Gaps in seniority, domain experience, or missing core requirements.
- missingSkills = Specific skills mentioned in JD but missing from resume.
- suggestions = Actionable steps to bridge the gap (e.g., "Add a project demonstrating AWS", "Highlight cloud experience").
- keywords = High-value JD terms absent or weak in resume.
- summary = Focus entirely on whether this candidate is ready to interview for this specific role.

Schema:
${schema}

${context}`
  }

  return `Schema:\n${schema}\n\n${context}`
}
