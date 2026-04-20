import styles from './LighthouseBadge.module.css'

function Ring({ value, size = 48 }) {
  const r = (size - 6) / 2
  const circ = 2 * Math.PI * r
  const dash = (value / 100) * circ
  const color = value === 100 ? '#fbfbfb' : '#c5c5c5'

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(251,251,251,0.08)" strokeWidth="3.5" />
      <circle
        cx={size/2} cy={size/2} r={r}
        fill="none" stroke={color} strokeWidth="3.5"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
      />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle"
        fill={color} fontSize="11" fontFamily="'DM Mono',monospace" fontWeight="400">
        {value}
      </text>
    </svg>
  )
}

export default function LighthouseBadge({ scores, source }) {
  const scoreData = [
    { label: 'Performance',    value: scores.perf   },
    { label: 'Accessibility',  value: scores.access },
    { label: 'Best Practices', value: scores.best   },
    { label: 'SEO',            value: scores.seo    },
  ]

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.title}>Lighthouse Audit</span>
        {source && <span className={styles.source}>{source.replace(/^https?:\/\//, '')}</span>}
      </div>
      <div className={styles.scores}>
        {scoreData.map(s => (
          <div key={s.label} className={styles.score}>
            <Ring value={s.value} />
            <span className={styles.scoreLabel}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
