'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

/* ── Scroll Reveal Hook ─────────────────────────── */
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

/* ── Reveal Wrapper ─────────────────────────────── */
function Reveal({ children, delay = 0, direction = 'up' }) {
  const [ref, visible] = useReveal();
  const translateMap = { up: 'translateY(40px)', left: 'translateX(-40px)', right: 'translateX(40px)' };
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translate(0,0)' : translateMap[direction],
      transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

/* ── Data ────────────────────────────────────────── */
const STATS = [
  { label: 'Active Players', value: '1M+' },
  { label: 'User Rating', value: '4.8 / 5' },
  { label: 'Fighter Roster', value: '16' },
  { label: 'Token Supply', value: '1B $ARX' },
];

const FEATURES = [
  { num: '01', title: 'Ailurix Arena', desc: 'Pixel-art 1v1 fighting game with 16 fighter characters. Battle through 15 stages, defeat the final boss and claim your rewards.' },
  { num: '02', title: 'Ailurix Farm', desc: 'Blockchain farming game in development. Plant, harvest, trade resources and accumulate $ARX while building your agricultural empire.' },
  { num: '03', title: 'Adaptive AI', desc: 'The CPU opponent learns your move patterns each round. Punch-heavy? It adapts and counters. Every match demands a new strategy.' },
  { num: '04', title: 'Earn $ARX', desc: 'Every win, stage clear, and boss defeat generates $ARX. Tokens are credited to your wallet and redeemable across all studio games.' },
  { num: '05', title: 'Burn Mechanics', desc: 'Spend $ARX on character skins, tournament entries, and power upgrades. Burn rate exceeds earn rate — supply contracts, value rises.' },
  { num: '06', title: 'Tournament Mode', desc: 'Weekly competitive brackets with $ARX entry fees. 70% of the pool distributes to top finishers. 30% burned from supply permanently.' },
];

const TOKEN_ITEMS = [
  { label: 'Network', value: 'Base Chain', sub: 'Sub-cent gas fees · Coinbase backed · EVM compatible' },
  { label: 'Model', value: 'Deflationary', sub: 'Burn rate exceeds earn rate — net supply contracts over time' },
  { label: 'Utility', value: 'Multi-Game', sub: 'Single token works across every Ailurix Studios title' },
  { label: 'Earning', value: 'Play to Earn', sub: 'Win fights, complete stages, refer players — all generate $ARX' },
];

const EARN_BURN = [
  { type: 'EARN', color: '#22c55e', items: ['Win a fight round: +2 $ARX', 'Complete a stage: +10 $ARX', 'Beat final boss: +25 $ARX', 'Daily login bonus: +1 $ARX', 'Flawless victory: +5 $ARX bonus'] },
  { type: 'BURN', color: '#ef4444', items: ['Premium character skin: 50 $ARX', 'Tournament entry fee: 10 $ARX', 'Fight revival (extra life): 20 $ARX', 'Power-up for one match: 8 $ARX', 'NFT character mint: 200 $ARX'] },
];

const ROADMAP = [
  { phase: 'Phase 01', title: 'Arena Launch', status: 'done', items: ['16 fighter characters', '15-stage tower mode', 'Adaptive AI system', 'Ailurix Studios branding'] },
  { phase: 'Phase 02', title: 'Token + Earn', status: 'active', items: ['$ARX token deploy on Base', 'Wallet connect integration', 'Win-to-earn reward system', 'Weekly tournament mode'] },
  { phase: 'Phase 03', title: 'Ailurix Farm', status: 'soon', items: ['Farming game launch', 'Shared $ARX token economy', 'Land and resource NFTs', 'DeFi liquidity integration'] },
  { phase: 'Phase 04', title: 'Ecosystem', status: 'soon', items: ['DEX listing (Uniswap / Base)', 'CoinGecko + CMC listing', 'Additional game titles', 'DAO governance launch'] },
];

/* ── Styles ─────────────────────────────────────── */
const C = {
  gold: '#f59e0b', red: '#ef4444', purple: '#8b5cf6', green: '#22c55e',
  dim: 'rgba(255,255,255,0.45)', border: 'rgba(255,255,255,0.08)',
  card: 'rgba(255,255,255,0.03)',
};
const orbitron = "'Orbitron', 'Rajdhani', sans-serif";
const sans = "'Inter', 'Rajdhani', sans-serif";

/* ── Page ────────────────────────────────────────── */
export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{ minHeight: '100vh', fontFamily: sans, background: '#030308', color: '#fff' }}>

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 40px',
        background: scrollY > 40 ? 'rgba(3,3,8,0.97)' : 'rgba(3,3,8,0.7)',
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${scrollY > 40 ? C.border : 'transparent'}`,
        transition: 'background .3s, border-color .3s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: 'linear-gradient(135deg,#f59e0b,#ef4444)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15, fontWeight: 900, color: '#000', fontFamily: orbitron,
          }}>A</div>
          <span style={{ fontFamily: orbitron, fontSize: 17, fontWeight: 900, letterSpacing: 2 }}>
            AIL<span style={{ color: C.gold }}>URIX</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
          {['Games', 'Token', 'Roadmap'].map(l => (
            <a key={l} href={'#' + l.toLowerCase()} style={{ color: C.dim, textDecoration: 'none', fontSize: 13, fontWeight: 600, letterSpacing: 0.5, transition: 'color .2s' }}
              onMouseEnter={e => e.target.style.color = '#fff'}
              onMouseLeave={e => e.target.style.color = C.dim}>{l}</a>
          ))}
          <Link href="/game" style={{
            padding: '9px 24px', borderRadius: 4,
            background: 'linear-gradient(135deg,#f59e0b,#ef4444)',
            color: '#000', fontWeight: 900, fontSize: 12, textDecoration: 'none',
            fontFamily: orbitron, letterSpacing: 1.5, textTransform: 'uppercase',
          }}>Play Now</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        padding: '120px 24px 80px', position: 'relative', overflow: 'hidden',
      }}>
        {/* Parallax orbs */}
        <div style={{
          position: 'absolute', width: 900, height: 900, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245,158,11,.07) 0%, transparent 70%)',
          top: -300, left: -300, pointerEvents: 'none',
          transform: `translateY(${scrollY * 0.15}px)`,
          transition: 'transform 0.1s linear',
        }} />
        <div style={{
          position: 'absolute', width: 700, height: 700, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,.06) 0%, transparent 70%)',
          bottom: -200, right: -200, pointerEvents: 'none',
          transform: `translateY(${-scrollY * 0.1}px)`,
          transition: 'transform 0.1s linear',
        }} />
        {/* Subtle grid */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: `linear-gradient(${C.border} 1px,transparent 1px),linear-gradient(90deg,${C.border} 1px,transparent 1px)`,
          backgroundSize: '80px 80px',
          opacity: 0.4,
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <Reveal>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(239,68,68,.08)', border: `1px solid rgba(239,68,68,.25)`,
              borderRadius: 2, padding: '6px 20px', fontSize: 11, fontWeight: 700,
              color: C.red, marginBottom: 32, letterSpacing: 3, fontFamily: orbitron,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.red, animation: 'pulse 1s infinite', display: 'inline-block' }} />
              SEASON 1 — LIVE
            </div>
          </Reveal>

          <Reveal delay={100}>
            <h1 style={{
              fontFamily: orbitron, fontSize: 'clamp(44px,9vw,100px)',
              fontWeight: 900, lineHeight: 1, letterSpacing: 3, marginBottom: 14,
            }}>
              <span style={{ background: 'linear-gradient(135deg,#f59e0b,#fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AILURIX</span>
              <br />STUDIOS
            </h1>
          </Reveal>

          <Reveal delay={180}>
            <div style={{ fontFamily: orbitron, fontSize: 'clamp(11px,2vw,15px)', color: 'rgba(255,255,255,0.25)', letterSpacing: 10, marginBottom: 32 }}>
              PLAY · EARN · OWN
            </div>
          </Reveal>

          <Reveal delay={240}>
            <p style={{ fontSize: 17, color: C.dim, maxWidth: 480, margin: '0 auto 44px', lineHeight: 1.8 }}>
              The future of blockchain gaming. Play games, earn{' '}
              <strong style={{ color: C.gold, fontWeight: 700 }}>$ARX tokens</strong>, and build your on-chain empire.
            </p>
          </Reveal>

          <Reveal delay={300}>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/game" style={{
                padding: '15px 42px', borderRadius: 3,
                background: 'linear-gradient(135deg,#f59e0b,#ef4444)', border: 'none',
                color: '#000', fontWeight: 900, fontSize: 14, textDecoration: 'none',
                fontFamily: orbitron, letterSpacing: 2,
                boxShadow: '0 0 32px rgba(245,158,11,0.25)',
              }}>PLAY ARENA</Link>
              <a href="#token" style={{
                padding: '15px 42px', borderRadius: 3,
                border: `1px solid ${C.border}`, background: 'rgba(255,255,255,0.03)',
                color: 'rgba(255,255,255,0.65)', fontWeight: 700, fontSize: 14, textDecoration: 'none',
                fontFamily: orbitron, letterSpacing: 1,
              }}>$ARX TOKEN</a>
            </div>
          </Reveal>

          <Reveal delay={400}>
            <div style={{ display: 'flex', gap: 0, marginTop: 72, justifyContent: 'center', flexWrap: 'wrap', borderTop: `1px solid ${C.border}`, paddingTop: 40 }}>
              {STATS.map((s, i) => (
                <div key={s.label} style={{
                  textAlign: 'center', padding: '0 40px',
                  borderRight: i < STATS.length - 1 ? `1px solid ${C.border}` : 'none',
                }}>
                  <div style={{ fontSize: 26, fontWeight: 900, color: C.gold, fontFamily: orbitron }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: C.dim, fontWeight: 600, letterSpacing: 2, marginTop: 6, textTransform: 'uppercase' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── GAMES / FEATURES ── */}
      <section id="games" style={{ padding: '120px 24px', borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Reveal>
            <div style={{ marginBottom: 64 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 4, color: C.gold, fontFamily: orbitron, marginBottom: 14 }}>PLATFORM</div>
              <h2 style={{ fontFamily: orbitron, fontSize: 'clamp(26px,4vw,44px)', fontWeight: 900, maxWidth: 500 }}>What we are building</h2>
            </div>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 1, border: `1px solid ${C.border}` }}>
            {FEATURES.map((f, i) => (
              <Reveal key={f.num} delay={i * 60}>
                <div style={{
                  padding: '36px 32px', borderRight: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`,
                  background: C.card, transition: 'background .3s',
                  cursor: 'default',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,158,11,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = C.card}
                >
                  <div style={{ fontSize: 11, color: C.gold, fontFamily: orbitron, fontWeight: 700, letterSpacing: 2, marginBottom: 14 }}>{f.num}</div>
                  <h3 style={{ fontSize: 17, fontWeight: 900, fontFamily: orbitron, marginBottom: 12 }}>{f.title}</h3>
                  <p style={{ fontSize: 13, color: C.dim, lineHeight: 1.8 }}>{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── TOKEN ── */}
      <section id="token" style={{ padding: '120px 24px', borderTop: `1px solid ${C.border}`, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 60% 50%, rgba(139,92,246,.05), transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
          <Reveal>
            <div style={{ marginBottom: 64 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 4, color: C.gold, fontFamily: orbitron, marginBottom: 14 }}>BLOCKCHAIN</div>
              <h2 style={{ fontFamily: orbitron, fontSize: 'clamp(26px,4vw,44px)', fontWeight: 900 }}>The $ARX Token</h2>
              <p style={{ fontSize: 15, color: C.dim, marginTop: 12, maxWidth: 500, lineHeight: 1.7 }}>One token. All games. Real on-chain value. Deflationary by design.</p>
            </div>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 1, border: `1px solid ${C.border}`, marginBottom: 32 }}>
            {TOKEN_ITEMS.map((t, i) => (
              <Reveal key={t.label} delay={i * 80}>
                <div style={{ padding: '32px', borderRight: `1px solid ${C.border}`, background: C.card }}>
                  <div style={{ fontSize: 10, color: C.dim, fontFamily: orbitron, letterSpacing: 3, marginBottom: 10 }}>{t.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 900, fontFamily: orbitron, color: '#fff', marginBottom: 10 }}>{t.value}</div>
                  <div style={{ fontSize: 12, color: C.dim, lineHeight: 1.7 }}>{t.sub}</div>
                </div>
              </Reveal>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))', gap: 24 }}>
            {EARN_BURN.map((eb, i) => (
              <Reveal key={eb.type} delay={i * 120}>
                <div style={{
                  border: `1px solid ${eb.color}22`,
                  background: `${eb.color}06`,
                  borderRadius: 4, padding: '32px',
                }}>
                  <div style={{ fontSize: 11, fontWeight: 900, fontFamily: orbitron, color: eb.color, letterSpacing: 3, marginBottom: 20 }}>{eb.type} $ARX</div>
                  {eb.items.map(item => (
                    <div key={item} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 0', borderBottom: `1px solid ${C.border}`,
                      fontSize: 13, color: C.dim,
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: eb.color, flexShrink: 0 }} />
                      {item}
                    </div>
                  ))}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROADMAP ── */}
      <section id="roadmap" style={{ padding: '120px 24px', borderTop: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <Reveal>
            <div style={{ marginBottom: 64 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 4, color: C.gold, fontFamily: orbitron, marginBottom: 14 }}>ROADMAP</div>
              <h2 style={{ fontFamily: orbitron, fontSize: 'clamp(26px,4vw,44px)', fontWeight: 900 }}>What is coming</h2>
            </div>
          </Reveal>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {ROADMAP.map((r, i) => (
              <Reveal key={r.phase} delay={i * 80}>
                <div style={{
                  display: 'flex', gap: 0,
                  borderBottom: i < ROADMAP.length - 1 ? `1px solid ${C.border}` : 'none',
                  padding: '40px 0',
                }}>
                  {/* Phase indicator */}
                  <div style={{ minWidth: 160, paddingRight: 40 }}>
                    <div style={{ fontSize: 10, color: C.gold, fontFamily: orbitron, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>{r.phase}</div>
                    <div style={{
                      display: 'inline-block', padding: '3px 10px', borderRadius: 2, fontSize: 9.5, fontWeight: 700, letterSpacing: 2, fontFamily: orbitron,
                      background: r.status === 'done' ? 'rgba(34,197,94,.1)' : r.status === 'active' ? 'rgba(245,158,11,.1)' : 'rgba(255,255,255,0.05)',
                      color: r.status === 'done' ? C.green : r.status === 'active' ? C.gold : C.dim,
                      border: `1px solid ${r.status === 'done' ? C.green + '40' : r.status === 'active' ? C.gold + '40' : C.border}`,
                    }}>
                      {r.status === 'done' ? 'COMPLETE' : r.status === 'active' ? 'IN PROGRESS' : 'UPCOMING'}
                    </div>
                  </div>
                  {/* Content */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 22, fontWeight: 900, fontFamily: orbitron, marginBottom: 16 }}>{r.title}</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {r.items.map(item => (
                        <span key={item} style={{
                          fontSize: 12, padding: '5px 14px', borderRadius: 2,
                          background: C.card, border: `1px solid ${C.border}`,
                          color: r.status === 'done' ? C.green : C.dim, fontWeight: 600,
                        }}>{item}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '120px 24px', textAlign: 'center', borderTop: `1px solid ${C.border}`, background: 'radial-gradient(ellipse at center, rgba(245,158,11,.05) 0%, transparent 70%)' }}>
        <Reveal>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 4, color: C.gold, fontFamily: orbitron, marginBottom: 24 }}>GET STARTED</p>
          <h2 style={{ fontFamily: orbitron, fontSize: 'clamp(28px,6vw,64px)', fontWeight: 900, letterSpacing: 1, marginBottom: 20 }}>
            Your empire<br />
            <span style={{ background: 'linear-gradient(135deg,#f59e0b,#ef4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>awaits.</span>
          </h2>
          <p style={{ color: C.dim, fontSize: 16, marginBottom: 48, maxWidth: 440, margin: '0 auto 48px', lineHeight: 1.8 }}>
            Season 1 is open. Early players earn bonus $ARX and priority access to upcoming features.
          </p>
          <Link href="/game" style={{
            padding: '17px 56px', borderRadius: 3,
            background: 'linear-gradient(135deg,#f59e0b,#ef4444)', border: 'none',
            color: '#000', fontWeight: 900, fontSize: 15, textDecoration: 'none',
            fontFamily: orbitron, letterSpacing: 2,
            boxShadow: '0 0 48px rgba(245,158,11,0.25)', display: 'inline-block',
          }}>ENTER ARENA</Link>
        </Reveal>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: '36px 40px', borderTop: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <span style={{ fontFamily: orbitron, fontSize: 17, fontWeight: 900, color: C.gold, letterSpacing: 2 }}>AILURIX</span>
        <span style={{ color: C.dim, fontSize: 12 }}>© 2026 Ailurix Studios LLC — ailurix.com — All rights reserved</span>
        <div style={{ display: 'flex', gap: 24, fontSize: 13 }}>
          {['Twitter', 'Discord', 'GitHub'].map(l => (
            <a key={l} href="#" style={{ color: C.dim, textDecoration: 'none', fontWeight: 500, transition: 'color .2s' }}
              onMouseEnter={e => e.target.style.color = '#fff'}
              onMouseLeave={e => e.target.style.color = C.dim}>{l}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}
