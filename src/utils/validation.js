function normalizeText(input) {
  return (input || '').replace(/\s+/g, ' ').trim()
}

function tokenize(text) {
  return normalizeText(text)
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/i)
    .filter(Boolean)
}

function uniqueWordCount(text) {
  return new Set(tokenize(text)).size
}

/** Repeated same token (e.g. "hello hello hello") or characters (e.g. "aaaaa") */
export function isDominantRepetition(text) {
  if (!text) return false
  const t = text.trim()
  
  // Single char repeated 4+ times
  if (/^(.)\1{3,}$/i.test(t)) return true
  // Short pattern repeated (e.g. abcabcabc)
  if (/^(.{2,4})\1{2,}$/i.test(t)) return true

  const tokens = tokenize(text)
  if (tokens.length < 4) return false
  const counts = {}
  for (const token of tokens) {
    counts[token] = (counts[token] || 0) + 1
  }
  const max = Math.max(...Object.values(counts))
  return max / tokens.length > 0.45
}

/** Looks like keyboard mashing: many long nonsense tokens or no vowels */
export function looksLikeKeyboardSpam(text) {
  if (!text) return false
  const t = text.trim()
  
  // Single word keyboard mash (no vowels, long)
  if (t.length >= 6 && !/[aeiouy]/i.test(t)) return true

  const tokens = tokenize(text)
  if (tokens.length === 0) return true
  const suspicious = tokens.filter(tok => tok.length >= 8 && !/[aeiouy]/i.test(tok)).length
  return suspicious / tokens.length > 0.35 && tokens.length >= 2
}

/**
 * Checks if a short user input looks like spam/keyboard mash.
 * - Allows genuine uppercase acronyms ≤4 chars (IIT, MIT, VIT, SRM, UCLA)
 * - Rejects all-same-char strings
 * - Rejects 3+ char strings with zero vowels (dcd, sxsa, bcdf)
 * - Rejects dominant repetition
 */
export function isSpamInput(text) {
  if (!text) return false
  const t = text.trim()
  if (t.length < 2) return true

  // All same characters: aaaa, dddd, 1111
  if (/^(.)\1+$/i.test(t)) return true

  // Allow known-pattern uppercase acronyms ≤4 chars: IIT, MIT, VIT, SRM, UCLA, NIT
  if (t.length <= 4 && /^[A-Z0-9]+$/.test(t)) return false

  // No vowels at all in 3+ char strings = keyboard spam (dcd, sxsa, bcdf, qwrt)
  if (t.length >= 3 && !/[aeiouy]/i.test(t)) return true

  return isDominantRepetition(t)
}

/**
 * Weak signal but still "content" — not spam.
 * Beginner resumes often lack traditional section headers.
 */
function hasResumeLikeSignals(text) {
  const t = text.toLowerCase()
  const blobSignals = [
    /\b(react|vue|angular|node|javascript|typescript|python|java|sql|tailwind|css|html)\b/i.test(t),
    /\b(intern|internship|freelance|freelancer|student|university|college|bootcamp)\b/i.test(t),
    /\b(project|portfolio|github|website|app|built|developed)\b/i.test(t),
    /\b(skill|experience|education|summary|objective|work)\b/i.test(t),
    /\b(engineer|developer|designer|analyst)\b/i.test(t),
    /@/.test(t),
    /\b(20\d{2}|19\d{2})\b/.test(t),
    /\b(work|employment|job|role|company|employer|created|managed|responsible|assisted)\b/i.test(t),
  ]
  return blobSignals.filter(Boolean).length >= 1
}

function hasJobLikeSignals(text) {
  const t = text.toLowerCase()
  const blobSignals = [
    /\b(intern|internship|full[\s-]?time|part[\s-]?time|contract|remote|hybrid|on[\s-]?site)\b/i.test(t),
    /\b(requirement(s)?|responsibilit(y|ies)|qualification(s)?|experience|must have|nice to have|preferred|proficient)\b/i.test(t),
    /\b(we are|you will|looking for|join (our|the) team|apply)\b/i.test(t),
    /\b(skills|degree|bachelor|master|role|duties|description|benefits|salary|compensation)\b/i.test(t)
  ]
  return blobSignals.filter(Boolean).length >= 1
}

function isJunkOrSpam(text) {
  const t = normalizeText(text)
  if (!t.length) return true
  // Single token junk
  if (/^[a-z]$/i.test(t) && t.length <= 2) return true
  const tokens = tokenize(t)

  if (tokens.length <= 1 && t.length < 25) return true
  if (isDominantRepetition(t)) return true
  if (looksLikeKeyboardSpam(t)) return true

  const uniq = uniqueWordCount(t)
  // Very low variety relative to length — likely spam or nonsense
  if (t.length > 120 && uniq < 4) return true
  if (t.length > 40 && uniq <= 2) return true

  return false
}

const MIN_RESUME_CHARS = 80
const MIN_RESUME_CHARS_WITH_SIGNALS = 45
const MIN_JD_CHARS = 80
const MIN_JD_CHARS_WITH_SIGNALS = 45

export function validateAnalysisInputs({ resumeText, jdText, needsJD }) {
  const resume = normalizeText(resumeText)
  const jd = normalizeText(jdText)

  if (!resume.length) {
    return { ok: false, message: 'Please upload a valid resume' }
  }

  if (isJunkOrSpam(resume)) {
    return { ok: false, message: 'Insufficient content for analysis' }
  }

  const resumeLongEnough =
    resume.length >= MIN_RESUME_CHARS ||
    (resume.length >= MIN_RESUME_CHARS_WITH_SIGNALS && hasResumeLikeSignals(resume))

  if (!resumeLongEnough) {
    return { ok: false, message: 'Insufficient content for analysis' }
  }

  if (needsJD) {
    if (!jd.length) {
      return { ok: false, message: 'Please provide a job description' }
    }
    if (isJunkOrSpam(jd)) {
      return { ok: false, message: 'Job description content is invalid or too short' }
    }
    
    if (!hasJobLikeSignals(jd)) {
      return { ok: false, message: 'Please provide a valid job description. The pasted text does not appear to be a real job posting.' }
    }

    if (jd.length < MIN_JD_CHARS) {
      return { ok: false, message: 'Job description is too short to provide accurate matching' }
    }
  }

  return { ok: true }
}
