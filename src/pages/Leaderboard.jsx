import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import styles from './Leaderboard.module.css'

const SEED_LB = [
  { id: 1, text: "AI will not take your job. A person using AI will.", category: 'TECH', agree_count: 780, disagree_count: 220, profiles: { username: 'takequeen' } },
  { id: 2, text: "Morning people aren't more productive. They're just more annoying.", category: 'LIFE', agree_count: 730, disagree_count: 270, profiles: { username: 'maxcontrarian' } },
  { id: 3, text: "Social media made existing problems impossible to ignore.", category: 'CULTURE', agree_count: 610, disagree_count: 390, profiles: { username: 'zerora' } },
  { id: 4, text: "Streaming killed music. Albums meant more when you paid.", category: 'CULTURE', agree_count: 550, disagree_count: 450, profiles: { username: 'alwaysright' } },
  { id: 5, text: "The GOAT debate in any sport is pointless.", category: 'SPORTS', agree_count: 660, disagree_count: 340, profiles: { username: 'novalane' } },
  { id: 6, text: "Most productivity advice is cope for people who hate their jobs.", category: 'LIFE', agree_count: 810, disagree_count: 190, profiles: { username: 'hotshot' } },
  { id: 7, text: "College is becoming a scam for most people.", category: 'CULTURE', agree_count: 740, disagree_count: 260, profiles: { username: 'realist99' } },
  { id: 8, text: "Tipping culture has completely spiraled out of control.", category: 'LIFE', agree_count: 820, disagree_count: 180, profiles: { username: 'frankspeaks' } },
]

const getHeat = (t) => {
  const total = (t.agree_count||0) + (t.disagree_count||0)
  const controversy = total > 0 ? Math.min(t.agree_count,t.disagree_count) / total : 0
  return Math.round(total * 0.5 + controversy * total * 10)
}

const MEDALS = ['🥇','🥈','🥉']

export default function Leaderboard({ session }) {
  const [takes, setTakes] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('takes') // takes | users

  useEffect(() => { fetchLeaderboard() }, [])

  const fetchLeaderboard = async () => {
    const { data } = await supabase
      .from('takes').select('*, profiles(username)')
      .order('agree_count', { ascending: false }).limit(20)
    setTakes(data?.length ? data : SEED_LB)
    setLoading(false)
  }

  const sorted = [...takes].sort((a,b) => getHeat(b) - getHeat(a))

  return (
    <div className={styles.wrap}>
      <div className={styles.topbar}>
        <h1 className={styles.pageTitle}>Leaderboard</h1>
        <span className="badge badge-gold">RESETS MIDNIGHT</span>
      </div>

      <div className={styles.content}>
        <div className={styles.tabs}>
          <button className={`${styles.tab} ${tab==='takes'?styles.tabActive:''}`} onClick={()=>setTab('takes')}>Top Takes</button>
          <button className={`${styles.tab} ${tab==='users'?styles.tabActive:''}`} onClick={()=>setTab('users')}>Top Users</button>
        </div>

        {loading ? (
          <div className={styles.loading}><div className="spinner" style={{width:24,height:24}} /></div>
        ) : tab === 'takes' ? (
          <div className={styles.list}>
            {sorted.map((take, i) => {
              const total = (take.agree_count||0)+(take.disagree_count||0)
              const pct = total > 0 ? Math.round((take.agree_count/total)*100) : 50
              const heat = getHeat(take)
              return (
                <div key={take.id} className={`${styles.row} card`}>
                  <div className={styles.rank}>
                    {i < 3 ? <span className={styles.medal}>{MEDALS[i]}</span> : <span className={styles.rankNum}>{i+1}</span>}
                  </div>
                  <div className={styles.info}>
                    <p className={styles.takeText}>"{take.text}"</p>
                    <div className={styles.meta}>
                      <span className="cat-chip">{take.category}</span>
                      <span className={styles.user}>@{take.profiles?.username||'anon'}</span>
                      <span className={styles.votes}>{total.toLocaleString()} votes</span>
                      <span className={styles.pctBadge} style={{color: pct>=50?'var(--fire)':'var(--ice)'}}>{pct}% agree</span>
                    </div>
                  </div>
                  <div className={styles.score}>
                    <div className={styles.heatNum}>{heat.toLocaleString()}</div>
                    <div className={styles.heatLbl}>HEAT</div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className={styles.list}>
            {sorted.reduce((acc, take) => {
              const u = take.profiles?.username || 'anon'
              const existing = acc.find(x => x.username === u)
              if (existing) { existing.heat += getHeat(take); existing.takes++ }
              else acc.push({ username: u, heat: getHeat(take), takes: 1 })
              return acc
            }, []).sort((a,b) => b.heat - a.heat).map((user, i) => (
              <div key={user.username} className={`${styles.row} card`}>
                <div className={styles.rank}>
                  {i < 3 ? <span className={styles.medal}>{MEDALS[i]}</span> : <span className={styles.rankNum}>{i+1}</span>}
                </div>
                <div className={styles.info}>
                  <div className={styles.userRow}>
                    <div className={styles.userAvatar}>{user.username.slice(0,2).toUpperCase()}</div>
                    <div>
                      <div className={styles.userName}>@{user.username}</div>
                      <div className={styles.userSub}>{user.takes} takes on the board</div>
                    </div>
                  </div>
                </div>
                <div className={styles.score}>
                  <div className={styles.heatNum}>{user.heat.toLocaleString()}</div>
                  <div className={styles.heatLbl}>TOTAL HEAT</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
