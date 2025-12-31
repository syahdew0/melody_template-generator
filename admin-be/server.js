
// server.js
// require('dotenv').config({
//   path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env'
// });
process.env.TZ = 'Asia/Jakarta';

require('dotenv').config({
  path: '.env'
});

const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const db = require('./models');
const { requireAuth } = require('./middlewares/authMiddleware');
const customerAuthRoutes = require('./routes/customerAuthRoutes');
const changePasswordRoutes = require('./routes/changepasswordRoutes');
const adminCustomerRoutes = require('./routes/adminCustomerRoutes');
const publicRoutes = require('./routes/public');

const PORT = process.env.PORT || 3001;
const isDev = process.env.NODE_ENV !== 'production';

console.log("Server timezone:", Intl.DateTimeFormat().resolvedOptions().timeZone);

// === Middlewares ===
app.use(express.json());

// === CORS Whitelist per Environment ===
const whitelist = [];

if (process.env.NODE_ENV === 'production') {
  whitelist.push(
    'https://psggroup.id',
    'https://office.psggroup.id',
    'https://admincompro.phisoft.co.id',
    'https://apicompro.phisoft.co.id'
  );
} else if (process.env.NODE_ENV === 'staging') {
  whitelist.push(
    'https://compro.pasifiksgroup.com:8443',
  );
} else {
  // development
  whitelist.push(
    'http://localhost:5173',
    'http://localhost:8080',
    'http://localhost:8081',
    'http://localhost:8082',
    'http://localhost:8083',
    'http://localhost:8084',
    'http://localhost:1234',
  );
}

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

app.use(cors(corsOptions)); 


// === Static Uploads ===
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use('/api/admin', adminCustomerRoutes);

// customer
app.use('/customer/auth', customerAuthRoutes);
app.use('/customer/auth', changePasswordRoutes);




// app.use('/menu', require('./routes/customermenuRoutes')); // untuk frontend

// === Public Routes ===
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin/permissions', require('./routes/role/permissionRoutes'));
// MLM
app.use('/api/admin/mlm-packages', require('./routes/MLM/mlmPackageRoutes'));

app.use('/api/admin/paket-user', require('./routes/MLM/mlmpaketuserRoutes'));

// MLM Pengaduan customer
app.use('/customer', require('./routes/MLM/mlmPengaduanRoutes'));

// MLM Pengaduan cadmin
app.use('/api/admin/mlm-complaints', require('./routes/MLM/mlmPengaduanAdminRoutes'));

// MLM Registrasi
app.use('/customer/mlm-registrations', require('./routes/MLM/mlmRegisterRoutes'));



app.use('/customer/mlm-tree', require('./routes/MLM/mlmtreeRoutes'));

// route khusus admin
app.use('/api/admin/mlm-tree', require('./routes/MLM/mlmtreeAdminRoutes'));


// MLM Downline
// app.use('/customer/mlm-downlines', require('./routes/MLM/mlmDownlineRoutes'));
app.use('/apis/mlm-packages', require('./routes/MLM/mlmPackageRoutes'));
// Pengaturan MLM
app.use('/api/admin/mlm-settings', require('./routes/MLM/mlmSettingRoutes'));


app.use('/apis/public', publicRoutes);
app.use('/apis/contact', require('./routes/contactRoutes'));

app.use("/api/admin/roles", require("./routes/role/roleRoutes"));
app.use('/api/admin/modules', require('./routes/role/moduleRoutes'));

app.use('/apis/icons', require('./routes/iconRoutes'));
app.use('/api/admin/websites', require('./routes/websiteRoutes'));
app.use('/apis/custom-pages', require('./routes/customPagesRoutes'));
app.use('/api/setting-logo', require('./routes/settingLogoRoutes'));
app.use('/apis/admin/posts', require('./routes/postadminRoutes'));// admin
app.use('/apis/categories', require('./routes/categoryRoutes'));
app.use('/apis/testimonials', require('./routes/TestimonialRoutes'));
app.use('/apis/posts', require('./routes/postcustomerRoutes')); // publik
app.use('/apis', require('./routes/menuRoutes'));
app.use('/banks', require('./routes/masterbankRoutes'));
app.use('/company-banks', require('./routes/companybankRoutes'));
// app.use('/customer/company-banks', require('./routes/companybankRoutes'));
// Admin
// app.use('/company-banks', require('./routes/admin/companyBank'));

// Customer
app.use('/customer/company-banks', require('./routes/customer/companybankRoutes'));
app.use('/api/company-banks', require('./routes/companybankRoutes'));


// === Protected Routes (Require Auth) ===
app.use('/api', requireAuth);

// === Semua Routes Setelah requireAuth ===
app.use('/api/layout', require('./routes/layoutRoutes'));
// app.use('/api/portfolio', require('./routes/portfolioRoutes'));
// app.use('/api/about-preview', require('./routes/about_previewRoutes'));
app.use('/api', require('./routes/menuRoutes'));
// app.use('/api/why-choose-us', require('./routes/whychooseRoutes'));
// app.use('/api/team', require('./routes/TeamRoutes'));
// app.use('/api', require('./routes/heroAboutRoutes'));
// app.use('/api', require('./routes/ctaRoutes'));
// app.use('/api/portfolio-preview', require('./routes/portfolioPreviewRoutes'));
// app.use('/api/hero-services', require('./routes/heroServicesRoutes'));
// app.use('/api/service-list', require('./routes/servicelistRoutes'));
// app.use('/api/value-section', require('./routes/valueSectionRoutes'));
// app.use('/api/process-section', require('./routes/processSectionRoutes'));
// app.use('/api/hero-home', require('./routes/heroHomeRoutes'));
// app.use('/api/admin/faqs-section', require('./routes/FaqSectionRoutes'));
// app.use('/api', require('./routes/mapsSectionRoutes'));
// app.use('/api', require('./routes/contactHeroRoutes'));
app.use('/api/protected', require('./routes/protectedRoute'));
app.use('/api/admin/users', require('./routes/userRoutes'));
app.use('/api/admin/contact-settings', require('./routes/formSettingsRoutes'));
app.use('/api', require('./routes/contactMessageRoutes'));
app.use('/api', require('./routes/newsletterRoutes'));
// app.use('/api', require('./routes/contactInfoRoutes'));
app.use('/api', require('./routes/mediaRoutes'));
app.use('/api', require('./routes/footerRoutes'));
// app.use('/api', require('./routes/visiMisiRoutes'));
app.use('/api/custom-pages', require('./routes/customPagesRoutes'));
app.use('/api/admin/custom-pages', require('./routes/customPagesRoutes'));


app.use('/api/admin/themes', require('./routes/themeRoutes'));

app.use('/api', require('./routes/productVariantRoutes'));
app.use('/customer', require('./routes/productVariantRoutes'));
app.use('/api/admin/product-types', require('./routes/productTypeRoutes'));

// Transaksi routes (Topup, Withdraw, Adjust)
app.use('/api/transaksi', require('./routes/transaksiadminRoutes'));
app.use('/customer/transaksi', require('./routes/transaksicustomerRoutes'));
// app.use('/api/public/banks', require('./routes/masterbankRoutes'));



// Setting Transaksi (tetap pakai tabel Setting)
app.use('/api/admin/settings-transaksi', require('./routes/settingTransaksiRoutes'));
// app.use('/api/customer/settings-transaksi', require('./routes/settingTransaksiRoutes'));
app.use('/customer/settings-transaksi', require('./routes/customer/settingTransaksiRoutes'))

app.use('/customer/address', require('./routes/customer/customerAddressRoutes'));
app.use('/apis/address', require('./routes/addressRoutes'));
// app.use('/customer/rajaongkir', require('./routes/customer/rajaongkirRoutes'));
app.use('/customer/orders', require('./routes/customer/orderRoutes'));
// server.js
app.use('/api/admin/orders', require('./routes/checkoutadmin/orderRoutes'));

// Customer
app.use('/apis/comments', require('./routes/customer/commentRoutes'));

// Admin (butuh auth)
app.use('/apis/comments', require('./routes/admin/commentAdminRoutes'));

app.use('/apis/brands', require('./routes/brandRoutes'));


// server.js
app.use('/apis/contact', require('./routes/contactRoutes'));

app.use('/apis/admin', require('./routes/listing/listingRoutes'));
app.use('/apis/customer', require('./routes/listing/listingcustomerRoutes'));

// app.use('/apis/wallet', require('./routes/transaksiRoutes'));

// app.use('/api/menu-groups', require('./routes/menuGroupRoutes'));
// app.use('/api/menu-items', require('./routes/menuItemRoutes'));


// === Vue Fallback ===
/*if (!isDev) {
  const vueDistPath = path.join(__dirname, 'dist');
  app.use(express.static(vueDistPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(vueDistPath, 'index.html'));
  });
}*/

// === Sync Database & Start Server ===
//if (isDev) {
  // db.sequelize.sync({ alter: true }).then(() => {
  //   console.log('Database synced with alter:true (dev mode)');
    startServer();
  // }).catch((err) => {
  //   console.error('Failed to sync database:', err);
  // });
//} else {
//  startServer();
//}

function startServer() {
  app.listen(PORT, () => {
    const API_URL = process.env.API_URL || `http://localhost:${PORT}`;
    console.log(`Server running on ${API_URL}`);
  });
}