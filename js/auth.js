(function () {
  'use strict';
  var SESSION_KEY = 'tn_session_v1';
  var ATTEMPT_KEY = 'tn_login_attempts_v1';
  var MAX_ATTEMPTS = 5;
  var LOCK_MS = 60 * 1000;
  var SESSION_MS = 2 * 60 * 60 * 1000;

  var WEAK_PASSWORDS = ['password', '12345678', '123456789', 'qwerty123', 'admin123', 'password123', '1234567890'];

  function read(key, fallback) {
    try { var raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
    catch (e) { return fallback; }
  }
  function write(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

  function randomSalt() {
    var arr = new Uint8Array(16);
    (window.crypto || {}).getRandomValues ? crypto.getRandomValues(arr) : arr.forEach(function (_, i) { arr[i] = Math.floor(Math.random() * 256); });
    return Array.from(arr).map(function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
  }

  async function sha256Hex(text) {
    if (crypto.subtle) {
      var buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
      return Array.from(new Uint8Array(buf)).map(function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
    }
    var h = 0x811c9dc5;
    for (var i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return 'fallback-' + h.toString(16);
  }

  async function hashPassword(password, salt) {
    return await sha256Hex(salt + '::' + password);
  }

  function validatePassword(password) {
    var errors = [];
    if (!password || password.length < 8) errors.push('Password minimal 8 karakter.');
    if (!/[A-Za-z]/.test(password || '')) errors.push('Password harus mengandung huruf.');
    if (!/[0-9]/.test(password || '')) errors.push('Password harus mengandung angka.');
    if (WEAK_PASSWORDS.indexOf(String(password || '').toLowerCase()) !== -1) errors.push('Password terlalu lemah / umum, pilih yang lain.');
    return { ok: errors.length === 0, errors: errors };
  }

  function normalizeEmail(email) { return String(email || '').trim().toLowerCase(); }
  function validEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

  async function seedDemoUsers() {
    var users = window.TokoStore.loadUsers();
    if (users.length) return users;
    var salt1 = randomSalt(), salt2 = randomSalt();
    var adminHash = await hashPassword('Admin1234', salt1);
    var userHash = await hashPassword('User1234', salt2);
    users = [
      { id: 'u-admin', nama: 'Admin Toko Narti', email: 'admin@tokonarti.id', role: 'admin', salt: salt1, hash: adminHash, createdAt: new Date().toISOString() },
      { id: 'u-pelanggan', nama: 'Pelanggan Demo', email: 'user@toko.id', role: 'pelanggan', salt: salt2, hash: userHash, createdAt: new Date().toISOString() }
    ];
    window.TokoStore.saveUsers(users);
    return users;
  }

  function getAttempts() { return read(ATTEMPT_KEY, {}); }
  function isLocked(email) {
    var map = getAttempts();
    var rec = map[normalizeEmail(email)];
    if (!rec || !rec.lockedUntil) return { locked: false, secondsLeft: 0 };
    var left = rec.lockedUntil - Date.now();
    if (left <= 0) { delete map[normalizeEmail(email)]; write(ATTEMPT_KEY, map); return { locked: false, secondsLeft: 0 }; }
    return { locked: true, secondsLeft: Math.ceil(left / 1000) };
  }
  function recordFailedAttempt(email) {
    var key = normalizeEmail(email);
    var map = getAttempts();
    var rec = map[key] || { count: 0, lockedUntil: 0 };
    rec.count += 1;
    if (rec.count >= MAX_ATTEMPTS) { rec.lockedUntil = Date.now() + LOCK_MS; rec.count = 0; }
    map[key] = rec;
    write(ATTEMPT_KEY, map);
    return rec;
  }
  function clearAttempts(email) {
    var map = getAttempts(); delete map[normalizeEmail(email)]; write(ATTEMPT_KEY, map);
  }

  async function register(nama, email, password) {
    await seedDemoUsers();
    email = normalizeEmail(email);
    nama = String(nama || '').trim();
    if (nama.length < 2) return { ok: false, message: 'Nama minimal 2 karakter.' };
    if (!validEmail(email)) return { ok: false, message: 'Format email tidak valid.' };
    var pw = validatePassword(password);
    if (!pw.ok) return { ok: false, message: pw.errors.join(' ') };
    var users = window.TokoStore.loadUsers();
    if (users.some(function (u) { return u.email === email; })) return { ok: false, message: 'Email sudah terdaftar. Silakan login.' };
    var salt = randomSalt();
    var hash = await hashPassword(password, salt);
    var user = { id: 'u-' + Date.now(), nama: nama, email: email, role: 'pelanggan', salt: salt, hash: hash, createdAt: new Date().toISOString() };
    users.push(user);
    window.TokoStore.saveUsers(users);
    setSession(user);
    return { ok: true, user: publicUser(user) };
  }

  async function login(email, password) {
    await seedDemoUsers();
    email = normalizeEmail(email);
    var lock = isLocked(email);
    if (lock.locked) return { ok: false, message: 'Terlalu banyak percobaan gagal. Coba lagi dalam ' + lock.secondsLeft + ' detik.' };
    if (!validEmail(email)) return { ok: false, message: 'Format email tidak valid.' };
    var users = window.TokoStore.loadUsers();
    var user = users.find(function (u) { return u.email === email; });
    if (!user) { recordFailedAttempt(email); return { ok: false, message: 'Email atau password salah.' }; }
    var hash = await hashPassword(password, user.salt);
    if (hash !== user.hash) {
      var rec = recordFailedAttempt(email);
      var left = MAX_ATTEMPTS - rec.count;
      if (rec.lockedUntil) return { ok: false, message: 'Terlalu banyak percobaan gagal. Akun dikunci 60 detik.' };
      return { ok: false, message: 'Email atau password salah. Sisa percobaan: ' + left + 'x.' };
    }
    clearAttempts(email);
    setSession(user);
    return { ok: true, user: publicUser(user) };
  }

  function setSession(user) {
    var session = { userId: user.id, email: user.email, nama: user.nama, role: user.role, expiresAt: Date.now() + SESSION_MS };
    write(SESSION_KEY, session);
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch (e) {}
  }

  function getSession() {
    var s = read(SESSION_KEY, null);
    if (!s) return null;
    if (!s.expiresAt || Date.now() > s.expiresAt) { logout(); return null; }
    return s;
  }

  function currentUser() {
    var s = getSession();
    if (!s) return null;
    return { id: s.userId, email: s.email, nama: s.nama, role: s.role };
  }

  function publicUser(u) { return { id: u.id, email: u.email, nama: u.nama, role: u.role }; }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    try { sessionStorage.removeItem(SESSION_KEY); } catch (e) {}
  }

  function requireLogin() {
    var u = currentUser();
    if (!u) { window.location.href = 'login.html'; return null; }
    return u;
  }
  function requireAdmin() {
    var u = requireLogin();
    if (!u) return null;
    if (u.role !== 'admin') { window.location.href = 'index.html'; return null; }
    return u;
  }

  function visibleOrdersFor(user) {
    var orders = window.TokoStore.loadOrders();
    if (!user) return [];
    if (user.role === 'admin') return orders;
    return orders.filter(function (o) { return o.userEmail === user.email || o.userId === user.id; });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { seedDemoUsers(); });
  } else { seedDemoUsers(); }

  window.TokoAuth = {
    register: register, login: login, logout: logout,
    currentUser: currentUser, getSession: getSession,
    requireLogin: requireLogin, requireAdmin: requireAdmin,
    validatePassword: validatePassword, validEmail: validEmail,
    seedDemoUsers: seedDemoUsers, visibleOrdersFor: visibleOrdersFor,
    isLocked: isLocked, MAX_ATTEMPTS: MAX_ATTEMPTS, LOCK_MS: LOCK_MS
  };
})();