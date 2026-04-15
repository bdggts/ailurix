'use client';
import Link from 'next/link';

const LINKS = {
  Games: [['Ailurix Arena', '/game'], ['Ailurix Farm', '#roadmap'], ['Ailurix Racers', '#roadmap']],
  Token: [['$ARX Token', '#token'], ['Tokenomics', '#token'], ['Waitlist', '#waitlist']],
  Studio: [['About', '#about'], ['Roadmap', '#roadmap'], ['Partners', '#partners']],
  Community: [['Discord', 'https://discord.gg/ailurix'], ['Twitter / X', 'https://x.com/AilurixStudios'], ['Telegram', 'https://t.me/ailurix']],
};

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: '#020207' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 48px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr repeat(4, 1fr)', gap: 48, marginBottom: 56 }}>
          {/* Brand */}
          <div>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: 7, background: 'linear-gradient(135deg,#f59e0b,#ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Orbitron',sans-serif", fontWeight: 900, fontSize: 14, color: '#000' }}>A</div>
              <span style={{ fontFamily: "'Orbitron',sans-serif", fontWeight: 900, fontSize: 14, letterSpacing: 2, color: '#fff' }}>AILURIX</span>
            </Link>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', lineHeight: 1.7, maxWidth: 240 }}>
              A blockchain gaming studio building the future of play-to-earn on Base Chain.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([title, links]) => (
            <div key={title}>
              <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 3, color: 'rgba(255,255,255,0.25)', marginBottom: 20 }}>{title.toUpperCase()}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {links.map(([label, href]) => (
                  <a key={label} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noopener' : undefined}
                    style={{ fontSize: 13, color: 'rgba(255,255,255,0.42)', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.target.style.color = '#fff'}
                    onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.42)'}
                  >{label}</a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>
            &copy; 2026 Ailurix Studios. All rights reserved.
          </span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.15)', fontFamily: "'Orbitron',sans-serif", letterSpacing: 2 }}>
            BUILT ON BASE CHAIN
          </span>
        </div>
      </div>
    </footer>
  );
}
