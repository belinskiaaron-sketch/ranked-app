import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useToast } from '../components/Toast'
import styles from './PostTake.module.css'

const CATS = ['CULTURE', 'TECH', 'FOOD', 'SPORTS', 'LIFE', 'MONEY', 'RANDOM']

export default function PostTake({ session, profile, setProfile }) {
  const [text, setText] = useState('')
  const [category, setCategory] = useState('CULTURE')
  const [wager, setWager] = useState(100)
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const navigate = useNavigate()
  const toast = useToast()

  const charsLeft = 160 - text.length
  const tokens = profile?.heat_tokens || 0
  const canAfford = tokens >= wager

  const handlePreview = (e) => {
    e.preventDefault()
    if (!text.trim()) { toast('Write your take first!', 'error'); return }
    if (!canAfford) { toast('Not enough tokens!', 'error'); return }
    setShowConfirm(true)
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.from('takes').insert({
        text: text.trim(), category,
        user_id: session.user.id,
        agree_count: 0, disagree_count: 0, heat_score: 0,
        created_at: new Date().toISOString()
      })
      if (error) throw error

      // Deduct tokens
      const newTokens = tokens - wager
      await supabase.from('profiles').update({ heat_tokens: newTokens }).eq('id', session.user.id)
      if (setProfile) setProfile(p => ({ ...p, heat_tokens: newTokens }))

      toast('🔥 Take dropped! Let the votes roll in.', 'success')
      navigate('/')
    } catch (err) {
      toast(err.message || 'Something went wrong.', 'error')
      setLoading(false)
      setShowConfirm(false)
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.topbar}>
        <h1 className={styles.pageTitle}>Drop a Take</h1>
        <div className={styles.tokenBalance}>
          <span>⚡</span>
          <span>{tokens.toLocaleString()} tokens</span>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.formCard}>
          <form onSubmit={handlePreview}>
            <div className={styles.field}>
              <div className={styles.fieldHeader}>
                <label className="label">Your Take</label>
                <span className={`${styles.chars} ${charsLeft < 20 ? styles.charsWarn : ''}`}>{charsLeft} left</span>
              </div>
              <textarea
                className={`input ${styles.textarea}`}
                value={text}
                onChange={e => setText(e.target.value)}
                maxLength={160}
                placeholder="Say something people will argue about..."
                rows={4}
              />
            </div>

            <div className={styles.field}>
              <label className="label">Category</label>
              <div className={styles.chips}>
                {CATS.map(c => (
                  <button key={c} type="button"
                    className={`${styles.chip} ${category === c ? styles.chipActive : ''}`}
                    onClick={() => setCategory(c)}
                  >{c}</button>
                ))}
              </div>
            </div>

            <div className={styles.field}>
              <div className={styles.fieldHeader}>
                <label className="label">Heat Wager</label>
                <span className={styles.wagerVal}>{wager} <span>tokens</span></span>
              </div>
              <input type="range" min={50} max={Math.min(500, tokens)} step={50} value={wager} onChange={e => setWager(Number(e.target.value))} className={styles.slider} />
              <div className={styles.sliderLabels}><span>50</span><span>{Math.min(500, tokens)}</span></div>
              {!canAfford && <p className={styles.warnText}>⚠ Not enough tokens. Buy more in the Store.</p>}
              <p className={styles.wagerHint}>Higher wager = more leaderboard points if your take performs well.</p>
            </div>

            <div className={styles.actions}>
              <button type="button" className="btn btn-ghost" onClick={() => navigate('/')}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-display btn-lg" disabled={!text.trim() || !canAfford}>
                Preview & Confirm →
              </button>
            </div>
          </form>
        </div>

        <div className={styles.sidebar}>
          <div className={styles.howCard}>
            <div className={styles.howTitle}>How it works</div>
            <div className={styles.howItem}><span className={styles.howIcon}>⚡</span><div><strong>Wager tokens</strong> on your take going live</div></div>
            <div className={styles.howItem}><span className={styles.howIcon}>🔥</span><div><strong>Controversy = points.</strong> The closer to 50/50, the higher your score</div></div>
            <div className={styles.howItem}><span className={styles.howIcon}>🏆</span><div><strong>Top takes</strong> get entered into daily tournaments automatically</div></div>
            <div className={styles.howItem}><span className={styles.howIcon}>💎</span><div><strong>Win tokens</strong> back when your takes outperform. Need more? Visit the Store.</div></div>
          </div>
        </div>
      </div>

      {/* CONFIRM MODAL */}
      {showConfirm && (
        <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Confirm Your Take</span>
              <button className="modal-close" onClick={() => setShowConfirm(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className={styles.previewCat}>{category}</div>
              <p className={styles.previewText}>"{text}"</p>
              <div className={styles.previewMeta}>
                <div className={styles.previewRow}>
                  <span>Wager</span>
                  <span className={styles.previewVal}>⚡ {wager} tokens</span>
                </div>
                <div className={styles.previewRow}>
                  <span>Remaining after post</span>
                  <span className={styles.previewVal}>⚡ {tokens - wager} tokens</span>
                </div>
                <div className={styles.previewRow}>
                  <span>Category</span>
                  <span className={styles.previewVal}>{category}</span>
                </div>
              </div>
              <p className={styles.previewNote}>Once posted, your take goes live immediately and can't be edited.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowConfirm(false)}>Go back</button>
              <button className="btn btn-primary btn-display" onClick={handleSubmit} disabled={loading}>
                {loading ? <><div className="spinner" style={{width:14,height:14}} /> Posting...</> : '🔥 Drop It'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
