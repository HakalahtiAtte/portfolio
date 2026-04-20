import { useEffect, useRef } from 'react'
import { projects, ui } from '../data/content'
import { useLang } from '../context/AppContext'
import LighthouseBadge from './LighthouseBadge'
import styles from './Projects.module.css'

const p = (obj, key, lang) => (lang === 'fi' && obj[`${key}_fi`]) ? obj[`${key}_fi`] : obj[key]

function ProjectCard({ project, index, t, lang }) {
  const cardRef = useRef(null)

  useEffect(() => {
    const el = cardRef.current
    const onScroll = () => {
      if (!el) return
      const rect = el.getBoundingClientRect()
      const offset = (window.innerHeight - rect.top) * 0.04
      el.style.setProperty('--parallax-y', `${Math.max(0, Math.min(offset, 20))}px`)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <article
      ref={cardRef}
      className={`${styles.card} ${project.isGame ? styles.gameCard : ''}`}
      aria-labelledby={`proj-${project.id}`}
    >
      <div className={styles.cardInner}>
        <div className={styles.cardTop}>
          <span className={styles.cardType}>{p(project, 'type', lang)}</span>
          <span className={styles.cardIndex} aria-hidden="true">0{index + 1}</span>
        </div>

        <h3 id={`proj-${project.id}`} className={styles.cardTitle}>{project.title}</h3>
        <span className={styles.cardRule} aria-hidden="true" />
        <p className={styles.cardSubtitle}>{p(project, 'subtitle', lang)}</p>
        <p className={styles.cardDesc}>{p(project, 'desc', lang)}</p>

        {project.highlights && (
          <ul className={styles.highlights} aria-label="Project highlights">
            {p(project, 'highlights', lang).map(h => (
              <li key={h} className={styles.highlight}>{h}</li>
            ))}
          </ul>
        )}

        {project.lighthouse && <LighthouseBadge scores={project.lighthouse} source={project.link} />}

        <div className={styles.tags} aria-label="Technologies used">
          {project.tags.map(tag => (
            <span key={tag} className={styles.tag}>{tag}</span>
          ))}
        </div>

        <div className={styles.cardFooter}>
          {project.link ? (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.cardLink}
            >
              {t.viewLive}
            </a>
          ) : (
            <span className={styles.cardLinkDisabled}>{t.codeOnRequest}</span>
          )}
        </div>
      </div>
    </article>
  )
}

export default function Projects() {
  const { lang } = useLang()
  const t = ui[lang].projects
  const work = projects.filter(proj => proj.group === 'work')
  const side = projects.filter(proj => proj.group === 'side')

  return (
    <section id="projects" className={styles.projects} aria-labelledby="projects-heading">
      <div className={styles.header}>
        <span className={styles.label}>{t.sectionLabel}</span>
        <h2 id="projects-heading" className={styles.heading}>{t.heading}</h2>
        <span className={styles.rule} aria-hidden="true" />
      </div>

      <div className={styles.grid}>
        {work.map((proj, i) => (
          <ProjectCard key={proj.id} project={proj} index={i} t={t} lang={lang} />
        ))}
      </div>

      {side.length > 0 && (
        <>
          <div className={styles.sideHeader}>
            <span className={styles.sideLabel}>{lang === 'fi' ? 'Sivuprojektit' : 'Side projects'}</span>
          </div>
          <div className={styles.grid}>
            {side.map((proj, i) => (
              <ProjectCard key={proj.id} project={proj} index={i} t={t} lang={lang} />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
