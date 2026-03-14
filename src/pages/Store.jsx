import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { PRODUCTS } from '../lib/stripe'
import styles from './Store.module.css'

export default function Store({ session }) {
  const [loading, setLoading] = useState(null)
  const [error, setError] = useState('')
  const [tokens, setTokens] = useState(1000)
  const isSuccess = new URLSearchParams(window.location.search).get('success')
  const isCancelled = new URLSearchParams(window.location.search).get('cancelled')

  useEffect(() => {
    fetchTokens()
  }, [])

  const fetchTokens = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('heat_tokens')
      .eq('id', session.user.id)
      .single()
    if (data) setTokens(data.heat_tokens)
  }

  const handleCheckout = async (product, mode) => {
    setLoading(product.id)
    setError('')

    try {
      // Call edge function directly via fetch for reliability
      const { data: { session: authSession } } = await supabase.auth.getSession()
      const token = authSession?.access_token

      const res = await fetch(
        'https://pvedlsqerrrfbrlbaong.supabase.co/functions/v1/create-checkout',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2ZWRsc3FlcnJyZmJybGJhb25nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MzY2MTEsImV4cCI6MjA4OTAxMjYxMX0.lyK8C89Giktw6VPpWRSWurKRwQ_BsoUQjl86it-lg8M',
          },
          body: JSON.stringify({
            priceId: product.priceId,
            mode,
            userId: session.user.id,
            successUrl: `${window.location.origin}/store?success=true`,
            cancelUrl: `${window.location.origin}/store?cancelled=true`,
          }),
        }
      )

      const data = await res.json()
      if (data.error) throw new Error(data.error)
      if (data.url) window.location.href = data.url
      else throw new Error('No checkout URL returned')
    } catch (err) {
      console.error('Checkout error:', err)
      setError(`Checkout failed: ${err.message}. Make sure the Edge Function is deployed in Supabase.`)
    }
    setLoading(null)
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.topbar}>
        <h1 className={styles.pageTitle}>Store</h1>
        <div className={styles.tokenBadge}>
          <span className={styles.tokenIcon}>⚡</span>
          {tokens.toLocaleString()} tokens
        </div>
      </div>

      <div className={styles.content}>
        {isSuccess && (
          <div className={styles.successBanner}>
            ✓ Payment successful — your tokens will appear shortly!
          </div>
        )}
        {isCancelled && (
          <div className={styles.cancelBanner}>
            Payment cancelled — no charge was made.
          </div>
        )}
        {error && (
          <div className={styles.errorBanner}>
            {error}
          </div>
        )}

        {/* TOKEN PACKS */}
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitle}>Heat Token Packs</div>
          <div className={styles.sectionSub}>ONE-TIME PURCHASE · USE TO WAGER ON TAKES</div>
        </div>

        <div className={styles.tokenGrid}>
          {PRODUCTS.tokens.map(product => (
            <div
              key={product.id}
              className={`${styles.tokenCard} ${product.id === 'pro' ? styles.featured : ''}`}
            >
              {product.tag && (
                <div className={styles.cardTag} style={{ color: product.color, borderColor: product.color }}>
                  {product.tag}
                </div>
              )}
              <div className={styles.tokenAmount} style={{ color: product.color }}>
                {product.tokens.toLocaleString()}
              </div>
              <div className={styles.tokenLabel}>HEAT TOKENS</div>
              <div className={styles.tokenPrice}>${product.price}</div>
              <div className={styles.tokenPer}>
                ${(product.price / product.tokens * 100).toFixed(1)}¢ per 100 tokens
              </div>
              <button
                className={styles.buyBtn}
                style={{
                  background: product.id === 'starter' ? 'var(--ice)' : product.id === 'pro' ? 'var(--fire)' : 'var(--gold)',
                  color: product.id === 'whale' ? '#000' : '#fff'
                }}
                onClick={() => handleCheckout(product, 'payment')}
                disabled={!!loading}
              >
                {loading === product.id ? 'Loading...' : `Buy for $${product.price}`}
              </button>
            </div>
          ))}
        </div>

        {/* SUBSCRIPTIONS */}
        <div className={styles.sectionHeader} style={{ marginTop: 40 }}>
          <div className={styles.sectionTitle}>Subscriptions</div>
          <div className={styles.sectionSub}>MONTHLY · CANCEL ANYTIME</div>
        </div>

        <div className={styles.subGrid}>
          {PRODUCTS.subscriptions.map(product => (
            <div
              key={product.id}
              className={`${styles.subCard} ${product.id === 'creator' ? styles.featuredSub : ''}`}
            >
              {product.tag && (
                <div className={styles.cardTag} style={{ color: product.color, borderColor: product.color }}>
                  {product.tag}
                </div>
              )}
              <div className={styles.subName} style={{ color: product.color }}>{product.name}</div>
              <div className={styles.subPrice}>
                <span className={styles.subAmount}>${product.price}</span>
                <span className={styles.subPer}>/mo</span>
              </div>
              <div className={styles.featureList}>
                {product.features.map((f, i) => (
                  <div key={i} className={styles.feature}>
                    <span className={styles.featureCheck} style={{ color: product.color }}>✓</span>
                    {f}
                  </div>
                ))}
              </div>
              <button
                className={styles.subBtn}
                style={{
                  background: product.id === 'creator' ? 'var(--gold)' : 'transparent',
                  color: product.id === 'creator' ? '#000' : 'var(--ice)',
                  border: product.id === 'creator' ? '1px solid var(--gold)' : '1px solid var(--ice)',
                }}
                onClick={() => handleCheckout(product, 'subscription')}
                disabled={!!loading}
              >
                {loading === product.id ? 'Loading...' : `Subscribe — $${product.price}/mo`}
              </button>
            </div>
          ))}
        </div>

        <div className={styles.sharePromo}>
          <div className={styles.sharePromoTitle}>EVERY TAKE GETS A SHARE CARD</div>
          <div className={styles.sharePromoText}>
            Drop a take, vote on battles, and share your results as a TikTok-ready card. Creator Pro members get animated cards with their stats.
          </div>
        </div>
      </div>
    </div>
  )
}
