import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, letterSpacing: '0.1em', color: 'var(--fire)' }}>RANKED</div>
    </div>
  )

  return (
    <BrowserRouter>
      <Routes>
        {!session ? (
          <>
            <Route path="/auth" element={<Auth />} />
            <Route path="*" element={<Navigate to="/auth" />} />
          </>
        ) : (
          <Route element={<Layout session={session} />}>
            <Route path="/" element={<Feed session={session} />} />
            <Route path="/tournaments" element={<Tournaments session={session} />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/post" element={<PostTake session={session} />} />
            <Route path="/profile" element={<Profile session={session} />} />
            <Route path="/store" element={<Store session={session} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        )}
      </Routes>
    </BrowserRouter>
  )
}
