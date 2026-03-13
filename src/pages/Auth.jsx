import { useState } from 'react'
import { supabase } from '../lib/supabase'
import styles from './Auth.module.css'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username: username || email.split('@')[0] } }
      })
      if (error) setError(error.message)
      else {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          username: username || email.split('@')[0],
          heat_tokens: 1000,
          created_at: new Date().toISOString()
        })
        setMessage('Account created! You can now sign in.')
        setIsSignUp(false)
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    }
    setLoading(false)
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <div className={styles.logoDot} />
          RANKED
        </div>
        <div className={styles.tagline}>Hot takes. Live battles. Real stakes.</div>

        <form onSubmit={handleAuth} className={styles.form}>
          {isSignUp && (
            <div className={styles.field}>
              <label className={styles.label}>USERNAME</label>
              <input
                className={styles.input}
                type="text"
                placeholder="your_handle"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>
          )}
          <div className={styles.field}>
            <label className={styles.label}>EMAIL</label>
            <input
              className={styles.input}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>PASSWORD</label>
            <input
              className={styles.input}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}
          {message && <div className={styles.success}>{message}</div>}

          <button className={`btn btn-primary ${styles.submitBtn}`} type="submit" disabled={loading}>
            {loading ? 'Loading...' : isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN'}
          </button>
        </form>

        <div className={styles.toggle}>
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          <button className={styles.toggleBtn} onClick={() => { setIsSignUp(!isSignUp); setError(''); setMessage('') }}>
            {isSignUp ? 'Sign in' : 'Sign up free'}
          </button>
        </div>

        <div className={styles.perks}>
          <div className={styles.perk}><span className={styles.perkIcon}>⚡</span> 1,000 free Heat Tokens on signup</div>
          <div className={styles.perk}><span className={styles.perkIcon}>🏆</span> Enter daily tournaments</div>
          <div className={styles.perk}><span className={styles.perkIcon}>🔥</span> Climb the leaderboard</div>
        </div>
      </div>
    </div>
  )
}
