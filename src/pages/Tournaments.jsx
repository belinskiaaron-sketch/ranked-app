import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useToast } from '../components/Toast'
import styles from './Tournaments.module.css'

const MOCK_TOURNAMENTS = [
  { id: 't1', name: 'Daily Culture Clash', category: 'CULTURE', prize_pool: 480, entry_fee: 50, max_spots: 300, current_spots: 241, status: 'live', ends_in: '3h 22m', description: 'The most controversial cultural takes battle it out. Top 3 win tokens.' },
  { id: 't2', name: 'Friday Fire Grand Prix', category: 'ALL', prize_pool: 2100, entry_fee: 150, max_spots: 1000, current_spots: 892, status: 'filling', ends_in: 'Fri 8PM EST', description: 'The biggest weekly battle. Enter your best take and compete for the prize pool.' },
  { id: 't3', name: 'Tech Wars Weekly', category: 'TECH', prize_pool: 320, entry_fee: 30, max_spots: 200, current_spots: 88, status: 'open', ends_in: '22h 10m', description: 'Hot tech takes only. AI, gadgets, software — defend your position.' },
]

function TournamentCard({ t, userTakes, onEnter, entering, myEntries }) {
  const [showModal, setShowModal] = useState(false)
  const [selectedTake, setSelectedTake] = useState('')
  const fillPct = Math.round((t.current_spots / t.max_spots) * 100)
  const isEntered = myEntries.includes(t.id)

  const statusColor = t.status === 'live' ? 'var(--fire)' : t.status === 'filling' ? 'var(--gold)' : 'var(--green)'
  const statusLabel = t.status === 'live' ? '● LIVE' : t.status === 'filling' ? '⚡ FILLING FAST' : '○ OPEN'

  return (
    <>
      <div className={`${styles.tCard} card`}>
        <div className={styles.tTop}>
          <div>
            <div className={styles.tMeta}>
              <span className="cat-chip">{t.category}</span>
              <span className={styles.tStatus} style={{ color: statusColor }}>{statusLabel}</span>
            </div>
            <div className={styles.tName}>{t.name}</div>
            <p className={styles.tDesc}>{t.description}</p>
          </div>
          <div className={styles.prizeBox}>
            <div className={styles.prizeAmount}>⚡{t.prize_pool.toLocaleString()}</div>
            <div className={styles.prizeLabel}>PRIZE POOL</div>
          </div>
        </div>

        <div className={styles.tProgress}>
          <div className={styles.progressMeta}>
            <span>{t.current_spots}/{t.max_spots} entered</span>
            <span>Ends: {t.ends_in}</span>
          </div>
          <div className="progress-track"><div className="progress-fill" style={{ width: `${fillPct}%` }} /></div>
        </div>

        <div className={styles.tFooter}>
          <div className={styles.entryInfo}>
            Entry: <strong>⚡{t.entry_fee} tokens</strong>
          </div>
          {isEntered ? (
            <button className="btn btn-secondary btn-display" disabled>✓ Entered</button>
          ) : (
            <button
              className="btn btn-primary btn-display"
              onClick={() => setShowModal(true)}
              disabled={entering === t.id}
            >
              {entering === t.id ? 'Entering...' : `Enter — ⚡${t.entry_fee}`}
            </button>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Enter Tournament</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className={styles.modalTName}>{t.name}</div>
              <div className={styles.modalMeta}>
                <div className={styles.modalRow}><span>Prize pool</span><strong>⚡{t.prize_pool.toLocaleString()} tokens</strong></div>
                <div className={styles.modalRow}><span>Entry fee</span><strong>⚡{t.entry_fee} tokens</strong></div>
                <div className={styles.modalRow}><span>Ends</span><strong>{t.ends_in}</strong></div>
              </div>

              {userTakes.length > 0 ? (
                <>
                  <label className="label" style={{ marginTop: 16 }}>Select your take to enter</label>
                  <div className={styles.takeList}>
                    {userTakes.map(take => (
                      <div
                        key={take.id}
                        className={`${styles.takeOption} ${selectedTake === take.id ? styles.takeSelected : ''}`}
                        onClick={() => setSelectedTake(take.id)}
                      >
                        <div className={styles.takeOptionText}>"{take.text}"</div>
                        <div className={styles.takeOptionMeta}>
                          {take.agree_count + take.disagree_count} votes · {take.category}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className={styles.noTakes}>
                  You need to drop at least one take before entering a tournament.
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button
                className="btn btn-primary btn-display"
                disabled={!selectedTake || userTakes.length === 0 || entering === t.id}
                onClick={() => { onEnter(t, selectedTake); setShowModal(false) }}
              >
                Confirm Entry ⚡{t.entry_fee}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default function Tournaments({ session, profile, setProfile }) {
  const [userTakes, setUserTakes] = useState([])
  const [myEntries, setMyEntries] = useState([])
  const [entering, setEntering] = useState(null)
  const toast = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    fetchUserTakes()
    fetchMyEntries()
  }, [])

  const fetchUserTakes = async () => {
    const { data } = await supabase.from('takes').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false })
    setUserTakes(data || [])
  }

  const fetchMyEntries = async () => {
    const { data } = await supabase.from('tournament_entries').select('tournament_id').eq('user_id', session.user.id)
    setMyEntries(data?.map(e => e.tournament_id) || [])
  }

  const handleEnter = async (tournament, takeId) => {
    const tokens = profile?.heat_tokens || 0
    if (tokens < tournament.entry_fee) {
      toast(`Not enough tokens! You need ⚡${tournament.entry_fee}.`, 'error')
      return
    }
    setEntering(tournament.id)
    try {
      await supabase.from('tournament_entries').insert({
        tournament_id: tournament.id,
        user_id: session.user.id,
        take_id: takeId,
        score: 0,
        created_at: new Date().toISOString()
      })
      const newTokens = tokens - tournament.entry_fee
      await supabase.from('profiles').update({ heat_tokens: newTokens }).eq('id', session.user.id)
      if (setProfile) setProfile(p => ({ ...p, heat_tokens: newTokens }))
      setMyEntries(prev => [...prev, tournament.id])
      toast(`🏆 Entered ${tournament.name}! Good luck.`, 'success')
    } catch (err) {
      toast('Failed to enter. Try again.', 'error')
    }
    setEntering(null)
  }

  const totalPrize = MOCK_TOURNAMENTS.reduce((s, t) => s + t.prize_pool, 0)
  const totalEntries = MOCK_TOURNAMENTS.reduce((s, t) => s + t.current_spots, 0)

  return (
    <div className={styles.wrap}>
      <div className={styles.topbar}>
        <h1 className={styles.pageTitle}>Tournaments</h1>
        <span className="badge badge-live">2 LIVE</span>
      </div>

      <div className={styles.content}>
        <div className={styles.statsRow}>
          <div className="stat-card">
            <div className="stat-label">Total Prize Pool</div>
            <div className="stat-value" style={{ color: 'var(--gold)' }}>⚡{totalPrize.toLocaleString()}</div>
            <div className="stat-delta">tokens up for grabs</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Entries</div>
            <div className="stat-value" style={{ color: 'var(--fire)' }}>{totalEntries.toLocaleString()}</div>
            <div className="stat-delta up">across {MOCK_TOURNAMENTS.length} tournaments</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Your Tokens</div>
            <div className="stat-value" style={{ color: 'var(--ice)' }}>⚡{(profile?.heat_tokens || 0).toLocaleString()}</div>
            <div className="stat-delta"><button className={styles.getMoreBtn} onClick={() => navigate('/store')}>Get more →</button></div>
          </div>
        </div>

        {userTakes.length === 0 && (
          <div className={styles.noTakesBanner}>
            <span>💡</span>
            <span>You need to drop a take before you can enter a tournament.</span>
            <button className="btn btn-primary btn-sm btn-display" onClick={() => navigate('/post')}>Drop a Take</button>
          </div>
        )}

        <div className={styles.sectionTitle}>Active Tournaments</div>
        <div className={styles.list}>
          {MOCK_TOURNAMENTS.map(t => (
            <TournamentCard
              key={t.id}
              t={t}
              userTakes={userTakes}
              onEnter={handleEnter}
              entering={entering}
              myEntries={myEntries}
            />
          ))}
        </div>

        <div className={styles.comingSoon}>
          <div className={styles.csIcon}>🚀</div>
          <div className={styles.csTitle}>Brand Tournaments Coming Soon</div>
          <div className={styles.csText}>At 10,000 users, brands sponsor tournaments with $5,000+ prize pools. You compete for free.</div>
        </div>
      </div>
    </div>
  )
}
