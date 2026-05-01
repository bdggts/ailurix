// ═══════════════════════════════════════════════════════════
// AILURIX ARENA — AUTH MODULE
// Google OAuth + Guest Login + Session Management
// ═══════════════════════════════════════════════════════════

(function(){
  'use strict';

  var SERVER = 'https://ailurix-arena-server.onrender.com';
  var GOOGLE_CLIENT_ID = '616154647185-amlj2rhsirctp7pbfe5aufrnkge05l62.apps.googleusercontent.com';

  // ── AUTH STATE ─────────────────────────────────────────────
  window.AUTH = {
    user: null,
    token: null,
    loggedIn: false,
    isGuest: false
  };

  // ── INIT: Check if already logged in ──────────────────────
  window.initAuth = function() {
    var saved = localStorage.getItem('arx_token');
    var savedUser = localStorage.getItem('arx_user');
    
    if (saved && savedUser) {
      try {
        AUTH.token = saved;
        AUTH.user = JSON.parse(savedUser);
        AUTH.loggedIn = true;
        AUTH.isGuest = (AUTH.user.loginMethod === 'guest');
        console.log('✅ Auto-login:', AUTH.user.name);
        // Verify token is still valid
        _verifyToken(saved);
        return true;
      } catch(e) {
        localStorage.removeItem('arx_token');
        localStorage.removeItem('arx_user');
      }
    }
    return false;
  };

  // Verify token with server
  function _verifyToken(token) {
    fetch(SERVER + '/api/user', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(function(r){ return r.json(); })
    .then(function(data){
      if (data.error) {
        // Token expired — clear and show login
        console.log('⚠️ Token expired');
        window.authLogout();
      } else {
        // Update local user data
        AUTH.user = data;
        localStorage.setItem('arx_user', JSON.stringify(data));
      }
    })
    .catch(function(){ /* offline — use cached */ });
  }

  // ── GOOGLE SIGN-IN (System Browser via Android native) ─────
  window.initGoogleSignIn = function() {
    console.log('✅ Google Sign-In ready (system browser mode)');
  };

  window.googleSignIn = function() {
    // Use native Android to open system browser (Chrome)
    // Google blocks OAuth in WebView but allows Chrome
    if (window.AndroidAuth) {
      window.AndroidAuth.openGoogleLogin();
    } else {
      // Fallback: try direct navigation (for testing in regular browser)
      window.location.href = SERVER + '/auth/google/start';
    }
  };

  function _handleGoogleResponse(response) {
    if (!response.credential) {
      _showAuthError('Google login failed');
      return;
    }
    _showAuthLoading('Logging in...');
    
    fetch(SERVER + '/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: response.credential })
    })
    .then(function(r){ return r.json(); })
    .then(function(data){
      if (data.success) {
        AUTH.token = data.token;
        AUTH.user = data.user;
        AUTH.loggedIn = true;
        AUTH.isGuest = false;
        
        localStorage.setItem('arx_token', data.token);
        localStorage.setItem('arx_user', JSON.stringify(data.user));
        
        _hideAuthLoading();
        
        if (data.isNew) {
          console.log('🆕 New user! Show wallet setup');
          _showWalletSetup();
        } else {
          console.log('✅ Welcome back:', data.user.name);
          _enterGame();
        }
      } else {
        _showAuthError(data.error || 'Login failed');
      }
    })
    .catch(function(err){
      _showAuthError('Server error. Try again.');
      console.error('Auth fetch error:', err);
    });
  }

  // ── GUEST LOGIN ───────────────────────────────────────────
  window.guestLogin = function() {
    AUTH.user = {
      name: 'Guest Fighter',
      arxBalance: 0,
      loginMethod: 'guest',
      walletAddress: ''
    };
    AUTH.loggedIn = true;
    AUTH.isGuest = true;
    AUTH.token = null;
    
    localStorage.setItem('arx_user', JSON.stringify(AUTH.user));
    _enterGame();
  };

  // ── WALLET LOGIN ──────────────────────────────────────────
  window.walletLogin = function(walletAddress) {
    _showAuthLoading('Connecting wallet...');
    
    fetch(SERVER + '/auth/wallet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletAddress: walletAddress, loginMethod: 'wallet' })
    })
    .then(function(r){ return r.json(); })
    .then(function(data){
      if (data.success) {
        AUTH.token = data.token;
        AUTH.user = data.user;
        AUTH.loggedIn = true;
        AUTH.isGuest = false;
        
        localStorage.setItem('arx_token', data.token);
        localStorage.setItem('arx_user', JSON.stringify(data.user));
        
        _hideAuthLoading();
        _enterGame();
      } else {
        _showAuthError(data.error || 'Wallet login failed');
      }
    })
    .catch(function(){
      _showAuthError('Server error. Try again.');
    });
  };

  // ── LOGOUT ────────────────────────────────────────────────
  window.authLogout = function() {
    AUTH.user = null;
    AUTH.token = null;
    AUTH.loggedIn = false;
    AUTH.isGuest = false;
    localStorage.removeItem('arx_token');
    localStorage.removeItem('arx_user');
    // Show login screen
    _showLoginScreen();
  };

  // ── UPDATE WALLET ON SERVER ───────────────────────────────
  window.updateWalletOnServer = function(walletAddress) {
    if (!AUTH.token) return;
    fetch(SERVER + '/api/user/wallet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: AUTH.token, walletAddress: walletAddress })
    }).catch(function(){});
  };

  // ── UI HELPERS ────────────────────────────────────────────
  function _showLoginScreen() {
    var ls = document.getElementById('login-screen');
    if (ls) { ls.classList.add('active'); ls.style.display = 'flex'; }
    var sp = document.getElementById('splash');
    if (sp) { sp.classList.remove('active'); }
  }

  function _enterGame() {
    // Hide login, show splash
    var ls = document.getElementById('login-screen');
    if (ls) { ls.classList.remove('active'); ls.style.display = 'none'; }
    
    // Update splash with user info
    _updateUserUI();
    
    // Show splash and init game
    if (window.initSplash) window.initSplash();
    var sp = document.getElementById('splash');
    if (sp) sp.classList.add('active');
  }

  function _showWalletSetup() {
    // Auto-generate wallet for new Google users
    _enterGame();
    if (window.generateWallet) {
      setTimeout(function(){
        window.generateWallet(function(result, err) {
          if (result) {
            console.log('🔗 Auto-wallet created:', result.address);
            // Show backup key screen
            if (window._showBackupKey) window._showBackupKey();
          }
        });
      }, 1500);
    }
  }

  function _updateUserUI() {
    // Update splash footer with username
    var footer = document.querySelector('.splash-footer');
    if (footer && AUTH.user) {
      var name = AUTH.user.name || 'Fighter';
      var arx = AUTH.user.arxBalance || 0;
      footer.innerHTML = '👤 ' + name + ' · 🪙 ' + arx + ' ARX · v2.2.0';
    }
  }

  function _showAuthLoading(msg) {
    var el = document.getElementById('auth-loading');
    if (el) { el.textContent = msg || 'Loading...'; el.style.display = 'block'; }
    var btns = document.getElementById('auth-buttons');
    if (btns) btns.style.opacity = '0.3';
  }

  function _hideAuthLoading() {
    var el = document.getElementById('auth-loading');
    if (el) el.style.display = 'none';
    var btns = document.getElementById('auth-buttons');
    if (btns) btns.style.opacity = '1';
  }

  function _showAuthError(msg) {
    _hideAuthLoading();
    var el = document.getElementById('auth-error');
    if (el) {
      el.textContent = msg;
      el.style.display = 'block';
      setTimeout(function(){ el.style.display = 'none'; }, 3000);
    }
  }

})();
