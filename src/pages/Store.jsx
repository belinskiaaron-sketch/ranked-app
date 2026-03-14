import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { STRIPE_PUBLISHABLE_KEY, PRODUCTS } from '../lib/stripe'
import styles from './Store.module.css'

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY)

export default function Store({ session }) {
  const [loading, setLoading] = useState(null)
  const [tab, setTab] = useState('tokens')

  const urlParams = new URLSearchParams(window.location.search)
  const success = urlParams.get('success')
  const cancelled = urlParams.get('cancelled')
  const product = urlParams.get('product')

  const handleCheckout = async (priceId, productName, mode) => {
    setLoading(priceId)
    try {
      const stripe = await stripePromise
      const { error } = await stripe.redirectToCheckout({
        lineItems: [{ price: priceId, quantity: 1 }],
        mode: mode === 'subscription' ? 'subscription' : 'payment',
        successUrl: `${window.location.origin}/store?success=true&product=${encodeURIComponent(productName)}`,
        cancelUrl: `${window.location.origin}/store?cancelled=true`,
        customerEmail: session.user.email,
      })
      if (error) console.error(error)
    } catch (err) {
      console.error(err)
    }
    setLoading(null)
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.topbar}>
        <h1 className={styles.pageTitle}>Store</h1>
        <div className={styles.tokenBadge}>⚡ Your tokens</div>
      </div>

      {success && (
        <div className={styles.successBanner}>
          Payment successful! {product} added to your account.
        </div>
      )}
      {cancelled && (
        <div className={styles.cancelBanner}>
          Payment cancelled — no charge was made.
        </div>
      )}

      <div className={styles.content}>
        <div className={styles.tabs}>
          <button className={`${styles.tab} ${tab === 'tokens' ? styles.tabActive : ''}`} onClick={() => setTab('tokens')}>Token Packs</button>
          <button className={`${styles.tab} ${tab === 'subscriptions' ? styles.tabActive : ''}`} onClick={() => setTab('subscriptions')}>Subscriptions</button>
        </div>

        {tab === 'tokens' && (
          <>
            <div className={styles.sectionDesc}>Heat Tokens power your wagers. The more you wager, the higher you climb when your take wins.</div>
            <div className={styles.tokenGrid}>
              {PRODUCTS.tokens.map(p => (
                <div key={p.id} className={`${styles.tokenCard} ${p.featured ? styles.featured : ''}`}>
                  {p.featured && <div className={styles.featuredBadge}>MOST POPULAR</div>}
                  <div className={styles.tokenAmount} style={{ color: p.color }}>{p.tokens.toLocaleString()}</div>
                  <div className={styles.tokenLabel}>HEAT TOKENS</div>
                  <div className={styles.tokenName}>{p.name}</div>
                  <div className={styles.tokenPer}>${(p.price / p.tokens * 100).toFixed(2)}c per token</div>
                  <button
                    className={styles.buyBtn}
                    onClick={() => handleCheckout(p.priceId, p.name, 'payment')}
                    disabled={loading === p.priceId}
                    style={{ borderColor: p.color, color: p.featured ? '#000' : p.color, background: p.featured ? p.color : 'transparent' }}
                  >
                    {loading === p.priceId ? 'Loading...' : `$${p.price}`}
                  </button>
                </div>
              ))}
            </div>
            <div className={styles.tokenInfo}>
              <div className={styles.tokenInfoTitle}>WHAT ARE HEAT TOKENS?</div>
              <div className={styles.tokenInfoGrid}>
                <div className={styles.tokenInfoItem}><span className={styles.tiIcon}>⚡</span><span>Wager tokens when you drop a take — higher wager = higher leaderboard if you win</span></div>
                <div className={styles.tokenInfoItem}><span className={styles.tiIcon}>🏆</span><span>Enter tournaments with tokens — win back more if your take tops the bracket</span></div>
                <div className={styles.tokenInfoItem}><span className={styles.tiIcon}>🎁</span><span>Earn free tokens daily by voting and staying active</span></div>
              </div>
            </div>
          </>
        )}

        {tab === 'subscriptions' && (
          <>
            <div className={styles.sectionDesc}>Unlock the full Ranked experience. Cancel anytime.</div>
            <div className={styles.subGrid}>
              {PRODUCTS.subscriptions.map(plan => (
                <div key={plan.id} className={`${styles.subCard} ${plan.featured ? styles.subFeatured : ''}`}>
                  {plan.featured && <div className={styles.featuredBadge}>RECOMMENDED</div>}
                  <div className={styles.planName} style={{ color: plan.color }}>{plan.name}</div>
                  <div className={styles.planPrice}>
                    <span className={styles.planPriceAmount}>${plan.price}</span>
                    <span className={styles.planPricePer}>/month</span>
                  </div>
                  <div className={styles.perksList}>
                    {plan.perks.map((perk, i) => (
                      <div key={i} className={styles.perk}>
                        <span className={styles.perkCheck} style={{ color: plan.color }}>✓</span>
                        <span>{perk}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    className={styles.subBtn}
                    onClick={() => handleCheckout(plan.priceId, plan.name, 'subscription')}
                    disabled={loading === plan.priceId}
                    style={{ background: plan.featured ? plan.color : 'transparent', color: plan.featured ? '#000' : plan.color, borderColor: plan.color }}
                  >
                    {loading === plan.priceId ? 'Loading...' : `Get ${plan.name} →`}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
