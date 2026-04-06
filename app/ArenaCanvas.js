'use client';
import { useEffect, useRef, useState } from 'react';

// ── 16 Fighters with MK-style themes ─────────────────
const FIGHTERS = [
  { name: 'KAEL',    color: '#ef4444', theme: 'fire',     nebula: 'rgba(239,68,68,',   floor: 'rgba(239,68,68,',   grid: 'rgba(239,68,68,' },
  { name: 'VEXIS',   color: '#8b5cf6', theme: 'void',     nebula: 'rgba(139,92,246,',  floor: 'rgba(139,92,246,',  grid: 'rgba(139,92,246,' },
  { name: 'ZYRA',    color: '#22c55e', theme: 'nature',   nebula: 'rgba(34,197,94,',   floor: 'rgba(34,197,94,',   grid: 'rgba(34,197,94,' },
  { name: 'DRAX',    color: '#f97316', theme: 'lava',     nebula: 'rgba(249,115,22,',  floor: 'rgba(249,115,22,',  grid: 'rgba(249,115,22,' },
  { name: 'NOVA',    color: '#06b6d4', theme: 'cosmic',   nebula: 'rgba(6,182,212,',   floor: 'rgba(6,182,212,',   grid: 'rgba(6,182,212,' },
  { name: 'FENIX',   color: '#f59e0b', theme: 'solar',    nebula: 'rgba(245,158,11,',  floor: 'rgba(245,158,11,',  grid: 'rgba(245,158,11,' },
  { name: 'CRYOS',   color: '#38bdf8', theme: 'ice',      nebula: 'rgba(56,189,248,',  floor: 'rgba(56,189,248,',  grid: 'rgba(56,189,248,' },
  { name: 'UMBRA',   color: '#a855f7', theme: 'shadow',   nebula: 'rgba(168,85,247,',  floor: 'rgba(168,85,247,',  grid: 'rgba(168,85,247,' },
  { name: 'RAZE',    color: '#dc2626', theme: 'blood',    nebula: 'rgba(220,38,38,',   floor: 'rgba(220,38,38,',   grid: 'rgba(220,38,38,' },
  { name: 'LYRIC',   color: '#ec4899', theme: 'psychic',  nebula: 'rgba(236,72,153,',  floor: 'rgba(236,72,153,',  grid: 'rgba(236,72,153,' },
  { name: 'VORNN',   color: '#84cc16', theme: 'toxic',    nebula: 'rgba(132,204,22,',  floor: 'rgba(132,204,22,',  grid: 'rgba(132,204,22,' },
  { name: 'SABLE',   color: '#64748b', theme: 'steel',    nebula: 'rgba(100,116,139,', floor: 'rgba(100,116,139,', grid: 'rgba(100,116,139,' },
  { name: 'EMBER',   color: '#fb923c', theme: 'magma',    nebula: 'rgba(251,146,60,',  floor: 'rgba(251,146,60,',  grid: 'rgba(251,146,60,' },
  { name: 'JINX',    color: '#e879f9', theme: 'chaos',    nebula: 'rgba(232,121,249,', floor: 'rgba(232,121,249,', grid: 'rgba(232,121,249,' },
  { name: 'AXION',   color: '#2dd4bf', theme: 'quantum',  nebula: 'rgba(45,212,191,',  floor: 'rgba(45,212,191,',  grid: 'rgba(45,212,191,' },
  { name: 'KRONOS',  color: '#fbbf24', theme: 'thunder',  nebula: 'rgba(251,191,36,',  floor: 'rgba(251,191,36,',  grid: 'rgba(251,191,36,' },
];

function pickTwo() {
  const a = Math.floor(Math.random() * 16);
  let b = Math.floor(Math.random() * 15);
  if (b >= a) b++;
  return [FIGHTERS[a], FIGHTERS[b]];
}

export default function ArenaCanvas() {
  const ref = useRef(null);
  const [matchup, setMatchup] = useState('');

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, raf;

    const resize = () => {
      const r = window.devicePixelRatio || 1;
      W = canvas.width = canvas.offsetWidth * r;
      H = canvas.height = canvas.offsetHeight * r;
    };
    resize();
    window.addEventListener('resize', resize);

    // ── Current matchup ──
    let [p1, p2] = pickTwo();
    setMatchup(`${p1.name} vs ${p2.name}`);

    // Rotate matchup every 12s
    const matchInterval = setInterval(() => {
      [p1, p2] = pickTwo();
      setMatchup(`${p1.name} vs ${p2.name}`);
      f1.hp = 70 + Math.random() * 30; f2.hp = 70 + Math.random() * 30;
      transitionProgress = 0;
    }, 12000);

    let transitionProgress = 0;

    // ── Particles ──
    const dust = Array.from({ length: 80 }, () => ({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -Math.random() * 0.4 - 0.08,
      a: Math.random() * 0.45 + 0.08,
      side: Math.random() > 0.5 ? 0 : 1,
    }));

    const rings = Array.from({ length: 6 }, (_, i) => ({
      angle: (i / 6) * Math.PI * 2,
      speed: (Math.random() * 0.004 + 0.002) * (Math.random() > 0.5 ? 1 : -1),
      radius: 0.12 + Math.random() * 0.16,
      size: Math.random() * 2.5 + 1.2,
      side: i % 2,
      glow: Math.random() * 0.6 + 0.4,
    }));

    const sparks = [];
    const addSpark = () => {
      if (sparks.length < 6) sparks.push({
        x: 0.3 + Math.random() * 0.4, y: 0.3 + Math.random() * 0.4,
        len: Math.random() * 0.05 + 0.015, life: 16,
        angle: Math.random() * Math.PI * 2,
        side: Math.random() > 0.5 ? 0 : 1,
      });
    };
    const sparkInterval = setInterval(addSpark, 700);

    // Fighter state
    const f1 = { hp: 72, attacking: false, breath: 0, stunned: 0 };
    const f2 = { hp: 88, attacking: false, breath: 0.8, stunned: 0 };
    let hitFlash = 0, hitX = 0, hitY = 0, t = 0;

    const attackInterval = setInterval(() => {
      const att = Math.random() > 0.5 ? f1 : f2;
      att.attacking = true;
      hitFlash = 14;
      if (att === f1) { f2.hp = Math.max(8, f2.hp - Math.random() * 8 - 2); hitX = 0.73; hitY = 0.55; f2.stunned = 8; }
      else { f1.hp = Math.max(8, f1.hp - Math.random() * 8 - 2); hitX = 0.27; hitY = 0.55; f1.stunned = 8; }
      setTimeout(() => { att.attacking = false; }, 280);
    }, 1400);

    function fighter(x, y, flip, color, data) {
      const dpr = window.devicePixelRatio || 1;
      const pw = W / dpr, ph = H / dpr;
      const sc = ph * 0.28;
      const by = Math.sin(data.breath) * 2.8;
      const stun = data.stunned > 0 ? Math.sin(t * 0.8) * 3 : 0;
      ctx.save();
      if (flip) { ctx.translate(pw, 0); ctx.scale(-1, 1); x = pw - x; }
      // Aura
      const aura = ctx.createRadialGradient(x, y, 0, x, y, sc * 1.4);
      aura.addColorStop(0, color + '18'); aura.addColorStop(0.5, color + '08'); aura.addColorStop(1, 'transparent');
      ctx.fillStyle = aura; ctx.fillRect(x - sc * 1.4, y - sc * 1.6, sc * 2.8, sc * 2.2);
      // Halo
      const halo = ctx.createRadialGradient(x, y - sc * 0.5, 0, x, y - sc * 0.5, sc * 0.7);
      halo.addColorStop(0, color + '28'); halo.addColorStop(1, 'transparent');
      ctx.fillStyle = halo; ctx.fillRect(x - sc, y - sc * 1.2, sc * 2, sc * 1.8);
      ctx.shadowColor = color; ctx.shadowBlur = data.attacking ? 32 : 16; ctx.fillStyle = color + 'ee';
      // Head
      ctx.beginPath(); ctx.arc(x + stun, y - sc * 0.84 + by, sc * 0.13, 0, Math.PI * 2); ctx.fill();
      // Eye
      ctx.shadowBlur = 8; ctx.fillStyle = '#fff'; ctx.beginPath();
      ctx.arc(x + stun + sc * 0.04, y - sc * 0.87 + by, sc * 0.025, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = color + 'ee'; ctx.shadowColor = color; ctx.shadowBlur = data.attacking ? 32 : 16;
      // Torso
      ctx.fillRect(x + stun - sc * 0.1, y - sc * 0.71 + by, sc * 0.20, sc * 0.40);
      // Legs
      ctx.fillRect(x + stun - sc * 0.105, y - sc * 0.31 + by, sc * 0.09, sc * 0.32);
      ctx.fillRect(x + stun + sc * 0.015, y - sc * 0.31 + by, sc * 0.09, sc * 0.32);
      // Arms
      if (data.attacking) {
        ctx.fillRect(x + stun + sc * 0.1, y - sc * 0.64 + by, sc * 0.4, sc * 0.08);
        ctx.shadowColor = '#fff'; ctx.shadowBlur = 40;
        const burst = ctx.createRadialGradient(x + stun + sc * 0.5, y - sc * 0.6 + by, 0, x + stun + sc * 0.5, y - sc * 0.6 + by, sc * 0.14);
        burst.addColorStop(0, '#fff'); burst.addColorStop(0.4, color); burst.addColorStop(1, 'transparent');
        ctx.fillStyle = burst; ctx.beginPath(); ctx.arc(x + stun + sc * 0.5, y - sc * 0.6 + by, sc * 0.14, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.fillStyle = color + 'ee';
        ctx.fillRect(x + stun - sc * 0.2, y - sc * 0.68 + by, sc * 0.09, sc * 0.30);
        ctx.fillRect(x + stun + sc * 0.11, y - sc * 0.68 + by, sc * 0.09, sc * 0.30);
      }
      ctx.restore();
      if (data.stunned > 0) data.stunned--;
    }

    function draw() {
      const dpr = window.devicePixelRatio || 1;
      const pw = W / dpr, ph = H / dpr;
      ctx.clearRect(0, 0, pw, ph);
      transitionProgress = Math.min(1, transitionProgress + 0.015);

      // ── BG – split theme: left = p1, right = p2 ──
      const bg = ctx.createLinearGradient(0, 0, pw, ph);
      bg.addColorStop(0, '#020207'); bg.addColorStop(0.4, '#06041a'); bg.addColorStop(1, '#020207');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, pw, ph);

      // P1 nebula (left half)
      const n1 = ctx.createRadialGradient(pw * 0.2, ph * 0.4, 0, pw * 0.2, ph * 0.4, pw * 0.45);
      n1.addColorStop(0, p1.nebula + (0.09 * transitionProgress).toFixed(3) + ')');
      n1.addColorStop(1, 'transparent');
      ctx.fillStyle = n1; ctx.fillRect(0, 0, pw, ph);

      // P2 nebula (right half)
      const n2 = ctx.createRadialGradient(pw * 0.8, ph * 0.4, 0, pw * 0.8, ph * 0.4, pw * 0.45);
      n2.addColorStop(0, p2.nebula + (0.09 * transitionProgress).toFixed(3) + ')');
      n2.addColorStop(1, 'transparent');
      ctx.fillStyle = n2; ctx.fillRect(0, 0, pw, ph);

      // Center clash glow
      const clash = ctx.createRadialGradient(pw * 0.5, ph * 0.5, 0, pw * 0.5, ph * 0.5, pw * 0.15);
      clash.addColorStop(0, 'rgba(255,255,255,0.04)'); clash.addColorStop(1, 'transparent');
      ctx.fillStyle = clash; ctx.fillRect(0, 0, pw, ph);

      // ── Floor glow – blended from both fighters ──
      const fg = ctx.createRadialGradient(pw * 0.35, ph * 0.64, 0, pw * 0.35, ph * 0.64, pw * 0.35);
      fg.addColorStop(0, p1.floor + '0.08)'); fg.addColorStop(1, 'transparent');
      ctx.fillStyle = fg; ctx.fillRect(0, 0, pw, ph);
      const fg2 = ctx.createRadialGradient(pw * 0.65, ph * 0.64, 0, pw * 0.65, ph * 0.64, pw * 0.35);
      fg2.addColorStop(0, p2.floor + '0.08)'); fg2.addColorStop(1, 'transparent');
      ctx.fillStyle = fg2; ctx.fillRect(0, 0, pw, ph);

      // ── Grid – left half p1 color, right half p2 color ──
      ctx.lineWidth = 0.6;
      for (let i = 0; i <= 14; i++) {
        const x = pw * 0.05 + i * pw * 0.9 / 14;
        ctx.strokeStyle = x < pw / 2 ? p1.grid + '0.07)' : p2.grid + '0.07)';
        ctx.beginPath(); ctx.moveTo(x, ph * 0.64); ctx.lineTo(pw / 2, ph * 0.08); ctx.stroke();
      }
      for (let i = 1; i <= 7; i++) {
        const y = ph * (0.64 - i * 0.08);
        const frac = (ph * 0.64 - y) / (ph * 0.56);
        const xl = pw * 0.05 + pw * 0.45 * frac;
        const xr = pw * 0.95 - pw * 0.45 * frac;
        const mid = (xl + xr) / 2;
        ctx.strokeStyle = p1.grid + '0.06)'; ctx.beginPath(); ctx.moveTo(xl, y); ctx.lineTo(mid, y); ctx.stroke();
        ctx.strokeStyle = p2.grid + '0.06)'; ctx.beginPath(); ctx.moveTo(mid, y); ctx.lineTo(xr, y); ctx.stroke();
      }
      // Floor line
      ctx.shadowColor = p1.color; ctx.shadowBlur = 8;
      ctx.strokeStyle = p1.floor + '0.25)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(pw * 0.05, ph * 0.64); ctx.lineTo(pw / 2, ph * 0.64); ctx.stroke();
      ctx.shadowColor = p2.color;
      ctx.strokeStyle = p2.floor + '0.25)';
      ctx.beginPath(); ctx.moveTo(pw / 2, ph * 0.64); ctx.lineTo(pw * 0.95, ph * 0.64); ctx.stroke();
      ctx.shadowBlur = 0;

      // ── Rings ──
      const cx = pw / 2, cy = ph * 0.5;
      rings.forEach(ring => {
        ring.angle += ring.speed;
        const rx = cx + Math.cos(ring.angle) * pw * ring.radius;
        const ry = cy + Math.sin(ring.angle) * ph * ring.radius * 0.3;
        const rc = ring.side === 0 ? p1.color : p2.color;
        ctx.shadowColor = rc; ctx.shadowBlur = 18;
        ctx.beginPath(); ctx.arc(rx, ry, ring.size, 0, Math.PI * 2);
        ctx.fillStyle = rc + Math.floor(ring.glow * 180).toString(16).padStart(2, '0');
        ctx.fill(); ctx.shadowBlur = 0;
      });

      // ── Dust ──
      dust.forEach(p => {
        p.x += p.vx / pw; p.y += p.vy / ph;
        if (p.y < 0) { p.y = 1; p.x = Math.random(); }
        if (p.x < 0 || p.x > 1) p.x = Math.random();
        const dc = p.side === 0 ? p1.color : p2.color;
        ctx.beginPath(); ctx.arc(p.x * pw, p.y * ph, p.r, 0, Math.PI * 2);
        ctx.fillStyle = dc + Math.floor(p.a * 160).toString(16).padStart(2, '0');
        ctx.fill();
      });

      // ── Sparks ──
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i]; s.life--;
        if (s.life <= 0) { sparks.splice(i, 1); continue; }
        const alpha = s.life / 16;
        const sc = s.side === 0 ? p1.color : p2.color;
        ctx.strokeStyle = sc + Math.floor(alpha * 180).toString(16).padStart(2, '0');
        ctx.lineWidth = 1.5; ctx.shadowColor = sc; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.moveTo(s.x * pw, s.y * ph);
        ctx.lineTo(s.x * pw + Math.cos(s.angle) * s.len * pw, s.y * ph + Math.sin(s.angle) * s.len * ph);
        ctx.stroke(); ctx.shadowBlur = 0;
      }

      // ── Hit flash ──
      if (hitFlash > 0) {
        const ig = ctx.createRadialGradient(hitX * pw, hitY * ph, 0, hitX * pw, hitY * ph, pw * 0.18);
        ig.addColorStop(0, `rgba(255,255,255,${hitFlash * 0.02})`); ig.addColorStop(1, 'transparent');
        ctx.fillStyle = ig; ctx.fillRect(0, 0, pw, ph); hitFlash--;
      }

      // ── Fighters ──
      f1.breath += 0.03; f2.breath += 0.025;
      fighter(pw * 0.27, ph * 0.62, false, p1.color, f1);
      fighter(pw * 0.73, ph * 0.62, true, p2.color, f2);

      // ── HUD ──
      const bw = pw * 0.27, bh = 8, hy = 24;
      // P1 name
      ctx.fillStyle = p1.color; ctx.font = `bold 10px Orbitron,monospace`;
      ctx.textAlign = 'left'; ctx.fillText(p1.name, pw * 0.055, hy - 6);
      // P2 name
      ctx.fillStyle = p2.color; ctx.textAlign = 'right'; ctx.fillText(p2.name, pw * 0.945, hy - 6); ctx.textAlign = 'left';
      // P1 bar
      ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.beginPath(); ctx.roundRect(pw * 0.055, hy, bw, bh, 4); ctx.fill();
      const g1 = ctx.createLinearGradient(pw * 0.055, 0, pw * 0.055 + bw, 0);
      g1.addColorStop(0, p1.color); g1.addColorStop(1, p1.color + '80');
      ctx.fillStyle = g1; ctx.shadowColor = p1.color; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.roundRect(pw * 0.055, hy, bw * f1.hp / 100, bh, 4); ctx.fill(); ctx.shadowBlur = 0;
      // P2 bar
      ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.beginPath(); ctx.roundRect(pw * 0.675, hy, bw, bh, 4); ctx.fill();
      const g2 = ctx.createLinearGradient(pw * 0.675, 0, pw * 0.675 + bw, 0);
      g2.addColorStop(0, p2.color + '80'); g2.addColorStop(1, p2.color);
      ctx.fillStyle = g2; ctx.shadowColor = p2.color; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.roundRect(pw * 0.675 + bw * (1 - f2.hp / 100), hy, bw * f2.hp / 100, bh, 4); ctx.fill(); ctx.shadowBlur = 0;
      // Timer
      const sec = Math.max(0, 99 - Math.floor(t / 60));
      ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.beginPath(); ctx.roundRect(pw / 2 - 24, hy - 4, 48, 22, 6); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.roundRect(pw / 2 - 24, hy - 4, 48, 22, 6); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.font = `bold 14px Orbitron,monospace`;
      ctx.textAlign = 'center'; ctx.fillText(sec.toString().padStart(2, '0'), pw / 2, hy + 13);
      // VS
      ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.font = `700 10px Orbitron,monospace`;
      ctx.fillText('VS', pw / 2, hy + 33); ctx.textAlign = 'left';

      // ── Vignette ──
      const vig = ctx.createRadialGradient(pw / 2, ph / 2, ph * 0.2, pw / 2, ph / 2, ph);
      vig.addColorStop(0, 'transparent'); vig.addColorStop(1, 'rgba(2,2,7,0.85)');
      ctx.fillStyle = vig; ctx.fillRect(0, 0, pw, ph);

      t++;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); clearInterval(attackInterval); clearInterval(sparkInterval); clearInterval(matchInterval); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />;
}
