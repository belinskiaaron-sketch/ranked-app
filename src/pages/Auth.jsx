import { useState } from 'react'
import { supabase } from '../lib/supabase'
import styles from './Auth.module.css'

export default function Auth() {
  const [mode, setMode] = useState('signin') // signin | signup | confirm
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (mode === 'signup') {
      if (password.length < 6) { setError('Password must be at least 6 characters.'); setLoading(false); return }
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { data: { username: username || email.split('@')[0] } }
      })
      if (error) { setError(error.message); setLoading(false); return }
      if (data?.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          username: username || email.split('@')[0],
          heat_tokens: 1000,
          created_at: new Date().toISOString()
        })
        if (!data.session) setMode('confirm')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        if (error.message.includes('Email not confirmed')) setError('Please confirm your email first. Check your inbox.')
        else if (error.message.includes('Invalid login')) setError('Incorrect email or password.')
        else setError(error.message)
      }
    }
    setLoading(false)
  }

  if (mode === 'confirm') return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.logoRow}><div className={styles.dot} /><span className={styles.logo}>RANKED</span></div>
        <div className={styles.confirmIcon}>✉️</div>
        <h2 className={styles.confirmTitle}>Check your inbox</h2>
        <p className={styles.confirmText}>We sent a link to <strong>{email}</strong>. Click it to activate your account, then sign in.</p>
        <p className={styles.confirmHint}>Can't find it? Check spam.</p>
        <button className="btn btn-ghost btn-full" onClick={() => { setMode('signin'); setError('') }}>
          Back to sign in
        </button>
      </div>
    </div>
  )

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.logoRow}><div className={styles.dot} /><span className={styles.logo}>RANKED</span></div>
        <p className={styles.tagline}>Hot takes. Live battles. Real stakes.</p>

        <div className={styles.tabs}>
          <button className={`${styles.tab} ${mode === 'signin' ? styles.tabActive : ''}`} onClick={() => { setMode('signin'); setError('') }}>Sign in</button>
          <button className={`${styles.tab} ${mode === 'signup' ? styles.tabActive : ''}`} onClick={() => { setMode('signup'); setError('') }}>Sign up free</button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className={styles.field}>
              <label className="label">Username</label>
              <input className="input" type="text" placeholder="your_handle" value={username} onChange={e => setUsername(e.target.value)} maxLength={30} />
            </div>
          )}
          <div className={styles.field}>
            <label className="label">Email</label>
            <input className="input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className={styles.field}>
            <label className="label">Password</label>
            <input className="input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading} style={{ marginTop: 4 }}>
            {loading ? <><div className="spinner" style={{width:16,height:16}} /> Loading...</> : mode === 'signup' ? 'Create account' : 'Sign in'}
          </button>
        </form>

        {mode === 'signup' && (
          <div className={styles.perks}>
            <div className={styles.perk}><span>⚡</span> 1,000 free Heat Tokens on signup</div>
            <div className={styles.perk}><span>🏆</span> Enter daily tournaments</div>
            <div className={styles.perk}><span>🔥</span> Climb the global leaderboard</div>
          </div>
        )}
      </div>
    </div>
  )
}
