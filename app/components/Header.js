'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const orb = "'Orbitron','Rajdhani',sans-serif";
const C = { gold: '#f59e0b', border: 'rgba(255,255,255,0.07)', dim: 'rgba(255,255,255,0.42)' };

const NAV_LINKS = [
  ['Games', '#games'],
  ['Fighters', '#fighters'],
  ['Token', '#token'],
  ['Roadmap', '#roadmap'],
];

export default function Header({ onHover }) {
  const [scroll, setScroll] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScroll(window.scrollY);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const solid = scroll > 60;

  return (
    <>
      <style>{`
        @keyframes slideDown { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }
        .nav-link { color: ${C.dim}; text-decoration: none; font-size: 13px; font-weight: 500; letter-spacing: 0.3px; transition: color .2s; }
        .nav-link:hover { color: #fff; }
        .hdr-cta { padding: 9px 26px; border-radius: 3px; background: linear-gradient(135deg,#f59e0b,#ef4444); color: #000; font-weight: 900; font-size: 12px; text-decoration: none; font-family: ${orb}; letter-spacing: 1.5px; box-shadow: 0 0 20px rgba(245,158,11,.22); transition: box-shadow .3s; }
        .hdr-cta:hover { box-shadow: 0 0 36px rgba(245,158,11,.5); }
        @media(max-width:768px){ .nav-desktop{display:none!important;} .nav-mobile-btn{display:flex!important;} }
        @media(min-width:769px){ .nav-mobile-btn{display:none!important;} .nav-mobile-menu{display:none!important;} }
      `}</style>

      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        transition: 'background .4s, border-color .4s, backdrop-filter .4s',
        background: solid ? 'rgba(2,2,7,0.97)' : 'transparent',
        backdropFilter: solid ? 'blur(24px)' : 'none',
        borderBottom: `1px solid ${solid ? C.border : 'transparent'}`,
      }}>
        {/* Main nav row */}
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 48px' }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 11 }}
            onMouseEnter={() => onHover?.(true)} onMouseLeave={() => onHover?.(false)}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: 'linear-gradient(135deg,#f59e0b,#ef4444)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: orb, fontWeight: 900, fontSize: 16, color: '#000',
              boxShadow: '0 0 16px rgba(245,158,11,.3)',
            }}>A</div>
            <div>
              <div style={{ fontFamily: orb, fontSize: 16, fontWeight: 900, letterSpacing: 2.5, color: '#fff', lineHeight: 1 }}>
                AIL<span style={{ color: C.gold }}>URIX</span>
              </div>
              <div style={{ fontSize: 8.5, color: 'rgba(255,255,255,0.25)', letterSpacing: 3, fontFamily: orb }}>STUDIOS</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="nav-desktop" style={{ display: 'flex', gap: 36, alignItems: 'center' }}>
            {NAV_LINKS.map(([l, h]) => (
              <a key={l} href={h} className="nav-link"
                onMouseEnter={() => onHover?.(true)} onMouseLeave={() => onHover?.(false)}>{l}</a>
            ))}
          </nav>

          {/* Right side */}
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <Link href="/game" className="hdr-cta"
              onMouseEnter={() => onHover?.(true)} onMouseLeave={() => onHover?.(false)}>
              PLAY NOW
            </Link>
            {/* Mobile hamburger */}
            <button className="nav-mobile-btn" onClick={() => setMenuOpen(o => !o)} style={{
              display: 'none', flexDirection: 'column', gap: 5, background: 'none', border: 'none',
              cursor: 'none', padding: 6,
            }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{ width: 22, height: 1.5, background: '#fff', display: 'block', transition: 'all .3s', transform: menuOpen && i === 0 ? 'rotate(45deg) translate(5px,5px)' : menuOpen && i === 2 ? 'rotate(-45deg) translate(5px,-5px)' : 'none', opacity: menuOpen && i === 1 ? 0 : 1 }} />
              ))}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="nav-mobile-menu" style={{
            background: 'rgba(2,2,7,0.98)', backdropFilter: 'blur(24px)',
            borderTop: `1px solid ${C.border}`,
            padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 20,
            animation: 'slideDown .25s ease',
          }}>
            {NAV_LINKS.map(([l, h]) => (
              <a key={l} href={h} onClick={() => setMenuOpen(false)} style={{ fontFamily: orb, fontSize: 14, fontWeight: 700, letterSpacing: 2, color: C.dim, textDecoration: 'none' }}
                onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = C.dim}>{l}</a>
            ))}
            <Link href="/game" onClick={() => setMenuOpen(false)} style={{ padding: '13px 0', background: 'linear-gradient(135deg,#f59e0b,#ef4444)', color: '#000', fontWeight: 900, fontSize: 13, textDecoration: 'none', fontFamily: orb, letterSpacing: 2, textAlign: 'center', borderRadius: 3, marginTop: 8 }}>
              PLAY NOW
            </Link>
          </div>
        )}
      </header>
    </>
  );
}
