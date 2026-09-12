import { useState, useEffect } from 'react'

export function useAnalysis() {
  const [count, setCount] = useState(0)
  const [lastAts, setLastAts] = useState(null)

  useEffect(() => {
    setCount(parseInt(localStorage.getItem(`rai_count_guest`) || '0'))
    setLastAts(localStorage.getItem(`rai_ats_guest`) || null)
  }, [])

  const recordAnalysis = (atsScore) => {
    const newCount = count + 1
    setCount(newCount)
    localStorage.setItem(`rai_count_guest`, newCount.toString())
    if (atsScore != null) {
      const label = `${atsScore}%`
      setLastAts(label)
      localStorage.setItem(`rai_ats_guest`, label)
    }
  }

  return { count, lastAts, recordAnalysis }
}
