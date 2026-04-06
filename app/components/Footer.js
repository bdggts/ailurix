'use client';
import Link from 'next/link';

const orb = "'Orbitron','Rajdhani',sans-serif";
const C = { gold: '#f59e0b', border: 'rgba(255,255,255,0.07)', dim: 'rgba(255,255,255,0.42)' };

const FOOTER_COLS = [
  {
    heading: 'GAMES',
    links: [
      { label: 'Ailurix Arena', href: '/game' },
      { label: 'Ailurix Farm', href: '#roadmap' },
      { label: 'Coming Soon', href: '#roadmap' },
    ],
  },
  {
    heading: 'COMPANY',
    links: [
      { label: 'About Studio', href: '#' },
      { label: 'Roadmap', href: '#roadmap' },
      { label: 'Press Kit', href: '#' },
    ],
  },
  {
    heading: 'COMMUNITY',
    links: [
      { label: 'Twitter / X', href: 'https://twitter.com/ailurix' },
      { label: 'Discord', href: '#' },
      { label: 'GitHub', href: 'https://github.com/bdggts/ailurix' },
    ],
  },
];

const BOTTOM_LINKS = ['Privacy Policy', 'Terms of Service', 'Cookie Policy'];

export default function Footer({ onHover }) {
  return (
    <>
      <style>{`
        .ft-link { font-size: 13px; color: ${C.dim}; text-decoration: none; transition: color .2s; }
        .ft-link:hover { color: #fff; }
        .ft-bottom-link { font-size: 12px; color: rgba(255,255,255,0.16); text-decoration: none; transition: color .2s; }
        .ft-bottom-link:hover { color: ${C.dim}; }
        @media(max-width:768px){ .ft-grid{grid-template-columns:1fr!important;} .ft-bottom{flex-direction:column!important;gap:12px!important;text-align:center;} }
      `}</style>

      <footer style={{ borderTop: `1px solid ${C.border}`, background: 'rgba(0,0,0,0.5)' }}>
        {/* Top section */}
        <div className="ft-grid" style={{ maxWidth: 1180, margin: '0 auto', padding: '64px 48px 40px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48 }}>
          {/* Brand */}
          <div>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 11, marginBottom: 22 }}
              onMouseEnter={() => onHover?.(true)} onMouseLeave={() => onHover?.(false)}>
              <div style={{ width: 38, height: 38, borderRadius: 9, background: 'linear-gradient(135deg,#f59e0b,#ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: orb, fontWeight: 900, fontSize: 16, color: '#000', boxShadow: '0 0 18px rgba(245,158,11,.25)' }}>A</div>
              <div>
                <div style={{ fontFamily: orb, fontSize: 16, fontWeight: 900, letterSpacing: 2.5, color: '#fff', lineHeight: 1 }}>AIL<span style={{ color: C.gold }}>URIX</span></div>
                <div style={{ fontSize: 8.5, color: 'rgba(255,255,255,0.2)', letterSpacing: 3, fontFamily: orb }}>STUDIOS</div>
              </div>
            </Link>
            <p style={{ fontSize: 13, color: C.dim, lineHeight: 1.9, maxWidth: 270 }}>
              Building the future of blockchain gaming. One studio. One token. Multiple worlds.
            </p>

            {/* Social icons row */}
            <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
              {[{ label: 'X', href: 'https://twitter.com/ailurix' }, { label: 'DC', href: '#' }, { label: 'GH', href: 'https://github.com/bdggts/ailurix' }].map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                  style={{ width: 36, height: 36, borderRadius: 3, border: `1px solid ${C.border}`, background: 'rgba(255,255,255,.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: orb, fontSize: 10, fontWeight: 700, color: C.dim, textDecoration: 'none', transition: 'border-color .2s, color .2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.color = C.gold; onHover?.(true); }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.dim; onHover?.(false); }}>
                  {s.label}
                </a>
              ))}
            </div>

            <div style={{ marginTop: 28, fontSize: 11, color: 'rgba(255,255,255,.16)', fontFamily: orb, letterSpacing: 1.5 }}>ailurix.com</div>
          </div>

          {/* Link columns */}
          {FOOTER_COLS.map(col => (
            <div key={col.heading}>
              <div style={{ fontSize: 9.5, fontFamily: orb, fontWeight: 700, letterSpacing: 3, color: C.gold, marginBottom: 22 }}>{col.heading}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {col.links.map(link => (
                  <a key={link.label} href={link.href} className="ft-link"
                    onMouseEnter={() => onHover?.(true)} onMouseLeave={() => onHover?.(false)}>
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Divider with token badge */}
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 48px' }}>
          <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${C.border}, ${C.border}, transparent)` }} />
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: -14 }}>
            <div style={{ background: '#020207', padding: '0 16px' }}>
              <div style={{ padding: '5px 18px', border: `1px solid rgba(245,158,11,.2)`, borderRadius: 20, fontFamily: orb, fontSize: 10, fontWeight: 700, color: C.gold, letterSpacing: 2 }}>$ARX · BASE CHAIN · COMING Q3 2026</div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="ft-bottom" style={{ maxWidth: 1180, margin: '0 auto', padding: '20px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,.16)' }}>© 2026 Ailurix Studios LLC — All rights reserved</span>
          <div style={{ display: 'flex', gap: 24 }}>
            {BOTTOM_LINKS.map(l => (
              <a key={l} href="#" className="ft-bottom-link"
                onMouseEnter={() => onHover?.(true)} onMouseLeave={() => onHover?.(false)}>{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
