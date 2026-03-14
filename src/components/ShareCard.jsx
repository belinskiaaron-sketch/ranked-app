import { useRef, useEffect, useState } from 'react'
import styles from './ShareCard.module.css'

export default function ShareCard({ take, onClose }) {
  const canvasRef = useRef(null)
  const [downloading, setDownloading] = useState(false)
  const [copied, setCopied] = useState(false)

  const total = (take.agree_count||0) + (take.disagree_count||0)
  const agreePct = total > 0 ? Math.round((take.agree_count/total)*100) : 50
  const disagreePct = 100 - agreePct
  const controversy = Math.round(Math.min(agreePct,disagreePct)/50*100)

  useEffect(() => { drawCard() }, [take])

  const drawCard = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = 1080
    canvas.height = 1920

    // Background
    ctx.fillStyle = '#080810'
    ctx.fillRect(0, 0, 1080, 1920)

    // Subtle grid
    ctx.strokeStyle = 'rgba(255,255,255,0.025)'
    ctx.lineWidth = 1
    for (let x = 0; x < 1080; x += 54) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,1920); ctx.stroke() }
    for (let y = 0; y < 1920; y += 54) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(1080,y); ctx.stroke() }

    // Fire glow at top
    const grd = ctx.createRadialGradient(540, 0, 0, 540, 0, 600)
    grd.addColorStop(0, 'rgba(255,69,0,0.15)')
    grd.addColorStop(1, 'transparent')
    ctx.fillStyle = grd
    ctx.fillRect(0, 0, 1080, 600)

    // Top bar
    ctx.fillStyle = '#ff4500'
    ctx.fillRect(0, 0, 1080, 6)

    // Logo
    ctx.font = '900 80px "Barlow Condensed", sans-serif'
    ctx.fillStyle = '#f1f1f8'
    ctx.letterSpacing = '8px'
    ctx.fillText('RANKED', 80, 130)

    // Live dot
    ctx.beginPath()
    ctx.arc(340, 110, 10, 0, Math.PI*2)
    ctx.fillStyle = '#ff4500'
    ctx.fill()

    // Category pill
    ctx.fillStyle = 'rgba(255,255,255,0.06)'
    ctx.beginPath()
    ctx.roundRect(80, 158, 220, 52, 6)
    ctx.fill()
    ctx.font = '700 26px "DM Mono", monospace'
    ctx.fillStyle = '#9999bb'
    ctx.letterSpacing = '3px'
    ctx.fillText(take.category || 'GENERAL', 100, 192)

    // Take text — word wrap
    const words = ('"' + take.text + '"').split(' ')
    let lines = [], line = ''
    ctx.font = '600 62px "Barlow", sans-serif'
    ctx.letterSpacing = '0px'
    for (const word of words) {
      const test = line + (line ? ' ' : '') + word
      if (ctx.measureText(test).width > 920 && line) { lines.push(line); line = word }
      else line = test
    }
    lines.push(line)

    ctx.fillStyle = '#f1f1f8'
    const lineH = 82
    const startY = 620 - ((lines.length-1)*lineH)/2
    lines.forEach((l, i) => ctx.fillText(l, 80, startY + i*lineH))

    // Divider
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(80, 920); ctx.lineTo(1000, 920); ctx.stroke()

    // Vote bar bg
    ctx.fillStyle = '#1e1e2e'
    ctx.beginPath(); ctx.roundRect(80, 960, 920, 20, 4); ctx.fill()
    // Vote bar agree
    ctx.fillStyle = '#ff4500'
    ctx.beginPath(); ctx.roundRect(80, 960, 920*(agreePct/100), 20, 4); ctx.fill()

    // Percentages
    ctx.font = '900 130px "Barlow Condensed", sans-serif'
    ctx.fillStyle = '#ff4500'
    ctx.fillText(`${agreePct}%`, 80, 1120)
    ctx.fillStyle = '#38bdf8'
    ctx.textAlign = 'right'
    ctx.fillText(`${disagreePct}%`, 1000, 1120)
    ctx.textAlign = 'left'

    ctx.font = '600 34px "Barlow", sans-serif'
    ctx.fillStyle = '#55556a'
    ctx.fillText('AGREE', 80, 1160)
    ctx.textAlign = 'right'
    ctx.fillText('DISAGREE', 1000, 1160)
    ctx.textAlign = 'left'

    ctx.font = '500 28px "DM Mono", monospace'
    ctx.fillStyle = '#55556a'
    ctx.textAlign = 'center'
    ctx.fillText(`${total.toLocaleString()} votes`, 540, 1230)
    ctx.textAlign = 'left'

    // Controversy score
    ctx.font = '700 28px "DM Mono", monospace'
    ctx.fillStyle = '#55556a'
    ctx.fillText('CONTROVERSY SCORE', 80, 1330)
    const cColor = controversy > 70 ? '#ff4500' : controversy > 40 ? '#f5c842' : '#38bdf8'
    ctx.font = '900 100px "Barlow Condensed", sans-serif'
    ctx.fillStyle = cColor
    ctx.fillText(`${controversy}/100`, 80, 1440)

    // CTA box
    ctx.fillStyle = '#0f0f1a'
    ctx.strokeStyle = '#1e1e2e'
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.roundRect(80, 1560, 920, 200, 10); ctx.fill(); ctx.stroke()
    ctx.font = '700 44px "Barlow", sans-serif'
    ctx.fillStyle = '#f1f1f8'
    ctx.textAlign = 'center'
    ctx.fillText('What do you think?', 540, 1632)
    ctx.font = '500 30px "DM Mono", monospace'
    ctx.fillStyle = '#ff4500'
    ctx.fillText('rankedapp.io', 540, 1690)
    ctx.textAlign = 'left'

    // Bottom bar
    ctx.fillStyle = '#ff4500'
    ctx.fillRect(0, 1914, 1080, 6)
  }

  const handleDownload = () => {
    setDownloading(true)
    const link = document.createElement('a')
    link.download = `ranked-${Date.now()}.png`
    link.href = canvasRef.current.toDataURL('image/png')
    link.click()
    setTimeout(() => setDownloading(false), 1000)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(`"${take.text}" — ${agreePct}% agree on RANKED. rankedapp.io`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <span className={styles.title}>Share Card</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className={styles.preview}>
          <canvas ref={canvasRef} className={styles.canvas} />
        </div>
        <div className={styles.actions}>
          <button className="btn btn-primary btn-full btn-display" onClick={handleDownload} disabled={downloading}>
            {downloading ? 'Downloading...' : '↓ Download (TikTok / Reels)'}
          </button>
          <button className="btn btn-ghost btn-full" onClick={handleCopy}>
            {copied ? '✓ Copied!' : 'Copy caption text'}
          </button>
        </div>
        <p className={styles.tip}>Post this card on TikTok or Instagram Reels with your reaction for maximum views.</p>
      </div>
    </div>
  )
}
