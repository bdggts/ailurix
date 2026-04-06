'use client';
import { useEffect, useRef } from 'react';

export default function ArenaCanvas() {
  const ref = useRef(null);
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

    // ── Particle system – 3 types ─────────────────────
    // 1. Floating dust
    const dust = Array.from({ length: 90 }, () => ({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 1.6 + 0.3,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -Math.random() * 0.45 - 0.08,
      a: Math.random() * 0.5 + 0.08,
      c: ['#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#a855f7'][Math.floor(Math.random() * 5)],
    }));

    // 2. Energy rings (orbiting around center)
    const rings = Array.from({ length: 6 }, (_, i) => ({
      angle: (i / 6) * Math.PI * 2,
      speed: (Math.random() * 0.004 + 0.002) * (Math.random() > 0.5 ? 1 : -1),
      radius: 0.12 + Math.random() * 0.16,
      size: Math.random() * 3 + 1.5,
      color: ['#f59e0b', '#8b5cf6', '#06b6d4', '#ef4444'][i % 4],
      glow: Math.random() * 0.6 + 0.4,
    }));

    // 3. Lightning sparks (random occasional)
    const sparks = [];
    const addSpark = () => {
      if (sparks.length < 8) sparks.push({ x: 0.3 + Math.random() * 0.4, y: 0.3 + Math.random() * 0.4, len: Math.random() * 0.06 + 0.02, life: 18, angle: Math.random() * Math.PI * 2, color: Math.random() > 0.5 ? '#f59e0b' : '#8b5cf6' });
    };
    const sparkInterval = setInterval(addSpark, 600);

    // Fighter state
    const f1 = { hp: 72, energy: 60, attacking: false, breath: 0, stunned: 0 };
    const f2 = { hp: 88, energy: 45, attacking: false, breath: 0.8, stunned: 0 };
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

      // Outer aura
      const aura = ctx.createRadialGradient(x, y, 0, x, y, sc * 1.4);
      aura.addColorStop(0, color + '18'); aura.addColorStop(0.5, color + '0a'); aura.addColorStop(1, 'transparent');
      ctx.fillStyle = aura; ctx.fillRect(x - sc * 1.4, y - sc * 1.6, sc * 2.8, sc * 2.2);

      // Inner glow halo
      const halo = ctx.createRadialGradient(x, y - sc * 0.5, 0, x, y - sc * 0.5, sc * 0.7);
      halo.addColorStop(0, color + '30'); halo.addColorStop(1, 'transparent');
      ctx.fillStyle = halo; ctx.fillRect(x - sc, y - sc * 1.2, sc * 2, sc * 1.8);

      ctx.shadowColor = color; ctx.shadowBlur = data.attacking ? 32 : 16;
      ctx.fillStyle = color + 'ee';

      // Head
      ctx.beginPath(); ctx.arc(x + stun, y - sc * 0.84 + by, sc * 0.13, 0, Math.PI * 2); ctx.fill();
      // Eye glow
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
        // Attack burst
        ctx.shadowColor = '#f59e0b'; ctx.shadowBlur = 40;
        const burst = ctx.createRadialGradient(x + stun + sc * 0.5, y - sc * 0.6 + by, 0, x + stun + sc * 0.5, y - sc * 0.6 + by, sc * 0.14);
        burst.addColorStop(0, '#fff'); burst.addColorStop(0.4, '#f59e0b'); burst.addColorStop(1, 'transparent');
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

      // ── Deep space background ──
      const bg = ctx.createLinearGradient(0, 0, pw, ph);
      bg.addColorStop(0, '#020207');
      bg.addColorStop(0.4, '#06041a');
      bg.addColorStop(1, '#020207');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, pw, ph);

      // ── Radial nebula glows ──
      const neb1 = ctx.createRadialGradient(pw * 0.2, ph * 0.3, 0, pw * 0.2, ph * 0.3, pw * 0.4);
      neb1.addColorStop(0, 'rgba(139,92,246,0.07)'); neb1.addColorStop(1, 'transparent');
      ctx.fillStyle = neb1; ctx.fillRect(0, 0, pw, ph);

      const neb2 = ctx.createRadialGradient(pw * 0.8, ph * 0.6, 0, pw * 0.8, ph * 0.6, pw * 0.35);
      neb2.addColorStop(0, 'rgba(6,182,212,0.06)'); neb2.addColorStop(1, 'transparent');
      ctx.fillStyle = neb2; ctx.fillRect(0, 0, pw, ph);

      const neb3 = ctx.createRadialGradient(pw * 0.5, ph * 0.5, 0, pw * 0.5, ph * 0.5, pw * 0.3);
      neb3.addColorStop(0, 'rgba(245,158,11,0.05)'); neb3.addColorStop(1, 'transparent');
      ctx.fillStyle = neb3; ctx.fillRect(0, 0, pw, ph);

      // ── Horizon floor glow ──
      const fg = ctx.createRadialGradient(pw / 2, ph * 0.64, 0, pw / 2, ph * 0.64, pw * 0.6);
      fg.addColorStop(0, 'rgba(245,158,11,0.09)'); fg.addColorStop(0.5, 'rgba(139,92,246,0.04)'); fg.addColorStop(1, 'transparent');
      ctx.fillStyle = fg; ctx.fillRect(0, 0, pw, ph);

      // ── Perspective grid ──
      ctx.strokeStyle = 'rgba(139,92,246,0.07)'; ctx.lineWidth = 0.7;
      for (let i = 0; i <= 14; i++) {
        const x = pw * 0.05 + i * pw * 0.9 / 14;
        ctx.beginPath(); ctx.moveTo(x, ph * 0.64); ctx.lineTo(pw / 2, ph * 0.08); ctx.stroke();
      }
      for (let i = 1; i <= 7; i++) {
        const y = ph * (0.64 - i * 0.08);
        const frac = (ph * 0.64 - y) / (ph * 0.56);
        const xl = pw * 0.05 + pw * 0.45 * frac;
        const xr = pw * 0.95 - pw * 0.45 * frac;
        ctx.beginPath(); ctx.moveTo(xl, y); ctx.lineTo(xr, y); ctx.stroke();
      }

      // Floor line with glow
      ctx.shadowColor = '#f59e0b'; ctx.shadowBlur = 12;
      ctx.strokeStyle = 'rgba(245,158,11,0.3)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(pw * 0.05, ph * 0.64); ctx.lineTo(pw * 0.95, ph * 0.64); ctx.stroke();
      ctx.shadowBlur = 0;

      // ── Orbiting energy rings ──
      const cx = pw / 2, cy = ph * 0.5;
      rings.forEach(ring => {
        ring.angle += ring.speed;
        const rx = cx + Math.cos(ring.angle) * pw * ring.radius;
        const ry = cy + Math.sin(ring.angle) * ph * ring.radius * 0.3;
        ctx.shadowColor = ring.color; ctx.shadowBlur = 20;
        ctx.beginPath(); ctx.arc(rx, ry, ring.size, 0, Math.PI * 2);
        ctx.fillStyle = ring.color + Math.floor(ring.glow * 200).toString(16).padStart(2, '0');
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // ── Dust particles ──
      dust.forEach(p => {
        p.x += p.vx / pw; p.y += p.vy / ph;
        if (p.y < 0) { p.y = 1; p.x = Math.random(); }
        if (p.x < 0 || p.x > 1) p.x = Math.random();
        ctx.beginPath(); ctx.arc(p.x * pw, p.y * ph, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.c + Math.floor(p.a * 180).toString(16).padStart(2, '0');
        ctx.fill();
      });

      // ── Lightning sparks ──
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.life--;
        if (s.life <= 0) { sparks.splice(i, 1); continue; }
        const alpha = s.life / 18;
        ctx.strokeStyle = s.color + Math.floor(alpha * 200).toString(16).padStart(2, '0');
        ctx.lineWidth = 1.5;
        ctx.shadowColor = s.color; ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(s.x * pw, s.y * ph);
        ctx.lineTo(s.x * pw + Math.cos(s.angle) * s.len * pw, s.y * ph + Math.sin(s.angle) * s.len * ph);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // ── Hit impact flash ──
      if (hitFlash > 0) {
        const impactGrad = ctx.createRadialGradient(hitX * pw, hitY * ph, 0, hitX * pw, hitY * ph, pw * 0.18);
        impactGrad.addColorStop(0, `rgba(245,158,11,${hitFlash * 0.025})`);
        impactGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = impactGrad; ctx.fillRect(0, 0, pw, ph);
        ctx.fillStyle = `rgba(245,158,11,${hitFlash * 0.008})`;
        ctx.fillRect(0, 0, pw, ph);
        hitFlash--;
      }

      // ── Fighters ──
      f1.breath += 0.03; f2.breath += 0.025;
      fighter(pw * 0.27, ph * 0.62, false, '#ef4444', f1);
      fighter(pw * 0.73, ph * 0.62, true, '#8b5cf6', f2);

      // ── HUD ──
      const bw = pw * 0.27, bh = 8, hy = 24;
      // P1 bar
      ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.beginPath(); ctx.roundRect(pw * 0.055, hy, bw, bh, 4); ctx.fill();
      const g1 = ctx.createLinearGradient(pw * 0.055, 0, pw * 0.055 + bw, 0);
      g1.addColorStop(0, '#ef4444'); g1.addColorStop(1, '#f59e0b');
      ctx.fillStyle = g1; ctx.shadowColor = '#ef4444'; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.roundRect(pw * 0.055, hy, bw * f1.hp / 100, bh, 4); ctx.fill();
      ctx.shadowBlur = 0;
      // P2 bar
      ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.beginPath(); ctx.roundRect(pw * 0.675, hy, bw, bh, 4); ctx.fill();
      const g2 = ctx.createLinearGradient(pw * 0.675, 0, pw * 0.675 + bw, 0);
      g2.addColorStop(0, '#8b5cf6'); g2.addColorStop(1, '#06b6d4');
      ctx.fillStyle = g2; ctx.shadowColor = '#8b5cf6'; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.roundRect(pw * 0.675 + bw * (1 - f2.hp / 100), hy, bw * f2.hp / 100, bh, 4); ctx.fill();
      ctx.shadowBlur = 0;
      // Timer box
      const sec = Math.max(0, 99 - Math.floor(t / 60));
      ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.beginPath(); ctx.roundRect(pw / 2 - 24, hy - 4, 48, 22, 6); ctx.fill();
      ctx.strokeStyle = 'rgba(245,158,11,0.3)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.roundRect(pw / 2 - 24, hy - 4, 48, 22, 6); ctx.stroke();
      ctx.fillStyle = '#f59e0b'; ctx.font = `bold 14px Orbitron,monospace`;
      ctx.textAlign = 'center'; ctx.fillText(sec.toString().padStart(2, '0'), pw / 2, hy + 13); ctx.textAlign = 'left';
      // VS text
      ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.font = `700 10px Orbitron,monospace`;
      ctx.textAlign = 'center'; ctx.fillText('VS', pw / 2, hy + 33); ctx.textAlign = 'left';

      // ── Vignette ──
      const vig = ctx.createRadialGradient(pw / 2, ph / 2, ph * 0.2, pw / 2, ph / 2, ph);
      vig.addColorStop(0, 'transparent'); vig.addColorStop(1, 'rgba(2,2,7,0.85)');
      ctx.fillStyle = vig; ctx.fillRect(0, 0, pw, ph);

      t++;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); clearInterval(attackInterval); clearInterval(sparkInterval); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />;
}
