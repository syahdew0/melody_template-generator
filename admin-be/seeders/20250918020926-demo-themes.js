'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // =====================
    // Seed websites
    // =====================
    await queryInterface.bulkInsert('websites', [
      {
        id: 1,
        name: 'Vizions Website',
        user_id: null,
        subdomain: null,
        site_title: 'Vizions 3D',
        site_description: 'Vizions 3D Website',
        admin_email: null,
        logo: null,
        seo_keywords: null,
        seo_description: null,
        rate: null,
        created_at: new Date('2025-07-19 09:21:03'),
        updated_at: new Date('2025-07-23 03:57:37'),
        title: 'vizion3D'
      }
    ], {});

    // =====================
    // Seed themes
    // =====================
    await queryInterface.bulkInsert('themes', [
      {
        id: 4,
        website_id: 1,
        name: 'vizions',
        slug: 'vizions',
        description: 'Theme untuk website Vizions',
        schema: JSON.stringify({}),
        is_active: 1,
        created_at: new Date('2025-07-19 09:21:27'),
        updated_at: new Date('2025-07-22 12:16:30')
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('themes', { id: 1 }, {});
    await queryInterface.bulkDelete('websites', { id: 1 }, {});
  }
};
