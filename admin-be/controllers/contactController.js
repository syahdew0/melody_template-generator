// controllers/contactController.js
const emailService = require('../services/emailService');

exports.sendContactEmail = async (req, res) => {
  // Generate request ID unik untuk logging
  const requestId = Date.now(); 

  console.log(`[ContactEmail][${requestId}] Received request from ${req.body.email}`);

  try {
    const contactData = req.body;

    // Cek minimal data wajib
    if (!contactData.name || !contactData.email || !contactData.message) {
      console.warn(`[ContactEmail][${requestId}] Missing required fields`);
      return res.status(400).json({ error: 'Nama, email, dan pesan wajib diisi' });
    }

    // Kirim notifikasi ke admin
    console.log(`[ContactEmail][${requestId}] Sending notification to admin`);
    const successAdmin = await emailService.sendContactNotification(contactData);
    if (!successAdmin) {
      console.error(`[ContactEmail][${requestId}] Failed to send notification to admin`);
      throw new Error('Gagal mengirim email notifikasi ke admin');
    }

    // Kirim auto-reply ke pengirim
    console.log(`[ContactEmail][${requestId}] Sending auto-reply to sender`);
    const successReply = await emailService.sendContactAutoReply(contactData);
    if (!successReply) {
      console.warn(`[ContactEmail][${requestId}] Failed to send auto-reply to sender`);
    }

    console.log(`[ContactEmail][${requestId}] Email process completed successfully`);
    res.json({ message: 'Email berhasil dikirim' });
  } catch (err) {
    console.error(`[ContactEmail][${requestId}] Error:`, err.message);
    res.status(500).json({ error: err.message });
  }
};
