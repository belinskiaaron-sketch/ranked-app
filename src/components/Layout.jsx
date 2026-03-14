import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import styles from './Layout.module.css'

export default function Layout({ session }) {
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/auth')
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <div className={styles.logoDot} />
          RANKED
        </div>

        <div className={styles.navSection}>APP</div>
        <NavLink to="/" end className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
          <span className={styles.navIcon}>⚡</span> Live Feed
        </NavLink>
        <NavLink to="/tournaments" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
          <span className={styles.navIcon}>⬡</span> Tournaments
        </NavLink>
        <NavLink to="/leaderboard" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
          <span className={styles.navIcon}>▲</span> Leaderboard
        </NavLink>
        <NavLink to="/post" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
          <span className={styles.navIcon}>+</span> Drop Take
        </NavLink>
        <NavLink to="/store" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
          <span className={styles.navIcon}>$</span> Store
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
          <span className={styles.navIcon}>◉</span> Profile
        </NavLink>

        <div className={styles.spacer} />

        <div className={styles.sidebarBottom}>
          <div className={styles.userInfo}>
            <div className={styles.userEmail}>{session.user.email}</div>
          </div>
          <button className={`btn btn-ghost ${styles.signOutBtn}`} onClick={handleSignOut}>Sign Out</button>
        </div>
      </aside>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
