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

    // Particles
    const pts = Array.from({ length: 70 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.8 + 0.4,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -Math.random() * 0.6 - 0.15,
      a: Math.random() * 0.45 + 0.1,
      c: ['#f59e0b', '#ef4444', '#8b5cf6'][Math.floor(Math.random() * 3)],
    }));

    // State
    const f1 = { hp: 72, energy: 60, attacking: false, breath: 0 };
    const f2 = { hp: 88, energy: 45, attacking: false, breath: 0.8 };
    let hitFlash = 0, t = 0;

    const attackInterval = setInterval(() => {
      const att = Math.random() > 0.5 ? f1 : f2;
      att.attacking = true;
      hitFlash = 10;
      if (att === f1) f2.hp = Math.max(8, f2.hp - Math.random() * 7 - 2);
      else f1.hp = Math.max(8, f1.hp - Math.random() * 7 - 2);
      setTimeout(() => { att.attacking = false; }, 280);
    }, 1400);

    function fighter(x, y, flip, color, data) {
      const dpr = window.devicePixelRatio || 1;
      const pw = W / dpr, ph = H / dpr;
      const sc = ph * 0.28;
      const by = Math.sin(data.breath) * 2.5;
      ctx.save();
      if (flip) { ctx.translate(pw, 0); ctx.scale(-1, 1); x = pw - x; }
      // Glow halo
      const g = ctx.createRadialGradient(x, y, 0, x, y, sc * 1.1);
      g.addColorStop(0, color + '25'); g.addColorStop(1, 'transparent');
      ctx.fillStyle = g; ctx.fillRect(x - sc, y - sc - 20, sc * 2, sc * 2);
      // Silhouette
      ctx.shadowColor = color; ctx.shadowBlur = 18; ctx.fillStyle = color + 'dd';
      // Head
      ctx.beginPath(); ctx.arc(x, y - sc * 0.84 + by, sc * 0.12, 0, Math.PI * 2); ctx.fill();
      // Torso
      ctx.fillRect(x - sc * 0.09, y - sc * 0.72 + by, sc * 0.18, sc * 0.38);
      // Legs
      ctx.fillRect(x - sc * 0.1, y - sc * 0.34 + by, sc * 0.085, sc * 0.34);
      ctx.fillRect(x + sc * 0.015, y - sc * 0.34 + by, sc * 0.085, sc * 0.34);
      // Arms
      if (data.attacking) {
        ctx.fillRect(x + sc * 0.09, y - sc * 0.62 + by, sc * 0.38, sc * 0.07);
        // Spark
        ctx.shadowColor = '#f59e0b'; ctx.shadowBlur = 30;
        ctx.beginPath(); ctx.arc(x + sc * 0.47, y - sc * 0.59 + by, sc * 0.06, 0, Math.PI * 2); ctx.fillStyle = '#f59e0b'; ctx.fill();
      } else {
        ctx.fillStyle = color + 'dd';
        ctx.fillRect(x - sc * 0.18, y - sc * 0.68 + by, sc * 0.08, sc * 0.28);
        ctx.fillRect(x + sc * 0.1, y - sc * 0.68 + by, sc * 0.08, sc * 0.28);
      }
      ctx.restore();
    }

    function draw() {
      const dpr = window.devicePixelRatio || 1;
      const pw = W / dpr, ph = H / dpr;
      ctx.clearRect(0, 0, pw, ph);

      // BG
      const bg = ctx.createLinearGradient(0, 0, 0, ph);
      bg.addColorStop(0, '#020207'); bg.addColorStop(1, '#07071a');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, pw, ph);

      // Arena floor glow
      const fg = ctx.createRadialGradient(pw / 2, ph * 0.62, 0, pw / 2, ph * 0.62, pw * 0.55);
      fg.addColorStop(0, 'rgba(245,158,11,0.07)'); fg.addColorStop(1, 'transparent');
      ctx.fillStyle = fg; ctx.fillRect(0, 0, pw, ph);

      // Perspective grid
      ctx.strokeStyle = 'rgba(245,158,11,0.055)'; ctx.lineWidth = 0.8;
      for (let i = 0; i <= 10; i++) {
        const x = pw * 0.08 + i * pw * 0.84 / 10;
        ctx.beginPath(); ctx.moveTo(x, ph * 0.62); ctx.lineTo(pw / 2, ph * 0.1); ctx.stroke();
      }
      for (let i = 1; i <= 5; i++) {
        const y = ph * (0.62 - i * 0.1);
        const frac = (ph * 0.62 - y) / (ph * 0.52);
        const xl = pw * 0.08 + (pw * 0.42) * frac;
        const xr = pw * 0.92 - (pw * 0.42) * frac;
        ctx.beginPath(); ctx.moveTo(xl, y); ctx.lineTo(xr, y); ctx.stroke();
      }

      // Floor line
      ctx.strokeStyle = 'rgba(245,158,11,0.22)'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(pw * 0.08, ph * 0.62); ctx.lineTo(pw * 0.92, ph * 0.62); ctx.stroke();

      // Particles
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.y < 0) { p.y = ph; p.x = Math.random() * pw; }
        if (p.x < 0 || p.x > pw) p.x = Math.random() * pw;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.c + Math.floor(p.a * 255).toString(16).padStart(2, '0');
        ctx.fill();
      });

      // Hit flash
      if (hitFlash > 0) {
        ctx.fillStyle = `rgba(245,158,11,${hitFlash * 0.015})`;
        ctx.fillRect(0, 0, pw, ph);
        hitFlash--;
      }

      // Fighters
      f1.breath += 0.03; f2.breath += 0.025;
      fighter(pw * 0.27, ph * 0.6, false, '#ef4444', f1);
      fighter(pw * 0.73, ph * 0.6, true, '#8b5cf6', f2);

      // HUD - health bars
      const bw = pw * 0.26, bh = 7, hy = 22;
      // P1
      ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(pw * 0.06, hy, bw, bh);
      const g1 = ctx.createLinearGradient(pw * 0.06, 0, pw * 0.06 + bw, 0);
      g1.addColorStop(0, '#ef4444'); g1.addColorStop(1, '#f59e0b');
      ctx.fillStyle = g1; ctx.fillRect(pw * 0.06, hy, bw * f1.hp / 100, bh);
      ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1;
      ctx.strokeRect(pw * 0.06, hy, bw, bh);
      // P2
      ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(pw * 0.68, hy, bw, bh);
      const g2 = ctx.createLinearGradient(pw * 0.68, 0, pw * 0.68 + bw, 0);
      g2.addColorStop(0, '#8b5cf6'); g2.addColorStop(1, '#06b6d4');
      const p2x = pw * 0.68 + bw * (1 - f2.hp / 100);
      ctx.fillStyle = g2; ctx.fillRect(p2x, hy, bw * f2.hp / 100, bh);
      ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.strokeRect(pw * 0.68, hy, bw, bh);
      // Timer
      const sec = Math.max(0, 99 - Math.floor(t / 60));
      ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.beginPath(); ctx.roundRect(pw / 2 - 22, hy - 3, 44, 20, 4); ctx.fill();
      ctx.fillStyle = '#f59e0b'; ctx.font = `bold 13px Orbitron,monospace`;
      ctx.textAlign = 'center'; ctx.fillText(sec.toString().padStart(2, '0'), pw / 2, hy + 12); ctx.textAlign = 'left';
      // VS
      ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.font = `700 9px Orbitron,monospace`;
      ctx.textAlign = 'center'; ctx.fillText('VS', pw / 2, hy + 30); ctx.textAlign = 'left';

      // Vignette
      const vig = ctx.createRadialGradient(pw / 2, ph / 2, ph * 0.25, pw / 2, ph / 2, ph * 0.9);
      vig.addColorStop(0, 'transparent'); vig.addColorStop(1, 'rgba(2,2,7,0.75)');
      ctx.fillStyle = vig; ctx.fillRect(0, 0, pw, ph);

      t++;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); clearInterval(attackInterval); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />;
}
