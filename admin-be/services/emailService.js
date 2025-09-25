// services/emailService.js
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.init();
  }

  init() {
    // Konfigurasi email transporter
    // Sesuaikan dengan provider email yang Anda gunakan
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // Template email untuk notifikasi pesan kontak baru
  async sendContactNotification(contactData) {
    if (!this.transporter || !process.env.ADMIN_EMAIL) {
      console.log('Email service not configured');
      return false;
    }

    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: process.env.ADMIN_EMAIL,
        subject: `Pesan Kontak Baru dari ${contactData.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f59e0b; border-bottom: 2px solid #f59e0b; padding-bottom: 10px;">
              Pesan Kontak Baru
            </h2>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0; color: #374151;">Detail Pengirim:</h3>
              <p><strong>Nama:</strong> ${contactData.name}</p>
              <p><strong>Email:</strong> ${contactData.email}</p>
              ${contactData.phone ? `<p><strong>Telepon:</strong> ${contactData.phone}</p>` : ''}
              ${contactData.subject ? `<p><strong>Subjek:</strong> ${contactData.subject}</p>` : ''}
            </div>
            
            <div style="background: #fff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
              <h3 style="margin: 0 0 15px 0; color: #374151;">Pesan:</h3>
              <p style="line-height: 1.6; color: #6b7280;">${contactData.message.replace(/\n/g, '<br>')}</p>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: #fef3c7; border-radius: 8px;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>Catatan:</strong> Balas pesan ini melalui admin panel atau hubungi langsung melalui email: ${contactData.email}
              </p>
            </div>
            
            <div style="margin-top: 30px; text-align: center; color: #9ca3af; font-size: 12px;">
              <p>Email ini dikirim otomatis dari sistem contact form website Anda.</p>
            </div>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Contact notification email sent:', result.messageId);
      return true;
    } catch (error) {
      console.error('Error sending contact notification email:', error);
      return false;
    }
  }

  // Template email untuk welcome newsletter
  async sendNewsletterWelcome(email) {
    if (!this.transporter) {
      console.log('Email service not configured');
      return false;
    }

    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: 'Selamat Datang di Newsletter Kami!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #f59e0b, #f97316); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Selamat Datang!</h1>
              <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Terima kasih telah berlangganan newsletter kami</p>
            </div>
            
            <div style="background: white; padding: 30px 20px; border: 1px solid #e5e7eb; border-top: none;">
              <h2 style="color: #374151; margin: 0 0 20px 0;">Apa yang Akan Anda Dapatkan:</h2>
              
              <div style="margin: 20px 0;">
                <div style="display: flex; align-items: center; margin: 15px 0;">
                  <div style="width: 8px; height: 8px; background: #f59e0b; border-radius: 50%; margin-right: 15px;"></div>
                  <p style="margin: 0; color: #6b7280;">Update terbaru produk dan layanan kami</p>
                </div>
                <div style="display: flex; align-items: center; margin: 15px 0;">
                  <div style="width: 8px; height: 8px; background: #f59e0b; border-radius: 50%; margin-right: 15px;"></div>
                  <p style="margin: 0; color: #6b7280;">Tips dan insights berguna untuk bisnis Anda</p>
                </div>
                <div style="display: flex; align-items: center; margin: 15px 0;">
                  <div style="width: 8px; height: 8px; background: #f59e0b; border-radius: 50%; margin-right: 15px;"></div>
                  <p style="margin: 0; color: #6b7280;">Penawaran khusus dan promosi menarik</p>
                </div>
              </div>
              
              <div style="margin-top: 30px; padding: 20px; background: #f9fafb; border-radius: 8px; text-align: center;">
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                  Jika Anda tidak ingin menerima email ini lagi, Anda dapat 
                  <a href="#" style="color: #f59e0b; text-decoration: none;">berhenti berlangganan</a> kapan saja.
                </p>
              </div>
            </div>
            
            <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} Website Anda. Semua hak dilindungi.
              </p>
            </div>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Newsletter welcome email sent:', result.messageId);
      return true;
    } catch (error) {
      console.error('Error sending newsletter welcome email:', error);
      return false;
    }
  }


  // Template auto-reply untuk contact form
  async sendContactAutoReply(contactData) {
    if (!this.transporter) {
      console.log('Email service not configured');
      return false;
    }

  
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: contactData.email,
        subject: 'Terima kasih atas pesan Anda',
       html: `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #e0f2ff; border-radius: 8px; overflow: hidden;">
    
    <div style="background: linear-gradient(135deg, #3b82f6, #2563eb); padding: 30px 20px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">Terima Kasih, ${contactData.name}!</h1>
    </div>
    
    <div style="background: #bfdbfe; padding: 30px 20px; border-top: 1px solid #93c5fd; color: #1e3a8a;">
      <p style="line-height: 1.6; margin: 0 0 20px 0;">
        Kami telah menerima pesan Anda dan akan merespons sesegera mungkin. 
        Biasanya kami membalas dalam waktu 1-2 hari kerja.
      </p>
      
      <div style="background: #dbecff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 15px 0;">Detail Pesan Anda:</h3>
        ${contactData.subject ? `<p><strong>Subjek:</strong> ${contactData.subject}</p>` : ''}
        <p><strong>Pesan:</strong></p>
        <p style="background: white; padding: 15px; border-radius: 4px; color: #1e3a8a; line-height: 1.6;">
          ${contactData.message.replace(/\n/g, '<br>')}
        </p>
      </div>
      
      <div style="margin-top: 30px; padding: 20px; background: #bfdbfe; border-radius: 8px; color: #1e3a8a; font-size: 14px;">
        <strong>Butuh respon lebih cepat?</strong><br>
        Anda juga bisa menghubungi kami langsung melalui telepon atau WhatsApp.
      </div>
    </div>
    
    <div style="background: #93c5fd; padding: 20px; text-align: center; color: white; font-size: 12px;">
      Email ini dikirim otomatis. Mohon jangan membalas email ini.
    </div>
    
  </div>

        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Contact auto-reply email sent:', result.messageId);
      return true;
    } catch (error) {
      console.error('Error sending contact auto-reply email:', error);
      return false;
    }
  }
}

module.exports = new EmailService();