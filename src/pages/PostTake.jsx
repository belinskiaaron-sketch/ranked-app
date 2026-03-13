import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import styles from './PostTake.module.css'

const CATEGORIES = ['CULTURE', 'TECH', 'FOOD', 'SPORTS', 'LIFE', 'MONEY', 'RANDOM']

export default function PostTake({ session }) {
  const [text, setText] = useState('')
  const [category, setCategory] = useState('CULTURE')
  const [wager, setWager] = useState(100)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const charsLeft = 160 - text.length

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!text.trim()) return setError('Write your take first.')
    if (text.length > 160) return setError('Take is too long.')
    setLoading(true)
    setError('')

    const { error: takeError } = await supabase.from('takes').insert({
      text: text.trim(),
      category,
      user_id: session.user.id,
      agree_count: 0,
      disagree_count: 0,
      heat_score: 0,
      created_at: new Date().toISOString()
    })

    if (takeError) {
      setError(takeError.message)
      setLoading(false)
      return
    }

    await supabase.from('profiles')
      .update({ heat_tokens: supabase.raw(`heat_tokens - ${wager}`) })
      .eq('id', session.user.id)

    navigate('/')
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.topbar}>
        <h1 className={styles.pageTitle}>Drop a Take</h1>
      </div>

      <div className={styles.content}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <div className={styles.fieldHeader}>
              <label className={styles.label}>YOUR TAKE</label>
              <span className={`${styles.charCount} ${charsLeft < 20 ? styles.charWarning : ''}`}>
                {charsLeft} left
              </span>
            </div>
            <textarea
              className={styles.textarea}
              value={text}
              onChange={e => setText(e.target.value)}
              maxLength={160}
              placeholder="Say something people will fight about..."
              rows={4}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>CATEGORY</label>
            <div className={styles.chips}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  className={`${styles.chip} ${category === cat ? styles.chipActive : ''}`}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <div className={styles.fieldHeader}>
              <label className={styles.label}>HEAT WAGER</label>
              <span className={styles.wagerValue}>{wager} tokens</span>
            </div>
            <input
              type="range"
              min={50}
              max={500}
              step={50}
              value={wager}
              onChange={e => setWager(Number(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.sliderLabels}>
              <span>50</span><span>500</span>
            </div>
            <div className={styles.wagerNote}>
              Higher wager = higher on the leaderboard if your take wins
            </div>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.actions}>
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/')}>Cancel</button>
            <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading || !text.trim()}>
              {loading ? 'Posting...' : 'DROP THIS TAKE →'}
            </button>
          </div>
        </form>

        <div className={styles.rules}>
          <div className={styles.rulesTitle}>HOW IT WORKS</div>
          <div className={styles.rule}><span className={styles.ruleIcon}>⚡</span> Your take goes live instantly for others to vote on</div>
          <div className={styles.rule}><span className={styles.ruleIcon}>🔥</span> The more controversy, the higher your Heat Score</div>
          <div className={styles.rule}><span className={styles.ruleIcon}>🏆</span> Top takes earn tokens and leaderboard placement</div>
          <div className={styles.rule}><span className={styles.ruleIcon}>⬡</span> High-scoring takes get entered into tournaments</div>
        </div>
      </div>
    </div>
  )
}
