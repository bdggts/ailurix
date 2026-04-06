'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const STATS = [
  { label: 'Players', value: '1M', suffix: '+' },
  { label: 'Rating', value: '4.8', suffix: '★' },
  { label: 'Fighters', value: '16', suffix: '' },
  { label: '$ARX Supply', value: '1B', suffix: '' },
];

const FEATURES = [
  { icon: '⚔️', title: 'Ailurix Arena', desc: 'Pixel-art 1v1 fighting game with 16 alien fighters. Battle through 15 stages, defeat the boss, earn $ARX tokens.' },
  { icon: '🌾', title: 'Ailurix Farm', desc: 'Blockchain farming game coming soon. Plant, harvest, trade and earn $ARX while building your farm empire.' },
  { icon: '🧠', title: 'Adaptive AI', desc: 'Our CPU learns your fighting patterns and counters them. Punch too much? It kicks back. Keep improving to win.' },
  { icon: '🪙', title: 'Earn $ARX', desc: 'Win fights, complete stages, beat the boss — every victory earns you $ARX tokens redeemable across all games.' },
  { icon: '🔥', title: 'Burn Mechanics', desc: 'Spend $ARX on skins, tournaments, and power-ups. Burn rate exceeds earn rate — token is deflationary by design.' },
  { icon: '🏆', title: 'Tournament Mode', desc: 'Enter weekly 1v1 tournaments with $ARX entry fee. 70% of pool goes to winners. 30% burned forever.' },
];

const ROADMAP = [
  { phase: 'Phase 1', title: 'Arena Launch', status: 'done', items: ['16 Fighter Characters', '15-Stage Tower', 'Adaptive AI', 'Studio Branding'] },
  { phase: 'Phase 2', title: 'Token & Earn', status: 'active', items: ['$ARX Token Deploy', 'Wallet Connect', 'Win-to-Earn', 'Tournament Mode'] },
  { phase: 'Phase 3', title: 'Ailurix Farm', status: 'soon', items: ['Farming Game', 'Same $ARX Token', 'Land NFTs', 'DeFi Integration'] },
  { phase: 'Phase 4', title: 'Ecosystem', status: 'soon', items: ['DEX Listing', 'CoinGecko', 'More Games', 'DAO Governance'] },
];

export default function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Inter', 'Rajdhani', sans-serif" }}>
      {/* Nav */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 32px',
        background: 'rgba(3,3,8,0.9)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg,#f59e0b,#ef4444)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 900, color: '#000',
          }}>A</div>
          <span style={{ fontFamily: "'Orbitron', 'Rajdhani', sans-serif", fontSize: 18, fontWeight: 900, letterSpacing: 2, color: '#fff' }}>
            AIL<span style={{ color: '#f59e0b' }}>URIX</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          {['Games', 'Token', 'Roadmap'].map(l => (
            <a key={l} href={'#' + l.toLowerCase()} style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}
              onMouseEnter={e => e.target.style.color = '#fff'}
              onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.5)'}>{l}</a>
          ))}
          <Link href="/game" style={{
            padding: '9px 22px', borderRadius: 25,
            background: 'linear-gradient(135deg,#f59e0b,#ef4444)',
            color: '#000', fontWeight: 900, fontSize: 13, textDecoration: 'none',
            fontFamily: "'Orbitron', sans-serif", letterSpacing: 1,
          }}>▶ PLAY NOW</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        padding: '120px 24px 80px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', width: 800, height: 800, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,.08) 0%, transparent 70%)', top: -200, left: -200, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,.08) 0%, transparent 70%)', bottom: -150, right: -150, pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 100, padding: '6px 18px', fontSize: 12, fontWeight: 700, color: '#ef4444', marginBottom: 28, letterSpacing: 2 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444', animation: 'pulse 1s infinite', display: 'inline-block' }} />
            SEASON 1 · LIVE NOW
          </div>

          <h1 style={{ fontFamily: "'Orbitron', 'Rajdhani', sans-serif", fontSize: 'clamp(40px,9vw,96px)', fontWeight: 900, lineHeight: 1, letterSpacing: 2, marginBottom: 12 }}>
            <span style={{ background: 'linear-gradient(135deg,#f59e0b,#fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AILURIX</span>
            <br />STUDIOS
          </h1>

          <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 'clamp(12px,3vw,18px)', color: 'rgba(255,255,255,0.35)', letterSpacing: 8, marginBottom: 28 }}>PLAY · EARN · OWN</div>

          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.6)', maxWidth: 500, margin: '0 auto 40px', lineHeight: 1.7 }}>
            The future of blockchain gaming. Play games, earn <strong style={{ color: '#f59e0b' }}>$ARX tokens</strong>, build your empire.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/game" style={{
              padding: '16px 40px', borderRadius: 50, background: 'linear-gradient(135deg,#f59e0b,#ef4444)',
              color: '#000', fontWeight: 900, fontSize: 16, textDecoration: 'none',
              fontFamily: "'Orbitron', sans-serif", letterSpacing: 2,
              boxShadow: '0 0 30px rgba(245,158,11,0.3)',
            }}>⚔️ PLAY ARENA</Link>
            <a href="#token" style={{
              padding: '16px 40px', borderRadius: 50, border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.7)',
              fontWeight: 700, fontSize: 16, textDecoration: 'none',
            }}>🪙 $ARX TOKEN</a>
          </div>

          <div style={{ display: 'flex', gap: 48, marginTop: 64, justifyContent: 'center', flexWrap: 'wrap' }}>
            {STATS.map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 30, fontWeight: 900, color: '#f59e0b', fontFamily: "'Orbitron', sans-serif" }}>{s.value}{s.suffix}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2, marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Games */}
      <section id="games" style={{ padding: '100px 24px', background: 'rgba(255,255,255,0.01)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 4, color: '#f59e0b', fontFamily: "'Orbitron', sans-serif", marginBottom: 12 }}>OUR GAMES</div>
            <h2 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 'clamp(26px,4vw,44px)', fontWeight: 900, marginBottom: 16 }}>Games by Ailurix Studios</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 24 }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 20, padding: '28px 24px', transition: 'transform .3s, border-color .3s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(245,158,11,.3)'; e.currentTarget.style.transform = 'translateY(-6px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ fontSize: 36, marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, fontFamily: "'Orbitron', sans-serif" }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Token */}
      <section id="token" style={{ padding: '100px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, rgba(139,92,246,.08), transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 4, color: '#f59e0b', fontFamily: "'Orbitron', sans-serif", marginBottom: 12 }}>BLOCKCHAIN</div>
            <h2 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 'clamp(26px,4vw,44px)', fontWeight: 900, marginBottom: 16 }}>The $ARX Token</h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', maxWidth: 500, margin: '0 auto' }}>One token. All games. Real value. Built on Base Chain.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 32 }}>
            {[
              { icon: '⛓️', title: 'Base Chain', desc: 'Ultra-low gas fees. Coinbase backed.' },
              { icon: '🔥', title: 'Deflationary', desc: 'Burn rate > earn rate. Value grows.' },
              { icon: '🎮', title: 'Multi-Game', desc: 'Works across all Ailurix games.' },
              { icon: '💰', title: 'Play to Earn', desc: 'Win fights, earn $ARX instantly.' },
            ].map(t => (
              <div key={t.title} style={{ background: 'rgba(139,92,246,.05)', border: '1px solid rgba(139,92,246,.2)', borderRadius: 16, padding: '20px' }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{t.icon}</div>
                <div style={{ fontWeight: 700, fontFamily: "'Orbitron', sans-serif", fontSize: 13, marginBottom: 6 }}>{t.title}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{t.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16 }}>
            <div style={{ background: 'rgba(34,197,94,.05)', border: '1px solid rgba(34,197,94,.2)', borderRadius: 16, padding: '20px' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>💰</div>
              <div style={{ fontWeight: 700, color: '#22c55e', fontFamily: "'Orbitron', sans-serif", fontSize: 13, marginBottom: 6 }}>EARN $ARX</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>Win fights · Stage complete · Beat boss · Daily login · Referrals</div>
            </div>
            <div style={{ background: 'rgba(239,68,68,.05)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 16, padding: '20px' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🔥</div>
              <div style={{ fontWeight: 700, color: '#ef4444', fontFamily: "'Orbitron', sans-serif", fontSize: 13, marginBottom: 6 }}>BURN $ARX</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>Unlock skins · Tournaments · Power-ups · NFT minting · Upgrades</div>
            </div>
            <div style={{ background: 'rgba(245,158,11,.05)', border: '1px solid rgba(245,158,11,.2)', borderRadius: 16, padding: '20px' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>📈</div>
              <div style={{ fontWeight: 700, color: '#f59e0b', fontFamily: "'Orbitron', sans-serif", fontSize: 13, marginBottom: 6 }}>RESULT</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>Burn {'>'} Earn = Deflationary = $ARX value grows over time</div>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section id="roadmap" style={{ padding: '100px 24px', background: 'rgba(255,255,255,0.01)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 4, color: '#f59e0b', fontFamily: "'Orbitron', sans-serif", marginBottom: 12 }}>ROADMAP</div>
            <h2 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 'clamp(26px,4vw,44px)', fontWeight: 900 }}>What&apos;s Coming</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {ROADMAP.map((r, i) => (
              <div key={r.phase} style={{ display: 'flex', gap: 24, paddingBottom: 40 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 44 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: r.status === 'done' ? 'linear-gradient(135deg,#f59e0b,#ef4444)' : r.status === 'active' ? 'rgba(245,158,11,.15)' : 'rgba(255,255,255,0.05)',
                    border: r.status === 'active' ? '2px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0,
                    color: r.status === 'done' ? '#000' : r.status === 'active' ? '#f59e0b' : 'rgba(255,255,255,0.3)',
                    fontWeight: 900,
                  }}>
                    {r.status === 'done' ? '✓' : r.status === 'active' ? '⚡' : (i + 1)}
                  </div>
                  {i < ROADMAP.length - 1 && <div style={{ width: 2, flex: 1, background: 'rgba(255,255,255,0.08)', marginTop: 8 }} />}
                </div>
                <div style={{ paddingTop: 10 }}>
                  <div style={{ fontSize: 10, color: '#f59e0b', fontWeight: 700, letterSpacing: 2, marginBottom: 4, fontFamily: "'Orbitron', sans-serif" }}>{r.phase}</div>
                  <div style={{ fontSize: 20, fontWeight: 900, fontFamily: "'Orbitron', sans-serif", marginBottom: 12 }}>{r.title}</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {r.items.map(item => (
                      <span key={item} style={{
                        fontSize: 12, padding: '4px 12px', borderRadius: 6,
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                        color: r.status === 'done' ? '#22c55e' : 'rgba(255,255,255,0.5)', fontWeight: 600,
                      }}>
                        {r.status === 'done' ? '✓ ' : ''}{item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '100px 24px', textAlign: 'center', background: 'radial-gradient(ellipse at center, rgba(245,158,11,.06) 0%, transparent 70%)' }}>
        <h2 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 'clamp(28px,6vw,64px)', fontWeight: 900, letterSpacing: 1, marginBottom: 20 }}>
          Your empire<br /><span style={{ background: 'linear-gradient(135deg,#f59e0b,#ef4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>awaits.</span>
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 18, marginBottom: 40, maxWidth: 440, margin: '0 auto 40px' }}>
          Season 1 is open. Early players earn bonus $ARX tokens and whitelist access.
        </p>
        <Link href="/game" style={{
          padding: '18px 56px', borderRadius: 50, background: 'linear-gradient(135deg,#f59e0b,#ef4444)',
          color: '#000', fontWeight: 900, fontSize: 18, textDecoration: 'none',
          fontFamily: "'Orbitron', sans-serif", letterSpacing: 2,
          boxShadow: '0 0 40px rgba(245,158,11,0.3)', display: 'inline-block',
        }}>⚔️ PLAY AILURIX ARENA</Link>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px 32px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 20, fontWeight: 900, color: '#f59e0b', letterSpacing: 2 }}>AILURIX</div>
        <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>© 2026 Ailurix Studios LLC · ailurix.com · All Rights Reserved</div>
        <div style={{ display: 'flex', gap: 20, fontSize: 13 }}>
          {['Twitter', 'Discord', 'GitHub'].map(l => (
            <a key={l} href="#" style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}
              onMouseEnter={e => e.target.style.color = '#fff'}
              onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.35)'}>{l}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}
