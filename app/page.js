'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import ArenaCanvas from './ArenaCanvas';
import Header from './components/Header';
import Footer from './components/Footer';

/* ─── Scroll Reveal ───────────────────────────────── */
function useReveal(t = 0.12) {
  const ref = useRef(null); const [v, setV] = useState(false);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); o.disconnect(); } }, { threshold: t });
    if (ref.current) o.observe(ref.current); return () => o.disconnect();
  }, []);
  return [ref, v];
}
function Reveal({ children, delay = 0, y = 34 }) {
  const [ref, v] = useReveal();
  return <div ref={ref} style={{ opacity: v ? 1 : 0, transform: v ? 'none' : `translateY(${y}px)`, transition: `opacity .7s ease ${delay}ms, transform .7s ease ${delay}ms` }}>{children}</div>;
}

/* ─── Data ────────────────────────────────────────── */

const GAMES = [
  { id: '01', name: 'AILURIX ARENA', status: 'LIVE NOW', statusColor: '#22c55e', desc: 'A pixel-art fighting game with 16 alien fighters. Battle through a 15-stage tower, master your fighter, and defeat the final boss to earn $ARX.', highlights: ['16 Fighter Roster', '15-Stage Tower Mode', 'Adaptive CPU AI', 'Live Leaderboard'], cta: '/game', ctaLabel: 'PLAY NOW', accent: '#ef4444', comingSoon: false },
  { id: '02', name: 'MORE GAMES', status: 'COMING SOON', statusColor: '#f59e0b', desc: 'Ailurix Studios is actively developing new blockchain games. All upcoming titles will share the $ARX token economy — more details coming in Phase 3.', highlights: ['Shared $ARX Token', 'Cross-game Rewards', 'New Game Mechanics', 'To Be Announced'], cta: '#roadmap', ctaLabel: 'SEE ROADMAP', accent: '#f59e0b', comingSoon: true },
];
const TOKEN_STATS = [{ label: 'Token Name', v: '$ARX' }, { label: 'Network', v: 'Base Chain' }, { label: 'Total Supply', v: '1,000,000,000' }, { label: 'Model', v: 'Deflationary' }];
const EARN = ['Win a fight round: +2 $ARX', 'Complete a full stage: +10 $ARX', 'Defeat the final boss: +25 $ARX', 'Daily login streak: +1 $ARX', 'Flawless victory bonus: +5 $ARX', 'Refer a new player: +15 $ARX'];
const BURN = ['Unlock character skin: 50 $ARX', 'Tournament entry fee: 10 $ARX', 'In-game revival: 20 $ARX', 'Power-up purchase: 8 $ARX', 'NFT character mint: 200 $ARX', 'Equipment upgrade: 30 $ARX'];
const ROADMAP = [
  { n: '01', title: 'Arena Launch', status: 'COMPLETE', color: '#22c55e', items: ['16 alien fighters', '15-stage tower', 'Adaptive CPU AI', 'Studio rebrand'] },
  { n: '02', title: 'Token + Earn', status: 'IN PROGRESS', color: '#f59e0b', items: ['$ARX on Base chain', 'Wallet integration', 'Win-to-earn system', 'Tournament mode'] },
  { n: '03', title: 'Ailurix Farm', status: 'UPCOMING', color: 'rgba(255,255,255,0.2)', items: ['Farm game launch', 'Shared $ARX token', 'Land NFT drops', 'DeFi pools'] },
  { n: '04', title: 'Ecosystem', status: 'UPCOMING', color: 'rgba(255,255,255,0.2)', items: ['DEX listing', 'CoinGecko / CMC', 'New game titles', 'DAO governance'] },
];
const PRESS = ['TechCrunch', 'CoinDesk', 'The Block', 'Decrypt', 'GamesBeat', 'Cointelegraph'];

const orb = "'Orbitron','Rajdhani',sans-serif";
const C = { gold: '#f59e0b', red: '#ef4444', border: 'rgba(255,255,255,0.07)', dim: 'rgba(255,255,255,0.42)', card: 'rgba(255,255,255,0.025)' };

/* ─── Page ────────────────────────────────────────── */
export default function Home() {
  const [progress, setProgress] = useState(0);
  const [cursor, setCursor] = useState({ x: -100, y: -100 });
  const [cursorBig, setCursorBig] = useState({ x: -100, y: -100 });
  const [hovered, setHovered] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const bigRef = useRef({ x: -100, y: -100 });

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? (window.scrollY / h) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const onMouseMove = (e) => {
      setCursor({ x: e.clientX, y: e.clientY });
      bigRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', onMouseMove);

    const animBig = () => {
      setCursorBig(prev => ({ x: prev.x + (bigRef.current.x - prev.x) * 0.12, y: prev.y + (bigRef.current.y - prev.y) * 0.12 }));
      requestAnimationFrame(animBig);
    };
    const raf = requestAnimationFrame(animBig);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('mousemove', onMouseMove); cancelAnimationFrame(raf); };
  }, []);

  const onSubmit = (e) => { e.preventDefault(); if (email.trim()) setSubmitted(true); };

  return (
    <div style={{ background: '#020207', color: '#fff', minHeight: '100vh', fontFamily: "'Inter',sans-serif", cursor: 'none' }}>
      {/* Custom cursor */}
      <div style={{ position: 'fixed', left: cursor.x - 5, top: cursor.y - 5, width: 10, height: 10, borderRadius: '50%', background: C.gold, pointerEvents: 'none', zIndex: 9999, transition: 'transform .15s', transform: hovered ? 'scale(2.5)' : 'scale(1)', mixBlendMode: 'difference' }} />
      <div style={{ position: 'fixed', left: cursorBig.x - 20, top: cursorBig.y - 20, width: 40, height: 40, borderRadius: '50%', border: `1px solid ${C.gold}`, pointerEvents: 'none', zIndex: 9998, opacity: 0.5, transition: 'transform .3s', transform: hovered ? 'scale(1.8)' : 'scale(1)' }} />

      {/* Scroll progress bar */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: `${progress}%`, height: 2, background: 'linear-gradient(90deg,#f59e0b,#ef4444)', zIndex: 9997, transition: 'width .1s linear' }} />

      {/* ═══ HEADER ═══════════════════════════════════════════════ */}
      <Header onHover={setHovered} />

      {/* ═══ HERO ═════════════════════════════════════════════════ */}
      <section style={{ position: 'relative', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <ArenaCanvas />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,rgba(2,2,7,.45) 0%,rgba(2,2,7,.15) 40%,rgba(2,2,7,.75) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 24px', maxWidth: 860 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.28)', borderRadius: 2, padding: '6px 18px', fontSize: 10, fontWeight: 700, color: '#ef4444', marginBottom: 30, letterSpacing: 3, fontFamily: orb }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', display: 'inline-block', animation: 'blink 1s ease-in-out infinite' }} />
            SEASON 1 — LIVE NOW
            <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:.2}} @keyframes gp{0%,100%{box-shadow:0 0 32px rgba(245,158,11,.3)}50%{box-shadow:0 0 64px rgba(245,158,11,.6)}}`}</style>
          </div>
          <h1 style={{ fontFamily: orb, fontSize: 'clamp(46px,9.5vw,112px)', fontWeight: 900, lineHeight: .95, letterSpacing: 2, marginBottom: 18, textShadow: '0 0 80px rgba(245,158,11,.25)' }}>
            <span style={{ background: 'linear-gradient(135deg,#f59e0b,#fbbf24,#ef4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AILURIX</span><br />
            <span style={{ color: '#fff' }}>STUDIOS</span>
          </h1>
          <p style={{ fontFamily: orb, fontSize: 'clamp(10px,2vw,13px)', color: 'rgba(255,255,255,.25)', letterSpacing: 9, marginBottom: 32 }}>PLAY · EARN · OWN</p>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,.58)', lineHeight: 1.85, marginBottom: 44, maxWidth: 520, margin: '0 auto 44px' }}>
            The first blockchain fighting game by Ailurix Studios. Fight your way to the top and earn <strong style={{ color: C.gold, fontWeight: 600 }}>$ARX tokens</strong> — more games coming soon.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/game" style={{ padding: '16px 46px', borderRadius: 3, background: 'linear-gradient(135deg,#f59e0b,#ef4444)', color: '#000', fontWeight: 900, fontSize: 13, textDecoration: 'none', fontFamily: orb, letterSpacing: 2, animation: 'gp 3s ease-in-out infinite' }}
              onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>ENTER ARENA</Link>
            <a href="#token" style={{ padding: '16px 46px', borderRadius: 3, border: '1px solid rgba(255,255,255,.14)', background: 'rgba(255,255,255,.05)', backdropFilter: 'blur(12px)', color: 'rgba(255,255,255,.72)', fontWeight: 700, fontSize: 13, textDecoration: 'none', fontFamily: orb, letterSpacing: 1.5 }}>$ARX TOKEN</a>
          </div>
        </div>
        {/* Scroll cue */}
        <div style={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, zIndex: 10 }}>
          <span style={{ fontSize: 9, color: C.dim, letterSpacing: 3, fontFamily: orb }}>SCROLL</span>
          <div style={{ width: 1, height: 38, background: 'linear-gradient(to bottom,rgba(245,158,11,.6),transparent)', animation: 'sp 2s ease-in-out infinite' }} />
          <style>{`@keyframes sp{0%,100%{opacity:.35;transform:scaleY(1)}50%{opacity:1;transform:scaleY(1.2}}}`}</style>
        </div>
      </section>



      {/* ═══ GAMES ════════════════════════════════════════════════ */}
      <section id="games" style={{ padding: '120px 48px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <Reveal><div style={{ marginBottom: 72 }}><div style={{ fontSize: 10, letterSpacing: 4, color: C.gold, fontFamily: orb, fontWeight: 700, marginBottom: 14 }}>PLATFORM</div><h2 style={{ fontFamily: orb, fontSize: 'clamp(26px,4vw,50px)', fontWeight: 900, lineHeight: 1.1 }}>Our Games</h2></div></Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(440px,1fr))', gap: 2, border: `1px solid ${C.border}` }}>
            {GAMES.map((g, i) => (
              <Reveal key={g.id} delay={i * 90}>
                <div style={{ padding: '48px 44px', background: C.card, position: 'relative', overflow: 'hidden', transition: 'background .3s', borderRight: i === 0 ? `1px solid ${C.border}` : 'none' }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${g.accent}08`; setHovered(true); }}
                  onMouseLeave={e => { e.currentTarget.style.background = C.card; setHovered(false); }}>
                  <div style={{ position: 'absolute', top: 0, right: 0, width: 220, height: 220, background: `radial-gradient(circle at top right,${g.accent}10,transparent 70%)`, pointerEvents: 'none' }} />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
                    <span style={{ fontSize: 10, fontFamily: orb, fontWeight: 700, letterSpacing: 3, color: C.dim }}>{g.id}</span>
                    <span style={{ fontSize: 9.5, fontFamily: orb, fontWeight: 700, letterSpacing: 2.5, color: g.statusColor, background: `${g.statusColor}14`, border: `1px solid ${g.statusColor}28`, padding: '4px 12px', borderRadius: 2 }}>{g.status}</span>
                  </div>
                  <h3 style={{ fontFamily: orb, fontSize: 'clamp(18px,2.2vw,26px)', fontWeight: 900, marginBottom: 18 }}>{g.name}</h3>
                  <p style={{ fontSize: 14, color: C.dim, lineHeight: 1.85, marginBottom: 30 }}>{g.desc}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 36 }}>
                    {g.highlights.map(h => (
                      <div key={h} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: 'rgba(255,255,255,.55)' }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: g.accent, flexShrink: 0 }} />
                        {h}
                      </div>
                    ))}
                  </div>
                  <Link href={g.cta} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 11.5, fontFamily: orb, fontWeight: 700, letterSpacing: 1.5, color: g.accent, textDecoration: 'none', borderBottom: `1px solid ${g.accent}35`, paddingBottom: 3, transition: 'gap .2s, border-color .2s' }}
                    onMouseEnter={e => { e.currentTarget.style.gap = '16px'; e.currentTarget.style.borderColor = g.accent; }}
                    onMouseLeave={e => { e.currentTarget.style.gap = '10px'; e.currentTarget.style.borderColor = `${g.accent}35`; }}>
                    {g.ctaLabel} &#x2192;
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>


      {/* ═══ TOKEN ════════════════════════════════════════════════ */}
      <section id="token" style={{ padding: '120px 48px', borderBottom: `1px solid ${C.border}`, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 65% 50%,rgba(139,92,246,.05),transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1180, margin: '0 auto', position: 'relative' }}>
          <Reveal><div style={{ marginBottom: 72 }}><div style={{ fontSize: 10, letterSpacing: 4, color: C.gold, fontFamily: orb, fontWeight: 700, marginBottom: 14 }}>ECONOMICS</div><h2 style={{ fontFamily: orb, fontSize: 'clamp(26px,4vw,50px)', fontWeight: 900 }}>The $ARX Token</h2><p style={{ fontSize: 15, color: C.dim, marginTop: 12, maxWidth: 460, lineHeight: 1.8 }}>One token powers every Ailurix game. Deflationary by design — burn exceeds earn.</p></div></Reveal>
          <Reveal delay={60}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, border: `1px solid ${C.border}`, marginBottom: 32 }}>
              {TOKEN_STATS.map((s, i) => (
                <div key={s.label} style={{ padding: '28px 30px', borderRight: i < 3 ? `1px solid ${C.border}` : 'none', background: C.card }}>
                  <div style={{ fontSize: 10, color: C.dim, fontFamily: orb, letterSpacing: 3, marginBottom: 10 }}>{s.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 900, fontFamily: orb }}>{s.v}</div>
                </div>
              ))}
            </div>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            {[{ label: 'EARN $ARX', color: '#22c55e', items: EARN, sub: 'Actions that generate new tokens' }, { label: 'BURN $ARX', color: '#ef4444', items: BURN, sub: 'Actions that permanently remove tokens' }].map((eb, i) => (
              <Reveal key={eb.label} delay={i * 80}>
                <div style={{ border: `1px solid ${eb.color}1a`, background: `${eb.color}05`, padding: '36px' }}>
                  <div style={{ fontFamily: orb, fontSize: 11, fontWeight: 700, letterSpacing: 3, color: eb.color, marginBottom: 6 }}>{eb.label}</div>
                  <div style={{ fontSize: 12, color: C.dim, marginBottom: 26 }}>{eb.sub}</div>
                  {eb.items.map((item, j) => (
                    <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '11px 0', borderBottom: `1px solid ${C.border}`, fontSize: 13, color: j < 2 ? 'rgba(255,255,255,.7)' : C.dim }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: eb.color, flexShrink: 0, opacity: j < 2 ? 1 : 0.4 }} />{item}
                    </div>
                  ))}
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={100}>
            <div style={{ padding: '24px 36px', border: '1px solid rgba(245,158,11,.18)', background: 'rgba(245,158,11,.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <div><div style={{ fontFamily: orb, fontSize: 10, letterSpacing: 3, color: C.gold, marginBottom: 6 }}>NET RESULT</div><div style={{ fontFamily: orb, fontSize: 17, fontWeight: 900 }}>Burn {'>'} Earn — Supply contracts. Value rises.</div></div>
              <div style={{ fontFamily: orb, fontSize: 32, fontWeight: 900, color: C.gold }}>$ARX</div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ ROADMAP ══════════════════════════════════════════════ */}
      <section id="roadmap" style={{ padding: '120px 48px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <Reveal><div style={{ marginBottom: 72 }}><div style={{ fontSize: 10, letterSpacing: 4, color: C.gold, fontFamily: orb, fontWeight: 700, marginBottom: 14 }}>ROADMAP</div><h2 style={{ fontFamily: orb, fontSize: 'clamp(26px,4vw,50px)', fontWeight: 900 }}>Building the future,<br />phase by phase.</h2></div></Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, border: `1px solid ${C.border}` }}>
            {ROADMAP.map((r, i) => (
              <Reveal key={r.n} delay={i * 70}>
                <div style={{ padding: '40px 32px', borderRight: i < 3 ? `1px solid ${C.border}` : 'none', background: r.status === 'COMPLETE' ? 'rgba(34,197,94,.03)' : r.status === 'IN PROGRESS' ? 'rgba(245,158,11,.03)' : C.card }}>
                  <div style={{ fontSize: 10, fontFamily: orb, fontWeight: 700, color: C.dim, letterSpacing: 3, marginBottom: 14 }}>PHASE {r.n}</div>
                  <h3 style={{ fontFamily: orb, fontSize: 16, fontWeight: 900, marginBottom: 14 }}>{r.title}</h3>
                  <div style={{ display: 'inline-block', fontSize: 9, fontFamily: orb, fontWeight: 700, letterSpacing: 2.5, color: r.color, border: `1px solid ${r.color}35`, padding: '3px 10px', borderRadius: 2, marginBottom: 22 }}>{r.status}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {r.items.map(it => (
                      <div key={it} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5, color: r.status === 'COMPLETE' ? 'rgba(255,255,255,.6)' : C.dim }}>
                        <span style={{ width: 4, height: 4, borderRadius: '50%', background: r.color, flexShrink: 0 }} />{it}
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ WAITLIST ═════════════════════════════════════════════ */}
      <section style={{ padding: '100px 48px', borderBottom: `1px solid ${C.border}`, background: 'rgba(139,92,246,.03)' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <Reveal>
            <div style={{ fontSize: 10, letterSpacing: 4, color: '#8b5cf6', fontFamily: orb, fontWeight: 700, marginBottom: 18 }}>$ARX TOKEN LAUNCH</div>
            <h2 style={{ fontFamily: orb, fontSize: 'clamp(24px,4vw,44px)', fontWeight: 900, marginBottom: 18 }}>Join the Waitlist</h2>
            <p style={{ fontSize: 15, color: C.dim, lineHeight: 1.8, marginBottom: 40 }}>Be the first to earn $ARX when the token launches on Base chain. Early supporters receive bonus allocation.</p>
            {submitted ? (
              <div style={{ padding: '20px 32px', border: '1px solid rgba(34,197,94,.3)', background: 'rgba(34,197,94,.06)', borderRadius: 3 }}>
                <div style={{ fontFamily: orb, fontSize: 13, fontWeight: 700, color: '#22c55e', letterSpacing: 1.5 }}>You are on the list.</div>
                <div style={{ fontSize: 13, color: C.dim, marginTop: 6 }}>We will reach you when $ARX launches.</div>
              </div>
            ) : (
              <form onSubmit={onSubmit} style={{ display: 'flex', gap: 0, border: `1px solid ${C.border}`, borderRadius: 3, overflow: 'hidden' }}>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email address" required
                  style={{ flex: 1, padding: '16px 22px', background: 'rgba(255,255,255,.04)', border: 'none', outline: 'none', color: '#fff', fontSize: 14, fontFamily: "'Inter',sans-serif" }} />
                <button type="submit" style={{ padding: '16px 32px', background: 'linear-gradient(135deg,#f59e0b,#ef4444)', border: 'none', color: '#000', fontWeight: 900, fontSize: 12, fontFamily: orb, letterSpacing: 1.5, whiteSpace: 'nowrap', cursor: 'none' }}>JOIN WAITLIST</button>
              </form>
            )}
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.2)', marginTop: 16 }}>No spam. Unsubscribe anytime. Token launch ETA: Q3 2026.</div>
          </Reveal>
        </div>
      </section>

      {/* ═══ PRESS ════════════════════════════════════════════════ */}
      <section style={{ padding: '56px 48px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 9.5, color: C.dim, letterSpacing: 3, fontFamily: orb, fontWeight: 700, marginBottom: 28 }}>AS FEATURED IN</div>
          <div style={{ display: 'flex', gap: 48, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
            {PRESS.map(p => (
              <span key={p} style={{ fontFamily: orb, fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.18)', letterSpacing: 1.5 }}>{p}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ══════════════════════════════════════════════════ */}
      <section style={{ padding: '100px 48px', textAlign: 'center', background: 'radial-gradient(ellipse at center,rgba(245,158,11,.05) 0%,transparent 70%)' }}>
        <Reveal>
          <div style={{ fontSize: 10, letterSpacing: 4, color: C.gold, fontFamily: orb, fontWeight: 700, marginBottom: 24 }}>GET STARTED</div>
          <h2 style={{ fontFamily: orb, fontSize: 'clamp(30px,6vw,70px)', fontWeight: 900, lineHeight: 1.05, marginBottom: 20 }}>Your empire<br /><span style={{ background: 'linear-gradient(135deg,#f59e0b,#ef4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>awaits.</span></h2>
          <p style={{ color: C.dim, fontSize: 15, maxWidth: 420, margin: '0 auto 48px', lineHeight: 1.85 }}>Season 1 is open. Early players earn bonus $ARX and priority access to all upcoming features.</p>
          <Link href="/game" style={{ padding: '18px 60px', borderRadius: 3, background: 'linear-gradient(135deg,#f59e0b,#ef4444)', color: '#000', fontWeight: 900, fontSize: 14, textDecoration: 'none', fontFamily: orb, letterSpacing: 2, boxShadow: '0 0 48px rgba(245,158,11,.28)', display: 'inline-block' }}
            onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>ENTER ARENA</Link>
        </Reveal>
      </section>

      {/* ═══ FOOTER ═══════════════════════════════════════════════ */}
      <Footer onHover={setHovered} />
    </div>
  );
}
