'use client';
import { useEffect, useRef, useState } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import * as THREE from 'three';

// Hex grid config
const HEX_RADIUS = 1.2;
const HEX_HEIGHT = 0.35;
const GRID_SIZE  = 5; // 5x5 hex grid radius

function hexToWorld(q, r) {
  return {
    x: HEX_RADIUS * 1.732 * (q + r / 2),
    z: HEX_RADIUS * 1.5   * r,
  };
}

const TERRITORY_COLORS = {
  player:  0xf59e0b,
  enemy:   0xef4444,
  neutral: 0x334155,
  selected:0xfbbf24,
};

const UNIT_TYPES = [
  { name: 'Scout',    cost: 50,   power: 10, icon: '🗡️' },
  { name: 'Knight',   cost: 150,  power: 30, icon: '⚔️' },
  { name: 'Archer',   cost: 100,  power: 20, icon: '🏹' },
  { name: 'Catapult', cost: 400,  power: 70, icon: '💣' },
  { name: 'Dragon',   cost: 2000, power: 200,icon: '🐉' },
];

export default function GamePage() {
  const canvasRef   = useRef(null);
  const sceneRef    = useRef(null);
  const hexMeshes   = useRef([]);
  const animFrameRef= useRef(null);
  const raycaster   = useRef(new THREE.Raycaster());
  const mouse       = useRef(new THREE.Vector2());

  const [selected,    setSelected]    = useState(null);
  const [gameState,   setGameState]   = useState({ dmx: 1250, turn: 1, phase: 'mine' });
  const [territories, setTerritories] = useState([]);
  const [log,         setLog]         = useState([]);
  const [showUnits,   setShowUnits]   = useState(false);
  const [panel,       setPanel]       = useState('map'); // map | army | leaderboard

  const { address, isConnected } = useAccount();
  const { connect } = useConnect();

  function addLog(msg) {
    setLog(prev => [{ id: Date.now(), msg, time: new Date().toLocaleTimeString() }, ...prev.slice(0, 8)]);
  }

  // ── Init Three.js ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!canvasRef.current) return;
    const W = canvasRef.current.clientWidth;
    const H = canvasRef.current.clientHeight;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030308);
    scene.fog = new THREE.FogExp2(0x030308, 0.04);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 100);
    camera.position.set(0, 14, 10);
    camera.lookAt(0, 0, 0);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambient);
    const sun = new THREE.DirectionalLight(0xfff8e0, 1.4);
    sun.position.set(8, 12, 8);
    sun.castShadow = true;
    sun.shadow.camera.near = 0.1;
    sun.shadow.camera.far  = 60;
    sun.shadow.camera.left = sun.shadow.camera.bottom = -20;
    sun.shadow.camera.right= sun.shadow.camera.top    = 20;
    sun.shadow.mapSize.set(2048, 2048);
    scene.add(sun);
    const fill = new THREE.PointLight(0x8b5cf6, 0.6, 30);
    fill.position.set(-8, 6, -8);
    scene.add(fill);
    const fire = new THREE.PointLight(0xef4444, 0.4, 20);
    fire.position.set(8, 4, 8);
    scene.add(fire);

    // Ground glow plane
    const glowGeo = new THREE.PlaneGeometry(40, 40);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x0a0a1a, side: THREE.DoubleSide });
    const ground  = new THREE.Mesh(glowGeo, glowMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.3;
    scene.add(ground);

    // Grid helper (very faint)
    const gridHelper = new THREE.GridHelper(30, 30, 0x111122, 0x111122);
    gridHelper.position.y = -0.29;
    scene.add(gridHelper);

    // Stars
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(3000);
    for (let i = 0; i < 3000; i++) {
      starPos[i] = (Math.random() - 0.5) * 100;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.08, transparent: true, opacity: 0.6 });
    scene.add(new THREE.Points(starGeo, starMat));

    // Build hexagonal territories
    const territories = [];
    const meshes = [];
    const coords = [];
    for (let q = -GRID_SIZE; q <= GRID_SIZE; q++) {
      for (let r = -GRID_SIZE; r <= GRID_SIZE; r++) {
        if (Math.abs(q + r) > GRID_SIZE) continue;
        coords.push({ q, r });
      }
    }

    coords.forEach(({ q, r }, idx) => {
      const { x, z } = hexToWorld(q, r);
      const dist = Math.sqrt(x * x + z * z);
      let type = 'neutral';
      if (dist < 1.8) type = 'player';
      else if (Math.random() < 0.25) type = 'enemy';

      const level  = Math.floor(Math.random() * 3) + 1;
      const army   = Math.floor(Math.random() * 20) * 5;
      const mining = level * 8;

      // Hex geometry
      const hexGeo = new THREE.CylinderGeometry(HEX_RADIUS * 0.92, HEX_RADIUS * 0.92, HEX_HEIGHT + level * 0.12, 6);
      const hexMat = new THREE.MeshStandardMaterial({
        color:     type === 'player' ? TERRITORY_COLORS.player : type === 'enemy' ? TERRITORY_COLORS.enemy : TERRITORY_COLORS.neutral,
        roughness: 0.45,
        metalness: type === 'neutral' ? 0.1 : 0.5,
        emissive:  type === 'player' ? 0xf59e0b : type === 'enemy' ? 0xef4444 : 0x000000,
        emissiveIntensity: type === 'neutral' ? 0 : 0.15,
      });
      const mesh = new THREE.Mesh(hexGeo, hexMat);
      mesh.position.set(x, (HEX_HEIGHT + level * 0.12) / 2, z);
      mesh.castShadow = mesh.receiveShadow = true;
      mesh.userData = { idx, q, r, type, level, army, mining };
      scene.add(mesh);
      meshes.push(mesh);

      // Top glow ring for player territories
      if (type === 'player') {
        const ringGeo = new THREE.RingGeometry(HEX_RADIUS * 0.7, HEX_RADIUS * 0.9, 6);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.35, side: THREE.DoubleSide });
        const ring    = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.set(x, HEX_HEIGHT + level * 0.12 + 0.01, z);
        scene.add(ring);
      }

      // Army indicator cubes on top
      if (army > 0) {
        const unitGeo = new THREE.BoxGeometry(0.18, 0.25, 0.18);
        const unitMat = new THREE.MeshStandardMaterial({ color: type === 'player' ? 0xfbbf24 : 0xff6b6b, emissive: type === 'player' ? 0xfbbf24 : 0xff4444, emissiveIntensity: 0.4 });
        const unit    = new THREE.Mesh(unitGeo, unitMat);
        unit.position.set(x, HEX_HEIGHT + level * 0.12 + 0.2, z);
        unit.castShadow = true;
        scene.add(unit);
      }

      territories.push({ idx, q, r, type, level, army, mining, x, z, mesh });
    });

    hexMeshes.current = meshes;
    setTerritories(territories);

    // Floating particles
    const particleGeo = new THREE.BufferGeometry();
    const pCount = 120;
    const pPos   = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pPos[i * 3]     = (Math.random() - 0.5) * 24;
      pPos[i * 3 + 1] = Math.random() * 6;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 24;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const particleMat = new THREE.PointsMaterial({ color: 0xf59e0b, size: 0.07, transparent: true, opacity: 0.7 });
    const particles   = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Camera orbit state
    let isDragging = false, lastX = 0, lastY = 0;
    let camTheta = 0, camPhi = 0.85, camR = 18;

    function updateCamera() {
      camera.position.x = camR * Math.sin(camTheta) * Math.sin(camPhi);
      camera.position.y = camR * Math.cos(camPhi);
      camera.position.z = camR * Math.cos(camTheta) * Math.sin(camPhi);
      camera.lookAt(0, 0, 0);
    }
    updateCamera();

    const canvas = canvasRef.current;
    canvas.addEventListener('mousedown', e => { isDragging = true; lastX = e.clientX; lastY = e.clientY; });
    canvas.addEventListener('mouseup',   () => isDragging = false);
    canvas.addEventListener('mousemove', e => {
      if (!isDragging) return;
      camTheta -= (e.clientX - lastX) * 0.008;
      camPhi    = Math.max(0.3, Math.min(1.3, camPhi - (e.clientY - lastY) * 0.006));
      lastX = e.clientX; lastY = e.clientY;
      updateCamera();
    });
    canvas.addEventListener('wheel', e => {
      camR = Math.max(8, Math.min(28, camR + e.deltaY * 0.02));
      updateCamera();
    });
    // Touch
    let lastTouchX = 0, lastTouchY = 0;
    canvas.addEventListener('touchstart', e => { lastTouchX = e.touches[0].clientX; lastTouchY = e.touches[0].clientY; });
    canvas.addEventListener('touchmove',  e => {
      e.preventDefault();
      camTheta -= (e.touches[0].clientX - lastTouchX) * 0.01;
      camPhi    = Math.max(0.3, Math.min(1.3, camPhi - (e.touches[0].clientY - lastTouchY) * 0.008));
      lastTouchX = e.touches[0].clientX; lastTouchY = e.touches[0].clientY;
      updateCamera();
    }, { passive: false });

    // Click to select hex
    canvas.addEventListener('click', e => {
      const rect = canvas.getBoundingClientRect();
      mouse.current.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
      mouse.current.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
      raycaster.current.setFromCamera(mouse.current, camera);
      const hits = raycaster.current.intersectObjects(hexMeshes.current);
      if (hits.length > 0) {
        const h = hits[0].object;
        setSelected(h.userData);
        hexMeshes.current.forEach(m => {
          const t = m.userData.type;
          m.material.emissive.setHex(t === 'player' ? 0xf59e0b : t === 'enemy' ? 0xef4444 : 0x000000);
          m.material.emissiveIntensity = t === 'neutral' ? 0 : 0.15;
        });
        h.material.emissive.setHex(0xffffff);
        h.material.emissiveIntensity = 0.5;
      }
    });

    // Animate
    let t = 0;
    function animate() {
      animFrameRef.current = requestAnimationFrame(animate);
      t += 0.01;

      // Pulse player hexes
      meshes.forEach(m => {
        if (m.userData.type === 'player') {
          m.material.emissiveIntensity = 0.1 + Math.sin(t * 2 + m.userData.idx) * 0.08;
        }
      });

      // Animate particles
      const pArr = particles.geometry.attributes.position.array;
      for (let i = 0; i < pCount; i++) {
        pArr[i * 3 + 1] += 0.005;
        if (pArr[i * 3 + 1] > 7) pArr[i * 3 + 1] = 0;
      }
      particles.geometry.attributes.position.needsUpdate = true;
      particles.rotation.y += 0.001;

      renderer.render(scene, camera);
    }
    animate();

    // Resize
    const onResize = () => {
      const w = canvasRef.current.clientWidth;
      const h = canvasRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, []);

  // Mine DMX every 5 sec
  useEffect(() => {
    const interval = setInterval(() => {
      const playerTerr = territories.filter(t => t.type === 'player');
      const earned = playerTerr.reduce((s, t) => s + t.mining, 0);
      if (earned > 0) {
        setGameState(g => ({ ...g, dmx: g.dmx + earned }));
        if (Math.random() < 0.3) addLog(`⛏️ Mined +${earned} $DMX from ${playerTerr.length} territories`);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [territories]);

  function handleRaid() {
    if (!selected || selected.type !== 'enemy') return addLog('❌ Select an enemy territory to raid!');
    const power = territories.filter(t => t.type === 'player').reduce((s, t) => s + t.army, 0);
    const success = power > selected.army + 10;
    if (success) {
      const loot = Math.floor(selected.mining * 25);
      setGameState(g => ({ ...g, dmx: g.dmx + loot }));
      setTerritories(prev => prev.map(t => t.idx === selected.idx ? { ...t, type: 'player', army: Math.floor(selected.army * 0.3) } : t));
      if (hexMeshes.current[selected.idx]) {
        hexMeshes.current[selected.idx].material.color.setHex(TERRITORY_COLORS.player);
        hexMeshes.current[selected.idx].material.emissive.setHex(0xf59e0b);
        hexMeshes.current[selected.idx].userData.type = 'player';
      }
      addLog(`⚔️ RAID SUCCESS! Captured territory. +${loot} $DMX looted!`);
      setSelected(null);
    } else {
      const loss = Math.floor(gameState.dmx * 0.05);
      setGameState(g => ({ ...g, dmx: Math.max(0, g.dmx - loss) }));
      addLog(`💀 Raid FAILED! Lost ${loss} $DMX. Enemy was too strong.`);
    }
  }

  function buyUnit(unit) {
    if (gameState.dmx < unit.cost) return addLog(`❌ Not enough $DMX! Need ${unit.cost}`);
    setGameState(g => ({ ...g, dmx: g.dmx - unit.cost }));
    addLog(`✅ Hired ${unit.name} (${unit.icon}) for ${unit.cost} $DMX!`);
  }

  const playerTerr = territories.filter(t => t.type === 'player');
  const enemyTerr  = territories.filter(t => t.type === 'enemy');

  if (!isConnected) return (
    <div style={{ minHeight:'100vh', background:'#030308', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20 }}>
      <div style={{ fontSize:72 }}>⚔️</div>
      <h1 style={{ fontFamily:'Rajdhani, sans-serif', fontSize:42, fontWeight:700, color:'#f59e0b', letterSpacing:2 }}>DOMINEX</h1>
      <p style={{ color:'#64748b', fontSize:16 }}>Connect wallet to enter the battlefield</p>
      <button onClick={() => connect({ connector: injected() })}
        style={{ padding:'16px 40px', borderRadius:14, background:'linear-gradient(135deg,#f59e0b,#ef4444)', border:'none', color:'#000', fontWeight:900, fontSize:18, cursor:'pointer' }}>
        Connect Wallet
      </button>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'#030308', display:'flex', flexDirection:'column', fontFamily:'Inter, sans-serif' }}>

      {/* Top HUD */}
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 16px', background:'rgba(0,0,0,0.7)', backdropFilter:'blur(12px)', borderBottom:'1px solid rgba(255,255,255,0.07)', flexWrap:'wrap' }}>
        <div style={{ fontFamily:'Rajdhani, sans-serif', fontWeight:700, fontSize:20, color:'#f59e0b', letterSpacing:2 }}>⚔️ DOMINEX</div>
        <div style={{ flex:1 }} />
        {[
          { label:'💰 $DMX', val: gameState.dmx.toLocaleString() },
          { label:'🏰 Territories', val: playerTerr.length },
          { label:'⚔️ Army', val: playerTerr.reduce((s,t)=>s+t.army,0) },
          { label:'⛏️ Mine/5s', val: playerTerr.reduce((s,t)=>s+t.mining,0) },
        ].map(h => (
          <div key={h.label} style={{ background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.25)', borderRadius:10, padding:'6px 14px', textAlign:'center' }}>
            <div style={{ fontSize:11, color:'#94a3b8', fontWeight:600 }}>{h.label}</div>
            <div style={{ fontSize:16, fontWeight:800, color:'#f59e0b' }}>{h.val}</div>
          </div>
        ))}
        <div style={{ fontSize:12, color:'#64748b', fontFamily:'monospace' }}>{address?.slice(0,6)}...{address?.slice(-4)}</div>
      </div>

      {/* Main layout */}
      <div style={{ flex:1, display:'flex', overflow:'hidden', position:'relative' }}>

        {/* 3D Canvas */}
        <canvas ref={canvasRef} style={{ flex:1, display:'block', cursor:'grab', minHeight:400 }} />

        {/* Right Panel */}
        <div style={{ width:260, background:'rgba(3,3,8,0.92)', backdropFilter:'blur(16px)', borderLeft:'1px solid rgba(255,255,255,0.07)', display:'flex', flexDirection:'column', overflow:'hidden' }}>

          {/* Panel tabs */}
          <div style={{ display:'flex', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
            {[['map','🗺️'],['army','⚔️'],['log','📜']].map(([id,ic]) => (
              <button key={id} onClick={() => setPanel(id)} style={{ flex:1, padding:'10px 4px', border:'none', background: panel===id ? 'rgba(245,158,11,0.15)' : 'transparent', color: panel===id ? '#f59e0b' : '#64748b', fontWeight:700, fontSize:13, cursor:'pointer', borderBottom: panel===id ? '2px solid #f59e0b' : '2px solid transparent' }}>
                {ic} {id.charAt(0).toUpperCase()+id.slice(1)}
              </button>
            ))}
          </div>

          <div style={{ flex:1, overflowY:'auto', padding:14 }}>

            {/* MAP panel */}
            {panel === 'map' && (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                <div style={{ fontSize:12, color:'#64748b', fontWeight:700, textTransform:'uppercase', letterSpacing:1 }}>Legend</div>
                {[{color:'#f59e0b',label:'Your Territories'},{color:'#ef4444',label:'Enemy Territories'},{color:'#334155',label:'Neutral Zones'}].map(l => (
                  <div key={l.label} style={{ display:'flex', alignItems:'center', gap:8, fontSize:13 }}>
                    <div style={{ width:14, height:14, borderRadius:3, background:l.color, flexShrink:0 }} />
                    <span style={{ color:'#94a3b8' }}>{l.label}</span>
                  </div>
                ))}
                <div style={{ height:1, background:'rgba(255,255,255,0.06)', margin:'4px 0' }} />
                <div style={{ fontSize:12, color:'#64748b', fontWeight:700, textTransform:'uppercase', letterSpacing:1 }}>Stats</div>
                {[{k:'Your territories',v:playerTerr.length},{k:'Enemy territories',v:enemyTerr.length},{k:'Neutral',v:territories.length-playerTerr.length-enemyTerr.length}].map(s=>(
                  <div key={s.k} style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
                    <span style={{ color:'#64748b' }}>{s.k}</span>
                    <span style={{ fontWeight:700, color:'#f1f5f9' }}>{s.v}</span>
                  </div>
                ))}
                <div style={{ height:1, background:'rgba(255,255,255,0.06)', margin:'4px 0' }} />
                {/* Selected territory */}
                {selected && (
                  <div style={{ background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.25)', borderRadius:12, padding:12 }}>
                    <div style={{ fontWeight:800, fontSize:14, marginBottom:8, color: selected.type==='player'?'#f59e0b':selected.type==='enemy'?'#ef4444':'#94a3b8' }}>
                      {selected.type==='player'?'🏰 Your Territory':selected.type==='enemy'?'⚔️ Enemy Territory':'🌿 Neutral Zone'}
                    </div>
                    {[{k:'Level',v:selected.level},{k:'Army',v:selected.army},{k:'Mining',v:selected.mining+' DMX/5s'}].map(d=>(
                      <div key={d.k} style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:4 }}>
                        <span style={{ color:'#64748b' }}>{d.k}</span>
                        <span style={{ fontWeight:700, color:'#f1f5f9' }}>{d.v}</span>
                      </div>
                    ))}
                    {selected.type === 'enemy' && (
                      <button onClick={handleRaid} style={{ marginTop:10, width:'100%', padding:'10px', borderRadius:10, background:'linear-gradient(135deg,#ef4444,#991b1b)', border:'none', color:'#fff', fontWeight:800, fontSize:14, cursor:'pointer' }}>
                        ⚔️ RAID NOW
                      </button>
                    )}
                    {selected.type === 'neutral' && (
                      <button onClick={() => {
                        if (gameState.dmx < 200) return addLog('❌ Need 200 $DMX to claim!');
                        setGameState(g => ({ ...g, dmx: g.dmx - 200 }));
                        setTerritories(prev => prev.map(t => t.idx === selected.idx ? { ...t, type: 'player' } : t));
                        if (hexMeshes.current[selected.idx]) {
                          hexMeshes.current[selected.idx].material.color.setHex(TERRITORY_COLORS.player);
                          hexMeshes.current[selected.idx].material.emissive.setHex(0xf59e0b);
                          hexMeshes.current[selected.idx].userData.type = 'player';
                        }
                        addLog('🏰 Territory claimed for 200 $DMX!');
                        setSelected(null);
                      }} style={{ marginTop:10, width:'100%', padding:'10px', borderRadius:10, background:'linear-gradient(135deg,#f59e0b,#d97706)', border:'none', color:'#000', fontWeight:800, fontSize:14, cursor:'pointer' }}>
                        🏴 Claim (200 $DMX)
                      </button>
                    )}
                  </div>
                )}
                {!selected && <div style={{ fontSize:13, color:'#475569', textAlign:'center', marginTop:4 }}>Click a hex on the map to select it</div>}
              </div>
            )}

            {/* ARMY panel */}
            {panel === 'army' && (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                <div style={{ fontSize:12, color:'#64748b', fontWeight:700, textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>Hire Units</div>
                {UNIT_TYPES.map(u => (
                  <div key={u.name} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:12 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                      <span style={{ fontWeight:700, fontSize:14 }}>{u.icon} {u.name}</span>
                      <span style={{ fontSize:12, color:'#f59e0b', fontWeight:700 }}>{u.cost} $DMX</span>
                    </div>
                    <div style={{ fontSize:12, color:'#64748b', marginBottom:8 }}>Power: {u.power} ⚔️</div>
                    <button onClick={() => buyUnit(u)} style={{ width:'100%', padding:'7px', borderRadius:8, background: gameState.dmx >= u.cost ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'rgba(255,255,255,0.05)', border:'none', color: gameState.dmx >= u.cost ? '#000' : '#475569', fontWeight:700, fontSize:12, cursor:'pointer' }}>
                      Hire
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* LOG panel */}
            {panel === 'log' && (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <div style={{ fontSize:12, color:'#64748b', fontWeight:700, textTransform:'uppercase', letterSpacing:1 }}>Battle Log</div>
                {log.length === 0 && <div style={{ fontSize:13, color:'#475569', textAlign:'center', marginTop:12 }}>No activity yet. Start raiding!</div>}
                {log.map(l => (
                  <div key={l.id} style={{ background:'rgba(255,255,255,0.03)', borderRadius:10, padding:'8px 10px', fontSize:12 }}>
                    <div style={{ color:'#f1f5f9', lineHeight:1.5 }}>{l.msg}</div>
                    <div style={{ color:'#475569', fontSize:11, marginTop:3 }}>{l.time}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ padding:'10px 16px', background:'rgba(0,0,0,0.7)', backdropFilter:'blur(12px)', borderTop:'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
        <span style={{ fontSize:12, color:'#475569' }}>🖱️ Drag to rotate · Scroll to zoom · Click hex to select</span>
        <div style={{ flex:1 }} />
        <button onClick={() => addLog('⛏️ Manually mining...')} style={{ padding:'7px 18px', borderRadius:9, background:'rgba(245,158,11,0.15)', border:'1px solid rgba(245,158,11,0.3)', color:'#f59e0b', fontWeight:700, fontSize:13, cursor:'pointer' }}>⛏️ Mine</button>
        <button onClick={handleRaid} style={{ padding:'7px 18px', borderRadius:9, background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)', color:'#ef4444', fontWeight:700, fontSize:13, cursor:'pointer' }}>⚔️ Raid</button>
      </div>
    </div>
  );
}
