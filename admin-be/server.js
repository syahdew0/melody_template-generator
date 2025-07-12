require('dotenv').config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env'
});

const config = require('./config');
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const db = require('./models');

const PORT = process.env.PORT || 3001;
const isDev = process.env.NODE_ENV !== 'production';

// Middlewares
app.use(express.json());
app.use(cors());

// API Routes
app.use('/api/layout', require('./routes/layoutRoutes'));

app.use('/api/portfolio', require('./routes/portfolioRoutes'));
app.use('/api/about-preview', require('./routes/about_previewRoutes'));
app.use('/api/admin/menus', require('./routes/menuRoutes'));
app.use('/api/why-choose-us', require('./routes/whychooseRoutes'));
app.use('/api/team', require('./routes/TeamRoutes'));
app.use('/api', require('./routes/heroAboutRoutes'));
app.use('/api', require('./routes/ctaRoutes'));
app.use('/api/portfolio-preview', require('./routes/portfolioPreviewRoutes'));
app.use('/api/hero-services', require('./routes/heroServicesRoutes'));
app.use('/api/service-list', require('./routes/servicelistRoutes'));
app.use('/api/value-section', require('./routes/valueSectionRoutes'));
app.use('/api/process-section', require('./routes/processSectionRoutes'));
app.use('/api/hero-home', require('./routes/heroHomeRoutes'));
app.use('/api/admin/faqs-section', require('./routes/FaqSectionRoutes'));
app.use('/api', require('./routes/mapsSectionRoutes'));
app.use('/api', require('./routes/contactHeroRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/protected', require('./routes/protectedRoute'));
app.use('/api/admin/users', require('./routes/userRoutes'));
app.use('/api/admin/contact-settings', require('./routes/formSettingsRoutes'));
app.use('/api', require('./routes/contactMessageRoutes'));
app.use('/api', require('./routes/newsletterRoutes'));
app.use('/api', require('./routes/contactInfoRoutes'));
app.use('/api', require('./routes/mediaRoutes'));
app.use('/api', require('./routes/footerRoutes'));
app.use('/api', require('./routes/visiMisiRoutes'));
app.use('/api/setting-logo', require('./routes/settingLogoRoutes'));
app.use('/api/custom-pages', require('./routes/customPagesRoutes')); 
app.use('/api/admin/custom-pages', require('./routes/customPagesRoutes')); 
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/testimonials', require('./routes/TestimonialRoutes'));
// app.use('/api/admin', require('./routes/websiteRoutes'));
app.use('/api/admin/themes', require('./routes/themeRoutes'))


// Static file untuk file upload
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// === FRONTEND FALLBACK UNTUK VUE (production mode only) ===
if (!isDev) {
  const vueDistPath = path.join(__dirname, 'dist');
  app.use(express.static(vueDistPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(vueDistPath, 'index.html'));
  });
}

// Sync DB dan Jalankan Server
if (isDev) {
  db.sequelize.sync({ alter: true }).then(() => {
    console.log(' Database synced with alter:true (dev mode)');
    startServer();
  }).catch((err) => {
    console.error(' Failed to sync database:', err);
  });
} else {
  startServer();
}

// Fungsi untuk menjalankan server
function startServer() {
  app.listen(PORT, () => {
    const API_URL = process.env.API_URL || `http://localhost:${PORT}`;
    console.log(`Server running on ${API_URL}`);
  });
}
