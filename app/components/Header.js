'use client';
import { useState } from 'react';
import Link from 'next/link';

const NAV_LINKS = [
  ['Games', '#games'],
  ['Token', '#token'],
  ['Roadmap', '#roadmap'],
  ['FAQ', '#faq'],
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <style>{`
        .hdr { position: fixed; top: 0; left: 0; right: 0; z-index: 200; background: #020207; border-bottom: 1px solid rgba(255,255,255,0.07); }
        .hdr-inner { height: 64px; max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; padding: 0 48px; }
        .hdr-logo { display: flex; align-items: center; gap: 11px; text-decoration: none; }
        .hdr-logo-icon { width: 36px; height: 36px; border-radius: 8px; background: linear-gradient(135deg, #f59e0b, #ef4444); display: flex; align-items: center; justify-content: center; font-family: 'Orbitron', sans-serif; font-weight: 900; font-size: 16px; color: #000; box-shadow: 0 0 16px rgba(245,158,11,0.3); }
        .hdr-logo-text { font-family: 'Orbitron', sans-serif; font-size: 16px; font-weight: 900; letter-spacing: 2.5px; color: #fff; line-height: 1; }
        .hdr-logo-sub { font-size: 8.5px; color: rgba(255,255,255,0.25); letter-spacing: 3px; font-family: 'Orbitron', sans-serif; }
        .hdr-nav { display: flex; gap: 36px; align-items: center; }
        .hdr-link { color: rgba(255,255,255,0.42); text-decoration: none; font-size: 13px; font-weight: 500; letter-spacing: 0.3px; transition: color 0.2s; }
        .hdr-link:hover { color: #fff; }
        .hdr-cta { padding: 9px 26px; border-radius: 4px; background: linear-gradient(135deg, #f59e0b, #ef4444); color: #000; font-weight: 900; font-size: 12px; text-decoration: none; font-family: 'Orbitron', sans-serif; letter-spacing: 1.5px; box-shadow: 0 0 20px rgba(245,158,11,0.22); transition: box-shadow 0.3s, transform 0.3s; }
        .hdr-cta:hover { box-shadow: 0 0 36px rgba(245,158,11,0.5); transform: translateY(-1px); }
        .hdr-right { display: flex; gap: 14px; align-items: center; }
        .hdr-burger { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 6px; }
        .hdr-burger span { width: 22px; height: 1.5px; background: #fff; display: block; transition: all 0.3s; }
        .hdr-mobile { display: none; background: rgba(2,2,7,0.98); backdrop-filter: blur(24px); border-top: 1px solid rgba(255,255,255,0.07); padding: 24px 32px; flex-direction: column; gap: 20px; animation: slideDown 0.25s ease; }
        .hdr-mobile a { font-family: 'Orbitron', sans-serif; font-size: 14px; font-weight: 700; letter-spacing: 2px; color: rgba(255,255,255,0.42); text-decoration: none; transition: color 0.2s; }
        .hdr-mobile a:hover { color: #fff; }
        .hdr-mobile-cta { padding: 13px 0; background: linear-gradient(135deg, #f59e0b, #ef4444); color: #000; font-weight: 900; font-size: 13px; text-decoration: none; font-family: 'Orbitron', sans-serif; letter-spacing: 2px; text-align: center; border-radius: 4px; margin-top: 8px; display: block; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }
        @media(max-width:768px) { .hdr-nav { display: none !important; } .hdr-burger { display: flex !important; } .hdr-mobile.open { display: flex !important; } .hdr-inner { padding: 0 20px; } }
      `}</style>

      <header className="hdr">
        <div className="hdr-inner">
          <Link href="/" className="hdr-logo">
            <div className="hdr-logo-icon">A</div>
            <div>
              <div className="hdr-logo-text">AIL<span style={{ color: '#f59e0b' }}>URIX</span></div>
              <div className="hdr-logo-sub">STUDIOS</div>
            </div>
          </Link>

          <nav className="hdr-nav">
            {NAV_LINKS.map(([l, h]) => (
              <a key={l} href={h} className="hdr-link">{l}</a>
            ))}
          </nav>

          <div className="hdr-right">
            <Link href="/game" className="hdr-cta">PLAY NOW</Link>
            <button className="hdr-burger" onClick={() => setMenuOpen(o => !o)}>
              <span style={{ transform: menuOpen ? 'rotate(45deg) translate(5px,5px)' : 'none', opacity: 1 }} />
              <span style={{ opacity: menuOpen ? 0 : 1 }} />
              <span style={{ transform: menuOpen ? 'rotate(-45deg) translate(5px,-5px)' : 'none', opacity: 1 }} />
            </button>
          </div>
        </div>

        <div className={`hdr-mobile ${menuOpen ? 'open' : ''}`}>
          {NAV_LINKS.map(([l, h]) => (
            <a key={l} href={h} onClick={() => setMenuOpen(false)}>{l}</a>
          ))}
          <Link href="/game" onClick={() => setMenuOpen(false)} className="hdr-mobile-cta">PLAY NOW</Link>
        </div>
      </header>
    </>
  );
}
