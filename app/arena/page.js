'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

/* --- Reveal on Scroll --- */
function useReveal(t = 0.12) {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setV(true); o.disconnect(); }
    }, { threshold: t });
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, []);
  return [ref, v];
}
function Reveal({ children, delay = 0, y = 34 }) {
  const [ref, v] = useReveal();
  return (
    <div ref={ref} style={{
      opacity: v ? 1 : 0,
      transform: v ? 'none' : `translateY(${y}px)`,
      transition: `opacity .7s ease ${delay}ms, transform .7s ease ${delay}ms`
    }}>{children}</div>
  );
}

/* --- Fighter Data --- */
const FIGHTERS = [
  { name: 'HEATBLAST', sub: 'Fire Alien', color: '#f59e0b', power: 9, speed: 8, defense: 7, rarity: 'Common' },
  { name: 'BIG CHILL', sub: 'Ice Ghost', color: '#38bdf8', power: 7, speed: 9, defense: 8, rarity: 'Common' },
  { name: 'SWAMPFIRE', sub: 'Plant Warrior', color: '#ef4444', power: 8, speed: 7, defense: 8, rarity: 'Common' },
  { name: 'SHOCKSQUATCH', sub: 'Thunder Beast', color: '#a78bfa', power: 9, speed: 7, defense: 7, rarity: 'Rare' },
  { name: 'RIPJAWS', sub: 'Aqua Predator', color: '#22c55e', power: 8, speed: 8, defense: 7, rarity: 'Common' },
  { name: 'UPGRADE', sub: 'Tech Symbiote', color: '#06b6d4', power: 7, speed: 8, defense: 9, rarity: 'Rare' },
  { name: 'CHROMASTONE', sub: 'Crystal Entity', color: '#f472b6', power: 8, speed: 7, defense: 9, rarity: 'Epic' },
  { name: 'FOUR ARMS', sub: 'Tetramand', color: '#94a3b8', power: 10, speed: 5, defense: 9, rarity: 'Epic' },
  { name: 'WILDMUTT', sub: 'Feral Hunter', color: '#fb923c', power: 8, speed: 9, defense: 6, rarity: 'Common' },
  { name: 'GHOSTFREAK', sub: 'Phantom', color: '#a78bfa', power: 8, speed: 8, defense: 8, rarity: 'Rare' },
  { name: 'NANOMECH', sub: 'Nano Bot', color: '#a3e635', power: 7, speed: 10, defense: 6, rarity: 'Common' },
  { name: 'CANNONBOLT', sub: 'Armored Tank', color: '#dc2626', power: 9, speed: 5, defense: 10, rarity: 'Rare' },
  { name: 'FASTTRACK', sub: 'Speedster', color: '#e2e8f0', power: 6, speed: 10, defense: 5, rarity: 'Common' },
  { name: 'BENWOLF', sub: 'Loboan', color: '#84cc16', power: 8, speed: 8, defense: 7, rarity: 'Common' },
  { name: 'ECHO ECHO', sub: 'Sound Clone', color: '#64748b', power: 7, speed: 8, defense: 8, rarity: 'Rare' },
  { name: 'HUMUNGOUSAUR', sub: 'Final Boss', color: '#d97706', power: 10, speed: 6, defense: 10, rarity: 'Legendary' },
];

const ARENAS = [
  { name: 'Nanotech Lab', img: '/game/bg_cyber.png', fighters: 'NANOMECH / UPGRADE' },
  { name: 'Deep Ocean', img: '/game/bg_ocean.png', fighters: 'RIPJAWS' },
  { name: 'Burning Jungle', img: '/game/bg_jungle.png', fighters: 'SWAMPFIRE' },
  { name: 'Ice Cave', img: '/game/bg_ice.png', fighters: 'BIG CHILL' },
  { name: 'Crystal Cavern', img: '/game/bg_crystal.png', fighters: 'CHROMASTONE' },
  { name: 'Dark Forest', img: '/game/bg_forest.png', fighters: 'WILDMUTT / BENWOLF' },
  { name: 'Ghost Realm', img: '/game/bg_ghost.png', fighters: 'GHOSTFREAK' },
  { name: 'Volcanic Inferno', img: '/game/bg_fire.png', fighters: 'HEATBLAST' },
  { name: 'Speed Track', img: '/game/bg_speed.png', fighters: 'FASTTRACK' },
  { name: 'Thunder Storm', img: '/game/bg_storm.png', fighters: 'SHOCKSQUATCH' },
  { name: 'Metal Forge', img: '/game/bg_forge.png', fighters: 'CANNONBOLT' },
  { name: 'Sound Void', img: '/game/bg_void.png', fighters: 'ECHO ECHO' },
  { name: 'Boss Throne', img: '/game/bg_boss.png', fighters: 'HUMUNGOUSAUR' },
];

const FEATURES = [
  { icon: '\u2694', title: '16 Unique Fighters', desc: 'Each alien has unique stats, special moves, and fighting style. Master them all.' },
  { icon: '\u26A1', title: '15-Stage Tower', desc: 'Battle through increasingly tough opponents to reach the final boss.' },
  { icon: '\u2605', title: '13 Unique Arenas', desc: 'Every stage has a stunning hand-crafted arena matching the opponent theme.' },
  { icon: '\u26F0', title: 'Adaptive AI', desc: 'CPU fighters learn, feint, combo-chain, and fight like real human opponents.' },
  { icon: '\u2316', title: '5-Minute Rounds', desc: 'Extended match timer ensures deep, strategic fights - not quick KOs.' },
  { icon: '\u2726', title: 'Pixel Art', desc: 'Beautiful 16-bit style sprites with smooth frame-by-frame animations.' },
];

const RARITY_COLORS = {
  Common: '#9ca3af', Rare: '#3b82f6', Epic: '#a855f7', Legendary: '#f59e0b'
};

/* --- Page --- */
export default function ArenaLanding() {
  const [selectedFighter, setSelectedFighter] = useState(0);
  const [arenaIdx, setArenaIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setArenaIdx(p => (p + 1) % ARENAS.length), 4000);
    return () => clearInterval(t);
  }, []);

  const f = FIGHTERS[selectedFighter];

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;800;900&family=Inter:wght@300;400;500;600&display=swap');
        .arena-page { font-family: 'Inter', sans-serif; background: #020207; color: #e2e8f0; min-height: 100vh; overflow-x: hidden; }
        .arena-page * { box-sizing: border-box; margin: 0; padding: 0; }
        .orb { font-family: 'Orbitron', sans-serif; }
        .a-section { padding: 100px 24px; position: relative; }
        .a-container { max-width: 1200px; margin: 0 auto; }
        .a-hero { min-height: 100vh; display: flex; align-items: center; justify-content: center; text-align: center; position: relative; overflow: hidden; }
        .a-hero-bg { position: absolute; inset: 0; background: url('/game/bg_boss.png') center/cover; opacity: 0.25; }
        .a-hero-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(2,2,7,0.5), rgba(2,2,7,0.95)); }
        .a-hero-content { position: relative; z-index: 10; }
        .a-badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 16px; border-radius: 100px; font-family: 'Orbitron', sans-serif; font-size: 9px; font-weight: 700; letter-spacing: 2px; border: 1px solid rgba(245,158,11,0.3); background: rgba(245,158,11,0.06); color: #f59e0b; }
        .a-title { font-family: 'Orbitron', sans-serif; font-size: clamp(48px, 8vw, 96px); font-weight: 900; letter-spacing: -1px; line-height: 1; margin: 24px 0 12px; }
        .a-title span { background: linear-gradient(135deg, #f59e0b, #ef4444); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .a-subtitle { font-family: 'Orbitron', sans-serif; font-size: clamp(14px, 2vw, 22px); letter-spacing: 12px; color: rgba(255,255,255,0.5); margin-bottom: 40px; }
        .a-btn { display: inline-flex; align-items: center; gap: 10px; padding: 18px 52px; border-radius: 4px; font-family: 'Orbitron', sans-serif; font-size: 14px; font-weight: 800; letter-spacing: 3px; text-decoration: none; transition: all .3s; cursor: pointer; border: none; }
        .a-btn-primary { background: linear-gradient(135deg, #f59e0b, #ef4444); color: #000; box-shadow: 0 0 40px rgba(245,158,11,0.3); }
        .a-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 0 60px rgba(245,158,11,0.5); }
        .a-btn-outline { background: transparent; border: 1px solid rgba(255,255,255,0.15); color: #e2e8f0; }
        .a-btn-outline:hover { border-color: #f59e0b; color: #f59e0b; }
        .a-heading { font-family: 'Orbitron', sans-serif; font-size: clamp(28px, 4vw, 44px); font-weight: 800; letter-spacing: -0.5px; margin-bottom: 16px; }
        .a-heading span { background: linear-gradient(135deg, #f59e0b, #ef4444); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .a-label { font-family: 'Orbitron', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 3px; color: #f59e0b; margin-bottom: 16px; }
        .a-text { color: rgba(255,255,255,0.55); font-size: 15px; line-height: 1.7; max-width: 500px; }
        .a-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .a-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
        .a-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 32px; transition: all .3s; }
        .a-card:hover { border-color: rgba(245,158,11,0.2); background: rgba(255,255,255,0.05); }
        .a-divider { width: 100%; height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent); }

        /* Fighter Grid */
        .fighter-grid { display: grid; grid-template-columns: repeat(8, 1fr); gap: 8px; }
        .fighter-chip { padding: 10px 4px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.02); text-align: center; cursor: pointer; transition: all .3s; }
        .fighter-chip:hover { border-color: rgba(245,158,11,0.3); }
        .fighter-chip.active { border-color: var(--fc); background: rgba(245,158,11,0.06); box-shadow: 0 0 20px rgba(245,158,11,0.1); }
        .fighter-chip .f-initial { width: 36px; height: 36px; border-radius: 8px; margin: 0 auto 6px; display: flex; align-items: center; justify-content: center; font-family: 'Orbitron', sans-serif; font-weight: 900; font-size: 14px; }
        .fighter-chip .f-name { font-family: 'Orbitron', sans-serif; font-size: 7px; font-weight: 700; letter-spacing: 0.5px; color: rgba(255,255,255,0.6); }

        /* Fighter Detail */
        .fighter-detail { padding: 40px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; }
        .stat-bar { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
        .stat-bar .stat-label { font-family: 'Orbitron', sans-serif; font-size: 9px; font-weight: 700; letter-spacing: 1px; color: rgba(255,255,255,0.4); width: 70px; }
        .stat-bar .stat-track { flex: 1; height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; }
        .stat-bar .stat-fill { height: 100%; border-radius: 3px; transition: width .5s ease; }
        .stat-bar .stat-val { font-family: 'Orbitron', sans-serif; font-size: 11px; font-weight: 800; width: 30px; text-align: right; }

        /* Arena Carousel */
        .arena-carousel { position: relative; border-radius: 16px; overflow: hidden; height: 400px; }
        .arena-slide { position: absolute; inset: 0; transition: opacity 1s ease; }
        .arena-slide img { width: 100%; height: 100%; object-fit: cover; }
        .arena-slide-info { position: absolute; bottom: 0; left: 0; right: 0; padding: 40px 32px 28px; background: linear-gradient(to top, rgba(0,0,0,0.9), transparent); }
        .arena-dots { display: flex; gap: 6px; justify-content: center; margin-top: 20px; }
        .arena-dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.15); cursor: pointer; transition: all .3s; border: none; }
        .arena-dot.active { background: #f59e0b; box-shadow: 0 0 10px rgba(245,158,11,0.4); }

        /* Feature cards */
        .feat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.15); margin-bottom: 20px; }

        /* Arena Header */
        .arena-header { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; padding: 16px 40px; display: flex; align-items: center; justify-content: space-between; background: rgba(2,2,7,0.85); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(245,158,11,0.08); }
        .arena-logo { display: flex; align-items: center; gap: 12px; text-decoration: none; }
        .arena-logo-icon { width: 36px; height: 36px; border-radius: 8px; background: linear-gradient(135deg, #f59e0b, #ef4444); display: flex; align-items: center; justify-content: center; font-family: 'Orbitron', sans-serif; font-weight: 900; font-size: 16px; color: #000; }
        .arena-logo-text { font-family: 'Orbitron', sans-serif; font-weight: 900; font-size: 16px; color: #fff; letter-spacing: 2px; }
        .arena-logo-sub { font-family: 'Orbitron', sans-serif; font-weight: 700; font-size: 8px; color: #f59e0b; letter-spacing: 3px; margin-top: 2px; }
        .arena-nav { display: flex; align-items: center; gap: 32px; }
        .arena-nav a { font-family: 'Orbitron', sans-serif; font-size: 10px; font-weight: 600; letter-spacing: 2px; color: rgba(255,255,255,0.5); text-decoration: none; transition: all .3s; }
        .arena-nav a:hover { color: #f59e0b; }
        .arena-play-btn { padding: 10px 28px; border-radius: 4px; background: linear-gradient(135deg, #f59e0b, #ef4444); font-family: 'Orbitron', sans-serif; font-size: 10px; font-weight: 800; letter-spacing: 2px; color: #000; text-decoration: none; transition: all .3s; box-shadow: 0 0 20px rgba(245,158,11,0.2); }
        .arena-play-btn:hover { transform: translateY(-1px); box-shadow: 0 0 30px rgba(245,158,11,0.4); }

        /* Arena Footer */
        .arena-footer { border-top: 1px solid rgba(245,158,11,0.08); padding: 60px 40px 32px; background: rgba(0,0,0,0.3); }
        .arena-footer-grid { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px; margin-bottom: 48px; }
        .arena-footer-col h4 { font-family: 'Orbitron', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 2px; color: #f59e0b; margin-bottom: 20px; }
        .arena-footer-col a { display: block; font-size: 13px; color: rgba(255,255,255,0.4); text-decoration: none; margin-bottom: 12px; transition: color .3s; }
        .arena-footer-col a:hover { color: #f59e0b; }
        .arena-footer-bottom { max-width: 1200px; margin: 0 auto; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.04); display: flex; align-items: center; justify-content: space-between; }
        .arena-footer-stat { display: flex; align-items: center; gap: 32px; }
        .arena-footer-stat div { text-align: center; }
        .arena-footer-stat .stat-num { font-family: 'Orbitron', sans-serif; font-size: 18px; font-weight: 900; background: linear-gradient(135deg, #f59e0b, #ef4444); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .arena-footer-stat .stat-lbl { font-size: 9px; color: rgba(255,255,255,0.3); letter-spacing: 1px; margin-top: 2px; font-family: 'Orbitron', sans-serif; font-weight: 600; }

        @media(max-width:768px) {
          .a-grid-3 { grid-template-columns: 1fr; }
          .a-grid-2 { grid-template-columns: 1fr; gap: 40px; }
          .fighter-grid { grid-template-columns: repeat(4, 1fr); }
          .arena-header { padding: 12px 20px; }
          .arena-nav { gap: 16px; }
          .arena-footer-grid { grid-template-columns: 1fr 1fr; }
          .arena-footer-bottom { flex-direction: column; gap: 20px; }
        }
      `}</style>

      <div className="arena-page">
        {/* ===== ARENA HEADER ===== */}
        <header className="arena-header">
          <Link href="/" className="arena-logo">
            <div className="arena-logo-icon">A</div>
            <div>
              <div className="arena-logo-text">AILURIX</div>
              <div className="arena-logo-sub">ARENA</div>
            </div>
          </Link>
          <nav className="arena-nav">
            <a href="#fighters">Fighters</a>
            <a href="#arenas">Arenas</a>
            <Link href="/">Studio</Link>
            <Link href="/game" className="arena-play-btn">PLAY NOW</Link>
          </nav>
        </header>

        {/* ===== HERO ===== */}
        <section className="a-hero">
          <div className="a-hero-bg" />
          <div className="a-hero-overlay" />
          <div className="a-hero-content">
            <Reveal>
              <div className="a-badge">
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', animation: 'blink 1.5s infinite' }} />
                SEASON 1 - NOW LIVE
              </div>
            </Reveal>
            <Reveal delay={100}>
              <h1 className="a-title"><span>AILURIX</span></h1>
              <div className="a-subtitle">A R E N A</div>
            </Reveal>
            <Reveal delay={200}>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, maxWidth: 520, margin: '0 auto 44px', lineHeight: 1.7 }}>
                16 alien fighters. 15 stages. 13 unique arenas. One champion.
                Battle through the ultimate pixel-art fighting tournament.
              </p>
            </Reveal>
            <Reveal delay={300}>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/game" className="a-btn a-btn-primary">⚔️ PLAY NOW</Link>
                <a href="/Ailurix-Arena-v3.apk" download className="a-btn" style={{ background: 'linear-gradient(135deg,#16a34a,#15803d)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.523 15.341l-5.496 3.174a.12.12 0 0 1-.054.014.12.12 0 0 1-.054-.014L6.423 15.34A.12.12 0 0 1 6.36 15.236V8.764a.12.12 0 0 1 .063-.104l5.496-3.174a.12.12 0 0 1 .108 0l5.496 3.174a.12.12 0 0 1 .063.104v6.472a.12.12 0 0 1-.063.104z"/><path d="M2 12A10 10 0 1 0 12 2 10 10 0 0 0 2 12zm8-3.5l2 2 2-2V13l-2 2-2-2z"/></svg>
                  ANDROID APK
                </a>
                <a href="#fighters" className="a-btn a-btn-outline">VIEW FIGHTERS</a>
              </div>
            </Reveal>
          </div>
        </section>

        <div className="a-divider" />

        {/* ===== FEATURES ===== */}
        <section className="a-section">
          <div className="a-container">
            <Reveal>
              <div style={{ textAlign: 'center', marginBottom: 64 }}>
                <div className="a-label">GAME FEATURES</div>
                <h2 className="a-heading">Built to <span>Fight</span></h2>
                <p className="a-text" style={{ margin: '0 auto' }}>
                  Every detail crafted for competitive, skill-based combat.
                </p>
              </div>
            </Reveal>

            <div className="a-grid-3">
              {FEATURES.map((feat, i) => (
                <Reveal key={feat.title} delay={i * 80}>
                  <div className="a-card">
                    <div className="feat-icon" dangerouslySetInnerHTML={{ __html: feat.icon }} />
                    <h3 className="orb" style={{ fontSize: 14, fontWeight: 800, letterSpacing: 1, marginBottom: 10 }}>{feat.title}</h3>
                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, lineHeight: 1.6 }}>{feat.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <div className="a-divider" />

        {/* ===== FIGHTERS ===== */}
        <section id="fighters" className="a-section">
          <div className="a-container">
            <Reveal>
              <div style={{ textAlign: 'center', marginBottom: 48 }}>
                <div className="a-label">ROSTER</div>
                <h2 className="a-heading">Choose Your <span>Fighter</span></h2>
                <p className="a-text" style={{ margin: '0 auto' }}>
                  16 unique aliens. Each with distinct power, speed, and defense stats.
                </p>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <div className="fighter-grid" style={{ marginBottom: 32 }}>
                {FIGHTERS.map((fig, i) => (
                  <div
                    key={fig.name}
                    className={`fighter-chip ${selectedFighter === i ? 'active' : ''}`}
                    style={{ '--fc': fig.color }}
                    onClick={() => setSelectedFighter(i)}
                  >
                    <div className="f-initial" style={{ background: `${fig.color}15`, border: `1px solid ${fig.color}30`, color: fig.color }}>
                      {fig.name[0]}
                    </div>
                    <div className="f-name">{fig.name}</div>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="fighter-detail">
                <div className="a-grid-2" style={{ gap: 48 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
                      <div style={{ width: 72, height: 72, borderRadius: 16, background: `${f.color}12`, border: `2px solid ${f.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Orbitron', sans-serif", fontWeight: 900, fontSize: 28, color: f.color }}>
                        {f.name[0]}
                      </div>
                      <div>
                        <h3 className="orb" style={{ fontSize: 22, fontWeight: 900, letterSpacing: 1 }}>{f.name}</h3>
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 4 }}>{f.sub}</div>
                        <div style={{ marginTop: 6, display: 'inline-block', padding: '3px 12px', borderRadius: 100, fontSize: 9, fontFamily: "'Orbitron', sans-serif", fontWeight: 700, color: RARITY_COLORS[f.rarity], background: `${RARITY_COLORS[f.rarity]}15`, border: `1px solid ${RARITY_COLORS[f.rarity]}30` }}>
                          {f.rarity}
                        </div>
                      </div>
                    </div>

                    {[
                      { label: 'POWER', val: f.power, color: '#ef4444' },
                      { label: 'SPEED', val: f.speed, color: '#3b82f6' },
                      { label: 'DEFENSE', val: f.defense, color: '#22c55e' },
                    ].map(s => (
                      <div className="stat-bar" key={s.label}>
                        <div className="stat-label">{s.label}</div>
                        <div className="stat-track">
                          <div className="stat-fill" style={{ width: `${s.val * 10}%`, background: `linear-gradient(90deg, ${s.color}, ${s.color}80)` }} />
                        </div>
                        <div className="stat-val" style={{ color: s.color }}>{s.val}/10</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '100%', height: 200, borderRadius: 12, background: `${f.color}08`, border: `1px solid ${f.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 80, fontWeight: 900, color: `${f.color}30` }}>
                        {f.name[0]}
                      </div>
                    </div>
                    <div className="orb" style={{ marginTop: 16, fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: 2 }}>
                      FIGHTER #{selectedFighter + 1} OF 16
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <div className="a-divider" />

        {/* ===== ARENAS ===== */}
        <section id="arenas" className="a-section">
          <div className="a-container">
            <Reveal>
              <div style={{ textAlign: 'center', marginBottom: 48 }}>
                <div className="a-label">BATTLE ARENAS</div>
                <h2 className="a-heading">13 Unique <span>Worlds</span></h2>
                <p className="a-text" style={{ margin: '0 auto' }}>
                  Every fight takes place in a hand-crafted arena matching the opponent character.
                </p>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <div className="arena-carousel">
                {ARENAS.map((a, i) => (
                  <div key={a.name} className="arena-slide" style={{ opacity: arenaIdx === i ? 1 : 0 }}>
                    <img src={a.img} alt={a.name} />
                    <div className="arena-slide-info">
                      <div className="orb" style={{ fontSize: 20, fontWeight: 800, letterSpacing: 1, marginBottom: 4 }}>{a.name}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Home of {a.fighters}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="arena-dots">
                {ARENAS.map((_, i) => (
                  <button key={i} className={`arena-dot ${arenaIdx === i ? 'active' : ''}`} onClick={() => setArenaIdx(i)} />
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <div className="a-divider" />

        {/* ===== HOW TO PLAY ===== */}
        <section className="a-section">
          <div className="a-container">
            <Reveal>
              <div style={{ textAlign: 'center', marginBottom: 64 }}>
                <div className="a-label">HOW TO PLAY</div>
                <h2 className="a-heading">Ready in <span>Seconds</span></h2>
              </div>
            </Reveal>

            <div className="a-grid-3">
              {[
                { step: '01', title: 'Choose Fighter', desc: 'Select from 16 unique alien fighters, each with different stats and special moves.' },
                { step: '02', title: 'Battle Tower', desc: 'Fight through 15 stages of increasing difficulty. Each stage has a unique arena and opponent.' },
                { step: '03', title: 'Defeat the Boss', desc: 'Reach Stage 15 and face HUMUNGOUSAUR in the Boss Throne arena to claim victory.' },
              ].map((s, i) => (
                <Reveal key={s.step} delay={i * 120}>
                  <div className="a-card" style={{ textAlign: 'center', padding: '48px 32px' }}>
                    <div className="orb" style={{ fontSize: 48, fontWeight: 900, background: 'linear-gradient(135deg, #f59e0b, #ef4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 20 }}>
                      {s.step}
                    </div>
                    <h3 className="orb" style={{ fontSize: 16, fontWeight: 800, letterSpacing: 1, marginBottom: 12 }}>{s.title}</h3>
                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, lineHeight: 1.6 }}>{s.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <div className="a-divider" />

        {/* ===== CTA ===== */}
        <section className="a-section" style={{ textAlign: 'center', padding: '120px 24px' }}>
          <div className="a-container">
            <Reveal>
              <div className="a-label" style={{ marginBottom: 24 }}>SEASON 1 IS LIVE</div>
              <h2 className="a-heading" style={{ fontSize: 'clamp(32px, 5vw, 56px)' }}>
                Enter the<br /><span>Arena</span>
              </h2>
              <p className="a-text" style={{ margin: '16px auto 48px' }}>
                Free to play. No wallet required. Just pure skill-based combat.
              </p>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/game" className="a-btn a-btn-primary" style={{ fontSize: 16, padding: '20px 64px' }}>⚔️ PLAY NOW</Link>
                <a href="/Ailurix-Arena-v3.apk" download className="a-btn" style={{ fontSize: 16, padding: '20px 48px', background: 'linear-gradient(135deg,#16a34a,#15803d)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
                  📱 DOWNLOAD APK
                </a>
                <Link href="/" className="a-btn a-btn-outline">BACK TO STUDIO</Link>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ===== ARENA FOOTER ===== */}
        <footer className="arena-footer">
          <div className="arena-footer-grid">
            <div className="arena-footer-col">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div className="arena-logo-icon" style={{ width: 32, height: 32, fontSize: 14 }}>A</div>
                <div>
                  <div className="orb" style={{ fontSize: 14, fontWeight: 900, letterSpacing: 2 }}>AILURIX ARENA</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>Season 1</div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', lineHeight: 1.7, maxWidth: 300 }}>
                The ultimate pixel-art fighting tournament. 16 alien fighters, 13 unique arenas, one champion.
              </p>
            </div>
            <div className="arena-footer-col">
              <h4>GAME</h4>
              <Link href="/game">Play Now</Link>
              <a href="#fighters">All Fighters</a>
              <a href="#arenas">Battle Arenas</a>
            </div>
            <div className="arena-footer-col">
              <h4>EXPLORE</h4>
              <Link href="/">Ailurix Studios</Link>
              <Link href="/#token">$ARX Token</Link>
              <Link href="/#roadmap">Roadmap</Link>
            </div>
            <div className="arena-footer-col">
              <h4>COMMUNITY</h4>
              <a href="https://discord.gg/ailurix" target="_blank" rel="noopener">Discord</a>
              <a href="https://x.com/AilurixStudios" target="_blank" rel="noopener">Twitter / X</a>
              <a href="https://t.me/ailurix" target="_blank" rel="noopener">Telegram</a>
            </div>
          </div>
          <div className="arena-footer-bottom">
            <div className="orb" style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', letterSpacing: 2 }}>
              &copy; 2026 AILURIX STUDIOS LLC
            </div>
            <div className="arena-footer-stat">
              <div><div className="stat-num">16</div><div className="stat-lbl">FIGHTERS</div></div>
              <div><div className="stat-num">15</div><div className="stat-lbl">STAGES</div></div>
              <div><div className="stat-num">13</div><div className="stat-lbl">ARENAS</div></div>
              <div><div className="stat-num">S1</div><div className="stat-lbl">SEASON</div></div>
            </div>
          </div>
        </footer>
      </div>

      <style jsx global>{`
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>
    </>
  );
}
