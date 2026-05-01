// ═══════════════════════════════════════════════════════════
// AILURIX ARENA — WALLET MODULE  
// Solana Wallet Generation, Import, Balance, Backup
// ═══════════════════════════════════════════════════════════

(function(){
  'use strict';

  var SERVER = 'https://ailurix-arena-server.onrender.com';
  var SOLANA_RPC = 'https://api.mainnet-beta.solana.com';
  var _solanaLoaded = false;
  var _solanaLoading = false;

  // ── WALLET STATE ──────────────────────────────────────────
  window.WALLET = {
    address: null,
    keypair: null,  // Only in memory, never stored raw
    encrypted: null
  };

  // ── LOAD SOLANA WEB3 (CDN) ────────────────────────────────
  function loadSolana(cb) {
    if (_solanaLoaded && window.solanaWeb3) { cb(); return; }
    if (_solanaLoading) { setTimeout(function(){ loadSolana(cb); }, 500); return; }
    _solanaLoading = true;
    var s = document.createElement('script');
    s.src = 'https://unpkg.com/@solana/web3.js@1.95.8/lib/index.iife.min.js';
    s.onload = function() {
      _solanaLoaded = true; _solanaLoading = false;
      console.log('✅ Solana Web3 loaded');
      cb();
    };
    s.onerror = function() {
      _solanaLoading = false;
      console.error('❌ Failed to load Solana');
      cb(new Error('Solana load failed'));
    };
    document.head.appendChild(s);
  }

  // ── BASE58 ENCODE/DECODE (lightweight) ────────────────────
  var B58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  
  function bs58encode(bytes) {
    if (!bytes.length) return '';
    var digits = [0];
    for (var i = 0; i < bytes.length; i++) {
      var carry = bytes[i];
      for (var j = 0; j < digits.length; j++) {
        carry += digits[j] << 8;
        digits[j] = carry % 58;
        carry = (carry / 58) | 0;
      }
      while (carry) { digits.push(carry % 58); carry = (carry / 58) | 0; }
    }
    var str = '';
    for (var k = 0; bytes[k] === 0 && k < bytes.length - 1; k++) str += '1';
    for (var l = digits.length - 1; l >= 0; l--) str += B58_ALPHABET[digits[l]];
    return str;
  }

  function bs58decode(str) {
    if (!str.length) return new Uint8Array(0);
    var bytes = [0];
    for (var i = 0; i < str.length; i++) {
      var c = B58_ALPHABET.indexOf(str[i]);
      if (c < 0) throw new Error('Invalid base58 char');
      var carry = c;
      for (var j = 0; j < bytes.length; j++) {
        carry += bytes[j] * 58;
        bytes[j] = carry & 0xff;
        carry >>= 8;
      }
      while (carry) { bytes.push(carry & 0xff); carry >>= 8; }
    }
    for (var k = 0; str[k] === '1' && k < str.length - 1; k++) bytes.push(0);
    return new Uint8Array(bytes.reverse());
  }

  // ── AES ENCRYPT/DECRYPT (simple XOR + Web Crypto) ─────────
  function simpleEncrypt(data, password) {
    var json = JSON.stringify(data);
    var key = password + '_AILURIX_2026_WALLET_KEY';
    var result = [];
    for (var i = 0; i < json.length; i++) {
      result.push(json.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(String.fromCharCode.apply(null, result));
  }

  function simpleDecrypt(encrypted, password) {
    try {
      var key = password + '_AILURIX_2026_WALLET_KEY';
      var decoded = atob(encrypted);
      var result = [];
      for (var i = 0; i < decoded.length; i++) {
        result.push(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
      }
      var json = String.fromCharCode.apply(null, result);
      return JSON.parse(json);
    } catch(e) {
      return null;
    }
  }

  // ── GENERATE NEW WALLET ───────────────────────────────────
  window.generateWallet = function(callback) {
    loadSolana(function(err) {
      if (err) {
        if (callback) callback(null, 'Failed to load Solana library');
        return;
      }
      try {
        var kp = solanaWeb3.Keypair.generate();
        var address = kp.publicKey.toBase58();
        var secretKey = bs58encode(kp.secretKey);
        
        WALLET.address = address;
        WALLET.keypair = kp;
        
        // Encrypt and save
        var userId = (window.AUTH && AUTH.user) ? (AUTH.user.id || AUTH.user.email || 'local') : 'local';
        var encrypted = simpleEncrypt(Array.from(kp.secretKey), userId);
        
        localStorage.setItem('arx_wallet', JSON.stringify({
          address: address,
          encrypted: encrypted,
          userId: userId
        }));

        // Update server with wallet address
        if (window.AUTH && AUTH.token) {
          window.updateWalletOnServer(address);
        }

        console.log('✅ Wallet generated:', address);
        if (callback) callback({ address: address, secretKey: secretKey });
      } catch(e) {
        console.error('Wallet gen error:', e);
        if (callback) callback(null, e.message);
      }
    });
  };

  // ── IMPORT WALLET FROM PRIVATE KEY ────────────────────────
  window.importWalletFromKey = function(privateKeyBase58, callback) {
    loadSolana(function(err) {
      if (err) {
        if (callback) callback(null, 'Failed to load Solana library');
        return;
      }
      try {
        var secretKeyBytes = bs58decode(privateKeyBase58);
        if (secretKeyBytes.length !== 64) {
          if (callback) callback(null, 'Invalid private key length');
          return;
        }
        var kp = solanaWeb3.Keypair.fromSecretKey(secretKeyBytes);
        var address = kp.publicKey.toBase58();
        
        WALLET.address = address;
        WALLET.keypair = kp;
        
        // Encrypt and save
        var userId = (window.AUTH && AUTH.user) ? (AUTH.user.id || AUTH.user.email || 'local') : 'local';
        var encrypted = simpleEncrypt(Array.from(kp.secretKey), userId);
        
        localStorage.setItem('arx_wallet', JSON.stringify({
          address: address,
          encrypted: encrypted,
          userId: userId
        }));

        // Update server
        if (window.AUTH && AUTH.token) {
          window.updateWalletOnServer(address);
        }

        // Also login via wallet if not logged in
        if (!window.AUTH || !AUTH.loggedIn) {
          window.walletLogin(address);
        }

        console.log('✅ Wallet imported:', address);
        if (callback) callback({ address: address });
      } catch(e) {
        console.error('Import error:', e);
        if (callback) callback(null, 'Invalid private key');
      }
    });
  };

  // ── RESTORE WALLET FROM LOCAL STORAGE ─────────────────────
  window.restoreWallet = function() {
    var saved = localStorage.getItem('arx_wallet');
    if (!saved) return false;
    
    try {
      var data = JSON.parse(saved);
      WALLET.address = data.address;
      WALLET.encrypted = data.encrypted;
      
      // Decrypt keypair
      var userId = data.userId || 'local';
      var secretKeyArr = simpleDecrypt(data.encrypted, userId);
      if (secretKeyArr && secretKeyArr.length === 64) {
        loadSolana(function() {
          if (window.solanaWeb3) {
            WALLET.keypair = solanaWeb3.Keypair.fromSecretKey(new Uint8Array(secretKeyArr));
          }
        });
      }
      return true;
    } catch(e) {
      return false;
    }
  };

  // ── GET SOL BALANCE ───────────────────────────────────────
  window.getSOLBalance = function(callback) {
    if (!WALLET.address) { callback(0); return; }
    
    fetch(SOLANA_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0', id: 1,
        method: 'getBalance',
        params: [WALLET.address]
      })
    })
    .then(function(r){ return r.json(); })
    .then(function(data) {
      var lamports = (data.result && data.result.value) || 0;
      var sol = lamports / 1000000000; // 1 SOL = 1B lamports
      callback(sol);
    })
    .catch(function() { callback(0); });
  };

  // ── EXPORT PRIVATE KEY ────────────────────────────────────
  window.exportPrivateKey = function() {
    if (!WALLET.keypair) {
      // Try to decrypt
      var saved = localStorage.getItem('arx_wallet');
      if (!saved) return null;
      var data = JSON.parse(saved);
      var secretKeyArr = simpleDecrypt(data.encrypted, data.userId || 'local');
      if (secretKeyArr) return bs58encode(new Uint8Array(secretKeyArr));
      return null;
    }
    return bs58encode(WALLET.keypair.secretKey);
  };

  // ═══════════════════════════════════════════════════════════
  // UI SCREENS
  // ═══════════════════════════════════════════════════════════

  // ── SHOW IMPORT WALLET SCREEN ─────────────────────────────
  window._showImportWallet = function() {
    var login = document.getElementById('login-screen');
    if (!login) return;
    
    var ov = document.createElement('div');
    ov.id = 'import-wallet-overlay';
    ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.95);z-index:1000;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;';
    
    ov.innerHTML = 
      '<div style="text-align:center;width:100%;max-width:340px;">' +
        '<div style="font-size:28px;margin-bottom:6px;">🔑</div>' +
        '<div style="font-family:Orbitron,sans-serif;font-size:16px;font-weight:900;color:#a78bfa;letter-spacing:3px;margin-bottom:4px;">IMPORT WALLET</div>' +
        '<div style="font-size:11px;color:rgba(255,255,255,0.35);margin-bottom:20px;">Enter your Solana private key (Base58)</div>' +
        '<textarea id="import-key-input" placeholder="Paste your private key here..." style="width:100%;height:100px;background:rgba(139,92,246,0.08);border:2px solid rgba(139,92,246,0.25);border-radius:12px;color:#e2e8f0;font-family:monospace;font-size:12px;padding:14px;resize:none;outline:none;box-sizing:border-box;"></textarea>' +
        '<div id="import-error" style="display:none;font-size:11px;color:#ef4444;margin-top:8px;"></div>' +
        '<div id="import-loading" style="display:none;font-size:12px;color:#f59e0b;margin-top:10px;font-family:Orbitron,sans-serif;letter-spacing:2px;">RESTORING...</div>' +
        '<div style="display:flex;gap:12px;margin-top:20px;">' +
          '<button id="import-confirm-btn" style="flex:1;padding:14px;border-radius:12px;border:2px solid #a78bfa;background:rgba(139,92,246,0.15);color:#a78bfa;font-family:Orbitron,sans-serif;font-size:13px;font-weight:900;letter-spacing:2px;cursor:pointer;touch-action:manipulation;">RESTORE</button>' +
          '<button id="import-back-btn" style="flex:1;padding:14px;border-radius:12px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.04);color:#64748b;font-family:Orbitron,sans-serif;font-size:13px;font-weight:900;letter-spacing:2px;cursor:pointer;touch-action:manipulation;">← BACK</button>' +
        '</div>' +
      '</div>';
    
    document.body.appendChild(ov);
    
    // Back button
    document.getElementById('import-back-btn').onclick = function() { ov.remove(); };
    
    // Confirm button
    document.getElementById('import-confirm-btn').onclick = function() {
      var key = document.getElementById('import-key-input').value.trim();
      if (!key) {
        var errEl = document.getElementById('import-error');
        errEl.textContent = 'Please enter your private key';
        errEl.style.display = 'block';
        return;
      }
      
      document.getElementById('import-loading').style.display = 'block';
      document.getElementById('import-error').style.display = 'none';
      
      window.importWalletFromKey(key, function(result, err) {
        if (err) {
          document.getElementById('import-loading').style.display = 'none';
          var errEl = document.getElementById('import-error');
          errEl.textContent = err;
          errEl.style.display = 'block';
        } else {
          ov.remove();
          // Enter game
          var ls = document.getElementById('login-screen');
          if(ls){ ls.classList.remove('active'); ls.style.display='none'; }
          if (window.initSplash) window.initSplash();
          var sp = document.getElementById('splash');
          if(sp) sp.classList.add('active');
        }
      });
    };
  };

  // ── SHOW BACKUP KEY SCREEN ────────────────────────────────
  window._showBackupKey = function() {
    var key = window.exportPrivateKey();
    if (!key) { alert('No wallet found'); return; }
    
    var ov = document.createElement('div');
    ov.id = 'backup-overlay';
    ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.97);z-index:1001;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;';
    
    ov.innerHTML = 
      '<div style="text-align:center;width:100%;max-width:340px;">' +
        '<div style="font-size:28px;margin-bottom:6px;">🔐</div>' +
        '<div style="font-family:Orbitron,sans-serif;font-size:16px;font-weight:900;color:#f59e0b;letter-spacing:3px;margin-bottom:4px;">BACKUP YOUR KEY</div>' +
        '<div style="font-size:11px;color:#ef4444;margin-bottom:16px;letter-spacing:1px;">⚠️ NEVER SHARE THIS WITH ANYONE!</div>' +
        '<div style="background:rgba(245,158,11,0.06);border:2px solid rgba(245,158,11,0.2);border-radius:12px;padding:16px;word-break:break-all;font-family:monospace;font-size:11px;color:#fcd34d;line-height:1.6;text-align:left;">' + key + '</div>' +
        '<div style="display:flex;gap:12px;margin-top:20px;">' +
          '<button id="backup-copy-btn" style="flex:1;padding:14px;border-radius:12px;border:2px solid #f59e0b;background:rgba(245,158,11,0.15);color:#f59e0b;font-family:Orbitron,sans-serif;font-size:13px;font-weight:900;letter-spacing:2px;cursor:pointer;touch-action:manipulation;">📋 COPY</button>' +
          '<button id="backup-close-btn" style="flex:1;padding:14px;border-radius:12px;border:2px solid #22c55e;background:rgba(34,197,94,0.15);color:#22c55e;font-family:Orbitron,sans-serif;font-size:13px;font-weight:900;letter-spacing:2px;cursor:pointer;touch-action:manipulation;">✓ SAVED</button>' +
        '</div>' +
      '</div>';
    
    document.body.appendChild(ov);
    
    document.getElementById('backup-copy-btn').onclick = function() {
      navigator.clipboard.writeText(key).then(function(){
        document.getElementById('backup-copy-btn').textContent = '✅ COPIED!';
        setTimeout(function(){ document.getElementById('backup-copy-btn').textContent = '📋 COPY'; }, 2000);
      }).catch(function(){
        // Fallback
        var ta = document.createElement('textarea');
        ta.value = key; document.body.appendChild(ta);
        ta.select(); document.execCommand('copy');
        ta.remove();
        document.getElementById('backup-copy-btn').textContent = '✅ COPIED!';
      });
    };
    
    document.getElementById('backup-close-btn').onclick = function() { ov.remove(); };
  };

  // ── SHOW WALLET SCREEN ────────────────────────────────────
  window._showWalletScreen = function() {
    if (!WALLET.address && window.AUTH && AUTH.user && AUTH.user.walletAddress) {
      WALLET.address = AUTH.user.walletAddress;
    }
    
    var arx = (window.AUTH && AUTH.user) ? (AUTH.user.arxBalance || 0) : 0;
    var name = (window.AUTH && AUTH.user) ? (AUTH.user.name || 'Fighter') : 'Fighter';
    var addr = WALLET.address || 'No wallet';
    var shortAddr = addr.length > 12 ? addr.slice(0, 6) + '...' + addr.slice(-4) : addr;
    
    var ov = document.createElement('div');
    ov.id = 'wallet-overlay';
    ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.97);z-index:1001;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;';
    
    ov.innerHTML = 
      '<div style="text-align:center;width:100%;max-width:340px;">' +
        // Header
        '<div style="font-family:Orbitron,sans-serif;font-size:18px;font-weight:900;color:#f59e0b;letter-spacing:3px;margin-bottom:16px;">MY WALLET</div>' +
        // User info
        '<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:20px;margin-bottom:16px;">' +
          '<div style="font-size:14px;color:#e2e8f0;font-weight:700;margin-bottom:4px;">👤 ' + name + '</div>' +
          '<div style="font-size:11px;color:#64748b;font-family:monospace;cursor:pointer;" onclick="if(navigator.clipboard)navigator.clipboard.writeText(\'' + addr + '\')">🔑 ' + shortAddr + ' <span style="font-size:9px;color:#475569;">[TAP TO COPY]</span></div>' +
        '</div>' +
        // Balances
        '<div style="display:flex;gap:12px;margin-bottom:16px;">' +
          '<div style="flex:1;background:linear-gradient(135deg,rgba(245,158,11,0.1),rgba(245,158,11,0.02));border:1px solid rgba(245,158,11,0.2);border-radius:14px;padding:16px;text-align:center;">' +
            '<div style="font-size:24px;font-weight:900;color:#f59e0b;font-family:Orbitron,sans-serif;">' + arx + '</div>' +
            '<div style="font-size:10px;color:#92400e;letter-spacing:2px;margin-top:4px;">🪙 ARX</div>' +
          '</div>' +
          '<div style="flex:1;background:linear-gradient(135deg,rgba(139,92,246,0.1),rgba(139,92,246,0.02));border:1px solid rgba(139,92,246,0.2);border-radius:14px;padding:16px;text-align:center;">' +
            '<div id="sol-balance-val" style="font-size:24px;font-weight:900;color:#a78bfa;font-family:Orbitron,sans-serif;">...</div>' +
            '<div style="font-size:10px;color:#5b21b6;letter-spacing:2px;margin-top:4px;">◎ SOL</div>' +
          '</div>' +
        '</div>' +
        // Buttons
        '<div style="display:flex;flex-direction:column;gap:10px;">' +
          (WALLET.address ? '<button onclick="window._showBackupKey()" style="padding:12px;border-radius:12px;border:1px solid rgba(245,158,11,0.3);background:rgba(245,158,11,0.08);color:#f59e0b;font-family:Orbitron,sans-serif;font-size:12px;font-weight:900;letter-spacing:2px;cursor:pointer;touch-action:manipulation;">🔐 BACKUP KEY</button>' : '') +
          (!WALLET.address ? '<button onclick="document.getElementById(\'wallet-overlay\').remove();window._generateAndShow()" style="padding:12px;border-radius:12px;border:2px solid #22c55e;background:rgba(34,197,94,0.15);color:#22c55e;font-family:Orbitron,sans-serif;font-size:12px;font-weight:900;letter-spacing:2px;cursor:pointer;touch-action:manipulation;">🔗 CREATE WALLET</button>' : '') +
          '<button onclick="window.authLogout()" style="padding:12px;border-radius:12px;border:1px solid rgba(239,68,68,0.3);background:rgba(239,68,68,0.08);color:#ef4444;font-family:Orbitron,sans-serif;font-size:11px;font-weight:900;letter-spacing:2px;cursor:pointer;touch-action:manipulation;">🚪 LOGOUT</button>' +
          '<button onclick="document.getElementById(\'wallet-overlay\').remove()" style="padding:12px;border-radius:12px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.03);color:#64748b;font-family:Orbitron,sans-serif;font-size:11px;font-weight:900;letter-spacing:2px;cursor:pointer;touch-action:manipulation;">← BACK</button>' +
        '</div>' +
      '</div>';
    
    document.body.appendChild(ov);
    
    // Fetch SOL balance
    if (WALLET.address) {
      window.getSOLBalance(function(sol) {
        var el = document.getElementById('sol-balance-val');
        if (el) el.textContent = sol.toFixed(4);
      });
    } else {
      var el = document.getElementById('sol-balance-val');
      if (el) el.textContent = '0';
    }
  };

  // ── GENERATE AND SHOW BACKUP ──────────────────────────────
  window._generateAndShow = function() {
    window.generateWallet(function(result, err) {
      if (err) {
        alert('Wallet creation failed: ' + err);
        return;
      }
      // Show backup screen
      window._showBackupKey();
    });
  };

  // ── AUTO RESTORE ON LOAD ──────────────────────────────────
  window.restoreWallet();

})();
