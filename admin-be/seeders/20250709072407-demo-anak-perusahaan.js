'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    await queryInterface.bulkInsert('custom_pages', [
      // Badge
      {
        page: 'Home',
        tag: 'anak_perusahaan_badge',
        items: JSON.stringify({ badge: 'Anak Perusahaan Kami' }),
        created_at: now,
        updated_at: now,
      },

      // Title & Content
      {
        page: 'Home',
        tag: 'anak_perusahaan_title',
        items: JSON.stringify({
          title: 'Grup Anak Perusahaan',
          content: 'Berikut adalah anak perusahaan yang tergabung dalam PSG Group.'
        }),
        created_at: now,
        updated_at: now,
      },

      // Daftar perusahaan
      {
        page: 'Home',
        tag: 'anak_perusahaan',
        items: JSON.stringify([
          {
            title: 'PT Pasifik Hoki Indonesia (PHISOFT)',
            content: 'Penyedia solusi software untuk payroll & HRIS.',
            image: '/uploads/phisoft-logo.png',
            icon: '/uploads/phisoft-icon.png',
            link: 'https://www.phisoft.co.id/'
          },
          {
            title: 'PT Sinar Matahari Semesta',
            content: 'Spesialis sistem informasi logistik dan pergudangan.',
            image: '/uploads/sms-logo.png',
            icon: '/uploads/sms-icon.png',
            link: 'https://www.sms.co.id/'
          }
        ]),
        created_at: now,
        updated_at: now,
      },

      // Produk perusahaan 1 (PHISOFT)
      {
        page: 'Home',
        tag: 'anak_perusahaan_product_1',
        items: JSON.stringify([
          {
            title: 'OnTime Payroll',
            content: 'Sistem penggajian otomatis dan aman.',
            image: '/uploads/ontime-payroll.png',
            icon: '',
            link: 'https://www.phisoft.co.id/ontime'
          },
          {
            title: 'HRIS Pro',
            content: 'Manajemen SDM berbasis cloud.',
            image: '/uploads/hris-pro.png',
            icon: '',
            link: 'https://www.phisoft.co.id/hris'
          }
        ]),
        created_at: now,
        updated_at: now,
      },

      // Produk perusahaan 2 (SMS)
      {
        page: 'Home',
        tag: 'anak_perusahaan_product_2',
        items: JSON.stringify([
          {
            title: 'LogiTrack',
            content: 'Sistem monitoring pengiriman barang realtime.',
            image: '/uploads/logitrack.png',
            icon: '',
            link: 'https://www.sms.co.id/logitrack'
          },
          {
            title: 'WarehousePro',
            content: 'Manajemen gudang dengan RFID.',
            image: '/uploads/warehousepro.png',
            icon: '',
            link: 'https://www.sms.co.id/warehousepro'
          }
        ]),
        created_at: now,
        updated_at: now,
      }

    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('custom_pages', {
      tag: [
        'anak_perusahaan_badge',
        'anak_perusahaan_title',
        'anak_perusahaan',
        'anak_perusahaan_product_1',
        'anak_perusahaan_product_2'
      ]
    }, {});
  }
};
