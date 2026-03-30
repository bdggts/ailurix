'use client';
import { useEffect, useRef, useState } from 'react';

// ── CHARACTERS ──────────────────────────────────────────────────────────────
var CHARS=[
  {id:'scorpion',name:'SCORPION',title:'Hell Ninja',    color:'#f59e0b',accent:'#fbbf24',hp:100,spd:8,pow:9, def:7, rarity:'Common',   emoji:'🔥',special:'Spear Pull'},
  {id:'subzero', name:'SUB-ZERO',title:'Ice Warrior',   color:'#38bdf8',accent:'#7dd3fc',hp:95, spd:7,pow:8, def:9, rarity:'Common',   emoji:'❄️',special:'Ice Freeze'},
  {id:'liukang', name:'LIU KANG',title:'Shaolin Monk',  color:'#ef4444',accent:'#fca5a5',hp:90, spd:9,pow:9, def:7, rarity:'Rare',     emoji:'🥋',special:'Flying Kick'},
  {id:'raiden',  name:'RAIDEN',  title:'Thunder God',   color:'#8b5cf6',accent:'#c4b5fd',hp:95, spd:6,pow:10,def:9, rarity:'Legendary',emoji:'⚡',special:'Lightning'},
  {id:'reptile', name:'REPTILE', title:'Hidden Fighter', color:'#22c55e',accent:'#86efac',hp:88, spd:9,pow:8, def:7, rarity:'Rare',     emoji:'🦎',special:'Acid Spit'},
  {id:'kitana',  name:'KITANA',  title:'Fan Assassin',  color:'#06b6d4',accent:'#67e8f9',hp:85, spd:10,pow:8,def:6, rarity:'Epic',     emoji:'🪭',special:'Fan Throw'},
  {id:'mileena', name:'MILEENA', title:'Evil Twin',     color:'#f472b6',accent:'#f9a8d4',hp:82, spd:10,pow:9,def:5, rarity:'Rare',     emoji:'🗡️',special:'Sai Throw'},
  {id:'jaxon',   name:'JAXON',   title:'Metal Arms',    color:'#78716c',accent:'#d6d3d1',hp:110,spd:5,pow:10,def:10,rarity:'Epic',     emoji:'🦾',special:'Ground Pound'},
  {id:'baraka',  name:'BARAKA',  title:'Blade Fighter', color:'#fb923c',accent:'#fdba74',hp:92, spd:7,pow:10,def:8, rarity:'Epic',     emoji:'⚔️',special:'Blade Fury'},
  {id:'smoke',   name:'SMOKE',   title:'Gray Ninja',    color:'#a78bfa',accent:'#c4b5fd',hp:80, spd:10,pow:9,def:5, rarity:'Rare',     emoji:'💨',special:'Smoke Screen'},
  {id:'cyrax',   name:'CYRAX',   title:'Yellow Robot',  color:'#a3e635',accent:'#d9f99d',hp:88, spd:8,pow:8, def:8, rarity:'Common',   emoji:'🤖',special:'Net Trap'},
  {id:'sektor',  name:'SEKTOR',  title:'Red Robot',     color:'#dc2626',accent:'#fca5a5',hp:90, spd:8,pow:9, def:8, rarity:'Epic',     emoji:'🚀',special:'Missiles'},
  {id:'kunglao', name:'KUNG LAO',title:'Hat Fighter',   color:'#e2e8f0',accent:'#f1f5f9',hp:88, spd:9,pow:8, def:7, rarity:'Legendary',emoji:'🎩',special:'Hat Throw'},
  {id:'nightwolf',name:'NIGHTWOLF',title:'Spirit Warrior',color:'#84cc16',accent:'#bef264',hp:92,spd:7,pow:9,def:8,rarity:'Mythic',  emoji:'🏹',special:'Spirit Arrow'},
  {id:'noob',    name:'NOOB',    title:'Dark Shadow',   color:'#64748b',accent:'#94a3b8',hp:85, spd:9,pow:10,def:6, rarity:'Mythic',   emoji:'👤',special:'Shadow Clone'},
  {id:'goro',    name:'GORO',    title:'Final Boss',    color:'#d97706',accent:'#fbbf24',hp:200,spd:4,pow:10,def:10,rarity:'BOSS',    emoji:'👹',special:'Stomp Quake',boss:true},
];
var PLAYABLE=CHARS.filter(function(c){return !c.boss;});
var TOWER=['cyrax','reptile','liukang','subzero','kitana','mileena','baraka','smoke','scorpion','kunglao','nightwolf','raiden','sektor','noob','goro'].map(function(id){return CHARS.find(function(c){return c.id===id;});});

// ── AUDIO ────────────────────────────────────────────────────────────────────
var _AC=null;
function AC(){if(!_AC)try{_AC=new(window.AudioContext||window.webkitAudioContext)();}catch(e){}if(_AC&&_AC.state==='suspended')_AC.resume().catch(function(){});return _AC;}
function beep(freq,type,dur,vol){var ac=AC();if(!ac)return;var o=ac.createOscillator(),g=ac.createGain();o.type=type||'sine';o.frequency.value=freq;g.gain.setValueAtTime(vol||0.2,ac.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ac.currentTime+dur);o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+dur);}
function snd(t){try{if(t==='punch')beep(200,'sawtooth',0.08,0.3);else if(t==='kick')beep(90,'square',0.15,0.35);else if(t==='block')beep(800,'triangle',0.05,0.15);else if(t==='special'){beep(100,'sawtooth',0.15,0.3);setTimeout(function(){beep(500,'sawtooth',0.3,0.25);},100);}else if(t==='hit')beep(250,'sawtooth',0.08,0.2);else if(t==='ko'){beep(400,'sawtooth',0.08,0.4);setTimeout(function(){beep(100,'sawtooth',0.9,0.3);},80);}else if(t==='select')beep(440,'sine',0.08,0.1);else if(t==='start'){beep(400,'square',0.1,0.3);setTimeout(function(){beep(600,'square',0.1,0.3);},150);}}catch(e){}}

// ── DRAW FIGHTER (canvas) ────────────────────────────────────────────────────
function drawFighter(ctx,f,t){
  var x=f.x,y=f.y,dir=f.dir,color=f.char.color,accent=f.char.accent;
  var H=f.H,state=f.state,af=f.af||0;
  ctx.save();ctx.translate(x,y);if(dir<0)ctx.scale(-1,1);
  var bob=state==='idle'?Math.sin(t*0.003)*3:0;
  var punchX=state==='punch'?Math.sin(af/12*Math.PI)*32:state==='special'?Math.sin(af/20*Math.PI)*45:0;
  var kickY=state==='kick'?Math.sin(af/18*Math.PI)*(-35):0;
  var hurtLean=state==='hurt'?12:0;
  var blockSq=state==='block'?0.85:1;
  var walkBob=state==='walk'?Math.sin(t*0.012)*6:0;
  // Shadow
  ctx.fillStyle='rgba(0,0,0,0.3)';ctx.beginPath();ctx.ellipse(0,2,25,7,0,0,Math.PI*2);ctx.fill();
  // Special glow
  if(state==='special'){ctx.shadowColor=color;ctx.shadowBlur=20;}
  // Legs
  ctx.fillStyle=color+'bb';
  ctx.fillRect(-14+walkBob,-H*0.45+bob,13,H*0.45*blockSq);
  ctx.fillRect(1-walkBob,-H*0.45+bob,13,H*0.45*blockSq+kickY);
  // Shoes
  ctx.fillStyle=accent;ctx.fillRect(-18,-H*0.0+bob,16,8);ctx.fillRect(2+kickY*0.3,-H*0.0+bob,16,8);
  // Body
  ctx.fillStyle=color;
  ctx.save();if(hurtLean)ctx.rotate(hurtLean*Math.PI/180);
  ctx.fillRect(-16,-H*0.75+bob,32,H*0.32*blockSq);
  ctx.fillStyle=accent;ctx.fillRect(-10,-H*0.68+bob,20,4);
  ctx.restore();
  // Arms
  ctx.fillStyle=color;
  if(state==='block'){ctx.fillRect(-22,-H*0.72+bob,14,H*0.3);}
  else{ctx.fillRect(-22+punchX,-H*0.72+bob,12,H*0.28);ctx.fillRect(10,-H*0.72+bob,12,H*0.28);}
  if(punchX>5){ctx.fillStyle=accent;ctx.fillRect(-22+punchX,-H*0.45+bob,14,10);}
  // Head
  ctx.shadowBlur=0;ctx.fillStyle=accent;
  ctx.beginPath();ctx.arc(0,-H*0.88+bob,H*0.14,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle=color;ctx.lineWidth=3;
  ctx.beginPath();ctx.arc(0,-H*0.88+bob,H*0.14,0,Math.PI*2);ctx.stroke();
  // Eyes
  ctx.fillStyle='#000';ctx.fillRect(-7,-H*0.9+bob,5,4);ctx.fillRect(2,-H*0.9+bob,5,4);
  if(state==='special'){ctx.fillStyle=color;ctx.shadowColor=color;ctx.shadowBlur=8;ctx.fillRect(-7,-H*0.9+bob,5,4);ctx.fillRect(2,-H*0.9+bob,5,4);}
  // Hurt flash
  if(state==='hurt'){ctx.fillStyle='rgba(255,50,50,0.45)';ctx.fillRect(-20,-H+bob,40,H);}
  ctx.shadowBlur=0;ctx.restore();
}

// ── DRAW HP BAR ──────────────────────────────────────────────────────────────
function drawHPBar(ctx,x,y,w,h,pct,color,name,flip,energy){
  ctx.fillStyle='rgba(0,0,0,0.85)';ctx.fillRect(x,y,w,h+6);
  var bw=Math.max(0,w*pct);
  var grd=ctx.createLinearGradient(flip?x+w-bw:x,y,flip?x+w:x+bw,y);
  grd.addColorStop(0,pct>0.5?color:pct>0.25?'#f59e0b':'#ef4444');
  grd.addColorStop(1,pct>0.5?color+'88':pct>0.25?'#f59e0b88':'#ef444488');
  ctx.fillStyle=grd;ctx.fillRect(flip?x+w-bw:x,y,bw,h);
  // Energy bar (smaller)
  var ew=w*Math.min(energy/100,1);
  ctx.fillStyle='rgba(255,255,255,0.08)';ctx.fillRect(x,y+h+2,w,4);
  ctx.fillStyle=energy>=80?'#fbbf24':'#8b5cf6';ctx.fillRect(flip?x+w-ew:x,y+h+2,ew,4);
  ctx.strokeStyle='rgba(255,255,255,0.2)';ctx.lineWidth=1;ctx.strokeRect(x,y,w,h);
  if(pct<0.25&&Math.floor(Date.now()/300)%2===0){ctx.strokeStyle='#ef4444';ctx.lineWidth=2;ctx.strokeRect(x-1,y-1,w+2,h+2);}
  ctx.fillStyle='#fff';ctx.font='bold 11px Rajdhani,sans-serif';ctx.textAlign=flip?'right':'left';
  ctx.shadowColor='#000';ctx.shadowBlur=4;
  ctx.fillText(name,flip?x+w:x,y-3);ctx.shadowBlur=0;
}

// ── PARTICLES ────────────────────────────────────────────────────────────────
function spawnParts(parts,x,y,color,n){for(var i=0;i<n;i++)parts.push({x,y,vx:(Math.random()-0.5)*9,vy:(Math.random()-0.5)*9-4,color,life:18+Math.random()*12,size:2+Math.random()*4});}
function updateParts(parts){for(var i=parts.length-1;i>=0;i--){var p=parts[i];p.x+=p.vx;p.y+=p.vy;p.vy+=0.3;p.life--;if(p.life<=0)parts.splice(i,1);};}
function drawParts(ctx,parts){parts.forEach(function(p){ctx.globalAlpha=Math.max(0,p.life/20);ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();});ctx.globalAlpha=1;}

// ── BACKGROUND ───────────────────────────────────────────────────────────────
function drawBG(ctx,W,H,stage,t){
  var bgs=[['#1a0800','#3d1500'],['#00051a','#001540'],['#1a0000','#3d0000'],['#0a001a','#200050'],['#1a1000','#3d2800']];
  var bi=Math.min(Math.floor((stage-1)/3),4),c=bgs[bi];
  var g=ctx.createLinearGradient(0,0,0,H*0.72);g.addColorStop(0,c[0]);g.addColorStop(1,c[1]);
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H*0.72);
  ctx.fillStyle='#111';ctx.fillRect(0,H*0.72,W,H*0.28);
  ctx.strokeStyle='rgba(245,158,11,0.3)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,H*0.72);ctx.lineTo(W,H*0.72);ctx.stroke();
  // Ambient particles
  for(var i=0;i<5;i++){var px=((i*W/5+t*0.4*(i%2?1:-1))%W+W)%W,py=H*0.15+Math.sin(t*0.002+i)*H*0.2;ctx.fillStyle='rgba(245,158,11,0.25)';ctx.beginPath();ctx.arc(px,py,1.5+Math.sin(t*0.004+i),0,Math.PI*2);ctx.fill();}
}

// ── SPLASH SCREEN ────────────────────────────────────────────────────────────
function SplashScreen({onPlay,savedStage}){
  var cvRef=useRef(null),raf=useRef(null);
  useEffect(function(){
    var cv=cvRef.current;if(!cv)return;
    var ctx=cv.getContext('2d');var t=0;
    function resize(){cv.width=cv.offsetWidth;cv.height=cv.offsetHeight;}resize();
    window.addEventListener('resize',resize);
    function frame(){
      raf.current=requestAnimationFrame(frame);t++;
      var W=cv.width,H=cv.height;
      var grd=ctx.createRadialGradient(W/2,H*0.4,0,W/2,H*0.4,W*0.8);
      grd.addColorStop(0,'#1a0800');grd.addColorStop(1,'#000');
      ctx.fillStyle=grd;ctx.fillRect(0,0,W,H);
      // Stars
      for(var i=0;i<25;i++){var sx=(i*W/25+t*0.3*(i%2?1:-1))%W,sy=H*0.1+Math.sin(t*0.015+i*0.8)*H*0.3;ctx.fillStyle='rgba(245,158,11,'+(0.2+0.3*Math.sin(t*0.05+i))+')';ctx.beginPath();ctx.arc(sx,sy,1+Math.sin(t*0.06+i)*0.8,0,Math.PI*2);ctx.fill();}
      var pulse=0.6+0.4*Math.sin(t*0.05);
      ctx.shadowColor='#f59e0b';ctx.shadowBlur=40*pulse;
      ctx.fillStyle='#f59e0b';ctx.font='bold '+Math.round(W*0.1)+'px Rajdhani,Impact,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText('DOMINEX',W/2,H*0.36);
      ctx.shadowBlur=20*pulse;ctx.fillStyle='#fff';ctx.font='bold '+Math.round(W*0.045)+'px Rajdhani,sans-serif';
      ctx.fillText('ARENA',W/2,H*0.36+Math.round(W*0.1)*0.75);
      ctx.shadowBlur=0;ctx.fillStyle='rgba(100,116,139,0.7)';ctx.font='11px Inter,sans-serif';
      ctx.fillText('TOWER FIGHT  •  15 STAGES  •  EARN $DMX',W/2,H*0.66);
      if(savedStage>1){ctx.fillStyle='rgba(245,158,11,0.7)';ctx.font='bold 11px Inter,sans-serif';ctx.fillText('Stage '+savedStage+' unlocked',W/2,H*0.75);}
    }
    frame();
    return function(){cancelAnimationFrame(raf.current);window.removeEventListener('resize',resize);};
  },[]);
  return (
    <div style={{position:'fixed',inset:0,background:'#000',display:'flex',flexDirection:'column',touchAction:'none'}}>
      <canvas ref={cvRef} style={{flex:1,width:'100%'}}/>
      <div style={{padding:'16px 20px',paddingBottom:'max(16px,env(safe-area-inset-bottom))',flexShrink:0,display:'flex',flexDirection:'column',gap:8,alignItems:'center',background:'linear-gradient(0deg,#000 50%,transparent)'}}>
        <button onClick={function(){snd('start');onPlay();}} style={{width:'100%',maxWidth:320,padding:'17px',borderRadius:18,background:'linear-gradient(135deg,#f59e0b,#ef4444)',border:'none',color:'#000',fontWeight:900,fontSize:22,fontFamily:'Rajdhani,sans-serif',letterSpacing:3,cursor:'pointer',boxShadow:'0 0 30px rgba(245,158,11,0.55)',touchAction:'manipulation',WebkitTapHighlightColor:'transparent'}}>⚔️ PLAY NOW</button>
      </div>
    </div>
  );
}

// ── SELECT SCREEN ────────────────────────────────────────────────────────────
function SelectScreen({onSelect,stage}){
  var si=useState(0),selIdx=si[0],setSelIdx=si[1];
  var sel=PLAYABLE[selIdx];
  function pick(i){setSelIdx(i);snd('select');}
  return (
    <div style={{position:'fixed',inset:0,background:'#030308',color:'#fff',fontFamily:'Inter,sans-serif',display:'flex',overflow:'hidden'}}>
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',borderRight:'1px solid rgba(255,255,255,0.07)'}}>
        <div style={{padding:'8px 12px 5px',flexShrink:0,textAlign:'center',borderBottom:'1px solid rgba(255,255,255,0.05)',background:'rgba(0,0,0,0.5)'}}>
          <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:14,fontWeight:900,color:'#f59e0b',letterSpacing:3}}>CHOOSE FIGHTER</div>
          <div style={{fontSize:9,color:'#475569',letterSpacing:2}}>STAGE {stage} OF 15</div>
        </div>
        <div style={{flex:1,display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:5,padding:'8px 10px',overflowY:'auto',alignContent:'start',WebkitOverflowScrolling:'touch'}}>
          {PLAYABLE.map(function(c,i){var s=i===selIdx;return(
            <div key={c.id} onClick={function(){pick(i);}} style={{borderRadius:12,padding:'8px 4px 7px',textAlign:'center',cursor:'pointer',background:s?c.color+'22':'rgba(255,255,255,0.04)',border:'2px solid '+(s?c.color:'rgba(255,255,255,0.07)'),transform:s?'scale(1.07)':'scale(1)',transition:'all .12s',boxShadow:s?'0 0 16px '+c.color+'55':'none',touchAction:'manipulation',WebkitTapHighlightColor:'transparent',position:'relative'}}>
              <div style={{fontSize:26,lineHeight:1.1}}>{c.emoji}</div>
              <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:9,fontWeight:700,color:s?c.color:'#64748b',marginTop:3,letterSpacing:.5,lineHeight:1}}>{c.name.split(' ')[0]}</div>
              {s&&<div style={{position:'absolute',bottom:3,left:'50%',transform:'translateX(-50%)',width:6,height:6,borderRadius:'50%',background:c.color,boxShadow:'0 0 8px '+c.color}}/>}
            </div>);
          })}
        </div>
      </div>
      <div style={{width:185,display:'flex',flexDirection:'column',background:'rgba(0,0,0,0.55)',overflow:'hidden'}}>
        <div style={{flex:1,padding:'12px 14px',overflowY:'auto'}}>
          <div style={{textAlign:'center',marginBottom:10}}>
            <div style={{fontSize:52,lineHeight:1,filter:'drop-shadow(0 0 14px '+sel.color+')'}}>{sel.emoji}</div>
            <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:18,fontWeight:900,color:sel.color,marginTop:6,letterSpacing:1}}>{sel.name}</div>
            <div style={{fontSize:9,color:'#64748b',marginBottom:5}}>{sel.title}</div>
            <div style={{display:'inline-block',padding:'2px 12px',borderRadius:20,background:sel.color+'22',border:'1px solid '+sel.color+'44',fontSize:9,color:sel.color,fontWeight:700}}>{sel.rarity}</div>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:10}}>
            {[['⚔️ POWER',sel.pow,'#ef4444'],['⚡ SPEED',sel.spd,'#22c55e'],['🛡️ DEFENSE',sel.def,'#3b82f6'],['❤️ HP',Math.round(sel.hp/10),'#f472b6']].map(function(s){return(
              <div key={s[0]}><div style={{display:'flex',justifyContent:'space-between',fontSize:9,color:'#94a3b8',marginBottom:2}}><span>{s[0]}</span><span style={{color:s[2],fontWeight:700}}>{s[1]}/10</span></div><div style={{height:5,background:'rgba(255,255,255,0.08)',borderRadius:3,overflow:'hidden'}}><div style={{width:s[1]*10+'%',height:'100%',background:s[2],borderRadius:3,transition:'width .3s'}}/></div></div>);
            })}
          </div>
          <div style={{padding:'7px 10px',background:'rgba(255,255,255,0.04)',borderRadius:9,border:'1px solid rgba(255,255,255,0.07)'}}>
            <div style={{fontSize:8,color:'#64748b',marginBottom:2,letterSpacing:1}}>SPECIAL</div>
            <div style={{fontSize:11,color:sel.color,fontWeight:700}}>{sel.special}</div>
          </div>
        </div>
        <div style={{padding:'8px 12px',paddingBottom:'max(8px,env(safe-area-inset-bottom))',flexShrink:0}}>
          <button onClick={function(){snd('start');onSelect(sel);}} style={{width:'100%',padding:'14px',borderRadius:14,background:'linear-gradient(135deg,'+sel.color+','+sel.color+'88)',border:'none',color:'#000',fontWeight:900,fontSize:16,fontFamily:'Rajdhani,sans-serif',letterSpacing:2,cursor:'pointer',boxShadow:'0 4px 20px '+sel.color+'55',touchAction:'manipulation',WebkitTapHighlightColor:'transparent'}}>SELECT ▶</button>
        </div>
      </div>
    </div>
  );
}

// ── VS SCREEN ────────────────────────────────────────────────────────────────
function VSScreen({player,opponent,stage,onDone}){
  useEffect(function(){snd('start');var t=setTimeout(onDone,2400);return function(){clearTimeout(t);};},[]);
  return (
    <div onClick={onDone} style={{position:'fixed',inset:0,background:'#000',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Rajdhani,sans-serif',cursor:'pointer',overflow:'hidden'}}>
      <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 25% 50%, '+player.color+'25 0%, transparent 55%)'}}/>
      <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 75% 50%, '+opponent.color+'25 0%, transparent 55%)'}}/>
      <div style={{flex:1,textAlign:'center',animation:'slideL .4s ease-out'}}>
        <div style={{fontSize:70,filter:'drop-shadow(0 0 24px '+player.color+')',lineHeight:1}}>{player.emoji}</div>
        <div style={{fontSize:22,fontWeight:900,color:player.color,marginTop:8,letterSpacing:2}}>{player.name}</div>
        <div style={{fontSize:10,color:'#475569',letterSpacing:2}}>YOU</div>
      </div>
      <div style={{textAlign:'center',minWidth:80}}>
        <div style={{fontSize:62,fontWeight:900,color:'#ef4444',textShadow:'0 0 40px rgba(239,68,68,0.9)',lineHeight:1}}>VS</div>
        <div style={{fontSize:11,color:'#f59e0b',fontWeight:700,letterSpacing:1,marginTop:4}}>STAGE {stage}/15</div>
      </div>
      <div style={{flex:1,textAlign:'center',animation:'slideR .4s ease-out'}}>
        <div style={{fontSize:70,filter:'drop-shadow(0 0 24px '+opponent.color+')',lineHeight:1}}>{opponent.emoji}</div>
        <div style={{fontSize:22,fontWeight:900,color:opponent.color,marginTop:8,letterSpacing:2}}>{opponent.name}</div>
        <div style={{fontSize:10,color:'#475569',letterSpacing:2}}>{opponent.boss?'BOSS':'CPU'}</div>
      </div>
      <style>{`@keyframes slideL{from{transform:translateX(-60px);opacity:0}to{transform:translateX(0);opacity:1}}@keyframes slideR{from{transform:translateX(60px);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>
    </div>
  );
}

// ── FIGHT SCREEN ─────────────────────────────────────────────────────────────
function FightScreen({player,opponent,stage,onResult}){
  var cvRef=useRef(null),raf=useRef(null),gsRef=useRef(null);
  useEffect(function(){
    var cv=cvRef.current;if(!cv)return;
    var ctx=cv.getContext('2d');
    function resize(){cv.width=cv.offsetWidth;cv.height=cv.offsetHeight;}resize();
    window.addEventListener('resize',resize);
    var GW,GH,FLOOR,SC;
    function dims(){GW=cv.width;GH=cv.height;FLOOR=GH*0.8;SC=GH/320;}
    dims();
    var eHpMult=1+(stage-1)*0.09;
    gsRef.current={
      p1:{char:player,x:GW*0.28,y:FLOOR,vy:0,hp:player.hp,maxHp:player.hp,energy:0,state:'idle',af:0,cd:0,dir:1,H:0},
      p2:{char:opponent,x:GW*0.72,y:FLOOR,vy:0,hp:Math.round(opponent.hp*eHpMult),maxHp:Math.round(opponent.hp*eHpMult),energy:0,state:'idle',af:0,cd:0,dir:-1,H:0},
      timer:99,lastSec:Date.now(),p1r:0,p2r:0,round:1,
      parts:[],shake:0,phase:'countdown',cd3:3,cdTimer:60,over:false,
    };
    var gs=gsRef.current;
    var cpuTick=0,cpuReact=Math.max(30,80-stage*4);
    var stopped=false,frame=0;
    var bgTick=null;
    function bgMusic(){if(bgTick)return;bgTick=setInterval(function(){try{var ac=AC();if(!ac)return;var o=ac.createOscillator(),g=ac.createGain();o.type='square';o.frequency.value=55;g.gain.setValueAtTime(0.03,ac.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ac.currentTime+0.25);o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+0.25);}catch(e){}},600);}
    function stopBg(){if(bgTick){clearInterval(bgTick);bgTick=null;}}
    function hbox(f){return{x:f.x-28,y:f.y-f.H,w:56,h:f.H};}
    function abox(f,type){var r=type==='kick'?85:type==='special'?115:65;return{x:f.dir>0?f.x+18:f.x-18-r,y:f.y-f.H*0.65,w:r,h:f.H*0.5};}
    function hits(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}
    function doAtk(attacker,defender,type){
      var dmgMap={punch:attacker.char.pow*1.3+Math.random()*5,kick:attacker.char.pow*2.0+Math.random()*8,special:attacker.char.pow*4.8+Math.random()*15};
      var delay=type==='kick'?130:type==='special'?160:80;
      setTimeout(function(){
        if(stopped||gs.phase!=='fight')return;
        if(hits(abox(attacker,type),hbox(defender))){
          var blocked=defender.state==='block';
          var d=Math.round((dmgMap[type]||12)*(blocked?0.12:1));
          defender.hp=Math.max(0,defender.hp-d);
          defender.state='hurt';defender.af=0;
          attacker.energy=Math.min(100,attacker.energy+18);
          defender.energy=Math.min(100,defender.energy+8);
          gs.shake=blocked?2:7;
          spawnParts(gs.parts,defender.x,defender.y-defender.H*0.5,blocked?'#3b82f6':defender.char.color,blocked?4:10);
          snd(blocked?'block':'hit');
        }
      },delay);
    }
    function attack(type){
      if(gs.phase!=='fight')return;
      var p1=gs.p1;
      if(p1.cd>0)return;
      if(type==='special'&&p1.energy<80)return;
      if(type==='block'){p1.state='block';p1.cd=6;snd('block');return;}
      p1.state=type;p1.af=0;p1.cd=type==='kick'?20:type==='special'?25:14;
      if(type==='special')p1.energy=0;
      snd(type);doAtk(p1,gs.p2,type);
    }
    window._ga=attack;
    function cpuDecide(){
      var p1=gs.p1,p2=gs.p2;if(p2.cd>0||p2.state==='hurt')return;
      cpuTick--;if(cpuTick>0)return;
      cpuTick=cpuReact+Math.floor(Math.random()*25);
      var dist=Math.abs(p2.x-p1.x);
      var r=Math.random();
      var aggr=0.3+stage*0.045;var blk=0.08+stage*0.02;
      if(dist<200){
        if(r<blk&&p1.state!=='idle'&&p1.state!=='walk'){p2.state='block';p2.cd=8;snd('block');return;}
        if(r<aggr){
          var opts=['punch','kick'];if(p2.energy>=80)opts.push('special');
          var t2=opts[Math.floor(Math.random()*opts.length)];
          p2.state=t2;p2.af=0;p2.cd=t2==='kick'?20:t2==='special'?25:14;
          if(t2==='special')p2.energy=0;snd(t2);doAtk(p2,p1,t2);
        }
      } else {
        p2.state='walk';
      }
    }
    function endRound(){
      stopBg();gs.phase='roundOver';gs.shake=14;snd('ko');
      var rw=gs.p1.hp>gs.p2.hp?'P1':gs.p2.hp>gs.p1.hp?'P2':'DRAW';
      if(rw==='P1')gs.p1r++;else if(rw==='P2')gs.p2r++;
      setTimeout(function(){
        if(stopped)return;
        if(gs.p1r>=2||gs.p2r>=2){
          gs.phase='matchOver';gs.over=true;
          setTimeout(function(){if(!stopped)onResult({winner:gs.p1r>=2?'win':'lose',stage});},1400);
        } else {
          gs.p1.hp=player.hp;gs.p2.hp=Math.round(opponent.hp*eHpMult);
          gs.p1.x=GW*0.28;gs.p2.x=GW*0.72;gs.p1.y=gs.p2.y=FLOOR;
          gs.p1.vy=gs.p2.vy=0;gs.p1.state=gs.p2.state='idle';gs.p1.energy=gs.p2.energy=0;
          gs.timer=99;gs.lastSec=Date.now();gs.round++;
          gs.phase='countdown';gs.cd3=3;gs.cdTimer=60;
          bgMusic();
        }
      },2000);
    }
    function loop(){
      raf.current=requestAnimationFrame(loop);if(stopped)return;frame++;
      dims();
      var p1=gs.p1,p2=gs.p2;
      var FH=Math.round(SC*100);p1.H=p2.H=FH;
      var MS1=player.spd*1.3*SC,MS2=opponent.spd*1.3*SC;
      var G=0.55*SC,JF=-13*SC;
      // Countdown
      if(gs.phase==='countdown'){
        gs.cdTimer--;
        if(gs.cdTimer<=0){gs.cd3--;gs.cdTimer=60;if(gs.cd3<=0){gs.phase='fight';bgMusic();}}
      }
      // Fight physics
      if(gs.phase==='fight'){
        cpuDecide();
        // CPU move toward player if state=walk
        if(p2.state==='walk'){if(p2.x>p1.x)p2.x-=MS2;else p2.x+=MS2;}
        // Gravity
        [p1,p2].forEach(function(p){p.y+=p.vy;p.vy+=G;if(p.y>=FLOOR){p.y=FLOOR;p.vy=0;}});
        // Bounds
        p1.x=Math.max(50,Math.min(GW-50,p1.x));p2.x=Math.max(50,Math.min(GW-50,p2.x));
        // Separate
        if(Math.abs(p1.x-p2.x)<55){var push=(55-Math.abs(p1.x-p2.x))*0.5;if(p1.x<p2.x){p1.x-=push;p2.x+=push;}else{p1.x+=push;p2.x-=push;}}
        // Face each other
        p1.dir=p1.x<p2.x?1:-1;p2.dir=p2.x<p1.x?1:-1;
        // Cooldowns & attack frames
        [p1,p2].forEach(function(p){if(p.cd>0)p.cd--;if(['punch','kick','special','hurt'].indexOf(p.state)>=0){p.af++;var dur={punch:14,kick:20,special:26,hurt:12};if(p.af>=(dur[p.state]||14))p.state='idle';}if(p.state==='block'&&p.cd<=0)p.state='idle';});
        // Energy regen slowly
        if(frame%60===0){p1.energy=Math.min(100,p1.energy+2);p2.energy=Math.min(100,p2.energy+2);}
        // Timer
        if(Date.now()-gs.lastSec>=1000){gs.timer--;gs.lastSec=Date.now();}
        // Round end check
        if(!gs.over&&(p1.hp<=0||p2.hp<=0||gs.timer<=0))endRound();
      }
      if(gs.shake>0)gs.shake-=2;
      updateParts(gs.parts);
      // ── DRAW ──
      ctx.save();
      if(gs.shake>0){ctx.translate((Math.random()-0.5)*gs.shake,(Math.random()-0.5)*gs.shake);}
      drawBG(ctx,GW,GH,stage,frame);
      drawParts(ctx,gs.parts);
      drawFighter(ctx,p1,frame);
      drawFighter(ctx,p2,frame);
      // HUD
      var barW=GW*0.35,barH=14,barY=8,barX1=4,barX2=GW-barW-4;
      drawHPBar(ctx,barX1,barY,barW,barH,p1.hp/p1.maxHp,player.color,player.name,false,p1.energy);
      drawHPBar(ctx,barX2,barY,barW,barH,p2.hp/p2.maxHp,opponent.color,opponent.name,true,p2.energy);
      // Timer
      ctx.fillStyle=gs.timer<=10?'#ef4444':'#f59e0b';ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=12;
      ctx.font='bold '+Math.round(GH*0.08)+'px Rajdhani,sans-serif';ctx.textAlign='center';ctx.textBaseline='top';
      if(gs.phase==='fight'||gs.phase==='roundOver')ctx.fillText(gs.timer,GW/2,2);
      ctx.shadowBlur=0;
      // Rounds
      ctx.font='10px Inter,sans-serif';ctx.fillStyle='#fff';ctx.textAlign='center';
      ctx.fillText('Round '+gs.round+' | '+gs.p1r+' - '+gs.p2r,GW/2,barH+12);
      // Countdown overlay
      if(gs.phase==='countdown'){
        ctx.fillStyle='rgba(0,0,0,0.6)';ctx.fillRect(0,0,GW,GH);
        ctx.shadowColor='#f59e0b';ctx.shadowBlur=40;ctx.fillStyle='#f59e0b';
        ctx.font='bold '+Math.round(GH*0.2)+'px Rajdhani,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
        ctx.fillText(gs.cd3>0?gs.cd3:'FIGHT!',GW/2,GH/2);ctx.shadowBlur=0;
      }
      // KO overlay
      if(gs.phase==='roundOver'||gs.phase==='matchOver'){
        ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,0,GW,GH);
        ctx.shadowColor='#ef4444';ctx.shadowBlur=35;ctx.fillStyle='#ef4444';
        ctx.font='bold '+Math.round(GH*0.15)+'px Rajdhani,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
        ctx.fillText('K.O.',GW/2,GH/2-20);ctx.shadowBlur=0;
        ctx.fillStyle='#fff';ctx.font='bold '+Math.round(GH*0.055)+'px Inter,sans-serif';
        ctx.fillText(gs.phase==='matchOver'?(gs.p1r>=2?'YOU WIN!':'YOU LOSE!'):('Round '+gs.round+' Over'),GW/2,GH/2+30);
      }
      // Energy label
      if(p1.energy>=80){ctx.fillStyle='#fbbf24';ctx.font='bold 10px Rajdhani,sans-serif';ctx.textAlign='left';ctx.textBaseline='top';ctx.shadowColor='#fbbf24';ctx.shadowBlur=8;ctx.fillText('⚡ SPECIAL READY',barX1,barY+barH+8);ctx.shadowBlur=0;}
      ctx.restore();
    }
    loop();
    return function(){stopped=true;cancelAnimationFrame(raf.current);stopBg();window.removeEventListener('resize',resize);delete window._ga;};
  },[]);

  var btnS={flexShrink:0,touchAction:'manipulation',WebkitTapHighlightColor:'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontFamily:'Rajdhani,sans-serif',letterSpacing:1,border:'none',borderRadius:12};
  function mv(d){var gs=gsRef.current;if(!gs||gs.phase!=='fight')return;var p1=gs.p1,MS=player.spd*1.3;if(d==='l')p1.x=Math.max(50,p1.x-MS);else if(d==='r')p1.x=Math.min(9999,p1.x+MS);else if(d==='j'&&p1.y>=p1.y-1)p1.vy=-13;}
  function atk(a){if(window._ga)window._ga(a);try{if(navigator.vibrate)navigator.vibrate(18);}catch(e){}}
  return (
    <div style={{position:'fixed',inset:0,background:'#030308',display:'flex',flexDirection:'column',overflow:'hidden',touchAction:'none'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'3px 12px',background:'#000',flexShrink:0,height:28,borderBottom:'2px solid rgba(245,158,11,0.2)'}}>
        <span style={{fontFamily:'Rajdhani,sans-serif',fontWeight:900,fontSize:15,color:'#f59e0b',letterSpacing:4}}>DOMINEX</span>
        <button style={Object.assign({},btnS,{padding:'2px 10px',background:'rgba(239,68,68,0.14)',color:'#ef4444',fontSize:11,border:'1px solid rgba(239,68,68,0.28)'})} onClick={function(){if(window._ga)window._ga=null;window.location.href='/arena';}}>✕</button>
      </div>
      <div style={{flex:1,display:'flex',overflow:'hidden'}}>
        <div style={{width:128,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:7,padding:'6px 8px',background:'rgba(0,0,0,0.6)',flexShrink:0,borderRight:'1px solid rgba(255,255,255,0.04)'}}>
          <button onPointerDown={function(){mv('j');}} style={Object.assign({},btnS,{width:54,height:46,background:'rgba(139,92,246,0.18)',border:'2px solid rgba(139,92,246,0.5)',color:'#a78bfa',fontSize:20})}>↑</button>
          <div style={{display:'flex',gap:6}}>
            <button onPointerDown={function(){mv('l');}} style={Object.assign({},btnS,{width:54,height:46,background:'rgba(139,92,246,0.18)',border:'2px solid rgba(139,92,246,0.5)',color:'#a78bfa',fontSize:20})}>◀</button>
            <button onPointerDown={function(){mv('r');}} style={Object.assign({},btnS,{width:54,height:46,background:'rgba(139,92,246,0.18)',border:'2px solid rgba(139,92,246,0.5)',color:'#a78bfa',fontSize:20})}>▶</button>
          </div>
          <div style={{fontSize:8,color:'rgba(139,92,246,0.5)',fontWeight:700,letterSpacing:1}}>MOVE</div>
        </div>
        <canvas ref={cvRef} style={{flex:1,minWidth:0}}/>
        <div style={{width:128,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:6,padding:'6px 8px',background:'rgba(0,0,0,0.6)',flexShrink:0,borderLeft:'1px solid rgba(255,255,255,0.04)'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,width:'100%'}}>
            <button onPointerDown={function(){atk('punch');}} style={Object.assign({},btnS,{height:50,flexDirection:'column',gap:1,background:'rgba(34,197,94,0.18)',border:'2px solid rgba(34,197,94,0.55)',color:'#4ade80',fontSize:20})}>👊<span style={{fontSize:8}}>HIT</span></button>
            <button onPointerDown={function(){atk('kick');}} style={Object.assign({},btnS,{height:50,flexDirection:'column',gap:1,background:'rgba(245,158,11,0.18)',border:'2px solid rgba(245,158,11,0.55)',color:'#fbbf24',fontSize:20})}>🦶<span style={{fontSize:8}}>KICK</span></button>
            <button onPointerDown={function(){atk('block');}} style={Object.assign({},btnS,{height:50,flexDirection:'column',gap:1,background:'rgba(59,130,246,0.18)',border:'2px solid rgba(59,130,246,0.55)',color:'#60a5fa',fontSize:20})}>🛡️<span style={{fontSize:8}}>BLOCK</span></button>
            <button onPointerDown={function(){atk('special');}} style={Object.assign({},btnS,{height:50,flexDirection:'column',gap:1,background:'rgba(239,68,68,0.22)',border:'2px solid rgba(239,68,68,0.65)',color:'#f87171',fontSize:20,boxShadow:'0 0 14px rgba(239,68,68,0.3)'})}>⚡<span style={{fontSize:8}}>SPEC</span></button>
          </div>
          <div style={{fontSize:8,color:'rgba(239,68,68,0.5)',fontWeight:700,letterSpacing:1}}>ATTACK</div>
        </div>
      </div>
    </div>
  );
}

// ── RESULT SCREEN ─────────────────────────────────────────────────────────────
function ResultScreen({result,player,opponent,stage,onNext,onRetry,onMenu}){
  var win=result.winner==='win';
  return (
    <div style={{position:'fixed',inset:0,background:win?'radial-gradient(ellipse at center,#0d1a00,#000)':'radial-gradient(ellipse at center,#1a0000,#000)',color:'#fff',fontFamily:'Inter,sans-serif',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:16,padding:20}}>
      <div style={{fontSize:win?80:64,lineHeight:1,filter:'drop-shadow(0 0 24px '+(win?player.color:opponent.color)+')'}}>{win?player.emoji:opponent.emoji}</div>
      <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:52,fontWeight:900,color:win?player.color:'#ef4444',textShadow:'0 0 30px '+(win?player.color+'88':'#ef444488'),lineHeight:1}}>{win?'YOU WIN!':'YOU LOSE!'}</div>
      <div style={{fontSize:13,color:win?'#22c55e':'#ef4444',fontWeight:700}}>Stage {stage} {win?'Complete!':'Failed — Try Again'}</div>
      <div style={{display:'flex',flexDirection:'column',gap:10,width:'100%',maxWidth:280}}>
        {win&&stage<15&&<button onClick={onNext} style={{padding:'16px',borderRadius:14,background:'linear-gradient(135deg,#22c55e,#16a34a)',border:'none',color:'#000',fontWeight:900,fontSize:19,fontFamily:'Rajdhani,sans-serif',letterSpacing:2,cursor:'pointer',touchAction:'manipulation',WebkitTapHighlightColor:'transparent'}}>NEXT STAGE ▶ ({stage+1}/15)</button>}
        {win&&stage>=15&&<button onClick={onMenu} style={{padding:'16px',borderRadius:14,background:'linear-gradient(135deg,#f59e0b,#fbbf24)',border:'none',color:'#000',fontWeight:900,fontSize:18,fontFamily:'Rajdhani,sans-serif',letterSpacing:2,cursor:'pointer',touchAction:'manipulation'}}>🏆 CHAMPION!</button>}
        {!win&&<button onClick={onRetry} style={{padding:'16px',borderRadius:14,background:'linear-gradient(135deg,#ef4444,#f59e0b)',border:'none',color:'#000',fontWeight:900,fontSize:19,fontFamily:'Rajdhani,sans-serif',letterSpacing:2,cursor:'pointer',touchAction:'manipulation',WebkitTapHighlightColor:'transparent'}}>RETRY ↺ Stage {stage}</button>}
        <button onClick={onMenu} style={{padding:'12px',borderRadius:12,background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.12)',color:'#94a3b8',fontWeight:700,fontSize:14,cursor:'pointer',touchAction:'manipulation',WebkitTapHighlightColor:'transparent'}}>🏠 Main Menu</button>
      </div>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function Arena(){
  var ss=useState('splash'),screen=ss[0],setScreen=ss[1];
  var ps=useState(null),player=ps[0],setPlayer=ps[1];
  var stg=useState(1),stage=stg[0],setStage=stg[1];
  var rs=useState(null),result=rs[0],setResult=rs[1];
  var saved=parseInt(typeof window!=='undefined'?(localStorage.getItem('dominex_stage')||'1'):'1',10)||1;
  var opponent=TOWER[Math.min(stage-1,TOWER.length-1)];
  useEffect(function(){
    try{if(typeof window!=='undefined'&&window.matchMedia('(display-mode: standalone)').matches)document.documentElement.requestFullscreen&&document.documentElement.requestFullscreen().catch(function(){});}catch(e){}
    if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js').catch(function(){});
    var s=parseInt(localStorage.getItem('dominex_stage')||'1',10);
    if(s>1)setStage(s);
  },[]);
  if(screen==='splash')return <SplashScreen onPlay={function(){setScreen('select');}} savedStage={saved}/>;
  if(screen==='select')return <SelectScreen onSelect={function(c){setPlayer(c);setScreen('vs');}} stage={stage}/>;
  if(screen==='vs')return <VSScreen player={player} opponent={opponent} stage={stage} onDone={function(){setScreen('fight');}}/>;
  if(screen==='fight')return <FightScreen player={player} opponent={opponent} stage={stage} onResult={function(r){setResult(r);setScreen('result');}}/>;
  if(screen==='result')return <ResultScreen result={result} player={player} opponent={opponent} stage={stage}
    onNext={function(){var ns=stage+1;setStage(ns);localStorage.setItem('dominex_stage',ns);setScreen('vs');}}
    onRetry={function(){setScreen('fight');}}
    onMenu={function(){setStage(1);setPlayer(null);setResult(null);setScreen('splash');}}/>;
  return null;
}
