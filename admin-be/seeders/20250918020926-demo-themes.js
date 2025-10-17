'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // =====================
    // Seed websites
    // =====================
await queryInterface.bulkInsert('websites', [
  {
    name: 'PSG Website',
    user_id: null,
    subdomain: null,
    site_title: 'PSG Website',
    site_description: 'PSG Website',
    admin_email: null,
    logo: null,
    seo_keywords: null,
    seo_description: null,
    rate: null,
    created_at: new Date(),
    updated_at: new Date(),
    title: 'PSG Website',
  }
], {});

await queryInterface.bulkInsert('themes', [
  {
    website_id: 1, 
    name: 'PSG Default Theme',
    slug: 'PSG-default-theme',
    description: 'Default theme for PSG website',
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
