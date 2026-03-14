import { useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import styles from './Layout.module.css'

const NAV = [
  { to: '/', label: 'Feed', icon: '⚡', end: true },
  { to: '/tournaments', label: 'Tournaments', icon: '🏆' },
  { to: '/leaderboard', label: 'Leaderboard', icon: '▲' },
  { to: '/post', label: 'Drop Take', icon: '+', highlight: true },
  { to: '/store', label: 'Store', icon: '💎' },
  { to: '/profile', label: 'Profile', icon: '◉' },
]

export default function Layout({ session, profile, setProfile }) {
  const navigate = useNavigate()
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = async () => {
    setSigningOut(true)
    await supabase.auth.signOut()
    navigate('/auth')
  }

  const initials = (profile?.username || session.user.email || 'U').slice(0, 2).toUpperCase()

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.logoWrap}>
          <div className={styles.logoDot} />
          <span className={styles.logo}>RANKED</span>
        </div>

        <nav className={styles.nav}>
          {NAV.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''} ${item.highlight ? styles.highlight : ''}`
              }
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
              {item.highlight && <span className={styles.newBadge}>NEW</span>}
            </NavLink>
          ))}
        </nav>

        <div className={styles.spacer} />

        <div className={styles.sidebarBottom}>
          {profile && (
            <div className={styles.tokenRow}>
              <span className={styles.tokenIcon}>⚡</span>
              <span className={styles.tokenVal}>{(profile.heat_tokens || 0).toLocaleString()}</span>
              <span className={styles.tokenLabel}>tokens</span>
            </div>
          )}
          <div className={styles.userRow}>
            <div className={styles.avatar}>{initials}</div>
            <div className={styles.userInfo}>
              <div className={styles.userName}>@{profile?.username || 'you'}</div>
              <div className={styles.userEmail}>{session.user.email}</div>
            </div>
          </div>
          <button
            className={`btn btn-ghost btn-sm btn-full ${styles.signOutBtn}`}
            onClick={handleSignOut}
            disabled={signingOut}
          >
            {signingOut ? 'Signing out...' : 'Sign out'}
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className={styles.mobileNav}>
        {NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `${styles.mobileNavItem} ${isActive ? styles.mobileActive : ''} ${item.highlight ? styles.mobileHighlight : ''}`
            }
          >
            <span className={styles.mobileIcon}>{item.icon}</span>
            <span className={styles.mobileLabel}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
