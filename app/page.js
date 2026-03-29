'use client';
import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import Link from 'next/link';

const STATS = [
  { label: 'Warriors', value: '0', suffix: '+' },
  { label: '$DMX Supply', value: '1B', suffix: '' },
  { label: 'Territories', value: '10K', suffix: '+' },
  { label: 'Prize Pool', value: '$0', suffix: '' },
];

const FEATURES = [
  { icon: '⚔️', title: 'Arena Fights', desc: 'MK-style 1v1 battles. Pick your NFT General, bet $DMX, and destroy your opponent in real-time combat.' },
  { icon: '🏰', title: 'Raid & Conquer', desc: 'Attack enemy territories, steal their $DMX, and expand your empire across the Base chain map.' },
  { icon: '⛏️', title: 'Mine $DMX', desc: 'Your territory auto-generates $DMX every block. The bigger your domain, the more you earn while offline.' },
  { icon: '🐉', title: 'General NFTs', desc: '10,000 unique General NFTs — buy on OpenSea, use in-game. NFT stats directly boost your fighter.' },
  { icon: '🛡️', title: 'Clan Wars', desc: 'Form clans of up to 50 players. Coordinate attacks, share resources, and dominate weekly wars.' },
  { icon: '🏆', title: 'Tournament Mode', desc: 'Weekly 1v1 and clan PvP tournaments with $DMX prize pools. The best warriors earn real rewards.' },
];

const ROADMAP = [
  { phase: 'Phase 1', title: 'Foundation', status: 'done', items: ['$DMX Token', 'Territory NFTs', 'Basic Mining'] },
  { phase: 'Phase 2', title: 'War Begins', status: 'active', items: ['Raid System', 'Army Units', 'Leaderboard'] },
  { phase: 'Phase 3', title: 'Generals', status: 'soon', items: ['10K NFT Drop', 'Clan System', 'Tournaments'] },
  { phase: 'Phase 4', title: 'Dominance', status: 'soon', items: ['Mobile App', 'DEX Listing', 'Governance'] },
];

export default function Home() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  const connectWallet = () => connect({ connector: injected() });

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Nav */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 32px',
        background: 'rgba(3,3,8,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--grad)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 18, fontWeight: 900, color: '#000',
          }}>D</div>
          <span style={{ fontFamily: 'Rajdhani, Inter, sans-serif', fontSize: 22, fontWeight: 700, letterSpacing: 1 }}>DOMINEX</span>
        </div>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          {['Play', 'NFTs', 'Tokenomics', 'Roadmap'].map(l => (
            <a key={l} href={'#' + l.toLowerCase()} style={{ color: 'var(--dim)', textDecoration: 'none', fontSize: 14, fontWeight: 600, transition: 'color .2s' }}
              onMouseEnter={e => e.target.style.color = '#fff'}
              onMouseLeave={e => e.target.style.color = 'var(--dim)'}>{l}</a>
          ))}
          <Link href="/arena" style={{ padding: '8px 18px', borderRadius: 10, background: 'linear-gradient(135deg,#ef4444,#7c2d12)', color: '#fff', fontWeight: 800, fontSize: 13, textDecoration: 'none', letterSpacing: 0.5 }}>⚔️ Arena</Link>
          {mounted && (
            isConnected
              ? <button onClick={disconnect} style={{ padding: '8px 18px', borderRadius: 10, background: 'var(--card)', border: '1px solid var(--border)', color: '#fff', fontWeight: 700, fontSize: 13 }}>
                  {address?.slice(0,6)}...{address?.slice(-4)}
                </button>
              : <button onClick={connectWallet} style={{ padding: '9px 22px', borderRadius: 10, background: 'var(--grad)', border: 'none', color: '#000', fontWeight: 800, fontSize: 13 }}>
                  Connect Wallet
                </button>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        padding: '120px 24px 80px', position: 'relative', overflow: 'hidden',
      }}>
        {/* BG orbs */}
        <div style={{ position: 'absolute', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,.12) 0%, transparent 70%)', top: -200, left: -200, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(239,68,68,.1) 0%, transparent 70%)', bottom: -150, right: -150, pointerEvents: 'none' }} />
        {/* Grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(245,158,11,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(245,158,11,.04) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

        <div style={{ position: 'relative', zIndex: 1, animation: 'fadeUp .6s ease-out both' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(245,158,11,.12)', border: '1px solid rgba(245,158,11,.3)', borderRadius: 100, padding: '6px 18px', fontSize: 13, fontWeight: 700, color: '#f59e0b', marginBottom: 28 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b', animation: 'pulse 2s infinite', display: 'inline-block' }} />
            Live on Base Chain — Season 1 Open
          </div>

          <h1 style={{ fontSize: 'clamp(48px,9vw,110px)', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, lineHeight: 1, letterSpacing: -2, marginBottom: 24 }}>
            CONQUER.<br />
            <span style={{ background: 'var(--grad)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>DOMINATE.</span><br />
            EARN.
          </h1>

          <p style={{ fontSize: 'clamp(16px,2.5vw,20px)', color: 'var(--dim)', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.7 }}>
            The most addictive crypto strategy game on Base. Mine <strong style={{ color: '#f59e0b' }}>$DMX tokens</strong>, raid territories, build your army, and dominate the leaderboard.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/arena" style={{ padding: '16px 36px', borderRadius: 14, background: 'var(--grad)', border: 'none', color: '#000', fontWeight: 800, fontSize: 17, animation: 'glow 3s infinite', letterSpacing: .5, textDecoration: 'none', display: 'inline-block' }}>
              ⚔️ Enter Arena
            </Link>
            <a href="/dominex-arena.apk" download="dominex-arena.apk" style={{
              padding: '16px 36px', borderRadius: 14, border: '1px solid rgba(16,185,129,.4)',
              background: 'rgba(16,185,129,.12)', color: '#10b981', fontWeight: 800, fontSize: 17,
              textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10,
              transition: 'all .2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16,185,129,.25)'; e.currentTarget.style.borderColor = '#10b981'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(16,185,129,.12)'; e.currentTarget.style.borderColor = 'rgba(16,185,129,.4)'; }}
            >
              📱 Download APK
            </a>
            <button style={{ padding: '16px 36px', borderRadius: 14, border: '1px solid var(--border)', background: 'var(--card)', color: '#fff', fontWeight: 700, fontSize: 17 }}
              onClick={() => document.getElementById('tokenomics')?.scrollIntoView({ behavior: 'smooth' })}>
              📊 View $DMX
            </button>
          </div>

          {/* Mini stats */}
          <div style={{ display: 'flex', gap: 32, marginTop: 60, justifyContent: 'center', flexWrap: 'wrap' }}>
            {STATS.map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#f59e0b', fontFamily: 'Rajdhani, sans-serif' }}>{s.value}{s.suffix}</div>
                <div style={{ fontSize: 12, color: 'var(--dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="play" style={{ padding: '100px 24px', background: 'var(--bg2)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#f59e0b', marginBottom: 12 }}>Core Gameplay</div>
            <h2 style={{ fontSize: 'clamp(28px,4vw,48px)', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, letterSpacing: -1 }}>Why you can't stop playing</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{
                background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20,
                padding: '28px 24px', transition: 'border-color .3s,transform .3s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(245,158,11,.4)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ fontSize: 36, marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, fontFamily: 'Rajdhani, sans-serif' }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--dim)', lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tokenomics */}
      <section id="tokenomics" style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#f59e0b', marginBottom: 12 }}>Token</div>
          <h2 style={{ fontSize: 'clamp(28px,4vw,48px)', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, marginBottom: 16 }}>$DMX Tokenomics</h2>
          <p style={{ color: 'var(--dim)', marginBottom: 48, fontSize: 16, lineHeight: 1.7 }}>1 Billion $DMX total supply. Deflationary — upgrades burn tokens. Play-to-earn with real utility.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, marginBottom: 40 }}>
            {[
              { label: 'Game Rewards', pct: '40%', color: '#f59e0b' },
              { label: 'Staking Pool', pct: '20%', color: '#8b5cf6' },
              { label: 'Team & Dev', pct: '20%', color: '#3b82f6' },
              { label: 'Liquidity', pct: '10%', color: '#10b981' },
              { label: 'Marketing', pct: '10%', color: '#ef4444' },
            ].map(t => (
              <div key={t.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: '20px 16px' }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: t.color, fontFamily: 'Rajdhani, sans-serif' }}>{t.pct}</div>
                <div style={{ fontSize: 12, color: 'var(--dim)', marginTop: 6, fontWeight: 600 }}>{t.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12 }}>
            {[
              { icon: '🔥', label: 'Burn on Upgrades', desc: '50% of upgrade cost burned' },
              { icon: '💎', label: 'Stake for Boost', desc: '+50% mining rate when staked' },
              { icon: '🏆', label: 'Tournament Prizes', desc: '70% of entry fees to winners' },
              { icon: '🗳️', label: 'DAO Governance', desc: 'Vote on game updates & balance' },
            ].map(u => (
              <div key={u.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 18px', textAlign: 'left' }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{u.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{u.label}</div>
                <div style={{ fontSize: 12, color: 'var(--dim)' }}>{u.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NFTs */}
      <section id="nfts" style={{ padding: '100px 24px', background: 'var(--bg2)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#f59e0b', marginBottom: 12 }}>NFT Collection</div>
          <h2 style={{ fontSize: 'clamp(28px,4vw,48px)', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, marginBottom: 16 }}>10,000 General NFTs</h2>
          <p style={{ color: 'var(--dim)', marginBottom: 48, fontSize: 16, lineHeight: 1.7 }}>Each General gives special war abilities. Rarer the General, more devastating in battle. Mint with $DMX.</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { tier: 'Common', color: '#94a3b8', supply: '5,000', boost: '+5% ATK' },
              { tier: 'Rare', color: '#3b82f6', supply: '3,000', boost: '+15% ATK' },
              { tier: 'Epic', color: '#8b5cf6', supply: '1,500', boost: '+30% ATK' },
              { tier: 'Legendary', color: '#f59e0b', supply: '450', boost: '+60% ATK' },
              { tier: 'Mythic', color: '#ef4444', supply: '50', boost: '+100% ATK' },
            ].map(n => (
              <div key={n.tier} style={{
                background: 'var(--card)', border: '1px solid', borderColor: n.color + '40',
                borderRadius: 18, padding: '24px 20px', minWidth: 140, textAlign: 'center',
              }}>
                <div style={{ width: 64, height: 64, borderRadius: 14, background: n.color + '20', border: '2px solid ' + n.color, margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🐉</div>
                <div style={{ fontWeight: 800, color: n.color, fontSize: 15, fontFamily: 'Rajdhani, sans-serif' }}>{n.tier}</div>
                <div style={{ fontSize: 12, color: 'var(--dim)', marginTop: 4 }}>{n.supply} supply</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#10b981', marginTop: 6 }}>{n.boost}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section id="roadmap" style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#f59e0b', marginBottom: 12 }}>Roadmap</div>
            <h2 style={{ fontSize: 'clamp(28px,4vw,48px)', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700 }}>Path to Dominance</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {ROADMAP.map((r, i) => (
              <div key={r.phase} style={{ display: 'flex', gap: 24, paddingBottom: 40 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 40 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: r.status === 'done' ? 'var(--grad)' : r.status === 'active' ? 'rgba(245,158,11,.2)' : 'var(--bg3)',
                    border: r.status === 'active' ? '2px solid #f59e0b' : '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0,
                  }}>
                    {r.status === 'done' ? '✓' : r.status === 'active' ? '⚡' : (i + 1)}
                  </div>
                  {i < ROADMAP.length - 1 && <div style={{ width: 2, flex: 1, background: 'var(--border)', marginTop: 8 }} />}
                </div>
                <div style={{ paddingTop: 8 }}>
                  <div style={{ fontSize: 12, color: '#f59e0b', fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>{r.phase}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'Rajdhani, sans-serif', marginBottom: 10 }}>{r.title}</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {r.items.map(item => (
                      <span key={item} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 6, background: 'var(--card)', border: '1px solid var(--border)', color: r.status === 'done' ? '#10b981' : 'var(--dim)', fontWeight: 600 }}>
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
      <section style={{ padding: '100px 24px', textAlign: 'center', background: 'radial-gradient(ellipse at center, rgba(245,158,11,.1) 0%, transparent 70%)' }}>
        <h2 style={{ fontSize: 'clamp(32px,6vw,72px)', fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, letterSpacing: -2, marginBottom: 20 }}>
          Your empire<br /><span style={{ background: 'var(--grad)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>awaits.</span>
        </h2>
        <p style={{ color: 'var(--dim)', fontSize: 18, marginBottom: 40, maxWidth: 440, margin: '0 auto 40px' }}>Season 1 is open. Early players get bonus $DMX and rare NFT whitelist access.</p>
        <button onClick={connectWallet} style={{ padding: '18px 48px', borderRadius: 16, background: 'var(--grad)', border: 'none', color: '#000', fontWeight: 900, fontSize: 20, animation: 'glow 3s infinite' }}>
          ⚔️ Start Your Conquest
        </button>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px 24px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 14, color: '#000' }}>D</div>
          <span style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 16 }}>DOMINEX</span>
        </div>
        <div style={{ color: 'var(--dim)', fontSize: 13 }}>© 2026 Dominex. Built on Base Chain.</div>
        <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
          <a href="#" style={{ color: 'var(--dim)', textDecoration: 'none' }}>Twitter</a>
          <a href="#" style={{ color: 'var(--dim)', textDecoration: 'none' }}>Discord</a>
          <a href="#" style={{ color: 'var(--dim)', textDecoration: 'none' }}>Docs</a>
        </div>
      </footer>
    </div>
  );
}
