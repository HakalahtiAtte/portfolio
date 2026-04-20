import { meta } from '../data/content'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.inner}>
        <span className={styles.name}>Atte Hakalahti</span>
        <span className={styles.copy}>© {new Date().getFullYear()} · {meta.domain}</span>
        <div className={styles.right}>
          <span className={styles.built}>React + Vite</span>
          <a href={meta.github} target="_blank" rel="noopener noreferrer" className={styles.link}>GitHub ↗</a>
          <a href={meta.linkedin} target="_blank" rel="noopener noreferrer" className={styles.link}>LinkedIn ↗</a>
        </div>
      </div>
    </footer>
  )
}
