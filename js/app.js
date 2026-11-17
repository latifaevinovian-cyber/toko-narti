(function () {
  'use strict';
  var WA_NUMBER = '6282240355800'; 
  var state = { q: '', kategori: 'Semua' };
  function $(id) { return document.getElementById(id); }
  function updateAuthArea() {
    var area = $('authArea');
    if (!area) return;
    var user = window.TokoAuth.currentUser();
    var logoText = $('logoText');
    if (!user) {
      if (logoText) logoText.style.display = '';
      area.innerHTML = '<a class="btn btn-outline" href="login.html">Login</a> ' +
        '<a class="btn btn-primary" href="register.html">Daftar</a>';
      return;
    }
    if (logoText) logoText.style.display = 'none';
    var esc = window.TokoStore.escapeHTML;
    var adminLink = user.role === 'admin'
      ? '<a class="btn btn-primary" href="admin.html">Dashboard Admin</a> ' : '';
    var chipText = user.role === 'admin'
      ? 'Halo, Admin'
      : 'Halo, ' + esc(user.nama) + ' (' + esc(user.role) + ')';
    area.innerHTML = '<span class="user-chip" title="' + esc(user.email) + '">' + chipText + '</span> ' +
      adminLink +
      '<a class="btn btn-outline" href="#" id="logoutBtn">Logout</a>';
    var btn = $('logoutBtn');
    if (btn) btn.addEventListener('click', function (e) { e.preventDefault(); window.TokoAuth.logout(); window.location.reload(); });
  }

  function renderCategories() {
    var wrap = $('categoryChips');
    if (!wrap) return;
    var cats = ['Semua'].concat(window.TokoStore.CATEGORIES);
    wrap.innerHTML = cats.map(function (c) {
      return '<button type="button" class="chip' + (state.kategori === c ? ' active' : '') + '" data-cat="' + window.TokoStore.escapeHTML(c) + '">' + window.TokoStore.escapeHTML(c) + '</button>';
    }).join('');
    wrap.querySelectorAll('.chip').forEach(function (b) {
      b.addEventListener('click', function () { state.kategori = b.getAttribute('data-cat'); renderCategories(); renderProducts(); });
    });
  }

  function filteredProducts() {
    var list = window.TokoStore.loadProducts();
    var q = state.q.trim().toLowerCase();
    return list.filter(function (p) {
      var okCat = state.kategori === 'Semua' || p.kategori === state.kategori;
      var okQ = !q || String(p.nama).toLowerCase().indexOf(q) !== -1 || String(p.kategori).toLowerCase().indexOf(q) !== -1;
      return okCat && okQ;
    });
  }

  function renderProducts() {
    var grid = $('productGrid');
    if (!grid) return;
    var list = filteredProducts();
    var count = $('productCount');
    if (count) count.textContent = list.length + ' produk';
    if (!list.length) {
      grid.innerHTML = '<p class="empty">Tidak ada produk yang cocok. Coba kata kunci atau kategori lain.</p>';
      return;
    }
    var esc = window.TokoStore.escapeHTML;
    grid.innerHTML = list.map(function (p) {
      var habis = p.stok <= 0;
      var low = !habis && p.stok < 5;
      return '<article class="card-katalog">' +
        '<img src="' + esc(p.gambar || 'assets/gambar_sembako.jpg') + '" alt="' + esc(p.nama) + '" loading="lazy" onerror="this.src=\'assets/gambar_sembako.jpg\'">' +
        '<div class="card-footer">' +
        '<span class="badge">' + esc(p.kategori) + '</span>' +
        '<div class="nama-item">' + esc(p.nama) + '</div>' +
        '<div class="harga-item">' + window.TokoStore.formatRupiah(p.harga) + '</div>' +
        '<p class="stock' + (low ? ' low' : '') + '">' + (habis ? 'Stok habis' : 'Stok: ' + p.stok + (low ? ' — hampir habis' : '')) + '</p>' +
        '<button type="button" class="btn-tambah" data-add="' + p.id + '"' + (habis ? ' disabled' : '') + '>' + (habis ? 'Habis' : '+ Keranjang') + '</button>' +
        '</div></article>';
    }).join('');
    grid.querySelectorAll('[data-add]').forEach(function (b) {
      b.addEventListener('click', function () { addToCart(Number(b.getAttribute('data-add'))); });
    });
  }

  function cartCount() {
    return window.TokoStore.loadCart().reduce(function (s, i) { return s + (Number(i.qty) || 0); }, 0);
  }

  function addToCart(productId) {
    var products = window.TokoStore.loadProducts();
    var p = products.find(function (x) { return x.id === productId; });
    if (!p) return;
    var cart = window.TokoStore.loadCart();
    var item = cart.find(function (x) { return x.id === productId; });
    var qtyNow = item ? item.qty : 0;
    if (qtyNow + 1 > p.stok) { alert('Stok ' + p.nama + ' tidak cukup (tersisa ' + p.stok + ').'); return; }
    if (item) item.qty += 1; else cart.push({ id: p.id, nama: p.nama, harga: p.harga, qty: 1 });
    window.TokoStore.saveCart(cart);
    renderCart();
    var badge = $('cartCount');
    if (badge) badge.textContent = cartCount();
  }

  function renderCart() {
    var box = $('cartItems');
    if (!box) return;
    var cart = window.TokoStore.loadCart();
    var products = window.TokoStore.loadProducts();
    var total = 0;
    var esc = window.TokoStore.escapeHTML;
    if (!cart.length) {
      box.innerHTML = '<p class="empty">Keranjang masih kosong.</p>';
    } else {
      box.innerHTML = cart.map(function (item) {
        var sub = item.harga * item.qty;
        total += sub;
        return '<div class="cart-row"><span>' + esc(item.nama) + ' x ' + item.qty + '</span>' +
          '<span>' + window.TokoStore.formatRupiah(sub) + '</span>' +
          '<button type="button" class="btn btn-small" data-dec="' + item.id + '">-</button>' +
          '<button type="button" class="btn btn-small" data-inc="' + item.id + '">+</button>' +
          '<button type="button" class="btn btn-small btn-danger" data-del="' + item.id + '">Hapus</button></div>';
      }).join('');
      box.querySelectorAll('[data-inc]').forEach(function (b) { b.addEventListener('click', function () { changeQty(Number(b.getAttribute('data-inc')), 1); }); });
      box.querySelectorAll('[data-dec]').forEach(function (b) { b.addEventListener('click', function () { changeQty(Number(b.getAttribute('data-dec')), -1); }); });
      box.querySelectorAll('[data-del]').forEach(function (b) { b.addEventListener('click', function () { removeItem(Number(b.getAttribute('data-del'))); }); });
    }
    var totalEl = $('cartTotal');
    if (totalEl) totalEl.textContent = window.TokoStore.formatRupiah(total);
    var badge = $('cartCount');
    if (badge) badge.textContent = cartCount();
    var checkoutBtn = $('checkoutBtn');
    if (checkoutBtn) checkoutBtn.disabled = !cart.length;
  }

  function changeQty(id, delta) {
    var products = window.TokoStore.loadProducts();
    var p = products.find(function (x) { return x.id === id; });
    var cart = window.TokoStore.loadCart();
    var item = cart.find(function (x) { return x.id === id; });
    if (!item) return;
    var next = item.qty + delta;
    if (delta > 0 && p && next > p.stok) { alert('Stok tidak cukup.'); return; }
    if (next <= 0) cart = cart.filter(function (x) { return x.id !== id; });
    else item.qty = next;
    window.TokoStore.saveCart(cart);
    renderCart();
  }
  function removeItem(id) {
    window.TokoStore.saveCart(window.TokoStore.loadCart().filter(function (x) { return x.id !== id; }));
    renderCart();
  }

  function checkout() {
    var cart = window.TokoStore.loadCart();
    if (!cart.length) { alert('Keranjang masih kosong.'); return; }
    var user = window.TokoAuth.currentUser();
    var products = window.TokoStore.loadProducts();
    for (var i = 0; i < cart.length; i++) {
      var p = products.find(function (x) { return x.id === cart[i].id; });
      if (!p || cart[i].qty > p.stok) { alert('Stok berubah, mohon ulangi. Produk: ' + (p ? p.nama : cart[i].nama)); renderProducts(); return; }
    }
    cart.forEach(function (item) {
      var p = products.find(function (x) { return x.id === item.id; });
      if (p) p.stok -= item.qty;
    });
    window.TokoStore.saveProducts(products);
    var total = cart.reduce(function (s, it) { return s + it.harga * it.qty; }, 0);
    var order = {
      id: 'ORD-' + Date.now(),
      userId: user ? user.id : null,
      userEmail: user ? user.email : 'tamu',
      namaPembeli: user ? user.nama : 'Tamu',
      items: cart,
      total: total,
      status: 'baru',
      createdAt: new Date().toISOString()
    };
    var orders = window.TokoStore.loadOrders();
    orders.unshift(order);
    window.TokoStore.saveOrders(orders);
    window.TokoStore.saveCart([]);
    renderCart(); renderProducts(); renderMyOrders();
    var lines = cart.map(function (it) { return '- ' + it.nama + ' x' + it.qty + ' = Rp ' + (it.harga * it.qty).toLocaleString('id-ID'); });
    var msg = 'Halo Toko Hj. Narti, saya mau pesan:\n' + lines.join('\n') + '\nTotal: Rp ' + total.toLocaleString('id-ID') + '\nOrder: ' + order.id + (user ? '\nPembeli: ' + user.nama : '');
    window.open('https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg), '_blank');
    alert('Pesanan tersimpan (' + order.id + '). Total ' + window.TokoStore.formatRupiah(total) + '. Silakan lanjutkan ke WhatsApp.');
  }
  function autoStatus(o) {
    if (!o) return 'baru';
    if (o.statusManual) return o.status || 'baru';
    if (o.status === 'dibatalkan') return 'dibatalkan';
    var t = Date.parse(o.createdAt);
    if (!t) return o.status || 'baru';
    var age = Date.now() - t;
    if (age < 30 * 60 * 1000) return 'baru';
    if (age < 24 * 60 * 60 * 1000) return 'diproses';
    return 'selesai';
  }

  function renderMyOrders() {
    var box = $('myOrders');
    if (!box) return;
    var user = window.TokoAuth.currentUser();
    if (!user) { box.innerHTML = '<p class="empty">Login untuk melihat pesananmu.</p>'; return; }
    var orders = window.TokoAuth.visibleOrdersFor(user);
    if (!orders.length) { box.innerHTML = '<p class="empty">Belum ada pesanan.</p>'; return; }
    var esc = window.TokoStore.escapeHTML;
    box.innerHTML = orders.slice(0, 5).map(function (o) {
      var items = o.items.map(function (it) { return esc(it.nama) + ' x' + it.qty; }).join(', ');
      var st = autoStatus(o);
      var autoNote = (!o.statusManual && st !== (o.status || 'baru')) ? ' (otomatis)' : '';
      return '<div class="order-row"><strong>No. Pesanan: ' + esc(o.id) + '</strong> — ' + esc(items) + '<br>Total: ' + window.TokoStore.formatRupiah(o.total) + ' • Status: <strong>' + esc(st) + '</strong>' + autoNote + ' • ' + esc(new Date(o.createdAt).toLocaleString('id-ID')) + '</div>';
    }).join('');
  }

  document.addEventListener('DOMContentLoaded', function () {
    var nav = document.querySelector('.navbar');
    function onScroll() {
      if (!nav) return;
      if (window.scrollY > 50) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    }
    window.addEventListener('scroll', onScroll);
    onScroll();
    updateAuthArea();
    renderCategories();
    renderProducts();
    renderCart();
    renderMyOrders();
    var search = $('searchInput');
    if (search) search.addEventListener('input', function () { state.q = search.value; renderProducts(); });
    var checkoutBtn = $('checkoutBtn');
    if (checkoutBtn) checkoutBtn.addEventListener('click', checkout);
    var clearBtn = $('clearCartBtn');
    if (clearBtn) clearBtn.addEventListener('click', function () { window.TokoStore.saveCart([]); renderCart(); });
  });

  window.TokoApp = { renderProducts: renderProducts, renderCart: renderCart, checkout: checkout, autoStatus: autoStatus };
})();