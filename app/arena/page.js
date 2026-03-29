'use client';
import { useEffect, useRef, useState } from 'react';

var CHARS = [
  { id:'scorpion', name:'SCORPION',   title:'Hell Ninja',     color:'#f59e0b', hp:100, speed:8,  power:9,  defense:7,  rarity:'Common',    special:'Spear Pull',       moves:{punch:12,kick:18,special:48}, img:'/chars/scorpion.png', emoji:'🔥' },
  { id:'subzero',  name:'SUB-ZERO',   title:'Ice Warrior',    color:'#38bdf8', hp:95,  speed:7,  power:8,  defense:9,  rarity:'Common',    special:'Ice Freeze',       moves:{punch:11,kick:16,special:44}, img:'/chars/subzero.png', emoji:'❄️' },
  { id:'liukang',  name:'LIU KANG',   title:'Shaolin Monk',   color:'#ef4444', hp:90,  speed:9,  power:9,  defense:7,  rarity:'Rare',      special:'Flying Kick',      moves:{punch:10,kick:20,special:52}, img:'/chars/liukang.png', emoji:'🥋' },
  { id:'raiden',   name:'RAIDEN',     title:'Thunder God',    color:'#8b5cf6', hp:95,  speed:6,  power:10, defense:9,  rarity:'Legendary', special:'Lightning Bolt',   moves:{punch:14,kick:20,special:60}, img:'/chars/raiden.png', emoji:'⚡' },
  { id:'reptile',  name:'REPTILE',    title:'Hidden Fighter', color:'#22c55e', hp:88,  speed:9,  power:8,  defense:7,  rarity:'Rare',      special:'Acid Spit',        moves:{punch:11,kick:17,special:42}, img:'/chars/reptile.png', emoji:'🦎' },
  { id:'kitana',   name:'KITANA',     title:'Fan Assassin',   color:'#06b6d4', hp:85,  speed:10, power:8,  defense:6,  rarity:'Epic',      special:'Fan Throw',        moves:{punch:10,kick:16,special:46}, img:'/chars/kitana.png', emoji:'🪭' },
  { id:'mileena',  name:'MILEENA',    title:'Evil Twin',      color:'#f472b6', hp:82,  speed:10, power:9,  defense:5,  rarity:'Rare',      special:'Sai Throw',        moves:{punch:11,kick:17,special:50}, emoji:'🗡️' },
  { id:'jaxon',    name:'JAXON',      title:'Metal Arms',     color:'#78716c', hp:110, speed:5,  power:10, defense:10, rarity:'Epic',      special:'Ground Pound',     moves:{punch:16,kick:22,special:50}, emoji:'🦾' },
  { id:'baraka',   name:'BARAKA',     title:'Blade Fighter',  color:'#fb923c', hp:92,  speed:7,  power:10, defense:8,  rarity:'Epic',      special:'Blade Fury',       moves:{punch:13,kick:19,special:55}, emoji:'⚔️' },
  { id:'smoke',    name:'SMOKE',      title:'Gray Ninja',     color:'#a78bfa', hp:80,  speed:10, power:9,  defense:5,  rarity:'Rare',      special:'Smoke Screen',     moves:{punch:10,kick:15,special:48}, emoji:'💨' },
  { id:'cyrax',    name:'CYRAX',      title:'Yellow Robot',   color:'#a3e635', hp:88,  speed:8,  power:8,  defense:8,  rarity:'Common',    special:'Net Trap',         moves:{punch:11,kick:16,special:44}, emoji:'🤖' },
  { id:'sektor',   name:'SEKTOR',     title:'Red Robot',      color:'#dc2626', hp:90,  speed:8,  power:9,  defense:8,  rarity:'Epic',      special:'Missile Launch',   moves:{punch:12,kick:18,special:52}, emoji:'🚀' },
  { id:'kunglao',  name:'KUNG LAO',   title:'Hat Fighter',    color:'#fafafa', hp:88,  speed:9,  power:8,  defense:7,  rarity:'Legendary', special:'Hat Throw',        moves:{punch:11,kick:17,special:46}, emoji:'🎩' },
  { id:'nightwolf',name:'NIGHTWOLF',  title:'Spirit Warrior', color:'#84cc16', hp:92,  speed:7,  power:9,  defense:8,  rarity:'Mythic',    special:'Spirit Arrow',     moves:{punch:12,kick:18,special:50}, emoji:'🏹' },
  { id:'noob',     name:'NOOB SAIBOT',title:'Dark Shadow',    color:'#64748b', hp:85,  speed:9,  power:10, defense:6,  rarity:'Mythic',    special:'Shadow Tackle',    moves:{punch:13,kick:19,special:58}, emoji:'👤' },
  { id:'goro',     name:'GORO',       title:'Four Arms Beast', color:'#f59e0b', hp:200, speed:6,  power:10, defense:10, rarity:'BOSS',      special:'Stomp Quake',      moves:{punch:18,kick:28,special:80}, emoji:'👹' },
];

// Voice announcer using speechSynthesis
var _voiceReady=false;
function announceVoice(text){
  try{
    if(typeof window==='undefined'||!window.speechSynthesis)return;
    window.speechSynthesis.cancel();
    var u=new SpeechSynthesisUtterance(text);
    u.rate=0.8;u.pitch=0.4;u.volume=1;
    var voices=window.speechSynthesis.getVoices();
    if(voices&&voices.length){
      var deep=voices.find(function(v){return v.name.indexOf('Male')>-1||v.name.indexOf('David')>-1||v.name.indexOf('Google')>-1;});
      if(deep)u.voice=deep;
    }
    window.speechSynthesis.speak(u);
  }catch(e){}
}

// Background fight music (procedural)
var _bgOsc=null,_bgGain=null;
function startBGMusic(){
  try{
    var ac=getAudioCtx();if(!ac||_bgOsc)return;
    _bgOsc=ac.createOscillator();_bgGain=ac.createGain();
    var f=ac.createBiquadFilter();f.type='lowpass';f.frequency.value=200;
    _bgOsc.type='sawtooth';_bgOsc.frequency.value=55;
    _bgGain.gain.value=0.06;
    _bgOsc.connect(f);f.connect(_bgGain);_bgGain.connect(ac.destination);
    _bgOsc.start();
    // Rhythmic volume modulation
    var now=ac.currentTime;
    for(var i=0;i<200;i++){
      _bgGain.gain.setValueAtTime(0.06,now+i*0.5);
      _bgGain.gain.setValueAtTime(0.10,now+i*0.5+0.1);
      _bgGain.gain.setValueAtTime(0.04,now+i*0.5+0.25);
    }
  }catch(e){}
}
function stopBGMusic(){
  try{if(_bgOsc){_bgOsc.stop();_bgOsc=null;_bgGain=null;}}catch(e){_bgOsc=null;_bgGain=null;}
}

// Sound effects via Web Audio API
var _sndCtx=null;
function getAudioCtx(){
  if(!_sndCtx)try{
    _sndCtx=new(window.AudioContext||window.webkitAudioContext)();
    if(_sndCtx.state==='suspended')_sndCtx.resume().catch(function(){});
  }catch(e){}
  return _sndCtx;
}
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
  else if(type==='fight'){osc.type='square';osc.frequency.setValueAtTime(300,ac.currentTime);osc.frequency.linearRampToValueAtTime(600,ac.currentTime+0.15);osc.frequency.setValueAtTime(400,ac.currentTime+0.2);osc.frequency.linearRampToValueAtTime(800,ac.currentTime+0.35);g.gain.setValueAtTime(0.3,ac.currentTime);g.gain.exponentialRampToValueAtTime(0.01,ac.currentTime+0.4);osc.start();osc.stop(ac.currentTime+0.4);}
  else if(type==='finish'){osc.type='sawtooth';osc.frequency.setValueAtTime(200,ac.currentTime);osc.frequency.linearRampToValueAtTime(100,ac.currentTime+0.3);osc.frequency.linearRampToValueAtTime(400,ac.currentTime+0.6);g.gain.setValueAtTime(0.3,ac.currentTime);g.gain.exponentialRampToValueAtTime(0.01,ac.currentTime+0.7);osc.start();osc.stop(ac.currentTime+0.7);}
  else if(type==='round'){osc.type='triangle';osc.frequency.setValueAtTime(523,ac.currentTime);osc.frequency.setValueAtTime(659,ac.currentTime+0.1);osc.frequency.setValueAtTime(784,ac.currentTime+0.2);g.gain.setValueAtTime(0.2,ac.currentTime);g.gain.exponentialRampToValueAtTime(0.01,ac.currentTime+0.35);osc.start();osc.stop(ac.currentTime+0.35);}
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
  if (ch.id === 'scorpion') {
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
  } else if (ch.id === 'liukang') {
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
  } else if (ch.id === 'kitana') {
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
  } else if (ch.id === 'raiden') {
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
  } else if (ch.id === 'noob') {
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
  } else {
    // Generic fighter drawing for all other characters
    var bodyG=ctx.createLinearGradient(-18,-85,18,10);
    bodyG.addColorStop(0,ch.color); bodyG.addColorStop(1,'#1e1b4b');
    ctx.fillStyle=bodyG; ctx.fillRect(-18,-85,36,60);
    ctx.fillStyle=ch.color+'88';
    ctx.beginPath(); ctx.arc(-24,-60,12,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(24+(state==='attack'?18*s:0),-60,12,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#1a1a2e'; ctx.fillRect(-14,-25,12,38); ctx.fillRect(2,-25,12,38);
    ctx.fillStyle=ch.color+'44'; ctx.fillRect(-14,10,12,4); ctx.fillRect(2,10,12,4);
    ctx.fillStyle='#0f0f23'; ctx.beginPath(); ctx.arc(0,-95,17,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=ch.color; ctx.shadowColor=ch.color; ctx.shadowBlur=14;
    ctx.beginPath(); ctx.arc(-6,-96,3.5,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(6,-96,3.5,0,Math.PI*2); ctx.fill();
    ctx.shadowBlur=0;
    if(ch.id==='goro'){
      // Dragon wings
      ctx.fillStyle=ch.color+'66';
      ctx.beginPath();ctx.moveTo(-20,-80);ctx.lineTo(-55,-110);ctx.lineTo(-45,-60);ctx.closePath();ctx.fill();
      ctx.beginPath();ctx.moveTo(20,-80);ctx.lineTo(55,-110);ctx.lineTo(45,-60);ctx.closePath();ctx.fill();
      // Dragon horns
      ctx.fillStyle='#ef4444';
      ctx.beginPath();ctx.moveTo(-10,-112);ctx.lineTo(-18,-135);ctx.lineTo(-4,-115);ctx.fill();
      ctx.beginPath();ctx.moveTo(10,-112);ctx.lineTo(18,-135);ctx.lineTo(4,-115);ctx.fill();
      // Fire breath during attack
      if(state==='attack'){ctx.fillStyle='rgba(239,68,68,0.6)';ctx.beginPath();ctx.arc(40*s,-75,20+Math.sin(frame*0.3)*8,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='rgba(251,191,36,0.5)';ctx.beginPath();ctx.arc(55*s,-75,12+Math.sin(frame*0.5)*5,0,Math.PI*2);ctx.fill();}
    }
    // Weapon glow
    ctx.strokeStyle=ch.color; ctx.lineWidth=4; ctx.shadowColor=ch.color; ctx.shadowBlur=10;
    ctx.beginPath(); ctx.moveTo(18*s,-65); ctx.lineTo((state==='attack'?50:32)*s,-50); ctx.stroke();
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
  var stageState = useState(1);
  var stage = stageState[0], setStage = stageState[1];

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
    canvas.style.background = stage>=13?'#3a0000':stage>=10?'#1a0040':stage>=7?'#001428':stage>=4?'#001a14':'#14003a';

    // Clear container and append canvas
    container.innerHTML = '';
    container.appendChild(canvas);

    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var frame = 0, stopped = false, shake = 0, combo = 0, lastHitter = null;
    var roundNum = 1, p1Rounds = 0, p2Rounds = 0, roundOver = false, roundAnnounce = 0;
    var cpuSpeed = Math.max(15, 45 - stage * 5); // CPU reacts faster at higher stages
    var cpuDmgMult = 1 + (stage - 1) * 0.12; // CPU hits harder
    var gs = {
      p1: { char: p1Char, hp: p1Char.hp, energy: 0, state: 'idle', x: W*0.27, y: 0, vy: 0, atkType: '', atkFrame: 0, hitFlash: 0, combo: 0 },
      p2: { char: p2Char, hp: Math.round(p2Char.hp*(1+(stage-1)*0.1)), energy: 0, state: 'idle', x: W*0.73, y: 0, vy: 0, atkType: '', atkFrame: 0, hitFlash: 0, combo: 0 },
      particles: [], floats: [], time: 99, lastSec: Date.now(), over: false
    };
    var p2MaxHp = gs.p2.hp;

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
      if(combo===5){floatDmg(hitX,H*0.7+def.y-110,'TOASTY!','#ef4444');announceVoice('Excellent');}
      floatDmg(hitX,H*0.7+def.y-50,dmg,move==='special'?'#fbbf24':att.char.color);
      setTimeout(function(){if(att.state==='attack')att.state='idle';},move==='special'?700:move==='kick'?420:280);
    }

    var cpuT=0;
    function runCPU(){
      if(gs.p2.state!=='idle'||gs.over||roundOver)return;
      cpuT++;if(cpuT<cpuSpeed)return;cpuT=0;
      var dist=Math.abs(gs.p1.x-gs.p2.x);
      var r=Math.random();
      // Smarter CPU at higher stages: approach if far, block more, use specials
      if(dist>160){doMove(gs.p2,gs.p2.x>gs.p1.x?-1:1);if(r<0.3)doMove(gs.p2,gs.p2.x>gs.p1.x?-1:1);return;}
      if(gs.p2.energy>=80&&r<(0.2+stage*0.05))attack(gs.p2,gs.p1,'special');
      else if(r<0.35)attack(gs.p2,gs.p1,'punch');
      else if(r<0.6)attack(gs.p2,gs.p1,'kick');
      else if(r<(0.65+stage*0.03)){gs.p2.state='block';playSound('block');setTimeout(function(){if(gs.p2.state==='block')gs.p2.state='idle';},420);}
      else{doMove(gs.p2,gs.p2.x>gs.p1.x?-1:1);}
      // CPU movement
      if(Math.random()<(0.2+stage*0.05)){doMove(gs.p2,gs.p2.x>gs.p1.x?-1:1);}
      if(Math.random()<(0.08+stage*0.02))doJump(gs.p2);
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
      // Stage-based arena themes
      var themes=[
        {sky1:'#14003a',sky2:'#2a0828',sky3:'#3a0a08',gnd1:'#4a1a00',gnd2:'#1a0600',line:'#f59e0b',torch:'#f97316'},
        {sky1:'#001a14',sky2:'#002820',sky3:'#083a08',gnd1:'#1a4a00',gnd2:'#0a1a06',line:'#22c55e',torch:'#4ade80'},
        {sky1:'#001428',sky2:'#0a1440',sky3:'#081a3a',gnd1:'#003a4a',gnd2:'#001a2a',line:'#06b6d4',torch:'#67e8f9'},
        {sky1:'#1a0040',sky2:'#280040',sky3:'#140028',gnd1:'#2a0050',gnd2:'#0a0020',line:'#8b5cf6',torch:'#a78bfa'},
        {sky1:'#3a0000',sky2:'#400808',sky3:'#280000',gnd1:'#4a0a00',gnd2:'#1a0000',line:'#ef4444',torch:'#f87171'},
      ];
      var ti=Math.min(Math.floor((stage-1)/3),themes.length-1);
      if(p2Char&&p2Char.id==='dragon')ti=4;
      var t=themes[ti];
      var sky=ctx.createLinearGradient(0,0,0,H);
      sky.addColorStop(0,t.sky1);sky.addColorStop(0.6,t.sky2);sky.addColorStop(1,t.sky3);
      ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
      var i;
      for(i=0;i<80;i++){
        ctx.fillStyle='rgba(255,255,255,0.8)';
        ctx.beginPath();ctx.arc((i*137+43)%W,(i*97+17)%(H*0.6),i%5===0?2:1.2,0,Math.PI*2);ctx.fill();
      }
      var gnd=ctx.createLinearGradient(0,H*0.7,0,H);
      gnd.addColorStop(0,t.gnd1);gnd.addColorStop(1,t.gnd2);
      ctx.fillStyle=gnd;ctx.fillRect(0,H*0.7,W,H*0.3);
      ctx.shadowColor=t.line;ctx.shadowBlur=14;
      ctx.strokeStyle=t.line;ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(0,H*0.7);ctx.lineTo(W,H*0.7);ctx.stroke();
      ctx.shadowBlur=0;
      [W*0.08,W*0.92].forEach(function(cx){
        var cg=ctx.createLinearGradient(cx-16,0,cx+16,0);
        cg.addColorStop(0,'#292524');cg.addColorStop(0.5,'#57534e');cg.addColorStop(1,'#292524');
        ctx.fillStyle=cg;ctx.fillRect(cx-16,H*0.28,32,H*0.42);
        ctx.fillStyle='#78716c';ctx.fillRect(cx-20,H*0.28,40,12);
        var fire=ctx.createRadialGradient(cx,H*0.28,2,cx,H*0.28,26);
        fire.addColorStop(0,'#fff7aa');fire.addColorStop(0.4,t.torch);fire.addColorStop(1,'rgba(0,0,0,0)');
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
      // Round announce countdown
      if(roundAnnounce>0){
        roundAnnounce--;
        ctx.save();ctx.fillStyle='rgba(0,0,0,0.6)';ctx.fillRect(0,0,W,H);ctx.textAlign='center';
        if(roundAnnounce>30){
          ctx.font='bold 64px Rajdhani,sans-serif';ctx.fillStyle='#f59e0b';ctx.shadowColor='#f59e0b';ctx.shadowBlur=30;
          ctx.fillText('ROUND '+roundNum,W/2,H/2-20);
          if(roundAnnounce===85)announceVoice('Round '+(roundNum===1?'One':roundNum===2?'Two':'Three'));
          ctx.font='bold 22px Inter,sans-serif';ctx.fillStyle='white';ctx.shadowBlur=0;
          ctx.fillText('Stage '+stage+' vs '+gs.p2.char.name+(p2Char&&p2Char.id==='goro'?' (FINAL BOSS)':''),W/2,H/2+30);
        } else {
          if(roundAnnounce===30){playSound('fight');announceVoice('FIGHT');startBGMusic();}
          var fightScale=1+(30-roundAnnounce)*0.03;
          ctx.font='bold '+Math.round(72*fightScale)+'px Rajdhani,sans-serif';ctx.fillStyle='#ef4444';ctx.shadowColor='#ef4444';ctx.shadowBlur=40;
          ctx.fillText('FIGHT!',W/2,H/2+10);
        }
        ctx.restore();return;
      }
      // FINISH HIM when enemy HP < 15%
      var p2Pct=gs.p2.hp/(gs.p2.char.hp*(1+(stage-1)*0.08));
      if(!gs.over&&!roundOver&&p2Pct<0.15&&p2Pct>0&&frame%60<40){
        ctx.save();ctx.textAlign='center';ctx.font='bold 38px Rajdhani,sans-serif';ctx.fillStyle='#ef4444';ctx.shadowColor='#ef4444';ctx.shadowBlur=25;
        ctx.fillText('FINISH HIM!',W/2,H*0.25);ctx.restore();
        if(frame%60===1){playSound('finish');if(frame%60===1&&frame%180===1)announceVoice('Finish Him');}
      }
      if(!gs.over&&!roundOver&&(gs.p1.hp<=0||gs.p2.hp<=0||gs.time<=0)){
        roundOver=true;
        playSound('ko');stopBGMusic();
        var roundW=gs.p1.hp>gs.p2.hp?'P1':gs.p2.hp>gs.p1.hp?'P2':'DRAW';
        if(roundW==='P1')p1Rounds++;
        if(roundW==='P2')p2Rounds++;
        clearInterval(loopRef.current);
        window.removeEventListener('keydown',onKey);
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
          ctx.font='bold 60px Rajdhani,Inter,sans-serif';
          ctx.fillStyle='#ef4444';ctx.shadowColor='#ef4444';ctx.shadowBlur=45;
          ctx.fillText(koT,W/2,H/2-40);ctx.shadowBlur=0;
          ctx.font='bold 28px Rajdhani,Inter,sans-serif';ctx.fillStyle='white';
          var rWinName=roundW==='P1'?gs.p1.char.name:roundW==='P2'?gs.p2.char.name:'Nobody';
          ctx.fillText(rWinName+' wins Round '+roundNum+'!',W/2,H/2+10);
          announceVoice(rWinName+' wins');
          ctx.font='bold 20px Inter,sans-serif';ctx.fillStyle='#f59e0b';
          ctx.fillText('P1: '+p1Rounds+' | P2: '+p2Rounds+' (Best of 3)',W/2,H/2+45);
          // Check if match is over (best of 3)
          if(p1Rounds>=2||p2Rounds>=2){
            var matchW=p1Rounds>=2?'P1':'P2';
            ctx.font='bold 22px Inter,sans-serif';ctx.fillStyle=matchW==='P1'?'#22c55e':'#ef4444';
            var isFlawless=matchW==='P1'&&gs.p1.hp>=gs.p1.char.hp;
            if(isFlawless){ctx.fillText('FLAWLESS VICTORY!',W/2,H/2+80);announceVoice('Flawless Victory');}
            else{ctx.fillText(matchW==='P1'?'MATCH WIN! Stage '+(stage+1)+' unlocked!':'MATCH LOST! Try again...',W/2,H/2+80);}
            if(matchW==='P1')setP1Wins(function(v){return v+1;});
            if(matchW==='P2')setP2Wins(function(v){return v+1;});
            setTimeout(function(){setWinner(matchW);if(matchW==='P1')setStage(function(s){return s+1;});},2800);
          } else {
            // Next round
            ctx.font='18px Inter,sans-serif';ctx.fillStyle='#94a3b8';
            ctx.fillText('Next round starting...',W/2,H/2+80);
            setTimeout(function(){
              roundNum++;roundOver=false;
              gs.p1.hp=p1Char.hp;gs.p1.energy=0;gs.p1.state='idle';gs.p1.x=W*0.27;gs.p1.y=0;gs.p1.vy=0;gs.p1.hitFlash=0;
              gs.p2.hp=p2MaxHp;gs.p2.energy=0;gs.p2.state='idle';gs.p2.x=W*0.73;gs.p2.y=0;gs.p2.vy=0;gs.p2.hitFlash=0;
              gs.time=99;gs.lastSec=Date.now();gs.over=false;gs.particles=[];gs.floats=[];
              combo=0;lastHitter=null;shake=0;roundAnnounce=90;
              window.addEventListener('keydown',onKey);
              loopRef.current=setInterval(loop,16);
            },2500);
          }
        },500);
      }
    }

    loopRef.current = setInterval(loop, 16);

    return function(){
      stopped = true;
      clearInterval(loopRef.current);
      window.removeEventListener('keydown', onKey);
      delete window._dominexAttack;
      stopBGMusic();
      try{window.speechSynthesis&&window.speechSynthesis.cancel();}catch(e){}
      if (container) container.innerHTML = '';
    };
  }, [screen, p1Char, p2Char, rematchKey, stage]);

  // ---- SELECT SCREEN ----
  // Tower: 14 opponents + GORO boss final
  var TOWER_IDS=['cyrax','reptile','liukang','subzero','kitana','mileena','baraka','smoke','scorpion','kunglao','nightwolf','raiden','sektor','noob','goro'];
  var TOWER=TOWER_IDS.map(function(id){return CHARS.find(function(c){return c.id===id;});});
  var towerOpponent = TOWER[Math.min(stage-1, TOWER.length-1)];

  if(screen==='select'){
    return (
      <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#030308,#0a0005)',color:'white',fontFamily:'Inter,sans-serif',display:'flex',flexDirection:'column',alignItems:'center',padding:'20px 16px'}}>
        <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:40,fontWeight:700,color:'#f59e0b',letterSpacing:3,marginBottom:2,textShadow:'0 0 30px rgba(245,158,11,0.5)'}}>DOMINEX ARENA</div>
        <div style={{color:'#64748b',marginBottom:12,fontSize:13}}>TOWER MODE - Fight your way to the top!</div>
        {!p1Char ? (<div><div style={{color:'#94a3b8',marginBottom:14,fontSize:15,textAlign:'center',fontWeight:700}}>Choose Your Fighter ({CHARS.length-1} Fighters)</div><div style={{display:'flex',gap:8,flexWrap:'wrap',justifyContent:'center',maxWidth:920}}>{CHARS.filter(function(c){return c.id!=='goro';}).map(function(c){return (<div key={c.id} onClick={function(){setP1Char(c);announceVoice(c.name);}} style={{width:105,padding:'8px 6px 8px',borderRadius:12,textAlign:'center',cursor:'pointer',background:'rgba(255,255,255,0.03)',border:'2px solid rgba(255,255,255,0.08)',boxShadow:'0 0 14px '+c.color+'30',transition:'transform 0.15s',position:'relative'}}>{c.img?<img src={c.img} alt={c.name} style={{width:52,height:52,borderRadius:8,objectFit:'cover',border:'2px solid '+c.color+'44',display:'block',margin:'0 auto 4px'}} />:<div style={{width:52,height:52,borderRadius:8,background:'rgba(255,255,255,0.05)',border:'2px solid '+c.color+'44',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 4px',fontSize:28}}>{c.emoji}</div>}<div style={{fontFamily:'Rajdhani,sans-serif',fontSize:13,fontWeight:700,color:c.color}}>{c.name}</div><div style={{fontSize:8,color:'#64748b',marginBottom:4}}>{c.title}</div><div style={{display:'flex',gap:2}}><div style={{flex:1,height:3,background:'#1e293b',borderRadius:2,overflow:'hidden'}}><div style={{width:c.power*10+'%',height:'100%',background:'#ef4444',borderRadius:2}}></div></div><div style={{flex:1,height:3,background:'#1e293b',borderRadius:2,overflow:'hidden'}}><div style={{width:c.speed*10+'%',height:'100%',background:'#22c55e',borderRadius:2}}></div></div><div style={{flex:1,height:3,background:'#1e293b',borderRadius:2,overflow:'hidden'}}><div style={{width:c.defense*10+'%',height:'100%',background:'#3b82f6',borderRadius:2}}></div></div></div><div style={{marginTop:4,fontSize:8,color:c.color,fontWeight:700}}>{c.rarity}</div></div>);})}</div></div>) : (<div style={{width:'100%',maxWidth:500}}><div style={{textAlign:'center',marginBottom:12}}>{p1Char.img?<img src={p1Char.img} alt={p1Char.name} style={{width:60,height:60,borderRadius:10,objectFit:'cover',border:'2px solid '+p1Char.color,display:'inline-block',verticalAlign:'middle',marginRight:10}} />:<span style={{fontSize:40,marginRight:10,verticalAlign:'middle'}}>{p1Char.emoji}</span>}<span style={{color:p1Char.color,fontWeight:900,fontSize:22,fontFamily:'Rajdhani,sans-serif'}}>{p1Char.name}</span><span style={{color:'#475569',fontSize:14,marginLeft:8}}>({p1Char.title})</span></div><div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:16,padding:12,maxHeight:340,overflowY:'auto'}}><div style={{fontWeight:700,color:'#f59e0b',marginBottom:8,fontSize:14,textAlign:'center',letterSpacing:2}}>TOWER LADDER ({TOWER.length} Stages)</div>{TOWER.map(function(opp,i){var stg=i+1;var isCur=stg===stage;var isDone=stg<stage;var isBoss=opp.id==='goro';return (<div key={opp.id+i} style={{display:'flex',alignItems:'center',gap:8,padding:'7px 10px',marginBottom:4,borderRadius:10,background:isCur?'rgba(245,158,11,0.12)':isDone?'rgba(34,197,94,0.08)':'rgba(255,255,255,0.02)',border:'1.5px solid '+(isCur?'#f59e0b':isDone?'#22c55e44':'rgba(255,255,255,0.06)'),opacity:isDone?0.55:1}}><div style={{width:22,textAlign:'center',fontWeight:900,fontSize:12,color:isCur?'#f59e0b':isDone?'#22c55e':'#475569'}}>{isDone?'✓':stg}</div>{opp.img?<img src={opp.img} alt={opp.name} style={{width:28,height:28,borderRadius:6,objectFit:'cover',border:'1px solid '+opp.color+'66'}} />:<div style={{width:28,height:28,borderRadius:6,background:'rgba(255,255,255,0.05)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,border:'1px solid '+opp.color+'66'}}>{opp.emoji}</div>}<div style={{flex:1}}><div style={{fontWeight:700,color:opp.color,fontSize:13}}>{opp.name}{isBoss?' 👹 BOSS':''}</div><div style={{fontSize:9,color:'#64748b'}}>{opp.title} | HP:{Math.round(opp.hp*(1+(stg-1)*0.08))}</div></div><div style={{fontSize:10,color:isCur?'#f59e0b':isDone?'#22c55e':'#475569',fontWeight:700}}>{isDone?'CLEARED':isCur?'FIGHT!':'LOCKED'}</div></div>);})}</div><div style={{marginTop:12,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:10,padding:'10px 16px',textAlign:'center'}}><div style={{fontWeight:700,color:'#f59e0b',marginBottom:4,fontSize:12}}>Stage {stage} Bet</div><div style={{display:'flex',gap:6,justifyContent:'center',marginBottom:4}}>{[50,100,250,500].map(function(a){return <button key={a} onClick={function(){setBetAmount(a);}} style={{padding:'5px 12px',borderRadius:7,border:'1.5px solid '+(betAmount===a?'#f59e0b':'rgba(255,255,255,0.1)'),background:betAmount===a?'rgba(245,158,11,0.2)':'transparent',color:betAmount===a?'#f59e0b':'#64748b',fontWeight:700,cursor:'pointer',fontSize:11}}>{a}</button>;})}</div><div style={{fontSize:10,color:'#475569'}}>Win: <strong style={{color:'#22c55e'}}>+{betAmount*stage} $DMX</strong> | Bal: <strong style={{color:'#f59e0b'}}>{dmx.toLocaleString()}</strong></div></div><button onClick={function(){setP2Char(towerOpponent);setScreen('fight');playSound('round');announceVoice(towerOpponent.name);}} style={{width:'100%',marginTop:12,padding:'14px',borderRadius:12,background:towerOpponent.id==='goro'?'linear-gradient(135deg,#dc2626,#f59e0b)':'linear-gradient(135deg,#f59e0b,#ef4444)',border:'none',color:'#000',fontWeight:900,fontSize:18,cursor:'pointer',letterSpacing:2,fontFamily:'Rajdhani,sans-serif'}}>FIGHT STAGE {stage} - {towerOpponent.name}{towerOpponent.id==='goro'?' 👹':''}</button><button onClick={function(){setP1Char(null);setStage(1);}} style={{width:'100%',marginTop:6,padding:'8px',borderRadius:8,background:'transparent',border:'1px solid rgba(255,255,255,0.1)',color:'#64748b',fontWeight:600,fontSize:12,cursor:'pointer'}}>Change Fighter</button></div>)}
      </div>
    );
  }

  // ---- WINNER SCREEN ----
  if(winner){
    var wc=winner==='P1'?p1Char:winner==='P2'?p2Char:null;
    var towerComplete=winner==='P1'&&stage>=TOWER.length;
    var isFlawless=winner==='P1'&&p1Char&&p1Char.hp===p1Char.hp; // placeholder - real check set via ref
    return (
      <div style={{minHeight:'100vh',background:towerComplete?'linear-gradient(135deg,#1a0800,#3a1a00,#1a0800)':'#030308',color:'white',fontFamily:'Inter,sans-serif',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:12}}>
        {towerComplete ? (
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:60,marginBottom:8}}>👹</div>
            <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:52,fontWeight:900,background:'linear-gradient(135deg,#f59e0b,#fbbf24,#f59e0b)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>TOWER COMPLETE!</div>
            <div style={{fontSize:18,color:'#fbbf24',fontWeight:700,marginTop:4}}>You defeated GORO!</div>
            <div style={{fontSize:14,color:'#22c55e',fontWeight:700,marginTop:8}}>+{betAmount*stage*3} $DMX Victory Bonus!</div>
            <div style={{fontSize:13,color:'#64748b',marginTop:4}}>All 15 stages cleared — You are the Champion!</div>
          </div>
        ) : (
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:13,color:'#64748b',letterSpacing:2}}>STAGE {stage} / {TOWER.length}</div>
            <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:64,fontWeight:900,color:wc?wc.color:'#64748b'}}>{winner==='DRAW'?'DRAW!':wc.name+' WINS!'}</div>
            <div style={{fontSize:15,color:'#64748b'}}>{winner==='P1'?'+'+betAmount*stage+' $DMX earned!':winner==='P2'?'-'+betAmount+' $DMX lost':'No $DMX exchanged'}</div>
            {winner==='P1'&&<div style={{fontSize:13,color:'#22c55e',fontWeight:700,marginTop:4}}>Stage {stage} Complete! Next: {TOWER[stage]?TOWER[stage].name:'???'}</div>}
          </div>
        )}
        <div style={{display:'flex',gap:6,marginTop:8}}>
          {TOWER.slice(0,Math.min(15,TOWER.length)).map(function(_,i){
            var stg=i+1;
            return <div key={i} style={{width:14,height:14,borderRadius:3,background:stg<stage||(winner==='P1'&&stg===stage)?'#22c55e':stg===stage?'#ef4444':'#1e293b',border:'1px solid rgba(255,255,255,0.1)',fontSize:7,display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:700}}>{stg<=stage?(stg<stage||(winner==='P1')?'✓':'✗'):''}</div>;
          })}
        </div>
        <div style={{display:'flex',gap:12,marginTop:12}}>
          {towerComplete ? (
            <button onClick={function(){clearInterval(loopRef.current);setScreen('select');setP1Char(null);setP2Char(null);setStep(1);setWinner(null);setP1Wins(0);setP2Wins(0);setRematchKey(0);setStage(1);}} style={{padding:'14px 44px',borderRadius:12,background:'linear-gradient(135deg,#f59e0b,#fbbf24)',border:'none',color:'#000',fontWeight:900,fontSize:18,cursor:'pointer',letterSpacing:1}}>🏆 Play Again</button>
          ) : (
            <div style={{display:'flex',gap:12}}>
              <button onClick={function(){setWinner(null);setRematchKey(function(k){return k+1;});}} style={{padding:'14px 32px',borderRadius:12,background:'linear-gradient(135deg,#f59e0b,#ef4444)',border:'none',color:'#000',fontWeight:900,fontSize:16,cursor:'pointer'}}>{winner==='P1'?'Next Stage ▶':'Retry Stage'}</button>
              <button onClick={function(){clearInterval(loopRef.current);setScreen('select');setP1Char(null);setP2Char(null);setStep(1);setWinner(null);setP1Wins(0);setP2Wins(0);setRematchKey(0);setStage(1);}} style={{padding:'14px 32px',borderRadius:12,background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.12)',color:'white',fontWeight:700,fontSize:16,cursor:'pointer'}}>New Match</button>
            </div>
          )}
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
