import { useRef, useEffect, useState } from 'react'
import styles from './ShareCard.module.css'

export default function ShareCard({ take, onClose }) {
  const canvasRef = useRef(null)
  const [downloading, setDownloading] = useState(false)
  const [copied, setCopied] = useState(false)

  const total = (take.agree_count || 0) + (take.disagree_count || 0)
  const agreePct = total > 0 ? Math.round((take.agree_count / total) * 100) : 50
  const disagreePct = 100 - agreePct

  useEffect(() => {
    drawCard()
  }, [take])

  const drawCard = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    // Canvas size — 9:16 TikTok ratio
    canvas.width = 1080
    canvas.height = 1920

    // Background
    ctx.fillStyle = '#0b0b0b'
    ctx.fillRect(0, 0, 1080, 1920)

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.03)'
    ctx.lineWidth = 1
    for (let x = 0; x < 1080; x += 60) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 1920); ctx.stroke()
    }
    for (let y = 0; y < 1920; y += 60) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1080, y); ctx.stroke()
    }

    // Top accent bar
    ctx.fillStyle = '#ff3c00'
    ctx.fillRect(0, 0, 1080, 8)

    // RANKED logo
    ctx.fillStyle = '#f0f0f0'
    ctx.font = 'bold 72px serif'
    ctx.letterSpacing = '12px'
    ctx.fillText('RANKED', 80, 120)

    // Category pill
    ctx.fillStyle = 'rgba(255,60,0,0.15)'
    ctx.beginPath()
    ctx.roundRect(80, 150, 200, 48, 6)
    ctx.fill()
    ctx.fillStyle = '#ff3c00'
    ctx.font = '28px monospace'
    ctx.fillText(take.category || 'GENERAL', 100, 183)

    // Take text
    const words = `"${take.text}"`.split(' ')
    let lines = []
    let currentLine = ''
    const maxWidth = 920
    ctx.font = '600 58px sans-serif'
    for (let word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word
      if (ctx.measureText(testLine).width > maxWidth && currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    }
    lines.push(currentLine)

    ctx.fillStyle = '#f0f0f0'
    ctx.font = '600 58px sans-serif'
    const startY = 700 - (lines.length * 80) / 2
    lines.forEach((line, i) => {
      ctx.fillText(line, 80, startY + i * 82)
    })

    // Divider
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(80, 900)
    ctx.lineTo(1000, 900)
    ctx.stroke()

    // Vote bar background
    ctx.fillStyle = '#1e1e1e'
    ctx.beginPath()
    ctx.roundRect(80, 940, 920, 24, 4)
    ctx.fill()

    // Vote bar agree fill
    ctx.fillStyle = '#ff3c00'
    ctx.beginPath()
    ctx.roundRect(80, 940, 920 * (agreePct / 100), 24, 4)
    ctx.fill()

    // Vote percentages
    ctx.font = 'bold 120px serif'
    ctx.fillStyle = '#ff3c00'
    ctx.fillText(`${agreePct}%`, 80, 1120)
    ctx.fillStyle = '#00aaff'
    ctx.textAlign = 'right'
    ctx.fillText(`${disagreePct}%`, 1000, 1120)
    ctx.textAlign = 'left'

    // Labels
    ctx.font = '36px monospace'
    ctx.fillStyle = '#666'
    ctx.fillText('AGREE', 80, 1160)
    ctx.textAlign = 'right'
    ctx.fillText('DISAGREE', 1000, 1160)
    ctx.textAlign = 'left'

    // Total votes
    ctx.font = '32px monospace'
    ctx.fillStyle = '#444'
    ctx.textAlign = 'center'
    ctx.fillText(`${total.toLocaleString()} votes`, 540, 1240)
    ctx.textAlign = 'left'

    // Controversy meter label
    const controversy = Math.round(Math.min(agreePct, disagreePct) / 50 * 100)
    ctx.font = '28px monospace'
    ctx.fillStyle = '#666'
    ctx.fillText('CONTROVERSY SCORE', 80, 1340)
    ctx.font = 'bold 80px serif'
    ctx.fillStyle = controversy > 70 ? '#ff3c00' : controversy > 40 ? '#ffd000' : '#00aaff'
    ctx.fillText(`${controversy}/100`, 80, 1430)

    // CTA box
    ctx.fillStyle = '#141414'
    ctx.beginPath()
    ctx.roundRect(80, 1540, 920, 180, 8)
    ctx.fill()
    ctx.strokeStyle = '#2a2a2a'
    ctx.lineWidth = 1
    ctx.stroke()

    ctx.font = 'bold 40px sans-serif'
    ctx.fillStyle = '#f0f0f0'
    ctx.textAlign = 'center'
    ctx.fillText('Do you agree?', 540, 1610)
    ctx.font = '30px monospace'
    ctx.fillStyle = '#ff3c00'
    ctx.fillText('Drop your take @ rankedapp.io', 540, 1660)
    ctx.textAlign = 'left'

    // Bottom bar
    ctx.fillStyle = '#ff3c00'
    ctx.fillRect(0, 1912, 1080, 8)
  }

  const handleDownload = () => {
    setDownloading(true)
    const canvas = canvasRef.current
    const link = document.createElement('a')
    link.download = `ranked-take-${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
    setTimeout(() => setDownloading(false), 1000)
  }

  const handleCopyText = () => {
    const text = `"${take.text}" — ${agreePct}% agree, ${disagreePct}% disagree on RANKED. Drop your take: rankedapp.io`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>SHARE CARD</div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.preview}>
          <canvas ref={canvasRef} className={styles.canvas} />
        </div>

        <div className={styles.actions}>
          <button className="btn btn-primary" onClick={handleDownload} disabled={downloading}>
            {downloading ? 'Downloading...' : '↓ Download for TikTok/Instagram'}
          </button>
          <button className="btn btn-ghost" onClick={handleCopyText}>
            {copied ? '✓ Copied!' : 'Copy caption text'}
          </button>
        </div>

        <div className={styles.tip}>
          Best for TikTok, Instagram Reels, and Twitter. Show this card + your reaction on camera for maximum engagement.
        </div>
      </div>
    </div>
  )
}
