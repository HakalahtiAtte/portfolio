import { useState, useEffect } from 'react'
import { meta, ui } from '../data/content'
import { useTheme, useLang } from '../context/AppContext'
import styles from './Nav.module.css'

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1"  x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22"  x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22"/>
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )
}

const NAV_HREFS = [
  { key: 'home',       href: '#hero'       },
  { key: 'about',      href: '#about'      },
  { key: 'experience', href: '#experience' },
  { key: 'projects',   href: '#projects'   },
  { key: 'skills',     href: '#skills'     },
  { key: 'contact',    href: '#contact'    },
]

export default function Nav() {
  const { theme, toggleTheme } = useTheme()
  const { lang, toggleLang }   = useLang()
  const navT = ui[lang].nav

  const [active, setActive]     = useState('hero')
  const [menuOpen, setMenu]     = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const ids = ['hero', 'about', 'experience', 'projects', 'skills', 'game', 'contact']
    const onScroll = () => {
      setScrolled(window.scrollY > 20)
      const nearBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 40
      if (nearBottom) { setActive(ids[ids.length - 1]); return }
      for (let i = ids.length - 1; i >= 0; i--) {
        const el = document.getElementById(ids[i])
        if (el && window.scrollY >= el.offsetTop - 200) { setActive(ids[i]); break }
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const close = () => setMenu(false)

  const themeLabel = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'

  return (
    <>
      {/* ── DESKTOP SIDEBAR ── */}
      <aside className={styles.sidebar} aria-label="Site navigation">
        <a href="#hero" className={styles.logo} aria-label="Home">
          <span className={styles.logoInitials}>A.H</span>
          <span className={styles.logoFull}>{meta.name}</span>
        </a>

        <nav className={styles.sideNav}>
          <ul role="list">
            {NAV_HREFS.map(({ key, href }) => {
              const id = href.replace('#', '')
              return (
                <li key={href}>
                  <a
                    href={href}
                    className={`${styles.sideLink} ${active === id ? styles.sideLinkActive : ''}`}
                  >
                    <span className={styles.sideLinkLine} aria-hidden="true" />
                    {navT[key]}
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className={styles.sideControls}>
          <button
            className={styles.langToggle}
            onClick={toggleLang}
            aria-label={lang === 'en' ? 'Switch to Finnish' : 'Vaihda englanniksi'}
            title={lang === 'en' ? 'Switch to Finnish' : 'Vaihda englanniksi'}
          >
            {lang === 'en' ? 'FI' : 'EN'}
          </button>
          <button
            className={styles.themeToggle}
            onClick={toggleTheme}
            aria-label={themeLabel}
            title={themeLabel}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>

        <div className={styles.sideBottom}>
          {meta.available && (
            <div className={styles.availBadge}>
              <span className={styles.availDot} aria-hidden="true" />
              Available
            </div>
          )}
          <a href={`mailto:${meta.email}`} className={styles.sideEmail}>
            {meta.email}
          </a>
        </div>
      </aside>

      {/* ── MOBILE TOP BAR ── */}
      <header className={`${styles.topbar} ${scrolled ? styles.topbarScrolled : ''}`}>
        <a href="#hero" className={styles.topbarLogo}>{meta.name}</a>
        <div className={styles.topbarRight}>
          <button
            className={styles.langToggle}
            onClick={toggleLang}
            aria-label={lang === 'en' ? 'Switch to Finnish' : 'Vaihda englanniksi'}
            title={lang === 'en' ? 'Switch to Finnish' : 'Vaihda englanniksi'}
          >
            {lang === 'en' ? 'FI' : 'EN'}
          </button>
          <button
            className={styles.themeToggle}
            onClick={toggleTheme}
            aria-label={themeLabel}
            title={themeLabel}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
          <button
            className={styles.burger}
            onClick={() => setMenu(v => !v)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            <span className={menuOpen ? styles.bTopOpen : styles.bTop} />
            <span className={menuOpen ? styles.bBotOpen : styles.bBot} />
          </button>
        </div>
      </header>

      {/* ── MOBILE DRAWER ── */}
      <div
        id="mobile-menu"
        className={`${styles.drawer} ${menuOpen ? styles.drawerOpen : ''}`}
        aria-hidden={!menuOpen}
        {...(!menuOpen && { inert: '' })}
      >
        <nav>
          <ul role="list">
            {NAV_HREFS.map(({ key, href }) => (
              <li key={href}>
                <a href={href} className={styles.drawerLink} onClick={close}>
                  {navT[key]}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <a
          href={`mailto:${meta.email}`}
          className={styles.drawerEmail}
          onClick={close}
        >
          {meta.email} ↗
        </a>
      </div>

      {/* Backdrop */}
      {menuOpen && (
        <div className={styles.backdrop} onClick={close} aria-hidden="true" />
      )}
    </>
  )
}
