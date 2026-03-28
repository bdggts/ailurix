'use client';
import { useEffect, useRef, useState } from 'react';

var CHARS = [
  { id:'kael',   name:'KAEL',   title:'Dark Warrior',  color:'#f59e0b', hp:100, speed:7,  power:9,  defense:8,  rarity:'Common',    special:'Blade Cyclone',    moves:{punch:12,kick:18,special:45} },
  { id:'pyros',  name:'PYROS',  title:'Fire Mage',     color:'#ef4444', hp:85,  speed:8,  power:10, defense:6,  rarity:'Rare',      special:'Inferno Nova',     moves:{punch:10,kick:15,special:55} },
  { id:'vela',   name:'VELA',   title:'Ice Assassin',  color:'#06b6d4', hp:80,  speed:10, power:8,  defense:7,  rarity:'Epic',      special:'Frost Prison',     moves:{punch:11,kick:16,special:40} },
  { id:'zeus',   name:'ZEUS',   title:'Thunder God',   color:'#8b5cf6', hp:95,  speed:6,  power:10, defense:9,  rarity:'Legendary', special:'Thunder Judgement',moves:{punch:14,kick:20,special:60} },
  { id:'mortis', name:'MORTIS', title:'Death Reaper',  color:'#dc2626', hp:90,  speed:9,  power:10, defense:7,  rarity:'Mythic',    special:'Soul Rip',         moves:{punch:13,kick:19,special:70} },
];

// Sound effects via Web Audio API
var _sndCtx=null;
function getAudioCtx(){if(!_sndCtx)try{_sndCtx=new(window.AudioContext||window.webkitAudioContext)();}catch(e){}return _sndCtx;}
function playSound(type){
  var ac=getAudioCtx();if(!ac)return;
  var osc=ac.createOscillator(),g=ac.createGain(),n;
  osc.connect(g);g.connect(ac.destination);
  if(type==='punch'){osc.type='sawtooth';osc.frequency.setValueAtTime(200,ac.currentTime);osc.frequency.exponentialRampToValueAtTime(80,ac.currentTime+0.08);g.gain.setValueAtTime(0.25,ac.currentTime);g.gain.exponentialRampToValueAtTime(0.01,ac.currentTime+0.08);osc.start();osc.stop(ac.currentTime+0.08);n=ac.createOscillator();var g2=ac.createGain();n.connect(g2);g2.connect(ac.destination);n.type='square';n.frequency.value=90;g2.gain.setValueAtTime(0.15,ac.currentTime);g2.gain.exponentialRampToValueAtTime(0.01,ac.currentTime+0.06);n.start();n.stop(ac.currentTime+0.06);}
  else if(type==='kick'){osc.type='square';osc.frequency.setValueAtTime(120,ac.currentTime);osc.frequency.exponentialRampToValueAtTime(40,ac.currentTime+0.15);g.gain.setValueAtTime(0.3,ac.currentTime);g.gain.exponentialRampToValueAtTime(0.01,ac.currentTime+0.15);osc.start();osc.stop(ac.currentTime+0.15);}
  else if(type==='block'){osc.type='triangle';osc.frequency.setValueAtTime(800,ac.currentTime);osc.frequency.exponentialRampToValueAtTime(400,ac.currentTime+0.05);g.gain.setValueAtTime(0.12,ac.currentTime);g.gain.exponentialRampToValueAtTime(0.01,ac.currentTime+0.05);osc.start();osc.stop(ac.currentTime+0.05);}
  else if(type==='special'){osc.type='sawtooth';osc.frequency.setValueAtTime(100,ac.currentTime);osc.frequency.linearRampToValueAtTime(600,ac.currentTime+0.2);osc.frequency.linearRampToValueAtTime(50,ac.currentTime+0.5);g.gain.setValueAtTime(0.3,ac.currentTime);g.gain.exponentialRampToValueAtTime(0.01,ac.currentTime+0.5);osc.start();osc.stop(ac.currentTime+0.5);}
  else if(type==='hit'){osc.type='sawtooth';osc.frequency.setValueAtTime(300,ac.currentTime);osc.frequency.exponentialRampToValueAtTime(50,ac.currentTime+0.12);g.gain.setValueAtTime(0.2,ac.currentTime);g.gain.exponentialRampToValueAtTime(0.01,ac.currentTime+0.12);osc.start();osc.stop(ac.currentTime+0.12);}
  else if(type==='ko'){osc.type='sawtooth';osc.frequency.setValueAtTime(400,ac.currentTime);osc.frequency.exponentialRampToValueAtTime(30,ac.currentTime+0.8);g.gain.setValueAtTime(0.35,ac.currentTime);g.gain.exponentialRampToValueAtTime(0.01,ac.currentTime+0.8);osc.start();osc.stop(ac.currentTime+0.8);}
}

function drawChar(ctx, ch, x, groundY, dir, frame, state, atkType, atkFrame) {
  var s = dir > 0 ? 1 : -1;
  var bob = Math.sin(frame * 0.08) * 3;
  var lungeAmt = 0;
  if(state==='attack'&&atkFrame!==undefined){var af=Math.min(atkFrame,10)/10;lungeAmt=(atkType==='kick'?35:atkType==='special'?50:25)*s*Math.sin(af*Math.PI);}
  var blockSquash = state==='block'?0.85:1;
  ctx.save();
  ctx.translate(x + lungeAmt, groundY + bob);
  ctx.scale(1, blockSquash);
  var g, i, a, fx, scyX;
  if (ch.id === 'kael') {
    ctx.fillStyle = '#7c2d12';
    ctx.beginPath(); ctx.ellipse(0, -60, 24, 55, 0.2 * s, 0, Math.PI * 2); ctx.fill();
    g = ctx.createLinearGradient(-20, -85, 20, 0);
    g.addColorStop(0, '#f59e0b'); g.addColorStop(1, '#92400e');
    ctx.fillStyle = g; ctx.fillRect(-18, -85, 36, 55);
    ctx.fillStyle = '#fbbf24'; ctx.fillRect(-28, -87, 12, 20); ctx.fillRect(16, -87, 12, 20);
    ctx.fillStyle = '#1c1917'; ctx.beginPath(); ctx.arc(0, -95, 19, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f59e0b'; ctx.fillRect(-16, -106, 32, 9);
    ctx.fillStyle = '#292524'; ctx.fillRect(-14, -30, 12, 45); ctx.fillRect(2, -30, 12, 45);
    ctx.fillStyle = '#f59e0b'; ctx.fillRect(-14, 12, 12, 4); ctx.fillRect(2, 12, 12, 4);
    ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(16*s, -65); ctx.lineTo((state==='attack'?55:35)*s, -55); ctx.stroke();
    ctx.fillStyle = '#fbbf24'; ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.arc(-7, -97, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(7, -97, 3, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
  } else if (ch.id === 'pyros') {
    for (i = 0; i < 6; i++) {
      a = frame * 0.15 + i * 1.05;
      ctx.fillStyle = 'rgba(239,68,68,' + (0.12 + Math.sin(a) * 0.08) + ')';
      ctx.beginPath(); ctx.arc(Math.cos(a)*22, Math.sin(a)*28-45, 13, 0, Math.PI*2); ctx.fill();
    }
    g = ctx.createLinearGradient(-18,-85,18,20);
    g.addColorStop(0,'#7f1d1d'); g.addColorStop(1,'#450a0a');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(-20,-85); ctx.lineTo(-24,18); ctx.lineTo(24,18); ctx.lineTo(20,-85); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#f97316'; ctx.beginPath(); ctx.arc(-28*s,-42,12,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(28*s+(state==='attack'?20*s:0),-42,14,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#fef08a'; ctx.beginPath(); ctx.arc(-28*s,-42,7,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(28*s+(state==='attack'?20*s:0),-42,9,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#450a0a'; ctx.beginPath(); ctx.arc(0,-92,17,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#ef4444';
    for(i=-2;i<=2;i++){ctx.beginPath();ctx.moveTo(i*7,-112);ctx.lineTo(i*7-4,-100);ctx.lineTo(i*7+4,-100);ctx.fill();}
    ctx.fillStyle='#f97316'; ctx.shadowColor='#f97316'; ctx.shadowBlur=12;
    ctx.beginPath(); ctx.arc(-6,-93,4,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(6,-93,4,0,Math.PI*2); ctx.fill();
    ctx.shadowBlur=0;
  } else if (ch.id === 'vela') {
    ctx.strokeStyle='rgba(103,232,249,0.25)'; ctx.lineWidth=1;
    for(i=0;i<3;i++){ctx.beginPath();ctx.arc(0,-50,28+i*10+Math.sin(frame*0.1+i)*4,0,Math.PI*2);ctx.stroke();}
    g=ctx.createLinearGradient(-12,-85,12,10);
    g.addColorStop(0,'#155e75'); g.addColorStop(1,'#0e7490');
    ctx.fillStyle=g; ctx.fillRect(-13,-85,26,60);
    ctx.fillStyle='rgba(103,232,249,0.75)';
    [-9,-4,1,6,11].forEach(function(ox){ctx.beginPath();ctx.moveTo(ox,-58);ctx.lineTo(ox-4,-47);ctx.lineTo(ox+4,-47);ctx.fill();});
    ctx.fillStyle='#164e63'; ctx.fillRect(-12,-25,11,35); ctx.fillRect(1,-25,11,35);
    ctx.fillStyle='#083344'; ctx.beginPath(); ctx.arc(0,-95,15,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#e0f2fe'; ctx.fillRect(-15,-107,30,14);
    ctx.strokeStyle='#67e8f9'; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(-18*s,-58); ctx.lineTo(-16*s+(state==='attack'?30*s:10*s),-35); ctx.stroke();
    ctx.fillStyle='#67e8f9'; ctx.shadowColor='#67e8f9'; ctx.shadowBlur=10;
    ctx.beginPath(); ctx.arc(-5,-96,3.5,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(5,-96,3.5,0,Math.PI*2); ctx.fill();
    ctx.shadowBlur=0;
  } else if (ch.id === 'zeus') {
    ctx.strokeStyle='rgba(167,139,250,0.5)'; ctx.lineWidth=2;
    for(i=0;i<4;i++){a=frame*0.18+i*1.57;ctx.beginPath();ctx.moveTo(0,-50);ctx.lineTo(Math.cos(a)*40,-50+Math.sin(a)*40);ctx.stroke();}
    g=ctx.createLinearGradient(-24,-92,24,18);
    g.addColorStop(0,'#6d28d9'); g.addColorStop(1,'#4c1d95');
    ctx.fillStyle=g; ctx.fillRect(-24,-92,48,72);
    ctx.fillStyle='#7c3aed';
    ctx.beginPath(); ctx.arc(-30,-74,15,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(30,-74,15,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#3b0764'; ctx.fillRect(-20,-20,18,42); ctx.fillRect(2,-20,18,42);
    ctx.fillStyle='#2e1065'; ctx.beginPath(); ctx.arc(0,-102,22,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#fbbf24';
    for(i=0;i<5;i++){ctx.beginPath();ctx.moveTo(-12+i*6,-126);ctx.lineTo(-14+i*6,-112);ctx.lineTo(-10+i*6,-112);ctx.fill();}
    fx=(state==='attack'?52:38)*s;
    ctx.fillStyle='#8b5cf6'; ctx.beginPath(); ctx.arc(fx,-58,14,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#c4b5fd'; ctx.shadowColor='#8b5cf6'; ctx.shadowBlur=20;
    ctx.beginPath(); ctx.arc(fx,-58,7,0,Math.PI*2); ctx.fill();
    ctx.shadowBlur=0;
    ctx.fillStyle='#c4b5fd'; ctx.shadowColor='#c4b5fd'; ctx.shadowBlur=12;
    ctx.beginPath(); ctx.arc(-8,-103,4.5,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(8,-103,4.5,0,Math.PI*2); ctx.fill();
    ctx.shadowBlur=0;
  } else if (ch.id === 'mortis') {
    for(i=0;i<8;i++){a=frame*0.07+i*0.785;ctx.fillStyle='rgba(20,0,0,'+(0.18-i*0.018)+')';ctx.beginPath();ctx.arc(Math.cos(a)*38,-45+Math.sin(a)*28,11,0,Math.PI*2);ctx.fill();}
    ctx.fillStyle='#0f172a';
    ctx.beginPath();ctx.moveTo(-20,-88);ctx.lineTo(-26,18);ctx.lineTo(-10,2);ctx.lineTo(0,18);ctx.lineTo(10,2);ctx.lineTo(26,18);ctx.lineTo(20,-88);ctx.closePath();ctx.fill();
    ctx.fillStyle='#1e1b4b'; ctx.fillRect(-16,-88,32,58);
    ctx.fillStyle='#e7e5e4';
    [-12,0,12].forEach(function(ox){ctx.fillRect(ox,-72,9,13);});
    ctx.fillStyle='#0f172a'; ctx.beginPath(); ctx.arc(0,-98,19,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#dc2626'; ctx.shadowColor='#ef4444'; ctx.shadowBlur=18;
    ctx.beginPath(); ctx.arc(0,-102,4.5,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(-9,-96,3.5,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(9,-96,3.5,0,Math.PI*2); ctx.fill();
    ctx.shadowBlur=0;
    scyX=(state==='attack'?45:32)*s;
    ctx.strokeStyle='#64748b'; ctx.lineWidth=5;
    ctx.beginPath(); ctx.moveTo(scyX,-15); ctx.lineTo(scyX,-75); ctx.stroke();
    ctx.strokeStyle='#dc2626'; ctx.lineWidth=7; ctx.shadowColor='#dc2626'; ctx.shadowBlur=12;
    ctx.beginPath(); ctx.arc(scyX,-68,32,-2.4,-0.1); ctx.stroke();
    ctx.shadowBlur=0;
  }
  ctx.restore();
}

function makeParticle(x,y,color){return {x:x,y:y,color:color,vx:(Math.random()-0.5)*9,vy:-Math.random()*10-3,life:1,size:Math.random()*7+3};}
function updateParticle(p){p.x+=p.vx;p.y+=p.vy;p.vy+=0.4;p.life-=0.032;}
function drawParticle(ctx,p){ctx.save();ctx.globalAlpha=Math.max(0,p.life);ctx.fillStyle=p.color;ctx.shadowColor=p.color;ctx.shadowBlur=12;ctx.beginPath();ctx.arc(p.x,p.y,Math.max(0,p.size*p.life),0,Math.PI*2);ctx.fill();ctx.restore();}

export default function ArenaPage() {
  // containerRef points to a plain DIV - canvas is created IMPERATIVELY inside it
  var containerRef = useRef(null);
  var loopRef = useRef(null);

  var screenState = useState('select');
  var screen = screenState[0], setScreen = screenState[1];
  var p1State = useState(null);
  var p1Char = p1State[0], setP1Char = p1State[1];
  var p2State = useState(null);
  var p2Char = p2State[0], setP2Char = p2State[1];
  var stepState = useState(1);
  var step = stepState[0], setStep = stepState[1];
  var winState = useState(null);
  var winner = winState[0], setWinner = winState[1];
  var p1WState = useState(0), setP1Wins = p1WState[1];
  var p2WState = useState(0), setP2Wins = p2WState[1];
  var betState = useState(100);
  var betAmount = betState[0], setBetAmount = betState[1];
  var dmxState = useState(1250);
  var dmx = dmxState[0];
  var rkState = useState(0);
  var rematchKey = rkState[0], setRematchKey = rkState[1];

  // =====================================================================
  // GAME ENGINE - canvas created via document.createElement (not React)
  // This ensures React NEVER touches the canvas element
  // =====================================================================
  useEffect(function() {
    if (screen !== 'fight' || !p1Char || !p2Char) return;

    var container = containerRef.current;
    if (!container) return;

    // Create canvas OUTSIDE React
    var canvas = document.createElement('canvas');
    var W = window.innerWidth;
    var H = Math.max(200, window.innerHeight - 140);
    canvas.width = W;
    canvas.height = H;
    canvas.style.display = 'block';
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    canvas.style.background = '#14003a';

    // Clear container and append canvas
    container.innerHTML = '';
    container.appendChild(canvas);

    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var frame = 0, stopped = false, shake = 0, combo = 0, lastHitter = null;
    var gs = {
      p1: { char: p1Char, hp: p1Char.hp, energy: 0, state: 'idle', x: W*0.27, y: 0, vy: 0, atkType: '', atkFrame: 0, hitFlash: 0, combo: 0 },
      p2: { char: p2Char, hp: p2Char.hp, energy: 0, state: 'idle', x: W*0.73, y: 0, vy: 0, atkType: '', atkFrame: 0, hitFlash: 0, combo: 0 },
      particles: [], floats: [], time: 90, lastSec: Date.now(), over: false
    };

    function spawn(x,y,color,n){for(var i=0;i<(n||12);i++)gs.particles.push(makeParticle(x,y,color));}
    function floatDmg(x,y,dmg,color){gs.floats.push({x:x,y:y,dmg:dmg,color:color,life:1.2,vy:-2.5});}

    function doJump(p){if(p.y>=0&&p.state!=='attack'){p.vy=-14;playSound('block');}}
    function doMove(p,dir){if(p.state==='attack'||gs.over)return;p.x+=dir*6;p.x=Math.max(40,Math.min(W-40,p.x));}

    function attack(att,def,move){
      if(att.state!=='idle'||gs.over)return;
      if(move==='block'){att.state='block';playSound('block');setTimeout(function(){if(att.state==='block')att.state='idle';},480);return;}
      if(move==='special'&&att.energy<80)return;
      playSound(move);
      att.state='attack'; att.atkType=move; att.atkFrame=0;
      // Dash forward during attack
      var dashDir=att===gs.p1?1:-1;
      var dashAmt=move==='special'?40:move==='kick'?30:20;
      att.x=Math.max(40,Math.min(W-40,att.x+dashAmt*dashDir));
      // Range check — must be close enough to land hit
      var dist=Math.abs(att.x-def.x);
      var range=move==='special'?220:move==='kick'?160:120;
      if(dist>range){
        // MISS — too far away
        floatDmg((att.x+def.x)/2,H*0.7-60,'MISS!','#64748b');
        att.energy=Math.min(100,att.energy+2);
        setTimeout(function(){if(att.state==='attack')att.state='idle';},move==='special'?700:move==='kick'?420:280);
        return;
      }
      // HIT — in range
      var base=att.char.moves[move]||10;
      var blocked=def.state==='block';
      var dmg=Math.round(base*(0.8+att.char.power/25)*(blocked?0.18:1));
      if(move==='special')att.energy=0;
      def.hp=Math.max(0,def.hp-dmg);
      att.energy=Math.min(100,att.energy+(move==='punch'?8:move==='kick'?12:5));
      // Knockback
      var kb=blocked?3:(move==='special'?25:move==='kick'?15:10);
      var kbDir=att===gs.p1?1:-1;
      def.x=Math.max(40,Math.min(W-40,def.x+kb*kbDir));
      // Hit effects
      if(!blocked){def.hitFlash=8;shake=move==='special'?12:move==='kick'?6:4;playSound('hit');}
      // Combo
      if(lastHitter===att&&!blocked){att.combo++;combo=att.combo;}else{att.combo=1;combo=1;}
      lastHitter=att;
      var hitX=(att.x+def.x)/2;
      spawn(hitX,H*0.7+def.y-40,blocked?'#3b82f6':att.char.color,move==='special'?35:blocked?6:18);
      if(combo>=3)floatDmg(hitX,H*0.7+def.y-80,combo+'x COMBO!','#fbbf24');
      floatDmg(hitX,H*0.7+def.y-50,dmg,move==='special'?'#fbbf24':att.char.color);
      setTimeout(function(){if(att.state==='attack')att.state='idle';},move==='special'?700:move==='kick'?420:280);
    }

    var cpuT=0;
    function runCPU(){
      if(gs.p2.state!=='idle'||gs.over)return;
      cpuT++;if(cpuT<45)return;cpuT=0;
      var r=Math.random();
      if(gs.p2.energy>=80&&r<0.3)attack(gs.p2,gs.p1,'special');
      else if(r<0.45)attack(gs.p2,gs.p1,'punch');
      else if(r<0.75)attack(gs.p2,gs.p1,'kick');
      else{gs.p2.state='block';playSound('block');setTimeout(function(){if(gs.p2.state==='block')gs.p2.state='idle';},420);}
      // CPU movement: dodge or approach
      if(Math.random()<0.3){var cpuDir=gs.p2.x>gs.p1.x?1:-1;doMove(gs.p2,cpuDir);}
      if(Math.random()<0.15)doJump(gs.p2);
    }

    function onKey(e){
      if(gs.over)return;var k=e.key;
      if(k==='a'||k==='A')attack(gs.p1,gs.p2,'punch');
      if(k==='d'||k==='D')attack(gs.p1,gs.p2,'kick');
      if(k==='s'||k==='S')attack(gs.p1,gs.p2,'block');
      if(k==='w'||k==='W')attack(gs.p1,gs.p2,'special');
      if(k==='q'||k==='Q')doMove(gs.p1,-1);
      if(k==='e'||k==='E')doMove(gs.p1,1);
      if(k===' ')doJump(gs.p1);
      if(k==='ArrowLeft') attack(gs.p2,gs.p1,'punch');
      if(k==='ArrowRight')attack(gs.p2,gs.p1,'kick');
      if(k==='ArrowDown') attack(gs.p2,gs.p1,'block');
      if(k==='ArrowUp')   attack(gs.p2,gs.p1,'special');
    }
    window.addEventListener('keydown',onKey);
    window._dominexAttack=function(player,move){
      var p=player===1?gs.p1:gs.p2,d=player===1?gs.p2:gs.p1;
      if(move==='left')doMove(p,-1);
      else if(move==='right')doMove(p,1);
      else if(move==='jump')doJump(p);
      else attack(p,d,move);
    };

    function drawArena(){
      var sky=ctx.createLinearGradient(0,0,0,H);
      sky.addColorStop(0,'#14003a');sky.addColorStop(0.6,'#2a0828');sky.addColorStop(1,'#3a0a08');
      ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
      var i;
      for(i=0;i<80;i++){
        ctx.fillStyle='rgba(255,255,255,0.8)';
        ctx.beginPath();ctx.arc((i*137+43)%W,(i*97+17)%(H*0.6),i%5===0?2:1.2,0,Math.PI*2);ctx.fill();
      }
      var gnd=ctx.createLinearGradient(0,H*0.7,0,H);
      gnd.addColorStop(0,'#4a1a00');gnd.addColorStop(1,'#1a0600');
      ctx.fillStyle=gnd;ctx.fillRect(0,H*0.7,W,H*0.3);
      ctx.shadowColor='#f59e0b';ctx.shadowBlur=14;
      ctx.strokeStyle='#f59e0b';ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(0,H*0.7);ctx.lineTo(W,H*0.7);ctx.stroke();
      ctx.shadowBlur=0;
      [W*0.08,W*0.92].forEach(function(cx){
        var cg=ctx.createLinearGradient(cx-16,0,cx+16,0);
        cg.addColorStop(0,'#292524');cg.addColorStop(0.5,'#57534e');cg.addColorStop(1,'#292524');
        ctx.fillStyle=cg;ctx.fillRect(cx-16,H*0.28,32,H*0.42);
        ctx.fillStyle='#78716c';ctx.fillRect(cx-20,H*0.28,40,12);
        var fire=ctx.createRadialGradient(cx,H*0.28,2,cx,H*0.28,26);
        fire.addColorStop(0,'#fff7aa');fire.addColorStop(0.4,'#f97316');fire.addColorStop(1,'rgba(239,68,68,0)');
        ctx.fillStyle=fire;
        ctx.beginPath();ctx.arc(cx,H*0.28+Math.sin(frame*0.15)*4,26,0,Math.PI*2);ctx.fill();
      });
    }

    function drawHUD(){
      var BAR=W*0.34,BH=24,M=12;
      ctx.fillStyle='rgba(0,0,0,0.75)';ctx.fillRect(M,M,BAR,BH);
      var p1p=gs.p1.hp/gs.p1.char.hp;
      ctx.fillStyle=p1p>0.5?'#22c55e':p1p>0.25?'#f59e0b':'#ef4444';
      ctx.fillRect(M,M,BAR*p1p,BH);
      ctx.strokeStyle='rgba(255,255,255,0.2)';ctx.lineWidth=1;ctx.strokeRect(M,M,BAR,BH);
      ctx.fillStyle='white';ctx.font='bold 12px Inter,sans-serif';ctx.textAlign='left';
      ctx.fillText(gs.p1.char.name+'  '+gs.p1.hp+'/'+gs.p1.char.hp,M+6,M+16);
      ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(M,M+BH+4,BAR*0.55,8);
      ctx.fillStyle='#8b5cf6';ctx.fillRect(M,M+BH+4,(gs.p1.energy/100)*BAR*0.55,8);
      var p2b=W-M-BAR;
      ctx.fillStyle='rgba(0,0,0,0.75)';ctx.fillRect(p2b,M,BAR,BH);
      var p2p=gs.p2.hp/gs.p2.char.hp;
      ctx.fillStyle=p2p>0.5?'#22c55e':p2p>0.25?'#f59e0b':'#ef4444';
      ctx.fillRect(p2b+BAR*(1-p2p),M,BAR*p2p,BH);
      ctx.strokeStyle='rgba(255,255,255,0.2)';ctx.lineWidth=1;ctx.strokeRect(p2b,M,BAR,BH);
      ctx.fillStyle='white';ctx.font='bold 12px Inter,sans-serif';ctx.textAlign='right';
      ctx.fillText(gs.p2.hp+'/'+gs.p2.char.hp+'  '+gs.p2.char.name,W-M-6,M+16);
      ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(W-M-BAR*0.55,M+BH+4,BAR*0.55,8);
      ctx.fillStyle='#8b5cf6';ctx.fillRect(W-M-(gs.p2.energy/100)*BAR*0.55,M+BH+4,(gs.p2.energy/100)*BAR*0.55,8);
      ctx.font='bold 24px Rajdhani,Inter,sans-serif';
      ctx.fillStyle=gs.time<=10?'#ef4444':'#f59e0b';
      ctx.textAlign='center';ctx.fillText(String(gs.time),W/2,M+22);
    }

    function loop(){
      if(stopped)return;
      frame++;
      // Physics: gravity + walk toward
      [gs.p1,gs.p2].forEach(function(p){p.vy+=0.8;p.y=Math.min(0,p.y+p.vy);if(p.y>=0){p.y=0;p.vy=0;}if(p.atkFrame<30)p.atkFrame++;if(p.hitFlash>0)p.hitFlash--;});
      // Auto walk toward each other slowly
      if(!gs.over&&gs.p1.state==='idle'&&Math.abs(gs.p1.x-gs.p2.x)>120){gs.p1.x+=gs.p1.x<gs.p2.x?1.2:-1.2;}
      if(!gs.over&&gs.p2.state==='idle'&&Math.abs(gs.p1.x-gs.p2.x)>120){gs.p2.x+=gs.p2.x<gs.p1.x?1.2:-1.2;}
      // Screen shake decay
      if(shake>0)shake*=0.85;
      try {
        ctx.save();
        if(shake>0.5){ctx.translate(Math.random()*shake-shake/2,Math.random()*shake-shake/2);}
        ctx.clearRect(-10,-10,W+20,H+20);
        drawArena();
        // Hit flash on characters
        if(gs.p1.hitFlash>0){ctx.save();ctx.globalAlpha=0.5;ctx.fillStyle='#ffffff';ctx.fillRect(gs.p1.x-30,H*0.7+gs.p1.y-120,60,130);ctx.restore();}
        if(gs.p2.hitFlash>0){ctx.save();ctx.globalAlpha=0.5;ctx.fillStyle='#ffffff';ctx.fillRect(gs.p2.x-30,H*0.7+gs.p2.y-120,60,130);ctx.restore();}
        drawChar(ctx,gs.p1.char,gs.p1.x,H*0.7+gs.p1.y,1,frame,gs.p1.state,gs.p1.atkType,gs.p1.atkFrame);
        drawChar(ctx,gs.p2.char,gs.p2.x,H*0.7+gs.p2.y,-1,frame,gs.p2.state,gs.p2.atkType,gs.p2.atkFrame);
        // Combo display
        if(combo>=2&&lastHitter){ctx.save();ctx.font='bold 36px Rajdhani,sans-serif';ctx.fillStyle='#fbbf24';ctx.textAlign='center';ctx.shadowColor='#f59e0b';ctx.shadowBlur=20;ctx.fillText(combo+'x COMBO',W/2,H*0.35);ctx.restore();}
        gs.particles=gs.particles.filter(function(p){updateParticle(p);drawParticle(ctx,p);return p.life>0;});
        gs.floats.forEach(function(f){
          f.y+=f.vy;f.life-=0.022;
          ctx.save();ctx.globalAlpha=Math.max(0,f.life);
          ctx.fillStyle=f.color;ctx.shadowColor=f.color;ctx.shadowBlur=8;
          ctx.font='bold '+(20+Math.round((1.2-f.life)*4))+'px Rajdhani,Inter';
          ctx.textAlign='center';ctx.fillText('-'+f.dmg,f.x,f.y);ctx.restore();
        });
        gs.floats=gs.floats.filter(function(f){return f.life>0;});
        drawHUD();runCPU();
        ctx.restore();
      } catch(err) {
        ctx.restore();
      }
      if(Date.now()-gs.lastSec>=1000){gs.time--;gs.lastSec=Date.now();}
      if(!gs.over&&(gs.p1.hp<=0||gs.p2.hp<=0||gs.time<=0)){
        gs.over=true;
        playSound('ko');
        clearInterval(loopRef.current);
        window.removeEventListener('keydown',onKey);
        var w=gs.p1.hp>gs.p2.hp?'P1':gs.p2.hp>gs.p1.hp?'P2':'DRAW';
        if(w==='P1')setP1Wins(function(v){return v+1;});
        if(w==='P2')setP2Wins(function(v){return v+1;});
        ctx.clearRect(0,0,W,H);drawArena();
        drawChar(ctx,gs.p1.char,gs.p1.x,H*0.7+gs.p1.y,1,frame,gs.p1.hp<=0?'hurt':'idle','',0);
        drawChar(ctx,gs.p2.char,gs.p2.x,H*0.7+gs.p2.y,-1,frame,gs.p2.hp<=0?'hurt':'idle','',0);
        drawHUD();
        var fl=0;
        var fi=setInterval(function(){ctx.fillStyle='rgba(255,255,255,'+(Math.max(0,0.6-fl*0.12))+')';ctx.fillRect(0,0,W,H);fl++;if(fl>5)clearInterval(fi);},80);
        setTimeout(function(){
          ctx.fillStyle='rgba(0,0,0,0.85)';ctx.fillRect(0,0,W,H);
          ctx.textAlign='center';
          var koT=gs.p1.hp<=0||gs.p2.hp<=0?'K.O.':'TIME!';
          ctx.font='bold 80px Rajdhani,Inter,sans-serif';
          ctx.fillStyle='#ef4444';ctx.shadowColor='#ef4444';ctx.shadowBlur=45;
          ctx.fillText(koT,W/2,H/2-10);ctx.shadowBlur=0;
          ctx.font='bold 32px Rajdhani,Inter,sans-serif';ctx.fillStyle='white';
          var winName=w==='P1'?gs.p1.char.name:w==='P2'?gs.p2.char.name:'';
          ctx.fillText(w==='DRAW'?'DRAW!':winName+' WINS!',W/2,H/2+45);
          ctx.font='18px Inter,sans-serif';ctx.fillStyle='#f59e0b';
          ctx.fillText(w==='P1'?'+'+betAmount+' $DMX earned':w==='P2'?'-'+betAmount+' $DMX lost':'',W/2,H/2+85);
          setTimeout(function(){setWinner(w);},2200);
        },500);
      }
    }

    loopRef.current = setInterval(loop, 16);

    return function(){
      stopped = true;
      clearInterval(loopRef.current);
      window.removeEventListener('keydown', onKey);
      delete window._dominexAttack;
      if (container) container.innerHTML = '';
    };
  }, [screen, p1Char, p2Char, rematchKey]);

  // ---- SELECT SCREEN ----
  if(screen==='select'){
    return (
      <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#030308,#0a0005)',color:'white',fontFamily:'Inter,sans-serif',display:'flex',flexDirection:'column',alignItems:'center',padding:'28px 16px'}}>
        <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:44,fontWeight:700,color:'#f59e0b',letterSpacing:3,marginBottom:4,textShadow:'0 0 30px rgba(245,158,11,0.5)'}}>DOMINEX ARENA</div>
        <div style={{color:'#64748b',marginBottom:28,fontSize:15}}>{step===1?'PLAYER 1 - Choose Your Fighter':'PLAYER 2 - Choose Your Fighter'}</div>
        {p1Char&&step===2?<div style={{marginBottom:16,fontSize:14,color:'#94a3b8'}}>P1: <span style={{color:p1Char.color,fontWeight:800}}>{p1Char.name}</span> vs ???</div>:null}
        <div style={{display:'flex',gap:14,flexWrap:'wrap',justifyContent:'center',maxWidth:920}}>
          {CHARS.map(function(c){
            var lbl=c.id==='kael'?'[K]':c.id==='pyros'?'[P]':c.id==='vela'?'[V]':c.id==='zeus'?'[Z]':'[M]';
            return (
              <div key={c.id} onClick={function(){if(step===1){setP1Char(c);setStep(2);}else{setP2Char(c);setScreen('fight');}}}
                style={{width:162,padding:'20px 14px 16px',borderRadius:20,textAlign:'center',cursor:'pointer',background:'rgba(255,255,255,0.03)',backdropFilter:'blur(10px)',border:'2px solid rgba(255,255,255,0.08)',boxShadow:'0 0 24px '+c.color+'40',transition:'all .2s'}}>
                <div style={{fontSize:52,marginBottom:10}}>{lbl}</div>
                <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:22,fontWeight:700,color:c.color,letterSpacing:1}}>{c.name}</div>
                <div style={{fontSize:11,color:'#64748b',marginBottom:12}}>{c.title}</div>
                <div style={{display:'flex',flexDirection:'column',gap:5}}>
                  {[['PWR',c.power],['SPD',c.speed],['DEF',c.defense]].map(function(pair){
                    return (<div key={pair[0]} style={{display:'flex',alignItems:'center',gap:6}}>
                      <span style={{fontSize:10,color:'#64748b',width:26,textAlign:'right'}}>{pair[0]}</span>
                      <div style={{flex:1,height:6,background:'#1e293b',borderRadius:3,overflow:'hidden'}}><div style={{width:pair[1]*10+'%',height:'100%',background:c.color,borderRadius:3}}></div></div>
                    </div>);
                  })}
                </div>
                <div style={{marginTop:12,display:'inline-block',padding:'3px 10px',borderRadius:6,background:c.color+'22',color:c.color,fontWeight:700,fontSize:11}}>{c.rarity}</div>
                <div style={{marginTop:6,fontSize:10,color:'#475569'}}>Special: {c.special}</div>
              </div>
            );
          })}
        </div>
        <div style={{marginTop:28,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:16,padding:'16px 28px',textAlign:'center'}}>
          <div style={{fontWeight:700,color:'#f59e0b',marginBottom:6,fontSize:14}}>Match Bet</div>
          <div style={{display:'flex',gap:10,justifyContent:'center',marginBottom:8}}>
            {[50,100,250,500].map(function(a){return <button key={a} onClick={function(){setBetAmount(a);}} style={{padding:'7px 16px',borderRadius:8,border:'1.5px solid '+(betAmount===a?'#f59e0b':'rgba(255,255,255,0.1)'),background:betAmount===a?'rgba(245,158,11,0.2)':'transparent',color:betAmount===a?'#f59e0b':'#64748b',fontWeight:700,cursor:'pointer',fontSize:13}}>{a} $DMX</button>;})}
          </div>
          <div style={{fontSize:12,color:'#475569'}}>Balance: <strong style={{color:'#f59e0b'}}>{dmx.toLocaleString()} $DMX</strong></div>
        </div>
      </div>
    );
  }

  // ---- WINNER SCREEN ----
  if(winner){
    var wc=winner==='P1'?p1Char:winner==='P2'?p2Char:null;
    return (
      <div style={{minHeight:'100vh',background:'#030308',color:'white',fontFamily:'Inter,sans-serif',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:16}}>
        <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:72,fontWeight:900,color:wc?wc.color:'#64748b'}}>{winner==='DRAW'?'DRAW!':wc.name+' WINS!'}</div>
        <div style={{fontSize:16,color:'#64748b'}}>{winner==='P1'?'+'+betAmount+' $DMX earned!':winner==='P2'?'-'+betAmount+' $DMX lost':'No $DMX exchanged'}</div>
        <div style={{display:'flex',gap:12,marginTop:16}}>
          <button onClick={function(){setWinner(null);setRematchKey(function(k){return k+1;});}} style={{padding:'14px 36px',borderRadius:12,background:'linear-gradient(135deg,#f59e0b,#ef4444)',border:'none',color:'#000',fontWeight:900,fontSize:17,cursor:'pointer'}}>Rematch</button>
          <button onClick={function(){clearInterval(loopRef.current);setScreen('select');setP1Char(null);setP2Char(null);setStep(1);setWinner(null);setP1Wins(0);setP2Wins(0);setRematchKey(0);}} style={{padding:'14px 36px',borderRadius:12,background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.12)',color:'white',fontWeight:700,fontSize:17,cursor:'pointer'}}>New Match</button>
        </div>
      </div>
    );
  }

  // ---- FIGHT SCREEN ----
  var btnS={padding:'8px 6px',borderRadius:8,background:'rgba(0,0,0,0.7)',fontWeight:800,fontSize:10,cursor:'pointer',minWidth:42,textAlign:'center',touchAction:'manipulation'};
  return (
    <div style={{height:'100vh',background:'#030308',display:'flex',flexDirection:'column',userSelect:'none',overflow:'hidden'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'6px 12px',background:'rgba(0,0,0,0.85)',borderBottom:'1px solid rgba(255,255,255,0.07)',flexShrink:0,height:36}}>
        <span style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:16,color:'#f59e0b',letterSpacing:2}}>DOMINEX ARENA</span>
        <span style={{fontSize:10,color:'#475569'}}>Q/E=Move Space=Jump WASD=Attack</span>
        <button onClick={function(){clearInterval(loopRef.current);setScreen('select');setP1Char(null);setP2Char(null);setStep(1);setWinner(null);}} style={{padding:'4px 12px',borderRadius:8,background:'rgba(239,68,68,0.15)',border:'1px solid rgba(239,68,68,0.3)',color:'#ef4444',fontWeight:700,cursor:'pointer',fontSize:12}}>Quit</button>
      </div>
      <div ref={containerRef} style={{flexGrow:1,flexShrink:1,minHeight:0,overflow:'hidden',background:'#14003a'}} />
      <div style={{display:'flex',justifyContent:'space-between',padding:'6px 6px',background:'rgba(0,0,0,0.95)',borderTop:'1px solid rgba(255,255,255,0.07)',gap:4,flexShrink:0}}>
        <div style={{display:'flex',flexDirection:'column',gap:4}}>
          <div style={{display:'flex',gap:3}}>
            <button onPointerDown={function(){if(window._dominexAttack)window._dominexAttack(1,'left');}} style={Object.assign({},btnS,{border:'2px solid #a855f7',color:'#a855f7'})}>{'<'}</button>
            <button onPointerDown={function(){if(window._dominexAttack)window._dominexAttack(1,'jump');}} style={Object.assign({},btnS,{border:'2px solid #a855f7',color:'#a855f7'})}>Jump</button>
            <button onPointerDown={function(){if(window._dominexAttack)window._dominexAttack(1,'right');}} style={Object.assign({},btnS,{border:'2px solid #a855f7',color:'#a855f7'})}>{'>'}</button>
          </div>
          <div style={{display:'flex',gap:3}}>
            {[['punch','Punch','#22c55e'],['kick','Kick','#f59e0b'],['block','Block','#3b82f6'],['special','Spcl','#ef4444']].map(function(arr){
              return <button key={arr[0]} onPointerDown={function(){if(window._dominexAttack)window._dominexAttack(1,arr[0]);}} style={Object.assign({},btnS,{border:'2px solid '+arr[2],color:arr[2]})}>{arr[1]}</button>;
            })}
          </div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:4}}>
          <div style={{display:'flex',gap:3}}>
            <button onPointerDown={function(){if(window._dominexAttack)window._dominexAttack(2,'left');}} style={Object.assign({},btnS,{border:'2px solid #a855f7',color:'#a855f7'})}>{'<'}</button>
            <button onPointerDown={function(){if(window._dominexAttack)window._dominexAttack(2,'jump');}} style={Object.assign({},btnS,{border:'2px solid #a855f7',color:'#a855f7'})}>Jump</button>
            <button onPointerDown={function(){if(window._dominexAttack)window._dominexAttack(2,'right');}} style={Object.assign({},btnS,{border:'2px solid #a855f7',color:'#a855f7'})}>{'>'}</button>
          </div>
          <div style={{display:'flex',gap:3}}>
            {[['punch','Punch','#22c55e'],['kick','Kick','#f59e0b'],['block','Block','#3b82f6'],['special','Spcl','#ef4444']].map(function(arr){
              return <button key={arr[0]} onPointerDown={function(){if(window._dominexAttack)window._dominexAttack(2,arr[0]);}} style={Object.assign({},btnS,{border:'2px solid '+arr[2],color:arr[2]})}>{arr[1]}</button>;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
