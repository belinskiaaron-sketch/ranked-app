import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { ToastProvider } from './components/Toast'
import Layout from './components/Layout'
import Auth from './pages/Auth'
import Feed from './pages/Feed'
import Tournaments from './pages/Tournaments'
import Leaderboard from './pages/Leaderboard'
import PostTake from './pages/PostTake'
import Profile from './pages/Profile'
import Store from './pages/Store'

export default function App() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
      else setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
      else setProfile(null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId) => {
    let { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    if (!data) {
      const { data: newProfile } = await supabase.from('profiles').upsert({
        id: userId,
        username: 'user_' + userId.slice(0, 6),
        heat_tokens: 1000,
        created_at: new Date().toISOString()
      }).select().single()
      data = newProfile
    }
    setProfile(data)
    setLoading(false)
  }

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)', gap: 16 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 900, letterSpacing: '0.12em', color: 'var(--fire)' }}>RANKED</div>
      <div className="spinner" />
    </div>
  )

  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {!session ? (
            <>
              <Route path="/auth" element={<Auth />} />
              <Route path="*" element={<Navigate to="/auth" />} />
            </>
          ) : (
            <Route element={<Layout session={session} profile={profile} setProfile={setProfile} />}>
              <Route path="/" element={<Feed session={session} profile={profile} setProfile={setProfile} />} />
              <Route path="/tournaments" element={<Tournaments session={session} profile={profile} setProfile={setProfile} />} />
              <Route path="/leaderboard" element={<Leaderboard session={session} />} />
              <Route path="/post" element={<PostTake session={session} profile={profile} setProfile={setProfile} />} />
              <Route path="/store" element={<Store session={session} profile={profile} setProfile={setProfile} />} />
              <Route path="/profile" element={<Profile session={session} profile={profile} setProfile={setProfile} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Route>
          )}
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  )
}
