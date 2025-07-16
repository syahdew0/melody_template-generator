'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('websites', 'site_title', {
      type: Sequelize.STRING,
      after: 'subdomain'
    });

    await queryInterface.addColumn('websites', 'site_description', {
      type: Sequelize.TEXT,
      after: 'site_title'
    });

    await queryInterface.addColumn('websites', 'admin_email', {
      type: Sequelize.STRING,
      after: 'site_description'
    });

    await queryInterface.addColumn('websites', 'logo', {
      type: Sequelize.STRING,
      after: 'admin_email'
    });

    await queryInterface.addColumn('websites', 'seo_keywords', {
      type: Sequelize.TEXT,
      after: 'logo'
    });

    await queryInterface.addColumn('websites', 'seo_description', {
      type: Sequelize.TEXT,
      after: 'seo_keywords'
    });

    await queryInterface.addColumn('websites', 'rate', {
      type: Sequelize.STRING,
      after: 'seo_description'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('websites', 'site_title');
    await queryInterface.removeColumn('websites', 'site_description');
    await queryInterface.removeColumn('websites', 'admin_email');
    await queryInterface.removeColumn('websites', 'logo');
    await queryInterface.removeColumn('websites', 'seo_keywords');
    await queryInterface.removeColumn('websites', 'seo_description');
    await queryInterface.removeColumn('websites', 'rate');
  }
};
