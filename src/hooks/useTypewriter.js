import { useState, useEffect, useRef } from 'react'

const ERASE_MS = 14  // ms per character when backspacing
const TYPE_MS  = 22  // ms per character when typing

export function useTypewriter(text) {
  const [displayed, setDisplayed] = useState(text)
  const [animating, setAnimating] = useState(false)
  const r = useRef({ cur: text, target: text, timer: null })

  useEffect(() => {
    if (text === r.current.target) return
    r.current.target = text
    clearTimeout(r.current.timer)
    setAnimating(true)

    function tick() {
      const cur = r.current.cur
      const tgt = r.current.target
      if (cur === tgt) {
        setAnimating(false)
        return
      }

      let next, delay

      // If current text is not a prefix of the target, keep erasing
      if (cur.length > 0 && cur !== tgt.slice(0, cur.length)) {
        next  = cur.slice(0, -1)
        delay = ERASE_MS
      } else {
        // Current is a valid prefix (or empty) — type the next character
        next  = tgt.slice(0, cur.length + 1)
        delay = TYPE_MS
      }

      r.current.cur = next
      setDisplayed(next)
      if (next !== tgt) r.current.timer = setTimeout(tick, delay)
      else setAnimating(false)
    }

    tick()
    return () => clearTimeout(r.current.timer)
  }, [text])

  // Return a non-breaking space instead of empty string so the element
  // never collapses to zero height during the erase phase.
  // Also return animating flag so callers can apply white-space: nowrap
  // to prevent height changes from line-wrap toggling mid-animation.
  return [displayed || '\u00A0', animating]
}
