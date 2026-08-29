CATATAN PEMAKAIAN

Berkas ini berisi HANYA isi bagian "2. Fitur" untuk ditempel ke dokumen Word.
Bagian "1. Identitas User Story" dan "3. Persetujuan" diisi sendiri.

Ditulis tanpa heading Markdown, tanpa tabel pipa, dan tanpa backtick, supaya hasil
salin-tempel ke Word tidak berantakan. Setelah ditempel, tinggal menebalkan baris
nama fitur, yaitu 45 baris yang diawali nomor dalam kurung.

Susunan tiap fitur mengikuti dokumen acuan ITM-001-16 - Dokumen User Story Detail
Rev 1, yaitu nomor dan nama fitur, Aktor, Prasyarat bila ada, Deskripsi (User
Story), Detail Teknis & Endpoint, lalu Acceptance Criteria (Kriteria Penerimaan).

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
   static generation. Satu aplikasi melody-renderer melayani seluruh subdomain.
   Yang dibaca berbeda menurut sasarannya:
   - URL publik membaca snapshot terbit, yaitu baris mv_site_versions yang
     ditunjuk websites.published_version_id.
   - Pratinjau builder membaca kondisi draft, yaitu themes.schema dan
     custom_pages.items yang berlaku saat itu.
   Pemisahan ini membuat perubahan yang belum selesai tidak terlihat publik,
   tanpa menambahkan proses build. Lihat Keputusan Arsitektur nomor 6.

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
- mv_chat_messages       (id, session_id, role, content, tool_calls JSON, provider, model, attempt, tokens_in, tokens_out, cost, created_at)
- mv_site_versions       (id, website_id, parent_version_id, snapshot JSON, label, created_by, created_at)
- mv_ai_jobs             (id, session_id, job_type, status, payload JSON, result JSON, error_message, created_at, finished_at)
- mv_ai_suggestions      (id, website_id, suggestion_type, content, status, created_at)
- mv_ai_config           (id, feature_key, provider, model, fallback_provider, fallback_model, max_repair_attempts, timeout_ms, effort, temperature, max_tokens, credit_cost, system_prompt, is_active)

Subdomain dan publikasi:
- mv_reserved_subdomains (id, word, type, created_at)

Langganan dan kuota:
- mv_plans               (id, code, name, price_monthly, price_yearly, limits JSON, is_best_value, is_active)
- mv_subscriptions       (id, customer_id, plan_id, status, billing_cycle, current_period_start, current_period_end, trial_ends_at)
- mv_invoices            (id, subscription_id, invoice_number, amount, currency, status, issued_date, due_date, paid_on)
- mv_payments            (id, invoice_id, gateway, external_id, amount, status, payload_json, created_at)
- mv_credit_lots         (id, customer_id, bucket, amount_granted, amount_remaining, expires_at, source_type, source_id, created_at)
- mv_credit_ledger       (id, customer_id, lot_id, balance_before, amount, balance_after, reference_type, reference_id, remarks, created_at)
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
- websites   + owner_customer_id, site_type_id, status, published_at, published_version_id, custom_domain, is_active
- Customers  + psg_account_id, is_site_owner, is_super_admin, avatar
- contact_messages + website_id
- Media      + website_id

===============================================================================


A. AUTENTIKASI DAN AKUN


(1) Login via PSG Account (SSO OIDC dan PKCE)
Aktor: Pengunjung dan Pengguna Terdaftar
Prasyarat: PSG Account sudah berjalan sebagai penyedia OIDC di account.psggroup.id.
Deskripsi (User Story) : Sebagai Pengunjung, Saya ingin masuk memakai akun PSG Account saya, Agar saya tidak perlu membuat kata sandi baru dan pengalaman masuknya konsisten dengan produk PSG lainnya.
Detail Teknis & Endpoint
   - Halaman (UI): /login
   - Endpoint Mulai: GET /auth/psg/authorize
   - Endpoint Callback: GET /auth/psg/callback
   - Tabel Terkait: Customers.
Acceptance Criteria (Kriteria Penerimaan)
a. Alur Otorisasi
   - Konfigurasi endpoint dibaca dari discovery /.well-known/openid-configuration, sehingga perubahan alamat di sisi PSG Account tidak menuntut perubahan kode.
   - Sistem membangkitkan code_verifier sepanjang 43 sampai 128 karakter beserta code_challenge (PKCE, metode S256) dan parameter state acak. PKCE bersifat wajib di PSG Account.
   - code_verifier dan state disimpan sementara di sesi server, bukan di localStorage.
   - Pengguna diarahkan ke endpoint authorize milik PSG Account, bukan ke halaman login-nya.
b. Validasi Callback
   - Sistem memverifikasi bahwa state yang kembali sama persis dengan yang dikirim. Jika tidak, tolak dengan 400 dan pesan "Sesi login tidak valid, silakan ulangi."
   - Sistem menukar authorization code dengan token memakai code_verifier. Autentikasi klien memakai metode client_secret_post, yaitu client_secret dikirim pada badan permintaan, bukan pada header.
   - Identitas dibaca dari access_token, bukan dari id_token. Ini ketentuan khusus PSG Account dan berbeda dari OIDC pada umumnya.
   - Signature divalidasi memakai kunci publik dari /.well-known/jwks.json dengan algoritma RS256, disertai pemeriksaan masa berlaku dan issuer.
   - Klaim aud berisi APP_CODE, bukan client_id. Pemeriksaan audience yang menyamakan aud dengan client_id akan selalu gagal.
c. Auto-Link Metode Login
   - Klaim yang tersedia dari PSG Account hanya: sub, email, name, phone_number, phone_number_verified, iss, dan aud.
   - Sistem mencari baris Customers berdasarkan psg_account_id (klaim sub).
   - Jika tidak ditemukan, sistem mencari berdasarkan email hasil normalisasi huruf kecil.
   - Jika ditemukan lewat email, sistem mengisi psg_account_id pada baris tersebut, sehingga akun lama otomatis tertaut.
   - Jika tetap tidak ditemukan, sistem membuat baris Customers baru dengan is_site_owner bernilai true dan email_verified bernilai true. Tidak ada klaim email_verified dari PSG Account, jadi nilai true diisi atas dasar asumsi bahwa PSG Account adalah penyedia identitas tepercaya.
   - Tidak ada klaim foto profil. Kolom Customers.avatar tidak dapat diisi dari SSO dan hanya terisi lewat unggahan manual pada fitur (2).
   - Klaim phone_number disimpan karena akan dipakai ulang untuk verifikasi pembeli pada fitur (22).
d. Pembangkitan Username untuk Pengguna SSO
   - Kolom Customers.username bersifat unique dan wajib, sedangkan PSG Account tidak mengirimkan username.
   - Sistem membangkitkan username dari bagian lokal alamat email, dinormalisasi menjadi huruf kecil dan hanya menyisakan a-z, 0-9, titik, dan garis bawah, dengan panjang maksimum 30 karakter.
   - Bila hasilnya sudah dipakai, sistem menambahkan sufiks acak empat karakter dari a-z dan 0-9. Sufiks acak dipakai, bukan angka berurutan, agar tidak perlu penelusuran panjang pada bagian lokal yang umum seperti admin atau info, sekaligus agar jumlah pengguna tidak terbaca dari luar.
   - Pembangkitan dilakukan di dalam transaksi dan diulang paling banyak lima kali bila terjadi pelanggaran unique constraint, karena dua pendaftaran serentak dengan bagian lokal yang sama adalah kejadian nyata.
   - Kata yang tercantum pada daftar terlarang fitur (44) tidak boleh menjadi username.
   - Username tidak ditampilkan pada antarmuka mana pun. Identitas visual memakai Customers.name dan alamat situs memakai subdomain pada fitur (28).
e. Token Handoff Pendek
   - Setelah tertaut, sistem menerbitkan JWT aplikasi dengan masa berlaku pendek dan menyerahkannya ke frontend melalui redirect satu kali pakai.
   - Token tidak boleh dikirim sebagai parameter query yang tersimpan di riwayat peramban.
f. Alur Lanjutan (Post-Condition)
   - Pengguna diarahkan ke /dashboard.
   - Jika pengguna belum memiliki situs sama sekali, diarahkan ke alur pemilihan tipe situs pada fitur (3).

(2) Profil Pengguna, Ganti Password, dan Hapus Akun
Aktor: Pengguna Terdaftar
Prasyarat: Sudah login.
Deskripsi (User Story) : Sebagai Pengguna Terdaftar, Saya ingin mengubah nama dan foto profil, mengganti kata sandi, serta menghapus akun saya, Agar saya memegang kendali penuh atas data pribadi saya.
Detail Teknis & Endpoint
   - Halaman (UI): /settings/profile
   - Endpoint: GET dan PUT /api/me
   - Endpoint Ganti Password: PUT /api/me/password
   - Endpoint Hapus Akun: DELETE /api/me
   - Tabel Terkait: Customers, websites, mv_subscriptions.
Acceptance Criteria (Kriteria Penerimaan)
a. Ubah Profil
   - Field yang boleh diubah: nama tampilan, no_hp, dan avatar.
   - Kolom email dan username tidak dapat diubah dari halaman ini.
   - Avatar diunggah sebagai berkas gambar, dikompresi, lalu URL-nya disimpan pada Customers.avatar.
b. Ganti Password dengan Validasi Policy
   - Form meminta password lama, password baru, dan konfirmasi password baru.
   - Password baru minimal 8 karakter dan wajib mengandung kombinasi huruf dan angka.
   - Sistem memverifikasi password lama memakai bcrypt compare sebelum menyimpan.
   - Password baru disimpan dalam bentuk hash bcrypt, tidak pernah plaintext.
c. Ganti Password untuk Pengguna SSO
   - Jika Customers.psg_account_id terisi dan Customers.password kosong, menu ganti password disembunyikan.
   - Sebagai gantinya ditampilkan tautan ke halaman pengelolaan akun PSG Account.
d. Hapus Akun dengan Penjagaan
   - Sistem menolak penghapusan jika pengguna masih memiliki situs berstatus published, dengan pesan yang menyebut jumlah situsnya.
   - Sistem menolak penghapusan jika pengguna masih memiliki langganan berstatus active, dengan saran membatalkan langganan lebih dulu.
e. Eksekusi Penghapusan
   - Jika lolos penjagaan, sistem melakukan soft delete: mengisi deleted_on, mengosongkan email dan no_hp, serta mencabut seluruh sesi.
   - Situs berstatus draft milik pengguna ikut dinonaktifkan.
   - Penghapusan permanen mengikuti kebijakan retensi terpisah.
f. Alur Lanjutan (Post-Condition)
   - Setelah penghapusan, pengguna diarahkan ke halaman publik dengan pesan konfirmasi.
   - Alamat email yang sudah dihapus tidak dapat langsung dipakai mendaftar ulang selama masa tunggu yang ditetapkan.


===============================================================================


B. PEMBUATAN SITUS DENGAN AI (FITUR INTI)


(3) Pemilihan Tipe Situs saat Memulai
Aktor: Pengguna Terdaftar
Prasyarat: Sudah login dan kuota jumlah situs pada paketnya belum habis.
Deskripsi (User Story) : Sebagai Pengguna, Saya ingin memilih tipe situs di awal (Company Profile, Portfolio, atau Ecommerce), Agar kumpulan bagian halaman dan fitur yang tersedia menyesuaikan kebutuhan usaha saya.
Detail Teknis & Endpoint
   - Halaman (UI): /sites/new
   - Endpoint Daftar Tipe: GET /api/site-types
   - Endpoint Buat Situs: POST /api/sites
   - Tabel Terkait: mv_site_types, websites, mv_plans.
Acceptance Criteria (Kriteria Penerimaan)
a. Daftar Tipe Situs
   - Sistem melakukan SELECT ke mv_site_types dengan filter is_active bernilai true.
   - Nilai code yang tersedia pada rilis pertama: company_profile, portfolio, ecommerce.
   - Setiap tipe ditampilkan sebagai kartu berisi nama, deskripsi singkat, dan ikon.
b. Pengaruh Tipe terhadap Bagian Halaman
   - Kolom allowed_sections berisi array kode bagian halaman yang merujuk mv_section_catalog.code.
   - AI Builder pada fitur (4) hanya boleh memakai bagian halaman yang terdaftar pada allowed_sections tipe terpilih.
   - Tipe ecommerce mengaktifkan modul katalog produk, keranjang, dan pesanan.
c. Pemeriksaan Kuota Jumlah Situs
   - Sebelum situs dibuat, sistem menghitung jumlah websites milik pengguna dengan owner_customer_id yang sama dan is_active bernilai true.
   - Jika sudah mencapai batas pada mv_plans.limits, sistem menolak dengan 402 dan menampilkan ajakan upgrade.
d. Pembuatan Baris Situs
   - Sistem melakukan INSERT ke websites dengan owner_customer_id dari sesi, site_type_id terpilih, status bernilai draft, dan is_active bernilai true.
   - Kolom subdomain dibiarkan kosong pada tahap ini, diisi kemudian pada fitur (28).
e. Larangan Mengubah Tipe setelah Situs Berisi
   - Tipe situs tidak dapat diubah setelah situs memiliki minimal satu versi tersimpan pada mv_site_versions.
   - Alasannya, bagian halaman yang sudah dipakai bisa jadi tidak tersedia pada tipe tujuan.
f. Alur Lanjutan (Post-Condition)
   - Pengguna diarahkan ke halaman AI Builder pada fitur (4) dengan konteks website_id yang baru dibuat.

(4) Chat AI Builder
Aktor: Pengguna Terdaftar
Prasyarat: Situs sudah dibuat pada fitur (3) dan kuota pesan AI masih tersedia.
Deskripsi (User Story) : Sebagai Pengguna, Saya ingin menjelaskan usaha saya dalam bahasa sehari-hari lalu AI menyusun struktur situs, teks, tema, dan gambar secara otomatis, Agar saya bisa punya website tanpa perlu keahlian teknis.
Detail Teknis & Endpoint
   - Halaman (UI): /sites/:websiteId/builder
   - Endpoint Chat: POST /api/sites/:websiteId/chat (respons streaming)
   - Tabel Terkait: mv_chat_sessions, mv_chat_messages, mv_section_catalog, mv_ai_config, mv_credit_ledger, themes, custom_pages.
Acceptance Criteria (Kriteria Penerimaan)
a. Pemeriksaan Kuota sebelum Memproses
   - Sebelum memanggil model, sistem menghitung saldo kredit dari mv_credit_ledger baris terakhir milik pengguna.
   - Jika saldo tidak mencukupi, sistem mengembalikan 402 beserta ajakan upgrade, dan tidak memanggil model sama sekali.
b. Penyusunan Konteks
   - Sistem membaca mv_ai_config dengan feature_key bernilai builder untuk menentukan provider, model, effort, dan system prompt. Penyedia untuk rilis pertama adalah DeepSeek, sesuai Keputusan Arsitektur nomor 2.
   - Katalog section diberikan kepada model sebagai tool, bukan sebagai teks bebas, agar keluarannya dijamin berupa schema yang bisa dirender dan bukan prosa.
   - Permukaan tool dibatasi menjadi empat tool tetap: set_page, set_theme, search_stock_photo, dan generate_image. Kode section dari mv_section_catalog yang terdaftar pada allowed_sections tipe situs dikirim sebagai enum di dalam argumen set_page, bukan dijadikan satu tool per section.
   - Alasan pembatasan: bila setiap section menjadi tool tersendiri, jumlahnya mencapai puluhan dan model kelas hemat sering keliru memilih. Empat tool tetap menaikkan tingkat keberhasilan tanpa mengurangi kemampuan.
   - System prompt dan katalog section disusun di awal permintaan dan isinya harus stabil, tanpa timestamp maupun identitas acak. Alasannya, penyedia menerapkan cache pada prefix permintaan, dan prefix yang berubah-ubah melipatgandakan biaya token masuk.
c. Respons Mengalir
   - Respons dikirim ke frontend secara streaming.
   - Selama proses, frontend menampilkan indikator pekerjaan yang sedang dikerjakan, contoh: "Menyusun bagian Hero", "Memilih palet warna", "Mencari foto".
   - Indikator diturunkan dari nama tool yang sedang dipanggil model.
d. Validasi Keluaran dan Penulisan Hasil
   - Argumen setiap tool divalidasi di server terhadap mv_section_catalog.props_schema sebelum ditulis ke basis data. Keluaran yang tidak lolos tidak pernah menyentuh schema situs.
   - Bila validasi gagal, pesan kesalahannya dikirim balik ke model untuk diperbaiki, paling banyak sesuai mv_ai_config.max_repair_attempts.
   - Bila perbaikan tetap gagal, permintaan dialihkan ke fallback_provider dan fallback_model. Pengguna tidak pernah menerima 500 hanya karena keluaran model tidak sesuai schema.
   - Struktur situs hasil AI ditulis ke themes.schema (JSON) dan custom_pages.items (JSON) untuk website_id terkait.
   - Penulisan dilakukan dalam satu transaksi. Jika gagal di tengah, seluruh perubahan dibatalkan.
e. Pencatatan Pemakaian
   - Setiap pesan disimpan ke mv_chat_messages beserta role, provider, model, attempt, tokens_in, tokens_out, dan cost.
   - Setelah respons selesai, sistem menulis satu baris pengurangan saldo ke mv_credit_ledger dengan reference_type bernilai chat_message.
   - Pemotongan memakai tarif tetap mv_ai_config.credit_cost, bukan jumlah token. Percobaan perbaikan dan pengalihan ke penyedia cadangan tidak menambah pemotongan, sehingga biayanya ditanggung platform dan bukan pengguna.
   - Alasan tarif tetap: pengguna tidak dapat memperkirakan jumlah token, dan angkanya berubah setiap kali model diganti.
f. Alur Lanjutan (Post-Condition)
   - Snapshot hasil disimpan ke mv_site_versions sesuai fitur (8).
   - Panel pratinjau pada fitur (5) memuat ulang schema terbaru.

(5) Preview Realtime Berdampingan
Aktor: Pengguna Terdaftar
Prasyarat: Sedang berada di halaman AI Builder.
Deskripsi (User Story) : Sebagai Pengguna, Saya ingin melihat hasil perubahan langsung di panel sebelah tanpa perlu menyegarkan halaman, Agar saya tahu persis bentuk situs saya sambil mengetik permintaan.
Detail Teknis & Endpoint
   - Halaman (UI): /sites/:websiteId/builder (panel kanan)
   - Endpoint Pratinjau: GET /preview/:websiteId (dilayani melody-renderer)
   - Tabel Terkait: themes, custom_pages, websites.
Acceptance Criteria (Kriteria Penerimaan)
a. Tata Letak Berdampingan
   - Panel kiri berisi percakapan, panel kanan berisi pratinjau situs di dalam iframe.
   - Lebar kedua panel dapat digeser oleh pengguna dan posisinya diingat per pengguna.
b. Pemuatan Ulang tanpa Refresh Halaman
   - Setelah AI selesai menulis schema, backend mengirim sinyal ke frontend melalui kanal streaming yang sama.
   - Frontend memuat ulang isi iframe saja, bukan seluruh halaman.
c. Pratinjau Lintas Perangkat
   - Tersedia tiga pilihan lebar: Desktop, Tablet, dan Ponsel.
   - Pilihan tersebut mengubah lebar iframe, bukan memuat URL berbeda.
   - Lebar yang dipakai didefinisikan satu tempat agar konsisten dengan breakpoint tema.
d. Isolasi Pratinjau
   - Endpoint pratinjau hanya dapat diakses oleh pemilik situs atau super admin.
   - Pratinjau membaca kondisi draft, yaitu themes.schema dan custom_pages.items yang berlaku saat itu. URL publik membaca snapshot terbit sesuai fitur (29).
   - Akibatnya, pratinjau selalu menampilkan perubahan terbaru sekalipun situs sudah berstatus published dan perubahan tersebut belum diterbitkan.
e. Penanganan Schema Rusak
   - Jika schema tidak dapat dirender, iframe menampilkan pesan ramah beserta tombol "Kembalikan ke versi sebelumnya" yang memanggil fitur (8).
   - Kesalahan render dicatat ke log aplikasi beserta website_id dan nomor versi.
f. Alur Lanjutan (Post-Condition)
   - Pengguna dapat langsung melanjutkan percakapan tanpa kehilangan posisi gulir pada panel pratinjau.

(6) Revisi Melalui Percakapan
Aktor: Pengguna Terdaftar
Prasyarat: Situs sudah memiliki minimal satu versi tersimpan.
Deskripsi (User Story) : Sebagai Pengguna, Saya ingin mengubah warna dan tema, mengganti teks, serta menambah, menghapus, atau mengurutkan ulang bagian halaman cukup dengan mengetik permintaan, Agar saya tidak perlu mempelajari editor apa pun.
Detail Teknis & Endpoint
   - Halaman (UI): /sites/:websiteId/builder
   - Endpoint: POST /api/sites/:websiteId/chat
   - Tabel Terkait: themes, custom_pages, mv_section_catalog, mv_site_versions.
Acceptance Criteria (Kriteria Penerimaan)
a. Daftar Operasi yang Didukung
   - Mengubah warna utama, warna aksen, pasangan huruf, dan mode gelap.
   - Mengganti teks pada bagian halaman tertentu.
   - Menambah bagian halaman baru dari mv_section_catalog.
   - Menghapus bagian halaman.
   - Mengurutkan ulang bagian halaman.
b. Operasi sebagai Tool Terstruktur
   - Setiap operasi di atas didefinisikan sebagai tool dengan parameter bertipe jelas, contoh: set_theme_color, update_section_text, add_section, remove_section, reorder_sections.
   - Model tidak diperbolehkan menulis schema mentah, hanya memanggil tool.
   - Alasannya, schema hasil panggilan tool selalu lolos validasi props_schema.
c. Validasi sebelum Menulis
   - Sebelum disimpan, schema hasil perubahan divalidasi terhadap props_schema masing-masing bagian halaman.
   - Jika validasi gagal, perubahan dibatalkan dan AI diminta memperbaiki tanpa memotong kuota tambahan.
d. Penolakan Bagian di Luar Tipe Situs
   - Permintaan menambah bagian halaman yang tidak terdaftar pada allowed_sections tipe situs ditolak.
   - AI membalas dengan penjelasan dan menawarkan bagian alternatif yang tersedia.
e. Perubahan Bersifat Inkremental
   - Setiap revisi hanya mengubah bagian yang diminta. Bagian lain wajib tetap sama persis.
   - Uji regresi: menjalankan satu revisi warna tidak boleh mengubah teks bagian mana pun.
f. Alur Lanjutan (Post-Condition)
   - Setiap revisi yang berhasil menghasilkan satu baris baru pada mv_site_versions dengan parent_version_id menunjuk versi sebelumnya.

(7) Galeri Template Default
Aktor: Pengguna Terdaftar
Prasyarat: Sudah memilih tipe situs pada fitur (3).
Deskripsi (User Story) : Sebagai Pengguna, Saya ingin memilih template siap pakai sesuai jenis usaha saya sebagai titik awal, Agar saya tidak memulai dari halaman kosong dan AI tinggal menyesuaikan isinya.
Detail Teknis & Endpoint
   - Halaman (UI): /sites/new/templates
   - Endpoint: GET /api/templates dengan parameter site_type_id dan industry
   - Endpoint Terapkan: POST /api/sites/:websiteId/apply-template
   - Tabel Terkait: mv_templates, themes, custom_pages.
Acceptance Criteria (Kriteria Penerimaan)
a. Kategori Jenis Usaha
   - Kolom industry menampung nilai: kuliner, jasa, retail, kesehatan, pendidikan, otomotif.
   - Galeri menyediakan penyaring berdasarkan industry dan otomatis tersaring berdasarkan tipe situs yang dipilih.
b. Tampilan Galeri
   - Setiap template ditampilkan sebagai kartu dengan gambar thumbnail, nama, dan jenis usaha.
   - Tersedia tombol pratinjau yang membuka contoh situs dalam mode baca saja.
c. Penerapan Template
   - Saat template dipilih, isi mv_templates.schema disalin ke themes.schema milik situs tersebut.
   - Bagian halaman yang ikut disalin dituliskan ke custom_pages.items.
   - Penyalinan menghasilkan satu baris versi awal pada mv_site_versions dengan label "Template awal".
d. Penyesuaian oleh AI
   - Setelah template diterapkan, sistem otomatis menjalankan satu putaran AI untuk mengganti teks contoh dengan konteks usaha pengguna.
   - Putaran otomatis ini memotong kuota seperti pesan biasa dan wajib diberitahukan sebelum dijalankan.
e. Mulai tanpa Template
   - Galeri menyediakan opsi "Mulai dari percakapan saja" yang melewati langkah ini dan langsung menuju fitur (4).
f. Alur Lanjutan (Post-Condition)
   - Pengguna diarahkan ke halaman AI Builder dengan pratinjau sudah terisi.

(8) Riwayat Versi dan Pemulihan
Aktor: Pengguna Terdaftar
Prasyarat: Situs memiliki minimal dua versi tersimpan.
Deskripsi (User Story) : Sebagai Pengguna, Saya ingin setiap perubahan tersimpan sehingga saya dapat membandingkan dan mengembalikan situs ke versi sebelumnya, Agar saya berani bereksperimen tanpa takut merusak hasil kerja.
Detail Teknis & Endpoint
   - Halaman (UI): /sites/:websiteId/versions
   - Endpoint Daftar: GET /api/sites/:websiteId/versions
   - Endpoint Pulihkan: POST /api/sites/:websiteId/versions/:versionId/restore
   - Tabel Terkait: mv_site_versions, mv_plans.
Acceptance Criteria (Kriteria Penerimaan)
a. Bentuk Penyimpanan
   - Setiap versi menyimpan snapshot JSON penuh, bukan selisih perubahan.
   - Alasannya, pemulihan menjadi satu operasi tulis dan ukurannya tetap wajar karena isinya schema, bukan berkas gambar.
b. Pembuatan Versi Otomatis
   - Satu baris versi dibuat setiap kali AI Builder menulis perubahan yang berhasil.
   - Kolom label diisi ringkasan singkat perubahan yang dihasilkan AI, contoh: "Ubah warna utama menjadi hijau".
   - Kolom created_by diisi customer_id, atau ditandai sistem bila perubahan otomatis.
c. Perbandingan antar Versi
   - Pengguna dapat memilih dua versi dan melihat perbandingannya.
   - Perbandingan ditampilkan pada level bagian halaman: mana yang ditambah, dihapus, diubah urutannya, dan diubah isinya.
d. Pemulihan
   - Memulihkan versi lama tidak menghapus versi setelahnya.
   - Sistem menyalin snapshot versi terpilih menjadi versi baru di puncak riwayat, dengan label "Dipulihkan dari versi N".
   - Alasannya, riwayat tetap lurus dan tidak ada data yang hilang.
e. Undo dan Redo
   - Tombol Undo memulihkan versi induk dari versi aktif.
   - Tombol Redo tersedia selama pengguna belum membuat perubahan baru setelah Undo.
f. Batas Jumlah Versi per Paket
   - Jumlah versi yang disimpan dibatasi sesuai mv_plans.limits.
   - Saat batas terlampaui, versi terlama dihapus otomatis, kecuali versi yang diberi label manual oleh pengguna.
   - Versi yang sedang ditunjuk websites.published_version_id tidak boleh dihapus dalam keadaan apa pun, karena versi itulah yang sedang tayang untuk publik.

(9) Kuota Pesan AI
Aktor: Pengguna Terdaftar
Prasyarat: Pengguna memiliki langganan aktif atau saldo kredit awal.
Deskripsi (User Story) : Sebagai Pengguna, Saya ingin melihat sisa kuota pesan AI saya beserta peringatan saat mendekati batas, Agar saya tidak kaget ketika tiba-tiba tidak bisa melanjutkan pekerjaan.
Detail Teknis & Endpoint
   - Halaman (UI): indikator pada header AI Builder dan halaman /settings/usage
   - Endpoint: GET /api/me/quota
   - Tabel Terkait: mv_credit_lots, mv_credit_ledger, mv_plans, mv_subscriptions.
Acceptance Criteria (Kriteria Penerimaan)
a. Cara Menghitung Sisa Kuota
   - Saldo diambil dari kolom balance_after pada baris mv_credit_ledger terbaru milik pengguna, tidak pernah dihitung ulang dari seluruh riwayat.
   - Ledger ini terpisah dari wallet_histories milik admin-be, karena yang lama memakai username sebagai kunci relasi dan sudah terikat erat ke modul MLM.
   - Di atas ledger berlaku pencatatan lot pada mv_credit_lots. Setiap pemberian kredit membuat satu lot dengan bucket bernilai trial, monthly, atau topup, beserta amount_remaining dan expires_at.
   - Alasan lot diperlukan: saldo berjalan berupa satu angka tidak dapat menjawab berapa kredit yang harus hangus di akhir periode dan berapa yang tidak, padahal kredit bulanan hangus sedangkan kredit hasil pembelian tidak.
   - Ledger tetap menjadi satu-satunya sumber saldo yang ditampilkan. Lot hanya menentukan urutan pemakaian dan masa berlaku.
b. Indikator di Antarmuka
   - Header AI Builder menampilkan sisa kuota beserta bilah kemajuan.
   - Warna bilah berubah menjadi peringatan ketika sisa kuota di bawah 20 persen, dan menjadi kritis di bawah 5 persen.
c. Peringatan Mendekati Batas
   - Saat sisa kuota menyentuh 20 persen, sistem menampilkan pemberitahuan satu kali per periode.
   - Saat menyentuh 5 persen, pemberitahuan ditampilkan setiap kali halaman builder dibuka.
d. Perilaku saat Kuota Habis
   - Kolom input percakapan dinonaktifkan dan digantikan ajakan upgrade paket atau membeli kuota tambahan.
   - Situs yang sudah tayang tetap dapat diakses publik. Yang terhenti hanya kemampuan mengubah.
e. Pemotongan Kuota
   - Pemotongan dicatat setelah respons AI selesai, bukan di awal, agar permintaan yang gagal tidak memotong kuota.
   - Kolom reference_type dan reference_id menunjuk baris mv_chat_messages terkait, agar pengguna dapat menelusuri pemakaiannya.
   - Lot dipotong berurutan menurut expires_at yang paling dekat lebih dulu, lalu menurut created_at yang paling lama. Urutan ini dengan sendirinya menghasilkan kredit percobaan lebih dulu, kemudian kredit bulanan, dan terakhir kredit hasil pembelian.
   - Satu pemakaian yang memakan dua lot menghasilkan dua baris mv_credit_ledger, masing-masing dengan lot_id yang berbeda.
f. Alur Lanjutan (Post-Condition)
   - Riwayat pemakaian dapat dilihat pada halaman /settings/usage, diurutkan dari yang terbaru.

(10) Saran Proaktif AI
Aktor: Sistem, ditindaklanjuti Pengguna
Prasyarat: Situs sudah memiliki minimal satu versi tersimpan.
Deskripsi (User Story) : Sebagai Pengguna, Saya ingin AI mengusulkan penyempurnaan setelah situs saya jadi, Agar saya tahu bagian mana yang masih kurang tanpa harus menilainya sendiri.
Detail Teknis & Endpoint
   - Halaman (UI): panel saran pada /sites/:websiteId/builder
   - Endpoint: GET /api/sites/:websiteId/suggestions
   - Endpoint Terapkan: POST /api/sites/:websiteId/suggestions/:id/apply
   - Tabel Terkait: mv_ai_suggestions, themes, mv_ai_config.
Acceptance Criteria (Kriteria Penerimaan)
a. Waktu Pemicu
   - Saran dihasilkan setelah situs selesai dibangun pertama kali, lalu diperbarui setiap kali pengguna membuka builder setelah lebih dari 24 jam tidak aktif.
   - Pembuatan saran tidak memotong kuota pesan pengguna. Biayanya ditanggung platform dan dicatat pada mv_usage_daily.
b. Jenis Saran
   - Nilai suggestion_type mencakup: bagian_hilang, konten_terlalu_umum, data_belum_lengkap, dan gambar_placeholder.
   - Contoh isi: menambah bagian testimoni, melengkapi jam operasional, memperbaiki teks yang terlalu umum.
c. Tampilan
   - Saran ditampilkan sebagai daftar kartu ringkas di panel terpisah, tidak menyela percakapan.
   - Setiap kartu memiliki tombol Terapkan dan tombol Abaikan.
d. Penerapan Saran
   - Menekan Terapkan menjalankan operasi revisi yang sama dengan fitur (6) dan memotong kuota seperti pesan biasa.
   - Pengguna diberi tahu berapa kuota yang akan terpakai sebelum konfirmasi.
e. Pengabaian Saran
   - Menekan Abaikan mengubah status menjadi dismissed dan saran tersebut tidak muncul lagi.
f. Alur Lanjutan (Post-Condition)
   - Saran yang sudah diterapkan berubah status menjadi applied dan menghasilkan versi baru pada mv_site_versions.


===============================================================================


C. KONTEN DAN TAMPILAN SITUS


(11) Katalog Bagian Halaman
Aktor: Pengguna Terdaftar dan Super Admin
Prasyarat: Tipe situs sudah dipilih.
Deskripsi (User Story) : Sebagai Pengguna, Saya ingin memilih bagian halaman dari katalog yang sudah disediakan beserta beberapa pilihan tata letak, Agar situs saya tersusun rapi tanpa perlu mendesain dari nol.
Detail Teknis & Endpoint
   - Halaman (UI): panel "Tambah Bagian" pada /sites/:websiteId/builder
   - Endpoint: GET /api/sections dengan parameter site_type_id
   - Tabel Terkait: mv_section_catalog, mv_site_types, themes.
Acceptance Criteria (Kriteria Penerimaan)
a. Isi Katalog Awal
   - Nilai code yang wajib tersedia pada rilis pertama: hero, tentang_kami, layanan, keunggulan, galeri, testimoni, tim, daftar_harga, faq, ajakan_bertindak, kontak, footer.
   - Setiap baris memiliki nama tampilan berbahasa Indonesia dan gambar thumbnail.
b. Pilihan Tata Letak
   - Kolom variants berisi array pilihan tata letak untuk bagian tersebut, contoh untuk hero: layar_penuh, terbagi_dua, dengan_video.
   - Setiap variant memiliki kode, nama tampilan, dan thumbnail sendiri.
c. Skema Properti
   - Kolom props_schema mendefinisikan field yang dimiliki bagian tersebut beserta tipenya, contoh: judul bertipe teks, subjudul bertipe teks, gambar bertipe media, tombol bertipe objek.
   - Schema ini dipakai untuk memvalidasi keluaran AI pada fitur (6).
d. Katalog sebagai Data, Bukan Kode
   - Seluruh definisi bagian halaman disimpan sebagai baris database, bukan ditanam di kode aplikasi.
   - Inilah yang membuat fitur (43) mungkin dilakukan tanpa deploy ulang.
e. Penyaringan berdasarkan Tipe Situs
   - Katalog yang ditampilkan hanya bagian yang kodenya terdaftar pada allowed_sections tipe situs tersebut.
f. Alur Lanjutan (Post-Condition)
   - Bagian yang dipilih ditambahkan ke themes.schema dan langsung terlihat pada pratinjau fitur (5).

(12) Kustomisasi Tema
Aktor: Pengguna Terdaftar
Prasyarat: Situs sudah memiliki tema aktif.
Deskripsi (User Story) : Sebagai Pengguna, Saya ingin mengatur warna, huruf, sudut membulat, kerapatan spasi, dan mode gelap, Agar tampilan situs sesuai identitas usaha saya.
Detail Teknis & Endpoint
   - Halaman (UI): panel "Tema" pada /sites/:websiteId/builder
   - Endpoint: PUT /api/sites/:websiteId/theme
   - Tabel Terkait: themes.
Acceptance Criteria (Kriteria Penerimaan)
a. Preset Tema Siap Pakai
   - Tersedia beberapa preset yang mengisi seluruh token sekaligus dengan sekali klik.
   - Preset disimpan sebagai baris mv_templates bertipe theme_preset, agar dapat ditambah dari console tanpa deploy ulang.
b. Pemilihan Warna
   - Pengguna dapat memilih warna utama dan warna aksen memakai color picker atau memasukkan kode heksadesimal.
   - Sistem menghitung dan menampilkan rasio kontras terhadap latar. Jika rasio di bawah 4.5 banding 1, tampilkan peringatan keterbacaan.
c. Pasangan Huruf
   - Pengguna memilih pasangan huruf dari daftar terkurasi, bukan mengetik nama huruf bebas.
   - Setiap pasangan menetapkan font_heading dan font_body sekaligus.
d. Sudut Membulat dan Kerapatan Spasi
   - Nilai border_radius memiliki pilihan: tajam, sedang, membulat.
   - Nilai spacing_density memiliki pilihan: rapat, normal, lega.
e. Mode Gelap
   - Saklar dark_mode menentukan apakah situs menyediakan mode gelap.
   - Jika aktif, sistem menurunkan palet gelap secara otomatis dari warna yang dipilih, lalu menampilkan pratinjaunya.
f. Alur Lanjutan (Post-Condition)
   - Perubahan tema langsung terlihat pada pratinjau tanpa memuat ulang halaman.
   - Setiap perubahan tema menghasilkan versi baru pada mv_site_versions.

(13) Manajemen Media
Aktor: Pengguna Terdaftar
Prasyarat: Situs sudah dibuat.
Deskripsi (User Story) : Sebagai Pengguna, Saya ingin mengunggah logo dan foto lalu mengelolanya dalam galeri per situs, Agar saya dapat mengganti gambar dengan cepat tanpa bantuan siapa pun.
Detail Teknis & Endpoint
   - Halaman (UI): panel "Media" pada /sites/:websiteId/builder
   - Endpoint Unggah: POST /api/sites/:websiteId/media
   - Endpoint Daftar: GET /api/sites/:websiteId/media
   - Endpoint Hapus: DELETE /api/media/:id
   - Tabel Terkait: Media, mv_plans.
Acceptance Criteria (Kriteria Penerimaan)
a. Validasi Berkas
   - Format yang diterima: JPG, PNG, WEBP, dan SVG khusus untuk logo.
   - Ukuran maksimal per berkas ditetapkan dan divalidasi di sisi backend, bukan hanya di frontend.
b. Kompresi Otomatis
   - Setelah diunggah, sistem menghasilkan beberapa ukuran turunan untuk kebutuhan tampilan.
   - Berkas dikonversi ke WEBP bila peramban mendukung, dengan berkas asli tetap disimpan.
c. Galeri per Situs
   - Daftar media difilter berdasarkan website_id, sehingga media milik situs lain tidak terlihat.
   - Perhatikan nama tabel ditulis dengan huruf besar M, yaitu Media, karena MySQL pada Linux bersifat case-sensitive terhadap nama tabel.
d. Penggantian Gambar dengan Seret dan Lepas
   - Pengguna dapat menyeret berkas dari komputer langsung ke atas gambar yang ada di pratinjau untuk menggantinya.
   - Penggantian memperbarui rujukan pada themes.schema, bukan menimpa berkas lama.
e. Batas Kapasitas Penyimpanan
   - Sebelum unggahan diterima, sistem menjumlahkan ukuran seluruh media milik pengguna dan membandingkannya dengan batas pada mv_plans.limits.
   - Jika melebihi, tolak dengan 402 beserta ajakan upgrade.
f. Alur Lanjutan (Post-Condition)
   - Media yang masih dipakai pada schema tidak dapat dihapus. Sistem menampilkan daftar bagian halaman yang memakainya.

(14) Pencarian Foto Stock oleh AI
Aktor: Pengguna Terdaftar
Prasyarat: Situs sudah memiliki konteks jenis usaha dari percakapan.
Deskripsi (User Story) : Sebagai Pengguna, Saya ingin AI mencarikan foto yang relevan dengan jenis usaha saya, Agar situs saya tidak kosong walaupun saya belum punya foto sendiri.
Detail Teknis & Endpoint
   - Halaman (UI): panel "Media" tab "Cari Foto"
   - Endpoint: POST /api/sites/:websiteId/media/search-stock
   - Tabel Terkait: mv_ai_jobs, Media.
Acceptance Criteria (Kriteria Penerimaan)
a. Penyusunan Kata Kunci
   - Sistem menyusun kata kunci pencarian dari konteks usaha pengguna, bukan dari ketikan mentah.
   - Kata kunci yang dipakai ditampilkan kepada pengguna agar dapat disunting.
b. Pemrosesan Asinkron
   - Pencarian dijalankan sebagai pekerjaan latar belakang dengan status QUEUED, RUNNING, DONE, atau FAILED pada mv_ai_jobs.
   - Frontend melakukan polling atau menerima sinyal saat pekerjaan selesai.
c. Tampilan Hasil
   - Hasil ditampilkan sebagai kisi gambar beserta atribusi sumbernya.
   - Pengguna memilih gambar yang diinginkan, dan hanya gambar terpilih yang disalin ke penyimpanan sendiri lalu dicatat ke tabel Media.
d. Kepatuhan Lisensi
   - Sistem hanya memakai sumber foto dengan lisensi yang mengizinkan penggunaan komersial.
   - Informasi atribusi disimpan pada Media.description agar dapat ditelusuri kembali.
e. Penanganan Kegagalan
   - Jika penyedia foto tidak dapat dihubungi, status berubah menjadi FAILED beserta error_message, dan pengguna ditawari mengunggah foto sendiri.
f. Alur Lanjutan (Post-Condition)
   - Gambar terpilih tersedia di galeri media situs dan dapat dipakai bagian halaman mana pun.

(15) Pembuatan Gambar oleh AI
Aktor: Pengguna Terdaftar
Prasyarat: Kuota kredit mencukupi.
Deskripsi (User Story) : Sebagai Pengguna, Saya ingin AI membuatkan banner, ilustrasi, atau latar belakang sesuai deskripsi saya, Agar situs saya punya visual khas walaupun saya tidak punya materi apa pun.
Detail Teknis & Endpoint
   - Halaman (UI): panel "Media" tab "Buat Gambar"
   - Endpoint: POST /api/sites/:websiteId/media/generate
   - Tabel Terkait: mv_ai_jobs, mv_credit_ledger, Media, mv_ai_config.
Acceptance Criteria (Kriteria Penerimaan)
a. Masukan Pengguna
   - Pengguna memasukkan deskripsi gambar, memilih jenis (banner, ilustrasi, atau latar belakang), dan memilih rasio aspek.
   - Sistem menampilkan estimasi biaya kredit sebelum proses dijalankan.
b. Pemeriksaan Kuota
   - Pembuatan gambar memotong kredit lebih besar daripada pesan teks biasa. Besarannya diatur pada mv_ai_config.credit_cost.
   - Penyedia untuk fitur ini adalah Google, sesuai Keputusan Arsitektur nomor 2. DeepSeek yang dipakai fitur teks tidak memiliki kemampuan membuat gambar sama sekali.
   - Foto stock pada fitur (14) tetap menjadi jalur utama untuk kebutuhan visual situs bisnis. Pembuatan gambar adalah pelengkap, karena biayanya jauh lebih besar dan hasilnya belum tentu lebih baik.
   - Jika kredit tidak cukup, tolak dengan 402 sebelum memanggil penyedia.
c. Pemrosesan Asinkron
   - Pekerjaan dicatat ke mv_ai_jobs dan dijalankan di latar belakang, karena pembuatan gambar memakan waktu.
   - Pengguna dapat meninggalkan halaman dan kembali lagi tanpa kehilangan hasil.
d. Penyimpanan Hasil
   - Gambar hasil disimpan ke penyimpanan sendiri, tidak menautkan langsung ke URL penyedia.
   - Baris Media dibuat dengan description berisi prompt yang dipakai, agar dapat ditelusuri.
e. Penyaringan Konten
   - Prompt yang mengandung kata kunci sensitif ditolak sebelum dikirim ke penyedia, memakai daftar yang sama dengan fitur (41).
f. Alur Lanjutan (Post-Condition)
   - Pemotongan kredit dicatat ke mv_credit_ledger hanya jika pekerjaan berstatus DONE.

(16) Widget Bawaan
Aktor: Pengguna Terdaftar
Prasyarat: Situs sudah dibuat.
Deskripsi (User Story) : Sebagai Pengguna, Saya ingin memasang widget siap pakai seperti tombol WhatsApp, peta, dan jam operasional, Agar pengunjung situs saya lebih mudah menghubungi dan menemukan usaha saya.
Detail Teknis & Endpoint
   - Halaman (UI): panel "Widget" pada /sites/:websiteId/builder
   - Endpoint: GET dan PUT /api/sites/:websiteId/widgets
   - Tabel Terkait: mv_site_widgets.
Acceptance Criteria (Kriteria Penerimaan)
a. Daftar Widget yang Tersedia
   - Nilai widget_key pada rilis pertama: whatsapp_float, google_maps, jam_operasional, sosial_media, kembali_ke_atas.
b. Konfigurasi per Widget
   - whatsapp_float menyimpan nomor telepon, teks pesan awal, dan posisi tampil.
   - google_maps menyimpan koordinat lintang dan bujur, tingkat perbesaran, dan tinggi peta.
   - jam_operasional menyimpan tujuh baris hari beserta jam buka dan tutup, termasuk penanda libur.
   - sosial_media menyimpan daftar platform beserta URL-nya.
   - kembali_ke_atas menyimpan ambang batas gulir sebelum tombol muncul.
c. Validasi Masukan
   - Nomor WhatsApp divalidasi hanya angka dan diawali kode negara 62.
   - URL media sosial divalidasi sebagai URL yang sah.
d. Pengaktifan dan Urutan
   - Setiap widget dapat dinyalakan atau dimatikan lewat saklar.
   - Widget mengambang dapat diatur urutan tumpukannya lewat sort_order agar tidak saling menutupi.
e. Kesesuaian Tema
   - Warna widget mengikuti token tema dari fitur (12), bukan warna yang ditulis mati di kode.
f. Alur Lanjutan (Post-Condition)
   - Widget aktif langsung muncul di pratinjau dan ikut ter-render pada situs publik.

(17) Formulir Kontak
Aktor: Pengunjung situs tenant (pengirim) dan Pengguna Terdaftar (penerima)
Prasyarat: Situs sudah tayang dan memuat bagian halaman kontak.
Deskripsi (User Story) : Sebagai Pengguna, Saya ingin pesan dari formulir kontak diteruskan ke email dan WhatsApp saya sekaligus tersimpan di kotak masuk dashboard, Agar tidak ada calon pelanggan yang terlewat.
Detail Teknis & Endpoint
   - Halaman (UI) Publik: bagian kontak pada situs tenant
   - Endpoint Kirim: POST /api/public/sites/:websiteId/contact
   - Halaman (UI) Pemilik: /inbox
   - Tabel Terkait: contact_messages, mv_notification_outbox.
Acceptance Criteria (Kriteria Penerimaan)
a. Validasi Masukan
   - Field wajib: nama, email, dan pesan. Field nomor telepon bersifat opsional.
   - Email dinormalisasi menjadi huruf kecil sebelum disimpan.
b. Proteksi Spam
   - Diterapkan honeypot berupa field tersembunyi yang wajib kosong.
   - Diterapkan pembatasan laju berdasarkan alamat IP, maksimal beberapa pengiriman per menit per situs.
   - Pengiriman yang terdeteksi spam tetap dibalas sukses kepada pengirim, namun tidak disimpan.
c. Penyimpanan
   - Pesan yang lolos disimpan ke contact_messages dengan website_id sesuai situs asal, hasil resolusi tenant dari host.
d. Penerusan ke Email dan WhatsApp
   - Sistem mengantre pengiriman ke mv_notification_outbox dengan channel EMAIL dan WHATSAPP.
   - Alamat tujuan diambil dari profil pemilik situs.
   - Pengiriman dijalankan pekerja latar belakang, bukan sinkron, agar pengunjung tidak menunggu.
e. Umpan Balik ke Pengunjung
   - Setelah terkirim, formulir menampilkan pesan sukses dan mengosongkan isian.
   - Kegagalan menampilkan pesan yang menjelaskan cara lain menghubungi pemilik.
f. Alur Lanjutan (Post-Condition)
   - Pesan muncul di kotak masuk pada fitur (32) dengan penanda belum dibaca.

(18) Situs Multi-Halaman
Aktor: Pengguna Terdaftar
Prasyarat: Situs sudah dibuat.
Deskripsi (User Story) : Sebagai Pengguna, Saya ingin situs saya terdiri dari beberapa halaman terpisah lengkap dengan menu navigasi, Agar isinya tidak menumpuk dalam satu halaman panjang.
Detail Teknis & Endpoint
   - Halaman (UI): panel "Halaman" pada /sites/:websiteId/builder
   - Endpoint: GET, POST, PUT, DELETE /api/sites/:websiteId/pages
   - Tabel Terkait: custom_pages, themes.
Acceptance Criteria (Kriteria Penerimaan)
a. Halaman Bawaan
   - Saat situs dibuat, sistem menyiapkan halaman: beranda, tentang, layanan, dan kontak.
   - Halaman beranda tidak dapat dihapus.
b. Pengelolaan Halaman
   - Pengguna dapat menambah, mengganti nama, dan menghapus halaman.
   - Kolom page menyimpan slug halaman, dinormalisasi huruf kecil dan hanya menerima a-z, 0-9, serta tanda hubung.
   - Slug wajib unik dalam satu situs.
c. Menu Navigasi Otomatis
   - Menu navigasi dibangkitkan dari daftar halaman aktif dan disimpan pada objek navigation di themes.schema.
   - Urutan menu dapat diatur dengan seret dan lepas.
   - Menu bertingkat didukung satu level lewat kolom parent_id.
d. Halaman sebagai Konteks AI
   - Saat pengguna meminta perubahan lewat percakapan, AI mengetahui halaman mana yang sedang aktif dan hanya mengubah halaman tersebut, kecuali diminta lain.
e. Penghapusan Halaman
   - Menghapus halaman meminta konfirmasi dan menyebut jumlah bagian halaman yang ikut terhapus.
   - Halaman yang dihapus ikut hilang dari menu navigasi.
f. Alur Lanjutan (Post-Condition)
   - Setiap halaman dapat diakses publik pada alamat subdomain diikuti slug halamannya.

(19) Situs Dwibahasa Indonesia dan Inggris
Aktor: Pengguna Terdaftar
Prasyarat: Situs sudah memiliki konten berbahasa Indonesia.
Deskripsi (User Story) : Sebagai Pengguna, Saya ingin situs saya tersedia dalam dua bahasa dengan tombol pengalih, Agar usaha saya dapat menjangkau pengunjung berbahasa Inggris.
Detail Teknis & Endpoint
   - Halaman (UI): panel "Bahasa" pada /sites/:websiteId/builder
   - Endpoint Terjemah: POST /api/sites/:websiteId/translate
   - Tabel Terkait: mv_site_translations, themes, mv_credit_ledger.
Acceptance Criteria (Kriteria Penerimaan)
a. Pengaktifan Bahasa Kedua
   - Pengguna menyalakan bahasa Inggris lewat saklar. Bahasa Indonesia tetap menjadi bahasa bawaan.
   - Objek locales pada themes.schema mencatat daftar bahasa aktif dan mana yang bawaan.
b. Struktur Penyimpanan Terjemahan
   - Setiap teks yang dapat diterjemahkan diidentifikasi dengan path, contoh: pages.beranda.sections.0.props.judul.
   - Baris mv_site_translations menyimpan pasangan locale dan path beserta nilainya.
   - Alasan disimpan terpisah, bukan menggandakan schema: struktur situs tetap satu sumber, hanya teksnya yang bercabang.
c. Terjemahan Otomatis
   - Menekan "Terjemahkan seluruh konten" mengirim seluruh teks ke AI dan menyimpan hasilnya.
   - Proses ini memotong kredit dan besarannya diberitahukan sebelum dijalankan.
d. Penyuntingan Manual
   - Pengguna dapat menyunting hasil terjemahan mana pun. Baris yang disunting manual ditandai is_manual bernilai true.
   - Terjemahan ulang otomatis tidak menimpa baris yang ditandai manual.
e. Pengalih Bahasa di Situs
   - Situs publik menampilkan tombol pengalih bahasa pada header.
   - Bahasa yang dipilih pengunjung diingat lewat penyimpanan peramban.
f. Alur Lanjutan (Post-Condition)
   - Teks yang belum diterjemahkan ditampilkan dalam bahasa bawaan, tidak dikosongkan.
   - Panel bahasa menampilkan persentase kelengkapan terjemahan.

(20) Blog dan Artikel
Aktor: Pengguna Terdaftar
Prasyarat: Situs sudah dibuat.
Deskripsi (User Story) : Sebagai Pengguna, Saya ingin mengelola tulisan sederhana beserta halaman daftar dan detail artikel, Agar saya dapat mengisi situs dengan konten baru secara berkala.
Detail Teknis & Endpoint
   - Halaman (UI): /sites/:websiteId/posts
   - Endpoint: GET, POST, PUT, DELETE /api/sites/:websiteId/posts
   - Tabel Terkait: posts.
Acceptance Criteria (Kriteria Penerimaan)
a. Pemakaian Tabel Bersama
   - Artikel disimpan pada tabel posts milik admin-be dengan type bernilai post dan website_id sesuai situs.
   - melody-be membaca dan menulis tabel ini, namun tidak membuat migration untuknya, sesuai aturan kepemilikan tabel.
b. Editor Tulisan
   - Editor mendukung paragraf, judul bertingkat, daftar, tautan, kutipan, dan penyisipan gambar dari galeri media.
   - Isi disimpan pada kolom content.
c. Slug dan Ringkasan
   - Slug dibangkitkan otomatis dari judul, dapat disunting, dan wajib unik dalam satu situs.
   - Ringkasan pada kolom excerpt dibangkitkan otomatis dari paragraf pertama bila dikosongkan.
d. Status Terbit
   - Artikel berstatus draft tidak muncul di situs publik namun tetap terlihat di pratinjau pemilik.
   - Saat status berubah menjadi published, kolom published_at diisi waktu saat itu.
e. Halaman Daftar dan Detail
   - Bagian halaman bertipe daftar artikel dapat ditambahkan ke halaman mana pun dari katalog fitur (11).
   - Halaman detail artikel dilayani melody-renderer pada alamat subdomain diikuti blog dan slug artikel.
f. Alur Lanjutan (Post-Condition)
   - Artikel yang dihapus berpindah ke status trash, tidak langsung hilang dari basis data.


===============================================================================


D. TIPE ECOMMERCE


(21) Katalog Produk
Aktor: Pengguna Terdaftar dengan tipe situs ecommerce
Prasyarat: Situs bertipe ecommerce.
Deskripsi (User Story) : Sebagai Pengguna pemilik toko, Saya ingin mengelola produk beserta kategori, varian, stok, dan harga promo, Agar calon pembeli melihat informasi yang lengkap dan akurat.
Detail Teknis & Endpoint
   - Halaman (UI): /sites/:websiteId/products
   - Endpoint: GET, POST, PUT, DELETE /api/sites/:websiteId/products
   - Tabel Terkait: mv_product_categories, mv_products, mv_product_variants.
Acceptance Criteria (Kriteria Penerimaan)
a. Alasan Tabel Baru
   - Tenant Melody memakai tabel mv_products, bukan product_details milik admin-be.
   - Alasannya, modul lama melayani klien compro yang skemanya berbeda dan tidak dirancang multi-tenant sejak awal.
b. Kategori Bertingkat
   - Kategori mendukung satu level induk lewat parent_id.
   - Slug kategori wajib unik dalam satu situs.
c. Varian Produk
   - Kolom combination menyimpan kombinasi opsi dalam bentuk teks, contoh: Merah / L.
   - Setiap varian dapat memiliki harga, stok, dan gambar sendiri.
   - Jika produk tidak memiliki varian, harga dan stok diambil dari baris mv_products.
d. Harga Coret dan Harga Promo
   - Kolom price adalah harga jual, kolom compare_at_price adalah harga coret.
   - Jika compare_at_price lebih besar daripada price, situs menampilkan harga coret beserta persentase potongannya.
   - Jika compare_at_price lebih kecil atau sama, harga coret tidak ditampilkan.
e. Status Tersedia dan Habis
   - Kolom status memakai nilai active, draft, atau archived.
   - Produk dengan stok bernilai nol ditampilkan dengan label Habis dan tombol beli dinonaktifkan.
f. Alur Lanjutan (Post-Condition)
   - Galeri foto produk memakai media dari fitur (13), difilter berdasarkan website_id yang sama.

(22) Keranjang Belanja dan Checkout
Aktor: Pengunjung situs tenant
Prasyarat: Situs bertipe ecommerce dan sudah tayang.
Deskripsi (User Story) : Sebagai Pengunjung toko, Saya ingin menambahkan produk ke keranjang lalu mengisi data pembeli dan alamat pengiriman, Agar saya dapat menyelesaikan pesanan.
Detail Teknis & Endpoint
   - Halaman (UI) Publik: /keranjang dan /checkout pada situs tenant
   - Endpoint: POST /api/public/sites/:websiteId/cart dan POST /api/public/sites/:websiteId/checkout
   - Tabel Terkait: mv_carts, mv_cart_items, mv_orders, mv_order_items.
Acceptance Criteria (Kriteria Penerimaan)
a. Keranjang tanpa Akun
   - Pembeli tidak perlu mendaftar. Keranjang diikat pada session_token yang disimpan di peramban pembeli.
   - Keranjang kedaluwarsa setelah masa tertentu dan dibersihkan pekerja latar belakang.
b. Penambahan Produk
   - Sistem memvalidasi stok tersedia sebelum item masuk keranjang.
   - Harga disalin ke mv_cart_items saat penambahan, agar perubahan harga di kemudian hari tidak mengubah keranjang berjalan.
c. Formulir Checkout
   - Field wajib: nama pembeli, email, nomor telepon, dan alamat pengiriman lengkap.
   - Alamat disimpan sebagai objek JSON berisi provinsi, kota, kecamatan, kelurahan, kode pos, dan alamat rinci.
   - Nomor telepon divalidasi hanya angka dan diawali kode negara 62.
d. Ringkasan Pesanan
   - Halaman checkout menampilkan rincian: subtotal, ongkos kirim dari fitur (23), potongan dari fitur (26), dan total akhir.
   - Seluruh perhitungan dilakukan ulang di sisi backend. Nilai yang dikirim frontend tidak dipercaya.
e. Pembuatan Pesanan
   - Saat checkout dikirim, sistem membuat baris mv_orders beserta mv_order_items dalam satu transaksi.
   - Kolom order_number dibangkitkan unik per situs dengan format yang mudah dibaca manusia.
   - Stok dikurangi pada saat pesanan dibuat, bukan saat pembayaran lunas, lalu dikembalikan bila pesanan dibatalkan.
f. Alur Lanjutan (Post-Condition)
   - Pembeli diarahkan ke halaman pembayaran pada fitur (24).
   - Keranjang berubah status menjadi converted.

(23) Integrasi Perhitungan Ongkos Kirim
Aktor: Pengunjung situs tenant
Prasyarat: Produk memiliki berat dan alamat pengiriman sudah diisi.
Deskripsi (User Story) : Sebagai Pengunjung toko, Saya ingin melihat pilihan kurir beserta tarif otomatis berdasarkan alamat dan berat produk, Agar saya tahu total biaya sebelum membayar.
Detail Teknis & Endpoint
   - Halaman (UI) Publik: /checkout, bagian pengiriman
   - Endpoint: POST /api/public/sites/:websiteId/shipping/rates
   - Tabel Terkait: mv_shipping_rates, mv_products, mv_orders.
Acceptance Criteria (Kriteria Penerimaan)
a. Masukan Perhitungan
   - Sistem menghitung total berat dari seluruh item di keranjang berdasarkan kolom weight.
   - Alamat tujuan diambil dari objek shipping_address.
   - Alamat asal diambil dari pengaturan toko milik pemilik situs.
b. Pemanggilan Penyedia
   - Sistem memanggil penyedia tarif pengiriman dan menyimpan hasilnya ke mv_shipping_rates dengan fetched_at.
   - Hasil di-cache selama masa tertentu untuk kombinasi asal, tujuan, dan berat yang sama, agar tidak memanggil penyedia berulang kali.
c. Tampilan Pilihan
   - Pilihan ditampilkan sebagai daftar berisi nama kurir, nama layanan, tarif, dan perkiraan lama pengiriman.
   - Pembeli wajib memilih satu sebelum dapat melanjutkan.
d. Penanganan Penyedia Tidak Tersedia
   - Jika penyedia tidak dapat dihubungi, sistem menampilkan opsi ongkos kirim manual yang ditetapkan pemilik toko.
   - Kegagalan dicatat ke log beserta website_id dan alamat tujuan.
e. Penguncian Tarif
   - Tarif yang dipilih disalin ke mv_orders.shipping_cost saat pesanan dibuat.
   - Perubahan tarif di kemudian hari tidak mengubah pesanan yang sudah terbentuk.
f. Alur Lanjutan (Post-Condition)
   - Total akhir pada ringkasan pesanan memuat ongkos kirim terpilih.

(24) Pembayaran Pesanan Toko
Aktor: Pengunjung situs tenant dan Sistem
Prasyarat: Pesanan sudah terbentuk.
Deskripsi (User Story) : Sebagai Pengunjung toko, Saya ingin membayar pesanan melalui transfer bank, virtual account, QRIS, atau transfer manual, Agar saya dapat memilih cara yang paling mudah bagi saya.
Detail Teknis & Endpoint
   - Halaman (UI) Publik: /checkout/pembayaran dan /pesanan/:orderNumber
   - Endpoint: POST /api/public/sites/:websiteId/orders/:id/pay
   - Endpoint Webhook: POST /api/webhooks/order-payment
   - Tabel Terkait: mv_order_payments, mv_orders.
Acceptance Criteria (Kriteria Penerimaan)
a. Metode yang Didukung
   - Nilai method: bank_transfer, virtual_account, qris, dan manual_transfer.
   - Metode manual_transfer tidak melibatkan gateway, pembeli mengunggah bukti transfer.
b. Pembuatan Transaksi Gateway
   - Sistem memanggil gateway dan menyimpan external_id beserta instruksi pembayaran pada payload_json.
   - Halaman pembayaran menampilkan instruksi sesuai metode terpilih beserta batas waktu.
c. Konfirmasi Otomatis lewat Webhook
   - Endpoint webhook memverifikasi header x-callback-token terhadap token statis milik akun Xendit sebelum memproses. Request tanpa token yang cocok ditolak dengan 401.
   - Bentuk verifikasi ini mengikuti penyedia yang dipakai. Bila kelak penyedia diganti lewat adapter fitur (36), cara verifikasinya ikut berganti.
   - Webhook bersifat idempoten. Notifikasi yang sama diterima dua kali hanya diproses satu kali, diperiksa berdasarkan external_id.
d. Perubahan Status Pesanan
   - Pembayaran lunas mengubah mv_order_payments.status menjadi paid dan mengisi paid_on.
   - Status mv_orders berubah dari menunggu_pembayaran menjadi diproses.
e. Verifikasi Transfer Manual
   - Bukti transfer diunggah pembeli dan disimpan pada proof_url.
   - Pemilik toko meninjau bukti lalu menyetujui atau menolak secara manual dari fitur (25).
f. Alur Lanjutan (Post-Condition)
   - Pembeli dan pemilik toko sama-sama menerima notifikasi sesuai fitur (33).
   - Penggantian penyedia gateway dilakukan lewat konfigurasi, bukan lewat perubahan kode.

(25) Manajemen Pesanan
Aktor: Pengguna Terdaftar dengan tipe situs ecommerce
Prasyarat: Toko sudah menerima minimal satu pesanan.
Deskripsi (User Story) : Sebagai Pengguna pemilik toko, Saya ingin melihat pesanan masuk, mengubah statusnya, dan memasukkan nomor resi, Agar saya dapat mengelola pengiriman dan pembeli selalu mendapat kabar.
Detail Teknis & Endpoint
   - Halaman (UI): /sites/:websiteId/orders dan /sites/:websiteId/orders/:id
   - Endpoint: GET dan PUT /api/sites/:websiteId/orders
   - Tabel Terkait: mv_orders, mv_order_items, mv_order_payments, mv_notification_outbox.
Acceptance Criteria (Kriteria Penerimaan)
a. Daftar Pesanan
   - Daftar difilter berdasarkan website_id dan diurutkan dari yang terbaru.
   - Tersedia penyaring berdasarkan status dan rentang tanggal, serta pencarian berdasarkan order_number atau nama pembeli.
b. Alur Status
   - Nilai status berurutan: menunggu_pembayaran, diproses, dikirim, selesai, dibatalkan.
   - Perpindahan status hanya diperbolehkan maju satu langkah, kecuali pembatalan yang dapat dilakukan sebelum status dikirim.
   - Perpindahan yang tidak sah ditolak dengan 400 beserta penjelasan.
c. Nomor Resi
   - Saat status diubah menjadi dikirim, sistem mewajibkan pengisian tracking_number.
   - Nomor resi ditampilkan kepada pembeli pada halaman pelacakan pesanan.
d. Notifikasi ke Pembeli
   - Setiap perubahan status mengantrekan pengiriman email ke pembeli lewat mv_notification_outbox.
   - Isi pesan memuat order_number, status baru, dan nomor resi bila ada.
e. Pengembalian Stok
   - Pembatalan pesanan mengembalikan stok produk dan varian ke jumlah semula.
   - Pengembalian dijalankan dalam satu transaksi bersama perubahan status.
f. Alur Lanjutan (Post-Condition)
   - Halaman detail pesanan menampilkan riwayat perubahan status beserta waktunya.

(26) Kode Promo dan Diskon
Aktor: Pengguna Terdaftar dengan tipe situs ecommerce
Prasyarat: Toko sudah memiliki produk.
Deskripsi (User Story) : Sebagai Pengguna pemilik toko, Saya ingin membuat kode promo berupa potongan nominal atau persentase dengan batas pemakaian dan masa berlaku, Agar saya dapat menjalankan kampanye penjualan.
Detail Teknis & Endpoint
   - Halaman (UI): /sites/:websiteId/promos
   - Endpoint Kelola: GET, POST, PUT, DELETE /api/sites/:websiteId/promos
   - Endpoint Validasi Publik: POST /api/public/sites/:websiteId/promos/validate
   - Tabel Terkait: mv_promo_codes, mv_promo_usages, mv_orders.
Acceptance Criteria (Kriteria Penerimaan)
a. Bentuk Potongan
   - Nilai discount_type: nominal atau percentage.
   - Untuk percentage, nilai discount_value dibatasi antara 1 sampai 100.
   - Kolom min_purchase menetapkan minimal belanja sebelum promo berlaku.
b. Keunikan Kode
   - Kolom code dinormalisasi menjadi huruf besar dan wajib unik dalam satu situs.
   - Unique index dipasang pada pasangan website_id dan code.
c. Validasi saat Dipakai
   - Sistem memeriksa berurutan: kode ada, is_active bernilai true, waktu saat ini berada di antara starts_on dan ends_on, used_count belum mencapai max_usage, dan subtotal memenuhi min_purchase.
   - Setiap kegagalan mengembalikan pesan spesifik, bukan pesan umum, agar pembeli tahu penyebabnya.
d. Pencegahan Pemakaian Berlebih
   - Penambahan used_count dilakukan dalam transaksi yang sama dengan pembuatan pesanan, memakai penguncian baris.
   - Alasannya, dua pembeli yang menukarkan kode terakhir secara bersamaan tidak boleh sama-sama berhasil.
e. Pencatatan Pemakaian
   - Setiap pemakaian dicatat ke mv_promo_usages beserta order_id, agar pemilik toko dapat menelusuri.
f. Alur Lanjutan (Post-Condition)
   - Nilai potongan disalin ke mv_orders.discount saat pesanan dibuat dan tidak berubah walaupun promo dihentikan kemudian.

(27) Laporan Penjualan
Aktor: Pengguna Terdaftar dengan tipe situs ecommerce
Prasyarat: Toko sudah memiliki pesanan berstatus selesai.
Deskripsi (User Story) : Sebagai Pengguna pemilik toko, Saya ingin melihat omzet per periode dan produk terlaris serta mengekspornya ke CSV, Agar saya dapat mengevaluasi penjualan saya.
Detail Teknis & Endpoint
   - Halaman (UI): /sites/:websiteId/reports/sales
   - Endpoint: GET /api/sites/:websiteId/reports/sales
   - Endpoint Ekspor: GET /api/sites/:websiteId/reports/sales/export
   - Tabel Terkait: mv_orders, mv_order_items.
Acceptance Criteria (Kriteria Penerimaan)
a. Penyaring Laporan
   - Tersedia rentang tanggal serta tingkat agregasi harian, mingguan, atau bulanan.
   - Seluruh query wajib menyertakan filter website_id.
b. Perhitungan Omzet
   - Omzet dihitung dari penjumlahan mv_orders.total dengan status bernilai selesai.
   - Pesanan yang dibatalkan tidak ikut dihitung.
   - Laporan menampilkan pula jumlah pesanan dan nilai rata-rata per pesanan.
c. Produk Terlaris
   - Peringkat dihitung dari penjumlahan mv_order_items.qty, dikelompokkan berdasarkan product_id.
   - Ditampilkan sepuluh teratas beserta jumlah terjual dan kontribusi omzetnya.
d. Visualisasi
   - Tren omzet ditampilkan sebagai grafik garis mengikuti tingkat agregasi terpilih.
   - Produk terlaris ditampilkan sebagai tabel, bukan grafik, karena yang dibaca adalah angkanya.
e. Ekspor CSV
   - Berkas CSV memuat kolom yang sama dengan tampilan tabel.
   - Nama berkas memuat nama situs dan rentang tanggal, agar mudah diarsipkan.
f. Alur Lanjutan (Post-Condition)
   - Seluruh data bersifat baca saja. Laporan tidak mengubah data transaksi mana pun.


===============================================================================


E. SUBDOMAIN DAN PUBLIKASI


(28) Klaim Nama Subdomain
Aktor: Pengguna Terdaftar
Prasyarat: Situs sudah dibuat pada fitur (3).
Deskripsi (User Story) : Sebagai Pengguna, Saya ingin memilih sendiri nama subdomain situs saya dengan pengecekan ketersediaan langsung, Agar situs saya punya alamat yang mudah diingat dan saya tahu seketika bila nama itu sudah dipakai.
Detail Teknis & Endpoint
   - Halaman (UI): /sites/:websiteId/domain
   - Endpoint Cek: GET /api/subdomains/check dengan parameter name
   - Endpoint Klaim: POST /api/sites/:websiteId/subdomain
   - Tabel Terkait: websites, mv_reserved_subdomains.
Acceptance Criteria (Kriteria Penerimaan)
a. Aturan Penulisan Nama
   - Nama dinormalisasi menjadi huruf kecil dan hanya menerima a-z, 0-9, serta tanda hubung.
   - Nama tidak boleh diawali atau diakhiri tanda hubung, dan tidak boleh memuat dua tanda hubung berurutan.
   - Panjang nama dibatasi antara 3 sampai 63 karakter.
b. Pengecekan Ketersediaan Langsung
   - Frontend memanggil endpoint cek dengan penundaan singkat setelah pengguna berhenti mengetik.
   - Hasil ditampilkan seketika berupa penanda tersedia, sudah dipakai, atau tidak diperbolehkan.
c. Penolakan Nama Terlarang dan Nama Sistem
   - Sistem mencocokkan nama terhadap mv_reserved_subdomains.
   - Kolom type membedakan reserved (nama sistem seperti www, api, admin, app, mail, cdn, static) dan blocked (kata terlarang).
   - Daftar ini dikelola dari console pada fitur (44).
d. Saran Alternatif
   - Bila nama sudah dipakai, sistem menawarkan tiga alternatif, contoh: menambah sufiks angka, menambah kata jenis usaha, atau memakai tanda hubung.
   - Alternatif yang ditawarkan wajib sudah diperiksa ketersediaannya.
e. Klaim Final
   - Saat diklaim, sistem menyimpan nama pada websites.subdomain dan menyusun websites.domain lengkap dengan menambahkan sufiks platform, contoh: nama.melodyv2.phisoft.co.id.
   - Kolom subdomain dan domain masing-masing memiliki unique index.
   - Pemeriksaan ketersediaan diulang di dalam transaksi klaim, karena hasil pengecekan sebelumnya bisa sudah basi.
f. Alur Lanjutan (Post-Condition)
   - Nama subdomain dapat diubah selama situs masih berstatus draft.
   - Setelah situs published, perubahan nama meminta konfirmasi karena alamat lama akan berhenti bekerja.

(29) Publikasi dan Batal Publikasi Situs
Aktor: Pengguna Terdaftar
Prasyarat: Subdomain sudah diklaim pada fitur (28).
Deskripsi (User Story) : Sebagai Pengguna, Saya ingin menayangkan situs saya dengan sekali klik dan dapat menariknya kembali menjadi draft, Agar saya memegang kendali kapan situs saya dapat dilihat publik.
Detail Teknis & Endpoint
   - Halaman (UI): tombol Publikasikan pada /sites/:websiteId/builder
   - Endpoint Terbit: POST /api/sites/:websiteId/publish
   - Endpoint Tarik: POST /api/sites/:websiteId/unpublish
   - Tabel Terkait: websites, mv_site_versions, themes.
Acceptance Criteria (Kriteria Penerimaan)
a. Prasyarat sebelum Terbit
   - Sistem memeriksa bahwa subdomain sudah terisi, tema aktif sudah ada, dan halaman beranda memiliki minimal satu bagian.
   - Jika ada yang kurang, tampilkan daftar hal yang perlu dilengkapi beserta tautan menuju bagiannya.
b. Publikasi Instan lewat Snapshot
   - Publikasi membuat satu baris mv_site_versions berisi snapshot kondisi draft saat itu, lalu mengarahkan websites.published_version_id ke baris tersebut, mengubah websites.status menjadi published, dan mengisi published_at.
   - Seluruh langkah dilakukan dalam satu transaksi, sehingga publikasi situs multi-halaman bersifat satu kesatuan. Pengunjung tidak pernah melihat sebagian halaman versi lama dan sebagian versi baru.
   - Tidak ada proses build. Menerbitkan tetap satu operasi tulis. Ini konsekuensi langsung dari keputusan rendering schema-driven pada asumsi nomor 3.
   - Situs dapat diakses publik seketika setelah penunjuk versi berpindah.
   - Yang di-snapshot hanya tata letak, yaitu themes.schema dan custom_pages.items. Artikel blog pada fitur (20), produk pada fitur (21), dan pesanan pada fitur (25) adalah data, bukan tata letak, sehingga tetap tayang seketika tanpa perlu diterbitkan ulang.
c. Batal Publikasi
   - Menarik publikasi mengubah status kembali menjadi draft.
   - Alamat publik menampilkan halaman informasi bahwa situs sedang tidak tayang, bukan galat server.
   - Kolom published_at dipertahankan sebagai catatan kapan situs pernah tayang.
d. Perilaku Perubahan setelah Tayang
   - Perubahan yang dilakukan setelah situs tayang tidak langsung terlihat publik. URL publik tetap membaca snapshot yang ditunjuk published_version_id sampai pengguna menerbitkan ulang.
   - Selama ada selisih antara kondisi draft dan snapshot terbit, halaman builder menampilkan penanda "Ada perubahan yang belum diterbitkan" beserta tombol "Terbitkan perubahan".
   - Menerbitkan ulang memakai alur yang sama dengan huruf b, yaitu membuat versi baru lalu memindahkan penunjuk.
   - Render situs publik dapat di-cache dengan kunci published_version_id, karena isinya tidak berubah selama penunjuk tidak berpindah.
e. Penjagaan Kuota dan Langganan
   - Situs tidak dapat dipublikasikan bila langganan pengguna berstatus expired.
   - Situs yang sudah tayang tidak otomatis ditarik saat langganan habis, melainkan diberi masa tenggang yang ditetapkan.
f. Alur Lanjutan (Post-Condition)
   - Setelah tayang, badge platform pada fitur (39) ditampilkan bila pengguna memakai paket gratis.


===============================================================================


F. DASHBOARD PENGGUNA


(30) Dashboard Situs Saya
Aktor: Pengguna Terdaftar
Prasyarat: Sudah login.
Deskripsi (User Story) : Sebagai Pengguna, Saya ingin melihat seluruh situs milik saya beserta statusnya dan aksi cepat, Agar saya dapat berpindah antar situs dengan mudah.
Detail Teknis & Endpoint
   - Halaman (UI): /dashboard
   - Endpoint: GET /api/me/sites
   - Tabel Terkait: websites, mv_site_types, mv_plans.
Acceptance Criteria (Kriteria Penerimaan)
a. Peran Ganda Halaman Ini
   - Halaman ini sekaligus berfungsi sebagai pemilih situs. Karena tenant situs publik ditentukan dari host, sedangkan dashboard berdiri di satu domain, pemilihan situs di dashboard dilakukan eksplisit dari sini.
b. Daftar Situs
   - Query difilter berdasarkan owner_customer_id sama dengan id pengguna dari sesi.
   - Setiap kartu menampilkan nama situs, tipe situs, alamat subdomain, status draft atau tayang, dan waktu perubahan terakhir.
c. Pratinjau Kecil
   - Setiap kartu menampilkan gambar pratinjau situs.
   - Gambar dihasilkan pekerja latar belakang setelah publikasi dan disimpan sebagai berkas, tidak dibuat ulang setiap halaman dibuka.
d. Aksi Cepat
   - Tersedia aksi: buka situs, sunting, duplikat, dan hapus.
   - Aksi buka hanya aktif untuk situs berstatus tayang.
   - Aksi hapus meminta pengguna mengetikkan nama situs sebagai konfirmasi.
e. Validasi Kepemilikan di Backend
   - Setiap endpoint yang menerima websiteId wajib memverifikasi bahwa websites.owner_customer_id sama dengan id pengguna, atau pengguna berstatus super admin.
   - Tanpa ini, pengguna cukup mengubah angka di URL untuk menyunting situs orang lain. Verifikasi ini syarat rilis, bukan pekerjaan fase berikutnya.
f. Alur Lanjutan (Post-Condition)
   - Halaman menampilkan sisa kuota jumlah situs sesuai paket, beserta tombol tambah situs bila masih tersedia.

(31) Statistik Pengunjung
Aktor: Pengguna Terdaftar
Prasyarat: Situs sudah tayang.
Deskripsi (User Story) : Sebagai Pengguna, Saya ingin melihat jumlah kunjungan, halaman terpopuler, asal pengunjung, dan perangkat yang dipakai, Agar saya tahu apakah situs saya benar-benar dilihat orang.
Detail Teknis & Endpoint
   - Halaman (UI): /sites/:websiteId/stats
   - Endpoint: GET /api/sites/:websiteId/stats dengan parameter rentang tanggal
   - Tabel Terkait: mv_site_stats_daily.
Acceptance Criteria (Kriteria Penerimaan)
a. Pengumpulan Data
   - melody-renderer mencatat setiap permintaan halaman ke antrean, bukan langsung menulis ke basis data, agar tidak memperlambat penyajian halaman.
   - Pekerja latar belakang meringkas antrean menjadi satu baris per situs per hari.
b. Metrik yang Dihitung
   - Kolom visits mencatat jumlah tampilan halaman.
   - Kolom unique_visitors mencatat pengunjung unik berdasarkan sidik jari anonim, tanpa menyimpan alamat IP mentah.
   - Kolom top_pages, referrers, dan devices menyimpan agregat sepuluh teratas dalam bentuk JSON.
c. Penghormatan Privasi
   - Tidak ada cookie pelacak pihak ketiga yang dipasang.
   - Alamat IP hanya dipakai sesaat untuk menghitung keunikan, lalu dibuang dan tidak disimpan.
d. Tampilan
   - Ditampilkan grafik garis untuk tren kunjungan harian atau bulanan.
   - Ditampilkan tiga tabel ringkas: halaman terpopuler, asal pengunjung, dan perangkat.
e. Rentang Waktu
   - Tersedia pilihan cepat: 7 hari, 30 hari, dan 90 hari terakhir, serta rentang khusus.
   - Data lebih lama dari masa retensi yang ditetapkan diringkas menjadi bulanan.
f. Alur Lanjutan (Post-Condition)
   - Seluruh data bersifat baca saja dan difilter berdasarkan website_id milik pengguna.

(32) Kotak Masuk Pesan
Aktor: Pengguna Terdaftar
Prasyarat: Minimal satu situs sudah menerima pesan.
Deskripsi (User Story) : Sebagai Pengguna, Saya ingin melihat seluruh pesan dari formulir kontak semua situs saya dalam satu tempat, Agar saya tidak perlu membuka situs satu per satu.
Detail Teknis & Endpoint
   - Halaman (UI): /inbox
   - Endpoint: GET /api/me/inbox
   - Endpoint Tandai: PUT /api/inbox/:id/read
   - Tabel Terkait: contact_messages, websites.
Acceptance Criteria (Kriteria Penerimaan)
a. Gabungan Lintas Situs
   - Query mengambil contact_messages yang website_id-nya termasuk daftar situs milik pengguna.
   - Setiap baris menampilkan nama situs asal, agar pengguna tahu pesan itu datang dari mana.
b. Penanda Dibaca
   - Pesan yang belum dibaca ditandai visual berbeda dan dihitung sebagai lencana angka pada menu.
   - Membuka detail pesan mengubah is_read menjadi true.
   - Tersedia aksi menandai seluruhnya sudah dibaca.
c. Penyaringan dan Pencarian
   - Tersedia penyaring berdasarkan situs, status baca, dan rentang tanggal.
   - Tersedia pencarian pada kolom nama, email, dan isi pesan.
d. Balas Cepat
   - Detail pesan menyediakan tombol balas lewat email dan tombol balas lewat WhatsApp bila nomor telepon terisi.
   - Tombol tersebut membuka aplikasi email atau WhatsApp, sistem tidak mengirim atas nama pengguna.
e. Validasi Kepemilikan
   - Membuka pesan milik situs orang lain mengembalikan 404, bukan 403, agar keberadaannya tidak terungkap.
f. Alur Lanjutan (Post-Condition)
   - Pesan dapat diarsipkan. Penghapusan permanen mengikuti kebijakan retensi.

(33) Notifikasi Email
Aktor: Sistem
Prasyarat: Pengguna memiliki alamat email terverifikasi.
Deskripsi (User Story) : Sebagai Pengguna, Saya ingin menerima email saat ada pesan masuk, pesanan baru, kuota hampir habis, atau langganan akan berakhir, Agar saya tidak perlu terus membuka dashboard.
Detail Teknis & Endpoint
   - Halaman (UI) Pengaturan: /settings/notifications
   - Endpoint: GET dan PUT /api/me/notification-settings
   - Tabel Terkait: mv_notification_outbox, Customers.
Acceptance Criteria (Kriteria Penerimaan)
a. Peristiwa Pemicu
   - Nilai template_key pada rilis pertama: pesan_masuk_baru, pesanan_baru, kuota_hampir_habis, dan langganan_akan_berakhir.
   - Peringatan kuota dikirim saat sisa mencapai 20 persen dan 5 persen.
   - Peringatan langganan dikirim tujuh hari dan satu hari sebelum berakhir.
b. Pola Outbox
   - Sistem tidak mengirim email secara sinkron. Setiap pesan dimasukkan ke mv_notification_outbox dengan status QUEUED.
   - Pekerja latar belakang mengambil antrean, mengirim, lalu mengubah status menjadi SENT atau FAILED.
   - Alasannya, kegagalan penyedia email tidak boleh menggagalkan aksi pengguna yang memicunya.
c. Percobaan Ulang
   - Pengiriman yang gagal dicoba ulang dengan jeda bertambah, maksimal beberapa kali, lalu berhenti dan menyimpan error_message.
d. Preferensi Pengguna
   - Pengguna dapat mematikan tiap jenis notifikasi secara terpisah.
   - Notifikasi yang berkaitan dengan penagihan dan langganan tidak dapat dimatikan, karena bersifat transaksional.
e. Pencegahan Banjir Pesan
   - Beberapa peristiwa sejenis dalam rentang waktu singkat digabung menjadi satu email ringkasan.
f. Alur Lanjutan (Post-Condition)
   - Riwayat pengiriman dapat diperiksa super admin dari console untuk keperluan penelusuran keluhan.

(34) Duplikat Situs
Aktor: Pengguna Terdaftar
Prasyarat: Memiliki minimal satu situs dan kuota jumlah situs masih tersedia.
Deskripsi (User Story) : Sebagai Pengguna, Saya ingin menyalin situs yang sudah ada sebagai dasar situs baru, Agar saya tidak perlu mengulang pekerjaan dari awal untuk cabang atau varian usaha saya.
Detail Teknis & Endpoint
   - Halaman (UI): aksi Duplikat pada kartu situs di /dashboard
   - Endpoint: POST /api/sites/:websiteId/duplicate
   - Tabel Terkait: websites, themes, custom_pages, Media, mv_site_widgets, mv_site_versions.
Acceptance Criteria (Kriteria Penerimaan)
a. Pemeriksaan Kuota
   - Sebelum penyalinan, sistem memeriksa batas jumlah situs pada paket pengguna.
   - Jika penuh, tolak dengan 402 beserta ajakan upgrade.
b. Apa yang Disalin
   - Disalin: baris websites, tema beserta schema, seluruh halaman beserta bagiannya, konfigurasi widget, dan rujukan media.
   - Tidak disalin: subdomain, domain, status, published_at, riwayat versi, statistik pengunjung, pesan masuk, dan pesanan.
c. Perlakuan terhadap Media
   - Berkas media tidak digandakan secara fisik. Baris Media baru dibuat menunjuk berkas yang sama.
   - Alasannya, menggandakan berkas akan menghabiskan kuota penyimpanan pengguna dua kali lipat untuk isi yang identik.
d. Penamaan Hasil Salinan
   - Situs hasil salinan diberi nama dengan akhiran salinan, dan status awalnya draft.
   - Pengguna diarahkan ke halaman klaim subdomain pada fitur (28).
e. Transaksi
   - Seluruh penyalinan dijalankan dalam satu transaksi. Kegagalan di tengah membatalkan seluruhnya, tidak meninggalkan situs setengah jadi.
f. Alur Lanjutan (Post-Condition)
   - Situs hasil salinan memiliki satu baris versi awal pada mv_site_versions dengan label "Salinan dari situs asal".


===============================================================================


G. LANGGANAN DAN PEMBAYARAN


(35) Paket Langganan Gratis, Pro, dan Bisnis
Aktor: Pengguna Terdaftar
Prasyarat: Sudah login.
Deskripsi (User Story) : Sebagai Pengguna, Saya ingin memilih paket langganan yang sesuai kebutuhan saya, Agar saya hanya membayar kapabilitas yang benar-benar saya pakai.
Detail Teknis & Endpoint
   - Halaman (UI): /settings/billing dan /upgrade
   - Endpoint Daftar Paket: GET /api/plans
   - Endpoint Berlangganan: POST /api/me/subscription
   - Tabel Terkait: mv_plans, mv_subscriptions, mv_credit_lots, mv_credit_ledger.
Acceptance Criteria (Kriteria Penerimaan)
a. Isi Kolom Limits
   - Objek limits menyimpan: max_sites, ai_message_quota, storage_mb, custom_domain (boolean), version_history_count, dan remove_platform_badge (boolean).
   - Nilai limits dikelola terpusat oleh super admin pada fitur (45) dan berlaku ke seluruh pengguna paket tersebut.
b. Masa Percobaan dan Kredit Awal
   - Setiap pengguna baru mendapat masa percobaan yang lamanya ditetapkan pada paket, dicatat pada trial_ends_at.
   - Selama masa percobaan, pengguna dapat membuat template sampai batas kredit awal yang diberikan.
   - Kredit awal dimasukkan sebagai satu lot mv_credit_lots dengan bucket bernilai trial dan expires_at sama dengan trial_ends_at, disertai satu baris mv_credit_ledger dengan reference_type bernilai initial_grant.
c. Siklus Penagihan
   - Nilai billing_cycle: monthly atau yearly.
   - Harga tahunan ditampilkan beserta besaran penghematannya dibanding bulanan.
d. Naik dan Turun Paket
   - Naik paket berlaku seketika, dengan perhitungan selisih harga untuk sisa periode berjalan.
   - Kredit ikut dihitung selisihnya secara proporsional terhadap sisa hari periode, diberikan sebagai lot baru dengan bucket bernilai monthly dan expires_at sama dengan current_period_end yang berlaku.
   - Tanggal penagihan tidak direset saat naik paket. Alasannya, mereset tanggal membuka celah naik paket untuk memperoleh kredit penuh lalu turun paket kembali dan mengulanginya.
   - Turun paket berlaku pada awal periode berikutnya, agar pengguna tidak kehilangan kapabilitas yang sudah dibayar.
   - Sebelum turun paket, sistem memperingatkan bila jumlah situs atau penyimpanan pengguna melebihi batas paket tujuan.
e. Penegakan Batas
   - Batas diperiksa saat aksi dilakukan, bukan lewat pekerjaan berkala.
   - Melebihi batas menghasilkan 402 beserta pesan yang menyebut batas mana yang terlampaui.
f. Alur Lanjutan (Post-Condition)
   - Setelah pembayaran berhasil, mv_subscriptions.status menjadi active dan periode diperpanjang.

(36) Payment Gateway Langganan
Aktor: Pengguna Terdaftar dan Sistem
Prasyarat: Pengguna sudah memilih paket.
Deskripsi (User Story) : Sebagai Pengguna, Saya ingin membayar dan memperpanjang langganan dengan aktivasi otomatis, Agar layanan saya tidak terputus dan saya tidak perlu menunggu konfirmasi manual.
Detail Teknis & Endpoint
   - Halaman (UI): /settings/billing/checkout
   - Endpoint Bayar: POST /api/me/subscription/pay
   - Endpoint Webhook: POST /api/webhooks/subscription-payment
   - Tabel Terkait: mv_payments, mv_invoices, mv_subscriptions.
Acceptance Criteria (Kriteria Penerimaan)
a. Penyedia Dapat Diganti lewat Konfigurasi
   - Penyedia untuk rilis pertama adalah Xendit, sesuai Keputusan Arsitektur nomor 5.
   - Nama penyedia disimpan pada kolom gateway, tidak ditanam di kode.
   - Antarmuka pemanggilan penyedia dibuat sebagai adapter, sehingga menambah penyedia baru tidak mengubah alur pembayaran.
b. Pembuatan Transaksi dan Perpanjangan Berkala
   - Sistem membuat invoice lebih dulu, baru memanggil Xendit Invoice API dengan merujuk invoice_number sebagai external_id.
   - Respons penyedia disimpan mentah pada payload_json, agar dapat ditelusuri saat terjadi sengketa.
   - Perpanjangan langganan memakai pekerjaan berkala yang menerbitkan invoice baru menjelang current_period_end, disertai pengingat lewat fitur (33) pada H-7, H-3, dan H-0.
   - Penagihan otomatis Xendit Recurring tidak dipakai pada rilis pertama. Alasannya, penagihan otomatis hanya berlaku pada kartu dan sebagian dompet elektronik, sedangkan mayoritas pengguna Indonesia membayar lewat virtual account dan QRIS yang tidak dapat ditagih otomatis.
c. Aktivasi Otomatis lewat Webhook
   - Endpoint webhook memverifikasi header x-callback-token terhadap token statis milik akun Xendit sebelum memproses apa pun. Request tanpa token yang cocok ditolak dengan 401. Xendit tidak memakai signature HMAC pada callback invoice.
   - Webhook bersifat idempoten, diperiksa berdasarkan external_id, sehingga notifikasi ganda tidak memperpanjang langganan dua kali.
d. Pembaruan Status
   - Pembayaran lunas mengubah mv_invoices.status menjadi paid, mengisi paid_on, memperpanjang current_period_end, dan mengembalikan mv_subscriptions.status menjadi active.
   - Pada saat yang sama dibuat satu lot mv_credit_lots berisi jatah kredit periode tersebut, dengan bucket bernilai monthly dan expires_at sama dengan current_period_end yang baru.
   - Seluruh perubahan dilakukan dalam satu transaksi.
e. Penanganan Kegagalan dan Keterlambatan
   - Pembayaran gagal tidak mengubah status langganan.
   - Pekerjaan berkala harian mencari invoice berstatus unpaid yang melewati jatuh tempo, lalu mengubah mv_subscriptions.status menjadi past_due.
   - Saat past_due, pembuatan situs baru dan pemakaian AI dihentikan, namun situs yang sudah tayang tetap dapat diakses selama masa tenggang.
   - Lot kredit yang masih tersisa dibekukan, bukan dihapus, termasuk lot hasil pembelian. Begitu pembayaran masuk, pemakaian dapat langsung dilanjutkan.
   - Alasan lot pembelian tidak boleh dihapus: kredit tersebut dibayar terpisah dari langganan, dan menghapusnya menimbulkan sengketa.
f. Alur Lanjutan (Post-Condition)
   - Pengambilan biaya layanan diatur pada konfigurasi penyedia, bukan pada kode aplikasi.

(37) Riwayat Transaksi dan Invoice
Aktor: Pengguna Terdaftar
Prasyarat: Pengguna pernah melakukan minimal satu pembayaran.
Deskripsi (User Story) : Sebagai Pengguna, Saya ingin melihat daftar pembayaran saya dan mengunduh invoice dalam bentuk PDF, Agar saya punya bukti untuk pembukuan.
Detail Teknis & Endpoint
   - Halaman (UI): /settings/billing/invoices
   - Endpoint Daftar: GET /api/me/invoices
   - Endpoint Unduh: GET /api/me/invoices/:id/pdf
   - Tabel Terkait: mv_invoices, mv_payments, mv_subscriptions, mv_plans.
Acceptance Criteria (Kriteria Penerimaan)
a. Daftar Transaksi
   - Daftar difilter berdasarkan customer_id dari sesi dan diurutkan dari yang terbaru.
   - Kolom yang ditampilkan: nomor invoice, tanggal terbit, nama paket, jumlah, dan status.
b. Penyaringan dan Pencarian
   - Tersedia penyaring berdasarkan status: paid, unpaid, dan cancelled.
   - Tersedia pencarian berdasarkan invoice_number.
c. Unduh PDF
   - PDF memuat identitas platform, identitas pengguna, rincian paket, periode langganan, jumlah, pajak bila ada, dan status pembayaran.
   - Nomor invoice pada PDF sama persis dengan yang tersimpan di basis data.
d. Status Langganan dan Tanggal Berakhir
   - Halaman menampilkan ringkasan di bagian atas: paket aktif, status, dan tanggal berakhir periode berjalan.
   - Bila status past_due, ditampilkan spanduk peringatan beserta tombol bayar sekarang.
e. Validasi Kepemilikan
   - Mengakses invoice milik pengguna lain mengembalikan 404.
f. Alur Lanjutan (Post-Condition)
   - Invoice bersifat baca saja. Perubahan hanya boleh dilakukan super admin lewat fitur (40).

(38) Pembelian Kuota AI Tambahan
Aktor: Pengguna Terdaftar
Prasyarat: Memiliki langganan aktif.
Deskripsi (User Story) : Sebagai Pengguna, Saya ingin membeli kuota AI tambahan di luar kuota bulanan tanpa harus naik paket, Agar saya dapat menyelesaikan pekerjaan yang sedang berjalan.
Detail Teknis & Endpoint
   - Halaman (UI): /settings/billing/credits
   - Endpoint Daftar Paket Kredit: GET /api/credit-packs
   - Endpoint Beli: POST /api/me/credits/purchase
   - Tabel Terkait: mv_plans, mv_credit_lots, mv_credit_ledger, mv_invoices, mv_payments.
Acceptance Criteria (Kriteria Penerimaan)
a. Paket Kredit Tambahan
   - Tersedia beberapa ukuran paket kredit dengan harga yang berbeda.
   - Paket kredit dikelola dari console yang sama dengan paket langganan.
b. Kredit sebagai Satuan Pemakaian
   - Kredit yang dibeli menjadi satuan untuk mengubah website, sama dengan satuan yang dipotong pada fitur (9).
   - Tidak ada dua jenis saldo. Kredit dari paket bulanan dan kredit hasil pembelian masuk ke ledger yang sama.
c. Urutan Pemakaian
   - Kredit bawaan paket dipakai lebih dulu, baru kredit hasil pembelian.
   - Urutannya tidak ditentukan oleh jenis kredit, melainkan oleh expires_at yang paling dekat lebih dulu sesuai fitur (9) huruf e. Karena kredit bawaan punya masa berlaku dan kredit pembelian tidak, aturan itu menghasilkan urutan yang sama tanpa perlu logika khusus.
   - Alasannya, kredit bawaan hangus di akhir periode sedangkan kredit beli tidak.
d. Masa Berlaku
   - Kredit hasil pembelian tidak hangus di akhir periode langganan, ditandai dengan expires_at bernilai NULL pada lot-nya.
   - Sisa kredit bawaan paket hangus di akhir periode. Lot dengan bucket bernilai monthly dan trial yang melewati expires_at disetel amount_remaining menjadi nol oleh pekerjaan berkala harian, disertai baris ledger bertipe expiry agar tetap dapat ditelusuri.
   - Kebijakan ini ditampilkan jelas pada halaman pembelian agar tidak menimbulkan sengketa.
e. Pencatatan
   - Penambahan saldo membuat satu lot mv_credit_lots dengan bucket bernilai topup, disertai satu baris mv_credit_ledger dengan amount positif dan reference_id menunjuk invoice pembelian.
   - Saldo dihitung dari balance_after baris terakhir, tidak pernah dihitung ulang dari seluruh riwayat.
f. Alur Lanjutan (Post-Condition)
   - Kredit masuk seketika setelah pembayaran dikonfirmasi webhook.
   - Indikator kuota pada fitur (9) langsung memperlihatkan saldo baru.

(39) Badge Dibuat dengan Melody
Aktor: Sistem
Prasyarat: Situs sudah tayang.
Deskripsi (User Story) : Sebagai pemilik platform, Saya ingin situs paket gratis menampilkan tanda platform yang hilang otomatis pada paket berbayar, Agar platform mendapat eksposur sekaligus memberi insentif untuk berlangganan.
Detail Teknis & Endpoint
   - Halaman (UI): bagian footer situs tenant
   - Tabel Terkait: mv_plans, mv_subscriptions, websites.
Acceptance Criteria (Kriteria Penerimaan)
a. Penentuan Tampil atau Tidak
   - Saat merender situs, melody-renderer membaca paket aktif pemilik situs.
   - Badge ditampilkan bila remove_platform_badge bernilai false atau langganan tidak aktif.
b. Penempatan
   - Badge ditempatkan di footer, tidak menutupi konten, dan tidak mengambang.
   - Badge memuat tautan menuju halaman utama platform.
c. Kesesuaian Tema
   - Warna badge mengikuti token tema situs agar tidak merusak tampilan.
   - Badge tetap memenuhi rasio kontras minimum terhadap latar footer.
d. Tidak Dapat Dimatikan dari Sisi Tenant
   - Penentuan tampil dilakukan di sisi server saat render, bukan lewat CSS yang bisa ditimpa.
   - Alasannya, penyembunyian lewat CSS mudah dilewati dan menghilangkan insentif berlangganan.
e. Perubahan Seketika saat Naik Paket
   - Setelah pengguna naik ke paket berbayar, badge hilang tanpa perlu menerbitkan ulang situs.
f. Alur Lanjutan (Post-Condition)
   - Perubahan status langganan menjadi expired memunculkan kembali badge setelah masa tenggang berakhir.


===============================================================================


H. SUPER ADMIN


(40) Console Super Admin
Aktor: Super Admin
Prasyarat: Customers.is_super_admin bernilai true.
Deskripsi (User Story) : Sebagai Super Admin, Saya ingin melihat dashboard platform beserta daftar seluruh pengguna dan situs serta dapat menangguhkan atau mengaktifkannya, Agar saya dapat mengelola operasional layanan.
Detail Teknis & Endpoint
   - Halaman (UI): /console dan /console/tenants
   - Endpoint: GET /api/console/overview, GET /api/console/tenants, PUT /api/console/tenants/:id/status
   - Tabel Terkait: Customers, websites, mv_subscriptions, mv_usage_daily.
Acceptance Criteria (Kriteria Penerimaan)
a. Gerbang Akses Terpisah
   - Seluruh endpoint di bawah /api/console wajib memvalidasi is_super_admin bernilai true.
   - Pengguna biasa yang mencoba mengakses diarahkan kembali ke dashboard, bukan diberi pesan galat yang menjelaskan keberadaan console.
b. Ringkasan Platform
   - Dashboard menampilkan: total pengguna, total situs, situs tayang, langganan aktif, dan biaya AI periode berjalan.
   - Angka dihitung dari agregasi, bukan dari kolom yang dipelihara manual.
c. Daftar dan Pencarian
   - Daftar tenant menampilkan pemilik, jumlah situs, paket aktif, status penagihan, dan pemakaian AI.
   - Tersedia pencarian berdasarkan email, username, nama situs, dan subdomain.
d. Tangguhkan dan Aktifkan
   - Menangguhkan akun mengubah seluruh situs miliknya menjadi is_active bernilai false, sehingga alamat publiknya mengembalikan 503.
   - Menangguhkan satu situs hanya mempengaruhi situs tersebut.
   - Setiap penangguhan wajib disertai alasan yang dicatat.
e. Peninjauan Situs
   - Super admin dapat membuka pratinjau situs mana pun tanpa mengubah datanya.
f. Alur Lanjutan (Post-Condition)
   - Pengaktifan kembali mengembalikan status situs ke kondisi sebelum ditangguhkan, bukan otomatis menjadi tayang.

(41) Moderasi Konten dan Penanganan Penyalahgunaan
Aktor: Super Admin dan Sistem
Prasyarat: Ada situs yang tayang.
Deskripsi (User Story) : Sebagai Super Admin, Saya ingin sistem menandai konten bermasalah secara otomatis dan menyediakan antrean tinjauan, Agar situs yang melanggar dapat ditindak sebelum merusak reputasi platform.
Detail Teknis & Endpoint
   - Halaman (UI): /console/moderation
   - Endpoint: GET /api/console/moderation, PUT /api/console/moderation/:id
   - Endpoint Laporan Publik: POST /api/public/report
   - Tabel Terkait: mv_moderation_flags, websites.
Acceptance Criteria (Kriteria Penerimaan)
a. Prioritas Fitur
   - Fitur ini dijadwalkan pada rilis awal, bukan rilis akhir.
   - Alasannya, situs publik yang dapat dibuat siapa saja di subdomain perusahaan membawa risiko reputasi sejak hari pertama tayang.
b. Penandaan Otomatis
   - Setiap kali situs dipublikasikan, pekerja latar belakang memindai seluruh teks pada schema terhadap daftar kata kunci sensitif.
   - Temuan dicatat sebagai baris mv_moderation_flags dengan source bernilai auto_scan dan status pending.
c. Tombol Laporan pada Situs Tenant
   - Setiap situs tenant memuat tautan laporan yang tidak mencolok pada footer.
   - Laporan dari pengunjung dicatat dengan source bernilai user_report beserta alamat IP pelapor untuk mencegah penyalahgunaan.
   - Diterapkan pembatasan laju agar satu pihak tidak dapat membanjiri antrean.
d. Antrean Tinjauan Manual
   - Antrean diurutkan berdasarkan tingkat keparahan lalu waktu, dan menampilkan pratinjau situs beserta bagian yang ditandai.
   - Super admin memilih salah satu tindakan: abaikan, peringatkan pemilik, atau nonaktifkan situs.
e. Penonaktifan Situs Bermasalah
   - Penonaktifan mengubah websites.is_active menjadi false dan mengisi alasan pada notes.
   - Pemilik situs menerima email berisi alasan dan cara mengajukan keberatan.
f. Alur Lanjutan (Post-Condition)
   - Setiap perubahan status flag mencatat reviewed_by dan reviewed_on.
   - Situs yang pernah ditandai diberi penanda pada daftar tenant agar mudah dipantau.

(42) Pemantauan Pemakaian dan Biaya AI
Aktor: Super Admin
Prasyarat: Sudah ada pemakaian AI.
Deskripsi (User Story) : Sebagai Super Admin, Saya ingin memantau pemakaian token dan biaya AI per pengguna beserta tren dan peringatan pemakaian tidak wajar, Agar biaya platform tetap terkendali.
Detail Teknis & Endpoint
   - Halaman (UI): /console/ai-usage
   - Endpoint: GET /api/console/ai-usage
   - Tabel Terkait: mv_usage_daily, mv_chat_messages, mv_ai_jobs.
Acceptance Criteria (Kriteria Penerimaan)
a. Peringkasan Harian
   - Pekerja latar belakang meringkas mv_chat_messages menjadi satu baris mv_usage_daily per pengguna per hari.
   - Alasannya, tabel pesan tumbuh sangat cepat dan tidak layak diagregasi langsung saat halaman dibuka.
b. Metrik yang Ditampilkan
   - Total token masuk dan keluar, total biaya, dan jumlah pesan.
   - Rincian dapat dipecah per pengguna, per fitur, per penyedia, dan per model.
   - Ditampilkan pula tingkat perbaikan dan tingkat pengalihan ke penyedia cadangan pada fitur (4), yaitu berapa persen permintaan yang gagal validasi schema pada percobaan pertama.
   - Alasannya, biaya perbaikan dan pengalihan ditanggung platform. Kenaikan angka ini menggerus margin sebelum terlihat pada total biaya.
c. Grafik Tren
   - Ditampilkan tren biaya harian dan bulanan untuk seluruh platform.
   - Ditampilkan pula sepuluh pengguna dengan pemakaian tertinggi pada periode terpilih.
d. Peringatan Pemakaian Tidak Wajar
   - Sistem memunculkan peringatan bila pemakaian harian seorang pengguna melebihi beberapa kali lipat rata-rata pemakaiannya sendiri.
   - Peringatan juga muncul bila total biaya harian platform melampaui ambang yang ditetapkan.
e. Batas Keras yang Wajib Ada
   - Pemantauan bukan pembatasan. Wajib ada batas keras pemakaian per pengguna per hari yang berlaku bahkan ketika kredit berbayar masih tersedia.
   - Batas ini melindungi platform dari pemakaian tidak wajar maupun kesalahan program.
f. Alur Lanjutan (Post-Condition)
   - Data dapat diekspor untuk keperluan rekonsiliasi dengan tagihan penyedia model.

(43) Manajemen Template dan Bagian Halaman
Aktor: Super Admin
Prasyarat: is_super_admin bernilai true.
Deskripsi (User Story) : Sebagai Super Admin, Saya ingin menambah, menyunting, dan menonaktifkan template maupun bagian halaman langsung dari console, Agar katalog dapat berkembang tanpa perlu deploy ulang.
Detail Teknis & Endpoint
   - Halaman (UI): /console/catalog
   - Endpoint: GET, POST, PUT, DELETE /api/console/sections dan /api/console/templates
   - Tabel Terkait: mv_section_catalog, mv_templates, mv_site_types.
Acceptance Criteria (Kriteria Penerimaan)
a. Dasar yang Memungkinkan
   - Fitur ini mungkin dilakukan karena katalog disimpan sebagai data pada mv_section_catalog dan mv_templates, bukan ditanam di kode.
   - Jika katalog ditanam di kode, fitur (43) mustahil dipenuhi tanpa deploy.
b. Penyuntingan Bagian Halaman
   - Super admin dapat mengubah nama, kategori, thumbnail, urutan tampil, dan daftar variant.
   - Kolom props_schema disunting lewat editor JSON dengan validasi bentuk sebelum disimpan.
c. Penjagaan saat Menonaktifkan
   - Menonaktifkan bagian halaman tidak menghapusnya dari situs yang sudah memakainya.
   - Sistem menampilkan jumlah situs yang masih memakai bagian tersebut sebelum konfirmasi.
   - Bagian yang dinonaktifkan hanya hilang dari katalog untuk situs baru.
d. Penyuntingan Template
   - Template baru dapat dibuat dengan menyalin schema dari situs yang sudah ada, lalu membersihkan datanya.
   - Perubahan template tidak mempengaruhi situs yang sudah menerapkannya sebelumnya.
e. Validasi Rujukan
   - Sistem menolak penyimpanan mv_site_types.allowed_sections yang memuat kode bagian halaman yang tidak ada.
f. Alur Lanjutan (Post-Condition)
   - Perubahan katalog langsung terlihat oleh pengguna pada panel tambah bagian, tanpa perlu memuat ulang aplikasi.

(44) Manajemen Daftar Subdomain Terlarang
Aktor: Super Admin
Prasyarat: is_super_admin bernilai true.
Deskripsi (User Story) : Sebagai Super Admin, Saya ingin mengelola daftar kata terlarang dan nama yang dicadangkan sistem, Agar tidak ada tenant yang mengambil nama sensitif atau nama yang dibutuhkan platform.
Detail Teknis & Endpoint
   - Halaman (UI): /console/reserved-subdomains
   - Endpoint: GET, POST, DELETE /api/console/reserved-subdomains
   - Tabel Terkait: mv_reserved_subdomains, websites.
Acceptance Criteria (Kriteria Penerimaan)
a. Dua Jenis Entri
   - Nilai type bernilai reserved untuk nama sistem, contoh: www, api, admin, app, mail, cdn, static, blog, help, status.
   - Nilai type bernilai blocked untuk kata terlarang berdasarkan kebijakan konten.
b. Pengisian Awal
   - Seeder mengisi daftar nama sistem sejak awal, sehingga tidak ada tenant yang sempat mengambilnya.
   - Seeder bersifat idempotent.
c. Pencocokan
   - Pencocokan dilakukan case-insensitive terhadap seluruh nama subdomain.
   - Untuk type bernilai blocked, pencocokan juga dilakukan terhadap potongan kata di dalam nama.
d. Penanganan Nama yang Sudah Terlanjur Dipakai
   - Saat kata baru ditambahkan, sistem menampilkan daftar situs yang subdomain-nya menjadi bertentangan.
   - Situs tersebut tidak otomatis dinonaktifkan. Super admin memutuskan tindakannya secara manual.
e. Impor Massal
   - Tersedia impor daftar kata dari berkas CSV untuk pengisian awal dalam jumlah besar.
f. Alur Lanjutan (Post-Condition)
   - Perubahan daftar langsung berlaku pada pengecekan ketersediaan di fitur (28), tanpa deploy ulang.

(45) Konfigurasi Model AI dan Prompt
Aktor: Super Admin
Prasyarat: is_super_admin bernilai true.
Deskripsi (User Story) : Sebagai Super Admin, Saya ingin mengatur model, tingkat usaha, dan system prompt dari console, Agar saya dapat menyeimbangkan biaya dan kualitas hasil AI tanpa mengubah kode.
Detail Teknis & Endpoint
   - Halaman (UI): /console/ai-config
   - Endpoint: GET dan PUT /api/console/ai-config
   - Tabel Terkait: mv_ai_config.
Acceptance Criteria (Kriteria Penerimaan)
a. Konfigurasi per Fitur
   - Nilai feature_key pada rilis pertama: builder, revision, suggestion, translation, image, dan vision.
   - Setiap fitur dapat memakai provider dan model yang berbeda, agar biaya dapat dioptimalkan per kebutuhan.
   - Pemetaan awal sesuai Keputusan Arsitektur nomor 2: builder memakai DeepSeek V4-Pro; revision, suggestion, dan translation memakai DeepSeek V4-Flash; image memakai Google Imagen; vision memakai Google Gemini Flash-Lite.
   - Nilai vision dipakai oleh fitur (12) untuk mengambil palet warna dari logo yang diunggah, fitur (13) untuk membuat alt text media secara otomatis, dan fitur (41) untuk moderasi gambar. Fitur ini wajib memakai penyedia yang dapat membaca gambar, karena DeepSeek tidak dapat.
b. Parameter yang Dapat Diatur
   - Kolom provider dan model bersifat teks, sehingga penambahan penyedia baru tidak memerlukan perubahan skema.
   - Kolom effort, temperature, max_tokens, dan timeout_ms diatur per fitur.
   - Kolom fallback_provider dan fallback_model menentukan ke mana permintaan dialihkan bila keluaran tetap gagal validasi, sesuai fitur (4) huruf d. Kolom max_repair_attempts menentukan berapa kali model diberi kesempatan memperbaiki keluarannya sebelum dialihkan.
   - Kolom credit_cost menentukan tarif tetap kredit untuk fitur tersebut. Bila margin tergerus karena harga penyedia naik, super admin cukup menaikkan tarif ini tanpa mengubah kode.
   - Adapter pemanggilan penyedia cukup satu, karena DeepSeek dan Gemini sama-sama menyediakan format permintaan yang kompatibel dengan OpenAI. Yang berbeda hanya base URL, kunci, dan penanganan gambar.
c. Penyuntingan System Prompt
   - System prompt disunting lewat editor teks panjang dengan penomoran baris.
   - Tersedia daftar variabel yang boleh dipakai beserta artinya, dan sistem menolak penyimpanan bila ada variabel tidak dikenal.
d. Versi dan Pengembalian
   - Setiap penyimpanan menaikkan kolom version dan menyimpan baris baru, tidak menimpa yang lama.
   - Super admin dapat membandingkan dua versi dan kembali ke versi sebelumnya.
   - Alasannya, perubahan prompt dapat menurunkan kualitas keluaran dan harus dapat dibatalkan cepat.
e. Uji Coba sebelum Diterapkan
   - Tersedia kotak uji untuk menjalankan satu permintaan contoh memakai konfigurasi baru sebelum disimpan.
   - Biaya uji coba dicatat ke mv_usage_daily atas nama platform, bukan atas nama pengguna mana pun.
f. Alur Lanjutan (Post-Condition)
   - Konfigurasi yang aktif dibaca setiap kali fitur AI dipanggil, sehingga perubahan berlaku tanpa menyalakan ulang aplikasi.
   - Kunci API penyedia disimpan sebagai variabel lingkungan, tidak pernah disimpan di basis data maupun ditampilkan di antarmuka.


===============================================================================


PADANAN KODE MLD DAN NOMOR FITUR

Penomoran fitur mengikuti format acuan, yaitu (1) sampai (45) berurutan tanpa
lompatan. Daftar berikut menautkan nomor tersebut ke kode MLD yang dipakai pada
wishlist 19 Agustus 2026 dan pada ARSITEKTUR-TARGET-MELODY-V2.md.

   (1) MLD-005       (16) MLD-022      (31) MLD-043
   (2) MLD-006       (17) MLD-023      (32) MLD-044
   (3) MLD-008       (18) MLD-024      (33) MLD-045
   (4) MLD-009       (19) MLD-025      (34) MLD-046
   (5) MLD-010       (20) MLD-026      (35) MLD-047
   (6) MLD-011       (21) MLD-027      (36) MLD-048
   (7) MLD-012       (22) MLD-029      (37) MLD-049
   (8) MLD-013       (23) MLD-030      (38) MLD-050
   (9) MLD-015       (24) MLD-031      (39) MLD-051
   (10) MLD-016      (25) MLD-032      (40) MLD-052
   (11) MLD-017      (26) MLD-033      (41) MLD-053
   (12) MLD-018      (27) MLD-034      (42) MLD-054
   (13) MLD-019      (28) MLD-035      (43) MLD-055
   (14) MLD-020      (29) MLD-036      (44) MLD-056
   (15) MLD-021      (30) MLD-042      (45) MLD-057

Kode berikut ada pada penomoran lama tetapi tidak muncul pada wishlist, sehingga
tidak memiliki fitur pada dokumen ini: MLD-001 sampai MLD-004, MLD-007, MLD-014,
MLD-028, dan MLD-037 sampai MLD-041.

Rincian kolom setiap tabel tidak diulang pada tiap fitur. Bagian Detail Teknis
hanya menyebut nama tabel, sedangkan daftar kolom lengkapnya ada pada Ringkasan
Tabel Baru di bagian awal dokumen.

Total fitur yang tercakup dokumen ini: 45.


===============================================================================


KEPUTUSAN ARSITEKTUR

Enam hal berikut sebelumnya berstatus pertanyaan terbuka dan kini sudah
diputuskan. Seluruh acceptance criteria di dokumen ini sudah mengikuti
keputusan tersebut. Jika salah satunya berubah, fitur yang disebut wajib
ditinjau ulang.

1. Stack melody-be dan melody-fe.
   Diputuskan: melanjutkan Express dan Vue 3 seperti yang dipakai sekarang.
   - Streaming AI Builder memakai Server-Sent Events, bukan WebSocket. Arah
     datanya satu jalur dari server ke klien, sehingga tidak perlu sticky
     session pada load balancer.
   - Panel pratinjau memakai iframe ke melody-renderer dan disegarkan lewat
     postMessage, bukan merender ulang schema di dalam Vue. Merender schema di
     dua tempat berarti dua implementasi yang hasilnya selalu berbeda.
   - melody-renderer berjalan sebagai proses terpisah dari melody-be.
   Berlaku pada: fitur (4) dan fitur (5).

2. Penyedia dan model AI.
   Diputuskan: DeepSeek sebagai penyedia utama, digabung dengan Google Gemini
   untuk pekerjaan yang tidak dapat dilakukan DeepSeek. Pemetaan per feature_key
   pada mv_ai_config:
   - builder      DeepSeek V4-Pro
   - revision     DeepSeek V4-Flash
   - suggestion   DeepSeek V4-Flash
   - translation  DeepSeek V4-Flash
   - image        Google Imagen, karena DeepSeek tidak memiliki kemampuan
                  membuat gambar sama sekali
   - vision       Google Gemini Flash-Lite, karena DeepSeek tidak dapat
                  membaca gambar sama sekali
   Nilai feature_key vision adalah tambahan baru pada dokumen ini. Dipakai oleh
   fitur (12) untuk mengambil palet warna dari logo yang diunggah, fitur (13) untuk
   membuat alt text media secara otomatis, dan fitur (41) untuk moderasi gambar.
   Model kelas hemat lebih sering keliru menyusun argumen tool, sehingga
   berlaku tiga pengaman yang dijabarkan pada fitur (4): permukaan tool dibatasi
   menjadi empat tool tetap, keluaran divalidasi terhadap props_schema dengan
   perbaikan paling banyak dua kali, lalu dialihkan ke Gemini bila tetap gagal.
   Biaya perbaikan dan pengalihan ditanggung platform, bukan pengguna, karena
   pemotongan kredit memakai tarif tetap per fitur.
   Satu hal yang perlu disadari sebagai konsekuensi: konten bisnis tenant
   dikirim ke server DeepSeek di Tiongkok. Bila kelak ada tenant yang tidak
   mengizinkan hal tersebut, penggantiannya cukup lewat mv_ai_config tanpa
   mengubah kode.
   Berlaku pada: fitur (4), fitur (15), dan fitur (45).

3. Status PSG Account.
   Diputuskan: PSG Account sudah berjalan sebagai penyedia OIDC di
   account.psggroup.id dan dipakai langsung. Tidak diperlukan autentikasi lokal
   sementara. Tiga ketentuannya berbeda dari OIDC pada umumnya dan sudah
   dituangkan ke fitur (1):
   - Identitas dibaca dari access_token, bukan dari id_token.
   - Klaim aud berisi APP_CODE, bukan client_id.
   - Tidak ada klaim email_verified maupun foto profil. Akibatnya kolom
     Customers.avatar hanya dapat terisi lewat unggahan manual.
   Berlaku pada: fitur (1).

4. Strategi pembangkitan username untuk pengguna SSO.
   Diputuskan: dibangkitkan dari bagian lokal alamat email, dengan sufiks acak
   empat karakter bila sudah dipakai, di dalam transaksi dan diulang paling
   banyak lima kali bila terjadi tabrakan. Panjang maksimum 30 karakter dan
   kata pada daftar terlarang fitur (44) ditolak. Username tidak pernah
   ditampilkan pada antarmuka. Rinciannya pada fitur (1) huruf d.
   Berlaku pada: fitur (1) dan seluruh alur pendaftaran.

5. Payment gateway.
   Diputuskan: Xendit untuk rilis pertama, tetap dalam bentuk adapter agar
   penyedia lain dapat ditambahkan tanpa mengubah alur pembayaran. Dua hal khas
   Xendit sudah dituangkan ke fitur (24) dan fitur (36):
   - Webhook diverifikasi lewat header x-callback-token yang dicocokkan dengan
     token statis dari dasbor Xendit, bukan lewat signature HMAC.
   - Perpanjangan langganan memakai pekerjaan berkala yang menerbitkan invoice
     baru beserta pengingat, bukan Xendit Recurring. Alasannya, penagihan
     otomatis hanya berlaku pada kartu dan sebagian dompet elektronik,
     sedangkan mayoritas pengguna Indonesia membayar lewat virtual account dan
     QRIS yang tidak dapat ditagih otomatis.
   Berlaku pada: fitur (24) dan fitur (36).

6. Pemisahan draft dan live.
   Diputuskan: dipisahkan, memakai snapshot terbit. Kolom baru
   websites.published_version_id menunjuk satu baris mv_site_versions.
   - URL publik membaca snapshot yang ditunjuk kolom tersebut.
   - Pratinjau builder membaca kondisi draft.
   - Publikasi membuat baris versi baru lalu memindahkan penunjuk. Tetap satu
     operasi tulis dan tetap tanpa proses build.
   Empat alasannya: publikasi situs multi-halaman menjadi satu kesatuan
   sehingga pengunjung tidak pernah melihat separuh versi lama dan separuh
   versi baru; keluaran AI yang masih dikerjakan tidak bocor ke publik;
   pemulihan versi menjadi satu perubahan kolom; dan render situs publik dapat
   di-cache dengan kunci published_version_id.
   Batasannya: yang di-snapshot hanya tata letak, yaitu themes.schema dan
   custom_pages.items. Artikel blog, produk, dan pesanan adalah data, bukan
   tata letak, sehingga tetap tayang seketika tanpa perlu diterbitkan ulang.
   Berlaku pada: fitur (29), dan berdampak pada fitur (5) serta fitur (8).
