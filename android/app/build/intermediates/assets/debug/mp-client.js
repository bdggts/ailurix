// ═══════════════════════════════════════════════════════════
// AILURIX ARENA — MULTIPLAYER CLIENT (Socket.io)
// ═══════════════════════════════════════════════════════════

(function(){
'use strict';

// ── CONFIG ──────────────────────────────────────────────────
var SERVER_URL = 'https://ailurix-arena-server.onrender.com';

// ── STATE ───────────────────────────────────────────────────
var MP = {
  socket: null,
  connected: false,
  roomCode: null,
  playerNum: 0,       // 1 = host, 2 = guest
  opponentName: null,
  myChar: null,
  opponentChar: null,
  active: false
};
window.MP = MP;

// ── UI HELPERS ───────────────────────────────────────────────
// Show status for HOST (inside room display wrap)
function showHostStatus(msg, color) {
  var el = document.getElementById('mp-status');
  if (el) { el.textContent = msg; el.style.color = color || '#22c55e'; }
}
// Show status for GUEST (always visible below join button)
function showGuestStatus(msg, color) {
  var el = document.getElementById('mp-join-status');
  if (el) { el.textContent = msg; el.style.color = color || '#22c55e'; }
}
// Show in connect-status (visible to both, above room wrap)
function showConnectStatus(msg, color) {
  var el = document.getElementById('mp-connect-status');
  if (el) { el.textContent = msg; el.style.color = color || '#fff'; }
}
// Show error (reset buttons)
function showMPError(msg) {
  showGuestStatus('\u26a0\ufe0f ' + msg, '#f55');
  showHostStatus('\u26a0\ufe0f ' + msg, '#f55');
  showConnectStatus('\u26a0\ufe0f ' + msg, '#f55');
  var btn = document.getElementById('mp-create-btn');
  if (btn) { btn.disabled = false; btn.textContent = 'CREATE ROOM'; }
  var jBtn = document.getElementById('mp-join-btn');
  if (jBtn) { jBtn.disabled = false; jBtn.textContent = 'JOIN ROOM'; }
  console.warn('[MP] Error:', msg);
}

// ── CONNECT TO SERVER ────────────────────────────────────────
function connect(cb) {
  if (MP.connected && MP.socket) { cb && cb(); return; }
  showConnectStatus('Connecting...', '#f59e0b');
  if (typeof io === 'function') {
    _initSocket(cb);
  } else {
    var s = document.createElement('script');
    s.src = 'https://cdn.socket.io/4.7.5/socket.io.min.js';
    s.onload = function() { _initSocket(cb); };
    s.onerror = function() { showMPError('Cannot load socket library'); };
    document.head.appendChild(s);
  }
}

function _initSocket(cb) {
  try {
    if (MP.socket) { MP.socket.disconnect(); }
    MP.socket = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
      timeout: 10000
    });
    MP.socket.on('connect', function() {
      MP.connected = true;
      showConnectStatus('Connected!', '#22c55e');
      console.log('[MP] Socket connected:', MP.socket.id);
      cb && cb();
    });
    MP.socket.on('connect_error', function(err) {
      showMPError('Connection failed: ' + (err.message || 'check network'));
    });
    MP.socket.on('disconnect', function() {
      MP.connected = false;
      MP.active = false;
      if (MP.roomCode) showMPError('Disconnected from server');
    });
    setupListeners();
  } catch(e) {
    showMPError('Error: ' + e.message);
  }
}

// ── SERVER EVENT LISTENERS ───────────────────────────────────
function setupListeners() {
  var s = MP.socket;

  // Room created (host)
  s.on('room:created', function(d) {
    MP.roomCode = d.code;
    MP.playerNum = 1;
    _showRoomCreated(d.code);
  });

  // Room joined successfully (guest)
  s.on('room:joined', function(d) {
    MP.roomCode = d.code;
    MP.playerNum = 2;
    MP.opponentName = d.opponentName;
    showGuestStatus('\u2705 Joined! Waiting for host...', '#22c55e');
    var jBtn = document.getElementById('mp-join-btn');
    if (jBtn) { jBtn.textContent = 'JOINED \u2705'; jBtn.style.background = '#22c55e33'; }
  });

  // Opponent joined the room (host gets this)
  s.on('room:opponent_joined', function(d) {
    MP.opponentName = d.opponentName;
    showHostStatus('\u2705 ' + d.opponentName + ' joined!', '#22c55e');
  });

  // Both players go to character select
  s.on('room:select_chars', function() {
    showMPCharSelect();
  });

  // Opponent selected a character
  s.on('room:opponent_char', function(d) {
    MP.opponentChar = d.charId;
    var waitMsg = document.getElementById('mp-char-wait-msg');
    if (waitMsg) waitMsg.textContent = '\u23f3 Opponent ready! Now choose yours...';
    console.log('[MP] Opponent chose:', d.charId);
  });

  // Fight starts!
  s.on('room:fight_start', function(d) {
    MP.myChar      = MP.playerNum === 1 ? d.p1Char : d.p2Char;
    MP.opponentChar= MP.playerNum === 1 ? d.p2Char : d.p1Char;
    MP.active      = true;
    // game.js has window.startMPFightGame built in
    if (typeof window.startMPFightGame === 'function') {
      window.startMPFightGame(d);
    }
  });

  // Opponent fight input (relay)
  s.on('fight:input', function(d) {
    if (!MP.active) return;
    if (typeof window.applyOpponentInput === 'function') window.applyOpponentInput(d);
  });

  // HP sync from server
  s.on('fight:hp_update', function(d) {
    if (!MP.active) return;
    if (typeof window.applyMPHP === 'function') window.applyMPHP(d);
  });

  // Fight result
  s.on('fight:result', function(d) {
    MP.active = false;
    if (typeof window.showMPResultScreen === 'function') {
      window.showMPResultScreen(d.winner === MP.playerNum);
    }
  });

  // Opponent disconnected mid-fight
  s.on('room:opponent_left', function(d) {
    MP.active = false;
    showMPError(d.msg || 'Opponent disconnected!');
    setTimeout(function() {
      if (typeof showScreen === 'function') showScreen('splash');
    }, 2000);
  });

  // Server error
  s.on('room:error', function(d) {
    showMPError(d.msg || 'Unknown error');
  });
}

// ── ROOM CREATED — show code to host ─────────────────────────
function _showRoomCreated(code) {
  // Show the room display wrap
  var wrap = document.getElementById('mp-room-display-wrap');
  if (wrap) wrap.style.display = 'block';
  // Set code
  var codeEl = document.getElementById('mp-room-display');
  if (codeEl) codeEl.textContent = code;
  // Status
  showHostStatus('\u23f3 Waiting for opponent...', '#22c55e');
  showConnectStatus('\ud83c\udfd7 Room ready! Share code: ' + code, '#22c55e');
  // Update button
  var btn = document.getElementById('mp-create-btn');
  if (btn) { btn.textContent = 'ROOM CREATED \u2705'; btn.style.background = '#22c55e33'; }
}

// ── CHARACTER SELECT (MP MODE) ────────────────────────────────
function showMPCharSelect() {
  console.log('[MP] Opening character select, player', MP.playerNum);

  // Switch to select screen (same as single player)
  if (typeof showScreen === 'function') {
    showScreen('select');
  } else {
    document.querySelectorAll('.screen').forEach(function(sc){sc.classList.remove('active');});
    var sel = document.getElementById('select');
    if (sel) sel.classList.add('active');
  }

  // Wait for screen transition then init (same as single player _playNow)
  setTimeout(function() {
    if (typeof G !== 'undefined') { G.screen = 'select'; G.stage = 1; }
    // Start select BGM (same as single player)
    if (typeof bgmPlay === 'function') bgmPlay('select');
    // Init character select grid (EXACT same function as single player)
    if (typeof initSelect === 'function') initSelect();
    // Override select button for MP mode
    _overrideMPSelectBtn();
  }, 300);
}

function _overrideMPSelectBtn() {
  var selectBtn = document.getElementById('select-btn');
  if (!selectBtn) return;

  // Remove old mp wait msg
  var old = document.getElementById('mp-char-wait-msg');
  if (old) old.parentNode.removeChild(old);

  // Insert waiting hint below button
  var waitDiv = document.createElement('div');
  waitDiv.id = 'mp-char-wait-msg';
  waitDiv.style.cssText = [
    'font-family:"Press Start 2P","Courier New",monospace',
    'font-size:8px',
    'color:#f59e0b',
    'text-align:center',
    'margin-top:10px',
    'letter-spacing:1px',
    'min-height:14px'
  ].join(';');
  waitDiv.textContent = '\u2b07 CHOOSE YOUR FIGHTER';
  selectBtn.parentNode.insertBefore(waitDiv, selectBtn.nextSibling);

  // Override the select button click — send char to server instead of going VS screen
  selectBtn.onclick    = null;
  selectBtn.ontouchend = null;

  function doMPSelect(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (typeof G === 'undefined' || typeof PLAYABLE === 'undefined') return;
    var ch     = PLAYABLE[G.selIdx != null ? G.selIdx : 0];
    G.player   = ch;
    var charId = ch.id;
    console.log('[MP] P' + MP.playerNum + ' selected:', charId);
    if (MP.socket) MP.socket.emit('room:char_select', { charId: charId });
    selectBtn.disabled    = true;
    selectBtn.textContent = 'WAITING...';
    if (waitDiv) waitDiv.textContent = '\u23f3 Waiting for opponent to choose...';
    selectBtn.onclick    = null;
    selectBtn.ontouchend = null;
  }

  selectBtn.onclick    = doMPSelect;
  selectBtn.ontouchend = doMPSelect;
}

// ── PUBLIC API ───────────────────────────────────────────────
window.MPClient = {
  createRoom: function(playerName) {
    connect(function() {
      MP.socket.emit('room:create', { name: playerName || 'Player 1' });
    });
  },
  joinRoom: function(code, playerName) {
    connect(function() {
      MP.socket.emit('room:join', { code: code, name: playerName || 'Player 2' });
    });
  },
  rematch: function() {
    if (MP.socket && MP.roomCode) {
      if (typeof G !== 'undefined') { G.mpMode = false; G.mpOpponent = null; }
      MP.active = false;
      MP.socket.emit('room:rematch');
    }
  },
  isActive:     function() { return MP.active; },
  getPlayerNum: function() { return MP.playerNum; },
  getState:     function() { return MP; }
};

// ── FIGHT INPUT SEND ─────────────────────────────────────────
// Called from game.js: if(G.mpMode && window.MPSendInput) window.MPSendInput(type)
window.MPSendInput = function(action, extra) {
  if (!MP.socket || !MP.active) return;
  MP.socket.emit('fight:input', Object.assign({ action: action, ts: Date.now() }, extra || {}));
};

// Called from game.js to sync HP
window.MPSendHP = function(target, hp) {
  if (!MP.socket || !MP.active) return;
  MP.socket.emit('fight:hp', { target: target, hp: hp });
};

})();
