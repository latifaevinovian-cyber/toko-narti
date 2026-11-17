(function () {
  'use strict';
  var editingId = null;
  function $(id) { return document.getElementById(id); }
  function esc(s) { return window.TokoStore.escapeHTML(s); }
  function guard() {
    var user = window.TokoAuth.requireAdmin();
    if (!user) return null;
    var who = $('adminWho');
    if (who) { who.textContent = 'Admin'; who.setAttribute('title', user.nama + ' (' + user.email + ')'); }
    return user;
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

  function renderDashboard() {
    var products = window.TokoStore.loadProducts();
    var orders = window.TokoStore.loadOrders();
    var omzet = orders.reduce(function (s, o) { return s + (Number(o.total) || 0); }, 0);
    var low = products.filter(function (p) { return p.stok < 5; });
    $('statProduk').textContent = products.length;
    $('statPesanan').textContent = orders.length;
    $('statOmzet').textContent = window.TokoStore.formatRupiah(omzet);
    $('statStokMenipis').textContent = low.length;

    var lowBox = $('lowStockList');
    if (lowBox) {
      lowBox.innerHTML = low.length
        ? low.map(function (p) { return '<li>' + esc(p.nama) + ' — stok ' + p.stok + '</li>'; }).join('')
        : '<li>Semua stok aman.</li>';
    }

    var chart = $('chartBars');
    if (chart) {
      var byCat = {};
      window.TokoStore.CATEGORIES.forEach(function (c) { byCat[c] = 0; });
      orders.forEach(function (o) {
        (o.items || []).forEach(function (it) {
          var p = products.find(function (x) { return x.id === it.id; });
          var cat = p ? p.kategori : 'Lainnya';
          if (byCat[cat] == null) byCat[cat] = 0;
          byCat[cat] += it.harga * it.qty;
        });
      });
      var max = Math.max.apply(null, Object.keys(byCat).map(function (k) { return byCat[k]; }).concat([1]));
      chart.innerHTML = Object.keys(byCat).map(function (cat) {
        var v = byCat[cat];
        var pct = Math.round((v / max) * 100);
        return '<div class="bar-row"><span class="bar-label">' + esc(cat) + '</span>' +
          '<div class="bar-track"><div class="bar-fill" style="width:' + pct + '%"></div></div>' +
          '<span class="bar-value">' + window.TokoStore.formatRupiah(v) + '</span></div>';
      }).join('') + '<p class="muted">Grafik: omzet per kategori dari pesanan yang tersimpan. Jika belum ada pesanan, semua nol — itu normal.</p>';
    }

    var box = $('orderList');
    if (box) {
      if (!orders.length) { box.innerHTML = '<p class="empty">Belum ada pesanan.</p>'; }
      else {
        box.innerHTML = orders.slice(0, 10).map(function (o) {
          var items = (o.items || []).map(function (it) { return esc(it.nama) + ' x' + it.qty; }).join(', ');
          var st = autoStatus(o);
          return '<div class="order-row"><strong>No. Pesanan: ' + esc(o.id) + '</strong> — ' + esc(o.namaPembeli || o.userEmail) + ' (' + esc(o.userEmail) + ')<br>' +
            esc(items) + '<br>Total: ' + window.TokoStore.formatRupiah(o.total) + ' • ' + esc(new Date(o.createdAt).toLocaleString('id-ID')) + '<br>' +
            '<label>Status: <select data-order="' + esc(o.id) + '">' +
            ['baru', 'diproses', 'selesai', 'dibatalkan'].map(function (s) { return '<option value="' + s + '"' + (st === s ? ' selected' : '') + '>' + s + '</option>'; }).join('') +
            '</select></label>' + (o.statusManual ? '' : ' <span class="muted">(otomatis)</span>') + '</div>';
        }).join('');
        box.querySelectorAll('[data-order]').forEach(function (sel) {
          sel.addEventListener('change', function () {
            var orders2 = window.TokoStore.loadOrders();
            var o = orders2.find(function (x) { return x.id === sel.getAttribute('data-order'); });
            if (o) { o.status = sel.value; o.statusManual = true; window.TokoStore.saveOrders(orders2); renderDashboard(); }
          });
        });
      }
    }
  }

  function renderTable() {
    var tbody = $('productTableBody');
    if (!tbody) return;
    var products = window.TokoStore.loadProducts();
    var q = ($('adminSearch') ? $('adminSearch').value : '').trim().toLowerCase();
    var list = products.filter(function (p) { return !q || p.nama.toLowerCase().indexOf(q) !== -1; });
    tbody.innerHTML = list.map(function (p) {
      return '<tr><td>' + p.id + '</td><td>' + esc(p.nama) + '</td><td>' + esc(p.kategori) + '</td>' +
        '<td>' + window.TokoStore.formatRupiah(p.harga) + '</td><td>' + p.stok + '</td>' +
        '<td><button type="button" class="btn btn-small" data-edit="' + p.id + '">Ubah</button> ' +
        '<button type="button" class="btn btn-small btn-danger" data-del="' + p.id + '">Hapus</button></td></tr>';
    }).join('') || '<tr><td colspan="6">Tidak ada produk.</td></tr>';
    tbody.querySelectorAll('[data-edit]').forEach(function (b) { b.addEventListener('click', function () { startEdit(Number(b.getAttribute('data-edit'))); }); });
    tbody.querySelectorAll('[data-del]').forEach(function (b) { b.addEventListener('click', function () { deleteProduct(Number(b.getAttribute('data-del'))); }); });
  }

  function startEdit(id) {
    var p = window.TokoStore.loadProducts().find(function (x) { return x.id === id; });
    if (!p) return;
    editingId = id;
    $('fNama').value = p.nama;
    $('fKategori').value = p.kategori;
    $('fHarga').value = p.harga;
    $('fStok').value = p.stok;
    $('fGambar').value = p.gambar || '';
    $('formTitle').textContent = 'Ubah Produk #' + id;
    $('cancelEditBtn').style.display = '';
    var panel = $('formPanel');
    var target = panel || $('productForm');
    if (target) {
      target.scrollIntoView({ behavior: 'auto', block: 'start' });
      var n = $('fNama'); if (n) n.focus({ preventScroll: true });
    } else {
      $('formTitle').scrollIntoView({ behavior: 'auto', block: 'start' });
    }
  }

  function resetForm() {
    editingId = null;
    var f = $('productForm');
    if (f) f.reset();
    $('formTitle').textContent = 'Tambah Produk Baru';
    $('cancelEditBtn').style.display = 'none';
  }

  function deleteProduct(id) {
    var p = window.TokoStore.loadProducts().find(function (x) { return x.id === id; });
    if (!p) return;
    if (!confirm('Hapus produk "' + p.nama + '"? Tindakan ini tidak bisa dibatalkan.')) return;
    var list = window.TokoStore.loadProducts().filter(function (x) { return x.id !== id; });
    window.TokoStore.saveProducts(list);
    renderTable(); renderDashboard();
  }

  function submitForm(e) {
    e.preventDefault();
    var data = {
      nama: $('fNama').value.trim(),
      kategori: $('fKategori').value,
      harga: Number($('fHarga').value),
      stok: Number($('fStok').value),
      gambar: $('fGambar').value.trim() || 'assets/gambar_sembako.jpg'
    };
    var v = window.TokoStore.validateProduct(data);
    var err = $('formError');
    if (!v.ok) { if (err) { err.textContent = v.errors.join(' '); err.style.display = ''; } return; }
    if (err) err.style.display = 'none';
    var list = window.TokoStore.loadProducts();
    if (editingId) {
      var p = list.find(function (x) { return x.id === editingId; });
      if (p) Object.assign(p, data);
    } else {
      data.id = window.TokoStore.nextProductId(list);
      list.push(data);
    }
    var wasEditing = !!editingId;
    window.TokoStore.saveProducts(list);
    resetForm(); renderTable(); renderDashboard();
    alert(wasEditing ? 'Produk diperbarui.' : 'Produk ditambahkan.');
  }

  function exportProducts() {
    var rows = [['ID', 'Nama', 'Kategori', 'Harga (Rp)', 'Stok', 'Gambar']];
    window.TokoStore.loadProducts().forEach(function (p) { rows.push([p.id, p.nama, p.kategori, p.harga, p.stok, p.gambar]); });
    window.TokoStore.downloadCSV('produk-toko-narti.csv', rows);
  }

  function exportOrders() {
    var rows = [['Order ID', 'Pembeli', 'Email', 'Total (Rp)', 'Status', 'Tanggal', 'Items']];
    window.TokoStore.loadOrders().forEach(function (o) {
      rows.push([o.id, o.namaPembeli, o.userEmail, o.total, autoStatus(o), o.createdAt, (o.items || []).map(function (it) { return it.nama + ' x' + it.qty; }).join('; ')]);
    });
    window.TokoStore.downloadCSV('pesanan-toko-narti.csv', rows);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var pd = $('printDate');
    if (pd) pd.textContent = new Date().toLocaleString('id-ID');
    if (!guard()) return;
    renderDashboard();
    renderTable();
    var form = $('productForm');
    if (form) form.addEventListener('submit', submitForm);
    var cancel = $('cancelEditBtn');
    if (cancel) cancel.addEventListener('click', resetForm);
    var search = $('adminSearch');
    if (search) search.addEventListener('input', renderTable);
    var b1 = $('exportProdukBtn'); if (b1) b1.addEventListener('click', exportProducts);
    var b2 = $('exportPesananBtn'); if (b2) b2.addEventListener('click', exportOrders);
    var b3 = $('printBtn'); if (b3) b3.addEventListener('click', function () { window.print(); });
    var b4 = $('resetProdukBtn'); if (b4) b4.addEventListener('click', function () { if (confirm('Kembalikan semua produk ke data awal situs (55 produk)? Perubahan CRUD akan hilang.')) { window.TokoStore.resetProducts(); renderTable(); renderDashboard(); } });
    var out = $('logoutBtnAdmin'); if (out) out.addEventListener('click', function () { window.TokoAuth.logout(); window.location.href = 'index.html'; });
  });

  window.TokoAdmin = { renderDashboard: renderDashboard, renderTable: renderTable, exportProducts: exportProducts, exportOrders: exportOrders, autoStatus: autoStatus };
})();