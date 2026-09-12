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

const KNOWN_VALID_TERMS = new Set([
  'c', 'r', 'go', 'ai', 'ml', 'ui', 'ux', 'qa', 'hr', 'pr',
  'c++', 'c#', 'f#', '.net', 'sql', 'css', 'php', 'npm', 'sdk', 'api', 'cli', 'xml', 'gui',
  'srm', 'vit', 'iit', 'nit', 'mit', 'bits', 'iiit', 'ucla', 'nyu', 'cmu', 'harvard',
  'tcs', 'hcl', 'pwc', 'kpmg', 'ey', 'ibm', 'amd', 'bmw', 'bhel', 'isro', 'drdo', 'tata',
  'b.tech', 'm.tech', 'b.e.', 'm.e.', 'b.s.', 'm.s.', 'bca', 'mca', 'b.sc', 'm.sc', 'ph.d', 'ph.d.', 'mba',
  'sync', 'crypt', 'lynx', 'rhythm', 'dry', 'fly', 'sky'
])

const PROFANITY_REGEX = /\b(fuck|fucker|fucking|shit|bullshit|bitch|bastard|asshole|cunt|dick|pussy|whore|slut|nigger|nigga|faggot|retard|motherfucker|wanker)\b/i

const KEYBOARD_WALKS = [
  'asdf', 'sdfg', 'dfgh', 'fghj', 'ghjk', 'hjkl', 'lkjh', 'kjhg', 'jhgf', 'hgfd', 'gfds', 'fdsa',
  'qwer', 'wert', 'erty', 'rtyu', 'tyui', 'yuio', 'uiop', 'poiuy', 'oiuy', 'iuyt', 'uytr', 'ytre', 'trew', 'rewq',
  'zxcv', 'xcvb', 'cvbn', 'vbnm', 'mnbv', 'nbvc', 'bvcx', 'vcxz',
  'qazw', 'wsxe', 'edcr', 'rfvt', 'tgby', 'yhn', 'ujm',
  '1234', '2345', '3456', '4567', '5678', '6789', '7890', '4321', '5432', '6543', '7654', '8765'
]

// Impossible word-starting consonant pairs in English / typical names
const IMPOSSIBLE_START_CONSONANTS = /^(fg|jh|hg|gf|fd|df|jk|zx|xc|cv|vb|bn|qw|zq)/i

function hasKeyboardWalk(text) {
  const lower = text.toLowerCase()
  return KEYBOARD_WALKS.some(walk => lower.includes(walk))
}

function hasRepeatedSubstrings(text) {
  const t = text.toLowerCase().replace(/[^a-z0-9]/g, '')
  if (t.length < 5) return false
  // Check for repeated 3-char chunks (e.g. "uhd" in "fguhdiuhd")
  for (let i = 0; i <= t.length - 6; i++) {
    const chunk = t.slice(i, i + 3)
    const rest = t.slice(i + 3)
    if (rest.includes(chunk)) {
      if (!/^[aeiou]{3}$/.test(chunk)) {
        return true
      }
    }
  }
  return false
}

/** Repeated same token (e.g. "hello hello hello") or characters (e.g. "aaaaa") */
export function isDominantRepetition(text) {
  if (!text) return false
  const t = text.trim()
  
  if (/^(.)\1{3,}$/i.test(t)) return true
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
  if (hasKeyboardWalk(t)) return true
  if (hasRepeatedSubstrings(t)) return true
  if (/[bcdfghjklmnpqrstvwxyz]{5,}/i.test(t)) return true

  if (t.length >= 6 && !/[aeiouy]/i.test(t)) return true

  const tokens = tokenize(text)
  if (tokens.length === 0) return true
  const suspicious = tokens.filter(tok => tok.length >= 8 && !/[aeiouy]/i.test(tok)).length
  return suspicious / tokens.length > 0.35 && tokens.length >= 2
}

/**
 * Checks if a short user input looks like spam/keyboard mash/profanity.
 * - Allows genuine tech/programming terms (C, C++, C#, R, Go, SQL, CSS, PHP)
 * - Allows genuine institutions and acronyms case-insensitively (IIT, VIT, SRM, TCS, HCL, PwC, EY, KPMG)
 * - Allows degree patterns (B.Tech, M.S., Ph.D)
 * - Rejects profanity / curse words
 * - Rejects repeated characters and syllables
 * - Rejects keyboard walks (asdfgh, qwert, zxcv)
 * - Rejects home-row mashing (fguhdiuhd) and consonant clusters
 */
export function isSpamInput(text) {
  if (!text) return false
  const raw = text.trim()
  const lower = raw.toLowerCase()

  // 1. Explicitly allow known programming languages, tech acronyms, institutes & degrees
  if (KNOWN_VALID_TERMS.has(lower) || KNOWN_VALID_TERMS.has(raw)) return false

  // Allow clean degree patterns: B.Tech, M.S., Ph.D, etc.
  if (/^[a-zA-Z]\.([a-zA-Z]+\.?)+$/.test(raw)) return false

  // Profanity filter
  if (PROFANITY_REGEX.test(raw)) return true

  // Single character check (already handled 'c' and 'r' above)
  if (raw.length < 2) return true

  // All same character: aaaa, 1111, zzzz
  if (/^(.)\1+$/i.test(raw)) return true

  // Any character repeated 4+ times consecutively: "aaaa", "zzzz"
  if (/(.)\1{3,}/i.test(raw)) return true

  // 4+ char chunk repeated (e.g. asdfasdf, abcdabcd)
  if (/^(.{4,})\1+$/i.test(raw)) return true

  // Short 2-3 char chunk repeated 3+ times (e.g. hahaha, bababa, tatatata, abcabcabc)
  if (/^(.{2,3})\1{2,}$/i.test(raw)) return true

  // 3-char chunk with no vowels repeated (e.g. xyzxyz)
  const match2 = /^(.{3})\1+$/i.exec(raw)
  if (match2 && !/[aeiouy]/i.test(match2[1])) return true

  // Keyboard walks: asdfgh, qwert, zxcv, etc.
  if (hasKeyboardWalk(raw)) return true

  // Impossible initial consonants (e.g. "fguhdiuhd" starts with "fg")
  if (IMPOSSIBLE_START_CONSONANTS.test(lower)) return true

  // Repeated 3+ char substrings in a single word (e.g. "uhd" in "fguhdiuhd")
  if (hasRepeatedSubstrings(raw)) return true

  // 5+ consecutive consonants (unpronounceable consonant mash e.g. xyzqwr, rthkl)
  if (/[bcdfghjklmnpqrstvwxyz]{5,}/i.test(raw)) return true

  // Allow genuine uppercase acronyms (IIT, MIT, VIT, UCLA, AWS, etc.)
  if (raw.length <= 5 && /^[A-Z0-9+#.]+$/.test(raw)) return false

  // If word has no true vowels [aeiou] and is not in known dictionary
  if (!raw.includes(' ') && raw.length >= 4 && !/[aeiou]/i.test(raw)) return true

  // If 3-char word has no vowels at all: e.g. dcd, bcd
  if (!raw.includes(' ') && raw.length >= 3 && !/[aeiouy]/i.test(raw)) return true

  return false
}

/**
 * Checks an entire phrase or sentence: checks both whole string and individual words.
 */
export function isSpamPhrase(text) {
  if (!text) return false
  const trimmed = text.trim()
  if (isSpamInput(trimmed)) return true

  // Check individual tokens
  const words = trimmed.split(/\s+/).filter(w => w.length >= 2)
  for (const word of words) {
    if (isSpamInput(word)) return true
  }
  return false
}



/**
 * Checks if a full document (resume text or job description) is pure junk/spam:
 * - Empty or near-empty (< 20 chars or < 3 words)
 * - Has no vowels at all (random consonants/symbols)
 * - Single word/character repeating over and over (e.g. "aaaaa" or "spam spam spam")
 * - Unnaturally low vocabulary variety (e.g. 200 chars but only 2 unique words)
 */
export function isDocumentSpam(text) {
  const t = normalizeText(text)
  if (!t || t.length < 20) return true

  const tokens = tokenize(t)
  if (tokens.length < 3) return true

  // If text is 20+ chars but has ZERO vowels, it's unpronounceable gibberish
  if (!/[aeiou]/i.test(t)) return true

  // Dominant repetition (e.g. same word/character repeated overwhelmingly)
  if (isDominantRepetition(t)) return true

  // Very low vocabulary variety for its length
  const uniq = uniqueWordCount(t)
  if (t.length > 80 && uniq < 3) return true
  if (t.length > 200 && uniq < 5) return true

  return false
}

export function validateAnalysisInputs({ resumeText, jdText, needsJD }) {
  const resume = normalizeText(resumeText)

  // 1. Resume validation
  if (!resume || resume.length === 0) {
    return { ok: false, message: 'Please upload a PDF containing readable text.' }
  }

  if (resume.length < 30 || tokenize(resume).length < 4) {
    return { ok: false, message: 'The uploaded resume is too short for analysis. Please upload a complete resume.' }
  }

  if (isDocumentSpam(resume)) {
    return { ok: false, message: 'The uploaded resume does not contain enough recognizable content for analysis.' }
  }

  // 2. Job description validation (only for JD Match tool)
  if (needsJD) {
    const jd = normalizeText(jdText)

    if (!jd || jd.length === 0) {
      return { ok: false, message: 'Please paste the target job description to continue.' }
    }

    if (jd.length < 25 || tokenize(jd).length < 3) {
      return { ok: false, message: 'The job description is too short. Please provide a more detailed job posting.' }
    }

    if (isDocumentSpam(jd)) {
      return { ok: false, message: 'The job description does not appear to contain valid text. Please paste a real job posting.' }
    }
  }

  return { ok: true }
}
