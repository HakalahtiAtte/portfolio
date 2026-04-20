import { skills, ui } from '../data/content'
import { useLang } from '../context/AppContext'
import styles from './Skills.module.css'

const icons = {
  'Frontend':           '⬡',
  'Performance & SEO':  '◇',
  'Accessibility':      '◎',
  'Game Dev':           '◈',
  'Design & Tools':     '◉',
  'Data & Backend':     '▦',
  'DevOps & Workflow':  '⊞',
}

export default function Skills() {
  const { lang } = useLang()
  const t = ui[lang].skills

  return (
    <section id="skills" className={styles.skills} aria-labelledby="skills-heading">
      <div className={styles.header}>
        <span className={styles.label}>{t.sectionLabel}</span>
        <h2 id="skills-heading" className={styles.heading}>{t.heading}</h2>
        <span className={styles.rule} aria-hidden="true" />
      </div>

      <div className={styles.grid}>
        {Object.entries(skills).map(([cat, items]) => (
          <div key={cat} className={styles.group}>
            <div className={styles.groupHeader}>
              <span className={styles.groupIcon} aria-hidden="true">{icons[cat] || '◇'}</span>
              <h3 className={styles.groupTitle}>{t.cats[cat] || cat}</h3>
            </div>
            <div className={styles.tags}>
              {items.map(skill => (
                <span key={skill} className={styles.tag}>{skill}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
