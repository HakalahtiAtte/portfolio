import { meta, ui } from '../data/content'
import { useLang } from '../context/AppContext'
import styles from './Contact.module.css'

export default function Contact() {
  const { lang } = useLang()
  const t = ui[lang].contact

  const links = [
    { label: 'Email',    value: meta.email,                                              href: `mailto:${meta.email}`, desc: t.emailDesc    },
    { label: 'GitHub',   value: meta.github.replace('https://', ''),                    href: meta.github,            desc: t.githubDesc   },
    { label: 'LinkedIn', value: meta.linkedin.replace('https://', '').replace(/\/$/, ''), href: meta.linkedin,        desc: t.linkedinDesc },
    { label: 'Website',  value: meta.domain,                                             href: `https://${meta.domain}`, desc: t.websiteDesc },
  ]

  return (
    <section id="contact" className={styles.contact} aria-labelledby="contact-heading">
      <div className={styles.inner}>
        <div className={styles.left}>
          <span className={styles.label}>{t.sectionLabel}</span>
          <h2 id="contact-heading" className={styles.heading}>
            {t.heading}<br />
            <span className={styles.headingOutline}>{t.headingOutline}</span>
          </h2>
          <span className={styles.rule} aria-hidden="true" />
          <p className={styles.body}>{t.body}</p>
          <a href={`mailto:${meta.email}`} className="btn-primary">
            {t.sendMessage}
          </a>
        </div>

        <div className={styles.right}>
          <div className={styles.linkList} role="list">
            {links.map(({ label, value, href, desc }, i) => (
              <a
                key={label}
                href={href}
                className={styles.linkRow}
                target={href.startsWith('mailto') ? undefined : '_blank'}
                rel={href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                role="listitem"
              >
                <span className={styles.linkNum} aria-hidden="true">0{i + 1}.</span>
                <span className={styles.linkMid}>
                  <span className={styles.linkLabel}>{label}</span>
                  <span className={styles.linkDesc}>{desc}</span>
                </span>
                <span className={styles.linkValue}>{value}</span>
                <span className={styles.linkArrow} aria-hidden="true">↗</span>
              </a>
            ))}
          </div>

          <div className={styles.avail}>
            <span className={styles.availDot} aria-hidden="true" />
            <span>{t.available}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
