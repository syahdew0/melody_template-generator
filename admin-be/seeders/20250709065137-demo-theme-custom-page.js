'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('themes', [
      {
        website_id: 1,
        name: 'Default Theme',
        slug: 'default-theme',
        description: 'Tema PSG dengan struktur custom_page lengkap',
        is_active: true,
        schema: JSON.stringify({
          custom_page: {
            Home: {
              slider_home: {
                title: { required: true, type: 'text', content: '' },
                content: { required: true, type: 'html', content: '' },
                image: { required: true, type: 'image', content: '' },
                icon: { required: false, type: 'image', content: '' },
                link: { required: false, type: 'url', content: '' }
              },
              badge_about: {
                title: { required: true, type: 'text', content: '' },
                content: { required: true, type: 'html', content: '' },
                image: { required: false, type: 'image', content: '' },
                icon: { required: false, type: 'image', content: '' },
                link: { required: false, type: 'url', content: '' }
              },
              About_PSG: {
                title: { required: true, type: 'text', content: '' },
                content: { required: true, type: 'html', content: '' },
                image: { required: true, type: 'image', content: '' },
                icon: { required: false, type: 'image', content: '' },
                link: { required: false, type: 'url', content: '' }
              },
              about_visi: {
                title: { required: true, type: 'text', content: '' },
                content: { required: true, type: 'html', content: '' },
                image: { required: false, type: 'image', content: '' },
                icon: { required: false, type: 'image', content: '' },
                link: { required: false, type: 'url', content: '' }
              },
              client_title: {
                title: { required: true, type: 'text', content: '' },
                content: { required: true, type: 'text', content: '' },
                image: { required: false, type: 'image', content: '' },
                icon: { required: false, type: 'image', content: '' },
                link: { required: false, type: 'url', content: '' }
              },
              client_image: {
                title: { required: false, type: 'text', content: '' },
                content: { required: false, type: 'html', content: '' },
                image: { required: true, type: 'image', content: '' },
                icon: { required: false, type: 'image', content: '' },
                link: { required: false, type: 'url', content: '' }
              },
              pilar: {
                title: { required: true, type: 'text', content: '' },
                content: { required: true, type: 'text', content: '' },
                image: { required: false, type: 'image', content: '' },
                icon: { required: false, type: 'image', content: '' },
                link: { required: false, type: 'url', content: '' }
              },
              pilar_items: {
                title: { required: true, type: 'text', content: '' },
                content: { required: true, type: 'text', content: '' },
                image: { required: false, type: 'image', content: '' },
                icon: { required: false, type: 'image', content: '' },
                link: { required: false, type: 'url', content: '' }
              },
              pilar_badge: {
                title: { required: true, type: 'text', content: '' },
                content: { required: false, type: 'html', content: '' },
                image: { required: false, type: 'image', content: '' },
                icon: { required: false, type: 'image', content: '' },
                link: { required: false, type: 'url', content: '' }
              },
      
            }
          }
        }),
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('themes', { slug: 'psg-default' }, {});
  }
};
