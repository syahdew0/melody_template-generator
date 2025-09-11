const { Customer, WalletHistory, MLMPackage, MlmRegistration, MLMWallet } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// register.js
exports.register = async (req, res) => {
  const t = await Customer.sequelize.transaction();
  try {
    const {
      username, email, no_hp, bank,
      no_rekening, nama_rekening, referral, password,
      mlm_package_id
    } = req.body;

    // 1️⃣ Cek username & email unik
    const existingUser = await Customer.findOne({
      where: { [Op.or]: [{ username }, { email }] }
    });
    if (existingUser) {
      return res.status(400).json({ message: 'Username atau email sudah terdaftar.' });
    }

    // 2️⃣ Cek paket MLM valid & tidak suspend
    const pkg = await MLMPackage.findByPk(mlm_package_id);
    if (!pkg || pkg.IsSuspend) {
      return res.status(400).json({ message: 'Paket MLM tidak valid / suspended' });
    }

    // 3️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4️⃣ Ambil upline jika ada referral
    let uplineUser = null;
    let uplineId = null;
    if (referral) {
      const uplineUser = await Customer.findByPk(referral); // cari by ID
      if (uplineUser) uplineId = uplineUser.id;
    }

    // 5️⃣ Buat customer baru
    const newUser = await Customer.create({
      username,
      email,
      no_hp,
      bank,
      no_rekening,
      nama_rekening,
      referral,
      password: hashedPassword,
      mlm_package_id: pkg.MLMPackageID
    }, { transaction: t });

    // 6️⃣ Buat MLM Registration
    await MlmRegistration.create({
      customer_id: newUser.id,
      mlm_package_id: pkg.MLMPackageID,
       upline_id: uplineId,
      start_date: new Date(),
      status: 'active'
    }, { transaction: t });

    // 7️⃣ Bonus referral ke upline
    if (uplineUser && pkg.ReferralBonus > 0) {
      // Ambil semua history sukses upline
      const histories = await WalletHistory.findAll({
        where: { username: uplineUser.username, status: 'success' }
      });

      let currentBalance = 0;
      histories.forEach(h => {
        // Sesuaikan tipe transaksi: 1=topup, 2=withdraw, 3=adjust_in, 4=adjust_out
        if ([1, 3].includes(h.transaction_type_id)) currentBalance += h.amount;
        else if ([2, 4].includes(h.transaction_type_id)) currentBalance -= h.amount;
      });

      // Ambil aturan dari MLMWallet
      const walletRules = await MLMWallet.findAll();

      for (const rule of walletRules) {
        const amount = (pkg.ReferralBonus * rule.Percentage) / 100;

        await WalletHistory.create({
          username: uplineUser.username,
          transaction_type_id: 99, // bonus referral
          wallet_type_id: rule.WalletTypeID,
          balance_before: currentBalance,
          amount,
          balance_after: currentBalance + amount,
          status: 'success',
          remarks: `Bonus referral (${rule.WalletTypeID}) dari ${newUser.username}`,
          created_at: new Date()
        }, { transaction: t });

        currentBalance += amount;
      }
    }

    // 8️⃣ Commit transaction
    await t.commit();

    res.json({
      success: true,
      message: 'Registrasi berhasil',
      data: newUser
    });
  } catch (err) {
    await t.rollback();
    console.error('Register error:', err);
    res.status(500).json({
      message: 'Terjadi kesalahan saat register',
      error: err.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Cek apakah user ada
    const user = await Customer.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Email tidak ditemukan' });
    }

    // Cek password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Password salah' });
    }
    const token = jwt.sign(
    { CustomerId: user.id, email: user.email },
    process.env.JWT_CUSTOMER_SECRET || 'customer_secret_123',
    { expiresIn: '7d' }
  )

    res.json({
    message: 'Login berhasil',
     data: {
      token,
       user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    }
});
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat login' });
  }
};

exports.me = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.customer.id, {
      attributes: [
        'id', 'username', 'email', 'no_hp',
        'bank', 'no_rekening', 'nama_rekening',
        'email_verified', 'email_pending'
      ]
    });

    if (!customer) {
      return res.status(404).json({ message: 'Customer tidak ditemukan' });
    }

    // Ambil semua wallet histories untuk customer ini
    const histories = await WalletHistory.findAll({
      where: { username: customer.username, status: 'success' }
    });

    // Hitung saldo
    let balance = 0;
    histories.forEach(h => {
      if (h.transaction_type_id === 1 || h.transaction_type_id === 3) { // misal 1=topup,3=adjust_in
        balance += h.amount;
      } else if (h.transaction_type_id === 2 || h.transaction_type_id === 4) { // misal 2=withdraw,4=adjust_out
        balance -= h.amount;
      }
    });

    let statusEmail;
    if (customer.email_pending) {
      statusEmail = 'Menunggu verifikasi email baru';
    } else if (!customer.email_verified) {
      statusEmail = 'Email belum diverifikasi';
    } else {
      statusEmail = 'Email terverifikasi';
    }

    res.json({
      id: customer.id,
      username: customer.username,
      email: customer.email,
      no_hp: customer.no_hp,
      bank: customer.bank,
      no_rekening: customer.no_rekening,
      nama_rekening: customer.nama_rekening,
      balance, // pakai hasil hitung dari histories
      email_verified: customer.email_verified,
      status_email: statusEmail
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil data customer' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.customer.id)
    if (!customer) {
      return res.status(404).json({ message: 'Customer tidak ditemukan' })
    }

    const { no_hp, bank, no_rekening, nama_rekening } = req.body

    customer.no_hp = no_hp
    customer.bank = bank
    customer.no_rekening = no_rekening
    customer.nama_rekening = nama_rekening

    await customer.save()

    res.json({ message: 'Profil berhasil diperbarui', data: customer })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Gagal memperbarui profil' })
  }
};

exports.requestEmailVerificationOld = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.customer.id);
    if (!customer) return res.status(404).json({ message: 'Customer tidak ditemukan' });

    const oldEmail = customer.email;
    if (!oldEmail) return res.status(400).json({ message: 'Email lama tidak ditemukan' });

    // Generate kode random 6 digit hex uppercase
    const code = crypto.randomBytes(3).toString('hex').toUpperCase();
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 menit

    customer.email_verification_code = code;
    customer.email_verification_expiry = expiry;
    await customer.save();

    await sendEmail({
      to: oldEmail,
      subject: 'Kode Verifikasi Email Lama',
      text: `Kode verifikasi email lama Anda: ${code}. Berlaku sampai ${expiry.toLocaleTimeString()}.`
    });

    res.json({ message: 'Kode verifikasi telah dikirim ke email lama Anda.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengirim kode verifikasi email lama.' });
  }
};

exports.confirmEmailVerificationOld = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.customer.id);
    if (!customer) return res.status(404).json({ message: 'Customer tidak ditemukan' });

    const { code } = req.body;
    if (!code) return res.status(400).json({ message: 'Kode verifikasi wajib diisi.' });

    // if (customer.email_verification_code !== code) {
    if (customer.email_verification_code !== code.toUpperCase()) {
      return res.status(400).json({ message: 'Kode verifikasi salah.' });
    }

    // Cek expired
    if (!customer.email_verification_expiry || new Date() > new Date(customer.email_verification_expiry)) {
      return res.status(400).json({ message: 'Kode verifikasi telah kedaluwarsa.' });
    }

    // Tandai email lama sudah diverifikasi
    customer.email_verified = true;
    customer.email_verification_code = null;
    customer.email_verification_expiry = null; // reset expired
    await customer.save();

    res.json({ message: 'Email lama berhasil diverifikasi.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal memverifikasi email lama.' });
  }
};

exports.requestEmailVerification = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.customer.id);
    if (!customer) return res.status(404).json({ message: 'Customer tidak ditemukan' });

    const { new_email } = req.body;
    if (!new_email) return res.status(400).json({ message: 'Email baru wajib diisi' });

    if (new_email.toLowerCase() === customer.email.toLowerCase()) {
      return res.status(400).json({ message: 'Email baru tidak boleh sama dengan email lama.' });
    }
    const lastUpdated = new Date(customer.updatedAt);
    const now = new Date();
    const diffDays = (now - lastUpdated) / (1000 * 60 * 60 * 24);
    if (diffDays < 7) {
      return res.status(400).json({ message: 'Email hanya bisa diubah setiap 7 hari sekali.' });
    }
    // const now = new Date();
    // const diffMinutes = (now - lastUpdated) / (1000 * 60); // selisih dalam menit

    // if (diffMinutes < 30) {
    //   return res.status(400).json({ message: 'Email hanya bisa diubah setiap 30 menit sekali (testing).' });
    // }

    // Generate kode random 6 digit hex uppercase
    const code = crypto.randomBytes(3).toString('hex').toUpperCase();
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 15 menit

    customer.email_pending = new_email;
    customer.email_verification_code = code;
    customer.email_verified = false;
    customer.email_verification_expiry = expiry;
    await customer.save();

    await sendEmail({
      to: new_email,
      subject: 'Kode Verifikasi Email Baru',
      text: `Kode verifikasi email Anda: ${code}. Berlaku sampai ${expiry.toLocaleTimeString()}.`
    });

    res.json({ message: 'Kode verifikasi telah dikirim ke email baru Anda.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengirim kode verifikasi email.' });
  }
};
exports.confirmEmailVerification = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.customer.id);
    if (!customer) return res.status(404).json({ message: 'Customer tidak ditemukan' });

    const { code } = req.body;
    if (!code) return res.status(400).json({ message: 'Kode verifikasi wajib diisi.' });

  //   if (customer.email_verification_code !== code.toUpperCase()) {
  //   return res.status(400).json({ message: 'Kode verifikasi salah.' });
  // }

  if (customer.email_verification_code !== code.toUpperCase()) {
  return res.status(400).json({ message: 'Kode verifikasi salah.' });
  }

  // Cek expired
  if (!customer.email_verification_expiry || new Date() > new Date(customer.email_verification_expiry)) {
    return res.status(400).json({ message: 'Kode verifikasi telah kedaluwarsa.' });
  }

  // Update email utama
  customer.email = customer.email_pending;
  customer.email_pending = null;
  customer.email_verification_code = null;
  customer.email_verification_expiry = null; // reset expired
  customer.email_verified = true;
  await customer.save();

    res.json({ message: 'Email berhasil diverifikasi dan diperbarui.', email: customer.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal memverifikasi email.' });
  }
};
