'use client';
import { useEffect } from 'react';

export default function GameRedirect() {
  useEffect(() => {
    window.location.href = '/game/index.html';
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#020207', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 18, color: '#f59e0b', fontWeight: 900, letterSpacing: 3 }}>LOADING ARENA...</div>
      </div>
    </div>
  );
}
