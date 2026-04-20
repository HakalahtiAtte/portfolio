import { experience, ui } from '../data/content'
import { useLang } from '../context/AppContext'
import styles from './Experience.module.css'

export default function Experience() {
  const { lang } = useLang()
  const t = ui[lang].experience
  const p = (obj, key) => (lang === 'fi' && obj[`${key}_fi`]) ? obj[`${key}_fi`] : obj[key]

  return (
    <section id="experience" className={styles.experience} aria-labelledby="experience-heading">
      <div className={styles.header}>
        <span className={styles.label}>{t.sectionLabel}</span>
        <h2 id="experience-heading" className={styles.heading}>{t.heading}</h2>
        <span className={styles.rule} aria-hidden="true" />
      </div>

      <div className={styles.timeline}>
        {experience.map((entry, i) => (
          <article key={entry.id} className={styles.entry}>
            <div className={styles.entryLeft}>
              <span className={styles.period}>{p(entry, 'period')}</span>
              <span className={styles.company}>{p(entry, 'company')}</span>
              <span className={styles.entryType}>{p(entry, 'type')}</span>
            </div>

            <div className={styles.connector} aria-hidden="true">
              <span className={styles.dot} />
              {i < experience.length - 1 && <span className={styles.line} />}
            </div>

            <div className={styles.entryRight}>
              <h3 className={styles.role}>{p(entry, 'role')}</h3>
              <p className={styles.desc}>{p(entry, 'desc')}</p>
              <ul className={styles.highlights} aria-label="Responsibilities and achievements">
                {p(entry, 'highlights').map((h, j) => (
                  <li key={j} className={styles.highlight}>{h}</li>
                ))}
              </ul>
              <div className={styles.tags} aria-label="Technologies used">
                {entry.tags.map(tag => (
                  <span key={tag} className={styles.tag}>{tag}</span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
