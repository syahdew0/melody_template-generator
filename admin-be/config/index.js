// require('dotenv').config({
//     path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env'
//   });
  require('dotenv').config({
  path: '.env'
});
  module.exports = {
    port: process.env.PORT || 3001,
    apiUrl: process.env.API_URL || `http://localhost:${process.env.PORT || 3001}`,
    isDev: process.env.NODE_ENV !== 'production',
    jwtSecret: process.env.JWT_SECRET,
    smtpEmail: process.env.SMTP_EMAIL,
    smtpPassword: process.env.SMTP_PASSWORD,
    // dan seterusnya...
  };
  