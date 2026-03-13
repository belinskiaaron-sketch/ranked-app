import styles from './Tournaments.module.css'

const TOURNAMENTS = [
  { id: 1, name: 'DAILY CULTURE CLASH', category: 'CULTURE', prize: 480, entry: 1.99, spots: 241, maxSpots: 300, endsIn: '3h 22m', status: 'live' },
  { id: 2, name: 'FRIDAY FIRE GRAND PRIX', category: 'ALL', prize: 2100, entry: 2.99, spots: 892, maxSpots: 1000, endsIn: 'Fri 8PM EST', status: 'filling' },
  { id: 3, name: 'TECH WARS WEEKLY', category: 'TECH', prize: 320, entry: 0.99, spots: 88, maxSpots: 200, endsIn: '22h 10m', status: 'open' },
]

export default function Tournaments({ session }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.topbar}>
        <h1 className={styles.pageTitle}>Tournaments</h1>
        <div className={styles.liveBadge}>2 LIVE NOW</div>
      </div>

      <div className={styles.content}>
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>PRIZE POOL TODAY</div>
            <div className={styles.statValue} style={{ color: 'var(--fire)' }}>$2,900</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>TOTAL ENTRIES</div>
            <div className={styles.statValue} style={{ color: 'var(--gold)' }}>1,221</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>YOUR TOKENS</div>
            <div className={styles.statValue} style={{ color: 'var(--green)' }}>1,000</div>
          </div>
        </div>

        <div className={styles.sectionTitle}>Active Tournaments</div>

        {TOURNAMENTS.map(t => (
          <div key={t.id} className={styles.tournamentCard}>
            <div className={styles.tTop}>
              <div>
                <div className={styles.tCategory}>{t.category} CATEGORY</div>
                <div className={styles.tName}>{t.name}</div>
              </div>
              <div className={styles.prizeBox}>
                <div className={styles.prizeAmount}>${t.prize}</div>
                <div className={styles.prizeLabel}>PRIZE POOL</div>
              </div>
            </div>

            <div className={styles.progressWrap}>
              <div className={styles.progressLabel}>
                <span>{t.spots}/{t.maxSpots} spots filled</span>
                <span style={{ color: t.status === 'live' ? 'var(--fire)' : t.status === 'filling' ? 'var(--gold)' : 'var(--green)' }}>
                  {t.status === 'live' ? '● LIVE' : t.status === 'filling' ? '⚡ FILLING FAST' : '○ OPEN'}
                </span>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${(t.spots / t.maxSpots) * 100}%` }} />
              </div>
            </div>

            <div className={styles.tFooter}>
              <div className={styles.tInfo}>
                Entry: <strong>${t.entry}</strong> · Ends: <strong>{t.endsIn}</strong>
              </div>
              <button className="btn btn-primary" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.06em' }}>
                ENTER — ${t.entry}
              </button>
            </div>
          </div>
        ))}

        <div className={styles.comingSoon}>
          <div className={styles.csTitle}>BRAND BATTLE COMING SOON</div>
          <div className={styles.csText}>At 10,000 users, sponsored tournaments unlock. Brands put up $5,000+ prize pools. You keep playing for free.</div>
        </div>
      </div>
    </div>
  )
}
