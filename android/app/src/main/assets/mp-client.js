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

// ── NUCLEAR SCREEN HELPER ─────────────────────────────────
function _nuclearShow(id) {
  var all = document.querySelectorAll('.screen');
  for (var i = 0; i < all.length; i++) {
    all[i].classList.remove('active');
    all[i].style.display = 'none';
    all[i].style.opacity = '0';
    all[i].style.pointerEvents = 'none';
  }
  var el = document.getElementById(id);
  if (el) {
    el.style.display = 'flex';
    el.classList.add('active');
    el.style.opacity = '1';
    el.style.pointerEvents = 'all';
    el.style.zIndex = '9999';
  }
  // Also show/hide fight-ui
  var fui = document.getElementById('fight-ui');
  if (fui) fui.style.display = (id === 'fight-ui') ? 'flex' : 'none';
}
window._nuclearShow = _nuclearShow;

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
    var st = document.getElementById('mp-vs-status');
    if (st) st.textContent = '✅ Opponent picked: ' + d.charId;
    var oppSlot = MP.playerNum === 1 ? 'p2' : 'p1';
    _showOpponentInLobby(oppSlot);
  });

  s.on('room:fight_start', function(d) {
    MP.myChar       = MP.playerNum === 1 ? d.p1Char : d.p2Char;
    MP.opponentChar = MP.playerNum === 1 ? d.p2Char : d.p1Char;
    var st = document.getElementById('mp-vs-status');
    if (st) st.textContent = '🔥 FIGHT START! ' + d.p1Char + ' vs ' + d.p2Char;

    var oppSlot = MP.playerNum === 1 ? 'p2' : 'p1';
    _showOpponentInLobby(oppSlot);

    // Make sure VS lobby is visible (nuclear)
    _nuclearShow('mp-vs-lobby');

    // 3-2-1 COUNTDOWN then fight
    var cdEl     = document.getElementById('mp-vs-countdown');
    var statusEl = document.getElementById('mp-vs-status');
    if (statusEl) statusEl.textContent = 'GET READY!';
    var count = 3;
    if (cdEl) cdEl.textContent = count;
    var cdInterval = setInterval(function() {
      count--;
      if (count > 0) {
        if (cdEl) cdEl.textContent = count;
      } else if (count === 0) {
        if (cdEl) { cdEl.textContent = 'FIGHT!'; cdEl.style.color = '#ef4444'; }
        if (statusEl) statusEl.textContent = '';
      } else {
        clearInterval(cdInterval);
        if (cdEl) cdEl.textContent = '';
        MP.active = true;
        if (typeof window.startMPFightGame === 'function') window.startMPFightGame(d);
      }
    }, 1000);
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
  // Just open the normal char select screen — button onclick handles MP
  window._navBusy = false;
  if (window._playNow) {
    window._playNow();
  } else {
    if (window.showScreen) window.showScreen('select');
    if (window.initSelect) window.initSelect();
  }
}

// Called by game.js select button when MP.roomCode is set
window._mpGoLobby = function(myChar) {
  console.log('[MP] Going to VS lobby with char:', myChar.id);
  MP.myChar = myChar.id;

  // Emit char selection to server
  var _sent = false;
  if (MP.socket && MP.socket.connected) {
    MP.socket.emit('room:char_select', { charId: myChar.id });
    _sent = true;
  }
  // Debug: show on status what we sent
  setTimeout(function(){
    var st = document.getElementById('mp-vs-status');
    if (st) st.textContent = 'SENT char_select: ' + myChar.id + ' | socket=' + (MP.socket?'Y':'N') + ' conn=' + (MP.socket&&MP.socket.connected?'Y':'N') + ' sent=' + _sent + ' room=' + MP.roomCode + ' P' + MP.playerNum;
  }, 500);

  // NUCLEAR: force hide ALL screens with display:none, then show mp-vs-lobby
  var allScreens = document.querySelectorAll('.screen');
  for (var i = 0; i < allScreens.length; i++) {
    allScreens[i].classList.remove('active');
    allScreens[i].style.display = 'none';
  }
  var vsLobby = document.getElementById('mp-vs-lobby');
  if (vsLobby) {
    vsLobby.style.display = 'flex';
    vsLobby.classList.add('active');
    vsLobby.style.opacity = '1';
    vsLobby.style.pointerEvents = 'all';
    vsLobby.style.zIndex = '9999';
  }

  // Stop select animation loop
  if (window._selAnimInt) { cancelAnimationFrame(window._selAnimInt); window._selAnimInt = null; }

  // My slot
  var mySlot  = MP.playerNum === 1 ? 'p1' : 'p2';
  var oppSlot = MP.playerNum === 1 ? 'p2' : 'p1';

  var myCv    = document.getElementById('mp-vs-' + mySlot + '-cv');
  var myName  = document.getElementById('mp-vs-' + mySlot + '-name');
  var mySlotEl= document.getElementById('mp-vs-' + mySlot + '-slot');

  if (myCv && window.drawCharPreview) {
    myCv.width = 80; myCv.height = 100;
    window.drawCharPreview(myCv, myChar, 80, undefined, 'idle');
  }
  if (myName) { myName.textContent = myChar.name; myName.style.color = myChar.color || '#22c55e'; }
  if (mySlotEl) { mySlotEl.style.borderColor = 'rgba(34,197,94,0.6)'; mySlotEl.style.background = 'rgba(34,197,94,0.07)'; }

  // Opponent slot
  if (MP.opponentChar) {
    _showOpponentInLobby(oppSlot);
  } else {
    var oppName = document.getElementById('mp-vs-' + oppSlot + '-name');
    if (oppName) { oppName.textContent = '???'; oppName.style.color = '#f59e0b'; }
  }

  var status = document.getElementById('mp-vs-status');
  if (status) status.textContent = MP.opponentChar ? '✅ Both ready!' : '⏳ Waiting for opponent...';
};

function _showOpponentInLobby(oppSlot) {
  var ALLCHARS = window.CHARS || window.PLAYABLE || [];
  var oppChar = null;
  for (var i = 0; i < ALLCHARS.length; i++) {
    if (ALLCHARS[i].id === MP.opponentChar) { oppChar = ALLCHARS[i]; break; }
  }
  if (!oppChar && window.PLAYABLE) oppChar = window.PLAYABLE[0];
  if (!oppChar) return;

  var oppCv    = document.getElementById('mp-vs-' + oppSlot + '-cv');
  var oppName  = document.getElementById('mp-vs-' + oppSlot + '-name');
  var oppSlotEl= document.getElementById('mp-vs-' + oppSlot + '-slot');

  if (oppCv && window.drawCharPreview) {
    oppCv.width = 80; oppCv.height = 100;
    window.drawCharPreview(oppCv, oppChar, 80, undefined, 'idle');
  }
  if (oppName) { oppName.textContent = oppChar.name; oppName.style.color = oppChar.color || '#f59e0b'; }
  if (oppSlotEl) { oppSlotEl.style.borderStyle = 'solid'; oppSlotEl.style.borderColor = 'rgba(245,158,11,0.6)'; oppSlotEl.style.background = 'rgba(245,158,11,0.07)'; }

  var status = document.getElementById('mp-vs-status');
  if (status) status.textContent = '✅ Both fighters ready!';
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
