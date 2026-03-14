import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import ShareCard from '../components/ShareCard'
import styles from './Feed.module.css'

const SEED_TAKES = [
  { id: 'seed-1', text: "AI will not take your job. A person using AI will take your job. There's a difference.", category: 'TECH', agree_count: 780, disagree_count: 220, created_at: new Date().toISOString() },
  { id: 'seed-2', text: "Social media didn't ruin society — it just made already-existing problems impossible to ignore.", category: 'CULTURE', agree_count: 610, disagree_count: 390, created_at: new Date().toISOString() },
  { id: 'seed-3', text: "Morning people aren't more productive. They're just more annoying about it.", category: 'LIFE', agree_count: 730, disagree_count: 270, created_at: new Date().toISOString() },
  { id: 'seed-4', text: "Streaming killed music. Albums meant more when you had to actually buy them.", category: 'CULTURE', agree_count: 550, disagree_count: 450, created_at: new Date().toISOString() },
  { id: 'seed-5', text: "Pineapple on pizza is actually good and people only hate it because they're told to.", category: 'FOOD', agree_count: 440, disagree_count: 560, created_at: new Date().toISOString() },
  { id: 'seed-6', text: "The GOAT debate in any sport is pointless. Different eras, different games.", category: 'SPORTS', agree_count: 660, disagree_count: 340, created_at: new Date().toISOString() },
]

function TakeCard({ take, userId, onVote }) {
  const [voted, setVoted] = useState(null)
  const [localAgree, setLocalAgree] = useState(take.agree_count || 0)
  const [localDisagree, setLocalDisagree] = useState(take.disagree_count || 0)
  const [showShare, setShowShare] = useState(false)

  const localTotal = localAgree + localDisagree
  const localAgreePct = localTotal > 0 ? Math.round((localAgree / localTotal) * 100) : 50

  const handleVote = async (type) => {
    if (voted) return
    setVoted(type)
    if (type === 'agree') setLocalAgree(v => v + 1)
    else setLocalDisagree(v => v + 1)
    if (onVote) onVote(take.id, type)
  }

  const shareableTake = { ...take, agree_count: localAgree, disagree_count: localDisagree }

  return (
    <>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.category}>{take.category}</span>
          <span className={styles.votes}>{localTotal.toLocaleString()} votes</span>
        </div>
        <div className={styles.takeText}>"{take.text}"</div>
        <div className={styles.voteBar}>
          <div className={styles.voteTrack}>
            <div className={styles.voteFill} style={{ width: `${localAgreePct}%` }} />
          </div>
          <div className={styles.votePcts}>
            <span className={styles.agreePct}>{localAgreePct}%</span>
            <span className={styles.disagreePct}>{100 - localAgreePct}%</span>
          </div>
        </div>
        <div className={styles.voteButtons}>
          <button
            className={`${styles.voteBtn} ${styles.agreeBtn} ${voted === 'agree' ? styles.voted : ''}`}
            onClick={() => handleVote('agree')}
            disabled={!!voted}
          >
            {voted === 'agree' ? '✓ AGREED' : 'AGREE'}
          </button>
          <button
            className={`${styles.voteBtn} ${styles.disagreeBtn} ${voted === 'disagree' ? styles.voted : ''}`}
            onClick={() => handleVote('disagree')}
            disabled={!!voted}
          >
            {voted === 'disagree' ? '✓ DISAGREED' : 'DISAGREE'}
          </button>
        </div>
        <div className={styles.cardFooter}>
          <button className={styles.shareBtn} onClick={() => setShowShare(true)}>
            ↗ Share Card
          </button>
        </div>
      </div>

      {showShare && (
        <ShareCard take={shareableTake} onClose={() => setShowShare(false)} />
      )}
    </>
  )
}

export default function Feed({ session }) {
  const [takes, setTakes] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')

  const categories = ['ALL', 'CULTURE', 'TECH', 'FOOD', 'SPORTS', 'LIFE', 'MONEY']

  useEffect(() => {
    fetchTakes()
    const channel = supabase
      .channel('takes-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'takes' }, () => fetchTakes())
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  const fetchTakes = async () => {
    const { data } = await supabase
      .from('takes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    if (data && data.length > 0) setTakes(data)
    else setTakes(SEED_TAKES)
    setLoading(false)
  }

  const handleVote = async (takeId, type) => {
    if (takeId.startsWith('seed-')) return
    const field = type === 'agree' ? 'agree_count' : 'disagree_count'
    const take = takes.find(t => t.id === takeId)
    if (!take) return
    await supabase.from('takes').update({ [field]: (take[field] || 0) + 1 }).eq('id', takeId)
    await supabase.from('votes').insert({ take_id: takeId, user_id: session.user.id, vote_type: type })
  }

  const filtered = filter === 'ALL' ? takes : takes.filter(t => t.category === filter)

  return (
    <div className={styles.wrap}>
      <div className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <h1 className={styles.pageTitle}>Live Feed</h1>
          <div className={styles.liveBadge}>● LIVE</div>
        </div>
      </div>

      <div className={styles.filters}>
        {categories.map(cat => (
          <button
            key={cat}
            className={`${styles.filterBtn} ${filter === cat ? styles.filterActive : ''}`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        {loading ? (
          <div className={styles.loading}>Loading takes...</div>
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyTitle}>No takes yet in this category</div>
            <div className={styles.emptySub}>Be the first to drop one</div>
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
