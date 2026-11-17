(function () {
  'use strict';
  var PRODUCTS_KEY = 'tn_products_v1';
  var ORDERS_KEY = 'tn_orders_v1';
  var USERS_KEY = 'tn_users_v1';
  var CART_KEY = 'tn_cart_v1';
  var CATEGORIES = ['Sembako', 'Sayuran & Protein', 'Bumbu Dapur', 'Rokok', 'Makanan & Minuman', 'Alat Tulis Sekolah'];
  var SEED_PRODUCTS = [
    { id: 1, nama: 'Beras 1kg', kategori: 'Sembako', harga: 16000, stok: 40, gambar: 'assets/beras_toko.jpeg' },
    { id: 2, nama: 'Gula Pasir 1/4', kategori: 'Sembako', harga: 5000, stok: 35, gambar: 'assets/gula_pasir.webp' },
    { id: 3, nama: 'Minyak Goreng 1/4', kategori: 'Sembako', harga: 6000, stok: 30, gambar: 'assets/minyak_goreng.png' },
    { id: 4, nama: 'Telur Ayam 1/2', kategori: 'Sembako', harga: 19000, stok: 25, gambar: 'assets/telur_toko.jpg' },
    { id: 5, nama: 'Mie Instan 1', kategori: 'Sembako', harga: 3000, stok: 60, gambar: 'assets/mie_instan.jpg' },
    { id: 6, nama: 'Gas Elpiji', kategori: 'Sembako', harga: 23000, stok: 8, gambar: 'assets/gas_elpiji.jpg' },
    { id: 7, nama: 'Teh Tubruk 3', kategori: 'Sembako', harga: 5000, stok: 28, gambar: 'assets/teh_tubruk.jpg' },
    { id: 8, nama: 'Kopi 1 Sachet', kategori: 'Sembako', harga: 2000, stok: 50, gambar: 'assets/kopi_toko.jpg' },
    { id: 9, nama: 'Susu 1 Sachet', kategori: 'Sembako', harga: 2000, stok: 45, gambar: 'assets/susu_toko.jpg' },
    { id: 10, nama: 'Tepung 1/4', kategori: 'Sembako', harga: 2000, stok: 22, gambar: 'assets/tepung.jpg' },
    { id: 11, nama: 'Kol 1/2', kategori: 'Sayuran & Protein', harga: 3000, stok: 15, gambar: 'assets/sayur_kol.png' },
    { id: 12, nama: 'Wortel 1/2', kategori: 'Sayuran & Protein', harga: 7000, stok: 12, gambar: 'assets/wortel.webp' },
    { id: 13, nama: 'Bawang Merah 1/4', kategori: 'Sayuran & Protein', harga: 6000, stok: 18, gambar: 'assets/bawang_merah.webp' },
    { id: 14, nama: 'Bawang Putih 1/4', kategori: 'Sayuran & Protein', harga: 6000, stok: 18, gambar: 'assets/bawang_putih.webp' },
    { id: 15, nama: 'Cabe Merah 1/4', kategori: 'Sayuran & Protein', harga: 10000, stok: 10, gambar: 'assets/cabe_merah.jpg' },
    { id: 16, nama: 'Cabe Rawit 1/4', kategori: 'Sayuran & Protein', harga: 10000, stok: 9, gambar: 'assets/cabe_rawit.jpeg' },
    { id: 17, nama: 'Ayam 1/4', kategori: 'Sayuran & Protein', harga: 9000, stok: 14, gambar: 'assets/ayam.jpg' },
    { id: 18, nama: 'Ikan Pindang 1 Mika', kategori: 'Sayuran & Protein', harga: 12000, stok: 7, gambar: 'assets/ikan_pindang.avif' },
    { id: 19, nama: 'Bawang Daun 1/4', kategori: 'Sayuran & Protein', harga: 2000, stok: 20, gambar: 'assets/bawang_daun.webp' },
    { id: 20, nama: 'Ikan Basah 1/2', kategori: 'Sayuran & Protein', harga: 15000, stok: 6, gambar: 'assets/ikan_basah.jpg' },
    { id: 21, nama: 'Racik 1 Sachet', kategori: 'Bumbu Dapur', harga: 2000, stok: 40, gambar: 'assets/racik.webp' },
    { id: 22, nama: 'Royko 1 Sachet', kategori: 'Bumbu Dapur', harga: 500, stok: 80, gambar: 'assets/royko.jpg' },
    { id: 23, nama: 'Masako 1 Sachet', kategori: 'Bumbu Dapur', harga: 500, stok: 80, gambar: 'assets/masako.png' },
    { id: 24, nama: 'Kecap 1 Sachet', kategori: 'Bumbu Dapur', harga: 1000, stok: 55, gambar: 'assets/kecap.jpg' },
    { id: 25, nama: 'MSG 1 Sachet', kategori: 'Bumbu Dapur', harga: 1000, stok: 48, gambar: 'assets/msg_sasa.webp' },
    { id: 26, nama: 'Ladaku 1 Sachet', kategori: 'Bumbu Dapur', harga: 1000, stok: 42, gambar: 'assets/ladaku.webp' },
    { id: 27, nama: 'Ketumbar 1 Sachet', kategori: 'Bumbu Dapur', harga: 1500, stok: 30, gambar: 'assets/ketumbar.webp' },
    { id: 28, nama: 'Saos 1 Sachet', kategori: 'Bumbu Dapur', harga: 500, stok: 60, gambar: 'assets/saos.webp' },
    { id: 29, nama: 'Jahe 1/4', kategori: 'Bumbu Dapur', harga: 2000, stok: 16, gambar: 'assets/jahe.jpg' },
    { id: 30, nama: 'Kemiri 1/4', kategori: 'Bumbu Dapur', harga: 3000, stok: 12, gambar: 'assets/kemiri.jpg' },
    { id: 31, nama: 'Lengkuas 1/4', kategori: 'Bumbu Dapur', harga: 2000, stok: 14, gambar: 'assets/lengkuas.jpg' },
    { id: 32, nama: 'Kencur 1/4', kategori: 'Bumbu Dapur', harga: 5000, stok: 5, gambar: 'assets/kencur.webp' },
    { id: 33, nama: 'Mangga 1 Bks', kategori: 'Rokok', harga: 12000, stok: 11, gambar: 'assets/roko_mangga.jpg' },
    { id: 34, nama: 'Filter 1 Bks', kategori: 'Rokok', harga: 23000, stok: 9, gambar: 'assets/roko_filter.webp' },
    { id: 35, nama: 'Camel Kretek', kategori: 'Rokok', harga: 20000, stok: 10, gambar: 'assets/roko_camel.webp' },
    { id: 36, nama: 'Djarum 76 Apel', kategori: 'Rokok', harga: 16000, stok: 13, gambar: 'assets/roko_apel.webp' },
    { id: 37, nama: 'Esse Bana Pop', kategori: 'Rokok', harga: 30000, stok: 4, gambar: 'assets/roko_esse.jpg' },
    { id: 38, nama: 'Teh Pucuk', kategori: 'Makanan & Minuman', harga: 4000, stok: 36, gambar: 'assets/tehpucuk.jpg' },
    { id: 39, nama: 'Fanta 1 Botol', kategori: 'Makanan & Minuman', harga: 5000, stok: 24, gambar: 'assets/fanta.png' },
    { id: 40, nama: 'Sprite 1 Botol', kategori: 'Makanan & Minuman', harga: 5000, stok: 24, gambar: 'assets/sprite.jpg' },
    { id: 41, nama: 'Pocari Sweat', kategori: 'Makanan & Minuman', harga: 8000, stok: 18, gambar: 'assets/pocari.png' },
    { id: 42, nama: 'Floridina 1 Botol', kategori: 'Makanan & Minuman', harga: 6000, stok: 20, gambar: 'assets/floridina.webp' },
    { id: 43, nama: 'Kue 1 Pcs', kategori: 'Makanan & Minuman', harga: 1000, stok: 50, gambar: 'assets/kue.webp' },
    { id: 44, nama: 'Kue Aoka', kategori: 'Makanan & Minuman', harga: 2500, stok: 32, gambar: 'assets/aoka.jpg' },
    { id: 45, nama: 'Kue Kering 1 Pak', kategori: 'Makanan & Minuman', harga: 3000, stok: 21, gambar: 'assets/kue_kering.webp' },
    { id: 46, nama: 'Roma Kelapa', kategori: 'Makanan & Minuman', harga: 11000, stok: 15, gambar: 'assets/roma.webp' },
    { id: 47, nama: 'Ciki 1 Pcs', kategori: 'Makanan & Minuman', harga: 500, stok: 70, gambar: 'assets/ciki.jpg' },
    { id: 48, nama: 'Buku Tulis 1 Pcs', kategori: 'Alat Tulis Sekolah', harga: 3000, stok: 44, gambar: 'assets/buku_tulis.jpg' },
    { id: 49, nama: 'Buku Gambar', kategori: 'Alat Tulis Sekolah', harga: 2500, stok: 26, gambar: 'assets/buku_gambar.jpeg' },
    { id: 50, nama: 'Penggaris 1 Pcs', kategori: 'Alat Tulis Sekolah', harga: 1500, stok: 33, gambar: 'assets/penggaris.jpg' },
    { id: 51, nama: 'Penghapus 1 Pcs', kategori: 'Alat Tulis Sekolah', harga: 1500, stok: 38, gambar: 'assets/penghapus.jpg' },
    { id: 52, nama: 'Pulpen 1 Pcs', kategori: 'Alat Tulis Sekolah', harga: 2000, stok: 47, gambar: 'assets/pulpen.webp' },
    { id: 53, nama: 'Pensil Warna Pak', kategori: 'Alat Tulis Sekolah', harga: 12000, stok: 8, gambar: 'assets/pensil.webp' },
    { id: 54, nama: 'Lem 1 Pcs', kategori: 'Alat Tulis Sekolah', harga: 1500, stok: 29, gambar: 'assets/lem.jpeg' },
    { id: 55, nama: 'Tipex 1 Pcs', kategori: 'Alat Tulis Sekolah', harga: 3000, stok: 19, gambar: 'assets/tipe_x.jpg' }
  ];

  function read(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (e) { return fallback; }
  }
  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function loadProducts() {
    var list = read(PRODUCTS_KEY, null);
    if (!list || !list.length) {
      list = SEED_PRODUCTS.map(function (p) { return Object.assign({}, p); });
      write(PRODUCTS_KEY, list);
    }
    return list;
  }
  function saveProducts(list) { write(PRODUCTS_KEY, list); }
  function resetProducts() { write(PRODUCTS_KEY, SEED_PRODUCTS.map(function (p) { return Object.assign({}, p); })); return loadProducts(); }
  function loadOrders() { return read(ORDERS_KEY, []); }
  function saveOrders(list) { write(ORDERS_KEY, list); }
  function loadUsers() { return read(USERS_KEY, []); }
  function saveUsers(list) { write(USERS_KEY, list); }
  function loadCart() { return read(CART_KEY, []); }
  function saveCart(list) { write(CART_KEY, list); }
  function escapeHTML(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function formatRupiah(n) {
    n = Number(n) || 0;
    return 'Rp ' + n.toLocaleString('id-ID');
  }
  function validateProduct(p) {
    var errors = [];
    if (!p.nama || String(p.nama).trim().length < 2) errors.push('Nama produk minimal 2 karakter.');
    if (!p.nama || String(p.nama).length > 80) errors.push('Nama produk maksimal 80 karakter.');
    if (CATEGORIES.indexOf(p.kategori) === -1) errors.push('Kategori tidak dikenal.');
    if (!Number.isInteger(Number(p.harga)) || Number(p.harga) <= 0 || Number(p.harga) > 10000000) errors.push('Harga harus angka bulat 1 - 10.000.000.');
    if (!Number.isInteger(Number(p.stok)) || Number(p.stok) < 0 || Number(p.stok) > 10000) errors.push('Stok harus angka bulat 0 - 10.000.');
    if (p.gambar && String(p.gambar).length > 300) errors.push('URL gambar terlalu panjang.');
    if (p.gambar && /["'<>]/.test(String(p.gambar))) errors.push('URL gambar mengandung karakter terlarang.');
    return { ok: errors.length === 0, errors: errors };
  }

  function nextProductId(list) {
    var max = 0;
    list.forEach(function (p) { if (p.id > max) max = p.id; });
    return max + 1;
  }

  function downloadCSV(filename, rows) {
    var csv = rows.map(function (row) {
      return row.map(function (cell) {
        var s = String(cell == null ? '' : cell);
        if (/[;"\n]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';
        return s;
      }).join(';');
    }).join('\n');
    var blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  window.TokoStore = {
    CATEGORIES: CATEGORIES,
    SEED_PRODUCTS: SEED_PRODUCTS,
    loadProducts: loadProducts, saveProducts: saveProducts, resetProducts: resetProducts,
    loadOrders: loadOrders, saveOrders: saveOrders,
    loadUsers: loadUsers, saveUsers: saveUsers,
    loadCart: loadCart, saveCart: saveCart,
    escapeHTML: escapeHTML, formatRupiah: formatRupiah,
    validateProduct: validateProduct, nextProductId: nextProductId,
    downloadCSV: downloadCSV,
    KEYS: { PRODUCTS_KEY: PRODUCTS_KEY, ORDERS_KEY: ORDERS_KEY, USERS_KEY: USERS_KEY, CART_KEY: CART_KEY }
  };
})();