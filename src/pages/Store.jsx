import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { PRODUCTS } from '../lib/stripe'
import { useToast } from '../components/Toast'
import styles from './Store.module.css'

export default function Store({ session, profile, setProfile }) {
  const isSuccess = new URLSearchParams(window.location.search).get('success')
  const isCancelled = new URLSearchParams(window.location.search).get('cancelled')
  const toast = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    if (isSuccess) toast('🎉 Payment successful! Tokens coming shortly.', 'success')
    if (isCancelled) toast('Payment cancelled. No charge was made.', 'info')
  }, [])

  const handleBuy = (paymentLink) => {
    const successUrl = encodeURIComponent(`${window.location.origin}/store?success=true`)
    const cancelUrl = encodeURIComponent(`${window.location.origin}/store?cancelled=true`)
    window.location.href = `${paymentLink}?success_url=${successUrl}&cancel_url=${cancelUrl}`
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.topbar}>
        <h1 className={styles.pageTitle}>Store</h1>
        <div className={styles.tokenBadge}>
          <span>⚡</span>
          <span>{(profile?.heat_tokens || 0).toLocaleString()} tokens</span>
        </div>
      </div>

      <div className={styles.content}>
        {/* TOKENS */}
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitle}>Heat Token Packs</div>
          <p className={styles.sectionSub}>Wager on takes, enter tournaments, and climb the leaderboard.</p>
        </div>

        <div className={styles.tokenGrid}>
          {PRODUCTS.tokens.map(p => (
            <div key={p.id} className={`${styles.tokenCard} card card-hover ${p.id==='pro'?styles.featuredCard:''}`}>
              {p.tag && <div className={`badge ${p.id==='pro'?'badge-fire':p.id==='whale'?'badge-gold':'badge-ice'}`} style={{marginBottom:12}}>{p.tag}</div>}
              <div className={styles.tokenAmt} style={{color:p.id==='starter'?'var(--ice)':p.id==='pro'?'var(--fire)':'var(--gold)'}}>
                {p.tokens.toLocaleString()}
              </div>
              <div className={styles.tokenLbl}>HEAT TOKENS</div>
              <div className={styles.tokenPrice}>${p.price}</div>
              <div className={styles.tokenPer}>${(p.price/p.tokens*100).toFixed(1)}¢ per 100</div>
              <button
                className={`btn btn-full btn-display ${p.id==='pro'?'btn-primary':p.id==='whale'?'btn-gold':'btn-ice'}`}
                onClick={() => handleBuy(p.paymentLink)}
              >
                Buy for ${p.price}
              </button>
            </div>
          ))}
        </div>

        {/* SUBSCRIPTIONS */}
        <div className={styles.sectionHeader} style={{marginTop:36}}>
          <div className={styles.sectionTitle}>Subscriptions</div>
          <p className={styles.sectionSub}>Unlock the full platform. Cancel anytime.</p>
        </div>

        <div className={styles.subGrid}>
          {PRODUCTS.subscriptions.map(p => (
            <div key={p.id} className={`${styles.subCard} card ${p.id==='creator'?styles.featuredSub:''}`}>
              {p.tag && <div className="badge badge-gold" style={{marginBottom:12}}>{p.tag}</div>}
              <div className={styles.subName} style={{color:p.id==='explorer'?'var(--ice)':'var(--gold)'}}>{p.name}</div>
              <div className={styles.subPrice}><span className={styles.subAmt}>${p.price}</span><span className={styles.subPer}>/mo</span></div>
              <ul className={styles.features}>
                {p.features.map((f,i) => (
                  <li key={i} className={styles.feature}>
                    <span style={{color:p.id==='explorer'?'var(--ice)':'var(--gold)'}}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <button
                className={`btn btn-full btn-display btn-lg ${p.id==='creator'?'btn-gold':'btn-ice'}`}
                onClick={() => handleBuy(p.paymentLink)}
              >
                Subscribe — ${p.price}/mo
              </button>
            </div>
          ))}
        </div>

        {/* HOW TOKENS WORK */}
        <div className={styles.howSection}>
          <div className={styles.howTitle}>How Heat Tokens Work</div>
          <div className={styles.howGrid}>
            <div className={styles.howItem}><div className={styles.howIcon}>⚡</div><div><strong>Wager to post</strong><p>Every take costs tokens to drop. Higher wager = more leaderboard exposure.</p></div></div>
            <div className={styles.howItem}><div className={styles.howIcon}>🏆</div><div><strong>Enter tournaments</strong><p>Spend tokens to enter. Winners earn the prize pool.</p></div></div>
            <div className={styles.howItem}><div className={styles.howIcon}>🔥</div><div><strong>Win them back</strong><p>Top takes earn bonus tokens. Make it to the leaderboard and you earn daily.</p></div></div>
            <div className={styles.howItem}><div className={styles.howIcon}>💎</div><div><strong>Get 1,000 free</strong><p>Every new account starts with 1,000 tokens. No purchase needed to start.</p></div></div>
          </div>
        </div>
      </div>
    </div>
  )
}
