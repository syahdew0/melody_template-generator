CATATAN PEMAKAIAN

Berkas ini berisi HANYA isi bagian "2. Fitur" untuk ditempel ke dokumen Word.
Bagian "1. Identitas User Story" dan "3. Persetujuan" sudah Anda isi sendiri.

Sengaja ditulis tanpa heading Markdown, tanpa tabel pipa, dan tanpa backtick,
supaya hasil salin-tempel ke Word tidak berantakan. Setelah ditempel, Anda tinggal
menebalkan (bold) baris nama fitur — yaitu 23 baris yang diawali angka.

Acuan: ARSITEKTUR-TARGET-MULTITENANT.md
Rincian versi panjang: USER-STORY-MULTITENANT.md

CATATAN TENTANG FASE E. Fase A sampai D menurunkan dokumen arsitektur. Fase E
tidak. Fase E lahir dari pembacaan kode modul dompet pada 28 Agustus 2026, yang
menemukan lima cacat, dua di antaranya membuat saldo dapat menjadi negatif.
Cacat itu tidak berhubungan dengan tenancy dan tidak memerlukan kolom website_id.
Tabel dompet tetap global. Fase E dimasukkan ke dokumen ini karena modul dompet
ikut dijual bersama CMS, dan boleh dikerjakan paralel dengan Fase A sampai D.

===============================================================================


FASE A - FONDASI


1. Konsolidasi Model Setting

User Story: Sebagai Developer, saya ingin hanya ada satu model bernama Setting yang terdaftar dan satu tabel setelan yang dipakai, agar setelan logo dan setelan transaksi tidak berebut ruang kunci pada tabel yang sama, dan perilaku sistem tidak berbeda antara lingkungan macOS dan Linux.

Aktor: Developer
Prasyarat: Tidak ada. Ini pekerjaan pertama, sebelum fase mana pun dimulai.

Berkas terkait:
- admin-be/models/setting.js
- admin-be/models/logoSettings.js
- admin-be/models/index.js
- admin-be/controllers/settingLogoController.js
- admin-be/controllers/settingTransaksiController.js

Tabel dan kolom:
- settings  (id, key, value)  - tabel yang dipertahankan
- Settings  (id, key, value)  - tabel yang ditinggalkan setelah migrasi data
- Kolom baru: settings.group VARCHAR(50) NOT NULL DEFAULT 'general'
- Unique index baru: settings (group, key)

Acceptance Criteria:
a. Identifikasi kondisi awal (verifikasi masalah)
   - models/index.js memuat model dengan pola db[model.name] = model.
   - Dua berkas mendaftarkan nama model yang sama: logoSettings.js (tableName 'settings') dan setting.js (tanpa tableName, default menjadi 'Settings').
   - Karena urutan pemuatan alfabetis, setting.js menimpa logoSettings.js.
   - Verifikasi wajib membuktikan db.Setting.getTableName() bernilai 'Settings'.
b. Penetapan tabel tunggal
   - Tabel yang sah adalah settings (huruf kecil).
   - Tabel Settings (huruf besar) dinyatakan tidak dipakai setelah migrasi data selesai.
c. Pemisahan namespace kunci
   - Dua controller berbeda menulis ke tabel yang sama dengan kolom key datar, sehingga perlu pembeda.
   - Ditambahkan kolom group dengan nilai minimal: 'logo' dan 'transaksi'.
   - Unique index diubah menjadi komposit (group, key).
d. Migrasi data existing
   - Migration memindahkan seluruh baris dari Settings ke settings sambil mengisi group sesuai asal kunci.
   - Jika ada kunci sama pada dua group, keduanya disimpan sebagai baris terpisah.
   - Migration menyediakan down() yang mengembalikan data ke kondisi semula.
e. Pembaruan model dan controller
   - models/logoSettings.js dan models/setting.js digabung menjadi satu berkas model dengan tableName 'settings'.
   - settingLogoController.js menambahkan filter group = 'logo' pada seluruh query.
   - settingTransaksiController.js menambahkan filter group = 'transaksi' pada seluruh query.
f. Post-condition
   - Verifikasi ulang wajib menunjukkan db.Setting.getTableName() bernilai 'settings'.
   - Tidak ada lagi dua berkas model yang mendaftarkan nama model identik.
   - Fitur nomor 2 baru boleh dimulai setelah kriteria ini terpenuhi.


2. Kolom Identitas Domain pada Website

User Story: Sebagai Developer, saya ingin tabel websites memiliki kolom domain dan is_active, agar setiap tenant dapat dikenali dari host pemanggil dan dapat dinonaktifkan tanpa harus dihapus datanya.

Aktor: Developer
Prasyarat: Fitur 1 selesai.

Berkas terkait:
- admin-be/models/website.js
- Migration baru pada admin-be/migrations/

Tabel dan kolom:
- websites - kolom yang sudah ada: id, name, user_id, subdomain, site_title, title, site_description, admin_email, logo, seo_keywords, seo_description, rate, created_at, updated_at
- Kolom baru: websites.domain VARCHAR(255) NULL UNIQUE
- Kolom baru: websites.is_active BOOLEAN NOT NULL DEFAULT true
- Perubahan: websites.subdomain dijadikan UNIQUE

Acceptance Criteria:
a. Penambahan kolom baru
   - domain menyimpan host lengkap, contoh: psggroup.id
   - is_active menandai tenant aktif atau tidak
b. Penguatan kolom subdomain
   - Sebelum menerapkan UNIQUE, migration memeriksa duplikasi lebih dulu.
   - Jika ada duplikat, migration dibatalkan dengan pesan jelas dan data diperbaiki manual.
   - Nilai subdomain dinormalisasi menjadi huruf kecil.
c. Alasan domain terpisah dari subdomain
   - Kolom subdomain hanya menyimpan potongan nama (contoh: default, psggroup), tidak cukup untuk mencocokkan header Origin atau Host yang berisi host lengkap.
   - Kedua kolom dipertahankan: subdomain untuk identitas internal, domain untuk pencocokan request.
d. Pengisian nilai awal
   - Baris websites yang sudah ada diisi is_active = true.
   - Kolom domain dibiarkan NULL dan diisi manual lewat form pada Fitur 5.
e. Rollback
   - Migration menyediakan down() yang menghapus kedua kolom baru dan mencabut unique constraint pada subdomain.
f. Post-condition
   - Model Website diperbarui agar memuat domain dan is_active.
   - Kedua kolom masuk ke daftar kolom yang boleh ditulis pada Fitur 4 dan Fitur 5.


===============================================================================


FASE B - MASTER DATA WEBSITE


3. Melihat Daftar Website

User Story: Sebagai Admin, saya ingin melihat daftar seluruh website beserta ID, subdomain, domain, dan tema aktifnya, agar saya mengetahui tenant apa saja yang dikelola panel ini dan website_id mana yang dipakai oleh setiap konten.

Aktor: Admin
Prasyarat: Sudah login dan memiliki hak akses canView pada modul Website.

Halaman UI: /admin/websites
Komponen: admin-fe/src/views/website/WebsiteList.vue
Endpoint: GET /api/admin/websites
Controller: websiteController.getAllWebsites

Tabel dan kolom:
- websites (id, name, subdomain, domain, site_title, is_active)
- themes (id, website_id, name, is_active)

Acceptance Criteria:
a. Validasi hak akses
   - Request wajib menyertakan header Authorization: Bearer <token> yang valid.
   - Sistem memvalidasi hak akses canView pada modul Website melalui requireModulePermission.
   - Role bernama admin, super admin, superadmin, atau administrator lolos otomatis.
   - Jika tidak berhak, kembalikan 403 Forbidden.
b. Pengambilan data
   - Sistem menjalankan Website.findAll dengan include model Theme (alias themes), diurutkan ORDER BY id DESC.
   - Response berbentuk { success: true, websites: [...] }.
c. Kolom yang ditampilkan
   - Tabel menampilkan: ID, Nama, Subdomain, Domain, Judul Situs, Tema Aktif, dan Status.
   - Kolom ID ditampilkan sebagai badge monospace, karena nilainya adalah website_id yang dirujuk seluruh tabel konten.
   - Kolom Tema Aktif menampilkan nama tema dengan is_active = true. Jika tidak ada tema aktif namun tenant punya tema, tampilkan jumlah temanya.
   - Kolom Status menampilkan badge Aktif atau Nonaktif berdasarkan websites.is_active.
d. Penanganan keadaan kosong dan gagal
   - Selama request berjalan, tabel menampilkan baris "Memuat data...".
   - Jika tidak ada data, tampilkan "Belum ada website."
   - Jika request gagal, tampilkan pesan dari response, atau pesan baku "Gagal memuat daftar website."
e. Aksi per baris
   - Setiap baris menyediakan tautan Edit menuju /admin/websites/:id.
   - Tombol Hapus hanya tampil bila role memiliki canDelete pada modul Website.
f. Post-condition
   - Halaman menyediakan tombol "+ Tambah Website" menuju /admin/websites/create, tampil hanya bila role memiliki canAdd.


4. Membuat Website Baru

User Story: Sebagai Admin, saya ingin mendaftarkan website baru beserta subdomain dan domainnya, agar tenant tersebut dapat mulai menampung konten dan dikenali sistem saat request masuk.

Aktor: Admin
Prasyarat: Memiliki hak akses canAdd pada modul Website.

Halaman UI: /admin/websites/create
Komponen: admin-fe/src/views/website/WebsiteForm.vue
Method akses form: GET
Method submit data: POST /api/admin/websites
Payload: name, subdomain, domain, user_id, site_title, title, site_description, admin_email, logo, seo_keywords, seo_description, rate, is_active

Tabel dan kolom:
- websites (seluruh kolom di atas)
- Users (id, name, username) - untuk dropdown pemilik

Acceptance Criteria:
a. Validasi input data (frontend dan backend)
   - Field wajib: name dan subdomain.
   - subdomain dinormalisasi jadi huruf kecil, hanya menerima a-z, 0-9, dan tanda hubung.
   - subdomain tidak boleh diawali atau diakhiri tanda hubung.
   - domain (jika diisi) dinormalisasi jadi huruf kecil, divalidasi sebagai hostname sah, tanpa skema http:// dan tanpa garis miring.
   - admin_email (jika diisi) divalidasi sebagai alamat email.
   - user_id bernilai string kosong dikonversi menjadi NULL sebelum dikirim, karena kolomnya bertipe INTEGER.
b. Pengecekan duplikasi
   - Sistem melakukan SELECT ke tabel websites berdasarkan subdomain yang diinput.
   - Jika ditemukan, batalkan dengan 409 Conflict dan pesan "Subdomain sudah dipakai website lain."
   - Pemeriksaan sama dilakukan untuk domain bila diisi, dengan pesan "Domain sudah dipakai website lain."
c. Whitelist kolom
   - Controller tidak menerima req.body apa adanya. Hanya kolom pada konstanta WRITABLE_FIELDS yang diambil.
   - Kolom id, created_at, dan updated_at tidak dapat disentuh dari body request.
   - Alasan: implementasi lama hanya melakukan destructuring name, user_id, dan subdomain, sehingga 8 dari 11 kolom diabaikan diam-diam saat form dikirim.
d. Proses penyimpanan
   - Jika seluruh validasi lolos, sistem melakukan INSERT ke tabel websites.
   - is_active diisi true bila tidak dikirim.
   - Response sukses berbentuk { success: true, website: {...} }.
e. Penanganan kegagalan
   - Kegagalan validasi mengembalikan 400 Bad Request beserta pesan spesifik per field.
   - Kegagalan duplikasi mengembalikan 409 Conflict.
   - Pesan error ditampilkan di banner atas form, bukan hanya di console.
f. Post-condition
   - Setelah sukses, pengguna diarahkan kembali ke /admin/websites.
   - Website baru muncul di urutan teratas karena pengurutan id DESC.
   - Website baru belum memiliki tema; pembuatan tema dilakukan terpisah lewat modul Tema.


5. Mengubah Data Website

User Story: Sebagai Admin, saya ingin mengubah data website yang sudah ada, termasuk identitas, tampilan, dan SEO-nya, agar informasi tenant tetap akurat tanpa harus membuat ulang datanya.

Aktor: Admin
Prasyarat: Memiliki hak akses canEdit pada modul Website.

Halaman UI: /admin/websites/:id
Komponen: admin-fe/src/views/website/WebsiteForm.vue (mode edit)
Method akses form: GET /api/admin/websites/:id
Method submit data: PUT /api/admin/websites/:id

Tabel dan kolom:
- websites (seluruh kolom)
- Users (id, name, username)

Acceptance Criteria:
a. Pemuatan data awal
   - Saat halaman dibuka, sistem menjalankan GET /api/admin/websites/:id.
   - Seluruh field form diisi dari response. Nilai NULL dikonversi jadi string kosong agar input tidak menampilkan teks null.
   - Jika website tidak ditemukan, tampilkan 404 dengan pesan "Website not found".
   - Halaman menampilkan badge website_id agar admin tahu ID yang sedang disunting.
b. Pengelompokan field pada antarmuka
   - Identitas: name, subdomain, domain, user_id, is_active
   - Tampilan Situs: site_title, title, site_description, logo
   - SEO: seo_keywords, seo_description
   - Lainnya: admin_email, rate
   - Kolom logo menampilkan pratinjau gambar. Jika URL gagal dimuat, tampilkan peringatan tanpa membatalkan form.
c. Validasi perubahan subdomain dan domain
   - Jika subdomain diubah, periksa duplikasi terhadap website lain. Nilai yang tidak berubah tidak dianggap duplikat.
   - Aturan sama berlaku untuk domain.
   - Jika bentrok, kembalikan 409 Conflict.
d. Whitelist kolom dan eksekusi update
   - Controller memakai WRITABLE_FIELDS yang sama dengan Fitur 4.
   - Field yang tidak dikirim di body tidak ditimpa menjadi NULL, sehingga update parsial tetap aman.
   - Sistem melakukan UPDATE pada baris terkait.
e. Peringatan dampak perubahan
   - Jika subdomain atau domain diubah pada website yang sedang dipakai, UI menampilkan konfirmasi: "Mengubah domain akan memutus resolusi tenant dari host lama. Lanjutkan?"
f. Post-condition
   - Setelah sukses, pengguna diarahkan ke /admin/websites.
   - Perubahan is_active menjadi false membuat tenant ditolak pada resolusi tenant, lihat Fitur 18.


6. Menghapus Website

User Story: Sebagai Admin, saya ingin menghapus website yang sudah tidak dipakai agar daftar tenant tetap bersih, namun sistem harus mencegah penghapusan bila website tersebut masih memiliki konten, agar tidak ada data yang menjadi yatim.

Aktor: Admin
Prasyarat: Memiliki hak akses canDelete pada modul Website.

Halaman UI: /admin/websites (tombol Hapus per baris)
Method: DELETE /api/admin/websites/:id

Tabel dan kolom yang diperiksa:
- websites (id)
- posts (website_id), categories (website_id), themes (website_id)
- Ditambah 10 tabel dari Fitur 10

Acceptance Criteria:
a. Konfirmasi di antarmuka
   - Sebelum request dikirim, UI menampilkan dialog konfirmasi memuat nama website: "Hapus {nama}? Tindakan ini tidak bisa dibatalkan."
b. Validasi keberadaan data
   - Sistem melakukan SELECT berdasarkan id. Jika tidak ditemukan, kembalikan 404.
c. Pengecekan keterikatan data
   - Sebelum menghapus, sistem menghitung jumlah baris yang merujuk website_id tersebut pada seluruh tabel tenant-aware.
   - Pemeriksaan ini wajib, karena tidak ada foreign key constraint di level database yang mencegah data menjadi yatim.
   - Jika total lebih dari 0, batalkan dengan 409 Conflict dan pesan yang menyebut jumlah serta nama tabel terkait. Contoh: "Website masih dipakai 42 konten pada tabel posts, themes. Pindahkan atau hapus kontennya dulu."
d. Eksekusi penghapusan
   - Jika seluruh pengecekan lolos, jalankan destroy() pada baris tersebut.
   - Response sukses: { success: true, message: 'Website deleted' }.
e. Alternatif yang disarankan
   - Pada pesan penolakan, UI menyarankan menonaktifkan website (is_active = false) sebagai alternatif penghapusan.
f. Post-condition
   - Daftar website dimuat ulang otomatis.
   - Jika gagal, pesan penolakan tampil di banner atas daftar dan baris tidak hilang.


7. Proteksi Endpoint Website

User Story: Sebagai Developer, saya ingin endpoint tulis pada modul Website hanya dapat diakses oleh pengguna terautentikasi, agar tidak ada pihak luar yang dapat membuat, mengubah, atau menghapus website tanpa login.

Aktor: Developer
Prasyarat: Tidak ada.

Berkas terkait:
- admin-be/routes/websiteRoutes.js
- admin-be/server.js
- admin-be/middlewares/authMiddleware.js (requireAuth)

Acceptance Criteria:
a. Identifikasi kondisi awal (verifikasi masalah)
   - Router /api/admin/websites di-mount pada server.js sebelum baris app.use('/api', requireAuth).
   - Akibatnya seluruh operasi CRUD-nya dapat diakses tanpa token.
   - Verifikasi wajib membuktikan POST /api/admin/websites tanpa header Authorization berhasil membuat data.
b. Penerapan middleware per route
   - requireAuth dipasang langsung pada definisi route POST /, PUT /:id, dan DELETE /:id.
   - Penerapan dilakukan per-route, bukan dengan memindahkan mount ke bawah requireAuth.
c. Alasan mount tidak boleh dipindah
   - Router yang sama memuat GET /public/:id/settings yang memang harus dapat diakses tanpa autentikasi oleh frontend publik.
   - Memindahkan seluruh mount ke bawah requireAuth akan memutus endpoint publik tersebut.
   - Komentar penjelas wajib ditulis di dalam berkas route agar developer berikutnya tidak salah memperbaiki.
d. Keputusan atas endpoint baca
   - GET / dan GET /:id untuk sementara dibiarkan terbuka.
   - Catatan risiko: GET /:id mengembalikan kolom admin_email. Penutupan endpoint ini menunggu keputusan pada Pertanyaan Terbuka nomor 2.
e. Verifikasi hasil
   - Request POST, PUT, dan DELETE tanpa token wajib mengembalikan 401 dengan pesan "Token tidak ditemukan".
   - Request dengan token kedaluwarsa mengembalikan 401 dengan pesan "Token tidak valid".
   - Request dengan token valid berjalan normal dan menerima header respons x-refreshed-token.
f. Post-condition
   - Frontend memanggil seluruh endpoint ini melalui instance axios bernama api dari admin-fe/src/config/api.js, bukan axios polos, agar token otomatis tersisip dan token hasil refresh otomatis tersimpan.


8. Menu Website dan Hak Akses Modul

User Story: Sebagai Super Admin, saya ingin menu Website muncul di sidebar dan tunduk pada pengaturan hak akses per role, agar hanya role yang berwenang yang dapat melihat dan mengelola data tenant.

Aktor: Super Admin
Prasyarat: Tabel Modules dan RoleActiveModules sudah terisi.

Lokasi menu: Sidebar > Setting > Website
Komponen: admin-fe/src/components/SidebarPage.vue
Router: admin-fe/src/router/index.js

Tabel dan kolom:
- Modules (id, name, type, description)
- RoleActiveModules (id, RoleId, ModuleId, canView, canAdd, canEdit, canDelete)
- roles (id, name)

Acceptance Criteria:
a. Pendaftaran modul baru
   - Seeder menambahkan satu baris pada tabel Modules dengan name = 'Website' dan deskripsi yang sesuai.
   - Seeder bersifat idempotent: dijalankan dua kali tidak menghasilkan baris ganda.
b. Pendaftaran rute frontend
   - /admin/websites menuju WebsiteList
   - /admin/websites/create menuju WebsiteCreate
   - /admin/websites/:id menuju WebsiteEdit dengan props true
   - Seluruhnya memakai meta requiresAuth true.
   - Rute /admin/websites/create wajib dideklarasikan sebelum /admin/websites/:id, agar kata create tidak tertangkap sebagai parameter :id.
c. Penempatan dan penandaan menu
   - Item menu Website ditempatkan di dalam dropdown Setting, tepat di bawah Site Setting.
   - Item menu ditandai aktif memakai isActivePrefix('/admin/websites'), sehingga tetap tersorot saat berada di halaman create maupun edit.
d. Penerapan hak akses di antarmuka
   - Item menu hanya tampil jika role memiliki canView pada modul Website.
   - Tombol Tambah tampil hanya jika canAdd, tautan Edit jika canEdit, tombol Hapus jika canDelete.
   - Role bernama admin, super admin, superadmin, atau administrator melihat seluruhnya.
e. Penegakan di sisi backend
   - Penyembunyian elemen di UI tidak dianggap proteksi. Setiap endpoint tetap memvalidasi hak akses melalui requireModulePermission.
f. Post-condition
   - Setelah modul terdaftar, halaman pengaturan role menampilkan baris Website beserta empat kotak centang hak aksesnya.


9. Pengaturan Situs per Website

User Story: Sebagai Admin, saya ingin mengelola pengaturan situs seperti judul, deskripsi, logo, dan SEO untuk website tertentu, agar setiap tenant memiliki identitas tampilan sendiri.

Aktor: Admin
Prasyarat: Website sudah terdaftar dan pengguna memiliki hak akses canView atau canEdit pada modul Setting.

Halaman UI: /admin/pengaturan
Komponen: admin-fe/src/views/pengaturan/SiteSetting.vue
Endpoint baca: GET /api/admin/websites/:id/settings
Endpoint simpan: PUT /api/admin/websites/:id/settings
Endpoint publik: GET /api/admin/websites/public/:id/settings

Tabel dan kolom:
- websites (site_title, title, site_description, seo_keywords, seo_description, logo, admin_email, rate)

Acceptance Criteria:
a. Hak akses endpoint admin
   - GET /:id/settings sudah dilindungi requireAuth dan requireModulePermission('Setting', 'canView').
   - PUT /:id/settings sudah dilindungi requireAuth dan requireModulePermission('Setting', 'canEdit').
   - Kondisi ini dipertahankan, tidak diubah.
b. Perbaikan whitelist pada endpoint simpan
   - Implementasi lama menjalankan website.update(req.body) tanpa penyaringan.
   - Endpoint wajib memakai WRITABLE_FIELDS yang sama dengan Fitur 4, agar id, subdomain, dan domain tidak dapat diubah lewat jalur ini.
c. Perbaikan endpoint publik
   - getSettingsPublic saat ini mengembalikan website.favicon, padahal kolom tersebut tidak ada pada model Website sehingga selalu bernilai undefined.
   - Field favicon dihapus dari response, atau kolomnya ditambahkan lebih dulu melalui migration terpisah.
   - Response publik hanya memuat field aman: site_title, title, site_description, seo_keywords, seo_description, logo. Kolom admin_email dan rate tidak boleh ikut.
d. Penggantian hardcode ID
   - SiteSetting.vue saat ini memakai websiteId bernilai 1 yang ditulis langsung di kode.
   - Pada Fase B, nilai ini diganti menjadi parameter yang dipilih admin.
   - Pada Fase D, nilai ini dihapus sepenuhnya, lihat Fitur 17.
e. Penanganan website tidak ditemukan
   - Jika id tidak ada, kembalikan 404 dengan pesan "Website not found".
f. Post-condition
   - Perubahan pengaturan langsung terbaca oleh endpoint publik tanpa perlu deploy ulang.


===============================================================================


FASE C - PENANDAAN TENANT


10. Migrasi Kolom website_id

User Story: Sebagai Developer, saya ingin seluruh tabel konten dan tampilan memiliki kolom website_id beserta indeksnya, agar setiap baris data dapat diketahui milik tenant yang mana.

Aktor: Developer
Prasyarat: Seluruh fitur Fase A dan Fase B selesai.

Jumlah migration: 10 berkas, satu per tabel.

Tabel dan model (nama tabel ditulis persis seperti di database):
- menu_groups          - model menu_group
- Media                - model Media
- custom_pages         - model CustomPage
- brands               - model Brand
- icons                - model Icon
- layouts              - model Layout
- settings             - model Setting
- FooterSettings       - model FooterSetting
- FormSettings         - model FormSetting
- newsletter_settings  - model NewsletterSettings

Kolom baru pada tiap tabel:
- website_id INTEGER NULL
- Index bernama idx_{nama_tabel}_website_id

Acceptance Criteria:
a. Penambahan kolom dan index
   - Setiap migration menambahkan kolom website_id bertipe INTEGER, NULL sementara hingga backfill selesai.
   - Setiap kolom disertai index. Tanpa index, setiap query yang difilter tenant akan melakukan full table scan.
b. Ketepatan penulisan nama tabel
   - Nama tabel ditulis persis, termasuk huruf besar pada Media, FooterSettings, dan FormSettings.
   - Alasan: MySQL pada macOS umumnya case-insensitive terhadap nama tabel, sedangkan pada Linux produksi case-sensitive. Salah huruf besar akan lolos di lokal dan gagal saat deploy.
   - FooterSettings dan FormSettings memakai nama default hasil pluralisasi Sequelize karena modelnya tidak menyetel tableName.
c. Unique index komposit untuk tabel key-value
   - Tabel settings dan icons menyimpan data dalam bentuk pasangan kunci-nilai.
   - Setelah website_id ditambahkan, unique index diubah menjadi komposit: (website_id, group, key) untuk settings dan (website_id, key) untuk icons.
   - Tanpa ini, dua tenant tidak dapat memiliki kunci yang sama.
d. Tabel yang sengaja tidak diberi kolom
   - menu_items tidak mendapat website_id karena sudah terikat tenant melalui menu_group_id.
   - product_details, listings, dan listing_values tidak diberi kolom karena sudah terikat melalui posts.website_id.
   - post_types, product_types, listing_types, roles, Modules, Users, banks, wallet_types, transaction_types, dan location tetap global sesuai keputusan cakupan.
e. Rollback
   - Setiap migration menyediakan down() yang menghapus kolom, index, dan mengembalikan unique index ke bentuk semula.
f. Post-condition
   - Seluruh model Sequelize terkait diperbarui agar memuat atribut website_id.
   - Fitur 11 dijalankan segera setelah migration ini selesai, dalam rilis yang sama.


11. Backfill Data Lama ke Website Default

User Story: Sebagai Developer, saya ingin seluruh baris data yang sudah ada diberi tanda tenant default, agar tidak ada data yang kehilangan pemilik setelah kolom website_id diaktifkan.

Aktor: Developer
Prasyarat: Fitur 10 selesai dijalankan.

Konfigurasi: DEFAULT_WEBSITE_ID pada berkas .env
Tabel: 10 tabel dari Fitur 10

Acceptance Criteria:
a. Penetapan website default
   - Nilai DEFAULT_WEBSITE_ID ditambahkan ke .env dan ke dokumentasi deployment.
   - Sebelum backfill berjalan, migration memvalidasi bahwa ID tersebut benar-benar ada pada tabel websites. Jika tidak ada, migration dibatalkan.
b. Eksekusi backfill
   - Untuk setiap tabel, jalankan UPDATE {tabel} SET website_id = {default} WHERE website_id IS NULL.
   - Backfill dijalankan dalam satu transaksi per tabel.
c. Verifikasi hasil
   - Setelah backfill, jalankan hitungan verifikasi: jumlah baris dengan website_id IS NULL pada seluruh tabel wajib bernilai 0.
   - Hasil hitungan dicetak ke log migration agar dapat diperiksa.
d. Pengetatan kolom (migration terpisah)
   - Setelah verifikasi bersih, kolom website_id dapat diubah menjadi NOT NULL melalui migration terpisah.
   - Pemisahan ini disengaja agar backfill dapat diulang tanpa memblokir deployment.
e. Peringatan irreversibilitas
   - Backfill tidak dapat dibatalkan otomatis. Setelah seluruh baris ditandai milik satu tenant, pemisahan data ke tenant berbeda harus dilakukan manual.
   - Peringatan ini wajib ditulis pada komentar migration dan pada catatan rilis.
f. Post-condition
   - Sistem tetap berperilaku persis seperti sebelumnya bagi pengguna, karena seluruh data berada pada satu tenant.
   - Belum ada isolasi apa pun pada tahap ini.


12. Menyimpan website_id saat Membuat Data

User Story: Sebagai Admin, saya ingin data baru yang saya buat tercatat sebagai milik website tertentu, agar konten antar tenant dapat dibedakan.

Aktor: Admin
Prasyarat: Fitur 10 dan Fitur 11 selesai.

Controller terdampak: menuController, mediaController, customPageController, BrandController, iconController, layoutController, settingLogoController, footerController, formSettingsController, newsletterController

Tabel dan kolom:
- 10 tabel dari Fitur 10, kolom website_id
- websites (id, is_active) - untuk validasi

Acceptance Criteria:
a. Penerimaan parameter
   - Setiap endpoint POST dan PUT pada controller terdampak menerima website_id dari body request.
   - Pada fase ini backend mempercayai nilai yang dikirim frontend. Ini disengaja dan bersifat sementara.
b. Validasi nilai
   - Sistem memvalidasi bahwa website_id merujuk ke baris yang ada pada tabel websites dan is_active bernilai true.
   - Jika tidak valid, kembalikan 400 Bad Request dengan pesan "Website tidak ditemukan atau nonaktif".
c. Nilai bawaan
   - Jika website_id tidak dikirim sama sekali, sistem mengisinya dengan DEFAULT_WEBSITE_ID.
   - Perilaku ini menjaga kompatibilitas dengan pemanggil lama yang belum diperbarui.
d. Larangan perubahan kepemilikan
   - Pada operasi PUT, kolom website_id tidak boleh diubah. Memindahkan konten antar tenant bukan bagian dari cakupan ini.
   - Nilai website_id yang dikirim pada request update diabaikan.
e. Batas keamanan yang diakui
   - Didokumentasikan eksplisit bahwa pada fase ini siapa pun yang memiliki token dapat menulis data ke website_id mana pun.
   - Fase ini tidak boleh diperlakukan sebagai isolasi. Isolasi baru berlaku setelah Fitur 15.
f. Post-condition
   - Data baru tercatat dengan tenant yang benar dan siap difilter pada Fitur 13.


13. Memfilter Daftar Berdasarkan Website Aktif

User Story: Sebagai Admin, saya ingin daftar menu, media, custom page, brand, dan setelan hanya menampilkan data milik website yang sedang saya kelola, agar saya tidak tercampur dengan data tenant lain.

Aktor: Admin
Prasyarat: Fitur 12 selesai.

Controller terdampak: sama dengan Fitur 12
Tabel: 10 tabel dari Fitur 10, kolom website_id

Acceptance Criteria:
a. Penerapan filter pada query daftar
   - Setiap endpoint GET daftar menambahkan kondisi WHERE website_id = {nilai}.
   - Nilai diambil dari parameter query website_id, atau DEFAULT_WEBSITE_ID bila tidak dikirim.
b. Penerapan filter pada query detail
   - Endpoint GET /:id memvalidasi bahwa baris yang ditemukan memiliki website_id yang cocok.
   - Jika tidak cocok, kembalikan 404, bukan 403, agar keberadaan data milik tenant lain tidak terungkap.
c. Indikator di antarmuka
   - Halaman daftar menampilkan keterangan website yang sedang difilter, agar admin tidak salah menduga datanya hilang.
d. Konsistensi hitungan
   - Seluruh penghitungan jumlah data dan paginasi mengikuti filter yang sama.
e. Verifikasi silang
   - Uji: membuat data pada website A, lalu memfilter dengan website B, wajib menghasilkan daftar kosong.
f. Post-condition
   - Filter masih dapat dilewati dengan mengubah parameter di URL. Penutupan celah ini adalah Fitur 15.


===============================================================================


FASE D - ISOLASI TENANT


14. Resolusi Tenant dari Origin atau Host

User Story: Sebagai Developer, saya ingin sistem menentukan sendiri tenant mana yang sedang diakses berdasarkan header request, agar frontend tidak perlu lagi mengirim website_id dan tenant tidak dapat dipalsukan dari sisi klien.

Aktor: Developer
Prasyarat: Fase C selesai. DNS dan sertifikat untuk tiap tenant sudah disiapkan.

Berkas baru: admin-be/middlewares/resolveTenant.js
Dipasang di: admin-be/server.js, sebelum seluruh route

Tabel dan kolom:
- websites (id, subdomain, domain, is_active)

Acceptance Criteria:
a. Alasan Host saja tidak cukup
   - API berdiri pada satu hostname, sehingga req.headers.host selalu bernilai sama apa pun tenant pemanggilnya.
   - Header yang benar-benar bervariasi per tenant adalah Origin, yang dikirim browser dan sudah didaftarkan pada whitelist CORS.
   - Middleware karena itu tidak boleh mengandalkan Host sebagai satu-satunya sumber.
b. Rantai prioritas resolusi
   - Middleware mengisi req.websiteId dengan urutan berikut, yang lebih atas menang:
     Prioritas 1: header Origin atau Referer dicocokkan ke websites.domain, berlaku untuk situs publik
     Prioritas 2: header Host dicocokkan ke websites.domain, berlaku untuk API dengan hostname per-tenant
     Prioritas 3: parameter website_id eksplisit, berlaku untuk rute admin saja, dinonaktifkan pada akhir fase ini
     Prioritas 4: DEFAULT_WEBSITE_ID dari .env sebagai fallback
c. Pembatasan jalur parameter
   - Prioritas 3 hanya berlaku untuk path yang diawali /api/admin.
   - Jalur ini dimatikan melalui flag konfigurasi setelah Fitur 17 selesai.
   - Jika dibiarkan hidup, isolasi apa pun dapat dilewati cukup dengan menambahkan parameter website_id pada URL.
d. Cache pemetaan domain
   - Pemetaan domain ke id disimpan di memori proses agar tidak menghasilkan query database pada setiap request.
   - Cache dikosongkan setiap kali ada operasi tulis pada tabel websites.
e. Normalisasi nilai
   - Nilai Origin dinormalisasi: skema https, port, dan garis miring akhir dibuang sebelum dicocokkan.
   - Pencocokan dilakukan case-insensitive.
f. Post-condition
   - Seluruh controller dapat membaca req.websiteId tanpa perlu mengurus header sendiri.
   - Nilai ini menjadi satu-satunya sumber kebenaran tenant pada Fitur 15.


15. Penegakan Isolasi Data

User Story: Sebagai Developer, saya ingin filter tenant disisipkan otomatis pada setiap query, agar data satu tenant tidak dapat dibaca atau diubah oleh tenant lain walaupun klien memaksa mengirim parameter.

Aktor: Developer
Prasyarat: Fitur 14 selesai.

Berkas baru: admin-be/middlewares/tenantScope.js
Controller terdampak: 10 controller pemilik tabel pada Fitur 10

Acceptance Criteria:
a. Penyediaan helper
   - Middleware menyediakan fungsi scoped(where, req) yang mengembalikan objek where dengan website_id dari req.websiteId tersisip.
   - Helper dipakai konsisten pada seluruh operasi SELECT, UPDATE, dan DELETE di controller terdampak.
b. Penyisipan pada operasi tulis
   - Pada operasi INSERT, nilai website_id diambil dari req.websiteId, bukan dari body request.
   - Nilai website_id yang dikirim klien pada body diabaikan sepenuhnya.
c. Audit menyeluruh
   - Seluruh query pada 10 controller terdampak diperiksa satu per satu.
   - Hasil audit dicatat dalam bentuk daftar periksa: nama controller, nama fungsi, status sudah atau belum di-scope.
   - Query yang sengaja tidak di-scope wajib diberi komentar penjelas.
d. Pengujian penembusan
   - Uji: request dengan parameter website_id bernilai 99 sementara req.websiteId bernilai 1 wajib mengembalikan data milik tenant 1 saja.
   - Uji: PUT terhadap id milik tenant lain wajib mengembalikan 404.
   - Uji: DELETE terhadap id milik tenant lain wajib mengembalikan 404.
e. Cakupan yang diakui terbatas
   - Isolasi ini hanya berlaku pada 10 tabel bercakupan konten dan tampilan, ditambah posts, categories, dan themes.
   - Modul produk, order, dompet, MLM, dan listing tidak terisolasi. Batasan ini didokumentasikan agar tidak disalahartikan sebagai isolasi menyeluruh.
f. Post-condition
   - Setelah kriteria ini terpenuhi, jalur parameter website_id pada Fitur 14 prioritas 3 dimatikan.


16. Penolakan Akses Lintas Tenant

User Story: Sebagai Developer, saya ingin setiap upaya mengakses data milik tenant lain ditolak dengan respons yang konsisten, agar tidak ada informasi yang bocor melalui perbedaan pesan error.

Aktor: Developer
Prasyarat: Fitur 15 selesai.

Tabel: 13 tabel tenant-aware, yaitu posts, categories, themes, ditambah 10 tabel dari Fitur 10

Acceptance Criteria:
a. Respons baku untuk data tidak terjangkau
   - Upaya mengakses baris milik tenant lain mengembalikan 404 Not Found, bukan 403 Forbidden.
   - Alasan: 403 mengonfirmasi bahwa data tersebut ada, sedangkan 404 tidak membocorkan apa pun.
b. Respons untuk tenant tidak sah pada rute admin
   - Jika pengguna admin secara eksplisit meminta website_id di luar haknya, kembalikan 403 dengan pesan "Anda tidak memiliki akses ke website ini."
   - Pembedaan ini disengaja: pada rute admin, keberadaan tenant lain memang bukan rahasia.
c. Konsistensi pesan
   - Seluruh pesan penolakan memakai format sama dan tidak memuat nama tabel, nama kolom, atau potongan query.
d. Pencatatan percobaan
   - Setiap penolakan lintas tenant dicatat ke log aplikasi (stdout) dengan menyertakan path, nilai req.websiteId, dan website_id yang diminta.
   - Pencatatan ke tabel database menunggu keputusan pada Pertanyaan Terbuka nomor 5.
e. Pengujian
   - Disusun kumpulan uji yang mencakup baca detail, ubah, hapus, dan daftar, masing-masing dengan website_id milik tenant lain.
f. Post-condition
   - Hasil uji dilampirkan sebagai bukti penerimaan Fase D.


17. Pembersihan Hardcode website_id di Frontend

User Story: Sebagai Developer, saya ingin menghapus seluruh nilai website_id yang ditulis langsung di kode frontend, agar tidak ada lagi sumber kebenaran ganda dan tenant sepenuhnya ditentukan backend.

Aktor: Developer
Prasyarat: Fitur 14 dan Fitur 15 selesai.

Berkas terdampak dan bentuk hardcode-nya:
- admin-fe/src/views/posts/PostForm.vue             website_id: 1
- admin-fe/src/views/products/ProductForm.vue       website_id: 1
- admin-fe/src/views/testimonial/TestimonialForm.vue website_id: 1
- admin-fe/src/views/pages/PageForm.vue             website_id: 1
- admin-fe/src/views/listing/ListingForm.vue        website_id: 1
- admin-fe/src/views/pages/CustomPageForm.vue       websiteId = 1
- admin-fe/src/components/theme/AdminTheme.vue      websiteId = 1
- admin-fe/src/components/theme/SchemaEditor.vue    websiteId = ref(1)
- admin-fe/src/views/pengaturan/SiteSetting.vue     websiteId: 1

Berkas tambahan: admin-fe/src/store/index.js dan admin-fe/src/App.vue

Acceptance Criteria:
a. Penghapusan, bukan penggantian
   - Nilai website_id dihapus dari payload request, tidak diganti dengan nilai dari store.
   - Backend mengisi kolom tersebut sendiri melalui req.websiteId.
b. Pembersihan state yang tidak terpakai
   - State websiteId beserta mutation setWebsiteId dan action fetchWebsiteIdFromServer pada store/index.js dihapus.
   - State ini saat ini tidak dipakai satu komponen pun, dan pada arsitektur ini memang tidak akan pernah dipakai.
   - Pemanggilan store.dispatch('fetchWebsiteIdFromServer') pada App.vue ikut dihapus.
c. Penyesuaian komponen tema
   - AdminTheme.vue dan SchemaEditor.vue memanggil endpoint tema tanpa menyertakan websiteId.
   - Endpoint tema di backend disesuaikan agar membaca req.websiteId.
d. Verifikasi menyeluruh
   - Pencarian teks "website_id: 1", "websiteId = 1", dan "websiteId: 1" di seluruh direktori admin-fe/src wajib menghasilkan nol kecocokan.
e. Pengujian regresi
   - Seluruh form yang terdampak diuji ulang: buat data baru, pastikan website_id terisi benar di database.
   - npm run lint berjalan tanpa error.
f. Post-condition
   - Setelah kriteria ini terpenuhi, jalur parameter website_id pada Fitur 14 prioritas 3 dinonaktifkan permanen.


18. Penanganan Tenant Tidak Dikenal dan Nonaktif

User Story: Sebagai Developer, saya ingin sistem memberikan respons yang jelas ketika request datang dari domain yang tidak terdaftar atau menuju tenant yang dinonaktifkan, agar pengunjung dan tim operasional dapat membedakan salah konfigurasi dari kerusakan sistem.

Aktor: Developer
Prasyarat: Fitur 14 selesai.

Berkas terkait: admin-be/middlewares/resolveTenant.js
Tabel dan kolom: websites (id, domain, is_active)

Acceptance Criteria:
a. Domain tidak terdaftar
   - Jika seluruh rantai resolusi gagal dan DEFAULT_WEBSITE_ID tidak dikonfigurasi, kembalikan 404 dengan pesan "Website tidak ditemukan untuk domain ini."
   - Jika DEFAULT_WEBSITE_ID dikonfigurasi, sistem memakainya dan mencatat peringatan ke log.
b. Tenant dinonaktifkan
   - Jika tenant ditemukan namun is_active bernilai false, kembalikan 503 Service Unavailable dengan pesan "Situs ini sedang tidak aktif."
   - Pembedaan 404 dan 503 disengaja: yang pertama berarti salah alamat, yang kedua berarti sengaja dimatikan.
c. Pengecualian rute
   - Rute autentikasi /api/auth dan /customer/auth serta berkas statis /uploads dikecualikan dari resolusi tenant, agar login tetap mungkin walau tenant bermasalah.
d. Perilaku pada panel admin
   - Panel admin tidak boleh ikut terkunci ketika satu tenant dinonaktifkan.
   - Admin tetap dapat membuka daftar website dan mengaktifkan kembali tenant tersebut.
e. Pencatatan
   - Setiap kegagalan resolusi dicatat ke log aplikasi beserta nilai Origin, Host, dan path yang diminta.
f. Post-condition
   - Tim operasional dapat mendiagnosis salah konfigurasi DNS langsung dari log tanpa perlu membuka database.



===============================================================================


FASE E - PERBAIKAN DOMPET SALDO


Fase ini berdiri sendiri dan tidak bergantung pada Fase A sampai D. Tabel dompet
tidak mendapat kolom website_id dan tetap global.

Seluruh temuan di bawah berasal dari pembacaan kode pada 28 Agustus 2026. Setiap
fitur diawali kriteria verifikasi kondisi awal, karena fase ini menyentuh saldo
customer. Kesalahan di sini berakibat langsung ke uang, bukan ke tampilan.

Urutan 19 sampai 23 mengikat. Mengerjakan Fitur 22 sebelum Fitur 21 selesai akan
memunculkan kerusakan yang lebih besar daripada kondisi sekarang.


19. Perbaikan Guard Saldo pada Pembayaran Order

User Story: Sebagai Sistem, saya ingin pembayaran order dengan saldo ditolak ketika saldo customer tidak mencukupi, agar saldo tidak dapat menjadi negatif akibat pengecekan yang tidak pernah berjalan.

Aktor: Developer
Prasyarat: Tidak ada. Ini pekerjaan pertama pada Fase E dan yang paling mendesak.

Berkas terkait:
- admin-be/controllers/customer/orderController.js (dua lokasi, sekitar baris 138 dan 301)
- admin-be/services/walletServices.js

Tabel dan kolom:
- wallet_histories (id, username, transaction_type_id, wallet_type_id, reference_id, balance_before, amount, balance_after, remarks, status, created_at)
- orders, orderpayments - tidak ada perubahan kolom

Kondisi awal:
- getWallet() mengembalikan angka, bukan objek. Nilai kembalinya adalah penjumlahan starting balance dengan seluruh mutasi sesudahnya.
- Kedua pemanggil di orderController.js membaca walletData.balance, yang selalu bernilai undefined.
- Perbandingan undefined dengan angka selalu bernilai false, sehingga cabang penolakan tidak pernah dieksekusi.
- Akibatnya customer bersaldo nol tetap dapat menyelesaikan order berbayar-saldo.

Acceptance Criteria:
a. Verifikasi kondisi awal (membuktikan masalah)
   - Wajib ada bukti reproduksi sebelum perbaikan ditulis: satu customer bersaldo nol mengirim order dengan use_balance bernilai true, dan order berhasil dibuat.
   - Bukti disimpan sebagai skrip atau catatan langkah, bukan sekadar pernyataan.
b. Penetapan kontrak getWallet()
   - Nilai kembali getWallet() ditetapkan tetap berupa angka, bukan objek.
   - Alasan: pemanggil lain, yaitu admin-be/controllers/transaksi/walletController.js, sudah memperlakukannya sebagai angka. Mengubahnya menjadi objek akan merusak jalur yang sekarang benar.
c. Perbaikan kedua pemanggil
   - Kedua lokasi di orderController.js membandingkan nilai kembali secara langsung, bukan lewat properti balance.
   - Pencarian teks walletData.balance di seluruh admin-be wajib menghasilkan nol kecocokan setelah perbaikan.
d. Penolakan saldo tidak cukup
   - Bila saldo kurang, sistem mengembalikan 400 dengan pesan "Saldo tidak mencukupi".
   - Transaksi database di-rollback sepenuhnya: tidak ada baris orders, orderdetails, maupun orderpayments yang tertinggal.
e. Pemotongan saldo ikut transaksi order
   - updateWalletBalance() saat ini dipanggil tanpa meneruskan objek transaksi, sehingga baris wallet_histories tetap tertulis walaupun transaksi order kemudian gagal.
   - Fungsi tersebut diberi parameter transaksi opsional, dan orderController.js meneruskan transaksi yang sedang berjalan.
   - Diuji dengan memaksa kegagalan setelah pemotongan saldo: tidak boleh ada baris ledger yang tersisa.
f. Post-condition
   - Saldo tidak dapat lagi menjadi negatif lewat jalur pembayaran order.
   - Penanganan saldo negatif yang mungkin sudah terbentuk di produksi ditentukan terpisah, lihat Pertanyaan Terbuka nomor 6.


20. Satu Sumber Kebenaran Saldo

User Story: Sebagai Developer, saya ingin hanya ada satu cara menjawab pertanyaan berapa saldo seorang customer, agar nilai yang ditampilkan, nilai yang dipotong, dan nilai yang dipakai memvalidasi penarikan tidak saling bertentangan.

Aktor: Developer
Prasyarat: Fitur 19 selesai.

Berkas terkait:
- admin-be/services/walletServices.js
- admin-be/controllers/transaksi/topupController.js
- admin-be/controllers/transaksi/withdrawController.js
- admin-be/controllers/customer/orderController.js

Tabel dan kolom:
- wallet_histories - kolom yang disorot: amount, balance_before, balance_after, status
- starting_balances (id, username, wallet_type_id, balance, date)

Kondisi awal, ada dua sumber saldo yang hidup berdampingan:
- getWallet() menghitung ulang dari starting_balances terakhir ditambah jumlah amount sesudahnya. Dipakai oleh tampilan saldo customer dan admin, serta pembayaran order.
- Kolom wallet_histories.balance_after menyimpan running balance pada baris terakhir. Dipakai oleh persetujuan topup dan pengajuan withdraw.
- Pemutus rantainya: updateWalletBalance(), satu-satunya penulis ledger pada jalur pembayaran order, tidak mengisi balance_before dan balance_after. Kedua barisnya dinonaktifkan sebagai komentar, sehingga kolom terisi nilai default nol.

Skenario kegagalan yang dapat direproduksi:
   1. Customer topup 100.000 dan disetujui admin. Baris ledger mencatat balance_after 100.000. Kedua sumber sepakat.
   2. Customer membayar order 10.000 dengan saldo. Baris ledger baru mencatat amount -10.000 dan balance_after 0.
   3. getWallet() menjawab 90.000. Baris terakhir menjawab 0.
   4. Customer mengajukan withdraw 50.000 dan ditolak dengan pesan saldo tidak mencukupi, padahal saldonya cukup.
   5. Customer topup lagi 20.000. Saldo sebelumnya dibaca 0, sehingga balance_after ditulis 20.000, bukan 110.000.

Acceptance Criteria:
a. Verifikasi kondisi awal
   - Lima langkah skenario di atas dijalankan dan hasilnya dicatat sebelum perbaikan ditulis.
b. Penetapan sumber tunggal
   - getWallet() ditetapkan sebagai satu-satunya sumber kebenaran saldo.
   - Alasan: ia dihitung dari ledger, sehingga tidak dapat menyimpang karena satu penulis lupa memperbarui kolom.
c. Nasib kolom balance_before dan balance_after
   - Keputusan dipilih lebih dulu, lihat Pertanyaan Terbuka nomor 7. Dua opsi yang tersedia:
   - Opsi dipertahankan sebagai jejak audit. updateWalletBalance() wajib mengisinya, dan seluruh penulis ledger memakai satu helper yang sama. Kolom tidak boleh dibaca untuk mengambil keputusan.
   - Opsi ditinggalkan. Kolom dibiarkan ada demi data historis, tetapi tidak lagi ditulis maupun dibaca, dan ditandai usang di model.
   - Yang tidak boleh: kolom tetap dibaca untuk mengambil keputusan seperti sekarang.
d. Pembersihan pembaca kolom
   - topupController.js berhenti membaca balance_after untuk menghitung saldo sebelumnya.
   - withdrawController.js berhenti membaca balance_after untuk memvalidasi kecukupan saldo. Keduanya memanggil getWallet().
   - Pencarian teks balance_after di seluruh admin-be/controllers hanya boleh tersisa pada baris penulisan, bukan pembacaan untuk keputusan.
e. Pengujian regresi
   - Skenario lima langkah pada bagian kondisi awal diulang. Pada langkah 4 withdraw harus diterima, dan pada langkah 5 saldo harus terbaca 110.000.
f. Post-condition
   - Hanya satu fungsi yang berhak menjawab pertanyaan berapa saldo user.
   - Fitur 21 baru boleh dimulai setelah kriteria ini terpenuhi.


21. Penyeragaman Aturan Status pada Perhitungan Saldo

User Story: Sebagai Developer, saya ingin seluruh jalur perhitungan saldo memakai aturan status yang sama, agar saldo tidak berubah nilainya hanya karena dihitung oleh kode yang berbeda.

Aktor: Developer
Prasyarat: Fitur 20 selesai.

Berkas terkait:
- admin-be/services/walletServices.js
- admin-be/cron/cronStartingBalance.js
- admin-be/controllers/transaksi/withdrawController.js

Tabel dan kolom:
- wallet_histories.status ENUM pending, success, failed, canceled

Kondisi awal, dua aturan yang bertentangan:
- getWallet() menjumlahkan semua baris tanpa filter status, termasuk pending, failed, dan canceled. Ada komentar eksplisit di kode yang berbunyi sum semua transaksi termasuk failed dan canceled.
- cronStartingBalance.js hanya menjumlahkan baris berstatus success.
- Perbedaan ini belum terasa karena cron tidak pernah berjalan, lihat Fitur 22.
- Pola penulisan yang berlaku sekarang: withdraw memakai entri penyeimbang, bukan pengubahan nilai. Saat pengajuan ditulis baris amount negatif berstatus pending. Saat ditolak ditulis baris baru amount positif berstatus canceled, dan baris lama diubah statusnya menjadi failed.

Acceptance Criteria:
a. Verifikasi kondisi awal
   - Aturan status pada setiap jalur perhitungan didaftar dan dibuktikan dari kode, bukan dari asumsi.
b. Penetapan aturan tunggal
   - Aturan yang ditetapkan: jumlahkan seluruh baris tanpa memfilter status.
   - Alasannya bukan selera. Karena pembatalan diwujudkan sebagai entri penyeimbang, memfilter status success akan membuang baris pending yang sudah punya penyeimbang canceled, sehingga pembatalan terhitung dua kali dan saldo customer naik tanpa sebab.
c. Kewajiban entri penyeimbang
   - Seluruh penulis ledger wajib memakai pola entri penyeimbang.
   - Baris historis wallet_histories tidak boleh dihapus, dan nilai amount-nya tidak boleh diubah. Yang boleh berubah hanya kolom status sebagai penanda.
d. Penyesuaian cron
   - Filter status success pada cronStartingBalance.js dihapus agar mengikuti aturan yang sama.
   - Perubahan ini dikerjakan di sini, bukan di Fitur 22, supaya cron tidak pernah aktif dengan aturan yang salah.
e. Pengujian
   - Skenario: topup 100.000 disetujui, ajukan withdraw 40.000, lalu tolak withdraw tersebut. Saldo akhir wajib kembali tepat 100.000 pada seluruh jalur pembacaan.
   - Skenario diulang dengan getWallet() dan dengan perhitungan cron secara manual. Keduanya wajib menghasilkan angka yang sama.
f. Post-condition
   - Aturan status didokumentasikan sebagai komentar tunggal di walletServices.js.
   - Fitur 22 baru boleh dimulai setelah kriteria ini terpenuhi.


22. Pengaktifan Cron Snapshot Saldo Harian

User Story: Sebagai Sistem, saya ingin snapshot saldo harian benar-benar berjalan setiap tengah malam untuk seluruh pemilik saldo, agar perhitungan saldo tidak perlu menjumlahkan seluruh riwayat sejak awal dan tetap cepat saat data bertambah banyak.

Aktor: Developer
Prasyarat: Fitur 21 selesai. Prasyarat ini tidak boleh dilewati.

Berkas terkait:
- admin-be/cron/cronStartingBalance.js
- admin-be/cron/cronStartingBalanceScheduler.js
- admin-be/server.js
- admin-be/services/walletServices.js

Tabel dan kolom:
- starting_balances (id, username, wallet_type_id, balance, date)
- wallet_histories, Customers, Users

Kondisi awal: mekanismenya ada di kode, tetapi tidak pernah dieksekusi. Lima cacat bertumpuk.
   1. Scheduler tidak pernah dimuat. cronStartingBalanceScheduler.js tidak di-require di server.js maupun berkas lain mana pun.
   2. Memanggil fungsi yang tidak ada. Scheduler memanggil updateStartingBalanceAll, sedangkan modulnya mengekspor updateStartingBalance.
   3. Menyapu tabel yang salah. cronStartingBalance.js mengambil daftar username dari User, yaitu staf admin, padahal seluruh saldo dimiliki Customer.
   4. Efek samping saat impor. cronStartingBalance.js memanggil updateStartingBalance() di badan modul, sehingga sekadar me-require berkasnya memicu pemrosesan seluruh pengguna.
   5. Fungsi kembar yang rusak. updateStartingBalance() di walletServices.js menyaring kolom HistoryDate yang tidak ada di tabel maupun model. Fungsi ini tidak dipanggil siapa pun.

Acceptance Criteria:
a. Verifikasi kondisi awal
   - Pencarian teks cronStartingBalanceScheduler di seluruh repositori wajib dibuktikan menghasilkan nol pemanggil sebelum perbaikan.
   - Isi tabel starting_balances diperiksa. Bila kosong atau basi, itu menjadi bukti pendukung.
b. Perbaikan nama fungsi dan pemuatan
   - Nama fungsi yang diekspor dan yang dipanggil disamakan.
   - Scheduler dimuat dari server.js, dan pemuatannya dicatat ke log saat aplikasi start.
c. Perbaikan sumber pengguna
   - Daftar pemilik saldo diambil dari Customer, bukan User.
   - Alternatif yang lebih tahan salah: ambil daftar username yang benar-benar punya baris di wallet_histories, sehingga cron tidak memproses akun yang tidak pernah bertransaksi.
d. Penghapusan efek samping impor
   - Pemanggilan updateStartingBalance() di badan modul dihapus. Fungsi hanya berjalan bila dipanggil scheduler atau perintah manual.
e. Kesetaraan hasil
   - Setelah cron berjalan, getWallet() untuk setiap customer wajib menghasilkan angka yang sama persis dengan sebelum cron berjalan.
   - Pengujian dilakukan pada salinan data, bukan produksi. Catat saldo seluruh customer, jalankan cron, hitung ulang, lalu bandingkan. Selisih satu customer pun berarti kriteria tidak terpenuhi.
f. Post-condition
   - Snapshot berjalan setiap hari pukul 00:00 WIB dan tercatat di log.
   - Klaim snapshot saldo harian baru boleh dipakai di materi penjualan setelah kriteria ini terpenuhi.


23. Pembersihan Kode Dompet yang Tidak Terpakai

User Story: Sebagai Developer, saya ingin menghapus sisa kode dompet dari desain lama yang tidak dapat berjalan, agar tidak ada orang yang keliru memakainya sebagai acuan saat menambah fitur.

Aktor: Developer
Prasyarat: Fitur 22 selesai.

Berkas terkait:
- admin-be/utils/walletTransaction.js
- admin-be/services/walletServices.js
- admin-be/controllers/transaksi/walletController.js

Kondisi awal:
- utils/walletTransaction.js me-require ../../models, yang dari folder utils menunjuk ke luar direktori proyek dan tidak ada. Isinya memakai model Wallet berkolom balance yang tidak terdaftar sama sekali, serta memanggil WalletSummary dengan nama kolom berbeda dari model yang berlaku. Tidak ada satu berkas pun yang mengimpornya.
- updateStartingBalance() di walletServices.js menyaring kolom HistoryDate yang tidak ada. Tidak dipanggil siapa pun, dan tumpang tindih dengan fungsi bernama sama di cron/cronStartingBalance.js.
- walletController.js mengimpor nama Wallet, padahal model tersebut tidak terdaftar sehingga bernilai undefined. Saat ini tidak dipakai, sehingga belum menimbulkan galat, tetapi menyesatkan.

Acceptance Criteria:
a. Verifikasi sebelum menghapus
   - Untuk setiap berkas dan fungsi di atas, dibuktikan lebih dulu bahwa tidak ada pemanggil, lewat pencarian teks di seluruh admin-be dan admin-fe.
   - Bukti dicatat. Tidak ada penghapusan tanpa bukti.
b. Penghapusan berkas mati
   - utils/walletTransaction.js dihapus.
c. Penghapusan fungsi kembar
   - updateStartingBalance() pada walletServices.js dihapus, beserta namanya di module.exports.
   - Satu-satunya pemilik logika snapshot adalah cron/cronStartingBalance.js.
d. Pembersihan impor
   - Nama Wallet dihapus dari daftar impor walletController.js.
   - Nama lain yang diimpor tetapi tidak dipakai di berkas yang sama ikut dibersihkan.
e. Verifikasi tidak ada regresi
   - Aplikasi start tanpa galat.
   - Seluruh endpoint dompet, yaitu saldo saya, riwayat, topup, withdraw, dan adjust, diuji ulang dan tetap berfungsi.
f. Post-condition
   - Modul dompet hanya menyisakan satu jalur perhitungan saldo, satu penulis ledger, dan satu pemilik logika snapshot.


===============================================================================


PERTANYAAN TERBUKA

Tujuh hal berikut belum dapat dijawab dari kode maupun dokumen arsitektur, dan memblokir fitur yang disebut.

1. Panel admin akan disajikan per-tenant (admin.namatenant.id) atau tetap satu domain? Jika tetap satu domain, satu instalasi admin hanya dapat mengelola satu website.
   Memblokir: Fitur 14 dan Fitur 17

2. Endpoint GET /api/admin/websites dan GET /:id mau ditutup? Saat ini terbuka tanpa auth dan GET /:id memuat kolom admin_email.
   Memblokir: Fitur 7

3. Website default untuk data lama, apakah id bernilai 1?
   Memblokir: Fitur 11

4. Setelan transaksi mau pindah ke tabel sendiri atau tetap satu tabel dengan kolom group?
   Memblokir: Fitur 1

5. Apakah proyek ini memerlukan tabel audit log terpusat seperti user_logs? Saat ini tidak ada sama sekali, sehingga acceptance criteria di atas tidak mensyaratkan pencatatan audit.
   Memblokir: Fitur 16

6. Saldo negatif yang mungkin sudah terbentuk di produksi perlu direkonsiliasi, atau cukup dihentikan pendarahannya? Guard saldo tidak pernah aktif, sehingga order berbayar-saldo dapat lolos tanpa saldo yang mencukupi.
   Memblokir: Fitur 19

7. Kolom wallet_histories.balance_before dan balance_after dipertahankan sebagai jejak audit, atau ditinggalkan? Sekarang keduanya diisi tidak konsisten, yaitu bernilai nol pada jalur pembayaran order.
   Memblokir: Fitur 20
