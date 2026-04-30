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
    all[i].style.setProperty('display', 'none', 'important');
    all[i].style.setProperty('opacity', '0', 'important');
    all[i].style.setProperty('pointer-events', 'none', 'important');
  }
  var el = document.getElementById(id);
  if (el) {
    el.style.setProperty('display', 'flex', 'important');
    el.classList.add('active');
    el.style.setProperty('opacity', '1', 'important');
    el.style.setProperty('pointer-events', 'all', 'important');
    el.style.setProperty('z-index', '9999', 'important');
  }
  // Also show/hide fight-ui
  var fui = document.getElementById('fight-ui');
  if (fui) fui.style.setProperty('display', (id === 'fight-ui') ? 'flex' : 'none', 'important');
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
    MP.socket = io(SERVER_URL, { transports: ['websocket','polling'], timeout: 30000, reconnection: true, reconnectionAttempts: 20, reconnectionDelay: 1000 });
    MP.socket.on('connect', function() {
      MP.connected = true;
      showConnectStatus('Connected!', '#22c55e');
      // Auto-rejoin room after reconnect
      if (MP.roomCode && MP.playerNum) {
        MP.socket.emit('room:rejoin', { code: MP.roomCode, playerNum: MP.playerNum });
        console.log('[MP] Auto-rejoined room ' + MP.roomCode);
      }
      cb && cb(); cb = null; // only call cb once
    });
    MP.socket.on('connect_error', function(e) { showMPError('Failed: ' + (e.message||'check network')); });
    MP.socket.on('disconnect', function(reason) {
      MP.connected = false;
      console.log('[MP] Disconnected:', reason);
    });
    setupListeners();
  } catch(e) { showMPError('Error: ' + e.message); }
}

// HTTP fallback: POST char selection via REST API
function _httpCharSelect(charId) {
  try {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', SERVER_URL + '/room/' + MP.roomCode + '/char', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
      console.log('[MP] HTTP char_select response:', xhr.responseText);
      var st = document.getElementById('mp-vs-status');
      if (st && xhr.status === 200) {
        var d = JSON.parse(xhr.responseText);
        st.textContent = 'HTTP OK! p1=' + (d.p1Char||'?') + ' p2=' + (d.p2Char||'?');
      }
    };
    xhr.onerror = function() { console.warn('[MP] HTTP char_select failed'); };
    xhr.send(JSON.stringify({ charId: charId, playerNum: MP.playerNum }));
  } catch(e) { console.warn('[MP] HTTP fallback error:', e); }
}

// Poll room status to detect when both have selected
function _startRoomPoll() {
  if (MP._pollTimer) clearInterval(MP._pollTimer);
  MP._pollTimer = setInterval(function() {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', SERVER_URL + '/room/' + MP.roomCode, true);
      xhr.onload = function() {
        if (xhr.status !== 200) return;
        var d = JSON.parse(xhr.responseText);
        var st = document.getElementById('mp-vs-status');
        if (!d.exists) { if (st) st.textContent = 'Room expired!'; clearInterval(MP._pollTimer); return; }
        if (st) st.textContent = 'Room: ' + d.state + ' | P1=' + (d.p1Char||'?') + ' P2=' + (d.p2Char||'?');
        // If both selected and we haven't started fight yet
        if (d.p1Char && d.p2Char && !MP.active) {
          _startFight({ p1Char: d.p1Char, p2Char: d.p2Char }, 'poll');
        }
      };
      xhr.send();
    } catch(e) {}
  }, 3000); // poll every 3 seconds
}

// ── SINGLE FIGHT START (prevents race condition) ────────────
function _startFight(d, source) {
  if (MP.active) return;
  MP.active = true;
  if (MP._pollTimer) { clearInterval(MP._pollTimer); MP._pollTimer = null; }
  MP.myChar       = MP.playerNum === 1 ? d.p1Char : d.p2Char;
  MP.opponentChar = MP.playerNum === 1 ? d.p2Char : d.p1Char;
  console.log('[MP] _startFight via ' + source);

  // FORCE HIDE ALL screens
  var all = document.querySelectorAll('.screen');
  for (var i = 0; i < all.length; i++) {
    all[i].style.setProperty('display', 'none', 'important');
    all[i].style.setProperty('opacity', '0', 'important');
    all[i].style.setProperty('pointer-events', 'none', 'important');
    all[i].classList.remove('active');
  }

  // FORCE SHOW fight-ui
  var fui = document.getElementById('fight-ui');
  if (fui) {
    fui.style.setProperty('display', 'flex', 'important');
    fui.style.setProperty('position', 'fixed', 'important');
    fui.style.setProperty('inset', '0', 'important');
    fui.style.setProperty('z-index', '99999', 'important');
  }

  if (typeof window.startMPFightGame === 'function') {
    window.startMPFightGame(d);
  }
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
    _startFight(d, 'socket');
  });

  s.on('fight:input', function(d) {
    if (!MP.active) return;
    if (typeof window.applyOpponentInput === 'function') window.applyOpponentInput(d);
  });

  // Position sync — receive opponent's position
  s.on('fight:position', function(d) {
    if (!MP.active) return;
    if (typeof window.applyOpponentPosition === 'function') window.applyOpponentPosition(d);
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

  // Send via BOTH socket AND HTTP (belt-and-suspenders)
  if (MP.socket && MP.socket.connected) {
    MP.socket.emit('room:rejoin', { code: MP.roomCode, playerNum: MP.playerNum });
    MP.socket.emit('room:char_select', { charId: myChar.id });
  }
  // HTTP fallback (always send, guaranteed to reach server)
  _httpCharSelect(myChar.id);
  // Start polling room status (catches missed socket events)
  _startRoomPoll();

  // NUCLEAR: force hide ALL screens (including mp-lobby which has !important CSS)
  var allScreens = document.querySelectorAll('.screen');
  for (var i = 0; i < allScreens.length; i++) {
    allScreens[i].classList.remove('active');
    allScreens[i].style.setProperty('display', 'none', 'important');
  }
  var vsLobby = document.getElementById('mp-vs-lobby');
  if (vsLobby) {
    vsLobby.style.setProperty('display', 'flex', 'important');
    vsLobby.classList.add('active');
    vsLobby.style.setProperty('opacity', '1', 'important');
    vsLobby.style.setProperty('pointer-events', 'all', 'important');
    vsLobby.style.setProperty('z-index', '9999', 'important');
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
// Position sync — send local player state to opponent
window.MPSendPosition = function(data) {
  if (!MP.socket || !MP.active) return;
  MP.socket.emit('fight:position', data);
};

// ══════════════════════════════════════════════════════════════
// VOICE CHAT (WebRTC peer-to-peer audio)
// ══════════════════════════════════════════════════════════════
var VC = {
  pc: null,        // RTCPeerConnection
  localStream: null,
  micOn: false,
  started: false
};

var ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' }
];

function _vcCleanup() {
  if (VC.localStream) {
    VC.localStream.getTracks().forEach(function(t) { t.stop(); });
    VC.localStream = null;
  }
  if (VC.pc) {
    VC.pc.close();
    VC.pc = null;
  }
  VC.micOn = false;
  VC.started = false;
  _updateMicBtn();
}

function _updateMicBtn() {
  var btn = document.getElementById('mic-toggle-btn');
  if (!btn) return;
  if (VC.micOn) {
    btn.textContent = '🎙️';
    btn.style.background = 'rgba(34,197,94,0.8)';
    btn.style.borderColor = '#22c55e';
  } else {
    btn.textContent = '🔇';
    btn.style.background = 'rgba(100,100,100,0.5)';
    btn.style.borderColor = '#666';
  }
}

function _createPeerConnection() {
  if (VC.pc) return;
  VC.pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

  VC.pc.onicecandidate = function(e) {
    if (e.candidate && MP.socket) {
      MP.socket.emit('voice:ice', { candidate: e.candidate });
    }
  };

  VC.pc.ontrack = function(e) {
    // Play remote audio
    var audio = document.getElementById('vc-remote-audio');
    if (!audio) {
      audio = document.createElement('audio');
      audio.id = 'vc-remote-audio';
      audio.autoplay = true;
      audio.playsInline = true;
      document.body.appendChild(audio);
    }
    audio.srcObject = e.streams[0];
    audio.play().catch(function(){});
    console.log('[VC] Remote audio connected');
  };

  // Add local tracks
  if (VC.localStream) {
    VC.localStream.getTracks().forEach(function(track) {
      VC.pc.addTrack(track, VC.localStream);
    });
  }
}

function startVoiceChat() {
  if (VC.started || !MP.socket || !MP.active) return;
  VC.started = true;

  navigator.mediaDevices.getUserMedia({ audio: true, video: false })
    .then(function(stream) {
      VC.localStream = stream;
      VC.micOn = true;
      _updateMicBtn();
      _createPeerConnection();

      // Player 1 creates offer
      if (MP.playerNum === 1) {
        VC.pc.createOffer().then(function(offer) {
          return VC.pc.setLocalDescription(offer);
        }).then(function() {
          MP.socket.emit('voice:offer', { sdp: VC.pc.localDescription });
          console.log('[VC] Offer sent');
        }).catch(function(e) { console.warn('[VC] Offer error:', e); });
      }
    })
    .catch(function(err) {
      console.warn('[VC] Mic access denied:', err);
      VC.started = false;
    });
}

// Setup voice signaling listeners
function setupVoiceListeners() {
  var s = MP.socket;
  if (!s) return;

  s.on('voice:offer', function(d) {
    if (!VC.started) {
      // Auto-start mic when receiving offer
      navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        .then(function(stream) {
          VC.localStream = stream;
          VC.micOn = true;
          VC.started = true;
          _updateMicBtn();
          _createPeerConnection();
          _handleOffer(d);
        }).catch(function(e) { console.warn('[VC] Mic denied on answer:', e); });
    } else {
      _handleOffer(d);
    }
  });

  s.on('voice:answer', function(d) {
    if (VC.pc && d.sdp) {
      VC.pc.setRemoteDescription(new RTCSessionDescription(d.sdp))
        .then(function() { console.log('[VC] Answer received'); })
        .catch(function(e) { console.warn('[VC] Answer error:', e); });
    }
  });

  s.on('voice:ice', function(d) {
    if (VC.pc && d.candidate) {
      VC.pc.addIceCandidate(new RTCIceCandidate(d.candidate))
        .catch(function(e) {});
    }
  });
}

function _handleOffer(d) {
  if (!VC.pc || !d.sdp) return;
  VC.pc.setRemoteDescription(new RTCSessionDescription(d.sdp))
    .then(function() { return VC.pc.createAnswer(); })
    .then(function(answer) { return VC.pc.setLocalDescription(answer); })
    .then(function() {
      MP.socket.emit('voice:answer', { sdp: VC.pc.localDescription });
      console.log('[VC] Answer sent');
    })
    .catch(function(e) { console.warn('[VC] Handle offer error:', e); });
}

// Toggle mic on/off
window.MPToggleMic = function() {
  if (!VC.started) {
    startVoiceChat();
    return;
  }
  if (VC.localStream) {
    VC.micOn = !VC.micOn;
    VC.localStream.getAudioTracks().forEach(function(t) {
      t.enabled = VC.micOn;
    });
    _updateMicBtn();
  }
};

// Hook into setupListeners to also setup voice
var _origSetup = setupListeners;
setupListeners = function() {
  _origSetup();
  setupVoiceListeners();
};

// Cleanup voice on fight end
var _origCleanup = window.MPClient ? window.MPClient.rematch : null;
if (window.MPClient) {
  var _origRematch = window.MPClient.rematch;
  window.MPClient.rematch = function() {
    _vcCleanup();
    if (_origRematch) _origRematch();
  };
}

})();
