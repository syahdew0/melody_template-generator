# Dokumen User Story Detail — Multi-tenant Website ID

| | |
|---|---|
| **No Dokumen** | `___/USD/PSG-IT/2026/VIII/___` *(belum ditetapkan)* |
| **Tanggal** | 27 Agustus 2026 |

## ● Identitas User Story

| | |
|---|---|
| **Nama Proyek** | Meolody CMS — Multi-tenant Website ID 1.0 |
| **Product** | Meolody CMS |
| **Versi** | 1.0 |
| **Tanggal** | 27 Agustus 2026 |
| **Pemilik Dokumen** | IT |
| **PIC** | *(belum ditetapkan)* |
| **Acuan Arsitektur** | [ARSITEKTUR-TARGET-MULTITENANT.md](ARSITEKTUR-TARGET-MULTITENANT.md) |
| **Kondisi Sekarang** | [ARSITEKTUR.md](ARSITEKTUR.md) |

---

## ● Ruang Lingkup & Batasan

Dokumen ini menurunkan [ARSITEKTUR-TARGET-MULTITENANT.md](ARSITEKTUR-TARGET-MULTITENANT.md) menjadi user story yang siap dikerjakan. Tiga keputusan yang mengunci seluruh isi dokumen:

| Aspek | Keputusan |
|---|---|
| Cakupan | Konten & tampilan — **10 tabel** mendapat `website_id`. Produk, order, wallet, MLM, listing tetap global. Fase E menambahkan perbaikan korektif dompet, **tanpa** mengubah cakupan tenancy. |
| Penentuan tenant | Dari subdomain (via header `Origin`/`Host`), bukan switcher di UI. |
| Penegakan isolasi | Bertahap — Fase 1–2 backend percaya parameter, Fase 3 backend menegakkan. |

**Yang termasuk:** master data website, penambahan kolom `website_id`, backfill, middleware resolusi & isolasi tenant, pembersihan hardcode frontend, serta perbaikan korektif modul dompet (Fase E).

**Yang tidak termasuk:** penandaan tenant (`website_id`) pada modul produk, order, dompet, MLM, dan listing. Modul-modul itu tetap global. Perubahan cakupan tenancy memerlukan revisi dokumen arsitektur lebih dulu.

**Catatan tentang Fase E.** Fase A–D menurunkan dokumen arsitektur. Fase E tidak: ia lahir dari pembacaan kode modul dompet pada 28 Agustus 2026, yang menemukan lima cacat — dua di antaranya membuat saldo dapat menjadi negatif. Cacat tersebut **tidak berhubungan dengan tenancy** dan tidak memerlukan kolom `website_id`. Fase E dimasukkan ke dokumen ini karena modul dompet ikut dijual bersama CMS, dan tidak ada dokumen lain yang menampungnya. Fase E boleh dikerjakan paralel dengan Fase A–D. Rujukan arsitektur: [ARSITEKTUR-TARGET-MULTITENANT.md §10 Fase 4](ARSITEKTUR-TARGET-MULTITENANT.md).

**Catatan tentang Audit Trail.** Sistem ini **belum memiliki tabel log terpusat** seperti `user_logs`. Sebagian tabel punya kolom `created_by` / `updated_by`, sebagian tidak. Acceptance criteria di bawah karena itu tidak mensyaratkan pencatatan audit, kecuali disebut eksplisit. Pengadaan audit log terpusat diusulkan sebagai dokumen terpisah — lihat [Pertanyaan Terbuka](#-pertanyaan-terbuka) nomor 5.

---

## ● Daftar Fitur

| Fase | No | Judul |
|---|---|---|
| **A. Fondasi** | 1 | Konsolidasi Model `Setting` |
| | 2 | Kolom Identitas Domain pada Website |
| **B. Master Data Website** | 3 | Melihat Daftar Website |
| | 4 | Membuat Website Baru |
| | 5 | Mengubah Data Website |
| | 6 | Menghapus Website |
| | 7 | Proteksi Endpoint Website |
| | 8 | Menu Website & Hak Akses Modul |
| | 9 | Pengaturan Situs per Website |
| **C. Penandaan Tenant** | 10 | Migrasi Kolom `website_id` |
| | 11 | Backfill Data Lama ke Website Default |
| | 12 | Menyimpan `website_id` saat Membuat Data |
| | 13 | Memfilter Daftar Berdasarkan Website Aktif |
| **D. Isolasi Tenant** | 14 | Resolusi Tenant dari Origin / Host |
| | 15 | Penegakan Isolasi Data |
| | 16 | Penolakan Akses Lintas Tenant |
| | 17 | Pembersihan Hardcode `website_id` di Frontend |
| | 18 | Penanganan Tenant Tidak Dikenal & Nonaktif |
| **E. Perbaikan Dompet** | 19 | Perbaikan Guard Saldo pada Pembayaran Order |
| | 20 | Satu Sumber Kebenaran Saldo |
| | 21 | Penyeragaman Aturan Status pada Perhitungan Saldo |
| | 22 | Pengaktifan Cron Snapshot Saldo Harian |
| | 23 | Pembersihan Kode Dompet yang Tidak Terpakai |

---
---

# FASE A — FONDASI

## (1) Konsolidasi Model `Setting`

**Aktor:** Sistem / Developer

**Prasyarat:** Tidak ada. Ini pekerjaan pertama sebelum fase mana pun dimulai.

**Deskripsi (User Story):** Sebagai Sistem, Saya ingin hanya ada satu model bernama `Setting` yang terdaftar dan satu tabel setelan yang dipakai, Agar setelan logo dan setelan transaksi tidak berebut ruang kunci pada tabel yang sama, dan perilaku sistem tidak berbeda antara lingkungan macOS dan Linux.

### Detail Teknis & Alur Sistem

- **File Terkait:** `admin-be/models/setting.js`, `admin-be/models/logoSettings.js`, `admin-be/models/index.js`
- **Controller Terdampak:** `settingLogoController.js`, `settingTransaksiController.js`
- **Tabel Terkait:** `settings`, `Settings`

### Acceptance Criteria (Kriteria Penerimaan)

a. **Identifikasi Kondisi Awal (Verifikasi Masalah)**
- Sistem memuat model dengan pola `db[model.name] = model` di `models/index.js`.
- Dua file mendaftarkan nama model yang sama: `logoSettings.js` (`tableName: 'settings'`) dan `setting.js` (tanpa `tableName`, sehingga default menjadi `Settings`).
- Karena urutan pemuatan alfabetis, `setting.js` menimpa `logoSettings.js`. Hasil verifikasi wajib menunjukkan `db.Setting.getTableName()` bernilai `Settings`.

b. **Penetapan Tabel Tunggal**
- Tim menetapkan **satu** tabel setelan yang sah, yaitu `settings` (huruf kecil).
- Tabel `Settings` (huruf besar) dinyatakan tidak dipakai setelah migrasi data selesai.

c. **Pemisahan Namespace Kunci**
- Karena dua controller berbeda menulis ke tabel yang sama dengan kolom `key` datar, sistem wajib menambahkan pembeda.
- Ditambahkan kolom `group` (`VARCHAR`, `NOT NULL`, default `'general'`) dengan nilai minimal: `logo`, `transaksi`.
- Dibuat unique index komposit pada `(group, key)`.

d. **Migrasi Data Existing**
- Migration memindahkan seluruh baris dari `Settings` ke `settings` dengan mengisi `group` sesuai asal kunci.
- Jika ditemukan kunci yang sama pada dua group, keduanya tetap disimpan sebagai baris terpisah.
- Migration menyediakan `down()` yang mengembalikan data ke kondisi semula.

e. **Pembaruan Model & Controller**
- `models/logoSettings.js` dan `models/setting.js` digabung menjadi satu file model dengan `tableName: 'settings'`.
- `settingLogoController.js` menambahkan filter `group = 'logo'` pada seluruh query.
- `settingTransaksiController.js` menambahkan filter `group = 'transaksi'` pada seluruh query.

f. **Alur Lanjutan (Post-Condition)**
- Verifikasi ulang wajib menunjukkan `db.Setting.getTableName()` bernilai `settings`.
- Tidak ada lagi dua file model yang mendaftarkan nama model identik.
- Fase A nomor 2 baru boleh dimulai setelah kriteria ini terpenuhi.

---

## (2) Kolom Identitas Domain pada Website

**Aktor:** Sistem / Developer

**Prasyarat:** User Story (1) telah selesai.

**Deskripsi (User Story):** Sebagai Sistem, Saya ingin tabel `websites` memiliki kolom `domain` dan `is_active`, Agar setiap tenant dapat dikenali dari host pemanggil dan dapat dinonaktifkan tanpa harus menghapus datanya.

### Detail Teknis & Alur Sistem

- **Tabel Terkait:** `websites`
- **Model:** `Website` (`admin-be/models/website.js`)
- **Kondisi Awal:** kolom yang ada — `name`, `user_id`, `subdomain`, `site_title`, `title`, `site_description`, `admin_email`, `logo`, `seo_keywords`, `seo_description`, `rate`

### Acceptance Criteria (Kriteria Penerimaan)

a. **Penambahan Kolom Baru**
- Migration menambahkan kolom pada tabel `websites`:

  `domain`: `VARCHAR(255)`, `NULL`, `UNIQUE` — menyimpan host lengkap (contoh: `psggroup.id`).

  `is_active`: `BOOLEAN`, `NOT NULL`, default `true`.

b. **Penguatan Kolom `subdomain`**
- Kolom `subdomain` yang sudah ada dijadikan `UNIQUE`.
- Sebelum menerapkan constraint, migration wajib memeriksa duplikasi. Jika ditemukan duplikat, migration dibatalkan dengan pesan jelas dan data diperbaiki manual lebih dulu.
- Nilai `subdomain` dinormalisasi menjadi huruf kecil.

c. **Alasan Kolom `domain` Terpisah dari `subdomain`**
- Kolom `subdomain` yang ada hanya menyimpan potongan nama (contoh: `default`, `psggroup`), sehingga tidak cukup untuk mencocokkan header `Origin` atau `Host` yang berisi host lengkap.
- Kedua kolom dipertahankan: `subdomain` untuk identitas internal, `domain` untuk pencocokan request.

d. **Pengisian Nilai Awal**
- Baris `websites` yang sudah ada diisi `is_active = true`.
- Kolom `domain` dibiarkan `NULL` dan diisi manual oleh admin melalui form pada User Story (5).

e. **Rollback**
- Migration menyediakan `down()` yang menghapus kedua kolom baru dan mencabut unique constraint pada `subdomain`.

f. **Alur Lanjutan (Post-Condition)**
- Model `Website` diperbarui agar memuat `domain` dan `is_active`.
- Kedua kolom masuk ke daftar kolom yang boleh ditulis pada User Story (4) dan (5).

---
---

# FASE B — MASTER DATA WEBSITE

## (3) Melihat Daftar Website

**Aktor:** Admin

**Prasyarat:** Pengguna sudah login dan memiliki hak akses `canView` pada modul Website.

**Deskripsi (User Story):** Sebagai Admin, Saya ingin melihat daftar seluruh website beserta ID, subdomain, domain, dan tema aktifnya, Agar saya mengetahui tenant apa saja yang dikelola panel ini dan `website_id` mana yang dipakai oleh setiap konten.

### Detail Teknis & Endpoint

- **Halaman (UI):** `/admin/websites`
- **Komponen:** `admin-fe/src/views/website/WebsiteList.vue`
- **Endpoint:** `GET /api/admin/websites`
- **Controller:** `websiteController.getAllWebsites`
- **Tabel Terkait:** `websites`, `themes`

### Acceptance Criteria (Kriteria Penerimaan)

a. **Validasi Hak Akses (Authorization)**
- Request wajib menyertakan header `Authorization: Bearer <token>` yang valid.
- Sistem memvalidasi hak akses `canView` pada modul `Website` melalui `requireModulePermission`.
- Role dengan nama `admin`, `super admin`, `superadmin`, atau `administrator` lolos otomatis.
- Jika tidak berhak, sistem mengembalikan `403 Forbidden`.

b. **Pengambilan Data (Data Fetching)**
- Sistem menjalankan `Website.findAll` dengan `include` model `Theme` (alias `themes`), diurutkan `ORDER BY id DESC`.
- Response berbentuk `{ success: true, websites: [...] }`.

c. **Kolom yang Ditampilkan (UI Display)**
- Tabel menampilkan: **ID**, **Nama**, **Subdomain**, **Domain**, **Judul Situs**, **Tema Aktif**, dan **Status**.
- Kolom ID ditampilkan sebagai badge monospace, karena nilainya adalah `website_id` yang dirujuk seluruh tabel konten.
- Kolom Tema Aktif menampilkan nama tema dengan `is_active = true`. Jika tidak ada tema aktif namun tenant memiliki tema, tampilkan keterangan jumlah tema.
- Kolom Status menampilkan badge `Aktif` / `Nonaktif` berdasarkan `is_active`.

d. **Penanganan Keadaan Kosong & Gagal**
- Selama request berjalan, tabel menampilkan baris "Memuat data…".
- Jika tidak ada data, tampilkan "Belum ada website."
- Jika request gagal, tampilkan pesan dari `err.response.data.message`, atau pesan baku "Gagal memuat daftar website."

e. **Aksi per Baris**
- Setiap baris menyediakan tautan **Edit** menuju `/admin/websites/:id`.
- Tombol **Hapus** hanya tampil bila role memiliki `canDelete` pada modul Website.

f. **Alur Lanjutan (Post-Condition)**
- Halaman menyediakan tombol **+ Tambah Website** yang mengarah ke `/admin/websites/create`, tampil hanya bila role memiliki `canAdd`.

---

## (4) Membuat Website Baru

**Aktor:** Admin

**Prasyarat:** Pengguna memiliki hak akses `canAdd` pada modul Website.

**Deskripsi (User Story):** Sebagai Admin, Saya ingin mendaftarkan website baru beserta subdomain dan domainnya, Agar tenant tersebut dapat mulai menampung konten dan dikenali oleh sistem saat request masuk.

### Detail Teknis & Endpoint

- **Halaman (UI):** `/admin/websites/create`
- **Komponen:** `admin-fe/src/views/website/WebsiteForm.vue`
- **Method Akses Form:** `GET` (menampilkan form)
- **Method Submit Data:** `POST /api/admin/websites`
- **Payload (Form Fields):** `name`, `subdomain`, `domain`, `user_id`, `site_title`, `title`, `site_description`, `admin_email`, `logo`, `seo_keywords`, `seo_description`, `rate`, `is_active`
- **Tabel Terkait:** `websites`, `Users`

### Acceptance Criteria (Kriteria Penerimaan)

a. **Validasi Input Data (Frontend & Backend)**
- Sistem memastikan kelengkapan field wajib: `name` dan `subdomain`.
- `subdomain` dinormalisasi menjadi huruf kecil dan hanya menerima karakter `a-z`, `0-9`, dan tanda hubung (`-`).
- `subdomain` tidak boleh diawali atau diakhiri tanda hubung.
- `domain` (jika diisi) dinormalisasi menjadi huruf kecil dan divalidasi sebagai hostname yang sah, tanpa skema `http://` dan tanpa garis miring.
- `admin_email` (jika diisi) divalidasi sebagai alamat email.
- `user_id` yang bernilai string kosong dikonversi menjadi `NULL` sebelum dikirim, karena kolomnya bertipe `INTEGER`.

b. **Pengecekan Duplikasi (Database Validasi)**
- Sistem melakukan `SELECT` ke tabel `websites` berdasarkan `subdomain` yang diinput.
- Jika ditemukan, proses dibatalkan dengan `409 Conflict` dan pesan: "Subdomain sudah dipakai website lain."
- Pemeriksaan yang sama dilakukan untuk `domain` bila diisi, dengan pesan: "Domain sudah dipakai website lain."

c. **Whitelist Kolom (Mass Assignment Protection)**
- Controller **tidak** menerima `req.body` apa adanya. Hanya kolom yang terdaftar pada konstanta `WRITABLE_FIELDS` yang diambil.
- Kolom `id`, `created_at`, dan `updated_at` tidak dapat disentuh dari body request.
- Alasan: implementasi lama hanya melakukan destructuring `{ name, user_id, subdomain }`, sehingga 8 dari 11 kolom diabaikan diam-diam saat form dikirim.

d. **Proses Penyimpanan**
- Jika seluruh validasi lolos, sistem melakukan `INSERT` ke tabel `websites`.
- Kolom `is_active` diisi `true` bila tidak dikirim.
- Response sukses berbentuk `{ success: true, website: {...} }`.

e. **Penanganan Kegagalan**
- Kegagalan validasi mengembalikan `400 Bad Request` beserta pesan spesifik per field.
- Kegagalan duplikasi mengembalikan `409 Conflict`.
- Pesan error ditampilkan di banner atas form, bukan hanya di console.

f. **Alur Lanjutan (Post-Condition)**
- Setelah sukses, sistem mengarahkan pengguna kembali ke `/admin/websites`.
- Website baru muncul di urutan teratas daftar karena pengurutan `id DESC`.
- Website baru **belum** memiliki tema; pembuatan tema dilakukan terpisah lewat modul Tema.

---

## (5) Mengubah Data Website

**Aktor:** Admin

**Prasyarat:** Pengguna memiliki hak akses `canEdit` pada modul Website.

**Deskripsi (User Story):** Sebagai Admin, Saya ingin mengubah data website yang sudah ada, termasuk identitas, tampilan, dan SEO-nya, Agar informasi tenant tetap akurat tanpa harus membuat ulang datanya.

### Detail Teknis & Endpoint

- **Halaman (UI):** `/admin/websites/:id`
- **Komponen:** `admin-fe/src/views/website/WebsiteForm.vue` (mode edit)
- **Method Akses Form:** `GET /api/admin/websites/:id`
- **Method Submit Data:** `PUT /api/admin/websites/:id`
- **Tabel Terkait:** `websites`, `Users`

### Acceptance Criteria (Kriteria Penerimaan)

a. **Pemuatan Data Awal (Load)**
- Saat halaman dibuka, sistem menjalankan `GET /api/admin/websites/:id`.
- Seluruh field form diisi dari response. Nilai `NULL` dikonversi menjadi string kosong agar input tidak menampilkan teks `null`.
- Jika website tidak ditemukan, tampilkan `404` beserta pesan "Website not found".
- Halaman menampilkan badge `website_id: {id}` agar admin tahu ID yang sedang disunting.

b. **Pengelompokan Field pada Antarmuka**
- Form dibagi menjadi empat blok: **Identitas** (`name`, `subdomain`, `domain`, `user_id`, `is_active`), **Tampilan Situs** (`site_title`, `title`, `site_description`, `logo`), **SEO** (`seo_keywords`, `seo_description`), dan **Lainnya** (`admin_email`, `rate`).
- Kolom `logo` menampilkan pratinjau gambar. Jika URL gagal dimuat, tampilkan peringatan tanpa membatalkan form.

c. **Validasi Perubahan Subdomain & Domain**
- Jika `subdomain` diubah, sistem memeriksa duplikasi terhadap website lain. Nilai yang tidak berubah tidak dianggap duplikat.
- Aturan yang sama berlaku untuk `domain`.
- Jika bentrok, kembalikan `409 Conflict`.

d. **Whitelist Kolom & Eksekusi Update**
- Controller memakai `WRITABLE_FIELDS` yang sama dengan User Story (4).
- Field yang tidak dikirim di body **tidak** ditimpa menjadi `NULL`, sehingga update parsial tetap aman.
- Sistem melakukan `UPDATE` pada baris terkait.

e. **Peringatan Dampak Perubahan**
- Jika `subdomain` atau `domain` diubah pada website yang statusnya sedang dipakai, UI menampilkan konfirmasi: "Mengubah domain akan memutus resolusi tenant dari host lama. Lanjutkan?"

f. **Alur Lanjutan (Post-Condition)**
- Setelah sukses, pengguna diarahkan ke `/admin/websites`.
- Perubahan `is_active = false` membuat tenant ditolak pada resolusi tenant — lihat User Story (18).

---

## (6) Menghapus Website

**Aktor:** Admin

**Prasyarat:** Pengguna memiliki hak akses `canDelete` pada modul Website.

**Deskripsi (User Story):** Sebagai Admin, Saya ingin menghapus website yang sudah tidak dipakai, Agar daftar tenant tetap bersih — namun sistem harus mencegah penghapusan bila website tersebut masih memiliki konten, agar tidak ada data yang menjadi yatim.

### Detail Teknis & Endpoint

- **Halaman (UI):** `/admin/websites` (tombol Hapus per baris)
- **Method:** `DELETE /api/admin/websites/:id`
- **Tabel Terkait:** `websites`, `posts`, `categories`, `themes`, ditambah 10 tabel dari User Story (10)

### Acceptance Criteria (Kriteria Penerimaan)

a. **Konfirmasi di Antarmuka**
- Sebelum request dikirim, UI menampilkan dialog konfirmasi memuat nama website: "Hapus {nama}? Tindakan ini tidak bisa dibatalkan."

b. **Validasi Keberadaan Data**
- Sistem melakukan `SELECT` berdasarkan `id`. Jika tidak ditemukan, kembalikan `404`.

c. **Pengecekan Keterikatan Data (Referential Guard)**
- Sebelum menghapus, sistem menghitung jumlah baris yang merujuk ke `website_id` tersebut pada seluruh tabel tenant-aware: `posts`, `categories`, `themes`, dan 10 tabel dari User Story (10).
- Pemeriksaan ini **wajib**, karena tidak ada foreign key constraint di level database yang mencegah data menjadi yatim.
- Jika total lebih dari 0, proses dibatalkan dengan `409 Conflict` dan pesan yang menyebut jumlah serta nama tabel terkait. Contoh: "Website masih dipakai 42 konten pada tabel posts, themes. Pindahkan atau hapus kontennya dulu."

d. **Eksekusi Penghapusan**
- Jika seluruh pengecekan lolos, sistem menjalankan `destroy()` pada baris tersebut.
- Response sukses: `{ success: true, message: 'Website deleted' }`.

e. **Alternatif yang Disarankan**
- Pada pesan penolakan, UI menyarankan menonaktifkan website (`is_active = false`) sebagai alternatif dari penghapusan.

f. **Alur Lanjutan (Post-Condition)**
- Daftar website dimuat ulang secara otomatis.
- Jika gagal, pesan penolakan tampil di banner atas daftar dan baris tidak hilang.

---

## (7) Proteksi Endpoint Website

**Aktor:** Sistem

**Prasyarat:** Tidak ada.

**Deskripsi (User Story):** Sebagai Sistem, Saya ingin endpoint tulis pada modul Website hanya dapat diakses oleh pengguna terautentikasi, Agar tidak ada pihak luar yang dapat membuat, mengubah, atau menghapus website tanpa login.

### Detail Teknis & Alur Sistem

- **File Terkait:** `admin-be/routes/websiteRoutes.js`, `admin-be/server.js`
- **Middleware:** `requireAuth` pada `admin-be/middlewares/authMiddleware.js`

### Acceptance Criteria (Kriteria Penerimaan)

a. **Identifikasi Kondisi Awal (Verifikasi Masalah)**
- Router `/api/admin/websites` di-mount pada `server.js` **sebelum** baris `app.use('/api', requireAuth)`.
- Akibatnya seluruh operasi CRUD-nya dapat diakses tanpa token. Verifikasi wajib membuktikan bahwa `POST /api/admin/websites` tanpa header `Authorization` berhasil membuat data.

b. **Penerapan Middleware per Route**
- `requireAuth` dipasang langsung pada definisi route `POST /`, `PUT /:id`, dan `DELETE /:id`.
- Penerapan dilakukan per-route, **bukan** dengan memindahkan mount ke bawah `requireAuth`.

c. **Alasan Mount Tidak Boleh Dipindah**
- Router yang sama memuat `GET /public/:id/settings` yang memang harus dapat diakses tanpa autentikasi oleh frontend publik.
- Memindahkan seluruh mount ke bawah `requireAuth` akan memutus endpoint publik tersebut.
- Komentar penjelas wajib ditulis di dalam file route agar developer berikutnya tidak salah memperbaiki.

d. **Keputusan atas Endpoint Baca**
- `GET /` dan `GET /:id` untuk sementara dibiarkan terbuka.
- Catatan risiko: `GET /:id` mengembalikan kolom `admin_email`. Penutupan endpoint ini menunggu keputusan pada [Pertanyaan Terbuka](#-pertanyaan-terbuka) nomor 2.

e. **Verifikasi Hasil**
- Request `POST`, `PUT`, dan `DELETE` tanpa token wajib mengembalikan `401` dengan pesan "Token tidak ditemukan".
- Request dengan token kedaluwarsa mengembalikan `401` dengan pesan "Token tidak valid".
- Request dengan token valid berjalan normal dan menerima header respons `x-refreshed-token`.

f. **Alur Lanjutan (Post-Condition)**
- Frontend memanggil seluruh endpoint ini melalui instance axios `api` dari `admin-fe/src/config/api.js`, bukan `axios` polos, agar token otomatis tersisip dan token hasil refresh otomatis tersimpan.

---

## (8) Menu Website & Hak Akses Modul

**Aktor:** Admin / Super Admin

**Prasyarat:** Tabel `Modules` dan `RoleActiveModules` sudah terisi.

**Deskripsi (User Story):** Sebagai Super Admin, Saya ingin menu Website muncul di sidebar dan tunduk pada pengaturan hak akses per role, Agar hanya role yang berwenang yang dapat melihat dan mengelola data tenant.

### Detail Teknis & Endpoint

- **Lokasi Menu:** Sidebar → **Setting** → **Website**
- **Komponen:** `admin-fe/src/components/SidebarPage.vue`
- **Router:** `admin-fe/src/router/index.js`
- **Tabel Terkait:** `Modules`, `RoleActiveModules`, `roles`

### Acceptance Criteria (Kriteria Penerimaan)

a. **Pendaftaran Modul Baru**
- Seeder menambahkan satu baris pada tabel `Modules` dengan `name = 'Website'` dan deskripsi yang sesuai.
- Seeder bersifat idempotent: menjalankannya dua kali tidak menghasilkan baris ganda.

b. **Pendaftaran Rute Frontend**
- Tiga rute ditambahkan pada `router/index.js`, seluruhnya dengan `meta: { requiresAuth: true }`:

  `/admin/websites` → `WebsiteList`

  `/admin/websites/create` → `WebsiteCreate`

  `/admin/websites/:id` → `WebsiteEdit` (dengan `props: true`)

- Rute `/admin/websites/create` wajib dideklarasikan **sebelum** `/admin/websites/:id`, agar kata `create` tidak tertangkap sebagai parameter `:id`.

c. **Penempatan & Penandaan Menu**
- Item menu **Website** ditempatkan di dalam dropdown **Setting**, tepat di bawah **Site Setting**.
- Item menu ditandai aktif menggunakan `isActivePrefix('/admin/websites')`, sehingga tetap tersorot saat berada di halaman create maupun edit.

d. **Penerapan Hak Akses di Antarmuka**
- Item menu hanya tampil jika role memiliki `canView` pada modul `Website`.
- Tombol **+ Tambah Website** tampil hanya jika `canAdd`.
- Tautan **Edit** tampil hanya jika `canEdit`.
- Tombol **Hapus** tampil hanya jika `canDelete`.
- Role dengan nama `admin` / `super admin` / `superadmin` / `administrator` melihat seluruhnya.

e. **Penegakan di Sisi Backend**
- Penyembunyian elemen di UI tidak dianggap sebagai proteksi. Setiap endpoint tetap memvalidasi hak akses melalui `requireModulePermission`.

f. **Alur Lanjutan (Post-Condition)**
- Setelah modul terdaftar, halaman pengaturan role menampilkan baris **Website** beserta empat kotak centang hak aksesnya.

---

## (9) Pengaturan Situs per Website

**Aktor:** Admin

**Prasyarat:** Website sudah terdaftar dan pengguna memiliki hak akses `canView` / `canEdit` pada modul `Setting`.

**Deskripsi (User Story):** Sebagai Admin, Saya ingin mengelola pengaturan situs (judul, deskripsi, logo, SEO) untuk website tertentu, Agar setiap tenant memiliki identitas tampilan sendiri.

### Detail Teknis & Endpoint

- **Halaman (UI):** `/admin/pengaturan`
- **Komponen:** `admin-fe/src/views/pengaturan/SiteSetting.vue`
- **Endpoint Baca:** `GET /api/admin/websites/:id/settings`
- **Endpoint Simpan:** `PUT /api/admin/websites/:id/settings`
- **Endpoint Publik:** `GET /api/admin/websites/public/:id/settings`
- **Tabel Terkait:** `websites`

### Acceptance Criteria (Kriteria Penerimaan)

a. **Hak Akses Endpoint Admin**
- `GET /:id/settings` sudah dilindungi `requireAuth` dan `requireModulePermission('Setting', 'canView')`.
- `PUT /:id/settings` sudah dilindungi `requireAuth` dan `requireModulePermission('Setting', 'canEdit')`.
- Kondisi ini dipertahankan, tidak diubah.

b. **Perbaikan Whitelist pada Endpoint Simpan**
- Implementasi lama menjalankan `website.update(req.body)` tanpa penyaringan.
- Endpoint wajib memakai `WRITABLE_FIELDS` yang sama dengan User Story (4), agar `id`, `subdomain`, dan `domain` tidak dapat diubah lewat jalur ini.

c. **Perbaikan Endpoint Publik**
- `getSettingsPublic` saat ini mengembalikan `website.favicon`, padahal kolom tersebut **tidak ada** pada model `Website` sehingga selalu bernilai `undefined`.
- Field `favicon` dihapus dari response, atau kolomnya ditambahkan lebih dulu melalui migration terpisah.
- Response publik hanya memuat field aman: `site_title`, `title`, `site_description`, `seo_keywords`, `seo_description`, `logo`. Kolom `admin_email` dan `rate` tidak boleh ikut.

d. **Penggantian Hardcode ID**
- `SiteSetting.vue` saat ini memakai `websiteId: 1` yang ditulis langsung di kode.
- Pada Fase B, nilai ini diganti menjadi parameter yang dipilih admin.
- Pada Fase D, nilai ini dihapus sepenuhnya — lihat User Story (17).

e. **Penanganan Website Tidak Ditemukan**
- Jika `id` tidak ada, kembalikan `404` dengan pesan "Website not found".

f. **Alur Lanjutan (Post-Condition)**
- Perubahan pengaturan langsung terbaca oleh endpoint publik tanpa perlu deploy ulang.

---
---

# FASE C — PENANDAAN TENANT

## (10) Migrasi Kolom `website_id`

**Aktor:** Sistem / Developer

**Prasyarat:** Seluruh user story Fase A dan B telah selesai.

**Deskripsi (User Story):** Sebagai Sistem, Saya ingin seluruh tabel konten dan tampilan memiliki kolom `website_id` beserta indeksnya, Agar setiap baris data dapat diketahui milik tenant yang mana.

### Detail Teknis & Alur Sistem

- **Jumlah Migration:** 10 file, satu per tabel
- **Tabel Terkait (nama sebenarnya di database, bukan nama model):**

| Tabel | Model |
|---|---|
| `menu_groups` | `menu_group` |
| `Media` | `Media` |
| `custom_pages` | `CustomPage` |
| `brands` | `Brand` |
| `icons` | `Icon` |
| `layouts` | `Layout` |
| `settings` | `Setting` |
| `FooterSettings` | `FooterSetting` |
| `FormSettings` | `FormSetting` |
| `newsletter_settings` | `NewsletterSettings` |

### Acceptance Criteria (Kriteria Penerimaan)

a. **Penambahan Kolom & Index**
- Setiap migration menambahkan kolom `website_id` bertipe `INTEGER`, `NULL` (sementara, hingga backfill selesai).
- Setiap kolom disertai index bernama `idx_{tabel}_website_id`.
- Tanpa index, setiap query yang difilter tenant akan melakukan full table scan.

b. **Ketepatan Penulisan Nama Tabel**
- Nama tabel ditulis **persis** seperti yang terdaftar, termasuk huruf besar pada `Media`, `FooterSettings`, dan `FormSettings`.
- Alasan: MySQL pada macOS umumnya case-insensitive terhadap nama tabel, sedangkan pada Linux produksi case-sensitive. Salah huruf besar akan lolos di lokal dan gagal saat deploy.
- `FooterSettings` dan `FormSettings` memakai nama default hasil pluralisasi Sequelize karena model-nya tidak menyetel `tableName`.

c. **Unique Index Komposit untuk Tabel Key-Value**
- Tabel `settings` dan `icons` menyimpan data dalam bentuk pasangan kunci-nilai.
- Setelah `website_id` ditambahkan, unique index diubah menjadi komposit: `(website_id, group, key)` untuk `settings` dan `(website_id, key)` untuk `icons`.
- Tanpa ini, dua tenant tidak dapat memiliki kunci yang sama.

d. **Tabel yang Sengaja Tidak Diberi Kolom**
- `menu_items` **tidak** mendapat `website_id` karena sudah terikat tenant melalui `menu_group_id`.
- `product_details`, `listings`, dan `listing_values` tidak diberi kolom karena sudah terikat melalui `posts.website_id`.
- `post_types`, `product_types`, `listing_types`, `roles`, `Modules`, `Users`, `banks`, `wallet_types`, `transaction_types`, dan `location` tetap global sesuai keputusan cakupan.

e. **Rollback**
- Setiap migration menyediakan `down()` yang menghapus kolom, index, dan mengembalikan unique index ke bentuk semula.

f. **Alur Lanjutan (Post-Condition)**
- Seluruh model Sequelize terkait diperbarui agar memuat atribut `website_id`.
- User Story (11) dijalankan segera setelah migration ini selesai, dalam rilis yang sama.

---

## (11) Backfill Data Lama ke Website Default

**Aktor:** Sistem

**Prasyarat:** User Story (10) telah selesai dijalankan.

**Deskripsi (User Story):** Sebagai Sistem, Saya ingin seluruh baris data yang sudah ada diberi tanda tenant default, Agar tidak ada data yang kehilangan pemilik setelah kolom `website_id` diaktifkan.

### Detail Teknis & Alur Sistem

- **Konfigurasi:** `DEFAULT_WEBSITE_ID` pada berkas `.env`
- **Tabel Terkait:** 10 tabel dari User Story (10)

### Acceptance Criteria (Kriteria Penerimaan)

a. **Penetapan Website Default**
- Nilai `DEFAULT_WEBSITE_ID` ditambahkan ke `.env` dan ke dokumentasi deployment.
- Sebelum backfill berjalan, migration memvalidasi bahwa ID tersebut benar-benar ada pada tabel `websites`. Jika tidak ada, migration dibatalkan.

b. **Eksekusi Backfill**
- Untuk setiap tabel, sistem menjalankan `UPDATE {tabel} SET website_id = {default} WHERE website_id IS NULL`.
- Backfill dijalankan dalam satu transaksi per tabel.

c. **Verifikasi Hasil**
- Setelah backfill, sistem menjalankan hitungan verifikasi: jumlah baris dengan `website_id IS NULL` pada seluruh tabel wajib bernilai `0`.
- Hasil hitungan dicetak ke log migration agar dapat diperiksa.

d. **Pengetatan Kolom (Opsional, Migration Terpisah)**
- Setelah verifikasi bersih, kolom `website_id` dapat diubah menjadi `NOT NULL` melalui migration terpisah.
- Pemisahan ini disengaja agar backfill dapat diulang tanpa memblokir deployment.

e. **Peringatan Irreversibilitas**
- Backfill **tidak dapat dibatalkan secara otomatis**. Setelah seluruh baris ditandai milik satu tenant, pemisahan data ke tenant berbeda harus dilakukan manual.
- Peringatan ini wajib ditulis pada komentar migration dan pada catatan rilis.

f. **Alur Lanjutan (Post-Condition)**
- Sistem tetap berperilaku persis seperti sebelumnya bagi pengguna, karena seluruh data berada pada satu tenant.
- Belum ada isolasi apa pun pada tahap ini.

---

## (12) Menyimpan `website_id` saat Membuat Data

**Aktor:** Admin

**Prasyarat:** User Story (10) dan (11) telah selesai.

**Deskripsi (User Story):** Sebagai Admin, Saya ingin data baru yang saya buat tercatat sebagai milik website tertentu, Agar konten antar tenant dapat dibedakan.

### Detail Teknis & Endpoint

- **Controller Terdampak:** pemilik 10 tabel pada User Story (10) — antara lain `menuController`, `mediaController`, `customPageController`, `BrandController`, `iconController`, `layoutController`, `settingLogoController`, `footerController`, `formSettingsController`, `newsletterController`
- **Tabel Terkait:** 10 tabel dari User Story (10), `websites`

### Acceptance Criteria (Kriteria Penerimaan)

a. **Penerimaan Parameter**
- Setiap endpoint `POST` dan `PUT` pada controller terdampak menerima `website_id` dari body request.
- Pada fase ini backend **mempercayai** nilai yang dikirim frontend. Ini disengaja dan bersifat sementara.

b. **Validasi Nilai**
- Sistem memvalidasi bahwa `website_id` merujuk ke baris yang ada pada tabel `websites` dan `is_active = true`.
- Jika tidak valid, kembalikan `400 Bad Request` dengan pesan "Website tidak ditemukan atau nonaktif".

c. **Nilai Bawaan**
- Jika `website_id` tidak dikirim sama sekali, sistem mengisinya dengan `DEFAULT_WEBSITE_ID`.
- Perilaku ini menjaga kompatibilitas dengan pemanggil lama yang belum diperbarui.

d. **Larangan Perubahan Kepemilikan**
- Pada operasi `PUT`, kolom `website_id` **tidak boleh** diubah. Memindahkan konten antar tenant bukan bagian dari cakupan ini.
- Nilai `website_id` yang dikirim pada request update diabaikan.

e. **Batas Keamanan yang Diakui**
- Didokumentasikan secara eksplisit bahwa pada fase ini siapa pun yang memiliki token dapat menulis data ke `website_id` mana pun.
- Fase ini **tidak boleh** diperlakukan sebagai isolasi. Isolasi baru berlaku setelah User Story (15).

f. **Alur Lanjutan (Post-Condition)**
- Data baru tercatat dengan tenant yang benar dan siap difilter pada User Story (13).

---

## (13) Memfilter Daftar Berdasarkan Website Aktif

**Aktor:** Admin

**Prasyarat:** User Story (12) telah selesai.

**Deskripsi (User Story):** Sebagai Admin, Saya ingin daftar menu, media, custom page, brand, dan setelan hanya menampilkan data milik website yang sedang saya kelola, Agar saya tidak tercampur dengan data tenant lain.

### Detail Teknis & Endpoint

- **Controller Terdampak:** sama dengan User Story (12)
- **Tabel Terkait:** 10 tabel dari User Story (10)

### Acceptance Criteria (Kriteria Penerimaan)

a. **Penerapan Filter pada Query Daftar**
- Setiap endpoint `GET` daftar menambahkan kondisi `WHERE website_id = {nilai}` pada query.
- Nilai diambil dari parameter query `?website_id=`, atau `DEFAULT_WEBSITE_ID` bila tidak dikirim.

b. **Penerapan Filter pada Query Detail**
- Endpoint `GET /:id` memvalidasi bahwa baris yang ditemukan memiliki `website_id` yang cocok.
- Jika tidak cocok, kembalikan `404` — bukan `403` — agar keberadaan data milik tenant lain tidak terungkap.

c. **Indikator di Antarmuka**
- Halaman daftar menampilkan keterangan website yang sedang difilter, agar admin tidak salah menduga datanya hilang.

d. **Konsistensi Hitungan**
- Seluruh penghitungan (jumlah data, paginasi) mengikuti filter yang sama.

e. **Verifikasi Silang**
- Uji: membuat data pada website A, lalu memfilter dengan website B, wajib menghasilkan daftar kosong.

f. **Alur Lanjutan (Post-Condition)**
- Filter masih dapat dilewati dengan mengubah parameter di URL. Penutupan celah ini adalah User Story (15).

---
---

# FASE D — ISOLASI TENANT

## (14) Resolusi Tenant dari Origin / Host

**Aktor:** Sistem

**Prasyarat:** Fase C selesai. DNS dan sertifikat untuk tiap tenant sudah disiapkan.

**Deskripsi (User Story):** Sebagai Sistem, Saya ingin menentukan sendiri tenant mana yang sedang diakses berdasarkan header request, Agar frontend tidak perlu lagi mengirim `website_id` dan tenant tidak dapat dipalsukan dari sisi klien.

### Detail Teknis & Alur Sistem

- **File Baru:** `admin-be/middlewares/resolveTenant.js`
- **Dipasang di:** `admin-be/server.js`, sebelum seluruh route
- **Tabel Terkait:** `websites`

### Acceptance Criteria (Kriteria Penerimaan)

a. **Alasan `Host` Saja Tidak Cukup**
- API berdiri pada satu hostname, sehingga `req.headers.host` selalu bernilai sama apa pun tenant pemanggilnya.
- Header yang benar-benar bervariasi per tenant adalah `Origin`, yang dikirim browser dan sudah didaftarkan pada whitelist CORS.
- Middleware karena itu tidak boleh mengandalkan `Host` sebagai satu-satunya sumber.

b. **Rantai Prioritas Resolusi**
- Middleware mengisi `req.websiteId` dengan urutan berikut. Yang lebih atas menang.

| Prioritas | Sumber | Berlaku untuk |
|---|---|---|
| 1 | Header `Origin` atau `Referer` dicocokkan ke `websites.domain` | Situs publik |
| 2 | Header `Host` dicocokkan ke `websites.domain` | API dengan hostname per-tenant |
| 3 | Parameter `website_id` eksplisit | Rute admin saja, dinonaktifkan pada akhir fase ini |
| 4 | `DEFAULT_WEBSITE_ID` dari `.env` | Fallback |

c. **Pembatasan Jalur Parameter**
- Prioritas 3 hanya berlaku untuk path yang diawali `/api/admin`.
- Jalur ini dimatikan melalui flag konfigurasi setelah User Story (17) selesai.
- Jika dibiarkan hidup, isolasi apa pun dapat dilewati cukup dengan menambahkan `?website_id=` pada URL.

d. **Cache Pemetaan Domain**
- Pemetaan `domain → id` disimpan di memori proses agar tidak menghasilkan query database pada setiap request.
- Cache dikosongkan setiap kali ada operasi tulis pada tabel `websites`.

e. **Normalisasi Nilai**
- Nilai `Origin` dinormalisasi: skema (`https://`), port, dan garis miring akhir dibuang sebelum dicocokkan.
- Pencocokan dilakukan case-insensitive.

f. **Alur Lanjutan (Post-Condition)**
- Seluruh controller dapat membaca `req.websiteId` tanpa perlu mengurus header sendiri.
- Nilai ini menjadi satu-satunya sumber kebenaran tenant pada User Story (15).

---

## (15) Penegakan Isolasi Data

**Aktor:** Sistem

**Prasyarat:** User Story (14) telah selesai.

**Deskripsi (User Story):** Sebagai Sistem, Saya ingin menyisipkan filter tenant secara otomatis pada setiap query, Agar data satu tenant tidak dapat dibaca atau diubah oleh tenant lain walaupun klien memaksa mengirim parameter.

### Detail Teknis & Alur Sistem

- **File Baru:** `admin-be/middlewares/tenantScope.js`
- **Controller Terdampak:** 10 controller pemilik tabel pada User Story (10)

### Acceptance Criteria (Kriteria Penerimaan)

a. **Penyediaan Helper**
- Middleware menyediakan fungsi `scoped(where, req)` yang mengembalikan objek `where` dengan `website_id: req.websiteId` tersisip.
- Helper dipakai konsisten pada seluruh operasi `SELECT`, `UPDATE`, dan `DELETE` di controller terdampak.

b. **Penyisipan pada Operasi Tulis**
- Pada operasi `INSERT`, nilai `website_id` diambil dari `req.websiteId`, bukan dari body request.
- Nilai `website_id` yang dikirim klien pada body diabaikan sepenuhnya.

c. **Audit Menyeluruh**
- Seluruh query pada 10 controller terdampak diperiksa satu per satu.
- Hasil audit dicatat dalam bentuk daftar periksa: nama controller, nama fungsi, status (sudah / belum di-scope).
- Query yang sengaja tidak di-scope wajib diberi komentar penjelas.

d. **Pengujian Penembusan**
- Uji: request dengan `?website_id=99` sementara `req.websiteId` bernilai `1` wajib mengembalikan data milik tenant `1` saja.
- Uji: `PUT` terhadap `id` milik tenant lain wajib mengembalikan `404`.
- Uji: `DELETE` terhadap `id` milik tenant lain wajib mengembalikan `404`.

e. **Cakupan yang Diakui Terbatas**
- Isolasi ini hanya berlaku pada 10 tabel bercakupan konten & tampilan, ditambah `posts`, `categories`, dan `themes`.
- Modul produk, order, dompet, MLM, dan listing **tidak** terisolasi. Batasan ini didokumentasikan agar tidak disalahartikan sebagai isolasi menyeluruh.

f. **Alur Lanjutan (Post-Condition)**
- Setelah kriteria ini terpenuhi, jalur parameter `website_id` pada User Story (14) prioritas 3 dimatikan.

---

## (16) Penolakan Akses Lintas Tenant

**Aktor:** Sistem

**Prasyarat:** User Story (15) telah selesai.

**Deskripsi (User Story):** Sebagai Sistem, Saya ingin menolak setiap upaya mengakses data milik tenant lain dengan respons yang konsisten, Agar tidak ada informasi yang bocor melalui perbedaan pesan error.

### Detail Teknis & Alur Sistem

- **Controller Terdampak:** seluruh controller tenant-aware
- **Tabel Terkait:** 13 tabel tenant-aware (`posts`, `categories`, `themes` + 10 tabel Fase C)

### Acceptance Criteria (Kriteria Penerimaan)

a. **Respons Baku untuk Data Tidak Terjangkau**
- Upaya mengakses baris milik tenant lain mengembalikan `404 Not Found`, bukan `403 Forbidden`.
- Alasan: `403` mengonfirmasi bahwa data tersebut ada, sedangkan `404` tidak membocorkan apa pun.

b. **Respons untuk Tenant Tidak Sah pada Rute Admin**
- Jika pengguna admin secara eksplisit meminta `website_id` di luar haknya, kembalikan `403` dengan pesan "Anda tidak memiliki akses ke website ini."
- Pembedaan ini disengaja: pada rute admin, keberadaan tenant lain memang bukan rahasia.

c. **Konsistensi Pesan**
- Seluruh pesan penolakan memakai format yang sama dan tidak memuat nama tabel, nama kolom, atau potongan query.

d. **Pencatatan Percobaan**
- Setiap penolakan lintas tenant dicatat ke log aplikasi (stdout) dengan menyertakan path, `req.websiteId`, dan `website_id` yang diminta.
- Pencatatan ke tabel database menunggu keputusan pada [Pertanyaan Terbuka](#-pertanyaan-terbuka) nomor 5.

e. **Pengujian**
- Disusun kumpulan uji yang mencakup: baca detail, ubah, hapus, dan daftar — masing-masing dengan `website_id` milik tenant lain.

f. **Alur Lanjutan (Post-Condition)**
- Hasil uji dilampirkan sebagai bukti penerimaan Fase D.

---

## (17) Pembersihan Hardcode `website_id` di Frontend

**Aktor:** Developer

**Prasyarat:** User Story (14) dan (15) telah selesai.

**Deskripsi (User Story):** Sebagai Developer, Saya ingin menghapus seluruh nilai `website_id` yang ditulis langsung di kode frontend, Agar tidak ada lagi sumber kebenaran ganda dan tenant sepenuhnya ditentukan backend.

### Detail Teknis & Alur Sistem

- **File Terdampak (9 berkas):**

| Berkas | Bentuk Hardcode |
|---|---|
| `admin-fe/src/views/posts/PostForm.vue` | `website_id: 1` |
| `admin-fe/src/views/products/ProductForm.vue` | `website_id: 1` |
| `admin-fe/src/views/testimonial/TestimonialForm.vue` | `website_id: 1` |
| `admin-fe/src/views/pages/PageForm.vue` | `website_id: 1` |
| `admin-fe/src/views/listing/ListingForm.vue` | `website_id: 1` |
| `admin-fe/src/views/pages/CustomPageForm.vue` | `websiteId = 1` |
| `admin-fe/src/components/theme/AdminTheme.vue` | `websiteId = 1` |
| `admin-fe/src/components/theme/SchemaEditor.vue` | `websiteId = ref(1)` |
| `admin-fe/src/views/pengaturan/SiteSetting.vue` | `websiteId: 1` |

- **Berkas Tambahan:** `admin-fe/src/store/index.js`

### Acceptance Criteria (Kriteria Penerimaan)

a. **Penghapusan, Bukan Penggantian**
- Nilai `website_id` **dihapus** dari payload request, tidak diganti dengan nilai dari store.
- Backend mengisi kolom tersebut sendiri melalui `req.websiteId`.

b. **Pembersihan State yang Tidak Terpakai**
- State `websiteId` beserta mutation `setWebsiteId` dan action `fetchWebsiteIdFromServer` pada `store/index.js` dihapus.
- State ini saat ini tidak dipakai satu komponen pun, dan pada arsitektur ini memang tidak akan pernah dipakai.
- Pemanggilan `store.dispatch('fetchWebsiteIdFromServer')` pada `App.vue` ikut dihapus.

c. **Penyesuaian Komponen Tema**
- `AdminTheme.vue` dan `SchemaEditor.vue` memanggil endpoint tema tanpa menyertakan `websiteId`.
- Endpoint tema di backend disesuaikan agar membaca `req.websiteId`.

d. **Verifikasi Menyeluruh**
- Pencarian teks `website_id: 1`, `websiteId = 1`, dan `websiteId: 1` di seluruh direktori `admin-fe/src` wajib menghasilkan nol kecocokan.

e. **Pengujian Regresi**
- Seluruh form yang terdampak diuji ulang: buat data baru, pastikan `website_id` terisi benar di database.
- `npm run lint` berjalan tanpa error.

f. **Alur Lanjutan (Post-Condition)**
- Setelah kriteria ini terpenuhi, jalur parameter `website_id` (User Story 14, prioritas 3) dinonaktifkan secara permanen.

---

## (18) Penanganan Tenant Tidak Dikenal & Nonaktif

**Aktor:** Sistem

**Prasyarat:** User Story (14) telah selesai.

**Deskripsi (User Story):** Sebagai Sistem, Saya ingin memberikan respons yang jelas ketika request datang dari domain yang tidak terdaftar atau menuju tenant yang dinonaktifkan, Agar pengunjung dan tim operasional dapat membedakan salah konfigurasi dari kerusakan sistem.

### Detail Teknis & Alur Sistem

- **File Terkait:** `admin-be/middlewares/resolveTenant.js`
- **Tabel Terkait:** `websites`

### Acceptance Criteria (Kriteria Penerimaan)

a. **Domain Tidak Terdaftar**
- Jika seluruh rantai resolusi gagal dan `DEFAULT_WEBSITE_ID` tidak dikonfigurasi, sistem mengembalikan `404` dengan pesan "Website tidak ditemukan untuk domain ini."
- Jika `DEFAULT_WEBSITE_ID` dikonfigurasi, sistem memakainya dan mencatat peringatan ke log.

b. **Tenant Dinonaktifkan**
- Jika tenant ditemukan namun `is_active = false`, sistem mengembalikan `503 Service Unavailable` dengan pesan "Situs ini sedang tidak aktif."
- Pembedaan `404` dan `503` disengaja: yang pertama berarti salah alamat, yang kedua berarti sengaja dimatikan.

c. **Pengecualian Rute**
- Rute autentikasi (`/api/auth/*`, `/customer/auth/*`) dan berkas statis (`/uploads`) dikecualikan dari resolusi tenant, agar login tetap mungkin walau tenant bermasalah.

d. **Perilaku pada Panel Admin**
- Panel admin tidak boleh ikut terkunci ketika satu tenant dinonaktifkan.
- Admin tetap dapat membuka daftar website dan mengaktifkan kembali tenant tersebut.

e. **Pencatatan**
- Setiap kegagalan resolusi dicatat ke log aplikasi beserta nilai `Origin`, `Host`, dan path yang diminta.

f. **Alur Lanjutan (Post-Condition)**
- Tim operasional dapat mendiagnosis salah konfigurasi DNS langsung dari log tanpa perlu membuka database.

---
---
---

# FASE E — PERBAIKAN DOMPET SALDO

> Fase ini berdiri sendiri dan tidak bergantung pada Fase A–D. Tabel dompet **tidak** mendapat `website_id` dan tetap global.
>
> Seluruh temuan di bawah berasal dari pembacaan kode pada 28 Agustus 2026. Setiap user story diawali kriteria verifikasi kondisi awal, karena fase ini menyentuh saldo customer — kesalahan di sini berakibat langsung ke uang, bukan ke tampilan.
>
> **Urutan (19) → (23) mengikat.** Mengerjakan (22) sebelum (21) selesai akan memunculkan kerusakan yang lebih besar daripada kondisi sekarang.

## (19) Perbaikan Guard Saldo pada Pembayaran Order

**Aktor:** Sistem / Developer

**Prasyarat:** Tidak ada. Ini pekerjaan pertama pada Fase E dan yang paling mendesak.

**Deskripsi (User Story):** Sebagai Sistem, Saya ingin pembayaran order dengan saldo ditolak ketika saldo customer tidak mencukupi, Agar saldo tidak dapat menjadi negatif akibat pengecekan yang tidak pernah berjalan.

### Detail Teknis & Alur Sistem

- **File Terkait:** `admin-be/controllers/customer/orderController.js` (dua lokasi), `admin-be/services/walletServices.js`
- **Tabel Terkait:** `wallet_histories`, `orders`, `orderpayments`
- **Kondisi Awal:** `getWallet()` mengembalikan **angka** (`parseFloat(startingBalance) + parseFloat(totalUpdate)`), bukan objek. Kedua pemanggilnya membaca `walletData.balance`, yang selalu bernilai `undefined`.

| Lokasi | Baris | Bentuk |
|---|---|---|
| `orderController.js` — buat order | ±138–141 | `const walletData = await getWallet(...)` lalu `if (walletData.balance < total_amount)` |
| `orderController.js` — bayar order | ±301–306 | pola yang sama terhadap `order.total_amount` |

- **Akibat:** `undefined < 500000` bernilai `false`, sehingga cabang penolakan tidak pernah dieksekusi. Customer dengan saldo nol tetap dapat menyelesaikan order berbayar-saldo, dan `wallet_histories` menerima baris bernilai negatif tanpa penyeimbang.

### Acceptance Criteria (Kriteria Penerimaan)

a. **Verifikasi Kondisi Awal (membuktikan masalah)**
- Wajib ada bukti reproduksi sebelum perbaikan ditulis: satu customer bersaldo `0` mengirim order dengan `use_balance: true` dan order **berhasil** dibuat.
- Bukti disimpan sebagai skrip atau catatan langkah, bukan sekadar pernyataan.

b. **Penetapan Kontrak `getWallet()`**
- Nilai kembali `getWallet()` ditetapkan tetap berupa **angka**, bukan objek.
- Alasan: pemanggil lain (`admin-be/controllers/transaksi/walletController.js`) sudah memperlakukannya sebagai angka. Mengubahnya menjadi objek akan merusak jalur yang sekarang benar.

c. **Perbaikan Kedua Pemanggil**
- Kedua lokasi di `orderController.js` membandingkan nilai kembali secara langsung, bukan lewat properti `.balance`.
- Pencarian teks `walletData.balance` di seluruh `admin-be` wajib menghasilkan nol kecocokan setelah perbaikan.

d. **Penolakan Saldo Tidak Cukup**
- Bila saldo kurang, sistem mengembalikan `400` dengan pesan "Saldo tidak mencukupi".
- Transaksi database di-`rollback` sepenuhnya: tidak ada baris `orders`, `orderdetails`, maupun `orderpayments` yang tertinggal.

e. **Pemotongan Saldo Ikut Transaksi Order**
- `updateWalletBalance()` saat ini dipanggil **tanpa** meneruskan objek transaksi, sehingga baris `wallet_histories` tetap tertulis walaupun transaksi order kemudian gagal.
- Fungsi tersebut diberi parameter transaksi opsional, dan `orderController.js` meneruskan transaksi yang sedang berjalan.
- Diuji dengan memaksa kegagalan setelah pemotongan saldo: tidak boleh ada baris ledger yang tersisa.

f. **Alur Lanjutan (Post-Condition)**
- Saldo tidak dapat lagi menjadi negatif lewat jalur pembayaran order.
- Penanganan saldo negatif yang mungkin **sudah** terbentuk di produksi ditentukan terpisah — lihat [Pertanyaan Terbuka](#-pertanyaan-terbuka) nomor 6.

---

## (20) Satu Sumber Kebenaran Saldo

**Aktor:** Developer

**Prasyarat:** User Story (19) telah selesai.

**Deskripsi (User Story):** Sebagai Developer, Saya ingin hanya ada satu cara menjawab pertanyaan "berapa saldo customer ini", Agar nilai yang ditampilkan, nilai yang dipotong, dan nilai yang dipakai memvalidasi penarikan tidak saling bertentangan.

### Detail Teknis & Alur Sistem

- **File Terkait:** `admin-be/services/walletServices.js`, `admin-be/controllers/transaksi/topupController.js`, `admin-be/controllers/transaksi/withdrawController.js`, `admin-be/controllers/customer/orderController.js`
- **Tabel Terkait:** `wallet_histories`, `starting_balances`
- **Kondisi Awal:** ada **dua** sumber saldo yang hidup berdampingan.

| Sumber | Cara kerja | Dipakai oleh |
|---|---|---|
| `getWallet()` | Hitung ulang: `starting_balances` terakhir + `SUM(amount)` sesudahnya | Tampilan saldo customer & admin, pembayaran order |
| `wallet_histories.balance_after` | Running balance pada baris terakhir | Persetujuan topup, pengajuan withdraw |

- **Pemutus rantainya:** `updateWalletBalance()` — satu-satunya penulis ledger pada jalur pembayaran order — **tidak mengisi** `balance_before` dan `balance_after`; kedua barisnya dinonaktifkan sebagai komentar, sehingga kolom terisi nilai default `0`.

- **Skenario kegagalan yang dapat direproduksi:**

  1. Customer topup `100.000`, disetujui admin. Baris ledger: `balance_after = 100000`. Kedua sumber sepakat.
  2. Customer membayar order `10.000` dengan saldo. Baris ledger baru: `amount = -10000`, `balance_after = 0`.
  3. `getWallet()` menjawab `90.000`. Baris terakhir menjawab `0`.
  4. Customer mengajukan withdraw `50.000` → ditolak "Saldo tidak mencukupi", padahal saldonya cukup.
  5. Customer topup lagi `20.000` → `previousBalance` dibaca `0`, sehingga `balance_after` ditulis `20000`, bukan `110000`.

### Acceptance Criteria (Kriteria Penerimaan)

a. **Verifikasi Kondisi Awal**
- Lima langkah skenario di atas dijalankan dan hasilnya dicatat sebelum perbaikan ditulis.

b. **Penetapan Sumber Tunggal**
- `getWallet()` ditetapkan sebagai **satu-satunya** sumber kebenaran saldo.
- Alasan: ia dihitung dari ledger, sehingga tidak dapat menyimpang karena satu penulis lupa memperbarui kolom.

c. **Nasib Kolom `balance_before` / `balance_after`**
- Keputusan dipilih lebih dulu — lihat [Pertanyaan Terbuka](#-pertanyaan-terbuka) nomor 7. Dua opsi:

  **Dipertahankan sebagai jejak audit.** `updateWalletBalance()` wajib mengisinya, dan seluruh penulis ledger memakai satu helper yang sama. Kolom tidak boleh dibaca untuk mengambil keputusan.

  **Ditinggalkan.** Kolom dibiarkan ada demi data historis, tetapi tidak lagi ditulis maupun dibaca, dan ditandai usang di model.

- Yang tidak boleh: kolom tetap dibaca untuk mengambil keputusan seperti sekarang.

d. **Pembersihan Pembaca Kolom**
- `topupController.js` berhenti membaca `latestHistory.balance_after` untuk menghitung saldo sebelumnya.
- `withdrawController.js` berhenti membaca `latestHistory?.balance_after` untuk memvalidasi kecukupan saldo; keduanya memanggil `getWallet()`.
- Pencarian teks `balance_after` di seluruh `admin-be/controllers` hanya boleh tersisa pada baris **penulisan**, bukan pembacaan untuk keputusan.

e. **Pengujian Regresi**
- Skenario lima langkah pada bagian Kondisi Awal diulang; pada langkah 4 withdraw harus **diterima**, dan pada langkah 5 saldo harus terbaca `110.000`.

f. **Alur Lanjutan (Post-Condition)**
- Hanya satu fungsi yang berhak menjawab "berapa saldo user".
- User Story (21) baru boleh dimulai setelah kriteria ini terpenuhi.

---

## (21) Penyeragaman Aturan Status pada Perhitungan Saldo

**Aktor:** Developer

**Prasyarat:** User Story (20) telah selesai.

**Deskripsi (User Story):** Sebagai Developer, Saya ingin seluruh jalur perhitungan saldo memakai aturan status yang sama, Agar saldo tidak berubah nilainya hanya karena dihitung oleh kode yang berbeda.

### Detail Teknis & Alur Sistem

- **File Terkait:** `admin-be/services/walletServices.js`, `admin-be/cron/cronStartingBalance.js`, `admin-be/controllers/transaksi/withdrawController.js`
- **Tabel Terkait:** `wallet_histories`
- **Kondisi Awal:** dua aturan yang bertentangan.

| Jalur | Aturan |
|---|---|
| `getWallet()` | Menjumlahkan **semua** baris tanpa filter status — termasuk `pending`, `failed`, `canceled`. Ada komentar eksplisit di kode: *"Sum semua transaksi, termasuk failed/canceled"* |
| `cronStartingBalance.js` | Hanya menjumlahkan baris `status: 'success'` |

- **Kenapa perbedaan ini belum terasa:** cron tidak pernah berjalan (lihat User Story 22), sehingga aturannya belum pernah dipakai.
- **Pola penulisan yang berlaku sekarang:** withdraw memakai **entri penyeimbang** (*compensating entry*), bukan pengubahan nilai. Saat pengajuan, ditulis baris `amount = -X` berstatus `pending`. Saat ditolak, ditulis baris **baru** `amount = +X` berstatus `canceled`, dan baris lama diubah statusnya menjadi `failed`.

### Acceptance Criteria (Kriteria Penerimaan)

a. **Verifikasi Kondisi Awal**
- Aturan status pada setiap jalur perhitungan didaftar dan dibuktikan dari kode, bukan dari asumsi.

b. **Penetapan Aturan Tunggal**
- Aturan yang ditetapkan: **jumlahkan seluruh baris tanpa memfilter status.**
- Alasannya bukan selera. Karena pembatalan diwujudkan sebagai entri penyeimbang, memfilter `status = 'success'` akan membuang baris `pending` yang sudah punya penyeimbang `canceled` — sehingga pembatalan terhitung dua kali dan saldo customer naik tanpa sebab.

c. **Kewajiban Entri Penyeimbang**
- Seluruh penulis ledger wajib memakai pola entri penyeimbang.
- Baris historis `wallet_histories` tidak boleh dihapus, dan nilai `amount`-nya tidak boleh diubah. Yang boleh berubah hanya kolom `status` sebagai penanda.

d. **Penyesuaian Cron**
- Filter `status: 'success'` pada `cronStartingBalance.js` dihapus agar mengikuti aturan yang sama.
- Perubahan ini dikerjakan di sini, bukan di User Story (22), supaya cron tidak pernah aktif dengan aturan yang salah.

e. **Pengujian**
- Skenario: topup `100.000` disetujui → ajukan withdraw `40.000` → tolak withdraw. Saldo akhir wajib kembali tepat `100.000` pada seluruh jalur pembacaan.
- Skenario diulang dengan `getWallet()` dan dengan perhitungan cron secara manual; keduanya wajib menghasilkan angka yang sama.

f. **Alur Lanjutan (Post-Condition)**
- Aturan status didokumentasikan sebagai komentar tunggal di `walletServices.js`.
- User Story (22) baru boleh dimulai setelah kriteria ini terpenuhi.

---

## (22) Pengaktifan Cron Snapshot Saldo Harian

**Aktor:** Sistem / Developer

**Prasyarat:** User Story (21) telah selesai. Prasyarat ini tidak boleh dilewati.

**Deskripsi (User Story):** Sebagai Sistem, Saya ingin snapshot saldo harian benar-benar berjalan setiap tengah malam untuk seluruh pemilik saldo, Agar perhitungan saldo tidak perlu menjumlahkan seluruh riwayat sejak awal dan tetap cepat saat data bertambah banyak.

### Detail Teknis & Alur Sistem

- **File Terkait:** `admin-be/cron/cronStartingBalance.js`, `admin-be/cron/cronStartingBalanceScheduler.js`, `admin-be/server.js`, `admin-be/services/walletServices.js`
- **Tabel Terkait:** `starting_balances`, `wallet_histories`, `Customers`, `Users`
- **Kondisi Awal:** mekanismenya ada di kode, tetapi **tidak pernah dieksekusi**. Lima cacat bertumpuk:

| # | Cacat | Bukti |
|---|---|---|
| 1 | Scheduler tidak pernah dimuat | `cronStartingBalanceScheduler.js` tidak di-`require` di `server.js` maupun berkas lain mana pun |
| 2 | Memanggil fungsi yang tidak ada | Scheduler memanggil `updateStartingBalanceAll`, sedangkan modulnya mengekspor `updateStartingBalance` |
| 3 | Menyapu tabel yang salah | `cronStartingBalance.js` mengambil daftar username dari `User` (staf admin), padahal seluruh saldo dimiliki `Customer` |
| 4 | Efek samping saat impor | `cronStartingBalance.js` memanggil `updateStartingBalance()` di badan modul, sehingga sekadar me-`require` berkasnya memicu pemrosesan seluruh pengguna |
| 5 | Fungsi kembar yang rusak | `updateStartingBalance()` di `walletServices.js` menyaring kolom `HistoryDate` yang tidak ada di tabel maupun model; fungsi ini tidak dipanggil siapa pun |

### Acceptance Criteria (Kriteria Penerimaan)

a. **Verifikasi Kondisi Awal**
- Pencarian teks `cronStartingBalanceScheduler` di seluruh repositori wajib dibuktikan menghasilkan nol pemanggil sebelum perbaikan.
- Isi tabel `starting_balances` diperiksa; bila kosong atau basi, itu menjadi bukti pendukung.

b. **Perbaikan Nama Fungsi dan Pemuatan**
- Nama fungsi yang diekspor dan yang dipanggil disamakan.
- Scheduler dimuat dari `server.js`, dan pemuatannya dicatat ke log saat aplikasi start.

c. **Perbaikan Sumber Pengguna**
- Daftar pemilik saldo diambil dari `Customer`, bukan `User`.
- Alternatif yang lebih tahan salah: ambil daftar `username` yang benar-benar punya baris di `wallet_histories`, sehingga cron tidak memproses akun yang tidak pernah bertransaksi.

d. **Penghapusan Efek Samping Impor**
- Pemanggilan `updateStartingBalance()` di badan modul dihapus; fungsi hanya berjalan bila dipanggil scheduler atau perintah manual.

e. **Kesetaraan Hasil**
- Setelah cron berjalan, `getWallet()` untuk setiap customer wajib menghasilkan angka yang **sama persis** dengan sebelum cron berjalan.
- Pengujian dilakukan pada salinan data, bukan produksi: catat saldo seluruh customer, jalankan cron, hitung ulang, bandingkan. Selisih satu customer pun berarti kriteria tidak terpenuhi.

f. **Alur Lanjutan (Post-Condition)**
- Snapshot berjalan setiap hari pukul 00:00 WIB dan tercatat di log.
- Klaim "snapshot saldo harian" baru boleh dipakai di materi penjualan setelah kriteria ini terpenuhi.

---

## (23) Pembersihan Kode Dompet yang Tidak Terpakai

**Aktor:** Developer

**Prasyarat:** User Story (22) telah selesai.

**Deskripsi (User Story):** Sebagai Developer, Saya ingin menghapus sisa kode dompet dari desain lama yang tidak dapat berjalan, Agar tidak ada orang yang keliru memakainya sebagai acuan saat menambah fitur.

### Detail Teknis & Alur Sistem

- **File Terkait:** `admin-be/utils/walletTransaction.js`, `admin-be/services/walletServices.js`, `admin-be/controllers/transaksi/walletController.js`
- **Kondisi Awal:**

| Sisa | Masalah |
|---|---|
| `utils/walletTransaction.js` | Me-`require('../../models')`, yang dari folder `utils/` menunjuk ke luar direktori proyek dan tidak ada. Isinya memakai model `Wallet` berkolom `balance` yang tidak terdaftar sama sekali, serta memanggil `WalletSummary` dengan nama kolom berbeda dari model yang berlaku. Tidak ada satu berkas pun yang mengimpornya. |
| `updateStartingBalance()` di `walletServices.js` | Menyaring kolom `HistoryDate` yang tidak ada. Tidak dipanggil siapa pun. Tumpang tindih dengan fungsi bernama sama di `cron/cronStartingBalance.js`. |
| Impor `Wallet` di `walletController.js` | Model `Wallet` tidak terdaftar (`db.Wallet` bernilai `undefined`). Saat ini tidak dipakai, sehingga belum menimbulkan galat — tetapi menyesatkan. |

### Acceptance Criteria (Kriteria Penerimaan)

a. **Verifikasi Sebelum Menghapus**
- Untuk setiap berkas dan fungsi di atas, dibuktikan lebih dulu bahwa tidak ada pemanggil, lewat pencarian teks di seluruh `admin-be` dan `admin-fe`.
- Bukti dicatat. Tidak ada penghapusan tanpa bukti.

b. **Penghapusan Berkas Mati**
- `utils/walletTransaction.js` dihapus.

c. **Penghapusan Fungsi Kembar**
- `updateStartingBalance()` pada `walletServices.js` dihapus, beserta namanya di `module.exports`.
- Satu-satunya pemilik logika snapshot adalah `cron/cronStartingBalance.js`.

d. **Pembersihan Impor**
- Nama `Wallet` dihapus dari daftar impor `walletController.js`.
- Nama lain yang diimpor tetapi tidak dipakai di berkas yang sama ikut dibersihkan.

e. **Verifikasi Tidak Ada Regresi**
- Aplikasi start tanpa galat.
- Seluruh endpoint dompet — saldo saya, riwayat, topup, withdraw, adjust — diuji ulang dan tetap berfungsi.

f. **Alur Lanjutan (Post-Condition)**
- Modul dompet hanya menyisakan satu jalur perhitungan saldo, satu penulis ledger, dan satu pemilik logika snapshot.

---

## ● Pertanyaan Terbuka

Tujuh hal berikut belum dapat dijawab dari kode maupun dokumen arsitektur, dan memblokir user story yang disebut.

| # | Pertanyaan | Memblokir |
|---|---|---|
| 1 | Panel admin akan disajikan per-tenant (`admin.<tenant>.id`) atau tetap satu domain? Jika tetap satu domain, satu instalasi admin hanya dapat mengelola satu website. | US (14), (17) |
| 2 | Endpoint `GET /api/admin/websites` dan `GET /:id` mau ditutup? Saat ini terbuka tanpa auth dan `GET /:id` memuat `admin_email`. | US (7) |
| 3 | Website default untuk data lama — apakah `id = 1`? | US (11) |
| 4 | Setelan transaksi mau pindah ke tabel sendiri atau tetap satu tabel dengan kolom `group`? | US (1) |
| 5 | Apakah proyek ini memerlukan tabel audit log terpusat seperti `user_logs`? Saat ini tidak ada sama sekali. | US (16) |
| 6 | Saldo negatif yang mungkin sudah terbentuk di produksi perlu direkonsiliasi, atau cukup dihentikan pendarahannya? | US (19) |
| 7 | Kolom `wallet_histories.balance_before` / `balance_after` dipertahankan sebagai jejak audit, atau ditinggalkan? | US (20) |

---

## ● Persetujuan

| Nama | Jabatan | Tanggal | Status | Tanda Tangan |
|---|---|---|---|---|
| | | | Menunggu persetujuan | |
