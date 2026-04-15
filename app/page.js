'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Header from './components/Header';
import Footer from './components/Footer';

/* --- Scroll Reveal ----------------------------------------- */
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

/* --- Data -------------------------------------------------- */
const GAMES = [
  {
    name: 'Ailurix Arena',
    status: 'LIVE',
    statusType: 'live',
    img: '/game-ss-1.png',
    desc: 'A pixel-art fighting game with 16 alien fighters. Battle through a 15-stage tower, master your fighter, and defeat the final boss to earn $ARX.',
    features: ['16 Unique Fighters', '15-Stage Tower', 'Play-to-Earn', 'Live Leaderboard'],
    cta: '/game',
    ctaLabel: 'PLAY NOW',
  },
  {
    name: 'Ailurix Farm',
    status: 'COMING Q4 2026',
    statusType: 'gold',
    img: '/game-ss-2.png',
    desc: 'Build your alien farm, harvest rare resources, and trade NFT crops. All earnings flow through the $ARX token ecosystem.',
    features: ['NFT Land Plots', 'Crop Trading', 'Shared $ARX Economy', 'Multiplayer Co-op'],
    cta: '#roadmap',
    ctaLabel: 'SEE ROADMAP',
  },
  {
    name: 'Ailurix Racers',
    status: 'IN DEVELOPMENT',
    statusType: 'gold',
    img: '/game-ss-3.png',
    desc: 'High-speed alien racing across alien planets. Customize your vehicle, compete in tournaments, and earn $ARX from every race.',
    features: ['Vehicle NFTs', 'Tournament Prizes', 'Cross-game Items', 'Ranked Seasons'],
    cta: '#roadmap',
    ctaLabel: 'SEE ROADMAP',
  },
];

const TOKEN_STATS = [
  { label: 'Token', value: '$ARX' },
  { label: 'Network', value: 'Base Chain' },
  { label: 'Supply', value: '10,000,000,000' },
  { label: 'Model', value: 'Deflationary' },
];

const EARN_METHODS = [
  { icon: '&#9876;', title: 'Win Battles', desc: 'Earn $ARX for every fight you win in Ailurix Arena', amount: '+2 ARX' },
  { icon: '&#9733;', title: 'Complete Stages', desc: 'Clear tower stages to unlock bigger rewards', amount: '+10 ARX' },
  { icon: '&#9813;', title: 'Defeat Bosses', desc: 'Take down the final boss for jackpot earnings', amount: '+25 ARX' },
  { icon: '&#8635;', title: 'Daily Streaks', desc: 'Log in every day to build your streak bonus', amount: '+1 ARX' },
];

const ROADMAP = [
  { n: '01', title: 'Arena Launch', status: 'COMPLETE', color: '#22c55e', items: ['16 alien fighters', '15-stage tower', 'Adaptive CPU AI', 'Studio rebrand'] },
  { n: '02', title: 'Token + Earn', status: 'IN PROGRESS', color: '#f59e0b', items: ['$ARX on Base Chain', 'Wallet integration', 'Win-to-earn system', 'Tournament mode'] },
  { n: '03', title: 'New Games', status: 'UPCOMING', color: 'rgba(255,255,255,0.2)', items: ['Ailurix Farm launch', 'Ailurix Racers alpha', 'Cross-game economy', 'NFT marketplace'] },
  { n: '04', title: 'Ecosystem', status: 'UPCOMING', color: 'rgba(255,255,255,0.2)', items: ['DEX listing', 'CoinGecko / CMC', 'DAO governance', 'Mobile apps'] },
];

const PARTNERS = [
  { name: 'Coinbase', role: 'Infrastructure', color: '#1652f0' },
  { name: 'Binance', role: 'Exchange', color: '#f0b90b' },
  { name: 'Base Chain', role: 'Blockchain', color: '#0052ff' },
  { name: 'Chainlink', role: 'Oracle', color: '#375bd2' },
  { name: 'OpenSea', role: 'NFT Market', color: '#2081e2' },
  { name: 'Uniswap', role: 'DEX', color: '#ff007a' },
  { name: 'Polygon', role: 'Scaling', color: '#8247e5' },
  { name: 'Alchemy', role: 'Nodes', color: '#363ff9' },
];

const FAQ = [
  { q: 'What is Ailurix Studios?', a: 'Ailurix Studios is a blockchain gaming company building play-to-earn games on Base Chain. Our first title, Ailurix Arena, is a fighting game where players earn $ARX tokens by winning battles.' },
  { q: 'What is the $ARX token?', a: '$ARX is the native utility token of the Ailurix ecosystem. It is deflationary by design - more tokens are burned through gameplay than minted, protecting long-term holder value.' },
  { q: 'How do I earn $ARX?', a: 'Play our games! Win fights, complete stages, defeat bosses, and maintain daily login streaks. All earnings go directly to your connected wallet.' },
  { q: 'Do I need a crypto wallet?', a: 'No wallet is required to play. However, to withdraw your $ARX earnings you will need a Base Chain-compatible wallet like MetaMask or Coinbase Wallet.' },
  { q: 'When does the token launch?', a: 'The $ARX token launches on Base Chain in Q3 2026. Join our waitlist for early access and bonus allocation as a Season 1 player.' },
  { q: 'Is Arena free to play?', a: 'Yes. Ailurix Arena is 100% free to play with no upfront costs. Paid cosmetics and tournament entries are completely optional.' },
];

/* --- Page -------------------------------------------------- */
export default function Home() {
  const [progress, setProgress] = useState(0);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? (window.scrollY / h) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const onSubmit = (e) => { e.preventDefault(); if (email.trim()) setSubmitted(true); };

  return (
    <>
      {/* Progress bar */}
      <div className="progress-bar" style={{ width: `${progress}%` }} />

      {/* Header */}
      <Header />

      {/* ========== HERO ========== */}
      <section className="hero">
        <div className="hero-bg" style={{ backgroundImage: 'url(/arena-hero-bg.png)' }} />
        <div className="hero-overlay" />

        <div className="hero-content">
          <Reveal>
            <div className="badge badge-red" style={{ marginBottom: 32 }}>
              <span className="animate-blink" style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
              WE BUILD THE FUTURE OF GAMING
            </div>
          </Reveal>

          <Reveal delay={100}>
            <h1 className="heading-xl" style={{ marginBottom: 20 }}>
              <span className="gradient-text">AILURIX</span><br />
              <span>STUDIOS</span>
            </h1>
          </Reveal>

          <Reveal delay={200}>
            <p className="label" style={{ color: 'var(--text-muted)', letterSpacing: 9, marginBottom: 36 }}>
              PLAY &middot; EARN &middot; OWN
            </p>
          </Reveal>

          <Reveal delay={300}>
            <p className="body-lg" style={{ maxWidth: 540, margin: '0 auto 44px', color: 'rgba(255,255,255,0.65)' }}>
              A blockchain gaming studio building play-to-earn games on Base Chain. Play our games, earn <strong style={{ color: 'var(--gold)' }}>$ARX tokens</strong>, and own your in-game assets.
            </p>
          </Reveal>

          <Reveal delay={400}>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/game" className="btn-primary animate-pulse-glow">ENTER ARENA</Link>
              <a href="#token" className="btn-secondary">$ARX TOKEN</a>
            </div>
          </Reveal>
        </div>

        {/* Scroll indicator */}
        <div className="scroll-indicator">
          <span className="label" style={{ color: 'var(--text-muted)', fontSize: 8 }}>SCROLL</span>
          <div className="scroll-line" />
        </div>
      </section>

      {/* ========== ABOUT STUDIO ========== */}
      <section className="section section-border">
        <div className="container">
          <div className="grid-2" style={{ gap: 80, alignItems: 'center' }}>
            <Reveal>
              <div>
                <div className="label" style={{ color: 'var(--gold)', marginBottom: 16 }}>ABOUT THE STUDIO</div>
                <h2 className="heading-lg" style={{ marginBottom: 24 }}>
                  Building games<br />
                  <span className="gradient-text">players own.</span>
                </h2>
                <p className="body-lg" style={{ marginBottom: 32 }}>
                  Ailurix Studios is a next-generation blockchain gaming company. We create high-quality games where every victory, every achievement, and every item has real value through the $ARX token on Base Chain.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {[
                    { n: '3', label: 'Games in Pipeline' },
                    { n: '10B', label: '$ARX Total Supply' },
                    { n: '16', label: 'Unique Fighters' },
                    { n: 'L2', label: 'Base Chain Native' },
                  ].map(s => (
                    <div key={s.label} className="card" style={{ padding: 20, textAlign: 'center' }}>
                      <div className="heading-md gradient-text">{s.n}</div>
                      <div className="body-sm" style={{ marginTop: 4 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div style={{ position: 'relative' }}>
                <div className="card-glass" style={{ padding: 0, overflow: 'hidden', borderRadius: 'var(--radius-lg)' }}>
                  <img src="/game-ss-1.png" alt="Ailurix Arena Gameplay" style={{ width: '100%', height: 400, objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '60px 28px 24px', background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' }}>
                    <div className="badge badge-live" style={{ marginBottom: 8 }}>
                      <span className="animate-blink" style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                      LIVE NOW
                    </div>
                    <div className="heading-sm" style={{ color: '#fff' }}>Ailurix Arena - Season 1</div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ========== OUR GAMES ========== */}
      <section id="games" className="section section-border">
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(239,68,68,0.04), transparent 60%)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative' }}>
          <Reveal>
            <div className="text-center" style={{ marginBottom: 64 }}>
              <div className="label" style={{ color: 'var(--red)', marginBottom: 16 }}>OUR GAMES</div>
              <h2 className="heading-lg">Play. Earn. <span className="gradient-text">Repeat.</span></h2>
              <p className="body" style={{ maxWidth: 480, margin: '16px auto 0' }}>Every game in the Ailurix ecosystem shares the $ARX token. Play any game, earn everywhere.</p>
            </div>
          </Reveal>

          <div className="grid-3">
            {GAMES.map((g, i) => (
              <Reveal key={g.name} delay={i * 120}>
                <div className="game-card">
                  <img src={g.img} alt={g.name} className="game-card-img" />
                  <div className="game-card-body">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <h3 className="heading-sm" style={{ letterSpacing: 1.5 }}>{g.name}</h3>
                      <div className={`badge badge-${g.statusType}`} style={{ fontSize: 8, padding: '4px 10px' }}>{g.status}</div>
                    </div>
                    <p className="body-sm" style={{ marginBottom: 20, minHeight: 66 }}>{g.desc}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                      {g.features.map(f => (
                        <div key={f} className="body-sm" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--gold)', flexShrink: 0 }} />
                          {f}
                        </div>
                      ))}
                    </div>
                    <Link href={g.cta} className="label" style={{ color: 'var(--gold)', display: 'inline-flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(245,158,11,0.3)', paddingBottom: 4 }}>
                      {g.ctaLabel} &#8594;
                    </Link>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ========== PLAY TO EARN ========== */}
      <section id="earn" className="section section-border">
        <div className="container">
          <div className="grid-2" style={{ gap: 80, alignItems: 'center' }}>
            <Reveal>
              <div>
                <div className="label" style={{ color: 'var(--gold)', marginBottom: 16 }}>PLAY-TO-EARN</div>
                <h2 className="heading-lg" style={{ marginBottom: 24 }}>
                  Every game.<br />
                  <span className="gradient-text">Real rewards.</span>
                </h2>
                <p className="body-lg" style={{ marginBottom: 40 }}>
                  Our play-to-earn model is simple: play well, earn $ARX. No tricks, no paywalls. Your skill equals your earnings across every Ailurix game.
                </p>
                <Link href="/game" className="btn-primary">START EARNING</Link>
              </div>
            </Reveal>

            <Reveal delay={150}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {EARN_METHODS.map((e, i) => (
                  <div key={e.title} className="card" style={{ padding: '24px 28px', display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div className="flex-center" style={{ width: 48, height: 48, borderRadius: 10, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', flexShrink: 0, fontSize: 20 }} dangerouslySetInnerHTML={{ __html: e.icon }} />
                    <div style={{ flex: 1 }}>
                      <div className="heading-sm" style={{ fontSize: 13, letterSpacing: 1, marginBottom: 2 }}>{e.title}</div>
                      <div className="body-sm">{e.desc}</div>
                    </div>
                    <div className="label gradient-text" style={{ fontSize: 12, flexShrink: 0 }}>{e.amount}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ========== $ARX TOKEN ========== */}
      <section id="token" className="section section-border">
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 70% 50%, rgba(245,158,11,0.04), transparent 60%)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative' }}>
          <Reveal>
            <div className="text-center" style={{ marginBottom: 64 }}>
              <div className="label" style={{ color: 'var(--gold)', marginBottom: 16 }}>TOKENOMICS</div>
              <h2 className="heading-lg">The <span className="gradient-text">$ARX</span> Token</h2>
              <p className="body" style={{ maxWidth: 520, margin: '16px auto 0' }}>The fuel of the Ailurix ecosystem. Earn it, spend it, trade it. Deflationary by design.</p>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="grid-4" style={{ marginBottom: 48 }}>
              {TOKEN_STATS.map(s => (
                <div key={s.label} className="card text-center" style={{ padding: '32px 20px' }}>
                  <div className="body-sm" style={{ marginBottom: 8 }}>{s.label}</div>
                  <div className="heading-md gradient-text">{s.value}</div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div className="grid-2" style={{ gap: 24 }}>
              <div className="card" style={{ borderColor: 'rgba(34,197,94,0.15)' }}>
                <div className="label" style={{ color: 'var(--green)', marginBottom: 20 }}>HOW YOU EARN</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {['Win a fight round: +2 $ARX', 'Complete a stage: +10 $ARX', 'Defeat boss: +25 $ARX', 'Daily login: +1 $ARX', 'Flawless victory: +5 $ARX', 'Refer a friend: +15 $ARX'].map(e => (
                    <div key={e} className="body-sm" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ color: 'var(--green)' }}>+</span> {e}
                    </div>
                  ))}
                </div>
              </div>
              <div className="card" style={{ borderColor: 'rgba(239,68,68,0.15)' }}>
                <div className="label" style={{ color: 'var(--red)', marginBottom: 20 }}>HOW TOKENS BURN</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {['Character skin: 50 $ARX', 'Tournament entry: 10 $ARX', 'In-game revival: 20 $ARX', 'Power-up: 8 $ARX', 'NFT mint: 200 $ARX', 'Equipment upgrade: 30 $ARX'].map(b => (
                    <div key={b} className="body-sm" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ color: 'var(--red)' }}>-</span> {b}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ========== ROADMAP ========== */}
      <section id="roadmap" className="section section-border">
        <div className="container">
          <Reveal>
            <div className="text-center" style={{ marginBottom: 64 }}>
              <div className="label" style={{ color: 'var(--gold)', marginBottom: 16 }}>ROADMAP</div>
              <h2 className="heading-lg">Where we are <span className="gradient-text">going.</span></h2>
            </div>
          </Reveal>

          <div className="grid-4">
            {ROADMAP.map((r, i) => (
              <Reveal key={r.n} delay={i * 100}>
                <div className="card" style={{ borderColor: `${r.color}25` }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <span className="label" style={{ color: 'var(--text-muted)' }}>PHASE {r.n}</span>
                    <span className="badge" style={{ fontSize: 8, padding: '3px 10px', background: `${r.color}14`, border: `1px solid ${r.color}28`, color: r.color }}>{r.status}</span>
                  </div>
                  <h3 className="heading-sm" style={{ marginBottom: 16, fontSize: 16 }}>{r.title}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {r.items.map(item => (
                      <div key={item} className="body-sm" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ width: 4, height: 4, borderRadius: '50%', background: r.color, flexShrink: 0 }} />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ========== PARTNERS ========== */}
      <section className="section section-border">
        <div className="container">
          <Reveal>
            <div className="text-center" style={{ marginBottom: 48 }}>
              <div className="label" style={{ color: 'var(--text-muted)', marginBottom: 16 }}>BACKED BY</div>
              <h2 className="heading-lg">Our <span className="gradient-text">Partners</span></h2>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="grid-4" style={{ gap: 16 }}>
              {PARTNERS.map(p => (
                <div key={p.name} className="card text-center" style={{ padding: '28px 20px' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: `${p.color}15`, border: `1px solid ${p.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontFamily: 'var(--font-head)', fontWeight: 900, fontSize: 16, color: p.color }}>{p.name[0]}</div>
                  <div className="heading-sm" style={{ fontSize: 13, letterSpacing: 1, marginBottom: 4 }}>{p.name}</div>
                  <div className="body-sm" style={{ fontSize: 11 }}>{p.role}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ========== WAITLIST ========== */}
      <section className="section section-border">
        <div className="container">
          <Reveal>
            <div className="text-center" style={{ maxWidth: 560, margin: '0 auto' }}>
              <div className="label" style={{ color: 'var(--gold)', marginBottom: 16 }}>EARLY ACCESS</div>
              <h2 className="heading-lg" style={{ marginBottom: 16 }}>
                Join the <span className="gradient-text">Waitlist</span>
              </h2>
              <p className="body" style={{ marginBottom: 36 }}>
                Be first in line when $ARX launches. Season 1 players get bonus token allocation and exclusive NFT drops.
              </p>

              {submitted ? (
                <div className="card-glass text-center" style={{ padding: 32 }}>
                  <div className="heading-sm gradient-text" style={{ fontSize: 16 }}>You are in!</div>
                  <p className="body-sm" style={{ marginTop: 8 }}>We will notify you when $ARX launches.</p>
                </div>
              ) : (
                <form onSubmit={onSubmit} style={{ display: 'flex', gap: 12 }}>
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    style={{
                      flex: 1, padding: '16px 20px', borderRadius: 4,
                      background: 'var(--bg-card)', border: '1px solid var(--border)',
                      color: '#fff', fontSize: 14, fontFamily: 'var(--font-body)',
                      outline: 'none', transition: 'var(--transition)',
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                  <button type="submit" className="btn-primary" style={{ padding: '16px 36px' }}>JOIN</button>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ========== FAQ ========== */}
      <section id="faq" className="section section-border">
        <div className="container" style={{ maxWidth: 720 }}>
          <Reveal>
            <div className="text-center" style={{ marginBottom: 48 }}>
              <div className="label" style={{ color: 'var(--gold)', marginBottom: 16 }}>FAQ</div>
              <h2 className="heading-lg">Common <span className="gradient-text">Questions</span></h2>
            </div>
          </Reveal>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {FAQ.map((f, i) => (
              <Reveal key={i} delay={i * 60}>
                <div
                  className="card"
                  style={{ padding: 0, cursor: 'pointer', overflow: 'hidden' }}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <div style={{ padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className="heading-sm" style={{ fontSize: 13, letterSpacing: 0.5 }}>{f.q}</span>
                    <span style={{ color: 'var(--gold)', fontSize: 18, transition: 'transform .3s', transform: openFaq === i ? 'rotate(45deg)' : 'none' }}>+</span>
                  </div>
                  {openFaq === i && (
                    <div style={{ padding: '0 28px 20px' }}>
                      <p className="body-sm">{f.a}</p>
                    </div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ========== COMMUNITY ========== */}
      <section className="section" style={{ backgroundImage: 'url(/community-bg.png)', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(2,2,7,0.75)', backdropFilter: 'blur(2px)' }} />
        <div className="container text-center" style={{ position: 'relative', zIndex: 10 }}>
          <Reveal>
            <div className="label" style={{ color: 'var(--gold)', marginBottom: 16 }}>COMMUNITY</div>
            <h2 className="heading-lg" style={{ marginBottom: 16 }}>Join the <span className="gradient-text">Arena</span></h2>
            <p className="body" style={{ maxWidth: 420, margin: '0 auto 40px' }}>Connect with thousands of players. Get updates, share strategies, and compete.</p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="https://discord.gg/ailurix" target="_blank" rel="noopener" className="btn-primary" style={{ background: '#5865F2', boxShadow: '0 0 30px rgba(88,101,242,0.3)' }}>Discord</a>
              <a href="https://x.com/AilurixStudios" target="_blank" rel="noopener" className="btn-secondary">Twitter / X</a>
              <a href="https://t.me/ailurix" target="_blank" rel="noopener" className="btn-secondary">Telegram</a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ========== CTA ========== */}
      <section className="section text-center">
        <div className="container">
          <Reveal>
            <div className="label" style={{ color: 'var(--gold)', marginBottom: 24 }}>GET STARTED</div>
            <h2 className="heading-lg" style={{ marginBottom: 20 }}>
              Your empire<br /><span className="gradient-text">awaits.</span>
            </h2>
            <p className="body" style={{ maxWidth: 420, margin: '0 auto 48px' }}>
              Season 1 is open. Early players earn bonus $ARX and priority access to all upcoming features.
            </p>
            <Link href="/game" className="btn-primary animate-pulse-glow" style={{ fontSize: 14, padding: '18px 60px' }}>ENTER ARENA</Link>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </>
  );
}
