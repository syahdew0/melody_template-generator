'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // =====================
    // Seed websites
    // =====================
await queryInterface.bulkInsert('websites', [
  {
    name: 'Ecommerce Website',
    user_id: null,
    subdomain: null,
    site_title: 'Ecommerce Website',
    site_description: 'Ecommerce Website',
    admin_email: null,
    logo: null,
    seo_keywords: null,
    seo_description: null,
    rate: null,
    created_at: new Date(),
    updated_at: new Date(),
    title: 'Ecommerce Website',
  }
], {});

await queryInterface.bulkInsert('themes', [
  {
    website_id: 1, 
    name: 'Ecommerce Default Theme',
    slug: 'ecommerce-default-theme',
    description: 'Default theme for ecommerce website',
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
