'use strict'; // v3.0 MK-style fullscreen+canvas
(function(){

// =========================================================
// DATA
// =========================================================
var CHARS=[
  {id:'scorpion',name:'SCORPION',title:'Hell Ninja',    color:'#f59e0b',accent:'#fbbf24',hp:100,spd:8,pow:9, def:7, rarity:'Common',   spl:'Spear Pull',  em:'\uD83D\uDD25',bW:1.0,bH:1.0},
  {id:'subzero', name:'SUB-ZERO',title:'Ice Warrior',   color:'#38bdf8',accent:'#7dd3fc',hp:95, spd:7,pow:8, def:9, rarity:'Common',   spl:'Ice Freeze',  em:'\u2744\uFE0F',bW:1.05,bH:1.0},
  {id:'liukang', name:'LIU KANG',title:'Shaolin Monk',  color:'#ef4444',accent:'#fca5a5',hp:90, spd:9,pow:9, def:7, rarity:'Rare',     spl:'Flying Kick', em:'\uD83E\uDD4B',bW:0.9,bH:1.05},
  {id:'raiden',  name:'RAIDEN',  title:'Thunder God',   color:'#8b5cf6',accent:'#c4b5fd',hp:95, spd:6,pow:10,def:9, rarity:'Legendary',spl:'Lightning',   em:'\u26A1',bW:1.15,bH:1.1},
  {id:'reptile', name:'REPTILE', title:'Hidden Fighter', color:'#22c55e',accent:'#86efac',hp:88, spd:9,pow:8, def:7, rarity:'Rare',     spl:'Acid Spit',   em:'\uD83E\uDD8E',bW:0.85,bH:0.92},
  {id:'kitana',  name:'KITANA',  title:'Fan Assassin',  color:'#06b6d4',accent:'#67e8f9',hp:85, spd:10,pow:8,def:6, rarity:'Epic',     spl:'Fan Throw',   em:'\uD83E\uDEAD',bW:0.8,bH:0.95},
  {id:'mileena', name:'MILEENA', title:'Evil Twin',     color:'#f472b6',accent:'#f9a8d4',hp:82, spd:10,pow:9,def:5, rarity:'Rare',     spl:'Sai Throw',   em:'\uD83D\uDDE1\uFE0F',bW:0.8,bH:0.95},
  {id:'jaxon',   name:'JAXON',   title:'Metal Arms',    color:'#78716c',accent:'#d6d3d1',hp:110,spd:5, pow:10,def:10,rarity:'Epic',     spl:'Ground Pound',em:'\uD83E\uDDBE',bW:1.35,bH:1.12},
  {id:'baraka',  name:'BARAKA',  title:'Blade Fighter', color:'#fb923c',accent:'#fdba74',hp:92, spd:7, pow:10,def:8, rarity:'Epic',     spl:'Blade Fury',  em:'\u2694\uFE0F',bW:1.0,bH:1.05},
  {id:'smoke',   name:'SMOKE',   title:'Gray Ninja',    color:'#a78bfa',accent:'#c4b5fd',hp:80, spd:10,pow:9, def:5, rarity:'Rare',     spl:'Smoke Screen', em:'\uD83D\uDCA8',bW:0.88,bH:0.95},
  {id:'cyrax',   name:'CYRAX',   title:'Yellow Robot',  color:'#a3e635',accent:'#d9f99d',hp:88, spd:8, pow:8, def:8, rarity:'Common',   spl:'Net Trap',    em:'\uD83E\uDD16',bW:1.1,bH:1.0},
  {id:'sektor',  name:'SEKTOR',  title:'Red Robot',     color:'#dc2626',accent:'#fca5a5',hp:90, spd:8, pow:9, def:8, rarity:'Epic',     spl:'Missiles',    em:'\uD83D\uDE80',bW:1.1,bH:1.0},
  {id:'kunglao', name:'KUNG LAO',title:'Hat Fighter',   color:'#e2e8f0',accent:'#f1f5f9',hp:88, spd:9, pow:8, def:7, rarity:'Legendary',spl:'Hat Throw',   em:'\uD83C\uDFA9',bW:0.95,bH:1.0},
  {id:'nightwolf',name:'NIGHTWOLF',title:'Spirit Warrior',color:'#84cc16',accent:'#bef264',hp:92,spd:7,pow:9,def:8,rarity:'Mythic',  spl:'Spirit Arrow',em:'\uD83C\uDFF9',bW:1.1,bH:1.05},
  {id:'noob',    name:'NOOB',    title:'Dark Shadow',   color:'#64748b',accent:'#94a3b8',hp:85, spd:9, pow:10,def:6, rarity:'Mythic',   spl:'Shadow Clone',em:'\uD83D\uDC64',bW:0.92,bH:1.0},
  {id:'goro',    name:'GORO',    title:'Final Boss',    color:'#d97706',accent:'#fbbf24',hp:220,spd:4, pow:10,def:10,rarity:'BOSS',     spl:'Stomp Quake', em:'\uD83D\uDC79',boss:true,bW:1.6,bH:1.3},
];
var PLAYABLE=CHARS.filter(function(c){return !c.boss;});
var TOWER_ORDER=['cyrax','reptile','liukang','subzero','kitana','mileena','baraka','smoke','scorpion','kunglao','nightwolf','raiden','sektor','noob','goro'];
var TOWER=TOWER_ORDER.map(function(id){return CHARS.find(function(c){return c.id===id;});});

// =========================================================
// STATE
// =========================================================
var G={
  screen:'splash',
  player:null,
  stage:1,
  selIdx:0,
  gs:null,
  raf:null,
  cpuTick:0,
  stopped:false,
  bgInt:null,
};
// SPRITE SYSTEM
var SPRITES={};
var SPRITE_BASE='sprites/';
function removeBlackBG(img){
  try{
    var cv=document.createElement('canvas');
    cv.width=img.width;cv.height=img.height;
    var cx=cv.getContext('2d');
    cx.drawImage(img,0,0);
    var d=cx.getImageData(0,0,cv.width,cv.height);
    var px=d.data;
    var w=cv.width,h=cv.height;
    // Mark which pixels are "background" using flood fill from edges
    var bg=new Uint8Array(w*h);
    var stack=[];
    // Seed from all edge pixels
    for(var ex=0;ex<w;ex++){stack.push(ex);stack.push(0);stack.push(ex);stack.push(h-1);}
    for(var ey=0;ey<h;ey++){stack.push(0);stack.push(ey);stack.push(w-1);stack.push(ey);}
    while(stack.length>0){
      var sy=stack.pop(),sx=stack.pop();
      if(sx<0||sx>=w||sy<0||sy>=h)continue;
      var idx=sy*w+sx;
      if(bg[idx])continue;
      var pi=idx*4;
      var bright=px[pi]*0.299+px[pi+1]*0.587+px[pi+2]*0.114;
      if(bright<22){
        bg[idx]=1;
        stack.push(sx-1);stack.push(sy);
        stack.push(sx+1);stack.push(sy);
        stack.push(sx);stack.push(sy-1);
        stack.push(sx);stack.push(sy+1);
      }
    }
    // Now only make bg-marked pixels transparent
    for(var i=0;i<w*h;i++){
      if(bg[i]){px[i*4+3]=0;}
    }
    cx.putImageData(d,0,0);
    var cleaned=new Image();
    cleaned.src=cv.toDataURL();
    return cleaned;
  }catch(e){
    console.log('BG remove failed:',e);
    return img;
  }
}
function loadSprite(charId,pose){
  var key=charId+'_'+pose;
  if(SPRITES[key])return;
  var img=new Image();
  img.src=SPRITE_BASE+key+'.png';
  img.onload=function(){
    // Small delay to ensure image is fully decoded
    setTimeout(function(){SPRITES[key]=removeBlackBG(img);},50);
  };
  img.onerror=function(){SPRITES[key]=null;};
}
function initSprites(){
  var poses=['idle','punch','kick','block','hurt'];
  poses.forEach(function(p){loadSprite('scorpion',p);});
}
initSprites();
var KEYS={left:false,right:false,jump:false};

// =========================================================
// AUDIO
// =========================================================
var AC_ctx=null;
function AC(){if(!AC_ctx)try{AC_ctx=new(window.AudioContext||window.webkitAudioContext)();}catch(e){}if(AC_ctx&&AC_ctx.state==='suspended')AC_ctx.resume().catch(function(){});return AC_ctx;}
function beep(freq,type,dur,vol,delay){var ac=AC();if(!ac)return;var o=ac.createOscillator(),g=ac.createGain(),t=ac.currentTime+(delay||0);o.type=type||'sine';o.frequency.value=freq;g.gain.setValueAtTime(vol||0.2,t);g.gain.exponentialRampToValueAtTime(0.001,t+dur);o.connect(g);g.connect(ac.destination);o.start(t);o.stop(t+dur);}
// Generate noise buffer for impact sounds
var _noiseBuf=null;
function getNoise(){
  var ac=AC();if(!ac)return null;
  if(!_noiseBuf){
    _noiseBuf=ac.createBuffer(1,ac.sampleRate*0.3,ac.sampleRate);
    var d=_noiseBuf.getChannelData(0);
    for(var i=0;i<d.length;i++)d[i]=(Math.random()*2-1);
  }
  return _noiseBuf;
}
function playNoise(dur,vol,freq){
  var ac=AC();if(!ac)return;
  var buf=getNoise();if(!buf)return;
  var src=ac.createBufferSource();src.buffer=buf;
  var flt=ac.createBiquadFilter();flt.type='bandpass';flt.frequency.value=freq||800;flt.Q.value=1;
  var g=ac.createGain();g.gain.setValueAtTime(vol||0.2,ac.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ac.currentTime+dur);
  src.connect(flt);flt.connect(g);g.connect(ac.destination);src.start();src.stop(ac.currentTime+dur);
}
function snd(type){try{
  if(type==='punch'){
    beep(150,'sawtooth',0.06,0.35);beep(80,'square',0.04,0.2);
    playNoise(0.08,0.25,1200);
  }
  else if(type==='kick'){
    beep(80,'square',0.12,0.4);beep(60,'sawtooth',0.08,0.25);
    playNoise(0.1,0.3,600);
  }
  else if(type==='block'){
    beep(1200,'triangle',0.03,0.15);beep(800,'sine',0.05,0.1);
    playNoise(0.04,0.12,3000);
  }
  else if(type==='special'){
    beep(120,'sawtooth',0.08,0.3);beep(400,'sawtooth',0.25,0.3,0.08);
    beep(600,'sine',0.15,0.2,0.2);playNoise(0.15,0.2,1500);
  }
  else if(type==='hit'){
    beep(200,'sawtooth',0.08,0.3);playNoise(0.1,0.28,1000);
    beep(100,'square',0.05,0.15);
  }
  else if(type==='ko'){
    beep(300,'sawtooth',0.06,0.4);beep(80,'sawtooth',0.8,0.35,0.06);
    playNoise(0.3,0.25,400);
  }
  else if(type==='select'){beep(523,'sine',0.06,0.1);beep(659,'sine',0.06,0.08,0.07);}
  else if(type==='start'){beep(400,'square',0.06,0.3);beep(600,'square',0.06,0.3,0.1);beep(800,'square',0.1,0.25,0.2);}
  else if(type==='cd'){beep(440,'sine',0.1,0.15);}
  else if(type==='fight'){beep(300,'square',0.04,0.4);beep(500,'square',0.04,0.35,0.05);beep(700,'square',0.12,0.3,0.1);playNoise(0.15,0.2,2000);}
  else if(type==='finishhim'){beep(150,'sawtooth',0.15,0.4);beep(100,'square',0.3,0.35,0.15);beep(80,'sawtooth',0.25,0.3,0.4);playNoise(0.4,0.2,300);}
  else if(type==='combo'){beep(600,'sine',0.04,0.15);beep(800,'sine',0.04,0.12,0.05);}
}catch(e){}}

// =========================================================
// MK ANNOUNCER VOICE (Speech Synthesis)
// =========================================================
var _voices=null;
function _getVoice(){
  if(!_voices)_voices=window.speechSynthesis?speechSynthesis.getVoices():[];
  for(var i=0;i<_voices.length;i++){if(_voices[i].lang.indexOf('en')===0&&_voices[i].name.toLowerCase().indexOf('male')>=0)return _voices[i];}
  for(var j=0;j<_voices.length;j++){if(_voices[j].lang.indexOf('en')===0)return _voices[j];}
  return _voices[0]||null;
}
if(window.speechSynthesis)try{speechSynthesis.onvoiceschanged=function(){_voices=speechSynthesis.getVoices();};}catch(e){}
function announce(text,delayMs){
  setTimeout(function(){
    try{
      if(!window.speechSynthesis)return;
      speechSynthesis.cancel();
      var u=new SpeechSynthesisUtterance(text);
      u.rate=0.72;u.pitch=0.35;u.volume=1;
      var v=_getVoice();if(v)u.voice=v;
      speechSynthesis.speak(u);
    }catch(e){}
  },delayMs||0);
}
var ROUND_WORDS=['','One','Two','Three'];

// =========================================================
// COMBO SYSTEM
// =========================================================
var COMBO={count:0,timer:0,lastHitter:null,text:'',textTimer:0,flash:0};
function comboHit(hitter,dmg){
  if(COMBO.lastHitter===hitter&&COMBO.timer>0){
    COMBO.count++;
  } else {
    COMBO.count=1;
  }
  COMBO.lastHitter=hitter;COMBO.timer=90;
  var bonus=Math.min((COMBO.count-1)*0.12,0.6);
  if(COMBO.count>=2){
    COMBO.text=COMBO.count+'x COMBO!';
    COMBO.textTimer=70;
    snd('combo');
    if(COMBO.count>=3)announce(COMBO.count+' hit combo',0);
  }
  COMBO.flash=8;
  return Math.round(dmg*(1+bonus));
}
function tickCombo(){if(COMBO.timer>0)COMBO.timer--;else{COMBO.count=0;COMBO.lastHitter=null;}if(COMBO.textTimer>0)COMBO.textTimer--;if(COMBO.flash>0)COMBO.flash--;}

// =========================================================
// UTILS
// =========================================================
function $(id){return document.getElementById(id);}
function showScreen(name){
  document.querySelectorAll('.screen').forEach(function(s){s.classList.remove('active');});
  if(name==='splash')$('splash').classList.add('active');
  else if(name==='select')$('select').classList.add('active');
  else if(name==='vs')$('vs-screen').classList.add('active');
  else if(name==='result')$('result-screen').classList.add('active');
  $('fight-ui').style.display=name==='fight'?'flex':'none';
}
function save(){try{localStorage.setItem('dnx_stage',G.stage);}catch(e){}}
function load(){try{var s=parseInt(localStorage.getItem('dnx_stage')||'1',10);G.stage=isNaN(s)||s<1?1:Math.min(s,15);}catch(e){}}

// =========================================================
// CANVAS DRAWING - PREMIUM MK-STYLE CHARACTERS
// =========================================================
function drawLimb(ctx,x1,y1,x2,y2,w,col,highlight){
  // Thick limb with subtle 3D effect
  ctx.strokeStyle=col;ctx.lineWidth=w;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
  // Highlight edge for 3D
  if(highlight){
    ctx.strokeStyle=highlight;ctx.lineWidth=Math.max(1,w*0.3);
    ctx.beginPath();ctx.moveTo(x1-1,y1);ctx.lineTo(x2-1,y2);ctx.stroke();
  }
}
function drawJoint(ctx,x,y,r,col){
  ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
}
function lighter(col,amt){
  // Simple hex lighten
  try{var r=parseInt(col.slice(1,3),16),g=parseInt(col.slice(3,5),16),b=parseInt(col.slice(5,7),16);
  return'rgb('+Math.min(255,r+amt)+','+Math.min(255,g+amt)+','+Math.min(255,b+amt)+')';}catch(e){return col;}
}

function drawFighter(ctx,f,t){
  var x=f.x,y=f.y,dir=f.dir,c=f.ch.color,ac=f.ch.accent,id=f.ch.id;
  var H=f.H*(f.ch.bH||1),st=f.state,af=f.af;
  var bwM=f.ch.bW||1;

  // TRY SPRITE FIRST
  var sprPose=st==='walk'?'idle':(st==='special'?'punch':st);
  var sprKey=id+'_'+sprPose;
  var spr=SPRITES[sprKey];
  if(spr){
    ctx.save();
    var sprH=H*1.15;
    var sprW=sprH*(spr.width/spr.height);
    ctx.translate(x,y);
    if(dir<0)ctx.scale(-1,1);

    // FIGHTING STANCE ANIMATION (combat-ready sway)
    var bob=0,lean=0,breathe=1;
    if(st==='idle'){
      bob=Math.sin(t*0.06)*2;
      lean=Math.sin(t*0.04)*0.03; // slight body lean
      breathe=1+Math.sin(t*0.08)*0.015; // breathing scale
    }
    if(st==='walk'){bob=Math.sin(t*0.3)*3;}

    // Shadow
    ctx.fillStyle='rgba(0,0,0,0.4)';ctx.beginPath();ctx.ellipse(0,5,sprW*0.38,7,0,0,Math.PI*2);ctx.fill();

    // HURT EFFECTS
    if(st==='hurt'){
      ctx.save();
      ctx.translate(Math.sin(af*2)*4,0); // shake
      if(Math.floor(af/2)%2===0){ctx.globalAlpha=0.4;}
      ctx.drawImage(spr,-sprW/2,-sprH+bob,sprW,sprH);
      ctx.globalAlpha=0.3;ctx.fillStyle='#ff0000';
      ctx.fillRect(-sprW/2,-sprH+bob,sprW,sprH);
      ctx.globalAlpha=1;
      ctx.restore();
    }
    // BLOCK EFFECTS
    else if(st==='block'){
      ctx.drawImage(spr,-sprW/2,-sprH+bob,sprW,sprH);
      // Shield glow rings
      ctx.strokeStyle=c+'88';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,-sprH*0.45,sprW*0.45,0,Math.PI*2);ctx.stroke();
      ctx.strokeStyle=c+'44';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,-sprH*0.45,sprW*0.55,0,Math.PI*2);ctx.stroke();
      ctx.strokeStyle='rgba(255,255,255,0.2)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,-sprH*0.45,sprW*0.35,0,Math.PI*2);ctx.stroke();
    }
    // PUNCH EFFECTS
    else if(st==='punch'){
      var pF=Math.sin(af/14*Math.PI);
      ctx.drawImage(spr,-sprW/2,-sprH+bob,sprW,sprH);
      // Punch impact trail / speed lines
      if(pF>0.3){
        ctx.strokeStyle=c+'66';ctx.lineWidth=2;
        for(var pl=0;pl<4;pl++){
          var py=-sprH*0.42+pl*6;
          ctx.beginPath();ctx.moveTo(sprW*0.3,py);ctx.lineTo(sprW*0.3+pF*20+pl*4,py);ctx.stroke();
        }
        // Impact flash at fist
        ctx.fillStyle='#fff';ctx.globalAlpha=pF*0.6;
        ctx.beginPath();ctx.arc(sprW*0.35+pF*15,-sprH*0.38,6+pF*8,0,Math.PI*2);ctx.fill();
        ctx.globalAlpha=1;
      }
    }
    // KICK EFFECTS
    else if(st==='kick'){
      var kF=Math.sin(af/18*Math.PI);
      ctx.drawImage(spr,-sprW/2,-sprH+bob,sprW,sprH);
      // Kick arc trail
      if(kF>0.3){
        ctx.strokeStyle=c+'55';ctx.lineWidth=2;
        ctx.beginPath();ctx.arc(sprW*0.1,-sprH*0.15,sprW*0.4*kF,-0.5,1.2);ctx.stroke();
        // Impact at foot
        ctx.fillStyle='#fff';ctx.globalAlpha=kF*0.5;
        ctx.beginPath();ctx.arc(sprW*0.3+kF*10,-sprH*0.1,5+kF*6,0,Math.PI*2);ctx.fill();
        ctx.globalAlpha=1;
      }
    }
    // SPECIAL EFFECTS
    else if(st==='special'){
      var sF=Math.sin(af/24*Math.PI);
      // Character glow outline
      ctx.shadowColor=c;ctx.shadowBlur=20;
      ctx.drawImage(spr,-sprW/2,-sprH+bob,sprW,sprH);
      ctx.shadowBlur=0;

      // SCORPION SPEAR CHAIN - "GET OVER HERE!"
      if(id==='scorpion'){
        var chainLen=sF*120;
        var chainY=-sprH*0.42;
        // Chain links
        ctx.strokeStyle='#a8a29e';ctx.lineWidth=2;
        ctx.beginPath();ctx.moveTo(sprW*0.3,chainY);ctx.lineTo(sprW*0.3+chainLen,chainY);ctx.stroke();
        // Chain link dots
        for(var cl=0;cl<chainLen;cl+=8){
          ctx.fillStyle=cl%16<8?'#78716c':'#a8a29e';
          ctx.beginPath();ctx.arc(sprW*0.3+cl,chainY,2,0,Math.PI*2);ctx.fill();
        }
        // Spear tip
        if(sF>0.3){
          var tipX=sprW*0.3+chainLen;
          ctx.fillStyle='#fbbf24';
          ctx.beginPath();ctx.moveTo(tipX,chainY-6);ctx.lineTo(tipX+14,chainY);ctx.lineTo(tipX,chainY+6);ctx.closePath();ctx.fill();
          ctx.strokeStyle='#f59e0b';ctx.lineWidth=1;ctx.stroke();
          // Fire trail behind spear
          for(var ft=0;ft<5;ft++){
            ctx.fillStyle='rgba(245,158,11,'+(0.6-ft*0.1)+')';
            ctx.beginPath();ctx.arc(tipX-ft*10+(Math.random()-0.5)*4,chainY+(Math.random()-0.5)*8,2+Math.random()*3,0,Math.PI*2);ctx.fill();
          }
        }
        // "GET OVER HERE!" text
        if(sF>0.5){
          ctx.font='bold 10px Arial';ctx.fillStyle='#fbbf24';ctx.textAlign='center';
          ctx.fillText('GET OVER HERE!',sprW*0.3+chainLen*0.5,chainY-14);
        }
      } else {
        // Default energy orb for non-Scorpion
        ctx.fillStyle=c+'55';ctx.beginPath();ctx.arc(sprW*0.4+sF*15,-sprH*0.42,20+sF*10,0,Math.PI*2);ctx.fill();
        ctx.fillStyle=c+'99';ctx.beginPath();ctx.arc(sprW*0.4+sF*15,-sprH*0.42,12+sF*6,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(sprW*0.4+sF*15,-sprH*0.42,4,0,Math.PI*2);ctx.fill();
      }
      // Fire particles
      for(var sp=0;sp<6;sp++){
        ctx.fillStyle=c+'88';
        ctx.beginPath();ctx.arc(
          sprW*0.4+sF*15+(Math.random()-0.5)*20,
          -sprH*0.42+(Math.random()-0.5)*20,
          2+Math.random()*4,0,Math.PI*2);ctx.fill();
      }
    }
    // IDLE + WALK (fighting stance ready)
    else {
      ctx.save();
      ctx.rotate(lean||0);
      ctx.scale(breathe||1,breathe||1);
      ctx.drawImage(spr,-sprW/2,-sprH+bob,sprW,sprH);
      ctx.restore();
      // Fist bob effect (hands moving up/down ready to fight)
      if(st==='idle'){
        var fistBob=Math.sin(t*0.12)*3;
        ctx.fillStyle=c+'44';
        ctx.beginPath();ctx.arc(sprW*0.28,-sprH*0.4+fistBob,4,0,Math.PI*2);ctx.fill();
        ctx.beginPath();ctx.arc(-sprW*0.15,-sprH*0.42-fistBob,3,0,Math.PI*2);ctx.fill();
      }
    }

    // SCORPION IDLE FIRE on hands + body heat
    if(id==='scorpion'&&(st==='idle'||st==='walk')){
      // Hand fire
      ctx.fillStyle='rgba(245,158,11,0.6)';
      for(var fi=0;fi<4;fi++){
        ctx.beginPath();ctx.arc(
          sprW*0.25+(Math.random()-0.5)*10,
          -sprH*0.38-Math.random()*12,
          2+Math.random()*4,0,Math.PI*2);ctx.fill();
      }
      // Small fire on other hand
      ctx.fillStyle='rgba(245,158,11,0.35)';
      for(var fi2=0;fi2<2;fi2++){
        ctx.beginPath();ctx.arc(
          -sprW*0.15+(Math.random()-0.5)*6,
          -sprH*0.42-Math.random()*8,
          1+Math.random()*3,0,Math.PI*2);ctx.fill();
      }
      // Heat shimmer below
      ctx.fillStyle='rgba(245,158,11,0.08)';
      ctx.beginPath();ctx.arc(0,-sprH*0.15,sprW*0.3,0,Math.PI*2);ctx.fill();
    }
    // SUB-ZERO ICE idle
    if(id==='subzero'&&(st==='idle'||st==='walk')){
      ctx.fillStyle='rgba(56,189,248,0.4)';
      for(var ic=0;ic<3;ic++){
        ctx.beginPath();ctx.arc(
          sprW*0.25+(Math.random()-0.5)*8,
          -sprH*0.38-Math.random()*10,
          1+Math.random()*2,0,Math.PI*2);ctx.fill();
      }
    }

    ctx.restore();
    return;
  }

  // CANVAS FALLBACK
  ctx.save();ctx.translate(x,y);if(dir<0)ctx.scale(-1,1);

  var bob=st==='idle'?Math.sin(t*0.08)*2:0;
  var walkCyc=st==='walk'?Math.sin(t*0.5):0;
  var hurt=st==='hurt';
  var block=st==='block';
  var by=bob+(f.vy<-1?-8:f.vy>1?4:0);
  var punchF=st==='punch'?Math.sin(af/14*Math.PI):0;
  var kickF=st==='kick'?Math.sin(af/18*Math.PI):0;
  var specF=st==='special'?Math.sin(af/24*Math.PI):0;

  if(st==='special'){ctx.shadowColor=c;ctx.shadowBlur=18;}
  if(hurt){ctx.save();ctx.translate(3,0);ctx.rotate(0.12);}

  var headY=-H*0.88+by;
  var neckY=-H*0.78+by;
  var shoulderY=-H*0.74+by;
  var chestY=-H*0.58+by;
  var waistY=-H*0.46+by;
  var hipY=-H*0.42+by;
  var kneeY=-H*0.2+by;
  var footY=by+2;
  var shoulderW=18*bwM;
  var limbW=Math.max(7,9*bwM);
  var skinCol=ac;
  var hi=lighter(c,50);

  // SHADOW (bigger)
  ctx.fillStyle='rgba(0,0,0,0.35)';ctx.beginPath();ctx.ellipse(0,5,24*bwM,6,0,0,Math.PI*2);ctx.fill();

  // AURA
  if(id==='raiden'){ctx.strokeStyle='rgba(139,92,246,0.25)';ctx.lineWidth=1;for(var li=0;li<3;li++){var lx=(Math.random()-0.5)*30;ctx.beginPath();ctx.moveTo(lx,-H*1.1+by);ctx.lineTo(lx+(Math.random()-0.5)*15,-H*0.2+by);ctx.stroke();}}
  if(id==='smoke'){ctx.fillStyle='rgba(167,139,250,0.1)';for(var si=0;si<4;si++){ctx.beginPath();ctx.arc((Math.random()-0.5)*30,-Math.random()*H+by,5+Math.random()*8,0,Math.PI*2);ctx.fill();}}
  if(id==='noob'){ctx.fillStyle='rgba(100,116,139,0.12)';ctx.fillRect(-22,-H*1.05+by,44,H*1.1);}
  if(id==='subzero'){ctx.fillStyle='rgba(125,211,252,0.1)';for(var ii=0;ii<3;ii++){ctx.beginPath();ctx.arc((Math.random()-0.5)*24,-Math.random()*H*0.4-H*0.4+by,2+Math.random()*2,0,Math.PI*2);ctx.fill();}}

  // BACK LEG (thicker)
  var blegSwing=walkCyc*0.4;
  var bkneeX=-5-blegSwing*8,bkneeY2=kneeY+Math.abs(blegSwing)*4,bfootX=-7-blegSwing*12;
  ctx.globalAlpha=0.65;
  drawLimb(ctx,-5,hipY,bkneeX,bkneeY2,limbW+1,c+'cc');
  drawLimb(ctx,bkneeX,bkneeY2,bfootX,footY,limbW,c+'cc');
  drawJoint(ctx,bkneeX,bkneeY2,limbW*0.4,c);
  // Boot (bigger)
  ctx.fillStyle=ac+'aa';
  ctx.beginPath();ctx.moveTo(bfootX-7,footY-2);ctx.lineTo(bfootX+8,footY-2);ctx.lineTo(bfootX+10,footY+4);ctx.lineTo(bfootX-7,footY+4);ctx.closePath();ctx.fill();
  ctx.globalAlpha=1;

  // BACK ARM
  var barmSX=-shoulderW;
  if(block){
    drawLimb(ctx,barmSX,shoulderY,barmSX+6,chestY-4,limbW-1,c+'cc');
    drawLimb(ctx,barmSX+6,chestY-4,-2,shoulderY+8,limbW-2,c+'cc');
  } else {
    var belbowX=barmSX-4-walkCyc*6,belbowY=(shoulderY+waistY)*0.5;
    drawLimb(ctx,barmSX,shoulderY,belbowX,belbowY,limbW-1,c+'cc');
    drawLimb(ctx,belbowX,belbowY,barmSX-2-walkCyc*8,waistY-4,limbW-2,skinCol+'aa');
    drawJoint(ctx,barmSX-2-walkCyc*8,waistY-4,3,skinCol+'aa');
  }

  // TORSO (wider, muscular)
  ctx.fillStyle=c;
  ctx.beginPath();
  ctx.moveTo(-shoulderW-3,shoulderY);
  ctx.lineTo(shoulderW+3,shoulderY);
  ctx.lineTo(shoulderW+1,shoulderY+(waistY-shoulderY)*0.4);
  ctx.lineTo(shoulderW*0.65,waistY);
  ctx.lineTo(-shoulderW*0.65,waistY);
  ctx.lineTo(-shoulderW-1,shoulderY+(waistY-shoulderY)*0.4);
  ctx.closePath();ctx.fill();
  // 3D highlight on torso
  ctx.fillStyle=hi+'22';
  ctx.beginPath();ctx.moveTo(-shoulderW*0.3,shoulderY+2);ctx.lineTo(shoulderW*0.1,shoulderY+2);ctx.lineTo(shoulderW*0.05,chestY);ctx.lineTo(-shoulderW*0.25,chestY);ctx.closePath();ctx.fill();
  // Muscle lines
  ctx.strokeStyle=ac+'44';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(0,shoulderY+4);ctx.lineTo(0,waistY-2);ctx.stroke();
  ctx.beginPath();ctx.moveTo(-shoulderW*0.45,shoulderY+8);ctx.quadraticCurveTo(0,chestY+6,shoulderW*0.45,shoulderY+8);ctx.stroke();
  ctx.beginPath();ctx.moveTo(-shoulderW*0.3,chestY+2);ctx.quadraticCurveTo(0,chestY+10,shoulderW*0.3,chestY+2);ctx.stroke();
  // Belt (wider)
  ctx.fillStyle=ac;ctx.fillRect(-shoulderW*0.7,waistY-4,shoulderW*1.4,6);
  ctx.fillStyle=c;ctx.fillRect(-4,waistY-4,8,6);
  // Armor plating / scale pattern on torso
  ctx.strokeStyle=ac+'33';ctx.lineWidth=0.5;
  for(var tp=0;tp<4;tp++){
    var tpy=shoulderY+6+tp*((waistY-shoulderY-8)/4);
    ctx.beginPath();ctx.moveTo(-shoulderW*0.6,tpy);ctx.lineTo(shoulderW*0.6,tpy);ctx.stroke();
  }
  // CLOTH TABARD (hanging below belt)
  ctx.fillStyle=c+'cc';
  ctx.beginPath();
  ctx.moveTo(-shoulderW*0.55,waistY+1);
  ctx.lineTo(-shoulderW*0.45,hipY+6);
  ctx.lineTo(-shoulderW*0.05,hipY+10);
  ctx.lineTo(shoulderW*0.05,hipY+10);
  ctx.lineTo(shoulderW*0.45,hipY+6);
  ctx.lineTo(shoulderW*0.55,waistY+1);
  ctx.closePath();ctx.fill();
  ctx.strokeStyle=ac+'44';ctx.lineWidth=0.5;
  ctx.beginPath();ctx.moveTo(0,waistY+2);ctx.lineTo(0,hipY+9);ctx.stroke();
  if(id==='scorpion'){ctx.fillStyle='#000';ctx.fillRect(-shoulderW*0.4,shoulderY+6,shoulderW*0.8,3);}
  if(id==='subzero'){ctx.fillStyle='rgba(56,189,248,0.25)';ctx.fillRect(-shoulderW,shoulderY,shoulderW*2,waistY-shoulderY);}
  if(id==='liukang'){ctx.fillStyle='#000';ctx.fillRect(-8,shoulderY+4,16,waistY-shoulderY-6);}
  if(id==='jaxon'){ctx.fillStyle='#a8a29e';ctx.fillRect(-shoulderW-3,shoulderY-2,6,8);ctx.fillRect(shoulderW-3,shoulderY-2,6,8);}
  if(id==='goro'){ctx.fillStyle='#92400e';ctx.fillRect(-shoulderW*0.6,shoulderY+5,shoulderW*1.2,6);}
  // Shoulder pads (bigger)
  drawJoint(ctx,-shoulderW,shoulderY,limbW*0.55,c);
  drawJoint(ctx,shoulderW,shoulderY,limbW*0.55,c);
  drawJoint(ctx,-shoulderW,shoulderY,limbW*0.3,hi);  
  drawJoint(ctx,shoulderW,shoulderY,limbW*0.3,hi);

  // FRONT LEG
  var flegSwing=-walkCyc*0.4;
  var fkneeX=6+flegSwing*8,fkneeY2=kneeY+Math.abs(flegSwing)*4,ffootX=8+flegSwing*12;
  if(kickF>0){
    fkneeX=8+kickF*28;fkneeY2=kneeY-kickF*22;ffootX=14+kickF*48;var ffootYk=footY-kickF*38;
    drawLimb(ctx,6,hipY,fkneeX,fkneeY2,limbW+1,c,hi);drawLimb(ctx,fkneeX,fkneeY2,ffootX,ffootYk,limbW,c);
    drawJoint(ctx,fkneeX,fkneeY2,limbW*0.45,ac);
    // Kick boot with shin guard
    ctx.fillStyle=ac;ctx.beginPath();ctx.moveTo(ffootX-4,ffootYk-4);ctx.lineTo(ffootX+16,ffootYk-2);ctx.lineTo(ffootX+18,ffootYk+5);ctx.lineTo(ffootX-4,ffootYk+5);ctx.closePath();ctx.fill();
    ctx.fillStyle=c;ctx.fillRect(ffootX-2,ffootYk-8,6,6); // shin pad
  } else {
    drawLimb(ctx,6,hipY,fkneeX,fkneeY2,limbW+1,c,hi);drawLimb(ctx,fkneeX,fkneeY2,ffootX,footY,limbW,c);
    drawJoint(ctx,fkneeX,fkneeY2,limbW*0.45,ac);
    // Leg wrapping texture
    ctx.strokeStyle=ac+'55';ctx.lineWidth=0.7;
    var legMidX=(fkneeX+ffootX)/2,legMidY=(fkneeY2+footY)/2;
    ctx.beginPath();ctx.moveTo(legMidX-4,legMidY-3);ctx.lineTo(legMidX+4,legMidY+3);ctx.stroke();
    ctx.beginPath();ctx.moveTo(legMidX-3,legMidY+4);ctx.lineTo(legMidX+3,legMidY+10);ctx.stroke();
    // Boot with shin guard
    ctx.fillStyle=ac;ctx.beginPath();ctx.moveTo(ffootX-7,footY-3);ctx.lineTo(ffootX+10,footY-3);ctx.lineTo(ffootX+12,footY+5);ctx.lineTo(ffootX-7,footY+5);ctx.closePath();ctx.fill();
    ctx.fillStyle=c;ctx.fillRect(ffootX-2,footY-9,6,7); // shin pad
  }
  if(id==='goro'){ctx.globalAlpha=0.8;drawLimb(ctx,-12,hipY,-16,kneeY+5,limbW-2,c+'cc');drawLimb(ctx,-16,kneeY+5,-18,footY,limbW-3,c+'cc');drawLimb(ctx,14,hipY,18,kneeY+5,limbW-2,c+'cc');drawLimb(ctx,18,kneeY+5,20,footY,limbW-3,c+'cc');ctx.globalAlpha=1;}

  // FRONT ARM
  var farmSX=shoulderW;
  if(block){
    drawLimb(ctx,farmSX,shoulderY,4,chestY-6,limbW+1,c);drawLimb(ctx,4,chestY-6,-6,shoulderY+6,limbW,skinCol);drawJoint(ctx,-6,shoulderY+6,5,skinCol);
    // Block shield effect
    ctx.strokeStyle=c+'88';ctx.lineWidth=2;ctx.beginPath();ctx.arc(-2,chestY-2,18,0,Math.PI*2);ctx.stroke();
    ctx.strokeStyle=c+'44';ctx.lineWidth=1;ctx.beginPath();ctx.arc(-2,chestY-2,22,0,Math.PI*2);ctx.stroke();
  } else if(punchF>0){
    var pEX=farmSX+punchF*14,pEY=shoulderY+6,pHX=farmSX+punchF*44,pHY=shoulderY+10;
    drawLimb(ctx,farmSX,shoulderY,pEX,pEY,limbW+1,c,hi);drawLimb(ctx,pEX,pEY,pHX,pHY,limbW,skinCol);
    drawJoint(ctx,pEX,pEY,limbW*0.4,ac);
    // Arm guard / bracer on forearm
    ctx.fillStyle=c;ctx.save();var pAng=Math.atan2(pHY-pEY,pHX-pEX);
    ctx.translate((pEX+pHX)/2,(pEY+pHY)/2);ctx.rotate(pAng);
    ctx.fillRect(-8,-limbW*0.6,16,limbW*1.2);ctx.restore();
    // Big fist with glove
    drawJoint(ctx,pHX,pHY,7,skinCol);
    ctx.strokeStyle=c;ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(pHX,pHY,7,0,Math.PI*2);ctx.stroke();
    // Punch impact trail
    if(punchF>0.5){ctx.fillStyle=c+'44';for(var pi=0;pi<3;pi++){ctx.beginPath();ctx.arc(pHX-pi*8,pHY+pi*2,3-pi,0,Math.PI*2);ctx.fill();}}
  } else if(specF>0){
    var sHX=farmSX+specF*52,sHY=shoulderY+6;
    drawLimb(ctx,farmSX,shoulderY,farmSX+specF*18,shoulderY+4,limbW+1,c);drawLimb(ctx,farmSX+specF*18,shoulderY+4,sHX,sHY,limbW,c);
    // Big energy orb with glow
    ctx.fillStyle=c+'44';ctx.beginPath();ctx.arc(sHX,sHY,18,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=c+'88';ctx.beginPath();ctx.arc(sHX,sHY,11,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=ac;ctx.beginPath();ctx.arc(sHX,sHY,5,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(sHX-2,sHY-2,2,0,Math.PI*2);ctx.fill();
  } else {
    var eX=farmSX+6+walkCyc*5,eY=(shoulderY+chestY)*0.5,hX=farmSX+12+walkCyc*3,hY=shoulderY+6;
    drawLimb(ctx,farmSX,shoulderY,eX,eY,limbW+1,c,hi);drawLimb(ctx,eX,eY,hX,hY,limbW,skinCol);
    drawJoint(ctx,eX,eY,limbW*0.35,ac);drawJoint(ctx,hX,hY,4.5,skinCol);
    // Idle arm guard / bracer
    ctx.fillStyle=c;var idleAng=Math.atan2(hY-eY,hX-eX);
    ctx.save();ctx.translate((eX+hX)/2,(eY+hY)/2);ctx.rotate(idleAng);
    ctx.fillRect(-6,-limbW*0.5,12,limbW);ctx.restore();
  }
  if(id==='goro'&&!block){ctx.globalAlpha=0.85;var g2sy=shoulderY+10;drawLimb(ctx,-shoulderW-4,g2sy,-shoulderW-10+punchF*15,g2sy+12,limbW-2,c+'dd');drawLimb(ctx,shoulderW+4,g2sy,shoulderW+10+punchF*15,g2sy+12,limbW-2,c+'dd');ctx.globalAlpha=1;}
  if(id==='jaxon'&&!block){ctx.strokeStyle='#d6d3d1';ctx.lineWidth=limbW+3;ctx.lineCap='round';if(punchF>0){ctx.beginPath();ctx.moveTo(farmSX,shoulderY);ctx.lineTo(farmSX+punchF*40,shoulderY+10);ctx.stroke();}else{ctx.beginPath();ctx.moveTo(farmSX,shoulderY);ctx.lineTo(farmSX+10,shoulderY+6);ctx.stroke();}}
  if(id==='baraka'&&!block){ctx.strokeStyle='#fff';ctx.lineWidth=2;var bx=punchF>0?farmSX+punchF*40:farmSX+10,bby=punchF>0?shoulderY+10:shoulderY+6;ctx.beginPath();ctx.moveTo(bx,bby);ctx.lineTo(bx+30,bby-2);ctx.stroke();}

  // NECK (thicker)
  drawLimb(ctx,0,neckY,0,shoulderY-2,7*bwM,skinCol);

  // HEAD (bigger with 3D)
  ctx.shadowBlur=0;
  var headR=H*0.13*Math.max(bwM,0.95);
  var isNinja=id==='scorpion'||id==='subzero'||id==='reptile'||id==='smoke'||id==='noob';
  var isRobot=id==='cyrax'||id==='sektor';
  // Head base
  ctx.fillStyle=isNinja?c:isRobot?'#555':skinCol;
  ctx.beginPath();ctx.arc(0,headY,headR,0,Math.PI*2);ctx.fill();
  // Head outline
  ctx.strokeStyle=c;ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(0,headY,headR,0,Math.PI*2);ctx.stroke();
  // 3D head highlight
  ctx.fillStyle='rgba(255,255,255,0.12)';
  ctx.beginPath();ctx.arc(-headR*0.2,headY-headR*0.25,headR*0.45,0,Math.PI*2);ctx.fill();

  if(isNinja){
    // Detailed ninja mask
    ctx.fillStyle=c;ctx.fillRect(-headR*0.9,headY,headR*1.8,headR*0.85);
    // Forehead plate
    ctx.fillStyle=ac;ctx.fillRect(-headR*0.5,headY-headR*0.8,headR*1.0,headR*0.3);
    // Nose bridge piece
    ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(-headR*0.12,headY-headR*0.2);ctx.lineTo(headR*0.12,headY-headR*0.2);ctx.lineTo(headR*0.06,headY+headR*0.15);ctx.lineTo(-headR*0.06,headY+headR*0.15);ctx.closePath();ctx.fill();
    // Eyes with glow
    ctx.fillStyle=hurt?'#ef4444':'#fff';
    ctx.fillRect(-headR*0.6,headY-headR*0.5,headR*0.38,headR*0.28);ctx.fillRect(headR*0.22,headY-headR*0.5,headR*0.38,headR*0.28);
    if(!hurt){ctx.fillStyle='#000';ctx.fillRect(-headR*0.45,headY-headR*0.46,headR*0.18,headR*0.22);ctx.fillRect(headR*0.37,headY-headR*0.46,headR*0.18,headR*0.22);}
    // Eye glow effect for special
    if(st==='special'){ctx.shadowColor=c;ctx.shadowBlur=6;ctx.fillStyle=c;ctx.fillRect(-headR*0.5,headY-headR*0.48,headR*0.35,headR*0.25);ctx.fillRect(headR*0.22,headY-headR*0.48,headR*0.35,headR*0.25);ctx.shadowBlur=0;}
  } else if(isRobot){
    ctx.fillStyle='rgba(0,0,0,0.6)';ctx.fillRect(-headR*0.85,headY-headR*0.3,headR*1.7,headR*0.55);
    ctx.fillStyle=id==='cyrax'?'#22c55e':'#ef4444';ctx.fillRect(-headR*0.65,headY-headR*0.15,headR*1.3,headR*0.18);
    // Antenna
    ctx.strokeStyle=ac;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,headY-headR);ctx.lineTo(0,headY-headR*1.5);ctx.stroke();
    drawJoint(ctx,0,headY-headR*1.5,3,id==='cyrax'?'#22c55e':'#ef4444');
    // Chin guard
    ctx.fillStyle='#444';ctx.beginPath();ctx.arc(0,headY+headR*0.5,headR*0.45,0,Math.PI);ctx.fill();
  } else {
    // Regular face - bigger eyes with iris
    ctx.fillStyle='#fff';ctx.fillRect(-headR*0.55,headY-headR*0.38,headR*0.4,headR*0.32);ctx.fillRect(headR*0.15,headY-headR*0.38,headR*0.4,headR*0.32);
    ctx.fillStyle=hurt?'#ef4444':'#333';ctx.fillRect(-headR*0.4,headY-headR*0.32,headR*0.2,headR*0.24);ctx.fillRect(headR*0.3,headY-headR*0.32,headR*0.2,headR*0.24);
    // Eye highlight
    ctx.fillStyle='#fff';ctx.fillRect(-headR*0.38,headY-headR*0.3,headR*0.06,headR*0.06);ctx.fillRect(headR*0.32,headY-headR*0.3,headR*0.06,headR*0.06);
    // Nose
    ctx.strokeStyle=skinCol+'99';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,headY-headR*0.05);ctx.lineTo(headR*0.08,headY+headR*0.15);ctx.lineTo(-headR*0.05,headY+headR*0.15);ctx.stroke();
    // Mouth
    ctx.fillStyle=skinCol+'dd';ctx.beginPath();ctx.arc(0,headY+headR*0.35,headR*0.3,0,Math.PI);ctx.fill();
    // Eyebrows (thicker)
    ctx.strokeStyle='#000';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-headR*0.6,headY-headR*0.55);ctx.lineTo(-headR*0.15,headY-headR*0.6);ctx.stroke();ctx.beginPath();ctx.moveTo(headR*0.6,headY-headR*0.55);ctx.lineTo(headR*0.15,headY-headR*0.6);ctx.stroke();
    // Jaw line
    ctx.strokeStyle=skinCol+'55';ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,headY+headR*0.1,headR*0.85,0.3,Math.PI-0.3);ctx.stroke();
  }
  if(st==='special'){ctx.fillStyle=c;ctx.shadowColor=c;ctx.shadowBlur=10;ctx.fillRect(-headR*0.5,headY-headR*0.4,headR*0.35,headR*0.25);ctx.fillRect(headR*0.15,headY-headR*0.4,headR*0.35,headR*0.25);ctx.shadowBlur=0;}

  // HEADGEAR
  if(id==='raiden'){ctx.fillStyle='#7c3aed';ctx.beginPath();ctx.moveTo(-headR*1.4,headY-headR*0.6);ctx.lineTo(headR*1.4,headY-headR*0.6);ctx.lineTo(0,headY-headR*2.2);ctx.closePath();ctx.fill();ctx.fillStyle='#c4b5fd';ctx.fillRect(-headR*1.1,headY-headR*0.6,headR*2.2,3);}
  if(id==='kunglao'){ctx.fillStyle='#e2e8f0';ctx.fillRect(-headR*1.8,headY-headR*0.8,headR*3.6,4);ctx.fillStyle='#f1f5f9';ctx.beginPath();ctx.moveTo(-headR*0.6,headY-headR*0.8);ctx.lineTo(headR*0.6,headY-headR*0.8);ctx.lineTo(0,headY-headR*1.6);ctx.closePath();ctx.fill();}
  if(id==='goro'){ctx.fillStyle='#d97706';ctx.fillRect(-headR*0.8,headY-headR-3,headR*1.6,4);ctx.fillStyle='#fbbf24';for(var gi=0;gi<3;gi++){ctx.beginPath();ctx.moveTo(-headR*0.6+gi*headR*0.6,headY-headR-3);ctx.lineTo(-headR*0.3+gi*headR*0.6,headY-headR-10);ctx.lineTo(gi*headR*0.6,headY-headR-3);ctx.closePath();ctx.fill();}}
  if(id==='liukang'){ctx.fillStyle='#ef4444';ctx.fillRect(-headR*1.1,headY-headR*0.15,headR*2.2,3);}
  if(id==='nightwolf'){ctx.strokeStyle='#84cc16';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-headR*0.8,headY-headR);ctx.lineTo(-headR*0.5,headY-headR*1.3);ctx.stroke();ctx.beginPath();ctx.moveTo(headR*0.8,headY-headR);ctx.lineTo(headR*0.5,headY-headR*1.3);ctx.stroke();}

  // WEAPONS
  if(id==='kitana'&&(st==='special'||st==='punch')){var fx=farmSX+(punchF||specF)*40,fy=shoulderY+8;ctx.fillStyle='#06b6d4';for(var fi=0;fi<5;fi++){var fa=-0.6+fi*0.3;ctx.beginPath();ctx.moveTo(fx,fy);ctx.lineTo(fx+Math.cos(fa)*18,fy+Math.sin(fa)*12);ctx.lineTo(fx+Math.cos(fa+0.15)*16,fy+Math.sin(fa+0.15)*10);ctx.closePath();ctx.fill();}}
  if(id==='mileena'&&!block){var mx=punchF>0?farmSX+punchF*40:farmSX+10,my=punchF>0?shoulderY+10:shoulderY+6;ctx.strokeStyle='#f472b6';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(mx,my);ctx.lineTo(mx+20,my-3);ctx.stroke();}
  if(id==='scorpion'&&st==='special'){ctx.fillStyle='rgba(245,158,11,0.5)';for(var sf=0;sf<6;sf++){ctx.beginPath();ctx.arc(farmSX+specF*50+(Math.random()-0.5)*14,shoulderY+6+Math.random()*10,3+Math.random()*5,0,Math.PI*2);ctx.fill();}}
  // Idle fire/ice effects per character
  if(id==='scorpion'&&st==='idle'){ctx.fillStyle='rgba(245,158,11,0.3)';for(var sf2=0;sf2<2;sf2++){ctx.beginPath();ctx.arc(farmSX+10+(Math.random()-0.5)*6,shoulderY+4-Math.random()*8,2+Math.random()*3,0,Math.PI*2);ctx.fill();}}
  if(id==='subzero'&&st==='idle'){ctx.fillStyle='rgba(56,189,248,0.25)';for(var ic=0;ic<2;ic++){ctx.beginPath();ctx.arc(farmSX+10+(Math.random()-0.5)*6,shoulderY+4-Math.random()*8,2+Math.random()*2,0,Math.PI*2);ctx.fill();}}
  if(id==='noob'&&st==='special'){ctx.globalAlpha=0.25;ctx.fillStyle='#334155';ctx.beginPath();ctx.arc(30,headY,headR*0.8,0,Math.PI*2);ctx.fill();ctx.fillRect(20,shoulderY,20,waistY-shoulderY);ctx.globalAlpha=1;}
  if(id==='nightwolf'&&st==='special'){var nx=farmSX+specF*50,ny=shoulderY+6;ctx.fillStyle='rgba(132,204,22,0.4)';ctx.beginPath();ctx.arc(nx,ny,12,0,Math.PI*2);ctx.fill();}

  // HURT FLASH
  if(hurt){ctx.restore();if(Math.floor(af/2)%2===0){ctx.fillStyle='rgba(255,60,60,0.3)';ctx.fillRect(-22,-H+by,44,H+8);}}

  ctx.shadowBlur=0;ctx.restore();
}

// Draw character preview on a canvas element
function drawCharPreview(canvas,ch,size){
  var w=size||60,h=Math.round(w*1.6);
  canvas.width=w;canvas.height=h;
  var ctx=canvas.getContext('2d');
  ctx.clearRect(0,0,w,h);
  var fakeF={x:w/2,y:h-4,dir:1,ch:ch,H:h*0.85,state:'idle',af:0,vy:0};
  drawFighter(ctx,fakeF,Date.now()*0.01);
}



// =========================================================
// BACKGROUND
// =========================================================
var BG_THEMES=[
  ['#1a0800','#3d1500','#6b2d00'],
  ['#00040f','#001230','#002260'],
  ['#180000','#3d0000','#6b1010'],
  ['#08001a','#180040','#2a0060'],
  ['#0a0a12','#181828','#28283a'],
  ['#1a1000','#3d2800','#7a4d00'],
];
function drawBG(ctx,W,H,stage,t){
  var bi=Math.min(Math.floor((stage-1)/3),BG_THEMES.length-1);
  var th=BG_THEMES[bi];
  var sg=ctx.createLinearGradient(0,0,0,H*0.72);
  sg.addColorStop(0,th[0]);sg.addColorStop(0.5,th[1]);sg.addColorStop(1,th[2]);
  ctx.fillStyle=sg;ctx.fillRect(0,0,W,H*0.72);
  var fg=ctx.createLinearGradient(0,H*0.72,0,H);
  fg.addColorStop(0,'#1a1a1a');fg.addColorStop(1,'#050505');
  ctx.fillStyle=fg;ctx.fillRect(0,H*0.72,W,H*0.28);
  ctx.strokeStyle='rgba(245,158,11,0.35)';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(0,H*0.72);ctx.lineTo(W,H*0.72);ctx.stroke();
  ctx.fillStyle='rgba(245,200,80,0.25)';
  for(var i=0;i<8;i++){
    var px=((i*W/8+t*(i%2?0.8:-0.5))%W+W)%W;
    var py=H*0.1+Math.sin(t*0.025+i*1.1)*H*0.28;
    var pr=1.2+Math.sin(t*0.05+i)*1.4;
    ctx.beginPath();ctx.arc(px,py,Math.max(0.1,pr),0,Math.PI*2);ctx.fill();
  }
}

// =========================================================
// PARTICLES
// =========================================================
function spawnParts(parts,x,y,col,n){
  for(var i=0;i<n;i++)parts.push({x:x,y:y,vx:(Math.random()-0.5)*10,vy:(Math.random()-0.5)*10-4,color:col,life:22+Math.random()*14,size:2+Math.random()*4.5});
}
function tickParts(parts){
  for(var i=parts.length-1;i>=0;i--){var p=parts[i];p.x+=p.vx;p.y+=p.vy;p.vy+=0.35;p.life--;if(p.life<=0)parts.splice(i,1);}
}
function drawParts(ctx,parts){
  parts.forEach(function(p){ctx.globalAlpha=Math.min(1,p.life/12);ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();});
  ctx.globalAlpha=1;
}

// =========================================================
// HUD UPDATE (DOM)
// =========================================================
function hudUpdate(gs){
  var p1=gs.p1,p2=gs.p2;
  var p1pct=Math.max(0,p1.hp/p1.maxHp);
  var p2pct=Math.max(0,p2.hp/p2.maxHp);
  var h1=$('hud-p1-hp'),h2=$('hud-p2-hp');
  h1.style.width=(p1pct*100)+'%';h2.style.width=(p2pct*100)+'%';
  h1.className='hp-bar'+(p1pct<0.25?' low':'');h2.className='hp-bar'+(p2pct<0.25?' low':'');
  $('hud-p1-en').style.width=(p1.energy)+'%';$('hud-p2-en').style.width=(p2.energy)+'%';
  $('hud-p1-en').className='en-bar'+(p1.energy>=100?' ready':'');
  $('hud-p2-en').className='en-bar'+(p2.energy>=100?' ready':'');
  $('btn-special').className='atk atk-special'+(p1.energy>=100?' glow':'');
  $('timer').textContent=Math.max(0,gs.timer);
  $('timer').style.color=gs.timer<=10?'#ef4444':'#f59e0b';
  $('round-info').textContent='STAGE '+G.stage+' \u00B7 R'+gs.round+' \u00B7 '+gs.p1r+'-'+gs.p2r;
}

// =========================================================
// FIGHT ENGINE
// =========================================================
function initFight(){
  G.stopped=false;
  G.gs=null;
  COMBO.count=0;COMBO.timer=0;COMBO.lastHitter=null;COMBO.textTimer=0;COMBO.flash=0;

  var opp=TOWER[Math.min(G.stage-1,TOWER.length-1)];
  var eHpMult=1+(G.stage-1)*0.15;
  $('hud-p1-name').textContent=G.player.name;$('hud-p1-name').style.color=G.player.color;
  $('hud-p2-name').textContent=opp.name;$('hud-p2-name').style.color=opp.color;
  G.cpuTick=0;G.cpuRetreat=0;

  function waitAndInit(attempts) {
    var cv=$('game-canvas');
    var area=$('game-area');
    var W=area?area.clientWidth:window.innerWidth;
    var H=area?area.clientHeight:0;
    if(H<50){H=window.innerHeight-42;}
    if(W<50){W=window.innerWidth;}
    W=Math.max(W,200);H=Math.max(H,200);
    if((H<100||W<100)&&attempts<30){
      setTimeout(function(){waitAndInit(attempts+1);},50);
      return;
    }
    cv.width=W;cv.height=H;
    var SC=H/300;
    var FLOOR=H*0.78;
    G.gs={
      p1:{ch:G.player,x:W*0.28,y:FLOOR,vy:0,onGround:true,hp:G.player.hp,maxHp:G.player.hp,energy:0,state:'idle',af:0,cd:0,dir:1,H:Math.round(SC*70),dmgTaken:0},
      p2:{ch:opp,x:W*0.72,y:FLOOR,vy:0,onGround:true,hp:Math.round(opp.hp*eHpMult),maxHp:Math.round(opp.hp*eHpMult),energy:0,state:'idle',af:0,cd:0,dir:-1,H:Math.round(SC*70),dmgTaken:0},
      timer:120,lastSec:Date.now(),
      p1r:0,p2r:0,round:1,
      parts:[],shake:0,floatTexts:[],
      phase:'roundAnnounce',roundAnnTimer:90,
      cd:3,cdTick:60,
      frame:0,W:W,H:H,FLOOR:FLOOR,SC:SC,
      over:false,finishHim:false,finishTimer:0,
      roundOverText:'',roundOverColor:'#fff',
    };
    announce('Round One',200);
    startBGMusic();
    G.raf=requestAnimationFrame(fightLoop);
  }
  waitAndInit(0);
}

function stopFight(){
  G.stopped=true;
  if(G.raf)cancelAnimationFrame(G.raf);
  stopBGMusic();
}

// BG FIGHT MUSIC - dark synth loop with drums
var _bgNodes=[];
function startBGMusic(){
  stopBGMusic();
  var ac=AC();if(!ac)return;
  var bpm=130,beat=60/bpm;
  // Bass line pattern (notes in Hz)
  var bassNotes=[55,55,65,55, 55,55,73,65, 55,55,65,55, 73,65,55,49];
  var melNotes=[220,0,330,0, 293,0,220,262, 220,0,330,0, 349,330,293,0];
  var step=0;
  G.bgInt=setInterval(function(){
    try{
      var ac2=AC();if(!ac2)return;
      var t=ac2.currentTime;
      // KICK DRUM (every 4 steps)
      if(step%4===0){
        var ko=ac2.createOscillator(),kg=ac2.createGain();
        ko.type='sine';ko.frequency.setValueAtTime(150,t);ko.frequency.exponentialRampToValueAtTime(30,t+0.12);
        kg.gain.setValueAtTime(0.3,t);kg.gain.exponentialRampToValueAtTime(0.001,t+0.15);
        ko.connect(kg);kg.connect(ac2.destination);ko.start(t);ko.stop(t+0.15);
      }
      // HI-HAT (every 2 steps)
      if(step%2===0){
        var nb=getNoise();if(nb){
          var hs=ac2.createBufferSource();hs.buffer=nb;
          var hf=ac2.createBiquadFilter();hf.type='highpass';hf.frequency.value=8000;
          var hg=ac2.createGain();hg.gain.setValueAtTime(0.06,t);hg.gain.exponentialRampToValueAtTime(0.001,t+0.05);
          hs.connect(hf);hf.connect(hg);hg.connect(ac2.destination);hs.start(t);hs.stop(t+0.05);
        }
      }
      // BASS
      var bn=bassNotes[step%bassNotes.length];
      if(bn){
        var bo=ac2.createOscillator(),bg2=ac2.createGain();
        bo.type='sawtooth';bo.frequency.value=bn;
        bg2.gain.setValueAtTime(0.08,t);bg2.gain.exponentialRampToValueAtTime(0.001,t+beat*0.8);
        bo.connect(bg2);bg2.connect(ac2.destination);bo.start(t);bo.stop(t+beat*0.8);
      }
      // MELODY (soft synth pad)
      var mn=melNotes[step%melNotes.length];
      if(mn){
        var mo=ac2.createOscillator(),mg=ac2.createGain();
        mo.type='triangle';mo.frequency.value=mn;
        mg.gain.setValueAtTime(0.04,t);mg.gain.exponentialRampToValueAtTime(0.001,t+beat*0.6);
        mo.connect(mg);mg.connect(ac2.destination);mo.start(t);mo.stop(t+beat*0.6);
      }
      step++;
    }catch(e){}
  },Math.round(beat*1000/2));
}
function stopBGMusic(){if(G.bgInt){clearInterval(G.bgInt);G.bgInt=null;}}

function hbox(f){return{x:f.x-26,y:f.y-f.H,w:52,h:f.H};}
function abox(f,type){
  var r=type==='kick'?90:type==='special'?115:70;
  var ox=f.dir>0?20:-20-r;
  return{x:f.x+ox,y:f.y-f.H*0.7,w:r,h:f.H*0.55};
}
function rectsHit(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}

function doAttack(attacker,defender,type,gs){
  var baseDmg={punch:attacker.ch.pow*0.8+Math.random()*3,kick:attacker.ch.pow*1.4+Math.random()*5,special:attacker.ch.pow*3.2+Math.random()*10}[type]||8;
  // CPU damage boost per stage
  if(attacker===gs.p2){baseDmg*=1+(G.stage-1)*0.06;}
  var delay={punch:80,kick:130,special:160}[type]||80;
  setTimeout(function(){
    if(G.stopped)return;
    if(gs.phase!=='fight'&&!gs.finishHim)return;
    var ab=abox(attacker,type),db=hbox(defender);
    if(rectsHit(ab,db)){
      var blocked=defender.state==='block'&&!gs.finishHim;
      var dmg;
      if(blocked){
        dmg=Math.round(baseDmg*0.12);
      } else {
        dmg=comboHit(attacker,baseDmg);
      }
      defender.hp=Math.max(0,defender.hp-dmg);
      defender.dmgTaken+=dmg;
      if(!blocked){defender.state='hurt';defender.af=0;}
      attacker.energy=Math.min(100,attacker.energy+(blocked?5:18));
      defender.energy=Math.min(100,defender.energy+(blocked?3:8));
      gs.shake=blocked?2:(type==='special'?14:7);
      var pCount=blocked?4:(COMBO.count>=3?20:type==='special'?16:10);
      spawnParts(gs.parts,defender.x,defender.y-defender.H*0.5,blocked?'#3b82f6':'#fff',pCount);
      spawnParts(gs.parts,defender.x,defender.y-defender.H*0.3,defender.ch.color,pCount>>1);
      snd(blocked?'block':'hit');
      // KNOCKBACK
      var kb=blocked?3:(type==='special'?18:type==='kick'?12:6);
      defender.x+=attacker.dir*kb;
      defender.x=Math.max(30,Math.min(gs.W-30,defender.x));
      // FLOATING DAMAGE TEXT
      var ftxt=blocked?'BLOCKED!':dmg+' DMG';
      var fcol=blocked?'#60a5fa':(type==='special'?'#fbbf24':'#fff');
      if(COMBO.count>=3)ftxt=dmg+' COMBO x'+COMBO.count+'!';
      gs.floatTexts.push({x:defender.x,y:defender.y-defender.H*0.7,text:ftxt,color:fcol,life:60,vy:-1.5});
      if(gs.finishHim&&defender.hp<=0){
        gs.finishHim=false;
        announce(attacker.ch.name+' wins',100);
      }
    }
  },delay);
}

// Player attack (called from buttons)
function playerAttack(type){
  var gs=G.gs;if(!gs||G.stopped)return;
  if(gs.phase!=='fight'&&!gs.finishHim)return;
  var p1=gs.p1;
  if(p1.cd>0)return;
  if(type==='special'&&p1.energy<100)return;
  if(type==='block'){p1.state='block';p1.cd=6;snd('block');return;}
  p1.state=type;p1.af=0;
  p1.cd={punch:14,kick:20,special:26}[type]||14;
  if(type==='special')p1.energy=0;
  snd(type);doAttack(p1,gs.p2,type,gs);
}
window._atk=playerAttack;

// CPU AI - smart fighter with dodge, block, hit-and-run
function cpuThink(gs){
  var p1=gs.p1,p2=gs.p2;
  var canAct2=['idle','walk'].indexOf(p2.state)>=0;
  var dist=Math.abs(p2.x-p1.x);
  var p1Attacking=['punch','kick','special'].indexOf(p1.state)>=0;

  // DODGE-AFTER-HURT: CPU backs away after getting hit (40% chance)
  if(p2.state==='hurt' && p2.af>=8 && Math.random()<0.4){
    var escH=p2.x>p1.x?1:-1;
    p2.x+=escH*p2.ch.spd*1.5*gs.SC;
    p2.x=Math.max(30,Math.min(gs.W-30,p2.x));
  }

  // DODGE: 20-30% chance when player attacks close
  if(canAct2 && p2.cd<=0 && p1Attacking && dist<120 && Math.random()<0.18+G.stage*0.01){
    var escDir=p2.x>p1.x?1:-1;
    p2.x+=escDir*p2.ch.spd*1.3*gs.SC;
    p2.x=Math.max(30,Math.min(gs.W-30,p2.x));
    p2.state='walk';
    return;
  }

  // RETREAT after attacking (short)
  if(canAct2 && p2.cd<=0 && G.cpuRetreat>0){
    var escDir2=p2.x>p1.x?1:-1;
    p2.x+=escDir2*p2.ch.spd*1.3*gs.SC;
    p2.x=Math.max(30,Math.min(gs.W-30,p2.x));
    p2.state='walk';
    G.cpuRetreat--;
    return;
  }

  // APPROACH when far - FASTER now
  if(canAct2 && p2.cd<=0){
    if(dist>80){
      var moveDir=p2.x>p1.x?-1:1;
      p2.x+=moveDir*p2.ch.spd*1.2*gs.SC;
      p2.state='walk';
    } else {
      if(p2.state==='walk')p2.state='idle';
    }
  }

  if(p2.cd>0||p2.state==='hurt')return;
  G.cpuTick--;if(G.cpuTick>0)return;
  // Faster reaction
  var react=Math.max(12,55-G.stage*3)+Math.floor(Math.random()*18);
  G.cpuTick=react;
  var r=Math.random();
  var aggr=0.35+G.stage*0.04;var blk=0.10+G.stage*0.025;
  if(dist<200){
    // BLOCK when player is attacking
    if(p1Attacking && r<blk+0.12){p2.state='block';p2.cd=10;snd('block');return;}
    // Counter-attack after blocking
    if(p2.state==='block' && Math.random()<0.4){
      p2.state='punch';p2.af=0;p2.cd=14;snd('punch');doAttack(p2,p1,'punch',gs);return;
    }
    if(r<aggr){
      var opts=['punch','kick'];if(p2.energy>=100)opts.push('special');
      var act=opts[Math.floor(Math.random()*opts.length)];
      p2.state=act;p2.af=0;p2.cd={punch:12,kick:18,special:24}[act]||12;
      if(act==='special')p2.energy=0;snd(act);doAttack(p2,p1,act,gs);
      G.cpuRetreat=Math.floor(2+Math.random()*3);
    }
  }
}

// FINISH HIM trigger
function triggerFinishHim(gs){
  gs.finishHim=true;gs.finishTimer=300;
  snd('finishhim');
  announce('Finish Him!',0);
}

// End round - MK style
function endRound(gs){
  stopBGMusic();gs.phase='roundOver';gs.shake=14;snd('ko');
  var rw=gs.p1.hp>gs.p2.hp?'P1':gs.p2.hp>gs.p1.hp?'P2':'DRAW';
  if(rw==='P1')gs.p1r++;else if(rw==='P2')gs.p2r++;
  var winner=rw==='P1'?gs.p1:gs.p2;
  var flawless=winner.dmgTaken===0;
  if(flawless){
    gs.roundOverText='FLAWLESS VICTORY';
    gs.roundOverColor='#f59e0b';
    announce('Flawless Victory',400);
  } else {
    gs.roundOverText=winner.ch.name+' WINS';
    gs.roundOverColor=winner.ch.color;
    announce(winner.ch.name+' wins',500);
  }
  setTimeout(function(){
    if(G.stopped)return;
    if(gs.p1r>=2||gs.p2r>=2){
      gs.phase='matchOver';gs.over=true;
      var win=gs.p1r>=2;
      setTimeout(function(){if(!G.stopped)showResult(win,gs);},1800);
    } else {
      gs.p1.hp=gs.p1.maxHp;gs.p2.hp=gs.p2.maxHp;
      gs.p1.dmgTaken=0;gs.p2.dmgTaken=0;
      gs.p1.x=gs.W*0.28;gs.p2.x=gs.W*0.72;
      gs.p1.y=gs.p2.y=gs.FLOOR;gs.p1.vy=gs.p2.vy=0;
      gs.p1.state=gs.p2.state='idle';gs.p1.energy=gs.p2.energy=0;
      gs.p1.cd=gs.p2.cd=0;gs.timer=99;gs.lastSec=Date.now();gs.round++;
      COMBO.count=0;COMBO.timer=0;COMBO.lastHitter=null;
      gs.finishHim=false;
      gs.phase='roundAnnounce';gs.roundAnnTimer=90;
      var rw2=ROUND_WORDS[gs.round]||String(gs.round);
      announce('Round '+rw2,200);
      startBGMusic();
    }
  },2400);
}

// =========================================================
// MAIN FIGHT LOOP
// =========================================================
function fightLoop(){
  if(G.stopped)return;
  G.raf=requestAnimationFrame(fightLoop);
  var gs=G.gs;if(!gs)return;
  gs.frame++;
  var cv=$('game-canvas');
  var area=$('game-area');
  var W=area?area.clientWidth:cv.offsetWidth||gs.W;
  var H=area?(area.clientHeight||gs.H):cv.offsetHeight||gs.H;
  if(!W||!H)return;
  if(Math.abs(cv.width-W)>2||Math.abs(cv.height-H)>2){
    cv.width=W;cv.height=H;
    gs.W=W;gs.H=H;gs.FLOOR=H*0.78;gs.SC=H/300;
    gs.p1.x=W*0.28;gs.p2.x=W*0.72;
    gs.p1.y=gs.FLOOR;gs.p2.y=gs.FLOOR;
  }
  W=gs.W;H=gs.H;
  var ctx=cv.getContext('2d');
  var p1=gs.p1,p2=gs.p2;
  p1.H=p2.H=Math.round(gs.SC*70);

  // -- ROUND ANNOUNCE (MK style: "ROUND ONE") --
  if(gs.phase==='roundAnnounce'){
    gs.roundAnnTimer--;
    if(gs.roundAnnTimer<=0){gs.phase='countdown';gs.cd=3;gs.cdTick=60;}
  }

  // -- COUNTDOWN --
  if(gs.phase==='countdown'){
    gs.cdTick--;
    if(gs.cdTick<=0){snd('cd');gs.cd--;gs.cdTick=60;if(gs.cd<=0){gs.phase='fight';snd('fight');announce('Fight!',0);}}
  }

  // -- FIGHT TICK --
  if(gs.phase==='fight'||gs.finishHim){
    tickCombo();
    var canAct=['idle','walk'].indexOf(p1.state)>=0;
    var moving=false;
    if(KEYS.left&&!KEYS.right&&canAct){p1.x=Math.max(45,p1.x-p1.ch.spd*1.4*gs.SC);if(p1.state==='idle'||p1.state==='walk'){p1.state='walk';moving=true;}}
    if(KEYS.right&&!KEYS.left&&canAct){p1.x=Math.min(W-45,p1.x+p1.ch.spd*1.4*gs.SC);if(p1.state==='idle'||p1.state==='walk'){p1.state='walk';moving=true;}}
    if(KEYS.jump&&p1.onGround&&canAct){p1.vy=-11*gs.SC;p1.onGround=false;KEYS.jump=false;}
    if(!moving&&p1.state==='walk')p1.state='idle';

    if(!gs.finishHim)cpuThink(gs);
    [p1,p2].forEach(function(p){
      p.y+=p.vy;p.vy+=0.75*gs.SC;
      if(p.y>=gs.FLOOR){p.y=gs.FLOOR;p.vy=0;p.onGround=true;}else{p.onGround=false;}
    });
    p1.x=Math.max(45,Math.min(W-45,p1.x));p2.x=Math.max(45,Math.min(W-45,p2.x));
    if(Math.abs(p1.x-p2.x)<52){var push=(52-Math.abs(p1.x-p2.x))*0.5;if(p1.x<p2.x){p1.x-=push;p2.x+=push;}else{p1.x+=push;p2.x-=push;}}
    p1.dir=p1.x<p2.x?1:-1;p2.dir=p2.x<p1.x?1:-1;
    [p1,p2].forEach(function(p){
      if(p.cd>0)p.cd--;
      if(['punch','kick','special','hurt'].indexOf(p.state)>=0){p.af++;var maxAf={punch:14,kick:20,special:26,hurt:10};if(p.af>=(maxAf[p.state]||14))p.state='idle';}
      if(p.state==='block'&&p.cd<=0)p.state='idle';
    });
    if(gs.frame%90===0){p1.energy=Math.min(100,p1.energy+2);p2.energy=Math.min(100,p2.energy+2);}
    if(!gs.finishHim&&Date.now()-gs.lastSec>=1000){gs.timer--;gs.lastSec=Date.now();}

    // FINISH HIM trigger
    if(!gs.finishHim&&!gs.over&&gs.phase==='fight'){
      if(p2.hp>0&&p2.hp<p2.maxHp*0.15&&p1.hp>0){triggerFinishHim(gs);}
    }
    if(gs.finishHim){gs.finishTimer--;if(gs.finishTimer<=0){gs.finishHim=false;endRound(gs);}}
    if(!gs.over&&!gs.finishHim&&(p1.hp<=0||p2.hp<=0||gs.timer<=0))endRound(gs);
    if(gs.finishHim&&p2.hp<=0){gs.finishHim=false;endRound(gs);}
  }

  if(gs.shake>0)gs.shake=Math.max(0,gs.shake-2);
  tickParts(gs.parts);

  // -- DRAW --
  ctx.save();
  if(gs.shake>0){var sx=(Math.random()-0.5)*gs.shake,sy=(Math.random()-0.5)*gs.shake;ctx.translate(sx,sy);}
  drawBG(ctx,W,H,G.stage,gs.frame);

  // Hit flash
  if(COMBO.flash>0){ctx.fillStyle='rgba(255,255,255,'+(COMBO.flash*0.04)+')';ctx.fillRect(0,0,W,H);}

  drawParts(ctx,gs.parts);
  drawFighter(ctx,p1,gs.frame);
  drawFighter(ctx,p2,gs.frame);

  // FLOATING DAMAGE TEXTS
  ctx.textAlign='center';ctx.textBaseline='middle';
  for(var fi=gs.floatTexts.length-1;fi>=0;fi--){
    var ft=gs.floatTexts[fi];
    ft.y+=ft.vy;ft.life--;
    var alpha=Math.min(1,ft.life/20);
    ctx.globalAlpha=alpha;
    ctx.font='bold '+Math.round(H*0.06)+'px Rajdhani,Impact,sans-serif';
    ctx.strokeStyle='rgba(0,0,0,0.8)';ctx.lineWidth=3;
    ctx.strokeText(ft.text,ft.x,ft.y);
    ctx.fillStyle=ft.color;
    ctx.fillText(ft.text,ft.x,ft.y);
    if(ft.life<=0)gs.floatTexts.splice(fi,1);
  }
  ctx.globalAlpha=1;

  // ROUND ANNOUNCE overlay
  if(gs.phase==='roundAnnounce'){
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.strokeStyle='rgba(0,0,0,0.9)';ctx.lineWidth=8;
    ctx.font='bold '+Math.round(H*0.16)+'px Rajdhani,Impact,sans-serif';
    var rText='ROUND '+(ROUND_WORDS[gs.round]||gs.round);
    ctx.strokeText(rText,W/2,H*0.4);
    ctx.shadowColor='#f59e0b';ctx.shadowBlur=50;
    ctx.fillStyle='#f59e0b';
    ctx.fillText(rText,W/2,H*0.4);
    ctx.shadowBlur=0;
  }

  // COUNTDOWN overlay
  if(gs.phase==='countdown'){
    var cText=gs.cd>0?String(gs.cd):'FIGHT!';
    var fontSize=Math.round(H*0.22);
    ctx.font='bold '+fontSize+'px Rajdhani,Impact,sans-serif';
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.strokeStyle='rgba(0,0,0,0.9)';ctx.lineWidth=8;ctx.strokeText(cText,W/2,H*0.4);
    ctx.shadowColor=gs.cd>0?'#f59e0b':'#22c55e';
    ctx.shadowBlur=40;
    ctx.fillStyle=gs.cd>0?'#f59e0b':'#22c55e';
    ctx.fillText(cText,W/2,H*0.4);
    ctx.shadowBlur=0;
  }

  // FINISH HIM overlay
  if(gs.finishHim){
    var fAlpha=0.15+Math.sin(gs.frame*0.15)*0.1;
    ctx.fillStyle='rgba(200,0,0,'+fAlpha+')';ctx.fillRect(0,0,W,H);
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.font='bold '+Math.round(H*0.15)+'px Rajdhani,Impact,sans-serif';
    ctx.strokeStyle='rgba(0,0,0,0.9)';ctx.lineWidth=6;
    ctx.strokeText('FINISH HIM!',W/2,H*0.35);
    ctx.shadowColor='#ef4444';ctx.shadowBlur=40;
    ctx.fillStyle='#ef4444';ctx.fillText('FINISH HIM!',W/2,H*0.35);
    ctx.shadowBlur=0;
    var fPct=gs.finishTimer/300;
    ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(W*0.3,H*0.48,W*0.4,8);
    ctx.fillStyle='#ef4444';ctx.fillRect(W*0.3,H*0.48,W*0.4*fPct,8);
  }

  // COMBO text
  if(COMBO.textTimer>0&&COMBO.count>=2){
    var cAlpha=Math.min(1,COMBO.textTimer/20);
    var cScale=1+Math.sin((70-COMBO.textTimer)*0.3)*0.1;
    ctx.save();
    ctx.globalAlpha=cAlpha;
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.font='bold '+Math.round(H*0.08*cScale)+'px Rajdhani,Impact,sans-serif';
    var cCol=COMBO.count>=5?'#ef4444':COMBO.count>=3?'#f59e0b':'#22c55e';
    ctx.strokeStyle='rgba(0,0,0,0.8)';ctx.lineWidth=4;
    ctx.strokeText(COMBO.text,W*0.5,H*0.18);
    ctx.shadowColor=cCol;ctx.shadowBlur=20;
    ctx.fillStyle=cCol;ctx.fillText(COMBO.text,W*0.5,H*0.18);
    ctx.shadowBlur=0;
    ctx.restore();
  }

  // KO / Round Over overlay (MK style)
  if(gs.phase==='roundOver'||gs.phase==='matchOver'){
    ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,0,W,H);
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.shadowColor='#ef4444';ctx.shadowBlur=50;ctx.fillStyle='#ef4444';
    ctx.font='bold '+Math.round(H*0.2)+'px Rajdhani,Impact,sans-serif';
    ctx.fillText('K.O.',W/2,H*0.38);
    ctx.shadowBlur=0;
    var winText=gs.roundOverText||'ROUND OVER';
    var winCol=gs.roundOverColor||'#fff';
    ctx.font='bold '+Math.round(H*0.07)+'px Rajdhani,sans-serif';
    ctx.fillStyle=winCol;
    ctx.strokeStyle='rgba(0,0,0,0.8)';ctx.lineWidth=3;
    ctx.strokeText(winText,W/2,H*0.58);
    ctx.fillText(winText,W/2,H*0.58);
    ctx.fillStyle='#888';
    ctx.font='bold '+Math.round(H*0.045)+'px Rajdhani,sans-serif';
    ctx.fillText(gs.p1r+' - '+gs.p2r,W/2,H*0.68);
  }

  ctx.restore();
  hudUpdate(gs);
}

// =========================================================
// SCREENS LOGIC
// =========================================================

// SPLASH
function initSplash(){
  var cv=$('splash-canvas');
  cv.width=cv.offsetWidth;cv.height=cv.offsetHeight;
  var ctx=cv.getContext('2d');var t=0;var raf;
  function frame(){
    raf=requestAnimationFrame(frame);t++;
    var W=cv.offsetWidth,H=cv.offsetHeight;
    if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H;}
    var grd=ctx.createRadialGradient(W/2,H*0.4,0,W/2,H*0.4,W*0.8);
    grd.addColorStop(0,'#1a0800');grd.addColorStop(1,'#000');
    ctx.fillStyle=grd;ctx.fillRect(0,0,W,H);
    for(var i=0;i<30;i++){var sx=((i*W/30+t*0.4*(i%2?1:-1))%W+W)%W,sy=H*0.08+Math.sin(t*0.018+i*0.9)*H*0.38;ctx.fillStyle='rgba(245,158,11,'+(0.15+0.25*Math.sin(t*0.06+i))+')';ctx.beginPath();ctx.arc(sx,sy,1+Math.sin(t*0.07+i)*1,0,Math.PI*2);ctx.fill();}
  }
  frame();
  $('play-btn').onclick=function(){
    cancelAnimationFrame(raf);
    snd('start');
    G.screen='select';showScreen('select');initSelect();
  };
}

// CHARACTER SELECT
function initSelect(){
  var grid=$('char-grid');
  grid.innerHTML='';
  $('sel-stage-info').textContent='STAGE '+G.stage+' OF 15';
  PLAYABLE.forEach(function(c,i){
    var d=document.createElement('div');
    d.className='char-card';
    d.style.setProperty('--cc',c.color);
    d.style.setProperty('--cb',c.color+'22');
    d.style.setProperty('--cs',c.color+'55');
    var cv=document.createElement('canvas');
    cv.className='cem-canvas';
    cv.style.cssText='display:block;margin:0 auto;';
    drawCharPreview(cv,c,40);
    d.appendChild(cv);
    var nm=document.createElement('div');nm.className='cnm';nm.textContent=c.name.split(' ')[0];
    d.appendChild(nm);
    var dot=document.createElement('div');dot.className='char-dot';
    d.appendChild(dot);
    d.addEventListener('pointerdown',function(){G.selIdx=i;snd('select');updatePreview();updateGrid();});
    grid.appendChild(d);
  });
  updateGrid();updatePreview();
  $('select-btn').onclick=function(){
    G.player=PLAYABLE[G.selIdx];snd('start');
    G.screen='vs';showScreen('vs');initVS();
  };
}
function updateGrid(){
  var cards=document.querySelectorAll('.char-card');
  cards.forEach(function(c,i){c.classList.toggle('sel',i===G.selIdx);});
}
function updatePreview(){
  var c=PLAYABLE[G.selIdx];
  // Draw character preview on canvas
  var pEl=$('prev-emoji');
  if(!$('prev-char-canvas')){
    var cv=document.createElement('canvas');cv.id='prev-char-canvas';
    cv.style.cssText='display:block;margin:0 auto 6px;';
    pEl.innerHTML='';pEl.appendChild(cv);
  }
  drawCharPreview($('prev-char-canvas'),c,70);
  $('prev-name').textContent=c.name;$('prev-name').style.color=c.color;
  $('prev-title').textContent=c.title;
  var rEl=$('prev-rarity');rEl.textContent=c.rarity;rEl.style.color=c.color;rEl.style.background=c.color+'22';rEl.style.border='1px solid '+c.color+'44';
  $('prev-spl').textContent=c.spl;$('prev-spl').style.color=c.color;
  var stats=[['\u2694\uFE0F POWER',c.pow,'#ef4444'],['\u26A1 SPEED',c.spd,'#22c55e'],['\uD83D\uDEE1\uFE0F DEFENSE',c.def,'#3b82f6'],['\u2764\uFE0F HP',Math.round(c.hp/10),'#f472b6']];
  $('prev-stats').innerHTML=stats.map(function(s){return '<div class="stat-row"><div class="stat-lbl"><span>'+s[0]+'</span><span class="stat-val" style="color:'+s[2]+'">'+s[1]+'/10</span></div><div class="stat-bg"><div class="stat-fill" style="width:'+s[1]*10+'%;background:'+s[2]+'"></div></div></div>';}).join('');
  var btn=$('select-btn');btn.style.background='linear-gradient(135deg,'+c.color+','+c.color+'88)';btn.style.boxShadow='0 4px 20px '+c.color+'55';
}

// VS
function initVS(){
  var opp=TOWER[Math.min(G.stage-1,TOWER.length-1)];
  // Draw VS character previews
  var vsE1=$('vs-p1-emoji');vsE1.innerHTML='';
  var vc1=document.createElement('canvas');vc1.style.cssText='display:block;margin:0 auto;';
  drawCharPreview(vc1,G.player,55);vsE1.appendChild(vc1);
  $('vs-p1-name').textContent=G.player.name;$('vs-p1-name').style.color=G.player.color;
  var vsE2=$('vs-p2-emoji');vsE2.innerHTML='';
  var vc2=document.createElement('canvas');vc2.style.cssText='display:block;margin:0 auto;';
  drawCharPreview(vc2,opp,55);vsE2.appendChild(vc2);
  $('vs-p2-name').textContent=opp.name;$('vs-p2-name').style.color=opp.color;
  $('vs-p2-role').textContent=opp.boss?'Ã¢Å¡Â Ã¯Â¸Â FINAL BOSS':'STAGE '+G.stage+' Ã‚Â· CPU';
  $('vs-stage-label').textContent='STAGE '+G.stage+'/15';
  $('vs-bg-l').style.setProperty('--c1',G.player.color+'33');
  $('vs-bg-r').style.setProperty('--c2',opp.color+'33');
  ['vs-p1','vs-p2'].forEach(function(id){var el=$(id);el.classList.remove('anim-l','anim-r');void el.offsetWidth;});
  $('vs-p1').classList.add('anim-l');$('vs-p2').classList.add('anim-r');
  // Render Tower Ladder
  var tl=$('tower-ladder');
  if(tl){
    var html='';
    for(var i=0;i<TOWER.length;i++){
      var t=TOWER[i];
      var cls='tower-step';
      if(i<G.stage-1)cls+=' done';
      else if(i===G.stage-1)cls+=' current';
      if(t.boss)cls+=' boss';
      html+='<div class="'+cls+'">';
      html+='<span class="tower-em">'+t.em+'</span>';
      html+='<div class="tower-bar"></div>';
      html+='<span class="tower-num">'+(i+1)+'</span>';
      html+='</div>';
    }
    tl.innerHTML=html;
  }
  snd('start');
  if(opp.boss)announce('Final Boss! '+opp.name,300);
  else announce('Stage '+G.stage,200);
  var vsTimer=setTimeout(function(){G.screen='fight';showScreen('fight');initFight();},3000);
  $('vs-screen').onclick=function(){clearTimeout(vsTimer);$('vs-screen').onclick=null;G.screen='fight';showScreen('fight');initFight();};
}

// RESULT
function showResult(win,gs){
  stopFight();
  var opp=TOWER[Math.min(G.stage-1,TOWER.length-1)];
  var champion=win&&G.stage>=15;
  $('res-emoji').textContent=champion?'\uD83C\uDFC6':win?G.player.em:opp.em;
  var title=champion?'CHAMPION!':win?'YOU WIN!':'YOU LOSE!';
  var col=champion?'#f59e0b':win?'#22c55e':'#ef4444';
  $('res-title').textContent=title;$('res-title').style.color=col;
  $('res-sub').textContent=win?'Stage '+G.stage+' Complete'+(champion?' - All 15 done!':'')+'!':'Stage '+G.stage+' Failed';
  if(champion)announce('You are the champion',200);
  else if(win)announce(G.player.name+' wins the match',200);
  else announce('You lose',200);
  var nb=$('res-next'),rb=$('res-retry');
  if(win&&!champion){nb.style.display='block';nb.textContent='NEXT STAGE \u25B6 ('+(G.stage+1)+'/15)';}
  else if(champion){nb.style.display='block';nb.textContent='PLAY AGAIN \uD83C\uDFC6';}
  else{nb.style.display='none';}
  rb.style.display=win?'none':'block';rb.textContent='RETRY FROM STAGE 1';
  document.getElementById('result-screen').style.background=champion?'radial-gradient(ellipse at center,#1a1000,#000)':win?'radial-gradient(ellipse at center,#001400,#000)':'radial-gradient(ellipse at center,#140000,#000)';
  G.screen='result';showScreen('result');
  $('res-next').onclick=function(){
    if(win&&!champion){
      G.stage=Math.min(15,G.stage+1);save();
      G.screen='vs';showScreen('vs');initVS();
    } else if(champion){
      G.stage=1;save();
      G.screen='select';showScreen('select');initSelect();
    }
  };
  $('res-retry').onclick=function(){G.stage=1;save();G.screen='select';showScreen('select');initSelect();};
  $('res-menu').onclick=function(){G.stage=1;save();G.screen='splash';showScreen('splash');initSplash();};
}

// =========================================================
// CONTROLS SETUP
// =========================================================
function setupControls(){
  // D-pad touch
  ['dp-up','dp-left','dp-right'].forEach(function(id){
    var el=$(id);
    if(!el)return;
    var action=el.dataset.action;
    var releaseEvents=['pointerup','pointercancel','pointerleave'];
    el.addEventListener('pointerdown',function(e){
      e.preventDefault();
      el.classList.add('pressed');
      if(action==='jump'){KEYS.jump=true;}
      else if(action==='left'){KEYS.left=true;KEYS.right=false;}
      else if(action==='right'){KEYS.right=true;KEYS.left=false;}
    });
    releaseEvents.forEach(function(ev){
      el.addEventListener(ev,function(){
        el.classList.remove('pressed');
        if(action==='jump')KEYS.jump=false;
        else if(action==='left')KEYS.left=false;
        else if(action==='right')KEYS.right=false;
      });
    });
  });

  // Attack buttons touch
  ['btn-punch','btn-kick','btn-block','btn-special'].forEach(function(id){
    var el=$(id);
    if(!el)return;
    var action=el.dataset.action;
    el.addEventListener('pointerdown',function(e){
      e.preventDefault();
      el.classList.add('pressed');
      window._atk&&window._atk(action);
      try{if(navigator.vibrate)navigator.vibrate(18);}catch(err){}
    });
    ['pointerup','pointercancel','pointerleave'].forEach(function(ev){
      el.addEventListener(ev,function(){
        el.classList.remove('pressed');
        if(action==='block'&&G.gs&&G.gs.p1&&G.gs.p1.state==='block'){
          G.gs.p1.state='idle';G.gs.p1.cd=0;
        }
      });
    });
  });

  // Keyboard controls for PC
  document.addEventListener('keydown',function(e){
    if(e.key==='ArrowLeft'){KEYS.left=true;KEYS.right=false;e.preventDefault();}
    else if(e.key==='ArrowRight'){KEYS.right=true;KEYS.left=false;e.preventDefault();}
    else if(e.key==='ArrowUp'){KEYS.jump=true;e.preventDefault();}
    else if(e.key==='z'||e.key==='Z'){window._atk&&window._atk('punch');}
    else if(e.key==='x'||e.key==='X'){window._atk&&window._atk('kick');}
    else if(e.key==='c'||e.key==='C'){window._atk&&window._atk('special');}
    else if(e.key==='v'||e.key==='V'){window._atk&&window._atk('block');}
  });
  document.addEventListener('keyup',function(e){
    if(e.key==='ArrowLeft')KEYS.left=false;
    else if(e.key==='ArrowRight')KEYS.right=false;
    else if(e.key==='ArrowUp')KEYS.jump=false;
  });

  document.addEventListener('contextmenu',function(e){e.preventDefault();});
  document.addEventListener('touchmove',function(e){e.preventDefault();},{passive:false});
}

// =========================================================
// INIT
// =========================================================
document.addEventListener('DOMContentLoaded',function(){
  load();
  setupControls();
  showScreen('splash');
  initSplash();
});

})();

