// test-email.js
require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true', // false untuk port 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.ADMIN_EMAIL,
      subject: "Tes Email Nodemailer",
      text: "Ini adalah email percobaan dari Nodemailer menggunakan Gmail App Password."
    });
    console.log("Email terkirim! MessageId:", info.messageId);
  } catch (err) {
    console.error("Gagal mengirim email:", err);
  }
}

testEmail();
