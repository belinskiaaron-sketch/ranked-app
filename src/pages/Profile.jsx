import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import styles from './Profile.module.css'

export default function Profile({ session }) {
  const [profile, setProfile] = useState(null)
  const [takes, setTakes] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [username, setUsername] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchProfile()
    fetchMyTakes()
  }, [])

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
    if (data) {
      setProfile(data)
      setUsername(data.username || '')
    }
    setLoading(false)
  }

  const fetchMyTakes = async () => {
    const { data } = await supabase
      .from('takes')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(10)
    if (data) setTakes(data)
  }

  const saveProfile = async () => {
    setSaving(true)
    await supabase.from('profiles').upsert({
      id: session.user.id,
      username,
      updated_at: new Date().toISOString()
    })
    setProfile(p => ({ ...p, username }))
    setEditing(false)
    setSaving(false)
  }

  const totalVotes = takes.reduce((sum, t) => sum + (t.agree_count || 0) + (t.disagree_count || 0), 0)
  const totalAgree = takes.reduce((sum, t) => sum + (t.agree_count || 0), 0)
  const winRate = totalVotes > 0 ? Math.round((totalAgree / totalVotes) * 100) : 0

  const initials = (profile?.username || session.user.email || 'U').slice(0, 2).toUpperCase()

  return (
    <div className={styles.wrap}>
      <div className={styles.topbar}>
        <h1 className={styles.pageTitle}>Profile</h1>
      </div>

      <div className={styles.content}>
        {loading ? (
          <div className={styles.loading}>Loading...</div>
        ) : (
          <>
            <div className={styles.profileCard}>
              <div className={styles.avatarRow}>
                <div className={styles.avatar}>{initials}</div>
                <div className={styles.userInfo}>
                  {editing ? (
                    <div className={styles.editRow}>
                      <input
                        className={styles.usernameInput}
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        placeholder="your_handle"
                        maxLength={30}
                      />
                      <button className="btn btn-primary" onClick={saveProfile} disabled={saving}>
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
                    </div>
                  ) : (
                    <>
                      <div className={styles.userName}>@{profile?.username || 'set your username'}</div>
                      <button className={styles.editBtn} onClick={() => setEditing(true)}>Edit username</button>
                    </>
                  )}
                  <div className={styles.email}>{session.user.email}</div>
                </div>
              </div>

              <div className={styles.statsGrid}>
                <div className={styles.statBox}>
                  <div className={styles.statNum} style={{ color: 'var(--gold)' }}>
                    {(profile?.heat_tokens || 1000).toLocaleString()}
                  </div>
                  <div className={styles.statLabel}>HEAT TOKENS</div>
                </div>
                <div className={styles.statBox}>
                  <div className={styles.statNum} style={{ color: 'var(--fire)' }}>{takes.length}</div>
                  <div className={styles.statLabel}>TAKES DROPPED</div>
                </div>
                <div className={styles.statBox}>
                  <div className={styles.statNum} style={{ color: 'var(--ice)' }}>{totalVotes.toLocaleString()}</div>
                  <div className={styles.statLabel}>TOTAL VOTES</div>
                </div>
                <div className={styles.statBox}>
                  <div className={styles.statNum} style={{ color: 'var(--green)' }}>{winRate}%</div>
                  <div className={styles.statLabel}>AGREE RATE</div>
                </div>
              </div>
            </div>

            <div className={styles.sectionTitle}>YOUR TAKES</div>

            {takes.length === 0 ? (
              <div className={styles.emptyTakes}>
                <div className={styles.emptyTitle}>No takes yet</div>
                <div className={styles.emptySub}>Drop your first take and see how people vote</div>
              </div>
            ) : (
              <div className={styles.takesList}>
                {takes.map(take => {
                  const total = (take.agree_count || 0) + (take.disagree_count || 0)
                  const agreePct = total > 0 ? Math.round((take.agree_count / total) * 100) : 50
                  return (
                    <div key={take.id} className={styles.takeRow}>
                      <div className={styles.takeInfo}>
                        <div className={styles.takeCat}>{take.category}</div>
                        <div className={styles.takeText}>"{take.text}"</div>
                        <div className={styles.takeMeta}>{total.toLocaleString()} votes · {new Date(take.created_at).toLocaleDateString()}</div>
                      </div>
                      <div className={styles.takeScore}>
                        <div className={styles.takePct} style={{ color: agreePct >= 50 ? 'var(--fire)' : 'var(--ice)' }}>
                          {agreePct}%
                        </div>
                        <div className={styles.takePctLabel}>agree</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <div className={styles.planCard}>
              <div className={styles.planBadge}>FREE PLAN</div>
              <div className={styles.planName}>Upgrade to Creator Pro</div>
              <div className={styles.planDesc}>Unlimited takes · Analytics · Featured placement · Revenue share on tournaments you host</div>
              <button className="btn btn-gold" style={{ marginTop: 14, fontFamily: 'var(--font-display)', letterSpacing: '0.06em' }}>
                UPGRADE — $9.99/MO
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
