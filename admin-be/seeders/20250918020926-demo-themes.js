'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // =====================
    // Seed websites
    // =====================
await queryInterface.bulkInsert('websites', [
  {
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
    created_at: new Date(),
    updated_at: new Date(),
    title: 'vizion3D'
  }
], {});

await queryInterface.bulkInsert('themes', [
  {
    website_id: 1, 
    name: 'vizions',
    slug: 'vizions',
    description: 'Theme untuk website Vizions',
    schema: JSON.stringify({}),
    is_active: 1,
    created_at: new Date(),
    updated_at: new Date()
  }
], {});

  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('themes', { id: 1 }, {});
    await queryInterface.bulkDelete('websites', { id: 1 }, {});
  }
};
