import { useRef } from 'react'
import styles from './ShareCard.module.css'

export default function ShareCard({ take, onClose }) {
  const cardRef = useRef(null)

  const total = (take.agree_count || 0) + (take.disagree_count || 0)
  const agreePct = total > 0 ? Math.round((take.agree_count / total) * 100) : 50
  const disagreePct = 100 - agreePct

  const handleDownload = () => {
    import('html2canvas').then(({ default: html2canvas }) => {
      html2canvas(cardRef.current, {
        scale: 3,
        backgroundColor: '#0b0b0b',
        useCORS: true,
      }).then(canvas => {
        const link = document.createElement('a')
        link.download = `ranked-take-${Date.now()}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
      })
    })
  }

  const handleCopyLink = () => {
    const text = `"${take.text}" — ${agreePct}% agree on RANKED. Drop your take: ${window.location.origin}`
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>Share this take</div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.cardWrap}>
          <div ref={cardRef} className={styles.shareCard}>
            <div className={styles.scHeader}>
              <div className={styles.scLogo}>RANKED</div>
              <div className={styles.scCategory}>{take.category}</div>
            </div>

            <div className={styles.scTake}>"{take.text}"</div>

            <div className={styles.scVotes}>
              <div className={styles.scVoteBar}>
                <div className={styles.scAgreeFill} style={{ width: `${agreePct}%` }} />
                <div className={styles.scDisagreeFill} style={{ width: `${disagreePct}%` }} />
              </div>
              <div className={styles.scVoteNums}>
                <span className={styles.scAgree}>{agreePct}% AGREE</span>
                <span className={styles.scDisagree}>{disagreePct}% DISAGREE</span>
              </div>
            </div>

            <div className={styles.scFooter}>
              <div className={styles.scTotal}>{total.toLocaleString()} votes</div>
              <div className={styles.scCta}>What's your take? →</div>
            </div>

            <div className={styles.scUrl}>{window.location.origin}</div>
          </div>
        </div>

        <div className={styles.actions}>
          <button className="btn btn-primary" onClick={handleDownload}>
            Download for TikTok/Instagram
          </button>
          <button className="btn btn-ghost" onClick={handleCopyLink}>
            Copy link text
          </button>
        </div>

        <div className={styles.tip}>
          💡 Post this as a TikTok/Reel with a reaction — controversy drives views
        </div>
      </div>
    </div>
  )
}
