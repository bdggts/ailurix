'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import ArenaCanvas from './ArenaCanvas';

/* ─── Scroll reveal ───────────────────────────────── */
function useReveal(threshold = 0.12) {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); o.disconnect(); } }, { threshold });
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, []);
  return [ref, v];
}
function Reveal({ children, delay = 0, y = 36 }) {
  const [ref, v] = useReveal();
  return (
    <div ref={ref} style={{ opacity: v ? 1 : 0, transform: v ? 'none' : `translateY(${y}px)`, transition: `opacity .75s ease ${delay}ms, transform .75s ease ${delay}ms` }}>
      {children}
    </div>
  );
}

/* ─── Marquee ticker ──────────────────────────────── */
const TICKER = ['AILURIX STUDIOS', '1M+ PLAYERS', 'SEASON 1 LIVE', '$ARX TOKEN', 'BASE CHAIN', 'AILURIX ARENA', 'PLAY TO EARN', 'PHASE 2 INCOMING', 'AILURIX FARM', 'COMING SOON'];
function Ticker() {
  const items = [...TICKER, ...TICKER];
  return (
    <div style={{ overflow: 'hidden', borderTop: '1px solid rgba(245,158,11,0.15)', borderBottom: '1px solid rgba(245,158,11,0.15)', background: 'rgba(245,158,11,0.04)', padding: '10px 0' }}>
      <style>{`@keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>
      <div style={{ display: 'flex', gap: 0, animation: 'ticker 28s linear infinite', whiteSpace: 'nowrap', width: 'fit-content' }}>
        {items.map((s, i) => (
          <span key={i} style={{ padding: '0 32px', fontSize: 11, fontWeight: 700, letterSpacing: 3, color: i % 2 === 0 ? 'rgba(245,158,11,0.9)' : 'rgba(255,255,255,0.3)', fontFamily: "'Orbitron',sans-serif" }}>
            {s} <span style={{ color: 'rgba(245,158,11,0.3)', margin: '0 8px' }}>—</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Data ────────────────────────────────────────── */
const GAMES = [
  {
    id: '01', name: 'AILURIX ARENA', status: 'LIVE NOW',
    statusColor: '#22c55e', desc: 'A pixel-art fighting game featuring 16 unique alien fighters. Battle through a 15-stage tower, master your fighter, and defeat the final boss to earn $ARX.',
    highlights: ['16 Fighter Roster', '15-Stage Tower Mode', 'Adaptive AI Opponent', 'Live Leaderboard'],
    cta: '/game', ctaText: 'Play Now',
    accent: '#ef4444',
  },
  {
    id: '02', name: 'AILURIX FARM', status: 'COMING SOON',
    statusColor: '#f59e0b', desc: 'A blockchain farming simulation where you plant, cultivate, and harvest resources. Trade on the in-game marketplace and accumulate $ARX through strategic play.',
    highlights: ['Resource Management', 'On-Chain Marketplace', 'Land NFT System', 'DeFi Yield Integration'],
    cta: '#roadmap', ctaText: 'See Roadmap',
    accent: '#22c55e',
  },
];

const TOKEN_STATS = [
  { label: 'Token Name', value: '$ARX' },
  { label: 'Network', value: 'Base Chain' },
  { label: 'Total Supply', value: '1,000,000,000' },
  { label: 'Model', value: 'Deflationary' },
];

const EARN = ['Win fight round', 'Complete a stage', 'Defeat final boss', 'Daily login streak', 'Refer new player', 'Flawless victory bonus'];
const BURN = ['Unlock character skin', 'Tournament entry fee', 'In-game revival', 'Power-up purchase', 'NFT character mint', 'Equipment upgrade'];

const ROADMAP = [
  { n: '01', title: 'Arena Launch', status: 'COMPLETE', color: '#22c55e', items: ['16 alien fighters', '15-stage tower', 'Adaptive CPU AI', 'Studio rebrand'] },
  { n: '02', title: 'Token + Earn', status: 'IN PROGRESS', color: '#f59e0b', items: ['$ARX on Base chain', 'Wallet integration', 'Win-to-earn rewards', 'Tournament mode'] },
  { n: '03', title: 'Ailurix Farm', status: 'UPCOMING', color: 'rgba(255,255,255,0.25)', items: ['Farm game launch', 'Shared $ARX token', 'Land NFT drops', 'DeFi pools'] },
  { n: '04', title: 'Ecosystem', status: 'UPCOMING', color: 'rgba(255,255,255,0.25)', items: ['DEX listing', 'CoinGecko / CMC', 'New game titles', 'DAO governance'] },
];

/* ─── Styles ──────────────────────────────────────── */
const orb = "'Orbitron','Rajdhani',sans-serif";
const C = { gold: '#f59e0b', red: '#ef4444', border: 'rgba(255,255,255,0.07)', dim: 'rgba(255,255,255,0.42)', card: 'rgba(255,255,255,0.025)' };

/* ─── Page ────────────────────────────────────────── */
export default function Home() {
  const [scroll, setScroll] = useState(0);
  useEffect(() => {
    const fn = () => setScroll(window.scrollY);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const navSolid = scroll > 60;

  return (
    <div style={{ background: '#020207', color: '#fff', minHeight: '100vh', fontFamily: "'Inter',sans-serif" }}>

      {/* ═══════════════════════════ HEADER ══════════════════════════ */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 48px',
        background: navSolid ? 'rgba(2,2,7,0.96)' : 'transparent',
        backdropFilter: navSolid ? 'blur(24px)' : 'none',
        borderBottom: `1px solid ${navSolid ? C.border : 'transparent'}`,
        transition: 'background .4s, backdrop-filter .4s, border-color .4s',
      }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg,#f59e0b,#ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: orb, fontWeight: 900, fontSize: 16, color: '#000' }}>A</div>
          <span style={{ fontFamily: orb, fontSize: 16, fontWeight: 900, letterSpacing: 2.5, color: '#fff' }}>AIL<span style={{ color: C.gold }}>URIX</span></span>
        </Link>

        {/* Nav links */}
        <nav style={{ display: 'flex', gap: 36, alignItems: 'center' }}>
          {[['Games', '#games'], ['Token', '#token'], ['Roadmap', '#roadmap']].map(([l, h]) => (
            <a key={l} href={h} style={{ color: C.dim, textDecoration: 'none', fontSize: 13, fontWeight: 500, letterSpacing: 0.3, transition: 'color .2s' }}
              onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = C.dim}>{l}</a>
          ))}
        </nav>

        {/* CTA */}
        <Link href="/game" style={{
          padding: '9px 26px', borderRadius: 3,
          background: 'linear-gradient(135deg,#f59e0b,#ef4444)',
          color: '#000', fontWeight: 900, fontSize: 12,
          textDecoration: 'none', fontFamily: orb, letterSpacing: 1.5,
          boxShadow: '0 0 20px rgba(245,158,11,0.25)',
          transition: 'box-shadow .3s',
        }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 36px rgba(245,158,11,0.5)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 20px rgba(245,158,11,0.25)'}
        >PLAY NOW</Link>
      </header>

      {/* ═══════════════════════════ HERO ════════════════════════════ */}
      <section style={{ position: 'relative', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {/* Live arena canvas */}
        <ArenaCanvas />

        {/* Dark overlay so text is readable */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(2,2,7,0.45) 0%, rgba(2,2,7,0.2) 40%, rgba(2,2,7,0.7) 100%)' }} />

        {/* Hero copy — centered */}
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 24px', maxWidth: 820 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 2, padding: '6px 18px', fontSize: 10, fontWeight: 700, color: '#ef4444', marginBottom: 28, letterSpacing: 3, fontFamily: orb }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', display: 'inline-block', animation: 'blink 1s ease-in-out infinite' }} />
            SEASON 1 — LIVE
            <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:.2}}`}</style>
          </div>

          <h1 style={{ fontFamily: orb, fontSize: 'clamp(48px,9vw,108px)', fontWeight: 900, lineHeight: 0.95, letterSpacing: 2, marginBottom: 20, textShadow: '0 0 60px rgba(245,158,11,0.3)' }}>
            <span style={{ background: 'linear-gradient(135deg,#f59e0b,#fbbf24,#ef4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AILURIX</span>
            <br />
            <span style={{ color: '#fff' }}>STUDIOS</span>
          </h1>

          <p style={{ fontFamily: orb, fontSize: 'clamp(11px,2vw,14px)', color: 'rgba(255,255,255,0.28)', letterSpacing: 9, marginBottom: 36 }}>PLAY · EARN · OWN</p>

          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, marginBottom: 44, maxWidth: 520, margin: '0 auto 44px' }}>
            The future of blockchain gaming. Fight, farm, and earn <strong style={{ color: C.gold, fontWeight: 600 }}>$ARX tokens</strong> across every Ailurix title.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/game" style={{ padding: '16px 44px', borderRadius: 3, background: 'linear-gradient(135deg,#f59e0b,#ef4444)', color: '#000', fontWeight: 900, fontSize: 13, textDecoration: 'none', fontFamily: orb, letterSpacing: 2, boxShadow: '0 0 32px rgba(245,158,11,0.4)' }}>
              ENTER ARENA
            </Link>
            <a href="#token" style={{ padding: '16px 44px', borderRadius: 3, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)', color: 'rgba(255,255,255,0.75)', fontWeight: 700, fontSize: 13, textDecoration: 'none', fontFamily: orb, letterSpacing: 1.5 }}>
              $ARX TOKEN
            </a>
          </div>
        </div>

        {/* Scroll cue */}
        <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, zIndex: 10 }}>
          <span style={{ fontSize: 9, color: C.dim, letterSpacing: 3, fontFamily: orb }}>SCROLL</span>
          <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, rgba(245,158,11,0.6), transparent)', animation: 'scrollPulse 2s ease-in-out infinite' }} />
          <style>{`@keyframes scrollPulse{0%,100%{opacity:.4;transform:scaleY(1)}50%{opacity:1;transform:scaleY(1.15)}}`}</style>
        </div>
      </section>

      {/* ═══ TICKER ══════════════════════════════════════════════════ */}
      <Ticker />

      {/* ═══════════════════════════ GAMES ═══════════════════════════ */}
      <section id="games" style={{ padding: '120px 48px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <Reveal>
            <div style={{ marginBottom: 72 }}>
              <div style={{ fontSize: 10, letterSpacing: 4, color: C.gold, fontFamily: orb, fontWeight: 700, marginBottom: 14 }}>PLATFORM</div>
              <h2 style={{ fontFamily: orb, fontSize: 'clamp(28px,4vw,52px)', fontWeight: 900, lineHeight: 1.1 }}>Two games.<br />One token.</h2>
            </div>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(460px,1fr))', gap: 2 }}>
            {GAMES.map((g, i) => (
              <Reveal key={g.id} delay={i * 100}>
                <div style={{ border: `1px solid ${C.border}`, background: C.card, padding: '48px 44px', position: 'relative', overflow: 'hidden', transition: 'border-color .3s, background .3s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = g.accent + '55'; e.currentTarget.style.background = g.accent + '08'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.card; }}>
                  <div style={{ position: 'absolute', top: 0, right: 0, width: 200, height: 200, background: `radial-gradient(circle at top right, ${g.accent}12, transparent 70%)`, pointerEvents: 'none' }} />

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
                    <span style={{ fontSize: 10, fontFamily: orb, fontWeight: 700, letterSpacing: 3, color: C.dim }}>{g.id}</span>
                    <span style={{ fontSize: 9.5, fontFamily: orb, fontWeight: 700, letterSpacing: 2.5, color: g.statusColor, background: g.statusColor + '15', border: `1px solid ${g.statusColor}30`, padding: '4px 12px', borderRadius: 2 }}>{g.status}</span>
                  </div>

                  <h3 style={{ fontFamily: orb, fontSize: 'clamp(20px,2.5vw,28px)', fontWeight: 900, marginBottom: 18, color: '#fff' }}>{g.name}</h3>
                  <p style={{ fontSize: 14, color: C.dim, lineHeight: 1.85, marginBottom: 32 }}>{g.desc}</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 36 }}>
                    {g.highlights.map(h => (
                      <div key={h} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: g.accent, flexShrink: 0 }} />
                        {h}
                      </div>
                    ))}
                  </div>

                  <Link href={g.cta} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 12, fontFamily: orb, fontWeight: 700, letterSpacing: 1.5, color: g.accent, textDecoration: 'none', borderBottom: `1px solid ${g.accent}40`, paddingBottom: 3, transition: 'border-color .2s, gap .2s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = g.accent; e.currentTarget.style.gap = '16px'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = g.accent + '40'; e.currentTarget.style.gap = '10px'; }}>
                    {g.ctaText.toUpperCase()}
                    <span style={{ fontSize: 16 }}>&#x2192;</span>
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════ TOKEN ═══════════════════════════ */}
      <section id="token" style={{ padding: '120px 48px', borderBottom: `1px solid ${C.border}`, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 65% 50%, rgba(139,92,246,0.06), transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1180, margin: '0 auto', position: 'relative' }}>
          <Reveal>
            <div style={{ marginBottom: 72 }}>
              <div style={{ fontSize: 10, letterSpacing: 4, color: C.gold, fontFamily: orb, fontWeight: 700, marginBottom: 14 }}>ECONOMICS</div>
              <h2 style={{ fontFamily: orb, fontSize: 'clamp(28px,4vw,52px)', fontWeight: 900 }}>The $ARX Token</h2>
              <p style={{ fontSize: 15, color: C.dim, marginTop: 14, maxWidth: 460, lineHeight: 1.8 }}>One token powers every Ailurix game. Deflationary by design — burn exceeds earn.</p>
            </div>
          </Reveal>

          {/* Token stats row */}
          <Reveal delay={60}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, border: `1px solid ${C.border}`, marginBottom: 40 }}>
              {TOKEN_STATS.map(s => (
                <div key={s.label} style={{ padding: '28px 32px', borderRight: `1px solid ${C.border}`, background: C.card }}>
                  <div style={{ fontSize: 10, color: C.dim, fontFamily: orb, letterSpacing: 3, marginBottom: 10 }}>{s.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 900, fontFamily: orb }}>{s.value}</div>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Earn / Burn */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {[{ label: 'EARN $ARX', color: '#22c55e', items: EARN, sub: 'Actions that generate tokens' }, { label: 'BURN $ARX', color: '#ef4444', items: BURN, sub: 'Actions that remove tokens from supply' }].map((eb, i) => (
              <Reveal key={eb.label} delay={i * 80}>
                <div style={{ border: `1px solid ${eb.color}20`, background: `${eb.color}06`, padding: '36px 36px' }}>
                  <div style={{ fontFamily: orb, fontSize: 11, fontWeight: 700, letterSpacing: 3, color: eb.color, marginBottom: 6 }}>{eb.label}</div>
                  <div style={{ fontSize: 12, color: C.dim, marginBottom: 28 }}>{eb.sub}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {eb.items.map((item, j) => (
                      <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: `1px solid ${C.border}`, fontSize: 13, color: j === 0 ? 'rgba(255,255,255,0.75)' : C.dim }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: eb.color, flexShrink: 0, opacity: j === 0 ? 1 : 0.5 }} />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Deflationary callout */}
          <Reveal delay={120}>
            <div style={{ marginTop: 20, padding: '24px 36px', border: `1px solid rgba(245,158,11,0.2)`, background: 'rgba(245,158,11,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div style={{ fontFamily: orb, fontSize: 10, letterSpacing: 3, color: C.gold, marginBottom: 6 }}>NET RESULT</div>
                <div style={{ fontFamily: orb, fontSize: 18, fontWeight: 900 }}>Burn {'>'} Earn — Supply contracts. Value rises.</div>
              </div>
              <div style={{ fontFamily: orb, fontSize: 30, fontWeight: 900, color: C.gold }}>$ARX</div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════ ROADMAP ═════════════════════════ */}
      <section id="roadmap" style={{ padding: '120px 48px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <Reveal>
            <div style={{ marginBottom: 72 }}>
              <div style={{ fontSize: 10, letterSpacing: 4, color: C.gold, fontFamily: orb, fontWeight: 700, marginBottom: 14 }}>ROADMAP</div>
              <h2 style={{ fontFamily: orb, fontSize: 'clamp(28px,4vw,52px)', fontWeight: 900 }}>Building the future,<br />phase by phase.</h2>
            </div>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 2, border: `1px solid ${C.border}` }}>
            {ROADMAP.map((r, i) => (
              <Reveal key={r.n} delay={i * 70}>
                <div style={{ padding: '40px 32px', borderRight: `1px solid ${C.border}`, background: r.status === 'COMPLETE' ? 'rgba(34,197,94,0.03)' : r.status === 'IN PROGRESS' ? 'rgba(245,158,11,0.03)' : C.card, transition: 'background .3s' }}>
                  <div style={{ fontSize: 10, fontFamily: orb, fontWeight: 700, color: C.dim, letterSpacing: 3, marginBottom: 14 }}>PHASE {r.n}</div>
                  <h3 style={{ fontFamily: orb, fontSize: 17, fontWeight: 900, marginBottom: 16 }}>{r.title}</h3>
                  <div style={{ display: 'inline-block', fontSize: 9, fontFamily: orb, fontWeight: 700, letterSpacing: 2.5, color: r.color, border: `1px solid ${r.color}40`, padding: '3px 10px', borderRadius: 2, marginBottom: 24 }}>{r.status}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {r.items.map(it => (
                      <div key={it} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5, color: r.status === 'COMPLETE' ? 'rgba(255,255,255,0.65)' : C.dim }}>
                        <span style={{ width: 4, height: 4, borderRadius: '50%', background: r.color, flexShrink: 0 }} />
                        {it}
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════ CTA BAND ════════════════════════ */}
      <section style={{ padding: '100px 48px', textAlign: 'center', background: 'radial-gradient(ellipse at center, rgba(245,158,11,0.06) 0%, transparent 70%)' }}>
        <Reveal>
          <div style={{ fontSize: 10, letterSpacing: 4, color: C.gold, fontFamily: orb, fontWeight: 700, marginBottom: 24 }}>GET STARTED</div>
          <h2 style={{ fontFamily: orb, fontSize: 'clamp(32px,6vw,72px)', fontWeight: 900, lineHeight: 1.05, marginBottom: 20 }}>
            Your empire<br />
            <span style={{ background: 'linear-gradient(135deg,#f59e0b,#ef4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>awaits.</span>
          </h2>
          <p style={{ color: C.dim, fontSize: 16, maxWidth: 440, margin: '0 auto 48px', lineHeight: 1.8 }}>
            Season 1 is open. Early players earn bonus $ARX and priority access to all upcoming features.
          </p>
          <Link href="/game" style={{ padding: '18px 60px', borderRadius: 3, background: 'linear-gradient(135deg,#f59e0b,#ef4444)', color: '#000', fontWeight: 900, fontSize: 14, textDecoration: 'none', fontFamily: orb, letterSpacing: 2, boxShadow: '0 0 48px rgba(245,158,11,0.3)', display: 'inline-block' }}>
            ENTER ARENA
          </Link>
        </Reveal>
      </section>

      {/* ═══════════════════════════ FOOTER ══════════════════════════ */}
      <footer style={{ borderTop: `1px solid ${C.border}`, background: 'rgba(0,0,0,0.4)' }}>
        {/* Top footer */}
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '64px 48px 40px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48 }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 18 }}>
              <div style={{ width: 32, height: 32, borderRadius: 7, background: 'linear-gradient(135deg,#f59e0b,#ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: orb, fontWeight: 900, fontSize: 14, color: '#000' }}>A</div>
              <span style={{ fontFamily: orb, fontSize: 15, fontWeight: 900, letterSpacing: 2 }}>AIL<span style={{ color: C.gold }}>URIX</span></span>
            </div>
            <p style={{ fontSize: 13, color: C.dim, lineHeight: 1.8, maxWidth: 280 }}>
              Building the future of blockchain gaming. One studio. One token. Multiple worlds.
            </p>
            <div style={{ marginTop: 24, fontSize: 11, color: 'rgba(255,255,255,0.2)', fontFamily: orb, letterSpacing: 1 }}>ailurix.com</div>
          </div>
          {/* Links */}
          {[
            { heading: 'GAMES', links: ['Ailurix Arena', 'Ailurix Farm', 'Coming Soon'] },
            { heading: 'COMPANY', links: ['About Studio', 'Roadmap', 'Press Kit'] },
            { heading: 'COMMUNITY', links: ['Twitter / X', 'Discord', 'GitHub'] },
          ].map(col => (
            <div key={col.heading}>
              <div style={{ fontSize: 9.5, fontFamily: orb, fontWeight: 700, letterSpacing: 3, color: C.gold, marginBottom: 20 }}>{col.heading}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {col.links.map(l => (
                  <a key={l} href="#" style={{ fontSize: 13, color: C.dim, textDecoration: 'none', transition: 'color .2s' }}
                    onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = C.dim}>{l}</a>
                ))}
              </div>
            </div>
          ))}
        </div>
        {/* Bottom bar */}
        <div style={{ borderTop: `1px solid ${C.border}`, padding: '20px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.18)' }}>© 2026 Ailurix Studios LLC — All rights reserved</span>
          <div style={{ display: 'flex', gap: 24 }}>
            {['Privacy Policy', 'Terms of Service'].map(l => (
              <a key={l} href="#" style={{ fontSize: 12, color: 'rgba(255,255,255,0.18)', textDecoration: 'none', transition: 'color .2s' }}
                onMouseEnter={e => e.target.style.color = C.dim} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.18)'}>{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
