import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import styles from './Leaderboard.module.css'

export default function Leaderboard() {
  const [takes, setTakes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    const { data } = await supabase
      .from('takes')
      .select('*, profiles(username)')
      .order('agree_count', { ascending: false })
      .limit(20)

    if (data && data.length > 0) {
      setTakes(data)
    } else {
      setTakes([
        { id: 1, text: "AI will not take your job. A person using AI will.", category: 'TECH', agree_count: 780, disagree_count: 220, profiles: { username: 'takequeen' } },
        { id: 2, text: "Morning people aren't more productive. They're just more annoying about it.", category: 'LIFE', agree_count: 730, disagree_count: 270, profiles: { username: 'maxcontrarian' } },
        { id: 3, text: "Social media didn't ruin society — it made existing problems impossible to ignore.", category: 'CULTURE', agree_count: 610, disagree_count: 390, profiles: { username: 'zerora' } },
        { id: 4, text: "Streaming killed music. Albums meant more when you had to buy them.", category: 'CULTURE', agree_count: 550, disagree_count: 450, profiles: { username: 'alwaysright' } },
        { id: 5, text: "The GOAT debate in any sport is pointless. Different eras, different games.", category: 'SPORTS', agree_count: 660, disagree_count: 340, profiles: { username: 'novalane' } },
      ])
    }
    setLoading(false)
  }

  const getRankStyle = (i) => {
    if (i === 0) return styles.rank1
    if (i === 1) return styles.rank2
    if (i === 2) return styles.rank3
    return ''
  }

  const getHeatScore = (take) => {
    const total = take.agree_count + take.disagree_count
    const controversy = total > 0 ? Math.min(take.agree_count, take.disagree_count) / total : 0
    return Math.round((total * 0.5) + (controversy * total * 10))
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.topbar}>
        <h1 className={styles.pageTitle}>Leaderboard</h1>
        <div className={styles.liveBadge}>LIVE UPDATES</div>
      </div>

      <div className={styles.content}>
        <div className={styles.resetNote}>Resets daily at midnight EST</div>
        {loading ? (
          <div className={styles.loading}>Loading...</div>
        ) : (
          <div className={styles.list}>
            {takes.map((take, i) => {
              const total = (take.agree_count || 0) + (take.disagree_count || 0)
              const agreePct = total > 0 ? Math.round((take.agree_count / total) * 100) : 50
              return (
                <div key={take.id} className={styles.row}>
                  <div className={`${styles.rank} ${getRankStyle(i)}`}>{i + 1}</div>
                  <div className={styles.info}>
                    <div className={styles.takeText}>"{take.text}"</div>
                    <div className={styles.meta}>
                      <span className={styles.category}>{take.category}</span>
                      <span className={styles.user}>@{take.profiles?.username || 'anonymous'}</span>
                      <span className={styles.voteCount}>{total.toLocaleString()} votes</span>
                    </div>
                  </div>
                  <div className={styles.scoreCol}>
                    <div className={styles.heatScore}>{getHeatScore(take).toLocaleString()}</div>
                    <div className={styles.scoreLabel}>HEAT PTS</div>
                    <div className={styles.agreePct} style={{ color: agreePct > 50 ? 'var(--fire)' : 'var(--ice)' }}>
                      {agreePct}% agree
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
