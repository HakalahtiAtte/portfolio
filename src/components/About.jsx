import { useEffect, useRef } from 'react'
import { education, education_fi, languages, certs, ui } from '../data/content'
import { useLang } from '../context/AppContext'
import styles from './About.module.css'

export default function About() {
  const parallaxRef = useRef(null)
  const { lang } = useLang()
  const t = ui[lang].about
  const edu = lang === 'fi' ? education_fi : education

  useEffect(() => {
    const el = parallaxRef.current
    const onScroll = () => {
      if (!el) return
      const rect = el.closest('section').getBoundingClientRect()
      const offset = -rect.top * 0.15
      el.style.transform = `translateY(${offset}px)`
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section id="about" className={styles.about} aria-labelledby="about-heading">

      <div ref={parallaxRef} className={styles.parallaxBlock} aria-hidden="true" />

      <div className={styles.inner}>
        <div className={styles.header}>
          <span className={styles.label}>{t.sectionLabel}</span>
          <h2 id="about-heading" className={styles.heading}>{t.heading}</h2>
          <span className={styles.rule} aria-hidden="true" />
        </div>

        <div className={styles.grid}>
          <div className={styles.bio}>
            <p>{t.bio1}</p>
            <p>{t.bio2}</p>
            <p>{t.bio3}</p>

            <div className={styles.aboutCols}>
              <div>
                <h3 className={styles.colTitle}>{t.aboutMeTitle}</h3>
                <p className={styles.colText}>{t.aboutMeText}</p>
              </div>
              <div>
                <h3 className={styles.colTitle}>{t.aboutWorkTitle}</h3>
                <p className={styles.colText}>{t.aboutWorkText}</p>
              </div>
            </div>
          </div>

          <div className={styles.sidebar}>
            <div className={styles.card}>
              <h3 className={styles.cardLabel}>{t.educationLabel}</h3>
              <p className={styles.cardMain}>{edu.degree}</p>
              <p className={styles.cardSub}>{edu.field}</p>
              <p className={styles.cardMeta}>{edu.school} · {edu.graduated}</p>
              <div className={styles.thesis}>
                <span className={styles.thesisLabel}>{t.thesisLabel}</span>
                <a href={edu.thesisLink} className={styles.thesisTitle} target="_blank" rel="noreferrer">{edu.thesis} ↗</a>
              </div>
            </div>

            <div className={styles.card}>
              <h3 className={styles.cardLabel}>{t.languagesLabel}</h3>
              <div className={styles.langList}>
                {languages.map((l) => (
                  <div key={l.lang} className={styles.langRow}>
                    <span className={styles.langName}>{lang === 'fi' ? l.lang_fi : l.lang}</span>
                    <span className={styles.langLevel}>{lang === 'fi' ? l.level_fi : l.level}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.card}>
              <h3 className={styles.cardLabel}>{t.certsLabel}</h3>
              <ul className={styles.certList}>
                {certs.map((c, i) => (
                  <li key={c} className={styles.certItem}>
                    <span className={styles.certNum}>0{i + 1}.</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
