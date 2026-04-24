// ═══════════════════════════════════════════════════════════
// AILURIX ARENA — MULTIPLAYER CLIENT (Socket.io)
// ═══════════════════════════════════════════════════════════

(function(){
'use strict';

var SERVER_URL = 'https://ailurix-arena-server.onrender.com';

var MP = {
  socket: null,
  connected: false,
  roomCode: null,
  playerNum: 0,
  opponentName: null,
  myChar: null,
  opponentChar: null,
  active: false
};
window.MP = MP;

// ── UI ──────────────────────────────────────────────────────
function showHostStatus(msg, color) {
  var el = document.getElementById('mp-status');
  if (el) { el.textContent = msg; el.style.color = color || '#22c55e'; }
}
function showGuestStatus(msg, color) {
  var el = document.getElementById('mp-join-status');
  if (el) { el.textContent = msg; el.style.color = color || '#22c55e'; }
}
function showConnectStatus(msg, color) {
  var el = document.getElementById('mp-connect-status');
  if (el) { el.textContent = msg; el.style.color = color || '#fff'; }
}
function showMPError(msg) {
  showGuestStatus('\u26a0 ' + msg, '#f55');
  showHostStatus('\u26a0 ' + msg, '#f55');
  showConnectStatus('\u26a0 ' + msg, '#f55');
  var b1 = document.getElementById('mp-create-btn');
  if (b1) { b1.disabled = false; b1.textContent = 'CREATE ROOM'; }
  var b2 = document.getElementById('mp-join-btn');
  if (b2) { b2.disabled = false; b2.textContent = 'JOIN ROOM'; }
  console.warn('[MP]', msg);
}

// ── CONNECT ──────────────────────────────────────────────────
function connect(cb) {
  if (MP.connected && MP.socket) { cb && cb(); return; }
  showConnectStatus('Connecting...', '#f59e0b');
  if (typeof io === 'function') { _initSocket(cb); return; }
  var s = document.createElement('script');
  s.src = 'https://cdn.socket.io/4.7.5/socket.io.min.js';
  s.onload = function() { _initSocket(cb); };
  s.onerror = function() { showMPError('Cannot load socket lib'); };
  document.head.appendChild(s);
}

function _initSocket(cb) {
  try {
    if (MP.socket) MP.socket.disconnect();
    MP.socket = io(SERVER_URL, { transports: ['websocket','polling'], timeout: 10000 });
    MP.socket.on('connect', function() {
      MP.connected = true;
      showConnectStatus('Connected!', '#22c55e');
      cb && cb();
    });
    MP.socket.on('connect_error', function(e) { showMPError('Failed: ' + (e.message||'check network')); });
    MP.socket.on('disconnect', function() {
      MP.connected = false; MP.active = false;
      if (MP.roomCode) showMPError('Disconnected');
    });
    setupListeners();
  } catch(e) { showMPError('Error: ' + e.message); }
}

// ── SERVER EVENTS ────────────────────────────────────────────
function setupListeners() {
  var s = MP.socket;

  s.on('room:created', function(d) {
    MP.roomCode = d.code; MP.playerNum = 1;
    _showRoomCreated(d.code);
  });

  s.on('room:joined', function(d) {
    MP.roomCode = d.code; MP.playerNum = 2; MP.opponentName = d.opponentName;
    showGuestStatus('\u2705 Joined! Waiting...', '#22c55e');
    var jb = document.getElementById('mp-join-btn');
    if (jb) { jb.textContent = 'JOINED \u2705'; jb.style.background = '#22c55e33'; }
  });

  s.on('room:opponent_joined', function(d) {
    MP.opponentName = d.opponentName;
    showHostStatus('\u2705 ' + d.opponentName + ' joined!', '#22c55e');
  });

  s.on('room:select_chars', function() { showMPCharSelect(); });

  s.on('room:opponent_char', function(d) {
    MP.opponentChar = d.charId;
    var w = document.getElementById('mp-char-wait-msg');
    if (w) w.textContent = '\u23f3 Opponent ready! Choose yours...';
  });

  s.on('room:fight_start', function(d) {
    MP.myChar       = MP.playerNum === 1 ? d.p1Char : d.p2Char;
    MP.opponentChar = MP.playerNum === 1 ? d.p2Char : d.p1Char;
    MP.active = true;
    if (typeof window.startMPFightGame === 'function') window.startMPFightGame(d);
  });

  s.on('fight:input', function(d) {
    if (!MP.active) return;
    if (typeof window.applyOpponentInput === 'function') window.applyOpponentInput(d);
  });

  s.on('fight:hp_update', function(d) {
    if (!MP.active) return;
    if (typeof window.applyMPHP === 'function') window.applyMPHP(d);
  });

  s.on('fight:result', function(d) {
    MP.active = false;
    if (typeof window.showMPResultScreen === 'function') window.showMPResultScreen(d.winner === MP.playerNum);
  });

  s.on('room:opponent_left', function(d) {
    MP.active = false;
    showMPError(d.msg || 'Opponent left!');
    setTimeout(function() {
      if (window.showScreen) window.showScreen('splash');
    }, 2000);
  });

  s.on('room:error', function(d) { showMPError(d.msg || 'Error'); });
}

function _showRoomCreated(code) {
  var wrap = document.getElementById('mp-room-display-wrap');
  if (wrap) wrap.style.display = 'block';
  var codeEl = document.getElementById('mp-room-display');
  if (codeEl) codeEl.textContent = code;
  showHostStatus('\u23f3 Waiting for opponent...', '#22c55e');
  showConnectStatus('\ud83c\udfd7 Room: ' + code, '#22c55e');
  var btn = document.getElementById('mp-create-btn');
  if (btn) { btn.textContent = 'ROOM CREATED \u2705'; btn.style.background = '#22c55e33'; }
}

// ── CHARACTER SELECT (MP) ────────────────────────────────────
function showMPCharSelect() {
  console.log('[MP] Opening char select, player', MP.playerNum);

  // Navigate to char select screen
  window._navBusy = false;
  if (window._playNow) {
    window._playNow();
  } else {
    // Fallback: directly open select screen
    if (window.showScreen) window.showScreen('select');
    if (window.initSelect) window.initSelect();
  }

  // CRITICAL: wait for initSelect() to finish cloning the button
  // then set MP mode on the NEW button
  setTimeout(function() {
    _setupMPButton();
  }, 600);
}

function _setupMPButton() {
  var btn = document.getElementById('select-btn');
  if (!btn) { console.warn('[MP] select-btn not found, retrying...'); setTimeout(_setupMPButton, 300); return; }

  // Set the callback via game.js export
  if (window.setMPSelectMode) {
    window.setMPSelectMode(function(charId) {
      console.log('[MP] Player', MP.playerNum, 'selected:', charId);
      if (MP.socket) MP.socket.emit('room:char_select', { charId: charId });
    });
  }

  // ALSO directly attach handler as backup (in case cloneNode removed it)
  btn.removeEventListener('pointerup', btn._mpHandler);
  btn._mpHandler = function(e) {
    e.preventDefault(); e.stopPropagation();
    if (!window._mpSelectCallback) return;
    var G = window.G, PLAYABLE = window.PLAYABLE;
    if (!G || !PLAYABLE) return;
    var ch = PLAYABLE[G.selIdx != null ? G.selIdx : 0];
    G.player = ch;
    btn.disabled = true; btn.textContent = 'WAITING...';
    var cb = window._mpSelectCallback;
    window._mpSelectCallback = null;
    if (window._mpBtnInterval) { clearInterval(window._mpBtnInterval); window._mpBtnInterval = null; }
    console.log('[MP] char selected:', ch.id);
    if (typeof cb === 'function') cb(ch.id);
  };
  btn.addEventListener('pointerup', btn._mpHandler);

  // Force button appearance
  btn.disabled = false;
  btn.textContent = 'SELECT FIGHTER \u2694\ufe0f';
  btn.style.background = 'linear-gradient(135deg,#f59e0b,#f97316)';
  btn.style.boxShadow = '0 0 24px #f59e0b55,0 4px 14px rgba(0,0,0,.7)';

  // Add MP hint
  var old = document.getElementById('mp-char-wait-msg');
  if (old) old.parentNode.removeChild(old);
  var waitDiv = document.createElement('div');
  waitDiv.id = 'mp-char-wait-msg';
  waitDiv.style.cssText = 'font-size:8px;color:#f59e0b;text-align:center;margin-top:8px;letter-spacing:1px;font-family:inherit;';
  waitDiv.textContent = '\u2b07 CHOOSE YOUR FIGHTER';
  btn.parentNode.insertBefore(waitDiv, btn.nextSibling);
  console.log('[MP] Button ready for P' + MP.playerNum);
}

function _overrideMPSelectBtn() {
  var selectBtn = document.getElementById('select-btn');
  if (!selectBtn) { console.warn('[MP] select-btn not found'); return; }

  // Remove old MP hint
  var old = document.getElementById('mp-char-wait-msg');
  if (old) old.parentNode.removeChild(old);

  // Add MP hint below button
  var waitDiv = document.createElement('div');
  waitDiv.id = 'mp-char-wait-msg';
  waitDiv.style.cssText = 'font-size:8px;color:#f59e0b;text-align:center;margin-top:10px;letter-spacing:1px;font-family:inherit;';
  waitDiv.textContent = '\u2b07 CHOOSE YOUR FIGHTER';
  selectBtn.parentNode.insertBefore(waitDiv, selectBtn.nextSibling);

  // Override onclick + ontouchend for MP mode
  selectBtn.onclick = null; selectBtn.ontouchend = null;

  function doMPSelect(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    // Use window.G and window.PLAYABLE (exported from game.js IIFE)
    var G = window.G;
    var PLAYABLE = window.PLAYABLE;
    if (!G || !PLAYABLE) { console.error('[MP] G/PLAYABLE not exported!'); return; }
    var ch = PLAYABLE[G.selIdx != null ? G.selIdx : 0];
    G.player = ch;
    console.log('[MP] P' + MP.playerNum + ' chose:', ch.id);
    if (MP.socket) MP.socket.emit('room:char_select', { charId: ch.id });
    selectBtn.disabled = true;
    selectBtn.textContent = 'WAITING...';
    waitDiv.textContent = '\u23f3 Waiting for opponent...';
    selectBtn.onclick = null; selectBtn.ontouchend = null;
  }

  selectBtn.onclick    = doMPSelect;
  selectBtn.ontouchend = doMPSelect;
}

// ── PUBLIC API ───────────────────────────────────────────────
window.MPClient = {
  createRoom: function(name) {
    connect(function() { MP.socket.emit('room:create', { name: name || 'Player 1' }); });
  },
  joinRoom: function(code, name) {
    connect(function() { MP.socket.emit('room:join', { code: code, name: name || 'Player 2' }); });
  },
  rematch: function() {
    if (!MP.socket || !MP.roomCode) return;
    var G = window.G;
    if (G) { G.mpMode = false; G.mpOpponent = null; }
    MP.active = false;
    MP.socket.emit('room:rematch');
  },
  isActive:     function() { return MP.active; },
  getPlayerNum: function() { return MP.playerNum; },
  getState:     function() { return MP; }
};

// ── INPUT SYNC ───────────────────────────────────────────────
window.MPSendInput = function(action, extra) {
  if (!MP.socket || !MP.active) return;
  MP.socket.emit('fight:input', Object.assign({ action: action, ts: Date.now() }, extra || {}));
};
window.MPSendHP = function(target, hp) {
  if (!MP.socket || !MP.active) return;
  MP.socket.emit('fight:hp', { target: target, hp: hp });
};

})();
