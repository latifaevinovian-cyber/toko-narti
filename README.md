# Toko Kelontong Hj. Narti — Aplikasi Web (Tugas Besar Cyber Security)

Toko kelontong Hj. Narti, Dusun Bunikerta, Galaherang, Maleber, Kuningan.
Web siap pakai: katalog, keranjang, checkout WhatsApp, login, CRUD,
dashboard, dan laporan ekspor CSV / cetak PDF.

> **Kejujuran teknis:** versi ini memakai **localStorage browser**
> sebagai database, hashing SHA-256 + salt. Ini **bukan PostgreSQL**.
> Rencana migrasi ke **Supabase PostgreSQL** ada di laporan.

## Fitur

- **Login** — email + password (min. 8 karakter, huruf + angka),
  hashing SHA-256 + salt, sesi 2 jam. Peran: `admin` dan `pelanggan`.
- **Katalog** — 55 produk asli (6 kategori), pencarian, filter, stok.
- **Keranjang & checkout** — tambah/kurang/hapus, checkout menyimpan
  pesanan, mengurangi stok, membuka WhatsApp otomatis.
- **CRUD produk (admin)** — tambah, lihat, ubah, hapus, validasi.
- **Dashboard (admin)** — total produk, pesanan, omzet, stok menipis,
  grafik omzet, pesanan terbaru + ubah status.
- **Laporan** — Ekspor CSV Produk, Ekspor CSV Pesanan, Cetak / PDF.
- **Keamanan** — escape HTML (cegah XSS), validasi input, rate limiting
  login 5x gagal kunci 60 detik, kontrol akses + IDOR, security headers
  di `vercel.json`, secret di env var (lihat `.env.example`).

## Teknologi

- Frontend: HTML + CSS (Plus Jakarta Sans) + JavaScript murni.
- Database: `localStorage`. Lanjutan: Supabase (PostgreSQL + Auth).
- Hosting: Vercel (utama, HTTPS) atau GitHub Pages (cadangan).
  URL aplikasi: isi setelah deploy
  (`https://latifaevinovian-cyber.github.io/toko-narti/`)
- Repository: `https://github.com/latifaevinovian-cyber/toko-narti`

## Akun Demo (untuk dosen)

| Peran | Email | Password |
|---|---|---|
| Admin | `admin@tokonarti.id` | `Admin1234` |
| Pelanggan | `user@toko.id` | `User1234` |

Akun dibuat otomatis saat pertama kali aplikasi dibuka.

## Cara Menjalankan Lokal

1. Salin folder ini ke `C:\xampp\htdocs\toko_kelontong_HjNarti`
   (**jangan hapus folder `assets/`**).
2. Buka di Visual Studio Code, klik kanan `index.html` →
   **Open with Live Server**.
3. Daftar di `register.html`, atau login dengan akun demo di atas.

## Cara Deploy

**Vercel:** push ke GitHub, vercel.com → Import `toko-narti`,
Framework **Other**, Deploy. Simpan URL-nya untuk laporan.
**GitHub Pages:** Settings → Pages → branch `main` → folder `/ (root)`.

## Environment Variable

Lihat `.env.example`. Salin jadi `.env` di lokal (sudah masuk
`.gitignore`), di Vercel lewat dashboard. Tidak ada secret di repo.

## Penggunaan AI

**Alat:** Muse (Meta) — merancang, menulis kode, debugging, dokumentasi.
**Dibantu:** arsitektur localStorage + migrasi Supabase, `store.js` /
`auth.js` / `app.js` / `admin.js`, login/register/admin, dashboard +
ekspor CSV, `vercel.json`, README, laporan, self-testing.
**Prompt utama:** "Bangun paket darurat untuk Latifa, deadline 23:00 WIB
17 Nov 2026. Web lama Toko Narti, 55 produk asli. Buat login, CRUD,
dashboard, ekspor CSV/PDF, hashing + rate limiting + proteksi admin,
jalan dengan localStorage, jangan klaim palsu PostgreSQL."
**Verifikasi:** kode dibaca ulang, diuji di Live Server (daftar → login →
CRUD → checkout → dashboard → ekspor → cetak). Secret tidak pernah
dimasukkan ke prompt.

## Self-Testing

7 skenario (detail di laporan bagian 10): SQL Injection, XSS, kontrol
akses admin, IDOR pesanan, password lemah, rate limiting login,
sesi/logout, HTTPS + headers, secret tidak ter-commit. Diuji manual
di browser + securityheaders.com.
