import { useEffect, useRef, useState } from 'react'
import { meta, ui } from '../data/content'
import { useTheme, useLang } from '../context/AppContext'
import styles from './Hero.module.css'

const STACK = ['React', 'JavaScript', 'Vite', 'CSS Modules', 'Unity']

// ── LIGHTHOUSE CARD ───────────────────────────────────────
const SCORES = [
  { label: 'Performance',    value: 100 },
  { label: 'Accessibility',  value: 100 },
  { label: 'Best Practices', value: 100 },
  { label: 'SEO',            value: 100 },
]
const RING_R    = 7
const RING_CIRC = 2 * Math.PI * RING_R
const ROW_CY    = [63, 85, 107, 129]

function LighthouseCard() {
  const { theme } = useTheme()
  const ref = useRef(null)
  const pos = useRef({ x: 0, y: 0 })
  const vel = useRef({ x: 0, y: 0 })
  const dragging = useRef(false)
  const last = useRef({ x: 0, y: 0 })
  const origin = useRef({ x: 0, y: 0 })
  const rafRef = useRef(null)
  const [hint, setHint] = useState(true)

  const c = theme === 'dark' ? {
    body:       '#1a1b1a',
    stroke:     '#3a3b3a',
    divider:    '#2e2f2e',
    textHead:   '#737373',
    textUrl:    '#4a4a4a',
    textScore:  '#c5c5c5',
    textLabel:  '#555555',
    ringTrack:  '#222423',
    ringAmber:  '#d97706',
    ringGreen:  '#16a34a',
    dot:        '#16a34a',
  } : {
    body:       '#e8e9e7',
    stroke:     '#c4c5c3',
    divider:    '#d4d5d3',
    textHead:   '#7a7a7a',
    textUrl:    '#aaaaaa',
    textScore:  '#2a2a2a',
    textLabel:  '#888888',
    ringTrack:  '#d0d1cf',
    ringAmber:  '#d97706',
    ringGreen:  '#16a34a',
    dot:        '#16a34a',
  }

  useEffect(() => {
    const el = ref.current
    if (!el) return

    function settle() {
      if (dragging.current) return
      vel.current.x *= 0.88
      vel.current.y *= 0.88
      const dx = origin.current.x - pos.current.x
      const dy = origin.current.y - pos.current.y
      vel.current.x += dx * 0.04
      vel.current.y += dy * 0.04
      pos.current.x += vel.current.x
      pos.current.y += vel.current.y
      el.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`
      const speed = Math.abs(vel.current.x) + Math.abs(vel.current.y)
      if (speed > 0.1 || Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
        rafRef.current = requestAnimationFrame(settle)
      }
    }

    function onDown(e) {
      dragging.current = true
      setHint(false)
      const client = e.touches ? e.touches[0] : e
      last.current = { x: client.clientX, y: client.clientY }
      el.style.cursor = 'grabbing'
      el.style.userSelect = 'none'
      el.style.transition = 'none'
      cancelAnimationFrame(rafRef.current)
      e.preventDefault()
    }

    function onMove(e) {
      if (!dragging.current) return
      const client = e.touches ? e.touches[0] : e
      const dx = client.clientX - last.current.x
      const dy = client.clientY - last.current.y
      vel.current = { x: dx, y: dy }
      pos.current.x += dx
      pos.current.y += dy
      last.current = { x: client.clientX, y: client.clientY }
      el.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`
      e.preventDefault()
    }

    function onUp() {
      if (!dragging.current) return
      dragging.current = false
      el.style.cursor = 'grab'
      rafRef.current = requestAnimationFrame(settle)
    }

    el.addEventListener('mousedown',  onDown, { passive: false })
    el.addEventListener('touchstart', onDown, { passive: false })
    window.addEventListener('mousemove', onMove)
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchend', onUp)

    return () => {
      el.removeEventListener('mousedown',  onDown)
      el.removeEventListener('touchstart', onDown)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchend', onUp)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div ref={ref} className={styles.cassetteOuter} aria-hidden="true" style={{ pointerEvents: 'auto' }}>
      <div className={styles.cassetteInner}>
        <svg width="210" height="148" viewBox="0 0 210 148" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Card */}
          <rect x="1" y="1" width="208" height="146" rx="8" fill={c.body} stroke={c.stroke} strokeWidth="1.5"/>

          {/* Live dot + header */}
          <circle cx="20" cy="20" r="3" fill={c.dot}/>
          <text x="30" y="23" fill={c.textScore} fontSize="9" fontFamily="'DM Mono', monospace" letterSpacing="3">LIGHTHOUSE</text>
          <text x="30" y="35" fill={c.textScore} fontSize="7" fontFamily="'DM Mono', monospace" letterSpacing="1.5">attehakalahti.fi</text>

          {/* Divider */}
          <line x1="16" y1="44" x2="194" y2="44" stroke={c.divider} strokeWidth="0.5"/>

          {/* Score rows */}
          {SCORES.map(({ label, value }, i) => {
            const cy   = ROW_CY[i]
            const cx   = 30
            const dash = (value / 100) * RING_CIRC
            const color = value >= 90 ? c.ringGreen : c.ringAmber
            return (
              <g key={label}>
                <circle cx={cx} cy={cy} r={RING_R} stroke={c.ringTrack} strokeWidth="2" fill="none"/>
                <circle
                  cx={cx} cy={cy} r={RING_R}
                  stroke={color} strokeWidth="2" fill="none"
                  strokeDasharray={`${dash} ${RING_CIRC}`}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${cx} ${cy})`}
                />
                <text x="58" y={cy + 3} textAnchor="end" fill={c.textScore} fontSize="10" fontFamily="'DM Mono', monospace" fontWeight="500">{value}</text>
                <text x="64" y={cy + 3} fill={c.textScore} fontSize="8.5" fontFamily="'DM Mono', monospace" fontWeight="500" letterSpacing="0.5">{label}</text>
              </g>
            )
          })}

          {/* Corner screws */}
          {[[10,10],[200,10],[10,138],[200,138]].map(([x,y]) => (
            <circle key={`${x}${y}`} cx={x} cy={y} r="2" fill={c.body} stroke={c.divider} strokeWidth="0.5"/>
          ))}
        </svg>

        {hint && <div className={styles.cassetteHint}>drag me</div>}
      </div>
    </div>
  )
}

// ── SCROLL INDICATOR ──────────────────────────────────────
function ScrollIndicator() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const onScroll = () => { if (window.scrollY > 40) setVisible(false) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null
  return (
    <a href="#about" className={styles.scrollIndicator} aria-label="Scroll down">
      <span className={styles.scrollChevron} aria-hidden="true" />
    </a>
  )
}

// ── HERO ──────────────────────────────────────────────────
export default function Hero() {
  const parallaxRef = useRef(null)
  const { lang } = useLang()
  const t = ui[lang].hero

  useEffect(() => {
    const el = parallaxRef.current
    const onScroll = () => {
      if (!el) return
      el.style.transform = `translateY(${window.scrollY * 0.3}px)`
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section className={styles.hero} id="hero" aria-label="Introduction">

      <div ref={parallaxRef} className={styles.parallaxBg} aria-hidden="true">
        <div className={styles.grid} />
        <div className={styles.vline} />
      </div>

      <div className={styles.content}>
        <div className={styles.badge}>
          <span className={styles.dot} aria-hidden="true" />
          {meta.available ? t.available : t.unavailable}
        </div>

        <h1 className={styles.name}>
          <span className={styles.nameFirst}>Atte</span>
          <span className={styles.nameLast}>Hakalahti</span>
        </h1>

        <div className={styles.rule} aria-hidden="true" />

        <p className={styles.title}>{lang === 'fi' ? meta.title_fi : meta.title}</p>
        <p className={styles.tagline}>{t.tagline}</p>

        <div className={styles.stack} aria-label="Tech stack">
          {STACK.map((t, i) => (
            <span key={t} className={styles.stackPill}>
              {t}{i < STACK.length - 1 && <span className={styles.stackDot} aria-hidden="true">·</span>}
            </span>
          ))}
        </div>

        <div className={styles.ctas}>
          <a href="#projects" className="btn-primary">{t.viewWork}</a>
          <a href={`mailto:${meta.email}`} className="btn-outline">{t.getInTouch}</a>
        </div>

        <div className={styles.metaRow}>
          <span className={styles.metaItem}>{lang === 'fi' ? meta.location_fi : meta.location}</span>
          <span className={styles.metaDivider} aria-hidden="true">·</span>
          <span className={styles.metaItem}>{t.openToRemote}</span>
          <span className={styles.metaDivider} aria-hidden="true">·</span>
          <a href={meta.github} className={styles.metaItem} target="_blank" rel="noreferrer">GitHub</a>
        </div>
      </div>

      <LighthouseCard />
      <ScrollIndicator />
    </section>
  )
}
