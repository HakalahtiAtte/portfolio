import { useEffect, useRef, useState, useCallback } from 'react'
import { useLang } from '../context/AppContext'
import { ui } from '../data/content'
import styles from './SeagullGame.module.css'

// ─── CONSTANTS ───────────────────────────────────────────
const W = 700
const H = 420
const GRAVITY = 0.05
const LAUNCH_POWER = 0.10
const SKY_H = H * 0.62
const GROUND_Y = SKY_H
const CAR_COLORS = ['#c5c5c5','#8a8a8a','#5a5a5a','#737373','#a0a0a0','#4a4a4a']
const BIRDS_PER_ROUND = 3
const POOPS_PER_BIRD  = 3
const SLING_X = 90
const SLING_Y = GROUND_Y - 55

// ─── HELPERS ─────────────────────────────────────────────
function dist(a, b) { return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2) }

function makeBirdObj() {
  return { x: SLING_X, y: SLING_Y, vx: 0, vy: 0, r: 13, launched: false, trail: [], rollAngle: 0, landTimer: 0 }
}

function makeCars() {
  const cars = []
  const rows = [GROUND_Y + 28, GROUND_Y + 100]
  const cols  = [60, 160, 260, 360, 460, 570]
  for (const row of rows) {
    for (const x of cols) {
      if (Math.random() > 0.18) {
        cars.push({
          x, y: row, w: 78,
          color: CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)],
          hit: false, hitTimer: 0, roofY: -18,
        })
      }
    }
  }
  return cars
}

function adjustColor(hex, amt) {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.max(0, Math.min(255, (n >> 16) + amt))
  const g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + amt))
  const b = Math.max(0, Math.min(255, (n & 0xff) + amt))
  return `rgb(${r},${g},${b})`
}

// ─── MAIN COMPONENT ──────────────────────────────────────
export default function SeagullGame() {
  const { lang } = useLang()
  const t = ui[lang].game
  const tRef = useRef(t)

  const canvasRef = useRef(null)
  const stateRef  = useRef(null)
  const rafRef    = useRef(null)
  const dragRef   = useRef(null)

  const [score,     setScore]     = useState(0)
  const [hits,      setHits]      = useState(0)
  const [phase,     setPhase]     = useState('aim')
  const [best,      setBest]      = useState(0)
  const [birdsLeft, setBirdsLeft] = useState(BIRDS_PER_ROUND - 1)
  const [poopsLeft, setPoopsLeft] = useState(POOPS_PER_BIRD)

  useEffect(() => { tRef.current = t }, [t])

  // ── STATE FACTORY ──────────────────────────────────────
  function initState() {
    return {
      phase: 'aim',
      bird: makeBirdObj(),
      birdsLeft: BIRDS_PER_ROUND - 1,
      poopsLeft: POOPS_PER_BIRD,
      poops: [],
      splats: [],
      floaters: [],
      shake: { ox: 0, oy: 0, frames: 0 },
      cars: makeCars(),
      score: 0,
      hits: 0,
      combo: 1,
      comboTimer: 0,
      wind: (Math.random() - 0.5) * 0.04,
      clouds: Array.from({length:5}, (_, i) => ({
        x: 80 + i * 130, y: 30 + Math.random() * 60,
        w: 60 + Math.random() * 50, speed: 0.12 + Math.random() * 0.12,
      })),
      trees: Array.from({length:6}, (_, i) => ({
        x: 30 + i * 110 + Math.random() * 30, h: 28 + Math.random() * 22,
      })),
    }
  }

  // Advance to next bird or show result when all birds used
  function advanceBird(s) {
    if (s.birdsLeft > 0) {
      s.birdsLeft--
      s.bird      = makeBirdObj()
      s.poopsLeft = POOPS_PER_BIRD
      s.poops     = []
      s.combo     = 1
      s.comboTimer = 0
      s.wind      = (Math.random() - 0.5) * 0.04
      s.phase     = 'aim'
      setPhase('aim')
      setBirdsLeft(s.birdsLeft)
      setPoopsLeft(POOPS_PER_BIRD)
    } else {
      s.phase = 'result'
      setPhase('result')
      setBest(prev => Math.max(prev, s.score))
    }
  }

  // ── GAME LOOP ──────────────────────────────────────────
  const startGame = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    stateRef.current = initState()
    setScore(0); setHits(0); setPhase('aim')
    setBirdsLeft(BIRDS_PER_ROUND - 1)
    setPoopsLeft(POOPS_PER_BIRD)
    loop()
  }, [])

  function loop() {
    const s = stateRef.current
    if (!s) return
    update(s)
    draw(s)
    rafRef.current = requestAnimationFrame(loop)
  }

  // ── UPDATE ─────────────────────────────────────────────
  function update(s) {
    // Clouds drift
    s.clouds.forEach(c => { c.x += c.speed; if (c.x > W + 80) c.x = -80 })

    // Screen-shake decay
    if (s.shake.frames > 0) {
      s.shake.ox *= 0.7; s.shake.oy *= 0.7; s.shake.frames--
    }

    // Combo timer
    if (s.comboTimer > 0) { s.comboTimer--; if (s.comboTimer === 0) s.combo = 1 }

    // Floating score/honk texts
    s.floaters.forEach(f => { f.y -= f.vy; f.a -= 0.016 })
    s.floaters = s.floaters.filter(f => f.a > 0)

    // ── FLYING ──────────────────────────────────────────
    if (s.phase === 'flying') {
      const b = s.bird
      b.vy += GRAVITY
      b.vx += s.wind
      b.x  += b.vx
      b.y  += b.vy
      b.trail.push({ x: b.x, y: b.y, a: 1 })
      if (b.trail.length > 18) b.trail.shift()
      b.trail.forEach(t => { t.a -= 0.05 })

      if (b.y >= GROUND_Y - b.r && b.vy >= 0) {
        // Landing — convert downward impact to forward skid
        const impactVy = b.vy
        const skidDir  = b.vx >= 0 ? 1 : -1
        b.vx = skidDir * Math.max(Math.abs(b.vx), impactVy * 0.4)
        b.vy = 0
        b.y  = GROUND_Y - b.r
        // Screen shake proportional to impact
        const mag = Math.min(impactVy * 0.9 + Math.abs(b.vx) * 0.2, 10)
        if (mag > 1) s.shake = { ox: (Math.random() - 0.5) * mag, oy: (Math.random() - 0.5) * mag * 0.5, frames: 14 }
        s.phase = 'landing'
      } else if (b.x > W + 50 || b.x < -100) {
        s.phase = 'bird_gone'
      }
    }

    // ── LANDING ROLL ─────────────────────────────────────
    if (s.phase === 'landing') {
      const b = s.bird
      b.vx *= 0.94
      b.x  += b.vx
      b.rollAngle += b.vx / b.r
      b.landTimer++
      if ((Math.abs(b.vx) < 0.2 && b.landTimer > 70) || b.landTimer > 220) {
        s.phase = 'bird_gone'   // join bird_gone to wait for poops
      }
    }

    // ── POOPS + SPLATS + CAR TIMERS ──────────────────────
    // Runs through flying, landing, and bird_gone so all drops finish before advancing
    if (s.phase === 'flying' || s.phase === 'landing' || s.phase === 'bird_gone') {
      s.poops.forEach(p => {
        if (p.splat) return
        p.vy += GRAVITY * 1.8
        p.vx *= 0.99
        p.x  += p.vx
        p.y  += p.vy

        s.cars.forEach(car => {
          const roofY = car.y + car.roofY
          if (!p.splat && p.x > car.x && p.x < car.x + car.w && p.y > roofY && p.y < car.y) {
            p.splat = true
            s.splats.push({ x: p.x, y: roofY + 4, r: 8, a: 1 })
            if (!car.hit) {
              car.hit = true
              car.hitTimer = 90
              const pts = 100 * s.combo
              s.score += pts
              s.hits++
              setScore(s.score)
              setHits(s.hits)
              // Floating score
              s.floaters.push({ x: p.x, y: roofY - 5, text: `+${pts}`, a: 1, vy: 1.3, color: '#fbfbfb', size: 14 })
              // HONK
              s.floaters.push({ x: car.x + car.w / 2, y: car.y - 28, text: 'HONK!', a: 1, vy: 0.8, color: '#e8c060', size: 11 })
              // Combo popup
              if (s.combo > 1) {
                s.floaters.push({ x: p.x + 24, y: roofY - 20, text: `x${s.combo} combo!`, a: 1, vy: 0.9, color: '#a0a0a0', size: 10 })
              }
              s.comboTimer = 100
              s.combo = Math.min(s.combo + 1, 5)
            }
          }
        })

        // Splat on bottom or off sides
        if (p.y >= H - 8 || p.x < -20 || p.x > W + 20) {
          p.splat = true
          if (p.y >= H - 8) s.splats.push({ x: p.x, y: H - 8, r: 6, a: 0.6 })
        }
      })

      s.splats.forEach(sp => { sp.a -= 0.003 })
      s.splats = s.splats.filter(sp => sp.a > 0)
      s.cars.forEach(car => { if (car.hitTimer > 0) car.hitTimer-- })

      // Once bird is gone and all poops have settled, advance
      if (s.phase === 'bird_gone' && s.poops.every(p => p.splat)) {
        advanceBird(s)
      }
    }
  }

  // ── DRAW ───────────────────────────────────────────────
  function draw(s) {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    ctx.save()
    if (s.shake.frames > 0) ctx.translate(Math.round(s.shake.ox), Math.round(s.shake.oy))

    // Sky
    ctx.fillStyle = '#1a1a1f'
    ctx.fillRect(0, 0, W, SKY_H)
    const grad = ctx.createLinearGradient(0, SKY_H - 60, 0, SKY_H)
    grad.addColorStop(0, 'rgba(251,251,251,0)')
    grad.addColorStop(1, 'rgba(251,251,251,0.04)')
    ctx.fillStyle = grad
    ctx.fillRect(0, SKY_H - 60, W, 60)

    // Clouds
    s.clouds.forEach(c => {
      ctx.fillStyle = 'rgba(251,251,251,0.07)'
      ctx.beginPath(); ctx.ellipse(c.x, c.y, c.w, 14, 0, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.ellipse(c.x + 18, c.y - 8, c.w * 0.65, 12, 0, 0, Math.PI * 2); ctx.fill()
    })

    // Ground / parking lot
    ctx.fillStyle = '#222423'
    ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y)
    ctx.strokeStyle = 'rgba(251,251,251,0.07)'
    ctx.lineWidth = 1
    ;[60, 160, 260, 360, 460, 570].forEach(x => {
      ;[GROUND_Y + 8, GROUND_Y + 80].forEach(rowBase => {
        ctx.beginPath(); ctx.setLineDash([4, 4])
        ctx.moveTo(x - 5, rowBase); ctx.lineTo(x + 83, rowBase); ctx.stroke()
      })
    })
    ctx.setLineDash([])
    ctx.fillStyle = 'rgba(251,251,251,0.05)'
    ctx.fillRect(0, GROUND_Y + 68, W, 14)

    // Trees
    s.trees.forEach(t => {
      ctx.fillStyle = '#2e2f2e'
      ctx.fillRect(t.x - 3, GROUND_Y - t.h, 6, t.h)
      ctx.fillStyle = '#3a3b3a'
      ctx.beginPath(); ctx.arc(t.x, GROUND_Y - t.h - 10, 14, 0, Math.PI * 2); ctx.fill()
    })

    // Slingshot
    ctx.strokeStyle = '#5a4a30'; ctx.lineCap = 'round'
    ctx.lineWidth = 6
    ctx.beginPath(); ctx.moveTo(SLING_X, GROUND_Y); ctx.lineTo(SLING_X, SLING_Y + 14); ctx.stroke()
    ctx.lineWidth = 4
    ctx.beginPath(); ctx.moveTo(SLING_X, SLING_Y + 14); ctx.lineTo(SLING_X - 18, SLING_Y - 12); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(SLING_X, SLING_Y + 14); ctx.lineTo(SLING_X + 18, SLING_Y - 12); ctx.stroke()

    const b = s.bird

    if (s.phase === 'aim' && dragRef.current) {
      // Rubber bands
      ctx.strokeStyle = 'rgba(180,140,80,0.7)'; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.moveTo(SLING_X - 18, SLING_Y - 12); ctx.lineTo(b.x, b.y); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(SLING_X + 18, SLING_Y - 12); ctx.lineTo(b.x, b.y); ctx.stroke()
      // Trajectory dots
      const vx = (SLING_X - b.x) * LAUNCH_POWER
      const vy = (SLING_Y - b.y) * LAUNCH_POWER
      ctx.fillStyle = 'rgba(251,251,251,0.2)'
      let inSky = false
      for (let t = 0; t < 44; t += 3) {
        const px = b.x + vx * t
        const py = b.y + vy * t + 0.5 * GRAVITY * t * t
        if (py >= GROUND_Y) { if (inSky) break; continue }
        inSky = true
        const r = 2.5 - t * 0.05
        if (r > 0.3) { ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill() }
      }
    } else if (s.phase === 'aim') {
      ctx.strokeStyle = 'rgba(180,140,80,0.4)'; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.moveTo(SLING_X - 18, SLING_Y - 12); ctx.lineTo(b.x, b.y); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(SLING_X + 18, SLING_Y - 12); ctx.lineTo(b.x, b.y); ctx.stroke()
    }

    // Cars
    s.cars.forEach(car => {
      const flash = car.hitTimer > 0 && Math.floor(car.hitTimer / 6) % 2 === 0
      ctx.fillStyle = 'rgba(0,0,0,0.3)'
      ctx.beginPath(); ctx.ellipse(car.x + car.w / 2, car.y + 4, car.w / 2, 5, 0, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = flash ? '#fbfbfb' : car.color
      ctx.beginPath(); ctx.roundRect(car.x, car.y - 12, car.w, 16, 3); ctx.fill()
      ctx.fillStyle = flash ? '#c5c5c5' : adjustColor(car.color, -20)
      ctx.beginPath(); ctx.roundRect(car.x + 10, car.y - 24, car.w - 20, 14, 3); ctx.fill()
      ctx.fillStyle = 'rgba(10,10,10,0.7)'
      ctx.beginPath(); ctx.roundRect(car.x + 12, car.y - 22, car.w - 24, 10, 2); ctx.fill()
      ctx.fillStyle = '#111'
      ;[car.x + 10, car.x + car.w - 18].forEach(wx => {
        ctx.beginPath(); ctx.arc(wx, car.y + 4, 7, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = '#333'; ctx.beginPath(); ctx.arc(wx, car.y + 4, 3.5, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = '#111'
      })
    })

    // Splats
    s.splats.forEach(sp => {
      ctx.fillStyle = `rgba(245,240,200,${sp.a * 0.9})`
      ctx.beginPath(); ctx.ellipse(sp.x, sp.y, sp.r, sp.r * 0.55, 0, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.ellipse(sp.x + 3, sp.y + sp.r * 0.4, sp.r * 0.35, sp.r * 0.5, 0.3, 0, Math.PI * 2); ctx.fill()
    })

    // Poops in flight
    s.poops.forEach(p => {
      if (p.splat) return
      ctx.fillStyle = 'rgba(220,215,180,0.9)'
      ctx.beginPath(); ctx.ellipse(p.x, p.y, p.r, p.r * 0.7, 0, 0, Math.PI * 2); ctx.fill()
    })

    // Bird trail
    b.trail.forEach((t, i) => {
      ctx.fillStyle = `rgba(251,251,251,${t.a * 0.15})`
      const r = (i / b.trail.length) * 7
      ctx.beginPath(); ctx.arc(t.x, t.y, r, 0, Math.PI * 2); ctx.fill()
    })

    // Bird
    if (s.phase !== 'result') {
      const angle = s.phase === 'flying'  ? Math.atan2(b.vy, b.vx)
                  : s.phase === 'landing' ? b.rollAngle
                  : 0
      ctx.save()
      ctx.translate(b.x, b.y)
      ctx.rotate(angle)
      ctx.fillStyle = '#fbfbfb'
      ctx.beginPath(); ctx.ellipse(0, 0, b.r, b.r * 0.75, 0, 0, Math.PI * 2); ctx.fill()
      const flapAngle = s.phase === 'flying' ? Math.sin(Date.now() * 0.015) * 0.5 : 0
      ctx.fillStyle = '#c5c5c5'; ctx.save(); ctx.rotate(flapAngle)
      ctx.beginPath(); ctx.ellipse(-2, -4, b.r * 0.85, b.r * 0.35, -0.4, 0, Math.PI * 2); ctx.fill()
      ctx.restore()
      ctx.fillStyle = '#0a0a0a'
      ctx.beginPath(); ctx.arc(b.r * 0.55, -b.r * 0.2, 2.5, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#fbfbfb'
      ctx.beginPath(); ctx.arc(b.r * 0.55 + 0.7, -b.r * 0.2 - 0.7, 0.8, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#e8c060'
      ctx.beginPath(); ctx.moveTo(b.r * 0.85, -1); ctx.lineTo(b.r * 1.4, 0); ctx.lineTo(b.r * 0.85, 3); ctx.closePath(); ctx.fill()
      ctx.restore()
    }

    // Floating texts (score, HONK, combos)
    s.floaters.forEach(f => {
      ctx.save()
      ctx.globalAlpha = f.a
      ctx.fillStyle = f.color
      ctx.font = `bold ${f.size}px "DM Mono", monospace`
      ctx.textAlign = 'center'
      ctx.fillText(f.text, f.x, f.y)
      ctx.restore()
    })

    // Poop ammo indicator (top-right, during flight)
    if (s.phase === 'flying') {
      for (let i = 0; i < POOPS_PER_BIRD; i++) {
        ctx.beginPath()
        ctx.arc(W - 14 - i * 14, 12, 4, 0, Math.PI * 2)
        ctx.fillStyle = i < s.poopsLeft ? 'rgba(220,215,180,0.9)' : 'rgba(251,251,251,0.15)'
        ctx.fill()
      }
      ctx.fillStyle = 'rgba(251,251,251,0.25)'
      ctx.font = '9px "DM Mono", monospace'
      ctx.textAlign = 'right'
      ctx.fillText(tRef.current.poopHint, W - 12, 28)
    }

    // Wind indicator
    if (s.phase === 'flying' || s.phase === 'bird_gone') {
      ctx.fillStyle = 'rgba(251,251,251,0.3)'
      ctx.font = '10px "DM Mono", monospace'
      ctx.textAlign = 'right'
      ctx.fillText(
        s.wind > 0
          ? `${tRef.current.windRight} ${(s.wind * 100).toFixed(0)}`
          : `${tRef.current.windLeft} ${(-s.wind * 100).toFixed(0)}`,
        W - 12, 44,
      )
    }

    // Combo indicator (top-centre)
    if (s.combo > 1 && s.comboTimer > 0) {
      ctx.save()
      ctx.globalAlpha = Math.min(s.comboTimer / 30, 1)
      ctx.fillStyle = '#e8c060'
      ctx.font = 'bold 14px "DM Mono", monospace'
      ctx.textAlign = 'center'
      ctx.fillText(`x${s.combo} COMBO`, W / 2, 20)
      ctx.restore()
    }

    ctx.textAlign = 'left'

    // Aim prompt
    if (s.phase === 'aim' && !dragRef.current) {
      ctx.fillStyle = 'rgba(251,251,251,0.4)'
      ctx.font = '11px "DM Mono", monospace'
      ctx.textAlign = 'center'
      ctx.fillText(tRef.current.aimPrompt, SLING_X + 60, SLING_Y - 50)
      ctx.textAlign = 'left'
    }

    // Result overlay
    if (s.phase === 'result') {
      ctx.fillStyle = 'rgba(0,0,0,0.65)'
      ctx.fillRect(0, 0, W, H)
      ctx.fillStyle = '#fbfbfb'
      ctx.font = 'bold 26px Syne, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(tRef.current.resultTitle, W / 2, H / 2 - 30)
      ctx.font = '13px "DM Mono", monospace'
      ctx.fillStyle = '#c5c5c5'
      ctx.fillText(tRef.current.resultScore(s.score, s.hits), W / 2, H / 2 + 4)
      ctx.fillStyle = 'rgba(251,251,251,0.3)'
      ctx.font = '10px "DM Mono", monospace'
      ctx.fillText(tRef.current.resultPrompt, W / 2, H / 2 + 28)
      ctx.textAlign = 'left'
    }

    ctx.restore() // end shake transform
  }

  // ── INPUT ──────────────────────────────────────────────
  function getCanvasPos(e, canvas) {
    const rect = canvas.getBoundingClientRect()
    const client = e.touches ? e.touches[0] : e
    return {
      x: (client.clientX - rect.left) * (W / rect.width),
      y: (client.clientY - rect.top)  * (H / rect.height),
    }
  }

  function onPointerDown(e) {
    const s = stateRef.current
    if (!s) return
    if (s.phase === 'aim') {
      const pos = getCanvasPos(e, canvasRef.current)
      if (dist(pos, s.bird) < 28) {
        dragRef.current = true
        e.preventDefault()
      }
    } else if (s.phase === 'flying' && s.poopsLeft > 0) {
      const b = s.bird
      s.poops.push({ x: b.x, y: b.y + b.r, vx: b.vx * 0.3, vy: b.vy * 0.2, r: 5, splat: false })
      s.poopsLeft--
      setPoopsLeft(s.poopsLeft)
      e.preventDefault()
    }
  }

  function onPointerMove(e) {
    const s = stateRef.current
    if (!s || !dragRef.current || s.phase !== 'aim') return
    const pos = getCanvasPos(e, canvasRef.current)
    const dx = pos.x - SLING_X
    const dy = pos.y - SLING_Y
    const d = Math.sqrt(dx * dx + dy * dy)
    const factor = d > 85 ? 85 / d : 1
    s.bird.x = SLING_X + dx * factor
    s.bird.y = SLING_Y + dy * factor
    e.preventDefault()
  }

  function onPointerUp(e) {
    const s = stateRef.current
    if (!s || !dragRef.current || s.phase !== 'aim') return
    const b = s.bird
    b.vx = (SLING_X - b.x) * LAUNCH_POWER
    b.vy = (SLING_Y - b.y) * LAUNCH_POWER
    b.launched = true
    s.phase = 'flying'
    setPhase('flying')
    dragRef.current = null
    e.preventDefault()
  }

  // ── MOUNT ──────────────────────────────────────────────
  useEffect(() => {
    stateRef.current = initState()
    loop()
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.addEventListener('mousedown',  onPointerDown)
    canvas.addEventListener('touchstart', onPointerDown, { passive: false })
    window.addEventListener('mousemove',  onPointerMove)
    window.addEventListener('mouseup',    onPointerUp)
    window.addEventListener('touchmove',  onPointerMove, { passive: false })
    window.addEventListener('touchend',   onPointerUp)
    return () => {
      canvas.removeEventListener('mousedown',  onPointerDown)
      canvas.removeEventListener('touchstart', onPointerDown)
      window.removeEventListener('mousemove',  onPointerMove)
      window.removeEventListener('mouseup',    onPointerUp)
      window.removeEventListener('touchmove',  onPointerMove)
      window.removeEventListener('touchend',   onPointerUp)
    }
  }, [])

  // ── RENDER ─────────────────────────────────────────────
  const showBirds = phase === 'result' ? 0 : birdsLeft + 1

  return (
    <section id="game" className={styles.section} aria-labelledby="game-heading">
      <div className={styles.header}>
        <span className={styles.label}>{t.sectionLabel}</span>
        <h2 id="game-heading" className={styles.heading}>{t.heading}</h2>
        <span className={styles.rule} aria-hidden="true" />
      </div>

      <div className={styles.layout}>
        <div className={styles.left}>
          <p className={styles.desc}>{t.desc1}</p>
          <p className={styles.desc} style={{ marginTop: '0.6rem' }}>{t.desc2}</p>

          <div className={styles.howto}>
            <span className={styles.howtolabel}>{t.howtoLabel}</span>
            {t.steps.map((step, i) => (
              <div key={i} className={styles.step}>
                <span className={styles.stepNum}>0{i + 1}.</span> {step}
              </div>
            ))}
          </div>

          <div className={styles.techTags}>
            {['Canvas API', 'React Hooks', 'Physics sim', 'Procedural'].map(tag => (
              <span key={tag} className={styles.techTag}>{tag}</span>
            ))}
          </div>
        </div>

        <div className={styles.right}>
          <div className={styles.canvasWrap}>
            <canvas
              ref={canvasRef}
              width={W}
              height={H}
              className={styles.canvas}
              aria-label="Seagull slingshot game"
            />
          </div>

          <div className={styles.hud}>
            <div className={styles.stat}>
              <span className={styles.statLabel}>{t.hudScore}</span>
              <span className={styles.statVal}>{score}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>{t.hudCarsHit}</span>
              <span className={styles.statVal}>{hits}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>{t.hudBest}</span>
              <span className={styles.statVal}>{best}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>{t.hudBirds}</span>
              <span className={styles.statVal}>
                {Array.from({ length: BIRDS_PER_ROUND }, (_, i) => (
                  <span key={i} style={{ opacity: i < showBirds ? 1 : 0.2, marginRight: 3 }}>▲</span>
                ))}
              </span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>{t.hudPoop}</span>
              <span className={styles.statVal}>
                {Array.from({ length: POOPS_PER_BIRD }, (_, i) => (
                  <span key={i} style={{ opacity: i < poopsLeft ? 1 : 0.2, marginRight: 2 }}>●</span>
                ))}
              </span>
            </div>
            <button className={styles.launchBtn} onClick={startGame}>
              {phase === 'result' ? t.btnPlayAgain : t.btnRestart}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
