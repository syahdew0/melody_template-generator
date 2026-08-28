CATATAN PEMAKAIAN

Berkas ini berisi HANYA isi bagian "2. Fitur" untuk ditempel ke dokumen Word.
Bagian "1. Identitas User Story" dan "3. Persetujuan" diisi sendiri.

Ditulis tanpa heading Markdown, tanpa tabel pipa, dan tanpa backtick, supaya hasil
salin-tempel ke Word tidak berantakan. Setelah ditempel, tinggal menebalkan baris
nama fitur, yaitu 45 baris yang diawali kode MLD.

Proyek: Melody CMS - Template Generator AI (Melody v2)
Acuan kebutuhan: whislist melody v2 template generator.pdf, 19 Agustus 2026
Acuan arsitektur: ARSITEKTUR-TARGET-MELODY-V2.md

CATATAN: dokumen ini TERPISAH dari USER-STORY-MULTITENANT-FITUR.md.
Yang itu untuk mengembangkan repo meolody_cms yang ada sekarang menjadi
multi-tenant. Yang ini untuk membangun produk SaaS baru di atasnya.

===============================================================================


ASUMSI ARSITEKTUR YANG DIPAKAI

Seluruh acceptance criteria di bawah berdiri di atas empat keputusan berikut.
Jika salah satu keputusan berubah, dokumen ini wajib direvisi.

1. Satu database, dua aplikasi.
   melody-be dan admin-be berbagi MySQL yang sama. Tidak ada kontrak API antar
   sistem. Sebagai gantinya berlaku aturan kepemilikan tabel:
   - Tabel bersama (websites, Customers, themes, custom_pages, posts, categories,
     Media, contact_messages) - migration hanya boleh lahir di admin-be.
   - Tabel milik Melody - seluruhnya berprefix mv_, migration lahir di melody-be.
   - Tabel milik lama (orders, wallet, mlm, dan seterusnya) - tidak disentuh
     melody-be.

2. Identitas pemilik situs memakai tabel Customers yang sudah ada, ditambah
   kolom psg_account_id, is_site_owner, is_super_admin, dan avatar.

3. Rendering situs tenant bersifat schema-driven saat request (runtime), bukan
   static generation. Satu aplikasi melody-renderer melayani seluruh subdomain,
   membaca themes.schema dan custom_pages.items.

4. Ecommerce dibangun baru dengan tabel mv_ sendiri. Tabel orders dan
   product_details milik admin-be tidak dipakai tenant Melody.

Lima aplikasi yang terlibat:
- melody-renderer  (baru)  melayani *.melodyv2.phisoft.co.id
- melody-be        (baru)  API builder, langganan, console
- melody-fe        (baru)  dashboard pengguna dan console super admin
- admin-be         (ada)   CMS konten klien compro lama
- admin-fe         (ada)   panel admin klien compro lama


RINGKASAN TABEL BARU (mv_)

Tipe situs dan katalog:
- mv_site_types          (id, code, name, allowed_sections JSON, is_active)
- mv_section_catalog     (id, code, name, category, variants JSON, props_schema JSON, sort_order, is_active)
- mv_templates           (id, site_type_id, name, industry, thumbnail, schema JSON, is_active)

AI Builder:
- mv_chat_sessions       (id, website_id, customer_id, status, created_at)
- mv_chat_messages       (id, session_id, role, content, tool_calls JSON, tokens_in, tokens_out, cost, created_at)
- mv_site_versions       (id, website_id, parent_version_id, snapshot JSON, label, created_by, created_at)
- mv_ai_jobs             (id, session_id, job_type, status, payload JSON, result JSON, error_message, created_at, finished_at)
- mv_ai_suggestions      (id, website_id, suggestion_type, content, status, created_at)
- mv_ai_config           (id, feature_key, provider, model, effort, temperature, max_tokens, system_prompt, is_active)

Subdomain dan publikasi:
- mv_reserved_subdomains (id, word, type, created_at)

Langganan dan kuota:
- mv_plans               (id, code, name, price_monthly, price_yearly, limits JSON, is_best_value, is_active)
- mv_subscriptions       (id, customer_id, plan_id, status, billing_cycle, current_period_start, current_period_end, trial_ends_at)
- mv_invoices            (id, subscription_id, invoice_number, amount, currency, status, issued_date, due_date, paid_on)
- mv_payments            (id, invoice_id, gateway, external_id, amount, status, payload_json, created_at)
- mv_credit_ledger       (id, customer_id, balance_before, amount, balance_after, reference_type, reference_id, remarks, created_at)
- mv_usage_daily         (id, customer_id, period_date, tokens_in, tokens_out, cost, message_count)

Dashboard dan moderasi:
- mv_site_stats_daily    (id, website_id, stat_date, visits, unique_visitors, top_pages JSON, referrers JSON, devices JSON)
- mv_moderation_flags    (id, website_id, flag_type, source, keyword, status, reviewed_by, reviewed_on, notes)
- mv_notification_outbox (id, customer_id, channel, to_address, template_key, payload_json, status, sent_on, error_message)

Konten dan tampilan:
- mv_site_widgets        (id, website_id, widget_key, config JSON, sort_order, is_active)
- mv_site_translations   (id, website_id, locale, path, value)

Ecommerce:
- mv_product_categories  (id, website_id, name, slug, parent_id, sort_order)
- mv_products            (id, website_id, category_id, name, slug, description, price, compare_at_price, stock, status, images JSON)
- mv_product_variants    (id, product_id, combination, sku, price, stock, image)
- mv_carts               (id, website_id, session_token, customer_email, status, created_at)
- mv_cart_items          (id, cart_id, product_id, variant_id, qty, price)
- mv_orders              (id, website_id, order_number, buyer_name, buyer_email, buyer_phone, shipping_address JSON, subtotal, shipping_cost, discount, total, status, tracking_number, promo_code_id)
- mv_order_items         (id, order_id, product_id, variant_id, product_name, qty, price, subtotal)
- mv_order_payments      (id, order_id, gateway, method, external_id, amount, status, payload_json, paid_on)
- mv_shipping_rates      (id, website_id, courier, service, cost, etd, fetched_at)
- mv_promo_codes         (id, website_id, code, discount_type, discount_value, max_usage, used_count, starts_on, ends_on, is_active)
- mv_promo_usages        (id, promo_code_id, order_id, used_on)

Kolom baru pada tabel bersama:
- websites   + owner_customer_id, site_type_id, status, published_at, custom_domain, is_active
- Customers  + psg_account_id, is_site_owner, is_super_admin, avatar
- contact_messages + website_id
- Media      + website_id

===============================================================================


A. AUTENTIKASI DAN AKUN


MLD-005 - Login via PSG Account (SSO OIDC dan PKCE)

User Story: Sebagai Pengunjung, saya ingin masuk memakai akun PSG Account saya, agar saya tidak perlu membuat kata sandi baru dan pengalaman masuknya konsisten dengan produk PSG lainnya.

Aktor: Pengunjung dan Pengguna Terdaftar
Prasyarat: PSG Account sudah berjalan sebagai penyedia OIDC. Lihat Pertanyaan Terbuka nomor 3.

Halaman UI: /login
Endpoint mulai: GET /auth/psg/authorize
Endpoint callback: GET /auth/psg/callback

Tabel dan kolom:
- Customers (id, username, email, password, email_verified, avatar)
- Customers kolom baru: psg_account_id VARCHAR(128) NULL UNIQUE
- Customers kolom baru: is_site_owner BOOLEAN NOT NULL DEFAULT false
- Customers kolom baru: is_super_admin BOOLEAN NOT NULL DEFAULT false

Acceptance Criteria:
a. Alur otorisasi
   - Sistem membangkitkan code_verifier dan code_challenge (PKCE, metode S256) serta parameter state acak.
   - code_verifier dan state disimpan sementara di sesi server, bukan di localStorage.
   - Pengguna diarahkan ke endpoint authorize milik PSG Account.
b. Validasi callback
   - Sistem memverifikasi bahwa state yang kembali sama persis dengan yang dikirim. Jika tidak, tolak dengan 400 dan pesan "Sesi login tidak valid, silakan ulangi."
   - Sistem menukar authorization code dengan token memakai code_verifier.
   - Sistem memvalidasi signature dan masa berlaku id_token.
c. Auto-link metode login
   - Sistem mencari baris Customers berdasarkan psg_account_id (klaim sub dari id_token).
   - Jika tidak ditemukan, sistem mencari berdasarkan email hasil normalisasi huruf kecil.
   - Jika ditemukan lewat email, sistem mengisi psg_account_id pada baris tersebut, sehingga akun lama otomatis tertaut.
   - Jika tetap tidak ditemukan, sistem membuat baris Customers baru dengan is_site_owner bernilai true dan email_verified bernilai true.
d. Pembangkitan username untuk pengguna SSO
   - Kolom Customers.username bersifat unique dan wajib, sedangkan pengguna SSO tidak punya username alami.
   - Sistem membangkitkan username dari bagian lokal alamat email, dinormalisasi menjadi huruf kecil dan hanya menyisakan a-z, 0-9, titik, dan garis bawah.
   - Jika sudah dipakai, sistem menambahkan sufiks angka berurutan sampai unik.
   - Lihat Pertanyaan Terbuka nomor 4.
e. Token handoff pendek
   - Setelah tertaut, sistem menerbitkan JWT aplikasi dengan masa berlaku pendek dan menyerahkannya ke frontend melalui redirect satu kali pakai.
   - Token tidak boleh dikirim sebagai parameter query yang tersimpan di riwayat peramban.
f. Post-condition
   - Pengguna diarahkan ke /dashboard.
   - Jika pengguna belum memiliki situs sama sekali, diarahkan ke alur pemilihan tipe situs pada MLD-008.


MLD-006 - Profil Pengguna, Ganti Password, dan Hapus Akun

User Story: Sebagai Pengguna Terdaftar, saya ingin mengubah nama dan foto profil, mengganti kata sandi, serta menghapus akun saya, agar saya memegang kendali penuh atas data pribadi saya.

Aktor: Pengguna Terdaftar
Prasyarat: Sudah login.

Halaman UI: /settings/profile
Endpoint: GET dan PUT /api/me
Endpoint ganti password: PUT /api/me/password
Endpoint hapus akun: DELETE /api/me

Tabel dan kolom:
- Customers (id, username, email, no_hp, password, avatar, psg_account_id)
- websites (owner_customer_id, status)
- mv_subscriptions (customer_id, status)

Acceptance Criteria:
a. Ubah profil
   - Field yang boleh diubah: nama tampilan, no_hp, dan avatar.
   - Kolom email dan username tidak dapat diubah dari halaman ini.
   - Avatar diunggah sebagai berkas gambar, dikompresi, lalu URL-nya disimpan pada Customers.avatar.
b. Ganti password dengan validasi policy
   - Form meminta password lama, password baru, dan konfirmasi password baru.
   - Password baru minimal 8 karakter dan wajib mengandung kombinasi huruf dan angka.
   - Sistem memverifikasi password lama memakai bcrypt compare sebelum menyimpan.
   - Password baru disimpan dalam bentuk hash bcrypt, tidak pernah plaintext.
c. Ganti password untuk pengguna SSO
   - Jika Customers.psg_account_id terisi dan Customers.password kosong, menu ganti password disembunyikan.
   - Sebagai gantinya ditampilkan tautan ke halaman pengelolaan akun PSG Account.
d. Hapus akun dengan penjagaan
   - Sistem menolak penghapusan jika pengguna masih memiliki situs berstatus published, dengan pesan yang menyebut jumlah situsnya.
   - Sistem menolak penghapusan jika pengguna masih memiliki langganan berstatus active, dengan saran membatalkan langganan lebih dulu.
e. Eksekusi penghapusan
   - Jika lolos penjagaan, sistem melakukan soft delete: mengisi deleted_on, mengosongkan email dan no_hp, serta mencabut seluruh sesi.
   - Situs berstatus draft milik pengguna ikut dinonaktifkan.
   - Penghapusan permanen mengikuti kebijakan retensi terpisah.
f. Post-condition
   - Setelah penghapusan, pengguna diarahkan ke halaman publik dengan pesan konfirmasi.
   - Alamat email yang sudah dihapus tidak dapat langsung dipakai mendaftar ulang selama masa tunggu yang ditetapkan.


===============================================================================


B. PEMBUATAN SITUS DENGAN AI (FITUR INTI)


MLD-008 - Pemilihan Tipe Situs saat Memulai

User Story: Sebagai Pengguna, saya ingin memilih tipe situs di awal (Company Profile, Portfolio, atau Ecommerce), agar kumpulan bagian halaman dan fitur yang tersedia menyesuaikan kebutuhan usaha saya.

Aktor: Pengguna Terdaftar
Prasyarat: Sudah login dan kuota jumlah situs pada paketnya belum habis.

Halaman UI: /sites/new
Endpoint daftar tipe: GET /api/site-types
Endpoint buat situs: POST /api/sites

Tabel dan kolom:
- mv_site_types (id, code, name, description, allowed_sections JSON, is_active)
- websites (id, name, subdomain, owner_customer_id, site_type_id, status, is_active)
- mv_plans (limits JSON) - untuk memeriksa batas jumlah situs

Acceptance Criteria:
a. Daftar tipe situs
   - Sistem melakukan SELECT ke mv_site_types dengan filter is_active bernilai true.
   - Nilai code yang tersedia pada rilis pertama: company_profile, portfolio, ecommerce.
   - Setiap tipe ditampilkan sebagai kartu berisi nama, deskripsi singkat, dan ikon.
b. Pengaruh tipe terhadap bagian halaman
   - Kolom allowed_sections berisi array kode bagian halaman yang merujuk mv_section_catalog.code.
   - AI Builder pada MLD-009 hanya boleh memakai bagian halaman yang terdaftar pada allowed_sections tipe terpilih.
   - Tipe ecommerce mengaktifkan modul katalog produk, keranjang, dan pesanan.
c. Pemeriksaan kuota jumlah situs
   - Sebelum situs dibuat, sistem menghitung jumlah websites milik pengguna dengan owner_customer_id yang sama dan is_active bernilai true.
   - Jika sudah mencapai batas pada mv_plans.limits, sistem menolak dengan 402 dan menampilkan ajakan upgrade.
d. Pembuatan baris situs
   - Sistem melakukan INSERT ke websites dengan owner_customer_id dari sesi, site_type_id terpilih, status bernilai draft, dan is_active bernilai true.
   - Kolom subdomain dibiarkan kosong pada tahap ini, diisi kemudian pada MLD-035.
e. Larangan mengubah tipe setelah situs berisi
   - Tipe situs tidak dapat diubah setelah situs memiliki minimal satu versi tersimpan pada mv_site_versions.
   - Alasannya, bagian halaman yang sudah dipakai bisa jadi tidak tersedia pada tipe tujuan.
f. Post-condition
   - Pengguna diarahkan ke halaman AI Builder pada MLD-009 dengan konteks website_id yang baru dibuat.


MLD-009 - Chat AI Builder

User Story: Sebagai Pengguna, saya ingin menjelaskan usaha saya dalam bahasa sehari-hari lalu AI menyusun struktur situs, teks, tema, dan gambar secara otomatis, agar saya bisa punya website tanpa perlu keahlian teknis.

Aktor: Pengguna Terdaftar
Prasyarat: Situs sudah dibuat pada MLD-008 dan kuota pesan AI masih tersedia.

Halaman UI: /sites/:websiteId/builder
Endpoint chat: POST /api/sites/:websiteId/chat (respons streaming)

Tabel dan kolom:
- mv_chat_sessions (id, website_id, customer_id, status, created_at)
- mv_chat_messages (id, session_id, role, content, tool_calls JSON, tokens_in, tokens_out, cost, created_at)
- mv_section_catalog (code, name, props_schema JSON, variants JSON)
- mv_ai_config (feature_key, provider, model, effort, temperature, max_tokens, system_prompt)
- mv_credit_ledger (customer_id, balance_after)
- themes (website_id, schema JSON)
- custom_pages (theme_id, page, items JSON)

Acceptance Criteria:
a. Pemeriksaan kuota sebelum memproses
   - Sebelum memanggil model, sistem menghitung saldo kredit dari mv_credit_ledger baris terakhir milik pengguna.
   - Jika saldo tidak mencukupi, sistem mengembalikan 402 beserta ajakan upgrade, dan tidak memanggil model sama sekali.
b. Penyusunan konteks
   - Sistem membaca mv_ai_config dengan feature_key bernilai builder untuk menentukan provider, model, effort, dan system prompt.
   - Sistem memuat mv_section_catalog yang kodenya terdaftar pada allowed_sections tipe situs, lalu memberikannya kepada model sebagai daftar tool, bukan sebagai teks bebas.
   - Alasan pemberian sebagai tool: keluaran model dijamin berupa schema yang bisa dirender, bukan prosa.
c. Respons mengalir
   - Respons dikirim ke frontend secara streaming.
   - Selama proses, frontend menampilkan indikator pekerjaan yang sedang dikerjakan, contoh: "Menyusun bagian Hero", "Memilih palet warna", "Mencari foto".
   - Indikator diturunkan dari nama tool yang sedang dipanggil model.
d. Penulisan hasil
   - Struktur situs hasil AI ditulis ke themes.schema (JSON) dan custom_pages.items (JSON) untuk website_id terkait.
   - Penulisan dilakukan dalam satu transaksi. Jika gagal di tengah, seluruh perubahan dibatalkan.
e. Pencatatan pemakaian
   - Setiap pesan disimpan ke mv_chat_messages beserta role, tokens_in, tokens_out, dan cost.
   - Setelah respons selesai, sistem menulis satu baris pengurangan saldo ke mv_credit_ledger dengan reference_type bernilai chat_message.
f. Post-condition
   - Snapshot hasil disimpan ke mv_site_versions sesuai MLD-013.
   - Panel pratinjau pada MLD-010 memuat ulang schema terbaru.


MLD-010 - Preview Realtime Berdampingan

User Story: Sebagai Pengguna, saya ingin melihat hasil perubahan langsung di panel sebelah tanpa perlu menyegarkan halaman, agar saya tahu persis bentuk situs saya sambil mengetik permintaan.

Aktor: Pengguna Terdaftar
Prasyarat: Sedang berada di halaman AI Builder.

Halaman UI: /sites/:websiteId/builder (panel kanan)
Endpoint pratinjau: GET /preview/:websiteId (dilayani melody-renderer)

Tabel dan kolom:
- themes (website_id, schema JSON, is_active)
- custom_pages (theme_id, page, items JSON)
- websites (id, status)

Acceptance Criteria:
a. Tata letak berdampingan
   - Panel kiri berisi percakapan, panel kanan berisi pratinjau situs di dalam iframe.
   - Lebar kedua panel dapat digeser oleh pengguna dan posisinya diingat per pengguna.
b. Pemuatan ulang tanpa refresh halaman
   - Setelah AI selesai menulis schema, backend mengirim sinyal ke frontend melalui kanal streaming yang sama.
   - Frontend memuat ulang isi iframe saja, bukan seluruh halaman.
c. Pratinjau lintas perangkat
   - Tersedia tiga pilihan lebar: Desktop, Tablet, dan Ponsel.
   - Pilihan tersebut mengubah lebar iframe, bukan memuat URL berbeda.
   - Lebar yang dipakai didefinisikan satu tempat agar konsisten dengan breakpoint tema.
d. Isolasi pratinjau
   - Endpoint pratinjau hanya dapat diakses oleh pemilik situs atau super admin.
   - Pratinjau menampilkan situs berstatus draft sekalipun, sedangkan URL publik hanya menampilkan yang published.
e. Penanganan schema rusak
   - Jika schema tidak dapat dirender, iframe menampilkan pesan ramah beserta tombol "Kembalikan ke versi sebelumnya" yang memanggil MLD-013.
   - Kesalahan render dicatat ke log aplikasi beserta website_id dan nomor versi.
f. Post-condition
   - Pengguna dapat langsung melanjutkan percakapan tanpa kehilangan posisi gulir pada panel pratinjau.


MLD-011 - Revisi Melalui Percakapan

User Story: Sebagai Pengguna, saya ingin mengubah warna dan tema, mengganti teks, serta menambah, menghapus, atau mengurutkan ulang bagian halaman cukup dengan mengetik permintaan, agar saya tidak perlu mempelajari editor apa pun.

Aktor: Pengguna Terdaftar
Prasyarat: Situs sudah memiliki minimal satu versi tersimpan.

Halaman UI: /sites/:websiteId/builder
Endpoint: POST /api/sites/:websiteId/chat

Tabel dan kolom:
- themes (schema JSON)
- custom_pages (items JSON)
- mv_section_catalog (code, props_schema JSON, variants JSON)
- mv_site_versions (website_id, parent_version_id, snapshot JSON)

Acceptance Criteria:
a. Daftar operasi yang didukung
   - Mengubah warna utama, warna aksen, pasangan huruf, dan mode gelap.
   - Mengganti teks pada bagian halaman tertentu.
   - Menambah bagian halaman baru dari mv_section_catalog.
   - Menghapus bagian halaman.
   - Mengurutkan ulang bagian halaman.
b. Operasi sebagai tool terstruktur
   - Setiap operasi di atas didefinisikan sebagai tool dengan parameter bertipe jelas, contoh: set_theme_color, update_section_text, add_section, remove_section, reorder_sections.
   - Model tidak diperbolehkan menulis schema mentah, hanya memanggil tool.
   - Alasannya, schema hasil panggilan tool selalu lolos validasi props_schema.
c. Validasi sebelum menulis
   - Sebelum disimpan, schema hasil perubahan divalidasi terhadap props_schema masing-masing bagian halaman.
   - Jika validasi gagal, perubahan dibatalkan dan AI diminta memperbaiki tanpa memotong kuota tambahan.
d. Penolakan bagian di luar tipe situs
   - Permintaan menambah bagian halaman yang tidak terdaftar pada allowed_sections tipe situs ditolak.
   - AI membalas dengan penjelasan dan menawarkan bagian alternatif yang tersedia.
e. Perubahan bersifat inkremental
   - Setiap revisi hanya mengubah bagian yang diminta. Bagian lain wajib tetap sama persis.
   - Uji regresi: menjalankan satu revisi warna tidak boleh mengubah teks bagian mana pun.
f. Post-condition
   - Setiap revisi yang berhasil menghasilkan satu baris baru pada mv_site_versions dengan parent_version_id menunjuk versi sebelumnya.


MLD-012 - Galeri Template Default

User Story: Sebagai Pengguna, saya ingin memilih template siap pakai sesuai jenis usaha saya sebagai titik awal, agar saya tidak memulai dari halaman kosong dan AI tinggal menyesuaikan isinya.

Aktor: Pengguna Terdaftar
Prasyarat: Sudah memilih tipe situs pada MLD-008.

Halaman UI: /sites/new/templates
Endpoint: GET /api/templates dengan parameter site_type_id dan industry
Endpoint terapkan: POST /api/sites/:websiteId/apply-template

Tabel dan kolom:
- mv_templates (id, site_type_id, name, industry, thumbnail, schema JSON, is_active, sort_order)
- themes (website_id, schema JSON)
- custom_pages (theme_id, page, items JSON)

Acceptance Criteria:
a. Kategori jenis usaha
   - Kolom industry menampung nilai: kuliner, jasa, retail, kesehatan, pendidikan, otomotif.
   - Galeri menyediakan penyaring berdasarkan industry dan otomatis tersaring berdasarkan tipe situs yang dipilih.
b. Tampilan galeri
   - Setiap template ditampilkan sebagai kartu dengan gambar thumbnail, nama, dan jenis usaha.
   - Tersedia tombol pratinjau yang membuka contoh situs dalam mode baca saja.
c. Penerapan template
   - Saat template dipilih, isi mv_templates.schema disalin ke themes.schema milik situs tersebut.
   - Bagian halaman yang ikut disalin dituliskan ke custom_pages.items.
   - Penyalinan menghasilkan satu baris versi awal pada mv_site_versions dengan label "Template awal".
d. Penyesuaian oleh AI
   - Setelah template diterapkan, sistem otomatis menjalankan satu putaran AI untuk mengganti teks contoh dengan konteks usaha pengguna.
   - Putaran otomatis ini memotong kuota seperti pesan biasa dan wajib diberitahukan sebelum dijalankan.
e. Mulai tanpa template
   - Galeri menyediakan opsi "Mulai dari percakapan saja" yang melewati langkah ini dan langsung menuju MLD-009.
f. Post-condition
   - Pengguna diarahkan ke halaman AI Builder dengan pratinjau sudah terisi.


MLD-013 - Riwayat Versi dan Pemulihan

User Story: Sebagai Pengguna, saya ingin setiap perubahan tersimpan sehingga saya dapat membandingkan dan mengembalikan situs ke versi sebelumnya, agar saya berani bereksperimen tanpa takut merusak hasil kerja.

Aktor: Pengguna Terdaftar
Prasyarat: Situs memiliki minimal dua versi tersimpan.

Halaman UI: /sites/:websiteId/versions
Endpoint daftar: GET /api/sites/:websiteId/versions
Endpoint pulihkan: POST /api/sites/:websiteId/versions/:versionId/restore

Tabel dan kolom:
- mv_site_versions (id, website_id, parent_version_id, snapshot JSON, label, created_by, created_at)
- mv_plans (limits JSON) - batas jumlah versi per paket

Acceptance Criteria:
a. Bentuk penyimpanan
   - Setiap versi menyimpan snapshot JSON penuh, bukan selisih perubahan.
   - Alasannya, pemulihan menjadi satu operasi tulis dan ukurannya tetap wajar karena isinya schema, bukan berkas gambar.
b. Pembuatan versi otomatis
   - Satu baris versi dibuat setiap kali AI Builder menulis perubahan yang berhasil.
   - Kolom label diisi ringkasan singkat perubahan yang dihasilkan AI, contoh: "Ubah warna utama menjadi hijau".
   - Kolom created_by diisi customer_id, atau ditandai sistem bila perubahan otomatis.
c. Perbandingan antar versi
   - Pengguna dapat memilih dua versi dan melihat perbandingannya.
   - Perbandingan ditampilkan pada level bagian halaman: mana yang ditambah, dihapus, diubah urutannya, dan diubah isinya.
d. Pemulihan
   - Memulihkan versi lama tidak menghapus versi setelahnya.
   - Sistem menyalin snapshot versi terpilih menjadi versi baru di puncak riwayat, dengan label "Dipulihkan dari versi N".
   - Alasannya, riwayat tetap lurus dan tidak ada data yang hilang.
e. Undo dan Redo
   - Tombol Undo memulihkan versi induk dari versi aktif.
   - Tombol Redo tersedia selama pengguna belum membuat perubahan baru setelah Undo.
f. Batas jumlah versi per paket
   - Jumlah versi yang disimpan dibatasi sesuai mv_plans.limits.
   - Saat batas terlampaui, versi terlama dihapus otomatis, kecuali versi yang diberi label manual oleh pengguna.


MLD-015 - Kuota Pesan AI

User Story: Sebagai Pengguna, saya ingin melihat sisa kuota pesan AI saya beserta peringatan saat mendekati batas, agar saya tidak kaget ketika tiba-tiba tidak bisa melanjutkan pekerjaan.

Aktor: Pengguna Terdaftar
Prasyarat: Pengguna memiliki langganan aktif atau saldo kredit awal.

Halaman UI: indikator pada header AI Builder dan halaman /settings/usage
Endpoint: GET /api/me/quota

Tabel dan kolom:
- mv_credit_ledger (id, customer_id, balance_before, amount, balance_after, reference_type, reference_id, remarks, created_at)
- mv_plans (limits JSON)
- mv_subscriptions (customer_id, plan_id, status)

Acceptance Criteria:
a. Cara menghitung sisa kuota
   - Saldo diambil dari kolom balance_after pada baris mv_credit_ledger terbaru milik pengguna.
   - Ledger ini terpisah dari wallet_histories milik admin-be, karena yang lama memakai username sebagai kunci relasi dan sudah terikat erat ke modul MLM.
b. Indikator di antarmuka
   - Header AI Builder menampilkan sisa kuota beserta bilah kemajuan.
   - Warna bilah berubah menjadi peringatan ketika sisa kuota di bawah 20 persen, dan menjadi kritis di bawah 5 persen.
c. Peringatan mendekati batas
   - Saat sisa kuota menyentuh 20 persen, sistem menampilkan pemberitahuan satu kali per periode.
   - Saat menyentuh 5 persen, pemberitahuan ditampilkan setiap kali halaman builder dibuka.
d. Perilaku saat kuota habis
   - Kolom input percakapan dinonaktifkan dan digantikan ajakan upgrade paket atau membeli kuota tambahan.
   - Situs yang sudah tayang tetap dapat diakses publik. Yang terhenti hanya kemampuan mengubah.
e. Pemotongan kuota
   - Pemotongan dicatat setelah respons AI selesai, bukan di awal, agar permintaan yang gagal tidak memotong kuota.
   - Kolom reference_type dan reference_id menunjuk baris mv_chat_messages terkait, agar pengguna dapat menelusuri pemakaiannya.
f. Post-condition
   - Riwayat pemakaian dapat dilihat pada halaman /settings/usage, diurutkan dari yang terbaru.


MLD-016 - Saran Proaktif AI

User Story: Sebagai Pengguna, saya ingin AI mengusulkan penyempurnaan setelah situs saya jadi, agar saya tahu bagian mana yang masih kurang tanpa harus menilainya sendiri.

Aktor: Sistem, ditindaklanjuti Pengguna
Prasyarat: Situs sudah memiliki minimal satu versi tersimpan.

Halaman UI: panel saran pada /sites/:websiteId/builder
Endpoint: GET /api/sites/:websiteId/suggestions
Endpoint terapkan: POST /api/sites/:websiteId/suggestions/:id/apply

Tabel dan kolom:
- mv_ai_suggestions (id, website_id, suggestion_type, title, content, status, created_at)
- themes (schema JSON)
- mv_ai_config (feature_key bernilai suggestion)

Acceptance Criteria:
a. Waktu pemicu
   - Saran dihasilkan setelah situs selesai dibangun pertama kali, lalu diperbarui setiap kali pengguna membuka builder setelah lebih dari 24 jam tidak aktif.
   - Pembuatan saran tidak memotong kuota pesan pengguna. Biayanya ditanggung platform dan dicatat pada mv_usage_daily.
b. Jenis saran
   - Nilai suggestion_type mencakup: bagian_hilang, konten_terlalu_umum, data_belum_lengkap, dan gambar_placeholder.
   - Contoh isi: menambah bagian testimoni, melengkapi jam operasional, memperbaiki teks yang terlalu umum.
c. Tampilan
   - Saran ditampilkan sebagai daftar kartu ringkas di panel terpisah, tidak menyela percakapan.
   - Setiap kartu memiliki tombol Terapkan dan tombol Abaikan.
d. Penerapan saran
   - Menekan Terapkan menjalankan operasi revisi yang sama dengan MLD-011 dan memotong kuota seperti pesan biasa.
   - Pengguna diberi tahu berapa kuota yang akan terpakai sebelum konfirmasi.
e. Pengabaian saran
   - Menekan Abaikan mengubah status menjadi dismissed dan saran tersebut tidak muncul lagi.
f. Post-condition
   - Saran yang sudah diterapkan berubah status menjadi applied dan menghasilkan versi baru pada mv_site_versions.


===============================================================================


C. KONTEN DAN TAMPILAN SITUS


MLD-017 - Katalog Bagian Halaman

User Story: Sebagai Pengguna, saya ingin memilih bagian halaman dari katalog yang sudah disediakan beserta beberapa pilihan tata letak, agar situs saya tersusun rapi tanpa perlu mendesain dari nol.

Aktor: Pengguna Terdaftar dan Super Admin
Prasyarat: Tipe situs sudah dipilih.

Halaman UI: panel "Tambah Bagian" pada /sites/:websiteId/builder
Endpoint: GET /api/sections dengan parameter site_type_id

Tabel dan kolom:
- mv_section_catalog (id, code, name, category, variants JSON, props_schema JSON, thumbnail, sort_order, is_active)
- mv_site_types (allowed_sections JSON)
- themes (schema JSON)

Acceptance Criteria:
a. Isi katalog awal
   - Nilai code yang wajib tersedia pada rilis pertama: hero, tentang_kami, layanan, keunggulan, galeri, testimoni, tim, daftar_harga, faq, ajakan_bertindak, kontak, footer.
   - Setiap baris memiliki nama tampilan berbahasa Indonesia dan gambar thumbnail.
b. Pilihan tata letak
   - Kolom variants berisi array pilihan tata letak untuk bagian tersebut, contoh untuk hero: layar_penuh, terbagi_dua, dengan_video.
   - Setiap variant memiliki kode, nama tampilan, dan thumbnail sendiri.
c. Skema properti
   - Kolom props_schema mendefinisikan field yang dimiliki bagian tersebut beserta tipenya, contoh: judul bertipe teks, subjudul bertipe teks, gambar bertipe media, tombol bertipe objek.
   - Schema ini dipakai untuk memvalidasi keluaran AI pada MLD-011.
d. Katalog sebagai data, bukan kode
   - Seluruh definisi bagian halaman disimpan sebagai baris database, bukan ditanam di kode aplikasi.
   - Inilah yang membuat MLD-055 mungkin dilakukan tanpa deploy ulang.
e. Penyaringan berdasarkan tipe situs
   - Katalog yang ditampilkan hanya bagian yang kodenya terdaftar pada allowed_sections tipe situs tersebut.
f. Post-condition
   - Bagian yang dipilih ditambahkan ke themes.schema dan langsung terlihat pada pratinjau MLD-010.


MLD-018 - Kustomisasi Tema

User Story: Sebagai Pengguna, saya ingin mengatur warna, huruf, sudut membulat, kerapatan spasi, dan mode gelap, agar tampilan situs sesuai identitas usaha saya.

Aktor: Pengguna Terdaftar
Prasyarat: Situs sudah memiliki tema aktif.

Halaman UI: panel "Tema" pada /sites/:websiteId/builder
Endpoint: PUT /api/sites/:websiteId/theme

Tabel dan kolom:
- themes (id, website_id, name, slug, schema JSON, is_active)
- Objek tokens di dalam themes.schema menyimpan: primary_color, accent_color, neutral_color, font_heading, font_body, border_radius, spacing_density, dark_mode

Acceptance Criteria:
a. Preset tema siap pakai
   - Tersedia beberapa preset yang mengisi seluruh token sekaligus dengan sekali klik.
   - Preset disimpan sebagai baris mv_templates bertipe theme_preset, agar dapat ditambah dari console tanpa deploy ulang.
b. Pemilihan warna
   - Pengguna dapat memilih warna utama dan warna aksen memakai color picker atau memasukkan kode heksadesimal.
   - Sistem menghitung dan menampilkan rasio kontras terhadap latar. Jika rasio di bawah 4.5 banding 1, tampilkan peringatan keterbacaan.
c. Pasangan huruf
   - Pengguna memilih pasangan huruf dari daftar terkurasi, bukan mengetik nama huruf bebas.
   - Setiap pasangan menetapkan font_heading dan font_body sekaligus.
d. Sudut membulat dan kerapatan spasi
   - Nilai border_radius memiliki pilihan: tajam, sedang, membulat.
   - Nilai spacing_density memiliki pilihan: rapat, normal, lega.
e. Mode gelap
   - Saklar dark_mode menentukan apakah situs menyediakan mode gelap.
   - Jika aktif, sistem menurunkan palet gelap secara otomatis dari warna yang dipilih, lalu menampilkan pratinjaunya.
f. Post-condition
   - Perubahan tema langsung terlihat pada pratinjau tanpa memuat ulang halaman.
   - Setiap perubahan tema menghasilkan versi baru pada mv_site_versions.


MLD-019 - Manajemen Media

User Story: Sebagai Pengguna, saya ingin mengunggah logo dan foto lalu mengelolanya dalam galeri per situs, agar saya dapat mengganti gambar dengan cepat tanpa bantuan siapa pun.

Aktor: Pengguna Terdaftar
Prasyarat: Situs sudah dibuat.

Halaman UI: panel "Media" pada /sites/:websiteId/builder
Endpoint unggah: POST /api/sites/:websiteId/media
Endpoint daftar: GET /api/sites/:websiteId/media
Endpoint hapus: DELETE /api/media/:id

Tabel dan kolom:
- Media (id, name, url, description, created_at) - tabel bersama milik admin-be
- Media kolom baru: website_id INTEGER NULL dengan index
- mv_plans (limits JSON) - batas kapasitas penyimpanan

Acceptance Criteria:
a. Validasi berkas
   - Format yang diterima: JPG, PNG, WEBP, dan SVG khusus untuk logo.
   - Ukuran maksimal per berkas ditetapkan dan divalidasi di sisi backend, bukan hanya di frontend.
b. Kompresi otomatis
   - Setelah diunggah, sistem menghasilkan beberapa ukuran turunan untuk kebutuhan tampilan.
   - Berkas dikonversi ke WEBP bila peramban mendukung, dengan berkas asli tetap disimpan.
c. Galeri per situs
   - Daftar media difilter berdasarkan website_id, sehingga media milik situs lain tidak terlihat.
   - Perhatikan nama tabel ditulis dengan huruf besar M, yaitu Media, karena MySQL pada Linux bersifat case-sensitive terhadap nama tabel.
d. Penggantian gambar dengan seret dan lepas
   - Pengguna dapat menyeret berkas dari komputer langsung ke atas gambar yang ada di pratinjau untuk menggantinya.
   - Penggantian memperbarui rujukan pada themes.schema, bukan menimpa berkas lama.
e. Batas kapasitas penyimpanan
   - Sebelum unggahan diterima, sistem menjumlahkan ukuran seluruh media milik pengguna dan membandingkannya dengan batas pada mv_plans.limits.
   - Jika melebihi, tolak dengan 402 beserta ajakan upgrade.
f. Post-condition
   - Media yang masih dipakai pada schema tidak dapat dihapus. Sistem menampilkan daftar bagian halaman yang memakainya.


MLD-020 - Pencarian Foto Stock oleh AI

User Story: Sebagai Pengguna, saya ingin AI mencarikan foto yang relevan dengan jenis usaha saya, agar situs saya tidak kosong walaupun saya belum punya foto sendiri.

Aktor: Pengguna Terdaftar
Prasyarat: Situs sudah memiliki konteks jenis usaha dari percakapan.

Halaman UI: panel "Media" tab "Cari Foto"
Endpoint: POST /api/sites/:websiteId/media/search-stock

Tabel dan kolom:
- mv_ai_jobs (id, session_id, job_type bernilai stock_search, status, payload JSON, result JSON, error_message)
- Media (website_id, url, description)

Acceptance Criteria:
a. Penyusunan kata kunci
   - Sistem menyusun kata kunci pencarian dari konteks usaha pengguna, bukan dari ketikan mentah.
   - Kata kunci yang dipakai ditampilkan kepada pengguna agar dapat disunting.
b. Pemrosesan asinkron
   - Pencarian dijalankan sebagai pekerjaan latar belakang dengan status QUEUED, RUNNING, DONE, atau FAILED pada mv_ai_jobs.
   - Frontend melakukan polling atau menerima sinyal saat pekerjaan selesai.
c. Tampilan hasil
   - Hasil ditampilkan sebagai kisi gambar beserta atribusi sumbernya.
   - Pengguna memilih gambar yang diinginkan, dan hanya gambar terpilih yang disalin ke penyimpanan sendiri lalu dicatat ke tabel Media.
d. Kepatuhan lisensi
   - Sistem hanya memakai sumber foto dengan lisensi yang mengizinkan penggunaan komersial.
   - Informasi atribusi disimpan pada Media.description agar dapat ditelusuri kembali.
e. Penanganan kegagalan
   - Jika penyedia foto tidak dapat dihubungi, status berubah menjadi FAILED beserta error_message, dan pengguna ditawari mengunggah foto sendiri.
f. Post-condition
   - Gambar terpilih tersedia di galeri media situs dan dapat dipakai bagian halaman mana pun.


MLD-021 - Pembuatan Gambar oleh AI

User Story: Sebagai Pengguna, saya ingin AI membuatkan banner, ilustrasi, atau latar belakang sesuai deskripsi saya, agar situs saya punya visual khas walaupun saya tidak punya materi apa pun.

Aktor: Pengguna Terdaftar
Prasyarat: Kuota kredit mencukupi.

Halaman UI: panel "Media" tab "Buat Gambar"
Endpoint: POST /api/sites/:websiteId/media/generate

Tabel dan kolom:
- mv_ai_jobs (job_type bernilai image_generation, payload JSON berisi prompt dan rasio, result JSON berisi url)
- mv_credit_ledger (customer_id, amount, reference_type bernilai image_generation)
- Media (website_id, url, description)
- mv_ai_config (feature_key bernilai image)

Acceptance Criteria:
a. Masukan pengguna
   - Pengguna memasukkan deskripsi gambar, memilih jenis (banner, ilustrasi, atau latar belakang), dan memilih rasio aspek.
   - Sistem menampilkan estimasi biaya kredit sebelum proses dijalankan.
b. Pemeriksaan kuota
   - Pembuatan gambar memotong kredit lebih besar daripada pesan teks biasa. Besarannya diatur pada mv_ai_config.
   - Jika kredit tidak cukup, tolak dengan 402 sebelum memanggil penyedia.
c. Pemrosesan asinkron
   - Pekerjaan dicatat ke mv_ai_jobs dan dijalankan di latar belakang, karena pembuatan gambar memakan waktu.
   - Pengguna dapat meninggalkan halaman dan kembali lagi tanpa kehilangan hasil.
d. Penyimpanan hasil
   - Gambar hasil disimpan ke penyimpanan sendiri, tidak menautkan langsung ke URL penyedia.
   - Baris Media dibuat dengan description berisi prompt yang dipakai, agar dapat ditelusuri.
e. Penyaringan konten
   - Prompt yang mengandung kata kunci sensitif ditolak sebelum dikirim ke penyedia, memakai daftar yang sama dengan MLD-053.
f. Post-condition
   - Pemotongan kredit dicatat ke mv_credit_ledger hanya jika pekerjaan berstatus DONE.


MLD-022 - Widget Bawaan

User Story: Sebagai Pengguna, saya ingin memasang widget siap pakai seperti tombol WhatsApp, peta, dan jam operasional, agar pengunjung situs saya lebih mudah menghubungi dan menemukan usaha saya.

Aktor: Pengguna Terdaftar
Prasyarat: Situs sudah dibuat.

Halaman UI: panel "Widget" pada /sites/:websiteId/builder
Endpoint: GET dan PUT /api/sites/:websiteId/widgets

Tabel dan kolom:
- mv_site_widgets (id, website_id, widget_key, config JSON, sort_order, is_active)

Acceptance Criteria:
a. Daftar widget yang tersedia
   - Nilai widget_key pada rilis pertama: whatsapp_float, google_maps, jam_operasional, sosial_media, kembali_ke_atas.
b. Konfigurasi per widget
   - whatsapp_float menyimpan nomor telepon, teks pesan awal, dan posisi tampil.
   - google_maps menyimpan koordinat lintang dan bujur, tingkat perbesaran, dan tinggi peta.
   - jam_operasional menyimpan tujuh baris hari beserta jam buka dan tutup, termasuk penanda libur.
   - sosial_media menyimpan daftar platform beserta URL-nya.
   - kembali_ke_atas menyimpan ambang batas gulir sebelum tombol muncul.
c. Validasi masukan
   - Nomor WhatsApp divalidasi hanya angka dan diawali kode negara 62.
   - URL media sosial divalidasi sebagai URL yang sah.
d. Pengaktifan dan urutan
   - Setiap widget dapat dinyalakan atau dimatikan lewat saklar.
   - Widget mengambang dapat diatur urutan tumpukannya lewat sort_order agar tidak saling menutupi.
e. Kesesuaian tema
   - Warna widget mengikuti token tema dari MLD-018, bukan warna yang ditulis mati di kode.
f. Post-condition
   - Widget aktif langsung muncul di pratinjau dan ikut ter-render pada situs publik.


MLD-023 - Formulir Kontak

User Story: Sebagai Pengguna, saya ingin pesan dari formulir kontak diteruskan ke email dan WhatsApp saya sekaligus tersimpan di kotak masuk dashboard, agar tidak ada calon pelanggan yang terlewat.

Aktor: Pengunjung situs tenant (pengirim) dan Pengguna Terdaftar (penerima)
Prasyarat: Situs sudah tayang dan memuat bagian halaman kontak.

Halaman UI publik: bagian kontak pada situs tenant
Endpoint kirim: POST /api/public/sites/:websiteId/contact
Halaman UI pemilik: /inbox

Tabel dan kolom:
- contact_messages (id, name, email, phone, subject, message, created_at) - tabel bersama
- contact_messages kolom baru: website_id INTEGER NOT NULL dengan index
- contact_messages kolom baru: is_read BOOLEAN NOT NULL DEFAULT false
- mv_notification_outbox (customer_id, channel, to_address, template_key, payload_json, status)

Acceptance Criteria:
a. Validasi masukan
   - Field wajib: nama, email, dan pesan. Field nomor telepon bersifat opsional.
   - Email dinormalisasi menjadi huruf kecil sebelum disimpan.
b. Proteksi spam
   - Diterapkan honeypot berupa field tersembunyi yang wajib kosong.
   - Diterapkan pembatasan laju berdasarkan alamat IP, maksimal beberapa pengiriman per menit per situs.
   - Pengiriman yang terdeteksi spam tetap dibalas sukses kepada pengirim, namun tidak disimpan.
c. Penyimpanan
   - Pesan yang lolos disimpan ke contact_messages dengan website_id sesuai situs asal, hasil resolusi tenant dari host.
d. Penerusan ke email dan WhatsApp
   - Sistem mengantre pengiriman ke mv_notification_outbox dengan channel EMAIL dan WHATSAPP.
   - Alamat tujuan diambil dari profil pemilik situs.
   - Pengiriman dijalankan pekerja latar belakang, bukan sinkron, agar pengunjung tidak menunggu.
e. Umpan balik ke pengunjung
   - Setelah terkirim, formulir menampilkan pesan sukses dan mengosongkan isian.
   - Kegagalan menampilkan pesan yang menjelaskan cara lain menghubungi pemilik.
f. Post-condition
   - Pesan muncul di kotak masuk pada MLD-044 dengan penanda belum dibaca.


MLD-024 - Situs Multi-Halaman

User Story: Sebagai Pengguna, saya ingin situs saya terdiri dari beberapa halaman terpisah lengkap dengan menu navigasi, agar isinya tidak menumpuk dalam satu halaman panjang.

Aktor: Pengguna Terdaftar
Prasyarat: Situs sudah dibuat.

Halaman UI: panel "Halaman" pada /sites/:websiteId/builder
Endpoint: GET, POST, PUT, DELETE /api/sites/:websiteId/pages

Tabel dan kolom:
- custom_pages (id, title, page, items JSON, theme_id, parent_id, is_active) - tabel bersama
- themes (website_id, schema JSON) - objek navigation di dalam schema

Acceptance Criteria:
a. Halaman bawaan
   - Saat situs dibuat, sistem menyiapkan halaman: beranda, tentang, layanan, dan kontak.
   - Halaman beranda tidak dapat dihapus.
b. Pengelolaan halaman
   - Pengguna dapat menambah, mengganti nama, dan menghapus halaman.
   - Kolom page menyimpan slug halaman, dinormalisasi huruf kecil dan hanya menerima a-z, 0-9, serta tanda hubung.
   - Slug wajib unik dalam satu situs.
c. Menu navigasi otomatis
   - Menu navigasi dibangkitkan dari daftar halaman aktif dan disimpan pada objek navigation di themes.schema.
   - Urutan menu dapat diatur dengan seret dan lepas.
   - Menu bertingkat didukung satu level lewat kolom parent_id.
d. Halaman sebagai konteks AI
   - Saat pengguna meminta perubahan lewat percakapan, AI mengetahui halaman mana yang sedang aktif dan hanya mengubah halaman tersebut, kecuali diminta lain.
e. Penghapusan halaman
   - Menghapus halaman meminta konfirmasi dan menyebut jumlah bagian halaman yang ikut terhapus.
   - Halaman yang dihapus ikut hilang dari menu navigasi.
f. Post-condition
   - Setiap halaman dapat diakses publik pada alamat subdomain diikuti slug halamannya.


MLD-025 - Situs Dwibahasa Indonesia dan Inggris

User Story: Sebagai Pengguna, saya ingin situs saya tersedia dalam dua bahasa dengan tombol pengalih, agar usaha saya dapat menjangkau pengunjung berbahasa Inggris.

Aktor: Pengguna Terdaftar
Prasyarat: Situs sudah memiliki konten berbahasa Indonesia.

Halaman UI: panel "Bahasa" pada /sites/:websiteId/builder
Endpoint terjemah: POST /api/sites/:websiteId/translate

Tabel dan kolom:
- mv_site_translations (id, website_id, locale, path, value, is_manual, updated_at)
- themes (schema JSON) - objek locales berisi daftar bahasa aktif dan bahasa bawaan
- mv_credit_ledger (reference_type bernilai translation)

Acceptance Criteria:
a. Pengaktifan bahasa kedua
   - Pengguna menyalakan bahasa Inggris lewat saklar. Bahasa Indonesia tetap menjadi bahasa bawaan.
   - Objek locales pada themes.schema mencatat daftar bahasa aktif dan mana yang bawaan.
b. Struktur penyimpanan terjemahan
   - Setiap teks yang dapat diterjemahkan diidentifikasi dengan path, contoh: pages.beranda.sections.0.props.judul.
   - Baris mv_site_translations menyimpan pasangan locale dan path beserta nilainya.
   - Alasan disimpan terpisah, bukan menggandakan schema: struktur situs tetap satu sumber, hanya teksnya yang bercabang.
c. Terjemahan otomatis
   - Menekan "Terjemahkan seluruh konten" mengirim seluruh teks ke AI dan menyimpan hasilnya.
   - Proses ini memotong kredit dan besarannya diberitahukan sebelum dijalankan.
d. Penyuntingan manual
   - Pengguna dapat menyunting hasil terjemahan mana pun. Baris yang disunting manual ditandai is_manual bernilai true.
   - Terjemahan ulang otomatis tidak menimpa baris yang ditandai manual.
e. Pengalih bahasa di situs
   - Situs publik menampilkan tombol pengalih bahasa pada header.
   - Bahasa yang dipilih pengunjung diingat lewat penyimpanan peramban.
f. Post-condition
   - Teks yang belum diterjemahkan ditampilkan dalam bahasa bawaan, tidak dikosongkan.
   - Panel bahasa menampilkan persentase kelengkapan terjemahan.


MLD-026 - Blog dan Artikel

User Story: Sebagai Pengguna, saya ingin mengelola tulisan sederhana beserta halaman daftar dan detail artikel, agar saya dapat mengisi situs dengan konten baru secara berkala.

Aktor: Pengguna Terdaftar
Prasyarat: Situs sudah dibuat.

Halaman UI: /sites/:websiteId/posts
Endpoint: GET, POST, PUT, DELETE /api/sites/:websiteId/posts

Tabel dan kolom:
- posts (id, website_id, user_id, title, slug, content, excerpt, thumbnail_url, type, status, published_at) - tabel bersama
- Kolom type memakai nilai post
- Kolom status memakai nilai draft, published, atau trash

Acceptance Criteria:
a. Pemakaian tabel bersama
   - Artikel disimpan pada tabel posts milik admin-be dengan type bernilai post dan website_id sesuai situs.
   - melody-be membaca dan menulis tabel ini, namun tidak membuat migration untuknya, sesuai aturan kepemilikan tabel.
b. Editor tulisan
   - Editor mendukung paragraf, judul bertingkat, daftar, tautan, kutipan, dan penyisipan gambar dari galeri media.
   - Isi disimpan pada kolom content.
c. Slug dan ringkasan
   - Slug dibangkitkan otomatis dari judul, dapat disunting, dan wajib unik dalam satu situs.
   - Ringkasan pada kolom excerpt dibangkitkan otomatis dari paragraf pertama bila dikosongkan.
d. Status terbit
   - Artikel berstatus draft tidak muncul di situs publik namun tetap terlihat di pratinjau pemilik.
   - Saat status berubah menjadi published, kolom published_at diisi waktu saat itu.
e. Halaman daftar dan detail
   - Bagian halaman bertipe daftar artikel dapat ditambahkan ke halaman mana pun dari katalog MLD-017.
   - Halaman detail artikel dilayani melody-renderer pada alamat subdomain diikuti blog dan slug artikel.
f. Post-condition
   - Artikel yang dihapus berpindah ke status trash, tidak langsung hilang dari basis data.


===============================================================================


D. TIPE ECOMMERCE


MLD-027 - Katalog Produk

User Story: Sebagai Pengguna pemilik toko, saya ingin mengelola produk beserta kategori, varian, stok, dan harga promo, agar calon pembeli melihat informasi yang lengkap dan akurat.

Aktor: Pengguna Terdaftar dengan tipe situs ecommerce
Prasyarat: Situs bertipe ecommerce.

Halaman UI: /sites/:websiteId/products
Endpoint: GET, POST, PUT, DELETE /api/sites/:websiteId/products

Tabel dan kolom:
- mv_product_categories (id, website_id, name, slug, parent_id, sort_order)
- mv_products (id, website_id, category_id, name, slug, description, price, compare_at_price, stock, status, images JSON, weight, created_at)
- mv_product_variants (id, product_id, combination, sku, price, stock, image)

Acceptance Criteria:
a. Alasan tabel baru
   - Tenant Melody memakai tabel mv_products, bukan product_details milik admin-be.
   - Alasannya, modul lama melayani klien compro yang skemanya berbeda dan tidak dirancang multi-tenant sejak awal.
b. Kategori bertingkat
   - Kategori mendukung satu level induk lewat parent_id.
   - Slug kategori wajib unik dalam satu situs.
c. Varian produk
   - Kolom combination menyimpan kombinasi opsi dalam bentuk teks, contoh: Merah / L.
   - Setiap varian dapat memiliki harga, stok, dan gambar sendiri.
   - Jika produk tidak memiliki varian, harga dan stok diambil dari baris mv_products.
d. Harga coret dan harga promo
   - Kolom price adalah harga jual, kolom compare_at_price adalah harga coret.
   - Jika compare_at_price lebih besar daripada price, situs menampilkan harga coret beserta persentase potongannya.
   - Jika compare_at_price lebih kecil atau sama, harga coret tidak ditampilkan.
e. Status tersedia dan habis
   - Kolom status memakai nilai active, draft, atau archived.
   - Produk dengan stok bernilai nol ditampilkan dengan label Habis dan tombol beli dinonaktifkan.
f. Post-condition
   - Galeri foto produk memakai media dari MLD-019, difilter berdasarkan website_id yang sama.


MLD-029 - Keranjang Belanja dan Checkout

User Story: Sebagai Pengunjung toko, saya ingin menambahkan produk ke keranjang lalu mengisi data pembeli dan alamat pengiriman, agar saya dapat menyelesaikan pesanan.

Aktor: Pengunjung situs tenant
Prasyarat: Situs bertipe ecommerce dan sudah tayang.

Halaman UI publik: /keranjang dan /checkout pada situs tenant
Endpoint: POST /api/public/sites/:websiteId/cart dan POST /api/public/sites/:websiteId/checkout

Tabel dan kolom:
- mv_carts (id, website_id, session_token, customer_email, status, created_at, expired_at)
- mv_cart_items (id, cart_id, product_id, variant_id, qty, price)
- mv_orders (id, website_id, order_number, buyer_name, buyer_email, buyer_phone, shipping_address JSON, subtotal, shipping_cost, discount, total, status)
- mv_order_items (id, order_id, product_id, variant_id, product_name, qty, price, subtotal)

Acceptance Criteria:
a. Keranjang tanpa akun
   - Pembeli tidak perlu mendaftar. Keranjang diikat pada session_token yang disimpan di peramban pembeli.
   - Keranjang kedaluwarsa setelah masa tertentu dan dibersihkan pekerja latar belakang.
b. Penambahan produk
   - Sistem memvalidasi stok tersedia sebelum item masuk keranjang.
   - Harga disalin ke mv_cart_items saat penambahan, agar perubahan harga di kemudian hari tidak mengubah keranjang berjalan.
c. Formulir checkout
   - Field wajib: nama pembeli, email, nomor telepon, dan alamat pengiriman lengkap.
   - Alamat disimpan sebagai objek JSON berisi provinsi, kota, kecamatan, kelurahan, kode pos, dan alamat rinci.
   - Nomor telepon divalidasi hanya angka dan diawali kode negara 62.
d. Ringkasan pesanan
   - Halaman checkout menampilkan rincian: subtotal, ongkos kirim dari MLD-030, potongan dari MLD-033, dan total akhir.
   - Seluruh perhitungan dilakukan ulang di sisi backend. Nilai yang dikirim frontend tidak dipercaya.
e. Pembuatan pesanan
   - Saat checkout dikirim, sistem membuat baris mv_orders beserta mv_order_items dalam satu transaksi.
   - Kolom order_number dibangkitkan unik per situs dengan format yang mudah dibaca manusia.
   - Stok dikurangi pada saat pesanan dibuat, bukan saat pembayaran lunas, lalu dikembalikan bila pesanan dibatalkan.
f. Post-condition
   - Pembeli diarahkan ke halaman pembayaran pada MLD-031.
   - Keranjang berubah status menjadi converted.


MLD-030 - Integrasi Perhitungan Ongkos Kirim

User Story: Sebagai Pengunjung toko, saya ingin melihat pilihan kurir beserta tarif otomatis berdasarkan alamat dan berat produk, agar saya tahu total biaya sebelum membayar.

Aktor: Pengunjung situs tenant
Prasyarat: Produk memiliki berat dan alamat pengiriman sudah diisi.

Halaman UI publik: /checkout, bagian pengiriman
Endpoint: POST /api/public/sites/:websiteId/shipping/rates

Tabel dan kolom:
- mv_shipping_rates (id, website_id, courier, service, cost, etd, fetched_at)
- mv_products (weight)
- mv_orders (shipping_address JSON, shipping_cost)

Acceptance Criteria:
a. Masukan perhitungan
   - Sistem menghitung total berat dari seluruh item di keranjang berdasarkan kolom weight.
   - Alamat tujuan diambil dari objek shipping_address.
   - Alamat asal diambil dari pengaturan toko milik pemilik situs.
b. Pemanggilan penyedia
   - Sistem memanggil penyedia tarif pengiriman dan menyimpan hasilnya ke mv_shipping_rates dengan fetched_at.
   - Hasil di-cache selama masa tertentu untuk kombinasi asal, tujuan, dan berat yang sama, agar tidak memanggil penyedia berulang kali.
c. Tampilan pilihan
   - Pilihan ditampilkan sebagai daftar berisi nama kurir, nama layanan, tarif, dan perkiraan lama pengiriman.
   - Pembeli wajib memilih satu sebelum dapat melanjutkan.
d. Penanganan penyedia tidak tersedia
   - Jika penyedia tidak dapat dihubungi, sistem menampilkan opsi ongkos kirim manual yang ditetapkan pemilik toko.
   - Kegagalan dicatat ke log beserta website_id dan alamat tujuan.
e. Penguncian tarif
   - Tarif yang dipilih disalin ke mv_orders.shipping_cost saat pesanan dibuat.
   - Perubahan tarif di kemudian hari tidak mengubah pesanan yang sudah terbentuk.
f. Post-condition
   - Total akhir pada ringkasan pesanan memuat ongkos kirim terpilih.


MLD-031 - Pembayaran Pesanan Toko

User Story: Sebagai Pengunjung toko, saya ingin membayar pesanan melalui transfer bank, virtual account, QRIS, atau transfer manual, agar saya dapat memilih cara yang paling mudah bagi saya.

Aktor: Pengunjung situs tenant dan Sistem
Prasyarat: Pesanan sudah terbentuk.

Halaman UI publik: /checkout/pembayaran dan /pesanan/:orderNumber
Endpoint: POST /api/public/sites/:websiteId/orders/:id/pay
Endpoint webhook: POST /api/webhooks/order-payment

Tabel dan kolom:
- mv_order_payments (id, order_id, gateway, method, external_id, amount, status, payload_json, proof_url, paid_on)
- mv_orders (status)

Acceptance Criteria:
a. Metode yang didukung
   - Nilai method: bank_transfer, virtual_account, qris, dan manual_transfer.
   - Metode manual_transfer tidak melibatkan gateway, pembeli mengunggah bukti transfer.
b. Pembuatan transaksi gateway
   - Sistem memanggil gateway dan menyimpan external_id beserta instruksi pembayaran pada payload_json.
   - Halaman pembayaran menampilkan instruksi sesuai metode terpilih beserta batas waktu.
c. Konfirmasi otomatis lewat webhook
   - Endpoint webhook memverifikasi signature dari gateway sebelum memproses. Request tanpa signature sah ditolak dengan 401.
   - Webhook bersifat idempoten. Notifikasi yang sama diterima dua kali hanya diproses satu kali, diperiksa berdasarkan external_id.
d. Perubahan status pesanan
   - Pembayaran lunas mengubah mv_order_payments.status menjadi paid dan mengisi paid_on.
   - Status mv_orders berubah dari menunggu_pembayaran menjadi diproses.
e. Verifikasi transfer manual
   - Bukti transfer diunggah pembeli dan disimpan pada proof_url.
   - Pemilik toko meninjau bukti lalu menyetujui atau menolak secara manual dari MLD-032.
f. Post-condition
   - Pembeli dan pemilik toko sama-sama menerima notifikasi sesuai MLD-045.
   - Penggantian penyedia gateway dilakukan lewat konfigurasi, bukan lewat perubahan kode.


MLD-032 - Manajemen Pesanan

User Story: Sebagai Pengguna pemilik toko, saya ingin melihat pesanan masuk, mengubah statusnya, dan memasukkan nomor resi, agar saya dapat mengelola pengiriman dan pembeli selalu mendapat kabar.

Aktor: Pengguna Terdaftar dengan tipe situs ecommerce
Prasyarat: Toko sudah menerima minimal satu pesanan.

Halaman UI: /sites/:websiteId/orders dan /sites/:websiteId/orders/:id
Endpoint: GET dan PUT /api/sites/:websiteId/orders

Tabel dan kolom:
- mv_orders (id, website_id, order_number, status, tracking_number, buyer_name, buyer_email, total)
- mv_order_items (order_id, product_name, qty, price, subtotal)
- mv_order_payments (order_id, status, proof_url)
- mv_notification_outbox (channel, to_address, template_key, payload_json)

Acceptance Criteria:
a. Daftar pesanan
   - Daftar difilter berdasarkan website_id dan diurutkan dari yang terbaru.
   - Tersedia penyaring berdasarkan status dan rentang tanggal, serta pencarian berdasarkan order_number atau nama pembeli.
b. Alur status
   - Nilai status berurutan: menunggu_pembayaran, diproses, dikirim, selesai, dibatalkan.
   - Perpindahan status hanya diperbolehkan maju satu langkah, kecuali pembatalan yang dapat dilakukan sebelum status dikirim.
   - Perpindahan yang tidak sah ditolak dengan 400 beserta penjelasan.
c. Nomor resi
   - Saat status diubah menjadi dikirim, sistem mewajibkan pengisian tracking_number.
   - Nomor resi ditampilkan kepada pembeli pada halaman pelacakan pesanan.
d. Notifikasi ke pembeli
   - Setiap perubahan status mengantrekan pengiriman email ke pembeli lewat mv_notification_outbox.
   - Isi pesan memuat order_number, status baru, dan nomor resi bila ada.
e. Pengembalian stok
   - Pembatalan pesanan mengembalikan stok produk dan varian ke jumlah semula.
   - Pengembalian dijalankan dalam satu transaksi bersama perubahan status.
f. Post-condition
   - Halaman detail pesanan menampilkan riwayat perubahan status beserta waktunya.


MLD-033 - Kode Promo dan Diskon

User Story: Sebagai Pengguna pemilik toko, saya ingin membuat kode promo berupa potongan nominal atau persentase dengan batas pemakaian dan masa berlaku, agar saya dapat menjalankan kampanye penjualan.

Aktor: Pengguna Terdaftar dengan tipe situs ecommerce
Prasyarat: Toko sudah memiliki produk.

Halaman UI: /sites/:websiteId/promos
Endpoint kelola: GET, POST, PUT, DELETE /api/sites/:websiteId/promos
Endpoint validasi publik: POST /api/public/sites/:websiteId/promos/validate

Tabel dan kolom:
- mv_promo_codes (id, website_id, code, discount_type, discount_value, min_purchase, max_usage, used_count, starts_on, ends_on, is_active)
- mv_promo_usages (id, promo_code_id, order_id, used_on)
- mv_orders (discount, promo_code_id)

Acceptance Criteria:
a. Bentuk potongan
   - Nilai discount_type: nominal atau percentage.
   - Untuk percentage, nilai discount_value dibatasi antara 1 sampai 100.
   - Kolom min_purchase menetapkan minimal belanja sebelum promo berlaku.
b. Keunikan kode
   - Kolom code dinormalisasi menjadi huruf besar dan wajib unik dalam satu situs.
   - Unique index dipasang pada pasangan website_id dan code.
c. Validasi saat dipakai
   - Sistem memeriksa berurutan: kode ada, is_active bernilai true, waktu saat ini berada di antara starts_on dan ends_on, used_count belum mencapai max_usage, dan subtotal memenuhi min_purchase.
   - Setiap kegagalan mengembalikan pesan spesifik, bukan pesan umum, agar pembeli tahu penyebabnya.
d. Pencegahan pemakaian berlebih
   - Penambahan used_count dilakukan dalam transaksi yang sama dengan pembuatan pesanan, memakai penguncian baris.
   - Alasannya, dua pembeli yang menukarkan kode terakhir secara bersamaan tidak boleh sama-sama berhasil.
e. Pencatatan pemakaian
   - Setiap pemakaian dicatat ke mv_promo_usages beserta order_id, agar pemilik toko dapat menelusuri.
f. Post-condition
   - Nilai potongan disalin ke mv_orders.discount saat pesanan dibuat dan tidak berubah walaupun promo dihentikan kemudian.


MLD-034 - Laporan Penjualan

User Story: Sebagai Pengguna pemilik toko, saya ingin melihat omzet per periode dan produk terlaris serta mengekspornya ke CSV, agar saya dapat mengevaluasi penjualan saya.

Aktor: Pengguna Terdaftar dengan tipe situs ecommerce
Prasyarat: Toko sudah memiliki pesanan berstatus selesai.

Halaman UI: /sites/:websiteId/reports/sales
Endpoint: GET /api/sites/:websiteId/reports/sales
Endpoint ekspor: GET /api/sites/:websiteId/reports/sales/export

Tabel dan kolom:
- mv_orders (website_id, total, status, created_at)
- mv_order_items (order_id, product_id, product_name, qty, subtotal)

Acceptance Criteria:
a. Penyaring laporan
   - Tersedia rentang tanggal serta tingkat agregasi harian, mingguan, atau bulanan.
   - Seluruh query wajib menyertakan filter website_id.
b. Perhitungan omzet
   - Omzet dihitung dari penjumlahan mv_orders.total dengan status bernilai selesai.
   - Pesanan yang dibatalkan tidak ikut dihitung.
   - Laporan menampilkan pula jumlah pesanan dan nilai rata-rata per pesanan.
c. Produk terlaris
   - Peringkat dihitung dari penjumlahan mv_order_items.qty, dikelompokkan berdasarkan product_id.
   - Ditampilkan sepuluh teratas beserta jumlah terjual dan kontribusi omzetnya.
d. Visualisasi
   - Tren omzet ditampilkan sebagai grafik garis mengikuti tingkat agregasi terpilih.
   - Produk terlaris ditampilkan sebagai tabel, bukan grafik, karena yang dibaca adalah angkanya.
e. Ekspor CSV
   - Berkas CSV memuat kolom yang sama dengan tampilan tabel.
   - Nama berkas memuat nama situs dan rentang tanggal, agar mudah diarsipkan.
f. Post-condition
   - Seluruh data bersifat baca saja. Laporan tidak mengubah data transaksi mana pun.


===============================================================================


E. SUBDOMAIN DAN PUBLIKASI


MLD-035 - Klaim Nama Subdomain

User Story: Sebagai Pengguna, saya ingin memilih sendiri nama subdomain situs saya dengan pengecekan ketersediaan langsung, agar situs saya punya alamat yang mudah diingat dan saya tahu seketika bila nama itu sudah dipakai.

Aktor: Pengguna Terdaftar
Prasyarat: Situs sudah dibuat pada MLD-008.

Halaman UI: /sites/:websiteId/domain
Endpoint cek: GET /api/subdomains/check dengan parameter name
Endpoint klaim: POST /api/sites/:websiteId/subdomain

Tabel dan kolom:
- websites (id, subdomain, domain, owner_customer_id)
- mv_reserved_subdomains (id, word, type, created_at)

Acceptance Criteria:
a. Aturan penulisan nama
   - Nama dinormalisasi menjadi huruf kecil dan hanya menerima a-z, 0-9, serta tanda hubung.
   - Nama tidak boleh diawali atau diakhiri tanda hubung, dan tidak boleh memuat dua tanda hubung berurutan.
   - Panjang nama dibatasi antara 3 sampai 63 karakter.
b. Pengecekan ketersediaan langsung
   - Frontend memanggil endpoint cek dengan penundaan singkat setelah pengguna berhenti mengetik.
   - Hasil ditampilkan seketika berupa penanda tersedia, sudah dipakai, atau tidak diperbolehkan.
c. Penolakan nama terlarang dan nama sistem
   - Sistem mencocokkan nama terhadap mv_reserved_subdomains.
   - Kolom type membedakan reserved (nama sistem seperti www, api, admin, app, mail, cdn, static) dan blocked (kata terlarang).
   - Daftar ini dikelola dari console pada MLD-056.
d. Saran alternatif
   - Bila nama sudah dipakai, sistem menawarkan tiga alternatif, contoh: menambah sufiks angka, menambah kata jenis usaha, atau memakai tanda hubung.
   - Alternatif yang ditawarkan wajib sudah diperiksa ketersediaannya.
e. Klaim final
   - Saat diklaim, sistem menyimpan nama pada websites.subdomain dan menyusun websites.domain lengkap dengan menambahkan sufiks platform, contoh: nama.melodyv2.phisoft.co.id.
   - Kolom subdomain dan domain masing-masing memiliki unique index.
   - Pemeriksaan ketersediaan diulang di dalam transaksi klaim, karena hasil pengecekan sebelumnya bisa sudah basi.
f. Post-condition
   - Nama subdomain dapat diubah selama situs masih berstatus draft.
   - Setelah situs published, perubahan nama meminta konfirmasi karena alamat lama akan berhenti bekerja.


MLD-036 - Publikasi dan Batal Publikasi Situs

User Story: Sebagai Pengguna, saya ingin menayangkan situs saya dengan sekali klik dan dapat menariknya kembali menjadi draft, agar saya memegang kendali kapan situs saya dapat dilihat publik.

Aktor: Pengguna Terdaftar
Prasyarat: Subdomain sudah diklaim pada MLD-035.

Halaman UI: tombol Publikasikan pada /sites/:websiteId/builder
Endpoint terbit: POST /api/sites/:websiteId/publish
Endpoint tarik: POST /api/sites/:websiteId/unpublish

Tabel dan kolom:
- websites (id, subdomain, domain, status, published_at, is_active)
- themes (website_id, schema JSON, is_active)

Acceptance Criteria:
a. Prasyarat sebelum terbit
   - Sistem memeriksa bahwa subdomain sudah terisi, tema aktif sudah ada, dan halaman beranda memiliki minimal satu bagian.
   - Jika ada yang kurang, tampilkan daftar hal yang perlu dilengkapi beserta tautan menuju bagiannya.
b. Publikasi instan
   - Publikasi hanya mengubah websites.status menjadi published dan mengisi published_at.
   - Tidak ada proses build. Ini konsekuensi langsung dari keputusan rendering schema-driven pada asumsi nomor 3.
   - Situs dapat diakses publik seketika setelah status berubah.
c. Batal publikasi
   - Menarik publikasi mengubah status kembali menjadi draft.
   - Alamat publik menampilkan halaman informasi bahwa situs sedang tidak tayang, bukan galat server.
   - Kolom published_at dipertahankan sebagai catatan kapan situs pernah tayang.
d. Perilaku perubahan setelah tayang
   - Perubahan yang dilakukan setelah situs tayang langsung terlihat publik, karena renderer membaca schema terbaru.
   - Jika perilaku ini tidak diinginkan, diperlukan pemisahan schema draft dan schema live. Lihat Pertanyaan Terbuka nomor 6.
e. Penjagaan kuota dan langganan
   - Situs tidak dapat dipublikasikan bila langganan pengguna berstatus expired.
   - Situs yang sudah tayang tidak otomatis ditarik saat langganan habis, melainkan diberi masa tenggang yang ditetapkan.
f. Post-condition
   - Setelah tayang, badge platform pada MLD-051 ditampilkan bila pengguna memakai paket gratis.


===============================================================================


F. DASHBOARD PENGGUNA


MLD-042 - Dashboard Situs Saya

User Story: Sebagai Pengguna, saya ingin melihat seluruh situs milik saya beserta statusnya dan aksi cepat, agar saya dapat berpindah antar situs dengan mudah.

Aktor: Pengguna Terdaftar
Prasyarat: Sudah login.

Halaman UI: /dashboard
Endpoint: GET /api/me/sites

Tabel dan kolom:
- websites (id, name, subdomain, domain, status, published_at, owner_customer_id, site_type_id, is_active)
- mv_site_types (name)
- mv_plans (limits JSON)

Acceptance Criteria:
a. Peran ganda halaman ini
   - Halaman ini sekaligus berfungsi sebagai pemilih situs. Karena tenant situs publik ditentukan dari host, sedangkan dashboard berdiri di satu domain, pemilihan situs di dashboard dilakukan eksplisit dari sini.
b. Daftar situs
   - Query difilter berdasarkan owner_customer_id sama dengan id pengguna dari sesi.
   - Setiap kartu menampilkan nama situs, tipe situs, alamat subdomain, status draft atau tayang, dan waktu perubahan terakhir.
c. Pratinjau kecil
   - Setiap kartu menampilkan gambar pratinjau situs.
   - Gambar dihasilkan pekerja latar belakang setelah publikasi dan disimpan sebagai berkas, tidak dibuat ulang setiap halaman dibuka.
d. Aksi cepat
   - Tersedia aksi: buka situs, sunting, duplikat, dan hapus.
   - Aksi buka hanya aktif untuk situs berstatus tayang.
   - Aksi hapus meminta pengguna mengetikkan nama situs sebagai konfirmasi.
e. Validasi kepemilikan di backend
   - Setiap endpoint yang menerima websiteId wajib memverifikasi bahwa websites.owner_customer_id sama dengan id pengguna, atau pengguna berstatus super admin.
   - Tanpa ini, pengguna cukup mengubah angka di URL untuk menyunting situs orang lain. Verifikasi ini syarat rilis, bukan pekerjaan fase berikutnya.
f. Post-condition
   - Halaman menampilkan sisa kuota jumlah situs sesuai paket, beserta tombol tambah situs bila masih tersedia.


MLD-043 - Statistik Pengunjung

User Story: Sebagai Pengguna, saya ingin melihat jumlah kunjungan, halaman terpopuler, asal pengunjung, dan perangkat yang dipakai, agar saya tahu apakah situs saya benar-benar dilihat orang.

Aktor: Pengguna Terdaftar
Prasyarat: Situs sudah tayang.

Halaman UI: /sites/:websiteId/stats
Endpoint: GET /api/sites/:websiteId/stats dengan parameter rentang tanggal

Tabel dan kolom:
- mv_site_stats_daily (id, website_id, stat_date, visits, unique_visitors, top_pages JSON, referrers JSON, devices JSON)

Acceptance Criteria:
a. Pengumpulan data
   - melody-renderer mencatat setiap permintaan halaman ke antrean, bukan langsung menulis ke basis data, agar tidak memperlambat penyajian halaman.
   - Pekerja latar belakang meringkas antrean menjadi satu baris per situs per hari.
b. Metrik yang dihitung
   - Kolom visits mencatat jumlah tampilan halaman.
   - Kolom unique_visitors mencatat pengunjung unik berdasarkan sidik jari anonim, tanpa menyimpan alamat IP mentah.
   - Kolom top_pages, referrers, dan devices menyimpan agregat sepuluh teratas dalam bentuk JSON.
c. Penghormatan privasi
   - Tidak ada cookie pelacak pihak ketiga yang dipasang.
   - Alamat IP hanya dipakai sesaat untuk menghitung keunikan, lalu dibuang dan tidak disimpan.
d. Tampilan
   - Ditampilkan grafik garis untuk tren kunjungan harian atau bulanan.
   - Ditampilkan tiga tabel ringkas: halaman terpopuler, asal pengunjung, dan perangkat.
e. Rentang waktu
   - Tersedia pilihan cepat: 7 hari, 30 hari, dan 90 hari terakhir, serta rentang khusus.
   - Data lebih lama dari masa retensi yang ditetapkan diringkas menjadi bulanan.
f. Post-condition
   - Seluruh data bersifat baca saja dan difilter berdasarkan website_id milik pengguna.


MLD-044 - Kotak Masuk Pesan

User Story: Sebagai Pengguna, saya ingin melihat seluruh pesan dari formulir kontak semua situs saya dalam satu tempat, agar saya tidak perlu membuka situs satu per satu.

Aktor: Pengguna Terdaftar
Prasyarat: Minimal satu situs sudah menerima pesan.

Halaman UI: /inbox
Endpoint: GET /api/me/inbox
Endpoint tandai: PUT /api/inbox/:id/read

Tabel dan kolom:
- contact_messages (id, website_id, name, email, phone, subject, message, is_read, created_at)
- websites (id, name, owner_customer_id)

Acceptance Criteria:
a. Gabungan lintas situs
   - Query mengambil contact_messages yang website_id-nya termasuk daftar situs milik pengguna.
   - Setiap baris menampilkan nama situs asal, agar pengguna tahu pesan itu datang dari mana.
b. Penanda dibaca
   - Pesan yang belum dibaca ditandai visual berbeda dan dihitung sebagai lencana angka pada menu.
   - Membuka detail pesan mengubah is_read menjadi true.
   - Tersedia aksi menandai seluruhnya sudah dibaca.
c. Penyaringan dan pencarian
   - Tersedia penyaring berdasarkan situs, status baca, dan rentang tanggal.
   - Tersedia pencarian pada kolom nama, email, dan isi pesan.
d. Balas cepat
   - Detail pesan menyediakan tombol balas lewat email dan tombol balas lewat WhatsApp bila nomor telepon terisi.
   - Tombol tersebut membuka aplikasi email atau WhatsApp, sistem tidak mengirim atas nama pengguna.
e. Validasi kepemilikan
   - Membuka pesan milik situs orang lain mengembalikan 404, bukan 403, agar keberadaannya tidak terungkap.
f. Post-condition
   - Pesan dapat diarsipkan. Penghapusan permanen mengikuti kebijakan retensi.


MLD-045 - Notifikasi Email

User Story: Sebagai Pengguna, saya ingin menerima email saat ada pesan masuk, pesanan baru, kuota hampir habis, atau langganan akan berakhir, agar saya tidak perlu terus membuka dashboard.

Aktor: Sistem
Prasyarat: Pengguna memiliki alamat email terverifikasi.

Halaman UI pengaturan: /settings/notifications
Endpoint: GET dan PUT /api/me/notification-settings

Tabel dan kolom:
- mv_notification_outbox (id, customer_id, channel, to_address, template_key, payload_json, status, sent_on, error_message, retry_count)
- Customers (email, no_hp)
- Kolom preferensi disimpan sebagai JSON pada Customers atau tabel pengaturan terpisah

Acceptance Criteria:
a. Peristiwa pemicu
   - Nilai template_key pada rilis pertama: pesan_masuk_baru, pesanan_baru, kuota_hampir_habis, dan langganan_akan_berakhir.
   - Peringatan kuota dikirim saat sisa mencapai 20 persen dan 5 persen.
   - Peringatan langganan dikirim tujuh hari dan satu hari sebelum berakhir.
b. Pola outbox
   - Sistem tidak mengirim email secara sinkron. Setiap pesan dimasukkan ke mv_notification_outbox dengan status QUEUED.
   - Pekerja latar belakang mengambil antrean, mengirim, lalu mengubah status menjadi SENT atau FAILED.
   - Alasannya, kegagalan penyedia email tidak boleh menggagalkan aksi pengguna yang memicunya.
c. Percobaan ulang
   - Pengiriman yang gagal dicoba ulang dengan jeda bertambah, maksimal beberapa kali, lalu berhenti dan menyimpan error_message.
d. Preferensi pengguna
   - Pengguna dapat mematikan tiap jenis notifikasi secara terpisah.
   - Notifikasi yang berkaitan dengan penagihan dan langganan tidak dapat dimatikan, karena bersifat transaksional.
e. Pencegahan banjir pesan
   - Beberapa peristiwa sejenis dalam rentang waktu singkat digabung menjadi satu email ringkasan.
f. Post-condition
   - Riwayat pengiriman dapat diperiksa super admin dari console untuk keperluan penelusuran keluhan.


MLD-046 - Duplikat Situs

User Story: Sebagai Pengguna, saya ingin menyalin situs yang sudah ada sebagai dasar situs baru, agar saya tidak perlu mengulang pekerjaan dari awal untuk cabang atau varian usaha saya.

Aktor: Pengguna Terdaftar
Prasyarat: Memiliki minimal satu situs dan kuota jumlah situs masih tersedia.

Halaman UI: aksi Duplikat pada kartu situs di /dashboard
Endpoint: POST /api/sites/:websiteId/duplicate

Tabel dan kolom:
- websites (seluruh kolom, kecuali subdomain, domain, status, dan published_at)
- themes (website_id, schema JSON)
- custom_pages (theme_id, page, items JSON)
- Media (website_id)
- mv_site_widgets (website_id)
- mv_site_versions (website_id)

Acceptance Criteria:
a. Pemeriksaan kuota
   - Sebelum penyalinan, sistem memeriksa batas jumlah situs pada paket pengguna.
   - Jika penuh, tolak dengan 402 beserta ajakan upgrade.
b. Apa yang disalin
   - Disalin: baris websites, tema beserta schema, seluruh halaman beserta bagiannya, konfigurasi widget, dan rujukan media.
   - Tidak disalin: subdomain, domain, status, published_at, riwayat versi, statistik pengunjung, pesan masuk, dan pesanan.
c. Perlakuan terhadap media
   - Berkas media tidak digandakan secara fisik. Baris Media baru dibuat menunjuk berkas yang sama.
   - Alasannya, menggandakan berkas akan menghabiskan kuota penyimpanan pengguna dua kali lipat untuk isi yang identik.
d. Penamaan hasil salinan
   - Situs hasil salinan diberi nama dengan akhiran salinan, dan status awalnya draft.
   - Pengguna diarahkan ke halaman klaim subdomain pada MLD-035.
e. Transaksi
   - Seluruh penyalinan dijalankan dalam satu transaksi. Kegagalan di tengah membatalkan seluruhnya, tidak meninggalkan situs setengah jadi.
f. Post-condition
   - Situs hasil salinan memiliki satu baris versi awal pada mv_site_versions dengan label "Salinan dari situs asal".


===============================================================================


G. LANGGANAN DAN PEMBAYARAN


MLD-047 - Paket Langganan Gratis, Pro, dan Bisnis

User Story: Sebagai Pengguna, saya ingin memilih paket langganan yang sesuai kebutuhan saya, agar saya hanya membayar kapabilitas yang benar-benar saya pakai.

Aktor: Pengguna Terdaftar
Prasyarat: Sudah login.

Halaman UI: /settings/billing dan /upgrade
Endpoint daftar paket: GET /api/plans
Endpoint berlangganan: POST /api/me/subscription

Tabel dan kolom:
- mv_plans (id, code, name, price_monthly, price_yearly, limits JSON, is_best_value, is_active, sort_order)
- mv_subscriptions (id, customer_id, plan_id, status, billing_cycle, current_period_start, current_period_end, trial_ends_at)
- mv_credit_ledger (customer_id, amount, reference_type)

Acceptance Criteria:
a. Isi kolom limits
   - Objek limits menyimpan: max_sites, ai_message_quota, storage_mb, custom_domain (boolean), version_history_count, dan remove_platform_badge (boolean).
   - Nilai limits dikelola terpusat oleh super admin pada MLD-057 dan berlaku ke seluruh pengguna paket tersebut.
b. Masa percobaan dan kredit awal
   - Setiap pengguna baru mendapat masa percobaan yang lamanya ditetapkan pada paket, dicatat pada trial_ends_at.
   - Selama masa percobaan, pengguna dapat membuat template sampai batas kredit awal yang diberikan.
   - Kredit awal dimasukkan sebagai satu baris mv_credit_ledger dengan reference_type bernilai initial_grant.
c. Siklus penagihan
   - Nilai billing_cycle: monthly atau yearly.
   - Harga tahunan ditampilkan beserta besaran penghematannya dibanding bulanan.
d. Naik dan turun paket
   - Naik paket berlaku seketika, dengan perhitungan selisih untuk sisa periode berjalan.
   - Turun paket berlaku pada awal periode berikutnya, agar pengguna tidak kehilangan kapabilitas yang sudah dibayar.
   - Sebelum turun paket, sistem memperingatkan bila jumlah situs atau penyimpanan pengguna melebihi batas paket tujuan.
e. Penegakan batas
   - Batas diperiksa saat aksi dilakukan, bukan lewat pekerjaan berkala.
   - Melebihi batas menghasilkan 402 beserta pesan yang menyebut batas mana yang terlampaui.
f. Post-condition
   - Setelah pembayaran berhasil, mv_subscriptions.status menjadi active dan periode diperpanjang.


MLD-048 - Payment Gateway Langganan

User Story: Sebagai Pengguna, saya ingin membayar dan memperpanjang langganan dengan aktivasi otomatis, agar layanan saya tidak terputus dan saya tidak perlu menunggu konfirmasi manual.

Aktor: Pengguna Terdaftar dan Sistem
Prasyarat: Pengguna sudah memilih paket.

Halaman UI: /settings/billing/checkout
Endpoint bayar: POST /api/me/subscription/pay
Endpoint webhook: POST /api/webhooks/subscription-payment

Tabel dan kolom:
- mv_payments (id, invoice_id, gateway, external_id, amount, status, payload_json, created_at)
- mv_invoices (id, subscription_id, invoice_number, amount, status, paid_on)
- mv_subscriptions (status, current_period_end)

Acceptance Criteria:
a. Penyedia dapat diganti lewat konfigurasi
   - Nama penyedia disimpan pada kolom gateway, tidak ditanam di kode.
   - Antarmuka pemanggilan penyedia dibuat sebagai adapter, sehingga menambah penyedia baru tidak mengubah alur pembayaran.
   - Penyedia yang dipertimbangkan: Midtrans dan Xendit. Lihat Pertanyaan Terbuka nomor 5.
b. Pembuatan transaksi
   - Sistem membuat invoice lebih dulu, baru memanggil penyedia dengan merujuk invoice_number.
   - Respons penyedia disimpan mentah pada payload_json, agar dapat ditelusuri saat terjadi sengketa.
c. Aktivasi otomatis lewat webhook
   - Endpoint webhook memverifikasi signature sebelum memproses apa pun. Request tanpa signature sah ditolak dengan 401.
   - Webhook bersifat idempoten, diperiksa berdasarkan external_id, sehingga notifikasi ganda tidak memperpanjang langganan dua kali.
d. Pembaruan status
   - Pembayaran lunas mengubah mv_invoices.status menjadi paid, mengisi paid_on, memperpanjang current_period_end, dan mengembalikan mv_subscriptions.status menjadi active.
   - Seluruh perubahan dilakukan dalam satu transaksi.
e. Penanganan kegagalan dan keterlambatan
   - Pembayaran gagal tidak mengubah status langganan.
   - Pekerjaan berkala harian mencari invoice berstatus unpaid yang melewati jatuh tempo, lalu mengubah mv_subscriptions.status menjadi past_due.
   - Saat past_due, pembuatan situs baru dan pemakaian AI dihentikan, namun situs yang sudah tayang tetap dapat diakses selama masa tenggang.
f. Post-condition
   - Pengambilan biaya layanan diatur pada konfigurasi penyedia, bukan pada kode aplikasi.


MLD-049 - Riwayat Transaksi dan Invoice

User Story: Sebagai Pengguna, saya ingin melihat daftar pembayaran saya dan mengunduh invoice dalam bentuk PDF, agar saya punya bukti untuk pembukuan.

Aktor: Pengguna Terdaftar
Prasyarat: Pengguna pernah melakukan minimal satu pembayaran.

Halaman UI: /settings/billing/invoices
Endpoint daftar: GET /api/me/invoices
Endpoint unduh: GET /api/me/invoices/:id/pdf

Tabel dan kolom:
- mv_invoices (id, subscription_id, invoice_number, amount, currency, status, issued_date, due_date, paid_on)
- mv_payments (invoice_id, gateway, method, status)
- mv_subscriptions (customer_id, plan_id)
- mv_plans (name)

Acceptance Criteria:
a. Daftar transaksi
   - Daftar difilter berdasarkan customer_id dari sesi dan diurutkan dari yang terbaru.
   - Kolom yang ditampilkan: nomor invoice, tanggal terbit, nama paket, jumlah, dan status.
b. Penyaringan dan pencarian
   - Tersedia penyaring berdasarkan status: paid, unpaid, dan cancelled.
   - Tersedia pencarian berdasarkan invoice_number.
c. Unduh PDF
   - PDF memuat identitas platform, identitas pengguna, rincian paket, periode langganan, jumlah, pajak bila ada, dan status pembayaran.
   - Nomor invoice pada PDF sama persis dengan yang tersimpan di basis data.
d. Status langganan dan tanggal berakhir
   - Halaman menampilkan ringkasan di bagian atas: paket aktif, status, dan tanggal berakhir periode berjalan.
   - Bila status past_due, ditampilkan spanduk peringatan beserta tombol bayar sekarang.
e. Validasi kepemilikan
   - Mengakses invoice milik pengguna lain mengembalikan 404.
f. Post-condition
   - Invoice bersifat baca saja. Perubahan hanya boleh dilakukan super admin lewat MLD-052.


MLD-050 - Pembelian Kuota AI Tambahan

User Story: Sebagai Pengguna, saya ingin membeli kuota AI tambahan di luar kuota bulanan tanpa harus naik paket, agar saya dapat menyelesaikan pekerjaan yang sedang berjalan.

Aktor: Pengguna Terdaftar
Prasyarat: Memiliki langganan aktif.

Halaman UI: /settings/billing/credits
Endpoint daftar paket kredit: GET /api/credit-packs
Endpoint beli: POST /api/me/credits/purchase

Tabel dan kolom:
- mv_plans (code bertipe credit_pack, price_monthly dipakai sebagai harga sekali beli, limits JSON berisi jumlah kredit)
- mv_credit_ledger (customer_id, balance_before, amount, balance_after, reference_type bernilai credit_purchase, reference_id)
- mv_invoices dan mv_payments untuk transaksinya

Acceptance Criteria:
a. Paket kredit tambahan
   - Tersedia beberapa ukuran paket kredit dengan harga yang berbeda.
   - Paket kredit dikelola dari console yang sama dengan paket langganan.
b. Kredit sebagai satuan pemakaian
   - Kredit yang dibeli menjadi satuan untuk mengubah website, sama dengan satuan yang dipotong pada MLD-015.
   - Tidak ada dua jenis saldo. Kredit dari paket bulanan dan kredit hasil pembelian masuk ke ledger yang sama.
c. Urutan pemakaian
   - Kredit bawaan paket dipakai lebih dulu, baru kredit hasil pembelian.
   - Alasannya, kredit bawaan hangus di akhir periode sedangkan kredit beli tidak.
d. Masa berlaku
   - Kredit hasil pembelian tidak hangus di akhir periode langganan.
   - Kebijakan ini ditampilkan jelas pada halaman pembelian agar tidak menimbulkan sengketa.
e. Pencatatan
   - Penambahan saldo dicatat sebagai satu baris mv_credit_ledger dengan amount positif dan reference_id menunjuk invoice pembelian.
   - Saldo dihitung dari balance_after baris terakhir, tidak pernah dihitung ulang dari seluruh riwayat.
f. Post-condition
   - Kredit masuk seketika setelah pembayaran dikonfirmasi webhook.
   - Indikator kuota pada MLD-015 langsung memperlihatkan saldo baru.


MLD-051 - Badge Dibuat dengan Melody

User Story: Sebagai pemilik platform, saya ingin situs paket gratis menampilkan tanda platform yang hilang otomatis pada paket berbayar, agar platform mendapat eksposur sekaligus memberi insentif untuk berlangganan.

Aktor: Sistem
Prasyarat: Situs sudah tayang.

Halaman UI: bagian footer situs tenant
Berkas terkait: melody-renderer

Tabel dan kolom:
- mv_plans (limits JSON, kunci remove_platform_badge)
- mv_subscriptions (customer_id, plan_id, status)
- websites (owner_customer_id, status)

Acceptance Criteria:
a. Penentuan tampil atau tidak
   - Saat merender situs, melody-renderer membaca paket aktif pemilik situs.
   - Badge ditampilkan bila remove_platform_badge bernilai false atau langganan tidak aktif.
b. Penempatan
   - Badge ditempatkan di footer, tidak menutupi konten, dan tidak mengambang.
   - Badge memuat tautan menuju halaman utama platform.
c. Kesesuaian tema
   - Warna badge mengikuti token tema situs agar tidak merusak tampilan.
   - Badge tetap memenuhi rasio kontras minimum terhadap latar footer.
d. Tidak dapat dimatikan dari sisi tenant
   - Penentuan tampil dilakukan di sisi server saat render, bukan lewat CSS yang bisa ditimpa.
   - Alasannya, penyembunyian lewat CSS mudah dilewati dan menghilangkan insentif berlangganan.
e. Perubahan seketika saat naik paket
   - Setelah pengguna naik ke paket berbayar, badge hilang tanpa perlu menerbitkan ulang situs.
f. Post-condition
   - Perubahan status langganan menjadi expired memunculkan kembali badge setelah masa tenggang berakhir.


===============================================================================


H. SUPER ADMIN


MLD-052 - Console Super Admin

User Story: Sebagai Super Admin, saya ingin melihat dashboard platform beserta daftar seluruh pengguna dan situs serta dapat menangguhkan atau mengaktifkannya, agar saya dapat mengelola operasional layanan.

Aktor: Super Admin
Prasyarat: Customers.is_super_admin bernilai true.

Halaman UI: /console dan /console/tenants
Endpoint: GET /api/console/overview, GET /api/console/tenants, PUT /api/console/tenants/:id/status

Tabel dan kolom:
- Customers (id, username, email, is_site_owner, is_super_admin, created_at)
- websites (id, name, subdomain, status, owner_customer_id, is_active)
- mv_subscriptions (customer_id, plan_id, status)
- mv_usage_daily (customer_id, cost)

Acceptance Criteria:
a. Gerbang akses terpisah
   - Seluruh endpoint di bawah /api/console wajib memvalidasi is_super_admin bernilai true.
   - Pengguna biasa yang mencoba mengakses diarahkan kembali ke dashboard, bukan diberi pesan galat yang menjelaskan keberadaan console.
b. Ringkasan platform
   - Dashboard menampilkan: total pengguna, total situs, situs tayang, langganan aktif, dan biaya AI periode berjalan.
   - Angka dihitung dari agregasi, bukan dari kolom yang dipelihara manual.
c. Daftar dan pencarian
   - Daftar tenant menampilkan pemilik, jumlah situs, paket aktif, status penagihan, dan pemakaian AI.
   - Tersedia pencarian berdasarkan email, username, nama situs, dan subdomain.
d. Tangguhkan dan aktifkan
   - Menangguhkan akun mengubah seluruh situs miliknya menjadi is_active bernilai false, sehingga alamat publiknya mengembalikan 503.
   - Menangguhkan satu situs hanya mempengaruhi situs tersebut.
   - Setiap penangguhan wajib disertai alasan yang dicatat.
e. Peninjauan situs
   - Super admin dapat membuka pratinjau situs mana pun tanpa mengubah datanya.
f. Post-condition
   - Pengaktifan kembali mengembalikan status situs ke kondisi sebelum ditangguhkan, bukan otomatis menjadi tayang.


MLD-053 - Moderasi Konten dan Penanganan Penyalahgunaan

User Story: Sebagai Super Admin, saya ingin sistem menandai konten bermasalah secara otomatis dan menyediakan antrean tinjauan, agar situs yang melanggar dapat ditindak sebelum merusak reputasi platform.

Aktor: Super Admin dan Sistem
Prasyarat: Ada situs yang tayang.

Halaman UI: /console/moderation
Endpoint: GET /api/console/moderation, PUT /api/console/moderation/:id
Endpoint laporan publik: POST /api/public/report

Tabel dan kolom:
- mv_moderation_flags (id, website_id, flag_type, source, keyword, status, reported_by_ip, reviewed_by, reviewed_on, notes, created_at)
- websites (is_active, status)

Acceptance Criteria:
a. Prioritas fitur
   - Fitur ini dijadwalkan pada rilis awal, bukan rilis akhir.
   - Alasannya, situs publik yang dapat dibuat siapa saja di subdomain perusahaan membawa risiko reputasi sejak hari pertama tayang.
b. Penandaan otomatis
   - Setiap kali situs dipublikasikan, pekerja latar belakang memindai seluruh teks pada schema terhadap daftar kata kunci sensitif.
   - Temuan dicatat sebagai baris mv_moderation_flags dengan source bernilai auto_scan dan status pending.
c. Tombol laporan pada situs tenant
   - Setiap situs tenant memuat tautan laporan yang tidak mencolok pada footer.
   - Laporan dari pengunjung dicatat dengan source bernilai user_report beserta alamat IP pelapor untuk mencegah penyalahgunaan.
   - Diterapkan pembatasan laju agar satu pihak tidak dapat membanjiri antrean.
d. Antrean tinjauan manual
   - Antrean diurutkan berdasarkan tingkat keparahan lalu waktu, dan menampilkan pratinjau situs beserta bagian yang ditandai.
   - Super admin memilih salah satu tindakan: abaikan, peringatkan pemilik, atau nonaktifkan situs.
e. Penonaktifan situs bermasalah
   - Penonaktifan mengubah websites.is_active menjadi false dan mengisi alasan pada notes.
   - Pemilik situs menerima email berisi alasan dan cara mengajukan keberatan.
f. Post-condition
   - Setiap perubahan status flag mencatat reviewed_by dan reviewed_on.
   - Situs yang pernah ditandai diberi penanda pada daftar tenant agar mudah dipantau.


MLD-054 - Pemantauan Pemakaian dan Biaya AI

User Story: Sebagai Super Admin, saya ingin memantau pemakaian token dan biaya AI per pengguna beserta tren dan peringatan pemakaian tidak wajar, agar biaya platform tetap terkendali.

Aktor: Super Admin
Prasyarat: Sudah ada pemakaian AI.

Halaman UI: /console/ai-usage
Endpoint: GET /api/console/ai-usage

Tabel dan kolom:
- mv_usage_daily (id, customer_id, period_date, tokens_in, tokens_out, cost, message_count)
- mv_chat_messages (session_id, tokens_in, tokens_out, cost, created_at)
- mv_ai_jobs (job_type, status)

Acceptance Criteria:
a. Peringkasan harian
   - Pekerja latar belakang meringkas mv_chat_messages menjadi satu baris mv_usage_daily per pengguna per hari.
   - Alasannya, tabel pesan tumbuh sangat cepat dan tidak layak diagregasi langsung saat halaman dibuka.
b. Metrik yang ditampilkan
   - Total token masuk dan keluar, total biaya, dan jumlah pesan.
   - Rincian dapat dipecah per pengguna, per fitur, dan per model.
c. Grafik tren
   - Ditampilkan tren biaya harian dan bulanan untuk seluruh platform.
   - Ditampilkan pula sepuluh pengguna dengan pemakaian tertinggi pada periode terpilih.
d. Peringatan pemakaian tidak wajar
   - Sistem memunculkan peringatan bila pemakaian harian seorang pengguna melebihi beberapa kali lipat rata-rata pemakaiannya sendiri.
   - Peringatan juga muncul bila total biaya harian platform melampaui ambang yang ditetapkan.
e. Batas keras yang wajib ada
   - Pemantauan bukan pembatasan. Wajib ada batas keras pemakaian per pengguna per hari yang berlaku bahkan ketika kredit berbayar masih tersedia.
   - Batas ini melindungi platform dari pemakaian tidak wajar maupun kesalahan program.
f. Post-condition
   - Data dapat diekspor untuk keperluan rekonsiliasi dengan tagihan penyedia model.


MLD-055 - Manajemen Template dan Bagian Halaman

User Story: Sebagai Super Admin, saya ingin menambah, menyunting, dan menonaktifkan template maupun bagian halaman langsung dari console, agar katalog dapat berkembang tanpa perlu deploy ulang.

Aktor: Super Admin
Prasyarat: is_super_admin bernilai true.

Halaman UI: /console/catalog
Endpoint: GET, POST, PUT, DELETE /api/console/sections dan /api/console/templates

Tabel dan kolom:
- mv_section_catalog (id, code, name, category, variants JSON, props_schema JSON, thumbnail, sort_order, is_active)
- mv_templates (id, site_type_id, name, industry, thumbnail, schema JSON, is_active)
- mv_site_types (id, code, name, allowed_sections JSON)

Acceptance Criteria:
a. Dasar yang memungkinkan
   - Fitur ini mungkin dilakukan karena katalog disimpan sebagai data pada mv_section_catalog dan mv_templates, bukan ditanam di kode.
   - Jika katalog ditanam di kode, MLD-055 mustahil dipenuhi tanpa deploy.
b. Penyuntingan bagian halaman
   - Super admin dapat mengubah nama, kategori, thumbnail, urutan tampil, dan daftar variant.
   - Kolom props_schema disunting lewat editor JSON dengan validasi bentuk sebelum disimpan.
c. Penjagaan saat menonaktifkan
   - Menonaktifkan bagian halaman tidak menghapusnya dari situs yang sudah memakainya.
   - Sistem menampilkan jumlah situs yang masih memakai bagian tersebut sebelum konfirmasi.
   - Bagian yang dinonaktifkan hanya hilang dari katalog untuk situs baru.
d. Penyuntingan template
   - Template baru dapat dibuat dengan menyalin schema dari situs yang sudah ada, lalu membersihkan datanya.
   - Perubahan template tidak mempengaruhi situs yang sudah menerapkannya sebelumnya.
e. Validasi rujukan
   - Sistem menolak penyimpanan mv_site_types.allowed_sections yang memuat kode bagian halaman yang tidak ada.
f. Post-condition
   - Perubahan katalog langsung terlihat oleh pengguna pada panel tambah bagian, tanpa perlu memuat ulang aplikasi.


MLD-056 - Manajemen Daftar Subdomain Terlarang

User Story: Sebagai Super Admin, saya ingin mengelola daftar kata terlarang dan nama yang dicadangkan sistem, agar tidak ada tenant yang mengambil nama sensitif atau nama yang dibutuhkan platform.

Aktor: Super Admin
Prasyarat: is_super_admin bernilai true.

Halaman UI: /console/reserved-subdomains
Endpoint: GET, POST, DELETE /api/console/reserved-subdomains

Tabel dan kolom:
- mv_reserved_subdomains (id, word, type, notes, created_by, created_at)
- websites (subdomain)

Acceptance Criteria:
a. Dua jenis entri
   - Nilai type bernilai reserved untuk nama sistem, contoh: www, api, admin, app, mail, cdn, static, blog, help, status.
   - Nilai type bernilai blocked untuk kata terlarang berdasarkan kebijakan konten.
b. Pengisian awal
   - Seeder mengisi daftar nama sistem sejak awal, sehingga tidak ada tenant yang sempat mengambilnya.
   - Seeder bersifat idempotent.
c. Pencocokan
   - Pencocokan dilakukan case-insensitive terhadap seluruh nama subdomain.
   - Untuk type bernilai blocked, pencocokan juga dilakukan terhadap potongan kata di dalam nama.
d. Penanganan nama yang sudah terlanjur dipakai
   - Saat kata baru ditambahkan, sistem menampilkan daftar situs yang subdomain-nya menjadi bertentangan.
   - Situs tersebut tidak otomatis dinonaktifkan. Super admin memutuskan tindakannya secara manual.
e. Impor massal
   - Tersedia impor daftar kata dari berkas CSV untuk pengisian awal dalam jumlah besar.
f. Post-condition
   - Perubahan daftar langsung berlaku pada pengecekan ketersediaan di MLD-035, tanpa deploy ulang.


MLD-057 - Konfigurasi Model AI dan Prompt

User Story: Sebagai Super Admin, saya ingin mengatur model, tingkat usaha, dan system prompt dari console, agar saya dapat menyeimbangkan biaya dan kualitas hasil AI tanpa mengubah kode.

Aktor: Super Admin
Prasyarat: is_super_admin bernilai true.

Halaman UI: /console/ai-config
Endpoint: GET dan PUT /api/console/ai-config

Tabel dan kolom:
- mv_ai_config (id, feature_key, provider, model, effort, temperature, max_tokens, system_prompt, version, is_active, updated_by, updated_at)

Acceptance Criteria:
a. Konfigurasi per fitur
   - Nilai feature_key pada rilis pertama: builder, revision, suggestion, translation, dan image.
   - Setiap fitur dapat memakai provider dan model yang berbeda, agar biaya dapat dioptimalkan per kebutuhan.
b. Parameter yang dapat diatur
   - Kolom provider dan model bersifat teks, sehingga penambahan penyedia baru tidak memerlukan perubahan skema.
   - Kolom effort, temperature, dan max_tokens diatur per fitur.
   - Penentuan penyedia dan model final menunggu Pertanyaan Terbuka nomor 2.
c. Penyuntingan system prompt
   - System prompt disunting lewat editor teks panjang dengan penomoran baris.
   - Tersedia daftar variabel yang boleh dipakai beserta artinya, dan sistem menolak penyimpanan bila ada variabel tidak dikenal.
d. Versi dan pengembalian
   - Setiap penyimpanan menaikkan kolom version dan menyimpan baris baru, tidak menimpa yang lama.
   - Super admin dapat membandingkan dua versi dan kembali ke versi sebelumnya.
   - Alasannya, perubahan prompt dapat menurunkan kualitas keluaran dan harus dapat dibatalkan cepat.
e. Uji coba sebelum diterapkan
   - Tersedia kotak uji untuk menjalankan satu permintaan contoh memakai konfigurasi baru sebelum disimpan.
   - Biaya uji coba dicatat ke mv_usage_daily atas nama platform, bukan atas nama pengguna mana pun.
f. Post-condition
   - Konfigurasi yang aktif dibaca setiap kali fitur AI dipanggil, sehingga perubahan berlaku tanpa menyalakan ulang aplikasi.
   - Kunci API penyedia disimpan sebagai variabel lingkungan, tidak pernah disimpan di basis data maupun ditampilkan di antarmuka.


===============================================================================


NOMOR YANG TIDAK ADA DI WISHLIST

Nomor berikut tidak muncul pada dokumen wishlist 19 Agustus 2026:
MLD-001 sampai MLD-004, MLD-007, MLD-014, MLD-028, dan MLD-037 sampai MLD-041.

Perlu dipastikan apakah nomor tersebut memang dihapus atau ada pada versi dokumen
yang lebih lengkap. Yang paling perlu ditelusuri adalah MLD-037 sampai MLD-041,
karena posisinya tepat di antara bagian E (Subdomain dan Publikasi) dan bagian F
(Dashboard Pengguna) - tempat yang biasanya diisi hal seperti SEO, sitemap,
analytics, atau domain kustom.

Total fitur yang tercakup dokumen ini: 45.


===============================================================================


PERTANYAAN TERBUKA

Enam hal berikut belum dapat dijawab dari wishlist maupun kode, dan memblokir
fitur yang disebut.

1. Stack melody-be dan melody-fe: lanjut memakai Express dan Vue 3 seperti
   sekarang, atau pindah ke stack lain? Streaming dan pratinjau realtime lebih
   ringan di sebagian stack.
   Memblokir: MLD-009 dan MLD-010

2. Penyedia dan model AI yang dipakai? Menentukan bentuk mv_ai_config, cara
   menghitung token, dan format pemanggilan tool.
   Memblokir: MLD-009, MLD-021, dan MLD-057

3. Apakah PSG Account sudah berjalan sebagai penyedia OIDC, atau perlu dibangun
   lebih dulu? Jika belum, rilis pertama membutuhkan autentikasi lokal sementara.
   Memblokir: MLD-005

4. Strategi pembangkitan username untuk pengguna SSO? Kolom Customers.username
   bersifat unique dan wajib, sedangkan pengguna SSO tidak punya username alami.
   Memblokir: MLD-005 dan seluruh alur pendaftaran

5. Payment gateway: Midtrans atau Xendit? Bentuk webhook dan signature keduanya
   berbeda.
   Memblokir: MLD-031 dan MLD-048

6. Apakah perubahan setelah situs tayang boleh langsung terlihat publik, atau
   perlu pemisahan schema draft dan schema live? Rendering schema-driven membuat
   perubahan langsung terlihat, dan ini bisa jadi tidak diinginkan.
   Memblokir: MLD-036
