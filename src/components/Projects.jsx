import { useReducedMotion } from '../hooks/useReducedMotion'
import { useEffect, useRef, useState } from 'react'
import { projects, ui } from '../data/content'
import { useLang } from '../context/AppContext'
import LighthouseBadge from './LighthouseBadge'
import styles from './Projects.module.css'

const p = (obj, key, lang) => (lang === 'fi' && obj[`${key}_fi`]) ? obj[`${key}_fi`] : obj[key]

function Chevron({ open }) {
  return (
    <svg
      width="12" height="12" viewBox="0 0 12 12" fill="none"
      aria-hidden="true"
      className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
    >
      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function ProjectCard({ project, index, t, lang }) {
  const reducedMotion = useReducedMotion()
  const cardRef = useRef(null)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const el = cardRef.current
    if (reducedMotion) {
      if (el) el.style.removeProperty('--parallax-y')
      return
    }
    const onScroll = () => {
      if (!el) return
      const rect = el.getBoundingClientRect()
      const offset = (window.innerHeight - rect.top) * 0.04
      el.style.setProperty('--parallax-y', `${Math.max(0, Math.min(offset, 20))}px`)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [reducedMotion])

  return (
    <article
      ref={cardRef}
      className={`${styles.card} ${project.isGame ? styles.gameCard : ''}`}
      aria-labelledby={`proj-${project.id}`}
    >
      <div className={styles.cardInner}>
        <button
          type="button"
          className={styles.cardTop}
          onClick={() => setExpanded(v => !v)}
          aria-expanded={expanded}
          aria-label={`${expanded ? t.collapse : t.expand}: ${project.title}`}
        >
          <span className={styles.cardType}>{p(project, 'type', lang)}</span>
          <span className={styles.cardTopRight}>
            <span className={styles.cardIndex}>0{index + 1}</span>
            <Chevron open={expanded} />
          </span>
        </button>

        <h3 id={`proj-${project.id}`} className={styles.cardTitle}>{project.title}</h3>
        <span className={styles.cardRule} aria-hidden="true" />
        <p className={styles.cardSubtitle}>{p(project, 'subtitle', lang)}</p>

        {expanded && (
          <>
            <p className={styles.cardDesc}>{p(project, 'desc', lang)}</p>

            {project.highlights && (
              <ul className={styles.highlights} aria-label="Project highlights">
                {p(project, 'highlights', lang).map(h => (
                  <li key={h} className={styles.highlight}>{h}</li>
                ))}
              </ul>
            )}

            {project.lighthouse && <LighthouseBadge scores={project.lighthouse} source={project.link} />}
          </>
        )}

        <div className={styles.tags} aria-label="Technologies used">
          {project.tags.map(tag => (
            <span key={tag} className={styles.tag}>{tag}</span>
          ))}
        </div>

        <div className={styles.cardFooter}>
          <button
            className={styles.expandBtn}
            onClick={() => setExpanded(v => !v)}
            aria-expanded={expanded}
            aria-label={expanded ? t.collapse : t.expand}
          >
            <Chevron open={expanded} />
            <span className={styles.expandLabel}>{expanded ? t.collapse : t.expand}</span>
          </button>

          <div className={styles.cardLinks}>
            {project.repoLink && (
              <a href={project.repoLink} target="_blank" rel="noopener noreferrer" className={styles.cardLink}>
                {t.repo}
              </a>
            )}
            {project.link ? (
              <a href={project.link} target="_blank" rel="noopener noreferrer" className={styles.cardLink}>
                {t.viewLive}
              </a>
            ) : project.codeLink ? (
              <a href={project.codeLink} className={styles.cardLink}>
                {t.codeOnRequest}
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  )
}

export default function Projects() {
  const { lang } = useLang()
  const t = ui[lang].projects
  const featured = projects.filter(proj => proj.featured)
  const more = projects.filter(proj => !proj.featured)

  return (
    <section id="projects" className={styles.projects} aria-labelledby="projects-heading">
      <div className={styles.header}>
        <span className={styles.label}>{t.sectionLabel}</span>
        <h2 id="projects-heading" className={styles.heading}>{t.heading}</h2>
        <span className={styles.rule} aria-hidden="true" />
      </div>

      <div className={styles.grid}>
        {featured.map((proj, i) => (
          <ProjectCard key={proj.id} project={proj} index={i} t={t} lang={lang} />
        ))}
      </div>

      {more.length > 0 && (
        <>
          <div className={styles.sideHeader}>
            <span className={styles.sideLabel}>{t.moreProjects}</span>
          </div>
          <div className={styles.grid}>
            {more.map((proj, i) => (
              <ProjectCard key={proj.id} project={proj} index={i} t={t} lang={lang} />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
