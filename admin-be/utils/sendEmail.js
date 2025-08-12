const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'anislestari2006@gmail.com',
    pass: 'ftliaffookzjodxn'
  }
});


async function sendEmail({ to, subject, text }) {
await transporter.sendMail({
  to,
  subject,
  text
});
}

module.exports = sendEmail;
