'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // =====================
    // Seed websites
    // =====================
    await queryInterface.bulkInsert('websites', [
      {
        id: 1,
        name: 'Phisoft Website',
        user_id: null,
        subdomain: null,
        site_title: 'Pasifik Sukses Gemilang',
        site_description: 'A Property and AI Technology Companya',
        admin_email: null,
        logo: null,
        seo_keywords: null,
        seo_description: null,
        rate: null,
        created_at: new Date('2025-07-19 09:21:03'),
        updated_at: new Date('2025-07-23 03:57:37'),
        title: 'PSG Group'
      }
    ], {});

    // =====================
    // Seed themes
    // =====================
    await queryInterface.bulkInsert('themes', [
      {
        id: 4,
        website_id: 1,
        name: 'phisoft',
        slug: 'phisoft',
        description: 'Theme untuk website Phisoft',
        schema: JSON.stringify({
          custom_page: {
            Home: {
              about_preview_badge: { content: { type: "text", required: true } },
              about_preview: { content: { type: "text", required: true } },
              our_clients: { content: { type: "text", required: true } },
              our_client_items: { content: { type: "text", required: true } },
              workflow_content: { content: { type: "text", required: true } },
              workflow_badge: { content: { type: "text", required: true } },
              workflow_items: { content: { type: "text", required: true } },
              home_static_judul: { content: { type: "text", required: true } },
              home_static_content: { content: { type: "text", required: true } },
              home_static_btn: { content: { type: "text", required: true } },
              our_services_badge: { content: { type: "text", required: true } },
              our_services: { content: { type: "text", required: true } },
              why_choose_badge: { content: { type: "text", required: true } },
              why_choose: { content: { type: "text", required: true } },
              why_choose_items: { content: { type: "text", required: true } },
              our_service_items: { content: { type: "text", required: true } },
              our_products_badge: { content: { type: "text", required: true } },
              our_products: { content: { type: "text", required: true } },
              our_product_items: { content: { type: "text", required: true } },
              hero_content: { content: { type: "html", required: true } },
              hero_image: { content: { type: "text", required: true } },
              hero_button: { content: { type: "text", required: true } }
            },
            About: {
              About_static: { content: { type: "html", required: true } },
              about_badge: { content: { type: "text", required: true } },
              about_section: { content: { type: "text", required: true } },
              visimisi_badge: { content: { type: "text", required: true } },
              visimisi_stats: { content: { type: "text", required: true } },
              visimisi_stats_bg: { content: { type: "text", required: true } },
              visi_section: { content: { type: "text", required: true } },
              misi_section: { content: { type: "text", required: true } }
            },
            footer: {
              footer_brand: { content: { type: "text", required: true } },
              footer_socials: { content: { type: "text", required: true } },
              footer_contacts: { content: { type: "html", required: true } }
            },
            Contact: {
              contact_static: { content: { type: "text", required: true } },
              contact_static_btn: { content: { type: "text", required: true } },
              contact_info_badge: { content: { type: "text", required: true } },
              contact_info_static: { content: { type: "text", required: true } },
              contact_info_items: { content: { type: "text", required: true } },
              contact_form_badge: { content: { type: "text", required: true } },
              contact_form_static: { content: { type: "text", required: true } },
              contact_form_btn: { content: { type: "text", required: true } },
              contact_maps_badge: { content: { type: "text", required: true } },
              contact_maps_static: { content: { type: "text", required: true } }
            }
          }
        }),
        is_active: 1,
        created_at: new Date('2025-07-19 09:21:27'),
        updated_at: new Date('2025-07-22 12:16:30')
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('themes', { id: 4 }, {});
    await queryInterface.bulkDelete('websites', { id: 1 }, {});
  }
};
