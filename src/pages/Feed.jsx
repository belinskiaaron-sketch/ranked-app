import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useToast } from '../components/Toast'
import ShareCard from '../components/ShareCard'
import styles from './Feed.module.css'

const CATS = ['ALL', 'CULTURE', 'TECH', 'FOOD', 'SPORTS', 'LIFE', 'MONEY']

const SEED = [
  { id: 's1', text: "AI will not take your job. A person using AI will take your job.", category: 'TECH', agree_count: 780, disagree_count: 220 },
  { id: 's2', text: "Social media didn't ruin society — it made already-existing problems impossible to ignore.", category: 'CULTURE', agree_count: 610, disagree_count: 390 },
  { id: 's3', text: "Morning people aren't more productive. They're just more annoying about it.", category: 'LIFE', agree_count: 730, disagree_count: 270 },
  { id: 's4', text: "Streaming killed music. Albums meant more when you had to actually buy them.", category: 'CULTURE', agree_count: 550, disagree_count: 450 },
  { id: 's5', text: "Pineapple on pizza is actually good and people only hate it because they're told to.", category: 'FOOD', agree_count: 440, disagree_count: 560 },
  { id: 's6', text: "The GOAT debate in any sport is pointless. Different eras, different games.", category: 'SPORTS', agree_count: 660, disagree_count: 340 },
]

function TakeCard({ take, userId, onVote }) {
  const [localA, setLocalA] = useState(take.agree_count || 0)
  const [localD, setLocalD] = useState(take.disagree_count || 0)
  const [voted, setVoted] = useState(null)
  const [showShare, setShowShare] = useState(false)
  const [animating, setAnimating] = useState(null)
  const toast = useToast()

  const total = localA + localD
  const pct = total > 0 ? Math.round((localA / total) * 100) : 50

  const handleVote = async (type) => {
    if (voted) { toast('You already voted on this take!', 'info'); return }
    setVoted(type)
    setAnimating(type)
    setTimeout(() => setAnimating(null), 600)
    if (type === 'agree') setLocalA(v => v + 1)
    else setLocalD(v => v + 1)
    toast(type === 'agree' ? '🔥 Agree locked in!' : '❄️ Disagree locked in!', 'info')
    if (onVote) onVote(take.id, type)
  }

  return (
    <>
      <div className={`${styles.card} card card-hover`}>
        <div className={styles.cardTop}>
          <span className="cat-chip">{take.category}</span>
          <span className={styles.voteCount}>{total.toLocaleString()} votes</span>
        </div>

        <p className={styles.takeText}>"{take.text}"</p>

        <div className={styles.barWrap}>
          <div className="vote-bar-track">
            <div className="vote-bar-fill" style={{ width: `${pct}%` }} />
          </div>
          <div className={styles.pcts}>
            <span className={styles.agreePct}>{pct}% agree</span>
            <span className={styles.disagreePct}>{100 - pct}% disagree</span>
          </div>
        </div>

        <div className={styles.voteRow}>
          <button
            className={`${styles.voteBtn} ${styles.agreeBtn} ${voted === 'agree' ? styles.votedAgree : ''} ${animating === 'agree' ? styles.pop : ''}`}
            onClick={() => handleVote('agree')}
            disabled={!!voted}
          >
            {voted === 'agree' ? '✓ Agreed' : '👍 Agree'}
          </button>
          <button
            className={`${styles.voteBtn} ${styles.disagreeBtn} ${voted === 'disagree' ? styles.votedDisagree : ''} ${animating === 'disagree' ? styles.pop : ''}`}
            onClick={() => handleVote('disagree')}
            disabled={!!voted}
          >
            {voted === 'disagree' ? '✓ Disagreed' : '👎 Disagree'}
          </button>
        </div>

        <div className={styles.cardFooter}>
          <button className={styles.shareBtn} onClick={() => setShowShare(true)}>
            ↗ Share
          </button>
        </div>
      </div>

      {showShare && (
        <ShareCard
          take={{ ...take, agree_count: localA, disagree_count: localD }}
          onClose={() => setShowShare(false)}
        />
      )}
    </>
  )
}

export default function Feed({ session, profile }) {
  const [takes, setTakes] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const navigate = useNavigate()

  useEffect(() => {
    fetchTakes()
    const ch = supabase.channel('takes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'takes' }, () => fetchTakes())
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [])

  const fetchTakes = async () => {
    const { data } = await supabase.from('takes').select('*').order('created_at', { ascending: false }).limit(50)
    setTakes(data?.length ? data : SEED)
    setLoading(false)
  }

  const handleVote = async (id, type) => {
    if (id.startsWith('s')) return
    const take = takes.find(t => t.id === id)
    if (!take) return
    const field = type === 'agree' ? 'agree_count' : 'disagree_count'
    await supabase.from('takes').update({ [field]: (take[field] || 0) + 1 }).eq('id', id)
    try { await supabase.from('votes').insert({ take_id: id, user_id: session.user.id, vote_type: type }) } catch {}
  }

  const filtered = filter === 'ALL' ? takes : takes.filter(t => t.category === filter)

  return (
    <div className={styles.wrap}>
      <div className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <h1 className={styles.pageTitle}>Live Feed</h1>
          <span className="badge badge-live">● LIVE</span>
        </div>
        <button className="btn btn-primary btn-display" onClick={() => navigate('/post')}>
          + Drop Take
        </button>
      </div>

      <div className={styles.filters}>
        {CATS.map(c => (
          <button key={c} className={`${styles.filterBtn} ${filter === c ? styles.filterActive : ''}`} onClick={() => setFilter(c)}>
            {c}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        {loading ? (
          <div className={styles.loadingState}>
            <div className="spinner" style={{ width: 28, height: 28 }} />
            <span>Loading takes...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔥</div>
            <div className="empty-title">No takes in this category</div>
            <div className="empty-sub">Be the first to drop one</div>
            <button className="btn btn-primary btn-display" onClick={() => navigate('/post')}>Drop a Take</button>
          </div>
        ) : (
          <div className={styles.grid}>
            {filtered.map(take => (
              <TakeCard key={take.id} take={take} userId={session.user.id} onVote={handleVote} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
