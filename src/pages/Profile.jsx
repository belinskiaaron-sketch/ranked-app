import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useToast } from '../components/Toast'
import styles from './Profile.module.css'

const getHeat = (t) => {
  const total = (t.agree_count||0)+(t.disagree_count||0)
  const controversy = total>0 ? Math.min(t.agree_count,t.disagree_count)/total : 0
  return Math.round(total*0.5 + controversy*total*10)
}

export default function Profile({ session, profile, setProfile }) {
  const [takes, setTakes] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [username, setUsername] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const toast = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    fetchTakes()
    if (profile) setUsername(profile.username || '')
  }, [profile])

  const fetchTakes = async () => {
    const { data } = await supabase.from('takes').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false })
    setTakes(data || [])
    setLoading(false)
  }

  const saveProfile = async () => {
    if (!username.trim()) { toast('Username cannot be empty.', 'error'); return }
    setSaving(true)
    const { error } = await supabase.from('profiles').update({ username: username.trim(), updated_at: new Date().toISOString() }).eq('id', session.user.id)
    if (error) { toast('Failed to save. Try again.', 'error') }
    else {
      if (setProfile) setProfile(p => ({ ...p, username: username.trim() }))
      toast('Profile updated!', 'success')
      setEditing(false)
    }
    setSaving(false)
  }

  const deleteTake = async (id) => {
    await supabase.from('takes').delete().eq('id', id)
    setTakes(prev => prev.filter(t => t.id !== id))
    setDeleteConfirm(null)
    toast('Take deleted.', 'info')
  }

  const totalVotes = takes.reduce((s,t) => s+(t.agree_count||0)+(t.disagree_count||0), 0)
  const totalAgree = takes.reduce((s,t) => s+(t.agree_count||0), 0)
  const agreeRate = totalVotes > 0 ? Math.round((totalAgree/totalVotes)*100) : 0
  const totalHeat = takes.reduce((s,t) => s+getHeat(t), 0)
  const initials = (profile?.username || session.user.email || 'U').slice(0,2).toUpperCase()

  return (
    <div className={styles.wrap}>
      <div className={styles.topbar}>
        <h1 className={styles.pageTitle}>Profile</h1>
        <button className="btn btn-primary btn-display btn-sm" onClick={() => navigate('/store')}>⚡ Get Tokens</button>
      </div>

      <div className={styles.content}>
        {/* PROFILE HEADER */}
        <div className={`${styles.profileCard} card`}>
          <div className={styles.profileTop}>
            <div className={styles.avatar}>{initials}</div>
            <div className={styles.profileInfo}>
              {editing ? (
                <div className={styles.editRow}>
                  <input className={`input ${styles.usernameInput}`} value={username} onChange={e=>setUsername(e.target.value)} placeholder="username" maxLength={30} autoFocus />
                  <button className="btn btn-primary btn-sm" onClick={saveProfile} disabled={saving}>{saving?'Saving...':'Save'}</button>
                  <button className="btn btn-ghost btn-sm" onClick={()=>setEditing(false)}>Cancel</button>
                </div>
              ) : (
                <div className={styles.nameRow}>
                  <span className={styles.profileName}>@{profile?.username || 'set username'}</span>
                  <button className={styles.editBtn} onClick={()=>setEditing(true)}>Edit</button>
                </div>
              )}
              <div className={styles.profileEmail}>{session.user.email}</div>
            </div>
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statBox}>
              <div className={styles.statNum} style={{color:'var(--gold)'}}>⚡{(profile?.heat_tokens||0).toLocaleString()}</div>
              <div className={styles.statLbl}>Tokens</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statNum} style={{color:'var(--fire)'}}>{takes.length}</div>
              <div className={styles.statLbl}>Takes</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statNum} style={{color:'var(--ice)'}}>{totalVotes.toLocaleString()}</div>
              <div className={styles.statLbl}>Total Votes</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statNum} style={{color:'var(--green)'}}>{totalHeat.toLocaleString()}</div>
              <div className={styles.statLbl}>Total Heat</div>
            </div>
          </div>
        </div>

        {/* MY TAKES */}
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitle}>Your Takes</div>
          <button className="btn btn-primary btn-display btn-sm" onClick={() => navigate('/post')}>+ New Take</button>
        </div>

        {loading ? (
          <div className={styles.loading}><div className="spinner" /></div>
        ) : takes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔥</div>
            <div className="empty-title">No takes yet</div>
            <div className="empty-sub">Drop your first hot take and see how people vote</div>
            <button className="btn btn-primary btn-display" onClick={()=>navigate('/post')}>Drop a Take</button>
          </div>
        ) : (
          <div className={styles.takesList}>
            {takes.map(take => {
              const total = (take.agree_count||0)+(take.disagree_count||0)
              const pct = total>0 ? Math.round((take.agree_count/total)*100) : 50
              return (
                <div key={take.id} className={`${styles.takeRow} card`}>
                  <div className={styles.takeInfo}>
                    <div className={styles.takeMeta}>
                      <span className="cat-chip">{take.category}</span>
                      <span className={styles.takeDate}>{new Date(take.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className={styles.takeText}>"{take.text}"</p>
                    <div className={styles.takeStats}>
                      <span style={{color:'var(--fire)'}}>{pct}% agree</span>
                      <span className={styles.dot2}>·</span>
                      <span>{total.toLocaleString()} votes</span>
                      <span className={styles.dot2}>·</span>
                      <span style={{color:'var(--gold)'}}>⚡{getHeat(take).toLocaleString()} heat</span>
                    </div>
                  </div>
                  <div className={styles.takeActions}>
                    <div className="vote-bar-track" style={{width:80}}>
                      <div className="vote-bar-fill" style={{width:`${pct}%`}} />
                    </div>
                    <button className={styles.deleteBtn} onClick={()=>setDeleteConfirm(take.id)}>Delete</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* UPGRADE CARD */}
        <div className={styles.upgradeCard}>
          <div className={styles.upgradeBadge}>FREE PLAN</div>
          <div className={styles.upgradeTitle}>Unlock Creator Pro</div>
          <p className={styles.upgradeDesc}>Featured placement, full analytics, host your own tournaments, revenue share, and a verified badge.</p>
          <button className="btn btn-gold btn-display btn-lg" onClick={()=>navigate('/store')}>Upgrade — $9.99/mo</button>
        </div>
      </div>

      {/* DELETE CONFIRM MODAL */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={()=>setDeleteConfirm(null)}>
          <div className="modal" style={{maxWidth:380}} onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Delete Take?</span>
              <button className="modal-close" onClick={()=>setDeleteConfirm(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{fontSize:14,color:'var(--text2)',lineHeight:1.6}}>This permanently deletes the take and all its votes. This can't be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={()=>setDeleteConfirm(null)}>Keep it</button>
              <button className="btn btn-danger" onClick={()=>deleteTake(deleteConfirm)}>Yes, delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
