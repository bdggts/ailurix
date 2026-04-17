'use strict'; // v3.0 MK-style fullscreen+canvas
(function(){

// =========================================================
// DATA
// =========================================================
var CHARS=[
  {id:'scorpion', name:'INFERNUS',   title:'Fire Warrior',    color:'#f59e0b',accent:'#fbbf24',hp:500,spd:8, pow:9, def:7, rarity:'Common',   spl:'Inferno Strike', em:'',bW:1.1,bH:1.0,offY:4},
  {id:'subzero',  name:'GLACIUS',    title:'Ice Phantom',     color:'#38bdf8',accent:'#0c4a6e',hp:475,spd:7, pow:8, def:9, rarity:'Common',   spl:'Freeze Breath',  em:'',bW:1.1,bH:1.0,offY:4},
  {id:'liukang',  name:'PYROVEX',    title:'Flame Striker',   color:'#ef4444',accent:'#fca5a5',hp:450,spd:9, pow:9, def:7, rarity:'Rare',     spl:'Fire Kick',      em:'',bW:0.9, bH:1.05},
  {id:'raiden',   name:'VOLTRAX',    title:'Storm Titan',     color:'#8b5cf6',accent:'#c4b5fd',hp:475,spd:6, pow:10,def:9, rarity:'Legendary',spl:'Thunder Slam',   em:'',bW:1.15,bH:1.1},
  {id:'jaxon',    name:'IRONCLAD',   title:'Iron Titan',      color:'#78716c',accent:'#d6d3d1',hp:550,spd:5, pow:10,def:10,rarity:'Epic',     spl:'Ground Pound',   em:'',bW:1.35,bH:1.12},
  {id:'baraka',   name:'RAVAGE',     title:'Feral Beast',     color:'#fb923c',accent:'#fdba74',hp:460,spd:7, pow:10,def:8, rarity:'Epic',     spl:'Savage Fury',    em:'',bW:1.0, bH:1.05},
  {id:'smoke',    name:'WRAITH',     title:'Shadow Phantom',  color:'#a78bfa',accent:'#c4b5fd',hp:400,spd:10,pow:9, def:5, rarity:'Rare',     spl:'Phase Strike',   em:'',bW:0.88,bH:0.95},
  {id:'cyrax',    name:'NANOBYTE',   title:'Micro Warrior',   color:'#a3e635',accent:'#d9f99d',hp:440,spd:8, pow:8, def:8, rarity:'Common',   spl:'Nano Swarm',     em:'',bW:1.1, bH:1.0},
  {id:'sektor',   name:'ARMOREX',    title:'Steel Crusher',   color:'#dc2626',accent:'#fca5a5',hp:450,spd:8, pow:9, def:8, rarity:'Epic',     spl:'Roll Crush',     em:'',bW:1.1, bH:1.0},
  {id:'kunglao',  name:'VELOCITY',   title:'Speed Phantom',   color:'#e2e8f0',accent:'#f1f5f9',hp:440,spd:9, pow:8, def:7, rarity:'Legendary',spl:'Speed Blitz',    em:'',bW:0.95,bH:1.0},
  {id:'nightwolf',name:'LUNARIX',    title:'Moon Beast',      color:'#84cc16',accent:'#bef264',hp:460,spd:7, pow:9, def:8, rarity:'Mythic',   spl:'Sonic Howl',     em:'',bW:1.1, bH:1.05},
  {id:'noob',     name:'SONARX',     title:'Echo Warrior',    color:'#64748b',accent:'#94a3b8',hp:425,spd:9, pow:10,def:6, rarity:'Mythic',   spl:'Wall of Sound',  em:'',bW:0.92,bH:1.0},
  {id:'goro',     name:'DYNOREX',    title:'Final Boss',      color:'#d97706',accent:'#fbbf24',hp:1100,spd:4,pow:10,def:10,rarity:'BOSS',     spl:'Dino Stomp',     em:'',boss:true,bW:1.6,bH:1.3},
];
var PLAYABLE=CHARS.filter(function(c){return !c.boss;});
var TOWER_ORDER=['cyrax','reptile','liukang','subzero','kitana','mileena','baraka','smoke','scorpion','kunglao','noob','raiden','sektor','noob','goro'];
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
var COMBO = { count: 0, timer: 0, lastHitter: null, text: '', textTimer: 0, flash: 0 };
var ROUND_WORDS = ['ZERO', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN'];
var KEYS = { left: false, right: false, jump: false, punch: false, kick: false, block: false };

// SPRITE SYSTEM - PixelLab Frame Animation
var SPRITES={};
var SPRITE_ANIMS={}; // {charId_pose: [img0, img1, ...]}
var SPRITE_BASE='sprites/';
var SPRITES_TOTAL=0, SPRITES_LOADED=0;
var SPRITES_READY=false;
function onSpriteLoaded(){SPRITES_LOADED++;if(SPRITES_LOADED>=SPRITES_TOTAL){SPRITES_READY=true;if(window._spriteReadyCb){window._spriteReadyCb();window._spriteReadyCb=null;}}}
var SPRITE_FRAMES={
  'scorpion_idle':8, 'scorpion_punch':6, 'scorpion_kick':7, 'scorpion_walk':6,
  'subzero_idle':8, 'subzero_punch':6, 'subzero_kick':6, 'subzero_walk':6,
  'liukang_idle':8, 'liukang_punch':6, 'liukang_kick':6, 'liukang_walk':6,
  'raiden_idle':8, 'raiden_punch':6, 'raiden_kick':7, 'raiden_walk':6,
  'reptile_idle':8, 'reptile_punch':6, 'reptile_kick':7, 'reptile_walk':6,
  'kitana_idle':8, 'kitana_punch':6, 'kitana_kick':7, 'kitana_walk':6,
  'mileena_idle':8, 'mileena_punch':6, 'mileena_kick':7, 'mileena_walk':6,
  'jaxon_idle':8, 'jaxon_punch':6, 'jaxon_kick':7, 'jaxon_walk':6,
  'baraka_idle':8, 'baraka_punch':6, 'baraka_kick':7, 'baraka_walk':6,
  'smoke_idle':8, 'smoke_punch':6, 'smoke_kick':7, 'smoke_walk':6,
  'cyrax_idle':8, 'cyrax_punch':6, 'cyrax_kick':7, 'cyrax_walk':6,
  'sektor_idle':8, 'sektor_punch':6, 'sektor_kick':7, 'sektor_walk':6,
  'kunglao_idle':8, 'kunglao_punch':6, 'kunglao_kick':7, 'kunglao_walk':6,
  'nightwolf_idle':8, 'nightwolf_punch':6, 'nightwolf_kick':7, 'nightwolf_walk':6,
  'noob_idle':8, 'noob_punch':6, 'noob_kick':7, 'noob_walk':6,
  'goro_idle':8, 'goro_punch':6, 'goro_kick':7, 'goro_walk':6
};
function loadSpriteFrames(charId,pose,count){
  var key=charId+'_'+pose;
  SPRITE_ANIMS[key]=[];
  SPRITES_TOTAL+=count+1; // frames + single
  for(var i=0;i<count;i++){
    (function(idx){
      var img=new Image();
      img.src=SPRITE_BASE+charId+'_'+pose+'_'+idx+'.png';
      img.onload=function(){SPRITE_ANIMS[key][idx]=img;onSpriteLoaded();};
      img.onerror=function(){SPRITE_ANIMS[key][idx]=null;onSpriteLoaded();};
    })(i);
  }
  // Also load single frame as fallback
  var single=new Image();
  single.src=SPRITE_BASE+charId+'_'+pose+'.png';
  single.onload=function(){SPRITES[key]=single;onSpriteLoaded();};
  single.onerror=function(){onSpriteLoaded();};
}
function initSprites(){
  for(var k in SPRITE_FRAMES){
    var parts=k.split('_');
    loadSpriteFrames(parts[0],parts[1],SPRITE_FRAMES[k]);
  }
  // block/hurt will use canvas fallback (no PixelLab sprites yet)
}
initSprites();

// -- 8-DIRECTION ROTATION SPRITES --
var ROT_SPRITES={};
var ROT_CHARS=['liukang','raiden','noob','nightwolf','scorpion','subzero','baraka','sektor','cyrax','smoke','jaxon','kitana','mileena','reptile','kunglao']; // Full roster 360-rotation re-enabled
function loadRotSprites(){
  ROT_CHARS.forEach(function(cid){
    ROT_SPRITES[cid]=[];
    for(var d=0;d<8;d++){
      (function(dir){
        var img=new Image();
        img.src=SPRITE_BASE+cid+'_rot_'+dir+'.png';
        img.onload=function(){ROT_SPRITES[cid][dir]=img;};
        img.onerror=function(){ROT_SPRITES[cid][dir]=null;};
      })(d);
    }
  });
}
loadRotSprites();

// =========================================================
// AUDIO ENGINE
// =========================================================
var AC_ctx=null;
function AC(){if(!AC_ctx)try{AC_ctx=new(window.AudioContext||window.webkitAudioContext)();}catch(e){}if(AC_ctx&&AC_ctx.state==='suspended')AC_ctx.resume().catch(function(){});return AC_ctx;}
document.addEventListener('click',function(){AC();if(window.speechSynthesis&&speechSynthesis.getVoices().length>0){_loadVoices();}});
function beep(freq,type,dur,vol,delay){var ac=AC();if(!ac)return;var o=ac.createOscillator(),g=ac.createGain(),t=ac.currentTime+(delay||0);o.type=type||'sine';o.frequency.value=freq;g.gain.setValueAtTime(vol||0.2,t);g.gain.exponentialRampToValueAtTime(0.001,t+dur);o.connect(g);g.connect(ac.destination);o.start(t);o.stop(t+dur);}
var _noiseBuf=null;
function getNoise(){var ac=AC();if(!ac)return null;if(!_noiseBuf){_noiseBuf=ac.createBuffer(1,ac.sampleRate*0.3,ac.sampleRate);var d=_noiseBuf.getChannelData(0);for(var i=0;i<d.length;i++)d[i]=(Math.random()*2-1);}return _noiseBuf;}
function playNoise(dur,vol,freq){var ac=AC();if(!ac)return;var buf=getNoise();if(!buf)return;var src=ac.createBufferSource();src.buffer=buf;var flt=ac.createBiquadFilter();flt.type='bandpass';flt.frequency.value=freq||800;flt.Q.value=1;var g=ac.createGain();g.gain.setValueAtTime(vol||0.2,ac.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ac.currentTime+dur);src.connect(flt);flt.connect(g);g.connect(ac.destination);src.start();src.stop(ac.currentTime+dur);}

// -- SFX ENGINE --
function snd(type){try{
  var src='';
  if(type==='punch') src='voice/punch.mp3';
  else if(type==='kick') src='voice/kick.mp3';
  else if(type==='hit') src='voice/hit.mp3';
  else if(type==='block') src='voice/block.mp3';

  if(src) {
    if(!window._sfxPool) window._sfxPool={};
    if(!window._sfxPool[src]) {
      window._sfxPool[src]=[];
      for(var i=0;i<4;i++){var a=new Audio(src);a.volume=0.85;a.load();window._sfxPool[src].push(a);}
    }
    var pool=window._sfxPool[src];
    var played=false;
    for(var j=0;j<pool.length;j++){
      if(pool[j].paused||pool[j].ended){
        pool[j].currentTime=0;
        var p=pool[j].play();
        if(p&&p.catch)p.catch(function(){}); // Catch Android autoplay policy
        played=true;break;
      }
    }
    if(!played){var a2=new Audio(src);a2.volume=0.85;a2.play().catch(function(){});pool.push(a2);}
  }


  // Combined Synth layers for "weight"
  if(type==='punch')           {beep(180,'sawtooth',0.05,0.8);beep(90,'square',0.04,0.6);playNoise(0.07,0.6,1400);}
  else if(type==='kick')       {beep(90,'square',0.14,0.9);beep(55,'sawtooth',0.1,0.6);playNoise(0.12,0.7,500);}
  else if(type==='block')      {beep(1400,'triangle',0.025,0.4);beep(900,'sine',0.04,0.25);playNoise(0.03,0.3,4000);}
  else if(type==='special')    {beep(100,'sawtooth',0.1,0.7);beep(350,'sawtooth',0.3,0.7,0.1);beep(650,'sine',0.2,0.5,0.22);playNoise(0.2,0.5,1800);}
  else if(type==='hit')        {beep(220,'sawtooth',0.07,0.7);playNoise(0.09,0.6,900);beep(110,'square',0.04,0.4);}
  else if(type==='ko')         {beep(280,'sawtooth',0.05,0.9);beep(70,'sawtooth',1.0,0.8,0.05);playNoise(0.5,0.6,300);}
  else if(type==='select')     {beep(523,'sine',0.07,0.35);beep(784,'sine',0.07,0.3,0.08);beep(1046,'sine',0.1,0.25,0.16);}
  else if(type==='start')      {beep(330,'square',0.05,0.7);beep(494,'square',0.05,0.7,0.1);beep(659,'square',0.05,0.7,0.2);beep(988,'square',0.15,0.6,0.3);}
  else if(type==='cd')         {beep(440,'sine',0.12,0.45);}
  else if(type==='fight')      {beep(250,'square',0.03,0.9);beep(400,'square',0.03,0.8,0.06);beep(600,'square',0.03,0.7,0.12);beep(900,'square',0.18,0.7,0.18);playNoise(0.2,0.5,2500);}
  else if(type==='finishhim')  {beep(140,'sawtooth',0.18,0.9);beep(95,'square',0.4,0.8,0.18);beep(70,'sawtooth',0.35,0.7,0.5);playNoise(0.5,0.5,250);}
  else if(type==='combo')      {beep(660,'sine',0.035,0.35);beep(880,'sine',0.035,0.3,0.06);beep(1100,'sine',0.05,0.25,0.12);}
}catch(e){}}

// -- BGM CONTROLLER (routes to global MK_AUDIO) --
function bgmStop(){
  window.MK_CAN_PLAY=false;
  if(window.MK_AUDIO){try{window.MK_AUDIO.volume=0;window.MK_AUDIO.pause();window.MK_AUDIO.currentTime=0;}catch(e){}}
}
function bgmPlay(key){
  if(key==='menu'||key==='select'){window.MK_CAN_PLAY=true;MK_PLAY();}
  else{bgmStop();}
}
// =========================================================
// ANNOUNCER VOICE
// =========================================================
var _voices=[];
var _voicesLoaded=false;
var _lastUtterance=null;
function _loadVoices(){
  if(!window.speechSynthesis)return;
  try{var v=speechSynthesis.getVoices();if(v&&v.length>0){_voices=v;_voicesLoaded=true;}}catch(e){}
}
_loadVoices();
if(window.speechSynthesis){
  try{speechSynthesis.onvoiceschanged=function(){_loadVoices();};}catch(e){}
  setTimeout(_loadVoices,500);setTimeout(_loadVoices,2000);
}
function _getVoice(){
  if(!_voicesLoaded)_loadVoices();
  var deepNames=['mark','david','george','james','daniel','richard','thomas'];
  for(var d=0;d<deepNames.length;d++){
    for(var i=0;i<_voices.length;i++){
      if(_voices[i].name.toLowerCase().indexOf(deepNames[d])>=0&&_voices[i].lang.indexOf('en')===0)return _voices[i];
    }
  }
  for(var i=0;i<_voices.length;i++){if(_voices[i].lang.indexOf('en')===0&&_voices[i].name.toLowerCase().indexOf('male')>=0)return _voices[i];}
  for(var j=0;j<_voices.length;j++){if(_voices[j].lang.indexOf('en')===0)return _voices[j];}
  return _voices[0]||null;
}
function toSpeech(t){return t.replace(/\b[A-Z]+\b/g,function(w){return w.charAt(0)+w.slice(1).toLowerCase();});}


// =========================================================
// COMBO SYSTEM
// =========================================================
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
function bgmStop(){if(window.MK_AUDIO){window.MK_CAN_PLAY=false;window.MK_AUDIO.pause();window.MK_AUDIO.currentTime=0;}}
function bgmPlay(id){if(window.MK_PLAY){window._bgmKey=id;window.MK_PLAY();}}

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
// SPRITE RENDERING
// =========================================================
function drawFighter(ctx,f,t){
  var x=f.x,y=f.y,dir=f.dir,c=f.ch.color,ac=f.ch.accent,id=f.ch.id;
  var H=f.H*(f.ch.bH||1),st=f.state,af=f.af;
  var bwM=f.ch.bW||1;

  // TRY SPRITE FIRST (Frame Animation)
  var sprPose=st==='special'?'punch':(st==='block'||st==='hurt')?'idle':st;
  var sprKey=id+'_'+sprPose;
  var spr=null;

  var isRotSpr=false;
  var rotF=ROT_SPRITES[id];
  if(st==='idle' && rotF && f.rotAngle!==undefined){
    var rotIdx=(Math.round(f.rotAngle/45)+4)%8;
    if(rotF[rotIdx] && rotF[rotIdx].complete && rotF[rotIdx].naturalWidth>0){
      spr=rotF[rotIdx];
      isRotSpr=true;
    }
  }
  var frames=SPRITE_ANIMS[sprKey];
  if(frames && frames.length>0 && !spr){
    // Find loaded frames (async loads)
    var loadedFrames=[];
    for(var fi=0;fi<frames.length;fi++){if(frames[fi])loadedFrames.push(frames[fi]);}
    if(loadedFrames.length>0){
      var animSpeed=f.animSpeed || (st==='idle'?8:st==='walk'?4:3);
      var frameIdx=Math.floor(t/animSpeed)%loadedFrames.length;
      spr=loadedFrames[frameIdx];
    }
  }
  if(!spr)spr=SPRITES[sprKey];
  // Fallback: try idle sprite
  if(!spr){
    var idleKey=id+'_idle';
    var idleFrames=SPRITE_ANIMS[idleKey];
    if(idleFrames && idleFrames.length>0){
      for(var fi2=0;fi2<idleFrames.length;fi2++){if(idleFrames[fi2]){spr=idleFrames[fi2];break;}}
    }
    if(!spr)spr=SPRITES[idleKey];
  }
  if(spr){
    ctx.save();
    // Smart Scaling: 1.4x boost for rotation assets to fill the preview, plus character multiplier
    var hBoost = isRotSpr ? 1.45 : 1.15;
    var sprH=H*hBoost;
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

    // FALLEN (KO loser): squish sprite flat on ground
    if(st==='fallen'){
      // Draw shadow on ground first
      ctx.fillStyle='rgba(0,0,0,0.55)';
      ctx.beginPath();ctx.ellipse(0,4,sprW*0.65,10,0,0,Math.PI*2);ctx.fill();
      // Squish sprite flat: scale Y to near 0 so it looks like body on floor
      ctx.save();
      ctx.translate(0, -4); // sit just above floor
      ctx.scale(1.25, 0.18); // wide and flat = lying on ground
      ctx.globalAlpha = 0.75;
      if(spr){
        ctx.drawImage(spr,-sprW/2,-sprH,sprW,sprH);
      } else {
        ctx.fillStyle=c;
        ctx.fillRect(-sprW*0.6, -sprH, sprW*1.2, sprH);
      }
      ctx.globalAlpha=1;
      ctx.restore();
      // Red glow overlay
      ctx.fillStyle='rgba(239,68,68,0.18)';
      ctx.fillRect(-sprW*0.7,-8,sprW*1.4,16);
      ctx.restore();
      return;
    }

    // VICTORY (KO winner): stand tall with pulsing glow ring
    if(st==='victory'){
      // Draw sprite normally with gentle bob
      var vbob=Math.sin(t*0.07)*4;
      if(spr){
        ctx.drawImage(spr,-sprW/2,-sprH+vbob,sprW,sprH);
      } else {
        ctx.fillStyle=c;ctx.globalAlpha=0.9;
        ctx.beginPath();ctx.arc(0,-sprH*0.88,sprW*0.32,0,Math.PI*2);ctx.fill();
        ctx.fillRect(-sprW*0.35,-sprH*0.75,sprW*0.7,sprH*0.55);
        ctx.globalAlpha=1;
      }
      // Pulsing color ring — no gradient needed
      var pulse=0.35+Math.sin(t*0.08)*0.25;
      ctx.strokeStyle=c;ctx.lineWidth=3;ctx.globalAlpha=pulse;
      ctx.beginPath();ctx.arc(0,-sprH*0.5,sprW*0.62,0,Math.PI*2);ctx.stroke();
      ctx.globalAlpha=1;
      ctx.restore();
      return;
    }
    // HURT EFFECTS -- shake only, no fade
    if(st==='hurt'){
      ctx.save();
      ctx.translate(Math.sin(af*1.8)*5,0); // horizontal shake only
      ctx.drawImage(spr,-sprW/2,-sprH+bob,sprW,sprH);
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

  // SIMPLE SILHOUETTE FALLBACK (replaces old canvas stick figure)
  ctx.save();ctx.translate(x,y);if(dir<0)ctx.scale(-1,1);
  var silH=H*1.1,silW=silH*0.5*bwM;
  ctx.fillStyle='rgba(0,0,0,0.3)';ctx.beginPath();ctx.ellipse(0,5,silW*0.4,6,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=c;ctx.globalAlpha=0.85;
  ctx.beginPath();ctx.arc(0,-silH*0.88,silW*0.32,0,Math.PI*2);ctx.fill();
  ctx.fillRect(-silW*0.35,-silH*0.75,silW*0.7,silH*0.4);
  ctx.fillRect(-silW*0.3,-silH*0.35,silW*0.25,silH*0.38);
  ctx.fillRect(silW*0.05,-silH*0.35,silW*0.25,silH*0.38);
  ctx.fillRect(-silW*0.5,-silH*0.72,silW*0.18,silH*0.3);
  ctx.fillRect(silW*0.32,-silH*0.72,silW*0.18,silH*0.3);
  ctx.strokeStyle=c;ctx.lineWidth=2;ctx.globalAlpha=0.5;
  ctx.beginPath();ctx.arc(0,-silH*0.88,silW*0.34,0,Math.PI*2);ctx.stroke();
  ctx.globalAlpha=1;
  ctx.font='bold '+Math.round(silW*0.5)+'px Arial';ctx.textAlign='center';
  ctx.fillStyle='#fff';ctx.fillText(f.ch.name.charAt(0),0,-silH*0.45);
  ctx.restore();
}


// Draw character preview — animated with fight showcase support
function drawCharPreview(canvas,ch,size,frame,pose){
  // v15.0: Permanent Framing Fix - increase internal resolution to 128 to prevent head clipping
  var w=128,h=128;
  canvas.width=w;canvas.height=h;
  var ctx=canvas.getContext('2d');
  ctx.clearRect(0,0,w,h);
  var rotActive=ROT_CHARS.indexOf(ch.id)>=0;
  // Use a height that leaves ~20% headspace even for tall characters
  var charH=h*(rotActive?0.95:0.75)*(ch.bH||1.0);
  var t=frame!==undefined?frame:60;
  var st=pose||'idle';
  // Collect loaded animation frames for this pose
  var key=ch.id+'_'+st;
  var frames=SPRITE_ANIMS[key];
  var loaded=[];
  if(frames)for(var fi=0;fi<frames.length;fi++){if(frames[fi])loaded.push(frames[fi]);}
  // For idle: drawFighter fallback handles rotation if needed
  var spr=null;
  if(!spr&&loaded.length>0){
    var animSpd=st==='idle'?8:3;
    spr=loaded[Math.floor(t/animSpd)%loaded.length];
  }
  var bob=st==='idle'?Math.sin(t*0.10)*1.8:0;
  if(spr){
    var sH=charH,sW=sH*(spr.width/spr.height);
    // h-8: Pull everything down from the 128px top boundary to eliminate clipping
    ctx.drawImage(spr,(w-sW)/2,h-8-sH+bob,sW,sH);
  } else {
    var fakeF={x:w/2,y:h-8+bob,dir:1,ch:ch,H:charH,state:st,af:t%20,vy:0,rotAngle:G.rotAngle||0};
    drawFighter(ctx,fakeF,t);
  }
  // Free Fire style: flash + action label for punch/kick
  if(st==='punch'||st==='kick'){
    var lCol=st==='punch'?'#ef4444':'#f59e0b';
    if(t<8){ctx.fillStyle='rgba(255,255,255,'+(0.28*(1-t/8))+')';ctx.fillRect(0,0,w,h);}
    ctx.globalAlpha=0.85+Math.sin(t*0.22)*0.15;
    ctx.font='bold '+Math.round(w*0.13)+'px Impact,sans-serif';
    ctx.textAlign='center';ctx.textBaseline='top';
    ctx.strokeStyle='rgba(0,0,0,0.8)';ctx.lineWidth=2;
    var lbl=st==='punch'?'PUNCH!':'KICK!';
    ctx.strokeText(lbl,w/2,3);ctx.fillStyle=lCol;ctx.fillText(lbl,w/2,3);
    ctx.globalAlpha=1;
  }
}



// =========================================================
// BACKGROUND
// =========================================================
var BG_IMAGES={};
var BG_MAP={
  cyrax:'bg_cyber',      // Stage 1  — Cyber Lab (Nanomech/Cyrax)
  reptile:'bg_ocean',    // Stage 2  — Ocean Deep (Ripjaws/Reptile)
  liukang:'bg_jungle',   // Stage 3  — Jungle Swamp (Swampfire/Liu Kang)
  subzero:'bg_ice',      // Stage 4  — Ice Cave (Sub-Zero)
  kitana:'bg_dark_storm',// Stage 5  — Dark Storm (Upgrade/Kitana)
  mileena:'bg_crystal',  // Stage 6  — Crystal Cave (Chromastone/Mileena)
  baraka:'bg_fire',      // Stage 7  — Fire Arena (Wildmutt/Baraka)
  smoke:'bg_ghost',      // Stage 8  — Ghost Realm (Ghostfreak/Smoke)
  scorpion:'bg_forest',  // Stage 9  — Dark Forest (Benwolf/Scorpion) - NOTE: scorpion is player char; TOWER uses cpu opponent
  kunglao:'bg_speed',    // Stage 10 — Speed Track (Fasttrack/Kung Lao)
  nightwolf:'bg_forge',  // Stage 11 — Metal Forge (Benwolf/Nightwolf)
  raiden:'bg_storm',     // Stage 12 — Storm (Shocksquatch/Raiden)
  sektor:'bg_void',      // Stage 13 — Sound Void (Echo Echo/Sektor)
  noob:'bg_dark_forest', // Stage 14 — Dark Forest (Noob Saibot)
  goro:'bg_boss'         // Stage 15 — Boss (Humungousaur/Goro)
};
['bg_fire','bg_ice','bg_jungle','bg_cyber','bg_storm','bg_dark_storm','bg_boss','bg_ocean','bg_crystal','bg_ghost','bg_forest','bg_dark_forest','bg_speed','bg_void','bg_forge'].forEach(function(name){
  var img=new Image();img.src=name+'.png';BG_IMAGES[name]=img;
});
// Boss Video Background
var BOSS_VIDEO=document.createElement('video');
BOSS_VIDEO.src='bg_boss_video.mp4';
BOSS_VIDEO.loop=true;BOSS_VIDEO.muted=true;BOSS_VIDEO.playsInline=true;
BOSS_VIDEO.volume=0.4;BOSS_VIDEO.preload='auto';BOSS_VIDEO.load();
var bossVideoReady=false;
BOSS_VIDEO.addEventListener('canplaythrough',function(){bossVideoReady=true;});
var BG_THEMES=[
  {sky:['#1a0800','#3d1500','#6b2d00'],floor:'#1a0a00',lava:'#ef4444',accent:'#f59e0b'},
  {sky:['#00040f','#001230','#002260'],floor:'#000a1a',lava:'#3b82f6',accent:'#38bdf8'},
  {sky:['#180000','#3d0000','#6b1010'],floor:'#1a0000',lava:'#ef4444',accent:'#f97316'},
  {sky:['#08001a','#180040','#2a0060'],floor:'#0a0020',lava:'#8b5cf6',accent:'#a78bfa'},
  {sky:['#0a0a12','#181828','#28283a'],floor:'#0a0a10',lava:'#6b7280',accent:'#9ca3af'},
  {sky:['#1a1000','#3d2800','#7a4d00'],floor:'#1a1000',lava:'#f59e0b',accent:'#fbbf24'},
];
function drawBG(ctx,W,H,stage,t){
  var opp=TOWER[Math.min(stage-1,TOWER.length-1)];
  var bgKey=BG_MAP[opp.id]||'bg_fire';
  // Boss stage: use video background
  if(opp.id==='goro'&&bossVideoReady){
    try{
      if(BOSS_VIDEO.paused)BOSS_VIDEO.play();
      ctx.drawImage(BOSS_VIDEO,0,0,W,H);
      ctx.fillStyle='rgba(0,0,0,0.1)';ctx.fillRect(0,0,W,H);
    }catch(e){
      var bgImg=BG_IMAGES[bgKey];
      if(bgImg&&bgImg.complete&&bgImg.naturalWidth>0){ctx.drawImage(bgImg,0,0,W,H);ctx.fillStyle='rgba(0,0,0,0.15)';ctx.fillRect(0,0,W,H);}
    }
  } else {
    var bgImg=BG_IMAGES[bgKey];
    // Draw PNG background image
    if(bgImg&&bgImg.complete&&bgImg.naturalWidth>0){
      ctx.drawImage(bgImg,0,0,W,H);
      ctx.fillStyle='rgba(0,0,0,0.15)';ctx.fillRect(0,0,W,H);
    } else {
      var g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0a0a12');g.addColorStop(1,'#050505');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    }
  }
  // Animated overlays per theme — optimized (low particle count)
  var id=opp.id;
  if(id==='cyrax'||id==='kitana'||id==='sektor'){
    ctx.fillStyle='rgba(163,230,53,0.3)';
    for(var dp=0;dp<10;dp++){var ddx=((dp*W/10+t*0.5)%W);var ddy=H*0.1+Math.sin(t*0.02+dp)*H*0.4;ctx.fillRect(ddx,ddy,2,2);}
    ctx.strokeStyle='rgba(163,230,53,0.06)';ctx.lineWidth=1;for(var sl=0;sl<H;sl+=8){ctx.beginPath();ctx.moveTo(0,sl);ctx.lineTo(W,sl);ctx.stroke();}
  } else if(id==='reptile'){
    for(var bu=0;bu<8;bu++){var bx=((bu*W/8+Math.sin(t*0.01+bu)*15))%W;var byy=H-((t*0.6+bu*55)%(H*0.85));ctx.strokeStyle='rgba(56,189,248,0.25)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(bx,byy,1.5,0,Math.PI*2);ctx.stroke();}
  } else if(id==='liukang'||id==='baraka'||id==='noob'){
    for(var fl=0;fl<12;fl++){var fx=((fl*W/12+t*0.2+Math.sin(fl*3)*40)%W);var fy=H*0.05+Math.sin(t*0.018+fl*0.6)*H*0.6;ctx.fillStyle='rgba(250,220,50,0.2)';ctx.beginPath();ctx.arc(fx,fy,1.2,0,Math.PI*2);ctx.fill();}
  } else if(id==='subzero'){
    for(var sn=0;sn<15;sn++){var sx=((sn*W/15+t*0.15+Math.sin(sn*2)*20)%W);var sy=((t*0.4+sn*35)%H);ctx.fillStyle='rgba(255,255,255,0.2)';ctx.beginPath();ctx.arc(sx,sy,1,0,Math.PI*2);ctx.fill();}
  } else if(id==='mileena'){
    var cC=['rgba(244,114,182,','rgba(168,85,247,','rgba(56,189,248,'];
    for(var spp=0;spp<8;spp++){var spx=((spp*W/8+t*0.12)%W);var spy=H*0.05+Math.sin(t*0.022+spp*0.7)*H*0.6;ctx.fillStyle=cC[spp%3]+'0.25)';ctx.beginPath();ctx.arc(spx,spy,1.5,0,Math.PI*2);ctx.fill();}
  } else if(id==='smoke'){
    for(var gf=0;gf<3;gf++){var gfx=((gf*W/3+t*0.25)%W);var gfy=H*0.25+Math.sin(t*0.01+gf)*H*0.2;ctx.fillStyle='rgba(167,139,250,0.04)';ctx.fillRect(gfx-40,gfy-40,80,80);}
  } else if(id==='scorpion'||id==='goro'){
    for(var em=0;em<10;em++){var emx=((em*W/10+t*0.5)%W);var emy=H-((t*0.7+em*35)%(H*0.75));ctx.fillStyle='rgba(245,158,11,0.28)';ctx.beginPath();ctx.arc(emx,emy,1.5,0,Math.PI*2);ctx.fill();}
    ctx.fillStyle='rgba(239,68,68,0.04)';ctx.fillRect(0,H*0.78,W,H*0.22);
  } else if(id==='raiden'){
    if(Math.sin(t*0.15)>0.93){ctx.fillStyle='rgba(139,92,246,0.08)';ctx.fillRect(0,0,W,H);}
    ctx.strokeStyle='rgba(139,92,246,0.07)';ctx.lineWidth=1;for(var rr=0;rr<12;rr++){var rrx=((rr*W/12+t*0.08)%W);var rry=((t*3.5+rr*28)%H);ctx.beginPath();ctx.moveTo(rrx,rry);ctx.lineTo(rrx-1,rry+10);ctx.stroke();}
  } else if(id==='kunglao'){
    for(var vl=0;vl<6;vl++){var vlx=((vl*W/6+t*3)%W);ctx.strokeStyle='rgba(226,232,240,0.04)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(vlx,0);ctx.lineTo(vlx-15,H);ctx.stroke();}
  } else if(id==='noob'){
    ctx.strokeStyle='rgba(100,116,139,0.07)';ctx.lineWidth=1;for(var sw=0;sw<3;sw++){var sr=25+sw*30+Math.sin(t*0.025)*12;ctx.beginPath();ctx.arc(W*0.5,H*0.45,sr,0,Math.PI*2);ctx.stroke();}
  }
  // Floor line
  var floorY=H*({bg_fire:0.78,bg_ice:0.80,bg_jungle:0.80,bg_cyber:0.78,bg_storm:0.82,bg_boss:0.76,bg_ocean:0.84,bg_crystal:0.84,bg_ghost:0.82,bg_forest:0.82,bg_speed:0.80,bg_void:0.76,bg_forge:0.80}[bgKey]||0.78);
  ctx.strokeStyle='rgba(255,255,255,0.06)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,floorY);ctx.lineTo(W,floorY);ctx.stroke();
}
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
  G.cpuTick=0;G.cpuRetreat=0;G.aiData=null; // reset adaptive AI for new fight

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
    // Per-background floor height (where fighters stand on the visible path)
    var FLOOR_MAP={
      bg_fire:0.78, bg_ice:0.80, bg_jungle:0.80, bg_cyber:0.78,
      bg_storm:0.82, bg_boss:0.76, bg_ocean:0.84, bg_crystal:0.84,
      bg_ghost:0.82, bg_forest:0.82, bg_speed:0.80, bg_void:0.76,
      bg_forge:0.80
    };
    var floorKey=BG_MAP[opp.id]||'bg_fire';
    var FLOOR=H*(FLOOR_MAP[floorKey]||0.78);
    G.gs={
      p1:{ch:G.player,x:W*0.28,y:FLOOR,vy:0,onGround:true,hp:G.player.hp,maxHp:G.player.hp,energy:0,state:'idle',af:0,cd:0,dir:1,H:Math.round(SC*110),dmgTaken:0},
      p2:{ch:opp,x:W*0.72,y:FLOOR,vy:0,onGround:true,hp:Math.round(opp.hp*eHpMult),maxHp:Math.round(opp.hp*eHpMult),energy:0,state:'idle',af:0,cd:0,dir:-1,H:Math.round(SC*110),dmgTaken:0},
      timer:300,lastSec:Date.now(),
      p1r:0,p2r:0,round:1,
      parts:[],shake:0,floatTexts:[],
      phase:'roundAnnounce',roundAnnTimer:40,
      cd:3,cdTick:60,
      frame:0,W:W,H:H,FLOOR:FLOOR,SC:SC,bgFloorKey:floorKey,
      over:false,finishHim:false,finishTimer:0,
      roundOverText:'',roundOverColor:'#fff',
    };
    announce('Round One',200);
    // Video stages: play video audio instead of synth music
    var bgKey2=BG_MAP[opp.id]||'bg_fire';
    if(opp.id==='goro'&&window.bossVideoReady){
      stopBGMusic();BOSS_VIDEO.currentTime=0;BOSS_VIDEO.muted=false;BOSS_VIDEO.volume=0.4;
      try{BOSS_VIDEO.play();}catch(e){}
    } else {
      startBGMusic();
    }
    G.raf=requestAnimationFrame(fightLoop);
  }
  waitAndInit(0);
}

function stopFight(){
  G.stopped=true;
  if(G.raf)cancelAnimationFrame(G.raf);
  stopBGMusic();
  // Pause video backgrounds
  try{BOSS_VIDEO.pause();BOSS_VIDEO.muted=true;}catch(e){}
}


function hbox(f){return{x:f.x-26,y:f.y-f.H,w:52,h:f.H};}
function abox(f,type){
  var r=type==='kick'?62:type==='special'?115:48;
  var ox=f.dir>0?18:-18-r;
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

  // ── X-RAY: Finish Him + Special = CINEMATIC ──
  if(type==='special' && gs.finishHim && !gs.xray){
    p1.energy=0;
    triggerXRay(gs);
    return;
  }

  p1.state=type;p1.af=0;
  p1.cd={punch:14,kick:20,special:26}[type]||14;
  if(type==='special')p1.energy=0;
  snd(type);doAttack(p1,gs.p2,type,gs);
}
window._atk=playerAttack;

// CPU AI - REALISTIC HUMAN-LIKE FIGHTER
// Behaviors: circling, pressure/retreat cycles, feints, momentum shifts,
// emotional reactions, combo strings, spacing game, mind games
function cpuThink(gs){
  var p1=gs.p1,p2=gs.p2;
  var canAct2=['idle','walk'].indexOf(p2.state)>=0;
  var dist=Math.abs(p2.x-p1.x);
  var p1Attacking=['punch','kick','special'].indexOf(p1.state)>=0;
  var f=gs.frame;

  // === PERSONALITY STATE ===
  if(!G.aiData)G.aiData={
    punch:0,kick:0,special:0,block:0,lastState:'',comboHits:0,comboChain:0,
    mode:'neutral',  // neutral, aggressive, defensive, bait
    modeTimer:0,     // how long to stay in current mode
    circleDir:1,     // circling direction
    feintTimer:0,    // feint cooldown
    pressureWave:0,  // pressure attack wave counter
    breathe:0,       // small pause between attack bursts
    momentum:50      // 0=CPU losing badly, 100=CPU dominating
  };
  var ai=G.aiData;

  // Track player moves
  if(p1.state!==ai.lastState){
    ai.lastState=p1.state;
    if(p1.state==='punch')ai.punch++;
    else if(p1.state==='kick')ai.kick++;
    else if(p1.state==='special')ai.special++;
    else if(p1.state==='block')ai.block++;
  }
  if(p2.state==='hurt'){ai.comboHits++;ai.momentum=Math.max(0,ai.momentum-3);}
  else if(p2.state!=='block'){ai.comboHits=0;}
  if(p1.state==='hurt'){ai.momentum=Math.min(100,ai.momentum+4);}

  var p1Hp=p1.hp/p1.maxHp;
  var p2Hp=p2.hp/p2.maxHp;
  var skillLevel=Math.min(1.0, 0.55+G.stage*0.04);

  // === MODE SWITCHING (human-like behavior cycles) ===
  ai.modeTimer--;
  if(ai.modeTimer<=0){
    var mRoll=Math.random();
    // Low HP = more aggressive (desperation)
    if(p2Hp<0.3){ai.mode='aggressive';ai.modeTimer=60+Math.floor(Math.random()*40);}
    // Winning = mix pressure with bait
    else if(ai.momentum>70){ai.mode=mRoll<0.6?'aggressive':'bait';ai.modeTimer=50+Math.floor(Math.random()*50);}
    // Normal flow: cycle through modes like a real player
    else if(mRoll<0.45){ai.mode='aggressive';ai.modeTimer=40+Math.floor(Math.random()*60);}
    else if(mRoll<0.70){ai.mode='neutral';ai.modeTimer=30+Math.floor(Math.random()*40);}
    else if(mRoll<0.85){ai.mode='defensive';ai.modeTimer=20+Math.floor(Math.random()*30);}
    else{ai.mode='bait';ai.modeTimer=30+Math.floor(Math.random()*30);}
  }

  // === REACTION TO GETTING HIT ===
  if(ai.comboHits>=2&&canAct2&&p2.cd<=0&&dist<140){
    if(Math.random()<0.5){p2.state='block';p2.cd=12;snd('block');ai.comboHits=0;return;}
    var escD=p2.x>p1.x?1:-1;
    p2.x+=escD*p2.ch.spd*0.5*gs.SC;
    p2.x=Math.max(30,Math.min(gs.W-30,p2.x));
    ai.comboHits=0;return;
  }

  // === DODGE AFTER HURT ===
  if(p2.state==='hurt'&&p2.af>=5){
    if(Math.random()<0.35){
      var escH=p2.x>p1.x?1:-1;
      p2.x+=escH*p2.ch.spd*0.3*gs.SC;
      p2.x=Math.max(30,Math.min(gs.W-30,p2.x));
    }
  }

  // === DODGE INCOMING ATTACKS ===
  if(canAct2&&p2.cd<=0&&p1Attacking&&dist<110){
    var dChance=ai.mode==='defensive'?0.30:0.15;
    if(Math.random()<dChance){
      var dDir=p2.x>p1.x?1:-1;
      p2.x+=dDir*p2.ch.spd*0.45*gs.SC;
      p2.x=Math.max(30,Math.min(gs.W-30,p2.x));
      p2.state='walk';return;
    }
  }

  // === MOVEMENT SYSTEM (human-like spacing) ===
  if(canAct2&&p2.cd<=0){
    var toP1=p2.x>p1.x?-1:1;

    if(ai.mode==='aggressive'){
      // RUSH IN - close distance
      if(dist>60){
        p2.x+=toP1*p2.ch.spd*0.7*gs.SC;
        p2.state='walk';
      } else if(dist>35){
        p2.x+=toP1*p2.ch.spd*0.4*gs.SC;
        p2.state='walk';
      } else {if(p2.state==='walk')p2.state='idle';}
    }
    else if(ai.mode==='defensive'){
      if(dist<80){
        p2.x+=(-toP1)*p2.ch.spd*0.3*gs.SC;
        p2.state='walk';
      } else if(dist>200){
        p2.x+=toP1*p2.ch.spd*0.5*gs.SC;
        p2.state='walk';
      } else {
        if(f%60<30){p2.x+=ai.circleDir*p2.ch.spd*0.15*gs.SC;}
        p2.x=Math.max(30,Math.min(gs.W-30,p2.x));
        if(p2.state==='walk')p2.state='idle';
      }
    }
    else if(ai.mode==='bait'){
      if(ai.feintTimer>0){
        ai.feintTimer--;
        p2.x+=(-toP1)*p2.ch.spd*0.25*gs.SC;
        p2.state='walk';
      } else if(dist>100){
        p2.x+=toP1*p2.ch.spd*0.6*gs.SC;
        p2.state='walk';
        if(dist<90)ai.feintTimer=15+Math.floor(Math.random()*15);
      } else {
        if(p2.state==='walk')p2.state='idle';
      }
    }
    else{ // neutral
      if(dist>80){
        p2.x+=toP1*p2.ch.spd*0.55*gs.SC;
        p2.state='walk';
      } else if(dist>45){
        p2.x+=toP1*p2.ch.spd*0.25*gs.SC;
        p2.state='walk';
      } else {if(p2.state==='walk')p2.state='idle';}
    }
  }

  if(p2.cd>0||p2.state==='hurt')return;

  // === BREATHE (natural pause between attack bursts) ===
  if(ai.breathe>0){ai.breathe--;return;}

  // === REACTION TIMING ===
  G.cpuTick--;if(G.cpuTick>0)return;
  var react;
  if(ai.mode==='aggressive')react=Math.max(3,8-G.stage)+Math.floor(Math.random()*5);
  else if(ai.mode==='defensive')react=Math.max(6,14-G.stage)+Math.floor(Math.random()*8);
  else react=Math.max(4,10-G.stage)+Math.floor(Math.random()*6);
  G.cpuTick=react;

  // Skill check - higher stages = less hesitation
  if(Math.random()>Math.max(skillLevel,0.82))return;

  var r=Math.random();

  // === COMBAT ACTIONS ===
  if(dist<230){

    // --- COMBO CHAIN (follow-up attacks like real fighters do) ---
    if(ai.comboChain>0&&canAct2){
      ai.comboChain--;
      var combos=[['punch','kick'],['punch','punch','kick'],['kick','punch'],['punch','kick','punch']];
      var pattern=combos[Math.floor(Math.random()*combos.length)];
      var ci=ai.comboChain%pattern.length;
      var comboAct=pattern[ci];
      p2.state=comboAct;p2.af=0;p2.cd={punch:10,kick:14}[comboAct];
      snd(comboAct);doAttack(p2,p1,comboAct,gs);
      return;
    }

    // --- BLOCK AND COUNTER (realistic reaction to enemy attack) ---
    if(p1Attacking&&dist<120){
      var blockRate=ai.mode==='defensive'?0.40:ai.mode==='aggressive'?0.15:0.25;
      if(r<blockRate){
        p2.state='block';p2.cd=10;snd('block');
        // Queue counter-attack after block (real fighters always counter)
        ai.comboChain=1+Math.floor(Math.random()*2);
        return;
      }
    }

    // --- COUNTER AFTER BLOCK ---
    if(p2.state==='block'&&Math.random()<0.65){
      var counter=Math.random()<0.5?'punch':'kick';
      p2.state=counter;p2.af=0;p2.cd={punch:8,kick:12}[counter];
      snd(counter);doAttack(p2,p1,counter,gs);
      ai.comboChain=Math.floor(Math.random()*2); // maybe follow up
      return;
    }

    // --- MAIN ATTACK LOGIC ---
    var aggr;
    if(ai.mode==='aggressive')aggr=Math.min(0.95,0.78+G.stage*0.015);
    else if(ai.mode==='defensive')aggr=Math.min(0.55,0.30+G.stage*0.02);
    else if(ai.mode==='bait')aggr=Math.min(0.70,0.45+G.stage*0.02);
    else aggr=Math.min(0.82,0.60+G.stage*0.015);

    if(r<aggr){
      var act;

      // DESPERATION SPECIAL - low HP CPU goes all out
      if(p2Hp<0.25&&p2.energy>=100){act='special';}
      // USE SPECIAL when ready (50% chance)
      else if(p2.energy>=100&&Math.random()<0.45){act='special';}
      // CLOSE RANGE - fast punches
      else if(dist<50){
        act=Math.random()<0.65?'punch':'kick';
      }
      // MID RANGE - kicks and punches mix
      else if(dist<120){
        var attacks=['punch','kick','punch','kick'];
        act=attacks[Math.floor(Math.random()*attacks.length)];
      }
      // LONG RANGE - dash in with kick
      else{
        act='kick'; // kicks have more range
      }

      p2.state=act;p2.af=0;
      p2.cd={punch:7,kick:10,special:14}[act]||7;
      if(act==='special')p2.energy=0;
      snd(act);doAttack(p2,p1,act,gs);

      // START COMBO STRING (real fighters chain attacks)
      if(act!=='special'){
        if(ai.mode==='aggressive'&&Math.random()<0.50){
          ai.comboChain=2+Math.floor(Math.random()*2); // 2-3 follow-ups
        } else if(Math.random()<0.30){
          ai.comboChain=1+Math.floor(Math.random()*2); // 1-2 follow-ups
        }
      }

      // After attack burst, take a small breather (human-like rhythm)
      if(Math.random()<0.20){ai.breathe=8+Math.floor(Math.random()*12);}

      // Randomly switch circle direction after attacking
      if(Math.random()<0.3)ai.circleDir*=-1;
    }
  }
}
// FINISH HIM trigger
function triggerFinishHim(gs){
  gs.finishHim=true;gs.finishTimer=300;gs.xray=null;
  snd('finishhim');
  announce('Finish Him!',0);
}

// ── X-RAY MOVE CINEMATIC ──
function triggerXRay(gs){
  gs.xray={timer:0,done:false};
  gs.finishHim=false;
  // Bone crack sound via Web Audio
  try{
    var ac=AC();if(ac){
      // Deep thud
      var o=ac.createOscillator(),g=ac.createGain();
      o.type='sawtooth';o.frequency.setValueAtTime(80,ac.currentTime);o.frequency.exponentialRampToValueAtTime(20,ac.currentTime+0.4);
      g.gain.setValueAtTime(1.5,ac.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ac.currentTime+0.5);
      o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+0.5);
      // Crack
      var n=ac.createBufferSource(),nb=ac.createBuffer(1,Math.floor(ac.sampleRate*0.15),ac.sampleRate),ng=ac.createGain();
      var nd=nb.getChannelData(0);for(var ni=0;ni<nd.length;ni++)nd[ni]=(Math.random()*2-1)*Math.pow(1-ni/nd.length,0.5);
      n.buffer=nb;ng.gain.setValueAtTime(2.0,ac.currentTime+0.1);ng.gain.exponentialRampToValueAtTime(0.001,ac.currentTime+0.3);
      n.connect(ng);ng.connect(ac.destination);n.start(ac.currentTime+0.08);
    }
  }catch(e){}
  // Trigger KO after cinematic
  setTimeout(function(){
    if(!G.stopped&&gs){
      gs.xray=null;
      gs.p2.hp=0;
      announce(gs.p1.ch.name+' wins!',100);
      endRound(gs);
    }
  }, 2200);
}

// End round - MK style
function endRound(gs){
  stopBGMusic();gs.phase='roundOver';gs.shake=14;snd('ko');
  var rw=gs.p1.hp>gs.p2.hp?'P1':gs.p2.hp>gs.p1.hp?'P2':'DRAW';
  if(rw==='P1')gs.p1r++;else if(rw==='P2')gs.p2r++;
  var winner=rw==='P1'?gs.p1:gs.p2;
  var loser=rw==='P1'?gs.p2:gs.p1;
  var flawless=winner.dmgTaken===0;

  // ── KO ANIMATION: loser falls, winner victory pose ──
  if(rw!=='DRAW'){
    loser.state='fallen';   // loser collapses to ground
    winner.state='victory'; // winner faces forward, raises fist
    // Winner always faces the loser (front-facing toward center)
    winner.dir = winner.x < loser.x ? 1 : -1;
  }

  if(flawless){
    gs.roundOverText='FLAWLESS VICTORY';
    gs.roundOverColor='#f59e0b';
    announce('Flawless Victory',400);
  } else if(rw==='DRAW'){
    gs.roundOverText='DRAW';
    gs.roundOverColor='#94a3b8';
    announce('Draw',400);
  } else {
    gs.roundOverText=loser.ch.name+' DEFEATED!';
    gs.roundOverColor=winner.ch.color;
    announce(winner.ch.name+' wins. '+loser.ch.name+' defeated!',500);
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
      gs.p1.cd=gs.p2.cd=0;gs.timer=300;gs.lastSec=Date.now();gs.round++;
      COMBO.count=0;COMBO.timer=0;COMBO.lastHitter=null;
      gs.finishHim=false;
      gs.phase='roundAnnounce';gs.roundAnnTimer=40;
      var rw2=ROUND_WORDS[gs.round]||String(gs.round);
      announce('Round '+rw2,200);
      startBGMusic();
    }
  },2400);
}

// =========================================================
// MAIN FIGHT LOOP
// =========================================================
function fightLoop(now){
  if(G.stopped)return;
  G.raf=requestAnimationFrame(fightLoop);
  var gs=G.gs;if(!gs)return;
  gs.frame++;
  var cv=$('game-canvas');
  var W=cv.clientWidth||gs.W||800; var H=cv.clientHeight||gs.H||600;
  if(Math.abs(cv.width-W)>4||Math.abs(cv.height-H)>4){
    cv.width=W;cv.height=H;
    gs.W=W;gs.H=H;gs.SC=H/300;var _FM={bg_fire:0.78,bg_ice:0.80,bg_jungle:0.80,bg_cyber:0.78,bg_storm:0.82,bg_boss:0.76,bg_ocean:0.84,bg_crystal:0.84,bg_ghost:0.82,bg_forest:0.82,bg_speed:0.80,bg_void:0.76,bg_forge:0.80};gs.FLOOR=H*(_FM[gs.bgFloorKey]||0.78);
    gs.p1.x=W*0.28;gs.p2.x=W*0.72;
    gs.p1.y=gs.FLOOR;gs.p2.y=gs.FLOOR;
  }
  W=gs.W;H=gs.H;
  var ctx=cv.getContext('2d');
    var p1=gs.p1,p2=gs.p2;
  p1.H=p2.H=Math.round(gs.SC*110);

  // -- ROUND ANNOUNCE (MK style: "ROUND ONE") --
  if(gs.phase==='roundAnnounce'){
    gs.roundAnnTimer--;
    if(gs.roundAnnTimer<=0){gs.phase='countdown';gs.cd=3;gs.cdTick=22;}
  }

  // -- COUNTDOWN --
  if(gs.phase==='countdown'){
    gs.cdTick--;
    if(gs.cdTick<=0){snd('cd');gs.cd--;gs.cdTick=22;if(gs.cd<=0){gs.phase='fight';snd('fight');announce('Fight!',0);}}
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
  if(gs.shake>0){var sx=Math.sin(gs.frame*2.3)*gs.shake*0.5,sy=Math.cos(gs.frame*1.7)*gs.shake*0.3;ctx.translate(sx,sy);}
  drawBG(ctx,W,H,G.stage,gs.frame);

  // Hit flash
  if(COMBO.flash>0){ctx.fillStyle='rgba(255,255,255,'+(COMBO.flash*0.04)+')';ctx.fillRect(0,0,W,H);}

  drawParts(ctx,gs.parts);
  drawFighter(ctx,p1,gs.frame);
  drawFighter(ctx,p2,gs.frame);


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

  // ── X-RAY CINEMATIC OVERLAY ──
  // -- X-RAY CINEMATIC OVERLAY --
  if(gs.xray && !gs.xray.done){
    gs.xray.timer++;
    var xt=gs.xray.timer;
    var p1=gs.p1,p2=gs.p2;
    var eH=p2.H;

    // Phase 1 (0-25): darken
    if(xt<=45){
      var dAlpha=Math.min(0.88, xt/20*0.88);
      ctx.fillStyle='rgba(0,0,10,'+dAlpha+')';
      ctx.fillRect(0,0,W,H);
    }

    // Phase 2 (25-70): skeleton
    if(xt>20 && xt<=70){
      ctx.fillStyle='rgba(0,0,10,0.88)';ctx.fillRect(0,0,W,H);

      // Blue scanlines (every 6px, cheap)
      ctx.fillStyle='rgba(30,120,255,0.04)';
      for(var xl=0;xl<H;xl+=8){ctx.fillRect(0,xl,W,2);}

      // Skeleton on enemy
      ctx.save();
      ctx.translate(p2.x, p2.y);
      ctx.strokeStyle='rgba(160,210,255,0.9)';
      ctx.lineWidth=2;

      // Head
      ctx.beginPath();ctx.arc(0,-eH*0.9,eH*0.12,0,Math.PI*2);ctx.stroke();
      // Spine
      ctx.beginPath();ctx.moveTo(0,-eH*0.78);ctx.lineTo(0,-eH*0.42);ctx.stroke();
      // 3 ribs each side (simple lines, no bezier)
      for(var ri=0;ri<3;ri++){
        var ry=-eH*(0.72-ri*0.09);
        ctx.beginPath();ctx.moveTo(0,ry);ctx.lineTo(eH*0.2,ry+eH*0.06);ctx.stroke();
        ctx.beginPath();ctx.moveTo(0,ry);ctx.lineTo(-eH*0.2,ry+eH*0.06);ctx.stroke();
      }
      // Pelvis (simple ellipse)
      ctx.beginPath();ctx.ellipse(0,-eH*0.42,eH*0.13,eH*0.06,0,0,Math.PI*2);ctx.stroke();
      // Legs
      ctx.beginPath();ctx.moveTo(-eH*0.07,-eH*0.35);ctx.lineTo(-eH*0.09,0);ctx.stroke();
      ctx.beginPath();ctx.moveTo(eH*0.07,-eH*0.35);ctx.lineTo(eH*0.09,0);ctx.stroke();
      // Arms
      ctx.beginPath();ctx.moveTo(-eH*0.04,-eH*0.72);ctx.lineTo(-eH*0.2,-eH*0.44);ctx.stroke();
      ctx.beginPath();ctx.moveTo(eH*0.04,-eH*0.72);ctx.lineTo(eH*0.2,-eH*0.44);ctx.stroke();

      // Crack lines -- deterministic (no Math.random)
      if(xt>35){
        var cAlpha=Math.min(1,(xt-35)/20);
        ctx.strokeStyle='rgba(255,70,70,'+cAlpha+')';ctx.lineWidth=2;
        var cAngles=[0,0.785,1.57,2.355,3.14,3.925,4.71,5.495];
        for(var ci=0;ci<8;ci++){
          var cLen=eH*(0.08+ci*0.012);
          ctx.beginPath();
          ctx.moveTo(0,-eH*0.62);
          ctx.lineTo(Math.cos(cAngles[ci])*cLen,-eH*0.62+Math.sin(cAngles[ci])*cLen);
          ctx.stroke();
        }
        // Impact glow (simple filled circle, no gradient)
        ctx.fillStyle='rgba(255,160,160,'+cAlpha*0.4+')';
        ctx.beginPath();ctx.arc(0,-eH*0.62,eH*0.18,0,Math.PI*2);ctx.fill();
      }
      ctx.restore();

      // Attacker glow (simple circle, no gradient)
      ctx.strokeStyle=p1.ch.color;ctx.lineWidth=4;ctx.globalAlpha=0.4;
      ctx.beginPath();ctx.arc(p1.x,p1.y-p1.H*0.5,p1.H*0.5,0,Math.PI*2);ctx.stroke();
      ctx.globalAlpha=1;

      // X-RAY text
      ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.font='bold '+Math.round(H*0.09)+'px Rajdhani,Impact,sans-serif';
      ctx.fillStyle='#93c5fd';
      ctx.fillText('X-RAY',W/2,H*0.12);
    }

    // Phase 3 (70-90): white flash -> KO
    if(xt>70 && xt<=90){
      ctx.fillStyle='rgba(255,255,255,'+((xt-70)/20)+')';
      ctx.fillRect(0,0,W,H);
    }
  }
  // DEFEATED / Round Over overlay
  if(gs.phase==='roundOver'||gs.phase==='matchOver'){
    ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,0,W,H);
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.shadowColor='#ef4444';ctx.shadowBlur=50;ctx.fillStyle='#ef4444';
    ctx.font='bold '+Math.round(H*0.2)+'px Rajdhani,Impact,sans-serif';
    ctx.fillText('DEFEATED!',W/2,H*0.38);
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
  // Export navigation function globally for HTML onclick fallback
  // Simple navigation - direct goto select
  window._playNow = function(){
    if(window._navBusy)return;
    window._navBusy=true;
    cancelAnimationFrame(window._splashRaf);
    snd('start');
    bgmPlay('select');
    G.screen='select';
    showScreen('select');
    initSelect();
    setTimeout(function(){window._navBusy=false;},1000);
  };
  var cv=$('splash-canvas');
  cv.width=cv.offsetWidth;cv.height=cv.offsetHeight;
  var ctx=cv.getContext('2d');var t=0;
  window._splashRaf=0;
  function frame(){
    window._splashRaf=requestAnimationFrame(frame);t++;
    var W=cv.offsetWidth,H=cv.offsetHeight;
    if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H;}
    // Transparent canvas — BG slideshow shows through
    ctx.clearRect(0,0,W,H);
    // Floating golden particles
    for(var i=0;i<40;i++){var sx=((i*W/40+t*0.3*(i%2?1:-1))%W+W)%W,sy=H*0.08+Math.sin(t*0.015+i*0.9)*H*0.42;var al=Math.max(0,0.08+0.28*Math.sin(t*0.06+i));ctx.fillStyle='rgba(245,158,11,'+al+')';ctx.beginPath();ctx.arc(sx,sy,Math.max(0,0.8+Math.sin(t*0.07+i)*1.2),0,Math.PI*2);ctx.fill();}
  }
  frame();
  // Reset play button in case user came back from a fight
  var _btn=$('play-btn');
  _btn.textContent='⚔️ PLAY NOW';
  _btn.disabled=false;
  _btn.style.opacity='1';
  var _oldPb=$('sprite-pb-wrap');
  if(_oldPb)_oldPb.parentNode.removeChild(_oldPb);
  var _pbBtn=$('play-btn');
  _pbBtn.onclick=function(e){
    e&&e.preventDefault&&e.preventDefault();
    window._playNow&&window._playNow();
  };
  _pbBtn.ontouchend=function(e){
    e.preventDefault();
    window._playNow&&window._playNow();
  };
}

// CHARACTER SELECT
// ── PREMIUM LOADING SCREEN ──────────────────────────────────
// No complex loading screen - direct navigation

function initSelect(){
  if(window._selAnimInt){clearInterval(window._selAnimInt);window._selAnimInt=null;}
  $('sel-stage-info').textContent='STAGE '+G.stage+' OF 15';
  var grid=$('char-grid');
  grid.innerHTML='';
  // Build 3-col grid
  PLAYABLE.forEach(function(c,i){
    var d=document.createElement('div');
    d.className='char-card';
    d.style.setProperty('--cc',c.color);
    d.style.setProperty('--cb',c.color+'22');
    var cv=document.createElement('canvas');
    cv.className='cem-canvas';
    drawCharPreview(cv,c,140,undefined,'idle');
    d.appendChild(cv);
    var nm=document.createElement('div');nm.className='cnm';nm.textContent=c.name.split(' ')[0];
    d.appendChild(nm);
    d.setAttribute('data-idx',i);
    d.addEventListener('pointerdown',function(){
      G.selIdx=i;snd('select');
      updatePreview('new');updateGrid();
    });
    grid.appendChild(d);
  });
  updateGrid();updatePreview('none');
  // Scroll right panel to bottom (bottom-to-top scroll start)
  setTimeout(function(){
    var rp=$('sel-right-panel');
    if(rp)rp.scrollTop=rp.scrollHeight;
  },80);
  // Refresh portraits once sprites load
  var _rc=0,_ri=setInterval(function(){
    _rc++;
    document.querySelectorAll('.cem-canvas').forEach(function(cv,i){
      if(i<PLAYABLE.length)drawCharPreview(cv,PLAYABLE[i],140,undefined,'idle');
    });
    if(_rc>=8)clearInterval(_ri);
  },130);
  $('select-btn').onclick=function(){
    G.player=PLAYABLE[G.selIdx];snd('start');
    if(window._selAnimInt){clearInterval(window._selAnimInt);window._selAnimInt=null;}
    bgmStop();G.screen='vs';showScreen('vs');initVS();
  };
}
function updateGrid(){
  document.querySelectorAll('.char-card').forEach(function(c,i){c.classList.toggle('sel',i===G.selIdx);});
  var cc=$('sel-char-count');if(cc)cc.textContent=(G.selIdx+1)+'/'+PLAYABLE.length;
}
function updatePreview(dir){
  var c=PLAYABLE[G.selIdx];
  // Arena background
  var _bgKeys=['bg_cyber','bg_ocean','bg_jungle','bg_ice','bg_dark_storm','bg_crystal','bg_fire','bg_ghost','bg_forest','bg_speed','bg_forge','bg_storm','bg_void','bg_dark_forest','bg_boss'];
  var _bgImg=BG_IMAGES[_bgKeys[G.selIdx%_bgKeys.length]];
  var _seEl=$('select');
  function _ab(){if(_seEl&&_bgImg&&_bgImg.src)_seEl.style.backgroundImage="url('"+_bgImg.src+"')";}
  if(_bgImg&&_bgImg.complete&&_bgImg.naturalWidth>0){_ab();}else if(_bgImg){_bgImg.onload=_ab;}
  // CSS colors
  if(_seEl){_seEl.style.setProperty('--sel-cc',c.color);}
  // ── 360° ROTATABLE HERO PREVIEW ──
  if(window._selAnimInt){cancelAnimationFrame(window._selAnimInt);window._selAnimInt=null;}
  var _pcv=$('prev-char-canvas');
  if(_pcv){
    var _sz=Math.round(Math.min(window.innerWidth*0.30,150));
    var _w=_sz,_h=Math.round(_sz*1.5);
    _pcv.width=_w;_pcv.height=_h;
    _pcv.style.opacity='1';_pcv.style.transform='none';
    _pcv.style.touchAction='none'; // enable pointer events
    var _ac=c,_fr=0;
    // Rotation state + Fight Showcase
    if(!window._rot)window._rot={angle:0,dir:1,dragging:false,startX:0,autoRot:true,showPose:'idle',showTimer:0,showSeq:['idle','idle','idle','punch','kick','idle'],showIdx:0,spinActive:0,vel:0,showcaseActive:false,showcaseTimer:0};
    var R=window._rot; 
    R.angle=0; R.dir=1; R.autoRot=true; R.showPose='idle'; R.showTimer=0; R.showIdx=0; R.vel=0; R.showcaseActive=false; R.showcaseTimer=0;
    // Trigger 360 spin on selection
    if(dir==='new' || dir==='none') R.spinActive = 360;

    // Draw with rotation effect
    function _df(){
      if(!window._selAnimInt) return; // loop cancelled
      _fr+=1.5;
      var ctx=_pcv.getContext('2d');ctx.clearRect(0,0,_w,_h);
      
      // Kinetic Rotation Physics (Free Fire Style)
      if(R.spinActive > 0){
        var step = 6; 
        R.angle += step;
        R.spinActive -= step;
        R.showPose = 'idle'; R.showTimer = 0;
        R.vel = 0; // stop physics while auto-spinning
      } else if(R.dragging){
        // While dragging, angle is set by pointer; we store velocity for later
        R.showPose = 'idle';
        R.showcaseActive = false; // Reset showcase while interacting
      } else {
        // Apply Inertia Performance
        if(Math.abs(R.vel) > 0.05){
          R.angle += R.vel;
          R.vel *= 0.94; // Friction / Damping
        }
        
        // v15.1: FIGHT SHOWCASE MODE (After interaction stops)
        if(R.showcaseActive){
          R.showcaseTimer++;
          if(R.showcaseTimer < 20)      { R.showPose = 'idle'; }
          else if(R.showcaseTimer < 50) { if(R.showcaseTimer===21)snd('punch'); R.showPose = 'punch'; }
          else if(R.showcaseTimer < 65) { R.showPose = 'idle'; }
          else if(R.showcaseTimer < 100){ if(R.showcaseTimer===66)snd('kick'); R.showPose = 'kick'; }
          else { R.showPose = 'idle'; R.showcaseActive = false; }
        } else {
          R.showPose = 'idle';
          if(R.autoRot){
            if(Math.abs(R.vel) < 1.0) R.angle += 0.25; // Gentle auto-turn when slow
          }
        }
      }

      var normA=((R.angle%360)+360)%360;
      
      // HYBRID ROTATION: 8-Side Sprites (for the 4 who have them) or 3D Sim (for others)
      var hasRotS=ROT_CHARS.indexOf(_ac.id)!==-1;
      
      R.dir = 1; 
      var depthScale = 1;
      var skewX = 0;
      var bobY = 0;

      if(!hasRotS){
        // Premium 3D Simulation Fallback
        var radA=normA*Math.PI/180;
        depthScale=Math.abs(Math.cos(radA));
        R.dir=(Math.cos(radA)>=0)?1:-1;
        skewX=Math.sin(radA)*0.15;
        bobY=Math.abs(Math.sin(radA))*4;
        // prevent zero width
        if(depthScale < 0.1) depthScale = 0.1;
      }

      ctx.save();
      var ringY=_h-6,ringW=_w*0.35,ringH=8;
      var grd=ctx.createRadialGradient(_w/2,ringY,2,_w/2,ringY,ringW);
      grd.addColorStop(0,_ac.color+'66');grd.addColorStop(0.6,_ac.color+'22');grd.addColorStop(1,'transparent');
      ctx.fillStyle=grd;ctx.beginPath();ctx.ellipse(_w/2,ringY,ringW,ringH,0,0,Math.PI*2);ctx.fill();
      
      var dotAngle=normA*Math.PI/180;
      var dotX=_w/2+Math.cos(dotAngle)*ringW*0.8;
      var dotY=ringY+Math.sin(dotAngle)*ringH*0.5;
      ctx.fillStyle=_ac.color;ctx.beginPath();ctx.arc(dotX,dotY,2.5,0,Math.PI*2);ctx.fill();
      ctx.restore();

      // Draw fighter
      ctx.save();
      ctx.translate(_w/2, _h-4-bobY);
      if(!hasRotS) ctx.transform(depthScale, 0, skewX, 1, 0, 0);
      ctx.translate(-_w/2, -(_h-4));
      
      var fk={x:_w/2,y:_h-4,dir:R.dir,ch:_ac,H:_h*0.75,state:R.showPose||'idle',af:Math.floor(R.showTimer),vy:0,rotAngle:normA,animSpeed:(hasRotS?12:undefined)};
      drawFighter(ctx,fk,_fr);
      ctx.restore();

      // Preview action label
      if(R.showPose==='punch'||R.showPose==='kick'){
        var _lCol=R.showPose==='punch'?'#ef4444':'#f59e0b';
        var _lbl=R.showPose==='punch'?'PUNCH!':'KICK!';
        ctx.globalAlpha=0.92;ctx.font='bold '+Math.round(_w*0.15)+'px Impact,sans-serif';
        ctx.textAlign='center';ctx.textBaseline='top';
        ctx.strokeStyle='rgba(0,0,0,0.75)';ctx.lineWidth=3;
        ctx.strokeText(_lbl,_w/2,6);ctx.fillStyle=_lCol;ctx.fillText(_lbl,_w/2,6);
        ctx.globalAlpha=1;
      }
      
      if(window._selAnimInt) window._selAnimInt = requestAnimationFrame(_df);
    }
    window._selAnimInt = requestAnimationFrame(_df);

    // Touch/pointer drag to rotate
    _pcv.onpointerdown=function(e){R.dragging=true;R.startX=e.clientX;R.autoRot=false;R.vel=0;_pcv.setPointerCapture(e.pointerId);};
    _pcv.onpointermove=function(e){if(!R.dragging)return;var dx=e.clientX-R.startX;R.angle+=dx*1.8;R.vel=dx*1.5;R.startX=e.clientX;};
    _pcv.onpointerup=function(e){R.dragging=false;R.autoRot=true;R.showcaseActive=true;R.showcaseTimer=0;};
    _pcv.onpointercancel=function(e){R.dragging=false;R.autoRot=true;R.showcaseActive=true;R.showcaseTimer=0;};
  }
  // Name
  var ne=$('prev-name');
  if(ne){ne.textContent=c.name;ne.style.color=c.color;ne.style.textShadow='0 0 18px '+c.color;ne.style.animation='none';setTimeout(function(){ne.style.animation='';},10);}
  var te=$('prev-title');if(te)te.textContent=c.title||'';
  var re=$('prev-rarity');if(re){re.textContent=c.rarity;re.style.color=c.color;re.style.background=c.color+'22';re.style.borderColor=c.color+'55';}
  var spe=$('prev-spl');if(spe){spe.textContent=c.spl||'';spe.style.color=c.color;}
  // Animated stat bars
  var stats=[['&#x2694; POW',c.pow,'#ef4444'],['&#x26A1; SPD',c.spd,'#22c55e'],['&#x1F6E1; DEF',c.def,'#3b82f6'],['&#x2764; HP',Math.round(c.hp/10),'#f472b6']];
  var stEl=$('prev-stats');
  if(stEl){
    stEl.innerHTML=stats.map(function(s){return '<div class="stat-row"><div class="stat-lbl">'+s[0]+'<span class="stat-val" style="color:'+s[2]+'">'+s[1]+'/10</span></div><div class="stat-bg"><div class="stat-fill" style="width:0%;background:'+s[2]+';color:'+s[2]+'"></div></div></div>';}).join('');
    setTimeout(function(){stEl.querySelectorAll('.stat-fill').forEach(function(f,i){f.style.width=stats[i][1]*10+'%';});},60);
  }
  // FIGHT button
  var btn=$('select-btn');
  if(btn){btn.textContent='FIGHT!';btn.style.background='linear-gradient(135deg,'+c.color+','+c.color+'99)';btn.style.boxShadow='0 0 24px '+c.color+'55,0 4px 14px rgba(0,0,0,.7)';}
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
  $('vs-p2-role').textContent=opp.boss?'⚠️ FINAL BOSS':'STAGE '+G.stage+' · CPU';
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
      html+='<span class="tower-em">'+t.name.charAt(0)+'</span>';
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
  var em=$('res-emoji');
  em.textContent=champion?'👑':win?'🏆':'💀';
  em.style.display='block';
  var title=champion?'CHAMPION!':win?'YOU WIN!':'YOU LOSE!';
  var col=champion?'#f59e0b':win?'#22c55e':'#ef4444';
  $('res-title').textContent=title;$('res-title').style.color=col;
  $('res-title').style.textShadow='0 0 40px '+col+',0 0 80px '+col;
  $('res-sub').textContent=win?'STAGE '+G.stage+(champion?' • ALL 15 COMPLETE':' COMPLETE'):'STAGE '+G.stage+' FAILED';
  var sp=document.getElementById('res-stage-progress');
  if(sp){var dh='';for(var d=0;d<15;d++){var dc=d<G.stage-1?'done':d===G.stage-1?'current':'';dh+='<div class="res-stage-dot '+dc+'"></div>';}sp.innerHTML=dh;}
  var rs=document.getElementById('result-screen');
  var rc=champion?'rgba(245,158,11,':win?'rgba(34,197,94,':'rgba(239,68,68,';
  rs.style.background=champion?'radial-gradient(ellipse at 30% 20%,#1a0e00,#000)':win?'radial-gradient(ellipse at 30% 20%,#001a08,#000)':'radial-gradient(ellipse at 30% 20%,#1a0000,#000)';
  var rings=rs.querySelectorAll('.res-ring');
  if(rings[0])rings[0].style.borderColor=rc+'.25)';
  if(rings[1])rings[1].style.borderColor=rc+'.12)';
  if(rings[2])rings[2].style.borderColor=rc+'.06)';
  if(champion)announce('You Win!',200);
  else if(win)announce('You Win!',200);
  else announce('You lose',200);
  var nb=$('res-next'),rb=$('res-retry');
  if(win&&!champion){nb.style.display='block';nb.textContent='⚔ NEXT STAGE ('+(G.stage+1)+'/15)';}
  else if(champion){nb.style.display='block';nb.textContent='👑 PLAY AGAIN';}
  else{nb.style.display='none';}
  rb.style.display=win?'none':'block';rb.textContent='↺ RETRY';
  G.screen='result';showScreen('result');
  $('res-next').onclick=function(){
    if(win&&!champion){
      G.stage=Math.min(15,G.stage+1);save();
      G.screen='vs';showScreen('vs');initVS();
    } else if(champion){
      G.stage=1;save();
      bgmPlay('select');G.screen='select';showScreen('select');initSelect();
    }
  };
  $('res-retry').onclick=function(){G.stage=1;save();bgmPlay('select');G.screen='select';showScreen('select');initSelect();};
  $('res-menu').onclick=function(){G.stage=1;save();bgmPlay('menu');G.screen='splash';showScreen('splash');initSplash();};

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
  document.addEventListener('touchmove',function(e){
    // Allow scroll inside character select grid
    var el=e.target;
    while(el){if(el.id==='sel-grid-panel'||el.id==='sel-right-panel')return;el=el.parentElement;}
    e.preventDefault();
  },{passive:false});
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

// =========================================================
// VOICE PICKER SYSTEM
// =========================================================
var _selectedVoiceIdx=-1;

function _buildVoicePicker(){
  var list=document.getElementById('voice-list');
  if(!list)return;
  list.innerHTML='';
  var all=window.speechSynthesis?speechSynthesis.getVoices():[];
  var eng=all.filter(function(v){return v.lang.indexOf('en')===0;});
  if(eng.length===0){list.innerHTML='<div style="color:#64748b;font-size:11px;padding:8px;">No voices found. Try Chrome or Edge.</div>';return;}

  // AUTO option
  var autoBtn=document.createElement('button');
  autoBtn.className='voice-opt'+(_selectedVoiceIdx===-1?' active':'');
  autoBtn.textContent='\u26a1 AUTO DEEP';
  autoBtn.onclick=function(){
    _selectedVoiceIdx=-1;
    document.querySelectorAll('.voice-opt').forEach(function(b){b.classList.remove('active');});
    autoBtn.classList.add('active');
    _previewVoice(null);
  };
  list.appendChild(autoBtn);

  eng.forEach(function(v,i){
    var btn=document.createElement('button');
    btn.className='voice-opt'+(_selectedVoiceIdx===i?' active':'');
    btn.textContent=v.name.replace('Microsoft ','').replace(' - English','').replace(' Online (Natural)','').replace(' Desktop','');
    btn.onclick=function(){
      _selectedVoiceIdx=i;
      document.querySelectorAll('.voice-opt').forEach(function(b){b.classList.remove('active');});
      btn.classList.add('active');
      _previewVoice(v);
    };
    list.appendChild(btn);
  });
}

function _previewVoice(v){
  try{
    if(!window.speechSynthesis)return;
    speechSynthesis.cancel();
    _mkVoiceEffect(1800);
    setTimeout(function(){
      var u=new SpeechSynthesisUtterance('Round One. Fight!');
      u.rate=0.48; u.pitch=0; u.volume=1;
      if(v)u.voice=v;else{var auto=_getVoice();if(auto)u.voice=auto;}
      _lastUtterance=u;speechSynthesis.speak(u);
    },80);
  }catch(e){}
}

// ── MK-STYLE VOICE EFFECT: Deep rumble + stadium reverb during speech ──
function _mkVoiceEffect(durationMs){
  try{
    var ac=AC();if(!ac)return;
    var dur=(durationMs||1500)/1000;

    // Stadium reverb impulse
    var revLen=ac.sampleRate*2.5;
    var revBuf=ac.createBuffer(2,revLen,ac.sampleRate);
    for(var ch=0;ch<2;ch++){
      var rd=revBuf.getChannelData(ch);
      for(var ri=0;ri<revLen;ri++)rd[ri]=(Math.random()*2-1)*Math.pow(1-ri/revLen,1.5);
    }
    var rev=ac.createConvolver();rev.buffer=revBuf;
    var revG=ac.createGain();revG.gain.value=0.35;

    // Master output
    var master=ac.createGain();
    master.gain.setValueAtTime(0,ac.currentTime);
    master.gain.linearRampToValueAtTime(1,ac.currentTime+0.05);
    master.gain.setValueAtTime(1,ac.currentTime+dur-0.1);
    master.gain.linearRampToValueAtTime(0,ac.currentTime+dur+0.3);
    master.connect(ac.destination);
    master.connect(revG);revG.connect(rev);rev.connect(ac.destination);

    // Sub bass rumble (MK signature deep boom)
    var sub=ac.createOscillator();sub.type='sine';sub.frequency.value=52;
    var subG=ac.createGain();
    subG.gain.setValueAtTime(0,ac.currentTime);
    subG.gain.linearRampToValueAtTime(0.55,ac.currentTime+0.08);
    subG.gain.setValueAtTime(0.4,ac.currentTime+dur-0.15);
    subG.gain.linearRampToValueAtTime(0,ac.currentTime+dur+0.2);
    sub.connect(subG);subG.connect(master);sub.start(ac.currentTime);sub.stop(ac.currentTime+dur+0.4);

    // Mid rumble layer
    var mid=ac.createOscillator();mid.type='sawtooth';mid.frequency.value=98;
    var midG=ac.createGain();
    midG.gain.setValueAtTime(0,ac.currentTime);
    midG.gain.linearRampToValueAtTime(0.12,ac.currentTime+0.06);
    midG.gain.setValueAtTime(0.08,ac.currentTime+dur-0.1);
    midG.gain.linearRampToValueAtTime(0,ac.currentTime+dur+0.2);
    mid.connect(midG);midG.connect(master);mid.start(ac.currentTime);mid.stop(ac.currentTime+dur+0.3);

    // Initial BOOM hit (MK intro punch)
    var boom=ac.createOscillator();boom.type='sine';
    boom.frequency.setValueAtTime(180,ac.currentTime);
    boom.frequency.exponentialRampToValueAtTime(40,ac.currentTime+0.25);
    var boomG=ac.createGain();
    boomG.gain.setValueAtTime(1.2,ac.currentTime);
    boomG.gain.exponentialRampToValueAtTime(0.001,ac.currentTime+0.35);
    boom.connect(boomG);boomG.connect(master);boom.start(ac.currentTime);boom.stop(ac.currentTime+0.4);

  }catch(e){}
}

// MK ANNOUNCER — exact Mortal Kombat style
var _VM={'round one':'v_round1.mp3','round two':'v_round2.mp3','round three':'v_round3.mp3','flawless':'v_flawless.mp3','finish him':'v_finishhim.mp3','finish her':'v_finishher.mp3','you win':'v_youwin.mp3'};
var _VA={};
function _playVoice(text,delayMs){
  var key=text.toLowerCase(),file=null;
  for(var k in _VM){if(key.indexOf(k)>=0){file=_VM[k];break;}}
  if(!file)return false;
  setTimeout(function(){try{var a=_VA[file];if(!a){a=new Audio('voice/'+file);_VA[file]=a;}a.currentTime=0;a.volume=1;var p=a.play();if(p&&p.catch)p.catch(function(){});}catch(e){}},delayMs||0);
  return true;
}

var _VM={'round one':'v_round1.mp3','round two':'v_round2.mp3','round three':'v_round3.mp3','flawless':'v_flawless.mp3','finish him':'v_finishhim.mp3','finish her':'v_finishher.mp3','you win':'v_youwin.mp3'};
var _VA={};
function _playVoice(text,delayMs){
  var key=text.toLowerCase(),file=null;
  for(var k in _VM){if(key.indexOf(k)>=0){file=_VM[k];break;}}
  if(!file)return false;
  setTimeout(function(){
    try{
      if(_VA[file]&&!_VA[file].paused){_VA[file].pause();_VA[file].currentTime=0;}
      var a=_VA[file]||(new Audio('voice/'+file));
      _VA[file]=a;a.currentTime=0;a.volume=1;
      var p=a.play();if(p&&p.catch)p.catch(function(){});
    }catch(e){}
  },delayMs||0);
  return true;
}

function announce(text,delayMs){
  // -- UI Overlay --
  var el=$('announce');
  if(!el){el=document.createElement('div');el.id='announce';el.className='announce-overlay';document.body.appendChild(el);}
  el.textContent=text;el.classList.add('active');
  setTimeout(function(){el.classList.remove('active');},delayMs?Math.max(delayMs, 1000):2500);

  // -- MK AUDIO --
  // Only pre-recorded MP3 on Android. AndroidTTS removed (caused double voice)  
  if(window.AndroidTTS){
    if(_playVoice(text,delayMs))return; // MP3 matched
    return; // no match, skip TTS to avoid robot voice
  }
  // Browser fallback (web version)
  if(_playVoice(text,delayMs))return;
  setTimeout(function(){
    try{
      if(!window.speechSynthesis)return;
      if(!_voicesLoaded)_loadVoices();
      speechSynthesis.cancel();

      // Estimate speech duration (rough: 1 char = 60ms at rate 0.48)
      var estDur=Math.max(800, toSpeech(text).length*65);
      _mkVoiceEffect(estDur);

      setTimeout(function(){
        try{
          var u=new SpeechSynthesisUtterance(toSpeech(text));
          // MK exact settings — pitch=0 = lowest possible = DEEPEST
          u.rate=0.48; u.pitch=0; u.volume=1;
          var v=null;
          if(_selectedVoiceIdx>=0){
            var all3=speechSynthesis.getVoices();
            var eng3=all3.filter(function(x){return x.lang.indexOf('en')===0;});
            v=eng3[_selectedVoiceIdx]||null;
          }
          if(!v)v=_getVoice();
          if(v)u.voice=v;
          _lastUtterance=u;speechSynthesis.speak(u);
        }catch(e){}
      },80);
    }catch(e){}
  },delayMs||0);
}

(function initVoicePickerUI(){
  function setup(){
    var settBtn=document.getElementById('voice-settings-btn');
    var wrap=document.getElementById('voice-picker-wrap');
    var closeBtn=document.getElementById('voice-close-btn');
    if(!settBtn||!wrap||!closeBtn)return;
    settBtn.onclick=function(){
      _loadVoices();_buildVoicePicker();wrap.classList.add('open');
    };
    closeBtn.onclick=function(){wrap.classList.remove('open');};
    if(window.speechSynthesis){
      speechSynthesis.onvoiceschanged=function(){
        _loadVoices();
        if(wrap.classList.contains('open'))_buildVoicePicker();
      };
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);
  else setup();
})();

// =========================================================
// BGM — FINAL CLEAN CONTROLLER
// Uses window.MK_AUDIO so ALL functions can access it
// =========================================================
window.MK_AUDIO = null;
window.MK_CAN_PLAY = false;

function MK_STOP(){
  // window.MK_CAN_PLAY = false; // Removed: This was blocking combat sounds
  if(window.MK_AUDIO){
    try{
      window.MK_AUDIO.volume = 0;
      window.MK_AUDIO.pause();
      window.MK_AUDIO.currentTime = 0;
    }catch(e){}
  }
}

function MK_PLAY(){
  if(!window.MK_CAN_PLAY) return;
  // If already playing at volume, just ensure volume is right
  if(window.MK_AUDIO && !window.MK_AUDIO.paused && window.MK_AUDIO.volume > 0.5){
    return;
  }
  // Create audio element once
  if(!window.MK_AUDIO){
    window.MK_AUDIO = new Audio('music/fight.mp3');
    window.MK_AUDIO.loop = true;
  }
  var a = window.MK_AUDIO;
  a.volume = 0;
  a.play().then(function(){
    if(!window.MK_CAN_PLAY){ a.pause(); return; }
    var fi = setInterval(function(){
      if(!window.MK_CAN_PLAY){ clearInterval(fi); a.volume=0; return; }
      if(a.volume < 0.82) a.volume = Math.min(0.82, a.volume + 0.05);
      else clearInterval(fi);
    }, 60);
  }).catch(function(){
    // Autoplay blocked — retry on next user click
    document.addEventListener('click', function r(){
      if(window.MK_CAN_PLAY) a.play().then(function(){
        var fi2=setInterval(function(){
          if(!window.MK_CAN_PLAY){clearInterval(fi2);return;}
          if(a.volume<0.82)a.volume=Math.min(0.82,a.volume+0.05);
          else clearInterval(fi2);
        },60);
      }).catch(function(){});
      document.removeEventListener('click',r);
    });
  });
}

// Override ALL music functions
window.bgmPlay = function(key){
  if(key === 'menu' || key === 'select'){
    window.MK_CAN_PLAY = true;
    MK_PLAY();
  }
  // fight keys: do nothing — no music in fight
};

window.bgmStop = function(){ MK_STOP(); };

// Called when fight STARTS — STOP music
window.startBGMusic = function(){ MK_STOP(); };
startBGMusic = window.startBGMusic; // also override the local declaration

// Called on KO / fight end — STOP music
window.stopBGMusic = function(){
  if(window.G && G.bgInt){ clearInterval(G.bgInt); G.bgInt = null; }
  MK_STOP();
};
stopBGMusic = window.stopBGMusic;

// First click on page → start music
document.addEventListener('click', function onFirst(){
  window.MK_CAN_PLAY = true;
  MK_PLAY();
  document.removeEventListener('click', onFirst);
}, {once: true});
